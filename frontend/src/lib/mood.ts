export function getMoodColor(score: number): string {
  // 1-3: Low (desaturated blue-grey)
  // 4-6: Neutral (soft grey-beige)
  // 7-8: Good (soft amber)
  // 9-10: Great (brighter amber/yellow)
  if (score <= 3) return "#94A3B8"; // slate-400
  if (score <= 6) return "#D6D3D1"; // stone-300
  if (score <= 8) return "#FDE047"; // yellow-300
  return "#FACC15"; // yellow-400
}

export function getMoodLabel(score: number): string {
  if (score <= 3) return "Low";
  if (score <= 6) return "Okay";
  if (score <= 8) return "Good";
  return "Great";
}
