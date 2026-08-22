// Open-source Iconify API client for 200,000+ React, Lucide, Tabler, FontAwesome, and Material icons

export interface IconInfo {
  id: string; // e.g. "lucide:heart", "ri:heart-fill", "tabler:star"
  prefix: string;
  name: string;
  title: string;
  svg?: string;
}

// In-memory cache for fast instant lookups
const svgCache = new Map<string, string>();
const searchCache = new Map<string, IconInfo[]>();
let allIconsList: IconInfo[] | null = null;

// Popular curated Lucide & React icons for instant 0ms first render
export const POPULAR_ICONS: IconInfo[] = [
  { id: "lucide:check", prefix: "lucide", name: "check", title: "Check" },
  {
    id: "lucide:check-circle",
    prefix: "lucide",
    name: "check-circle",
    title: "Check Circle",
  },
  { id: "lucide:x", prefix: "lucide", name: "x", title: "Close" },
  { id: "lucide:heart", prefix: "lucide", name: "heart", title: "Heart" },
  { id: "lucide:star", prefix: "lucide", name: "star", title: "Star" },
  {
    id: "lucide:sparkles",
    prefix: "lucide",
    name: "sparkles",
    title: "Sparkles",
  },
  { id: "lucide:flame", prefix: "lucide", name: "flame", title: "Flame" },
  { id: "lucide:zap", prefix: "lucide", name: "zap", title: "Zap" },
  { id: "lucide:rocket", prefix: "lucide", name: "rocket", title: "Rocket" },
  { id: "lucide:user", prefix: "lucide", name: "user", title: "User" },
  { id: "lucide:users", prefix: "lucide", name: "users", title: "Users" },
  { id: "lucide:mail", prefix: "lucide", name: "mail", title: "Mail" },
  {
    id: "lucide:message-square",
    prefix: "lucide",
    name: "message-square",
    title: "Message",
  },
  { id: "lucide:phone", prefix: "lucide", name: "phone", title: "Phone" },
  { id: "lucide:send", prefix: "lucide", name: "send", title: "Send" },
  { id: "lucide:share-2", prefix: "lucide", name: "share-2", title: "Share" },
  {
    id: "lucide:thumbs-up",
    prefix: "lucide",
    name: "thumbs-up",
    title: "Thumbs Up",
  },
  {
    id: "lucide:bookmark",
    prefix: "lucide",
    name: "bookmark",
    title: "Bookmark",
  },
  { id: "lucide:bell", prefix: "lucide", name: "bell", title: "Bell" },
  { id: "lucide:flag", prefix: "lucide", name: "flag", title: "Flag" },
  { id: "lucide:search", prefix: "lucide", name: "search", title: "Search" },
  {
    id: "lucide:settings",
    prefix: "lucide",
    name: "settings",
    title: "Settings",
  },
  { id: "lucide:sliders", prefix: "lucide", name: "sliders", title: "Sliders" },
  { id: "lucide:filter", prefix: "lucide", name: "filter", title: "Filter" },
  { id: "lucide:edit", prefix: "lucide", name: "edit", title: "Edit" },
  { id: "lucide:copy", prefix: "lucide", name: "copy", title: "Copy" },
  { id: "lucide:trash-2", prefix: "lucide", name: "trash-2", title: "Delete" },
  {
    id: "lucide:download",
    prefix: "lucide",
    name: "download",
    title: "Download",
  },
  { id: "lucide:upload", prefix: "lucide", name: "upload", title: "Upload" },
  {
    id: "lucide:file-text",
    prefix: "lucide",
    name: "file-text",
    title: "Document",
  },
  { id: "lucide:folder", prefix: "lucide", name: "folder", title: "Folder" },
  { id: "lucide:image", prefix: "lucide", name: "image", title: "Image" },
  { id: "lucide:video", prefix: "lucide", name: "video", title: "Video" },
  { id: "lucide:camera", prefix: "lucide", name: "camera", title: "Camera" },
  { id: "lucide:music", prefix: "lucide", name: "music", title: "Music" },
  { id: "lucide:eye", prefix: "lucide", name: "eye", title: "View" },
  { id: "lucide:lock", prefix: "lucide", name: "lock", title: "Lock" },
  { id: "lucide:key", prefix: "lucide", name: "key", title: "Key" },
  { id: "lucide:shield", prefix: "lucide", name: "shield", title: "Shield" },
  { id: "lucide:laptop", prefix: "lucide", name: "laptop", title: "Laptop" },
  {
    id: "lucide:smartphone",
    prefix: "lucide",
    name: "smartphone",
    title: "Phone",
  },
  { id: "lucide:code", prefix: "lucide", name: "code", title: "Code" },
  {
    id: "lucide:terminal",
    prefix: "lucide",
    name: "terminal",
    title: "Terminal",
  },
  {
    id: "lucide:database",
    prefix: "lucide",
    name: "database",
    title: "Database",
  },
  { id: "lucide:server", prefix: "lucide", name: "server", title: "Server" },
  { id: "lucide:globe", prefix: "lucide", name: "globe", title: "Globe" },
  { id: "lucide:wifi", prefix: "lucide", name: "wifi", title: "WiFi" },
  {
    id: "lucide:shopping-cart",
    prefix: "lucide",
    name: "shopping-cart",
    title: "Shopping Cart",
  },
  {
    id: "lucide:credit-card",
    prefix: "lucide",
    name: "credit-card",
    title: "Credit Card",
  },
  {
    id: "lucide:dollar-sign",
    prefix: "lucide",
    name: "dollar-sign",
    title: "Dollar",
  },
  {
    id: "lucide:trending-up",
    prefix: "lucide",
    name: "trending-up",
    title: "Trending Up",
  },
  { id: "lucide:trophy", prefix: "lucide", name: "trophy", title: "Trophy" },
  { id: "lucide:gift", prefix: "lucide", name: "gift", title: "Gift" },
  { id: "lucide:sun", prefix: "lucide", name: "sun", title: "Sun" },
  { id: "lucide:moon", prefix: "lucide", name: "moon", title: "Moon" },
  { id: "lucide:cloud", prefix: "lucide", name: "cloud", title: "Cloud" },
  {
    id: "lucide:arrow-right",
    prefix: "lucide",
    name: "arrow-right",
    title: "Arrow Right",
  },
  {
    id: "lucide:arrow-left",
    prefix: "lucide",
    name: "arrow-left",
    title: "Arrow Left",
  },
  {
    id: "lucide:arrow-up",
    prefix: "lucide",
    name: "arrow-up",
    title: "Arrow Up",
  },
  {
    id: "lucide:arrow-down",
    prefix: "lucide",
    name: "arrow-down",
    title: "Arrow Down",
  },
];

