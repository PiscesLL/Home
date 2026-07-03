"use client";

/**
 * Single-pass WebGL background.
 *
 *   light  → empty (placeholder, awaiting future visual)
 *   dark   → dense star field, fbm flow, Pisces constellation, cursor halo
 *
 * Mouse gravity in dark mode brightens nearby stars and tints the halo
 * with a mint accent.
 */

import { useEffect, useRef } from "react";

import { useInput } from "@/systems/input";
import { useRuntime } from "@/systems/runtime";
import { useTheme } from "@/systems/theme";
import { ticker } from "@/systems/ticker";

const VERT = /* glsl */ `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAG = /* glsl */ `
  precision highp float;

  varying vec2 v_uv;
  uniform float u_time;
  uniform vec2  u_resolution;
  uniform vec2  u_mouse;        // NDC -1..1, y up
  uniform vec2  u_velocity;     // NDC/sec
  uniform float u_deviceFactor; // gravity strength multiplier
  uniform float u_flowEnabled;  // 0/1
  uniform float u_starDensity;  // 0..1.5
  uniform float u_dark;         // 0 = light theme, 1 = dark theme

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y) * 2.0 - 1.0;
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.02;
      a *= 0.5;
    }
    return v;
  }

  float starShape(vec2 uv, vec2 pos, float size) {
    float d = length(uv - pos);
    return smoothstep(size, 0.0, d);
  }

  // Cross-shaped flare for the brightest stars — adds the familiar
  // "diffraction spike" twinkle without going expensive.
  float starFlare(vec2 uv, vec2 pos, float size) {
    vec2 d = abs(uv - pos);
    float v = smoothstep(size * 1.2, 0.0, d.y) * smoothstep(size * 0.05, 0.0, d.x);
    float h = smoothstep(size * 1.2, 0.0, d.x) * smoothstep(size * 0.05, 0.0, d.y);
    return max(v, h);
  }

  float lineSeg(vec2 p, vec2 a, vec2 b, float thick) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    float d = length(pa - ba * h);
    return smoothstep(thick, thick * 0.5, d);
  }

  void main() {
    // ============================================================
    //   LIGHT ROUTE — nothing for now (placeholder)
    // ============================================================
    if (u_dark < 0.5) {
      gl_FragColor = vec4(0.0);
      return;
    }

    vec2 uv = v_uv;
    vec2 p = (uv - 0.5) * u_resolution.xy / min(u_resolution.x, u_resolution.y);
    vec2 m = u_mouse * 0.5 * u_resolution.xy / min(u_resolution.x, u_resolution.y);
    float mouseDist = length(p - m);

    // Inverse-distance gravity, falls off past ~0.6 unit.
    float gravity = 1.0 / (1.0 + mouseDist * mouseDist * 18.0);
    gravity *= u_deviceFactor;

    // Faint pull of sample point toward cursor — distorts the star grid.
    vec2 pulled = p - (m - p) * gravity * 0.04;

    // ============================================================
    //   STAR FIELD
    //   Five sub-grids at increasing scales: each grid emits stars at
    //   a different size, giving a parallax-ish depth feel. The first
    //   grid carries a fraction of "bright" stars that get a flare.
    // ============================================================
    float stars = 0.0;
    float starsBright = 0.0;
    for (float i = 0.0; i < 5.0; i++) {
      float scale = 12.0 + i * 6.0;
      vec2 gridUv = pulled * scale;
      vec2 id = floor(gridUv);
      vec2 f = fract(gridUv) - 0.5;
      float h = hash(id + i * 123.4);

      // Threshold: one cell out of ~30 is a star (~3% of cells), more on
      // smaller-grid layers. u_starDensity scales globally.
      float thresh = mix(0.965, 0.985, i / 4.0) - u_starDensity * 0.020;
      if (h > thresh) {
        float blink = 0.55 + 0.45 * sin(u_time * (0.5 + h) + h * 6.28);
        float velAmp = 1.0 + length(u_velocity) * 0.04;
        // Bigger stars on the closer/coarser grids.
        float size = mix(0.030, 0.014, i / 4.0) * velAmp;
        vec2 starPos = vec2(h - 0.5, fract(h * 10.0) - 0.5) * 0.85;
        float core = starShape(f, starPos, size);
        stars += core * blink;

        // ~15% of stars on the closest layer get a cross flare.
        if (i < 1.5 && h > 0.992) {
          starsBright += starFlare(f, starPos, size * 4.0) * blink;
        }
      }
    }
    // Cursor proximity intensifies stars in its halo.
    stars *= mix(1.0, 1.8, smoothstep(0.6, 0.0, mouseDist));
    starsBright *= mix(1.0, 1.6, smoothstep(0.5, 0.0, mouseDist));

    // ============================================================
    //   COSMIC FLOW — slow nebula-like haze
    // ============================================================
    float flow = 0.0;
    if (u_flowEnabled > 0.5) {
      vec2 q = pulled * 1.6 + vec2(u_time * 0.02, u_time * 0.015);
      float n = fbm(q + fbm(q * 1.3));
      flow = smoothstep(0.10, 0.55, n) * 0.10;
    }

    // ============================================================
    //   PISCES (abstract V) — drawn slightly thicker, with anchor stars
    // ============================================================
    vec2 nodes[6];
    nodes[0] = vec2(-0.3, 0.2);
    nodes[1] = vec2(-0.1, -0.1);
    nodes[2] = vec2(0.2, -0.3);
    nodes[3] = vec2(0.4, 0.1);
    nodes[4] = vec2(0.3, 0.4);
    nodes[5] = vec2(-0.4, 0.4);

    vec2 cp = p + u_mouse * 0.02;
    float lineThick = 0.0042;
    float constellation = 0.0;
    constellation += lineSeg(cp, nodes[0], nodes[1], lineThick);
    constellation += lineSeg(cp, nodes[1], nodes[2], lineThick);
    constellation += lineSeg(cp, nodes[2], nodes[3], lineThick);
    constellation += lineSeg(cp, nodes[3], nodes[4], lineThick);
    for (int i = 0; i < 5; i++) {
      constellation += starShape(cp, nodes[i], 0.010);
    }

    // ============================================================
    //   COMPOSE
    // ============================================================
    vec3 baseCol = vec3(0.88, 0.92, 1.00);
    vec3 mintGlow = vec3(0.60, 1.00, 0.85);
    vec3 col = mix(baseCol, mintGlow, gravity * 0.45);

    float vignette = smoothstep(1.0, 0.25, length(uv - 0.5));
    float alpha = (
      stars * 1.0
      + starsBright * 0.6
      + constellation * 0.55
      + flow
      + gravity * 0.10 * u_deviceFactor
    ) * vignette;

    gl_FragColor = vec4(col, alpha);
  }
