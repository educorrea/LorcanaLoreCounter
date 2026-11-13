/** Disney Lorcana ink colors */
export const LORCANA_INKS = [
  { id: "amber", label: "Amber", hex: "#F5C542" },
  { id: "amethyst", label: "Amethyst", hex: "#9B59B6" },
  { id: "emerald", label: "Emerald", hex: "#2ECC71" },
  { id: "ruby", label: "Ruby", hex: "#E74C3C" },
  { id: "sapphire", label: "Sapphire", hex: "#3498DB" },
  { id: "steel", label: "Steel", hex: "#95A5A6" },
];

export const INK_BY_ID = Object.fromEntries(LORCANA_INKS.map((ink) => [ink.id, ink]));

export function formatRecord(record) {
  const wins = record?.wins ?? 0;
  const losses = record?.losses ?? 0;
  const draws = record?.draws ?? 0;
  return `${wins}-${losses}-${draws}`;
}

export function normalizeColors(colors) {
  const list = Array.isArray(colors) ? colors.filter((id) => INK_BY_ID[id]) : [];
  if (list.length >= 2) return [list[0], list[1]];
  if (list.length === 1) return [list[0], list[0] === "amber" ? "amethyst" : "amber"];
  return ["amber", "amethyst"];
}
