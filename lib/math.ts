export const clamp = (v: number, min: number, max: number) =>
  v < min ? min : v > max ? max : v;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

export const lerp2 = (
  a: { x: number; y: number },
  b: { x: number; y: number },
  t: number,
) => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) });

export const length2 = (x: number, y: number) => Math.sqrt(x * x + y * y);

export const smoothstep = (edge0: number, edge1: number, x: number) => {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
};

export const TAU = Math.PI * 2;

// Fast pseudo-random based on seed (deterministic per seed)
export const hash11 = (n: number) => {
  const s = Math.sin(n) * 43758.5453123;
  return s - Math.floor(s);
};