`;

export function ShaderBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const inputRef = useInput();
  const runtime = useRuntime();
  const { resolved } = useTheme();
  const darkRef = useRef(resolved === "dark");
  darkRef.current = resolved === "dark";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    });
    if (!gl) return;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        // eslint-disable-next-line no-console
        console.warn("shader compile error", gl.getShaderInfoLog(s));
      }
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );
    const aPos = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(program, "u_time");
    const uRes = gl.getUniformLocation(program, "u_resolution");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uVel = gl.getUniformLocation(program, "u_velocity");
    const uDevice = gl.getUniformLocation(program, "u_deviceFactor");
    const uFlow = gl.getUniformLocation(program, "u_flowEnabled");
    const uStars = gl.getUniformLocation(program, "u_starDensity");
    const uDark = gl.getUniformLocation(program, "u_dark");

    const dpr = runtime.dpr;
    const sync = () => {
      const w = Math.floor(window.innerWidth * dpr);
      const h = Math.floor(window.innerHeight * dpr);
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
    };
    sync();
    window.addEventListener("resize", sync);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

    const deviceFactor =
      runtime.tier === "desktop-full" ? 1.0 : runtime.tier === "mobile-lite" ? 0.55 : 0.3;
    const flowOn = runtime.flowLayer ? 1 : 0;

    const unsubscribe = ticker.subscribe((_dt, t) => {
      const input = inputRef.current;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.uniform2f(uMouse, input.position.x, input.position.y);
      gl.uniform2f(uVel, input.velocity.x, input.velocity.y);
      gl.uniform1f(uDevice, deviceFactor * runtime.gravityIntensity);
      gl.uniform1f(uFlow, flowOn);
      gl.uniform1f(uStars, runtime.starDensity);
      gl.uniform1f(uDark, darkRef.current ? 1 : 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }, 0);

    return () => {
      unsubscribe();
      window.removeEventListener("resize", sync);
      gl.deleteProgram(program);
      gl.deleteBuffer(buffer);
    };
  }, [
    inputRef,
    runtime.dpr,
    runtime.flowLayer,
    runtime.gravityIntensity,
    runtime.starDensity,
    runtime.tier,
  ]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 h-full w-full transition-opacity duration-300"
      style={{ opacity: 1 }}
    >
      <canvas ref={canvasRef} className="block h-full w-full" />
    </div>
  );
}
