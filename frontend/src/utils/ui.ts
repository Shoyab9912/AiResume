export const matchColor = (s: number) =>
  s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-red-400";

export const matchBg = (s: number) =>
  s >= 80 ? "bg-emerald-500/10 border-emerald-500/25"
  : s >= 60 ? "bg-amber-500/10 border-amber-500/25"
  : "bg-red-500/10 border-red-500/25";

export const scoreColor = (s: number) =>
  s >= 80 ? "text-emerald-400" : s >= 60 ? "text-amber-400" : "text-red-400";

export const scoreBar = (s: number) =>
  s >= 80 ? "from-emerald-500 to-teal-400"
  : s >= 60 ? "from-amber-500 to-orange-400"
  : "from-red-500 to-rose-400";

export const prioBg = {
  high: "bg-red-500/10 border-red-500/20",
  medium: "bg-amber-500/10 border-amber-500/20",
  low: "bg-emerald-500/10 border-emerald-500/20",
};
export const prioColor = {
  high: "text-red-400",
  medium: "text-amber-400",
  low: "text-emerald-400",
};
export const prioEmoji = { high: "🔴", medium: "🟡", low: "🟢" };