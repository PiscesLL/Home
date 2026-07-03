/**
 * 站点内容 —— 页面上所有可见文字 / 标签 / 链接的唯一数据源。
 *
 * 修改这个文件即可更新文案、关键词、技术栈、社交链接、导航卡。
 * 组件全部从这里读取，禁止在 JSX 里硬编码字符串。
 *
 * 想新增字段？先在文件顶部的 type 里加上，再到下面填值 ——
 * TypeScript 会自动指出所有需要处理这个字段的地方。
 */

// ---------------------------------------------------------------------------
//  类型定义
// ---------------------------------------------------------------------------

/** 关键词标签的配色 */
export type KeywordTone =
  | "primary"  // 薄荷绿强调（用于最想突出的几个）
  | "accent"   // 薄荷绿弱化（轻轻提示）
  | "neutral"; // 中性灰，最低调

/** 单个关键词标签 */
export type Keyword = {
  /** 显示文字，例如 "PHP" */
  label: string;
  /** 配色档位，见 KeywordTone */
  tone: KeywordTone;
};

/** 技术栈中的一个分类 */
export type TechCategory = {
  /** 类目名（小标题），例如 "Frontend" */
  category: string;
  /** 该类目下的内容，自由文案，例如 "React, Next.js, Swift" */
  items: string;
};

/** 社交链接 / 联系方式 */
export type SocialLink = {
  /** 显示文字，例如 "GitHub" */
  label: string;
  /** 跳转地址。留空字符串会自动用 "#" 占位 */
  url: string;
};

/** 中国大陆 ICP / 公安备案信息。两个字段都为空字符串时整块隐藏 */
export type Beian = {
  /** 工信部 ICP 备案号，例如 "粤ICP备12345678号-1"。留空不显示 */
  icp: string;
  /** 公安联网备案号，例如 "粤公网安备 44030502000001号"。留空不显示 */
  mps: string;
};

/** 导航卡片的图标种类（在 Navigation.tsx 里有对应 SVG） */
export type NavIcon = "terminal" | "doc" | "box";

/** 右栏一张导航卡 */
export type NavCardItem = {
  /** 中文 / 主标题，例如 "作品" */
  title: string;
  /** 英文 / 副标题，例如 "Selected Projects & Experiments" */
  subtitle: string;
  /** 跳转地址。留空会用 "#" 占位 */
  url: string;
  /** 卡片左侧图标 */
  icon: NavIcon;
};

/** 整个站点内容的顶层结构 */
export type SiteContent = {
  /** 浏览器标签 / meta / 页脚版权这类元信息 */
  site: {
    /** 浏览器标签页标题 + og:title */
    title: string;
    /** 左栏底部版权行 */
    copyright: string;
  };

  /** 左栏顶部的身份信息 */
  identity: {
    /** 大字标题（站点主名） */
    name: string;
    /** 中文 slogan，同时作为 meta description（搜索引擎和分享卡片会用到） */
    taglineZh: string;
    /** 个人简介，一句话即可 */
    bio: string;
    /** 城市 / 地点。留空会隐藏整行 */
    location: string;
    /** 薄荷绿点旁的状态文案，例如 "Available for collaboration"。留空会隐藏整行 */
    availability: string;
  };

  /** 关键词标签数组（"常折腾 KEYWORDS"）。空数组会隐藏整个区块 */
  keywords: Keyword[];

  /** 技术栈数组（"技术栈 TECH STACK"）。空数组会隐藏整个区块 */
  techStack: TechCategory[];

  /** 社交链接数组（"到处逛逛 CONNECT"）。空数组会隐藏整个区块 */
  social: SocialLink[];

  /** 中国大陆 ICP / 公安备案信息。所有字段为空则整块隐藏 */
  beian: Beian;

  /** 右栏导航卡数组。三张是默认值，多/少都行 */
  navigation: NavCardItem[];
};

// ---------------------------------------------------------------------------
//  实际内容 —— 改这里就改了页面
// ---------------------------------------------------------------------------

export const site: SiteContent = {
  // ---- 站点元信息 ----
  site: {
    title: "Minty Pisces",
    copyright: "© 2026 Minty Pisces.",
  },

  // ---- 身份信息（左栏顶部） ----
  identity: {
    name: "Minty Pisces",
    taglineZh: "苦钱啦～",
    bio: "程序员。喜欢做点乱七八糟的。",
    location: "中国，上海",
    availability: "Available for collaboration",
  },

  // ---- 关键词（左栏 "常折腾 KEYWORDS"） ----
  // tone 控制配色：primary 最显眼，accent 次之，neutral 最低调
  keywords: [
    { label: "ONE PIECE",   tone: "primary" },
    { label: "AI",          tone: "neutral" },
    { label: "Next.js",     tone: "neutral" },
    { label: "Claude",      tone: "neutral" },
  ],

  // ---- 技术栈（左栏 "技术栈 TECH STACK"） ----
  // 想加 DevOps / Infra 这类直接在数组里加新行即可
  techStack: [
    { category: "Frontend", items: "React, Next.js, Swift" },
    { category: "Backend",  items: "Java, C, PHP, Node.js" },
  ],

  // ---- 社交 / 联系方式（左栏 "到处逛逛 CONNECT"） ----
  // 之间的 "/" 分隔符是自动的，不用手动写
  social: [
    { label: "GitHub",   url: "#" },
    { label: "Email",    url: "#" }, // 可以填 "mailto:you@example.com"
    { label: "RSS",      url: "#" },
    { label: "Bilibili", url: "#" },
  ],

  // ---- 备案信息（左栏 copyright 下方） ----
  // 两个字段都为空时不显示这一行
  beian: {
    icp: "沪ICP备2025155727号-3",   // 工信部 ICP 备案号，改成你自己的
    mps: "沪ICP备2025155727号",   // 公安联网备案号，改成你自己的
  },

  // ---- 主导航（右栏的三张大卡片） ----
  // icon 必须是 NavIcon 之一，想加新图标先扩展 NavIcon 类型再到 Navigation.tsx 加 svg
  navigation: [
    { title: "作品", subtitle: "Selected Projects & Experiments", url: "#", icon: "terminal" },
    { title: "笔记", subtitle: "Thoughts, Tutorials & Logs",      url: "#", icon: "doc"      },
    { title: "资源", subtitle: "Curated Tools & Assets",          url: "#", icon: "box"      },
  ],
};
