export const colors = {
  bg: "#000000",
  surface: "#121212",
  surfaceHigh: "#1F1F22",
  border: "#2A2A2E",
  text: "#FFFFFF",
  muted: "#8A8B91",
  pink: "#FE2C55",
  cyan: "#25F4EE",
  danger: "#FF6B6B",
};

// deterministic dark tint per id, used when a post has no image
const TINTS = ["#1B1F3B", "#2B1B3B", "#13303A", "#3A1B24", "#1F3A2B", "#3A311B"];
export const tintFor = (id = "") =>
  TINTS[[...String(id)].reduce((n, c) => n + c.charCodeAt(0), 0) % TINTS.length];

export const timeAgo = (iso) => {
  if (!iso) return "";
  const s = Math.max(1, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  return `${Math.floor(s / 86400)}d`;
};