/** Fetch SVG text for an icon from Iconify */
export async function fetchIconSvg(iconId: string): Promise<string> {
  if (svgCache.has(iconId)) {
    return svgCache.get(iconId)!;
  }

  const [prefix, name] = iconId.includes(":")
    ? iconId.split(":")
    : ["lucide", iconId];

  try {
    const res = await fetch(`https://api.iconify.design/${prefix}/${name}.svg`);
    if (!res.ok) throw new Error(`Failed to load icon ${iconId}`);
    const svg = await res.text();
    svgCache.set(iconId, svg);
    return svg;
  } catch (err) {
    console.error("Error fetching icon SVG:", err);
    return `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2"/></svg>`;
  }
}

/** Fetch full master icon list (Lucide 1700+ icons) for unified scrolling */
export async function getAllMasterIcons(): Promise<IconInfo[]> {
  if (allIconsList) return allIconsList;

  try {
    const res = await fetch(
      "https://api.iconify.design/collection?prefix=lucide",
    );
    if (!res.ok) throw new Error("Failed to load lucide collection");
    const data = await res.json();

    let rawList: string[] = [];
    if (data.uncategorized && Array.isArray(data.uncategorized)) {
      rawList = data.uncategorized;
    } else if (data.categories && typeof data.categories === "object") {
      rawList = Object.values(data.categories).flat() as string[];
    }

    const uniqueNames = Array.from(new Set(rawList));
    const icons: IconInfo[] = uniqueNames.map((name) => {
      const title = name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        id: `lucide:${name}`,
        prefix: "lucide",
        name,
        title,
      };
    });

    allIconsList = icons;
    return icons;
  } catch (err) {
    console.warn(
      "Could not load full lucide collection, using popular icons:",
      err,
    );
    allIconsList = POPULAR_ICONS;
    return POPULAR_ICONS;
  }
}

/** Search over 200,000+ icons from open-source Iconify API */
export async function searchIcons(
  query: string,
  limit = 150,
): Promise<IconInfo[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return allIconsList || POPULAR_ICONS;
  }

  if (searchCache.has(trimmed)) {
    return searchCache.get(trimmed)!;
  }

  try {
    const res = await fetch(
      `https://api.iconify.design/search?query=${encodeURIComponent(
        trimmed,
      )}&limit=${limit}&prefixes=lucide,tabler,ri,fa6-solid,mdi,radix-icons,heroicons,si`,
    );

    if (!res.ok) throw new Error("Search failed");
    const data = await res.json();

    const icons: IconInfo[] = (data.icons || []).map((fullId: string) => {
      const [prefix, name] = fullId.includes(":")
        ? fullId.split(":")
        : ["lucide", fullId];
      const title = name
        .split("-")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

      return {
        id: fullId,
        prefix,
        name,
        title,
      };
    });

    searchCache.set(trimmed, icons);
    return icons;
  } catch (err) {
    console.error("Error searching icons:", err);
    return (allIconsList || POPULAR_ICONS).filter((i) =>
      i.name.toLowerCase().includes(trimmed),
    );
  }
}
