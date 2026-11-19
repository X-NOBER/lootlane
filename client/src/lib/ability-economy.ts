export const STARTING_CREDITS = 500;
export const BOX_COST = 100;
export const BOX_NAME = "Elemental Box";

export const DANGER_LEVELS = [
  "Low",
  "Moderate",
  "Elevated",
  "High",
  "Severe",
  "Extreme",
  "Catastrophic"
] as const;

export type DangerRating = (typeof DANGER_LEVELS)[number];
export type ConditionGrade = "Factory New" | "Minimal Wear" | "Field-Tested" | "Well-Worn" | "Battle-Scarred";

export type AbilityDefinition = {
  name: string;
  element: string;
  baseDanger: DangerRating;
  rarity: "Common" | "Rare" | "Epic" | "Legendary" | "Mythic";
  baseStars: number;
  baseValue: number;
  symbol: string;
  tone: string;
};

export type RolledAbility = AbilityDefinition & {
  condition: ConditionGrade;
  conditionStarAdjustment: number;
  dangerStarAdjustment: number;
  effectiveDanger: DangerRating;
  finalStars: number;
  conditionValuePercent: number;
  starValueMultiplier: number;
  marketValue: number;
};

export const ABILITIES: AbilityDefinition[] = [
  { name: "Cinderwake", element: "Fire", baseDanger: "Severe", rarity: "Legendary", baseStars: 4, baseValue: 180, symbol: "✹", tone: "peach" },
  { name: "Tideglass Mantle", element: "Water", baseDanger: "Elevated", rarity: "Rare", baseStars: 2, baseValue: 75, symbol: "≈", tone: "blue" },
  { name: "Worldroot Bastion", element: "Earth", baseDanger: "High", rarity: "Epic", baseStars: 3, baseValue: 120, symbol: "⬟", tone: "mint" },
  { name: "Zephyr Step", element: "Air", baseDanger: "Low", rarity: "Common", baseStars: 1, baseValue: 55, symbol: "✧", tone: "lilac" },
  { name: "Atomforge Script", element: "Matter", baseDanger: "Extreme", rarity: "Mythic", baseStars: 5, baseValue: 320, symbol: "◇", tone: "yellow" },
  { name: "Eventide Collapse", element: "Dark Matter", baseDanger: "Catastrophic", rarity: "Mythic", baseStars: 5, baseValue: 400, symbol: "◉", tone: "rose" },
  { name: "Storm Choir", element: "Lightning", baseDanger: "Severe", rarity: "Legendary", baseStars: 4, baseValue: 210, symbol: "ϟ", tone: "blue" },
  { name: "Glacier Bloom", element: "Ice", baseDanger: "Moderate", rarity: "Epic", baseStars: 3, baseValue: 160, symbol: "❄", tone: "lilac" },
  { name: "Verdant Pulse", element: "Nature", baseDanger: "Moderate", rarity: "Rare", baseStars: 2, baseValue: 95, symbol: "❋", tone: "mint" },
  { name: "Astral Thread", element: "Aether", baseDanger: "Extreme", rarity: "Mythic", baseStars: 5, baseValue: 280, symbol: "✶", tone: "peach" }
];

const CONDITION_RULES = [
  { grade: "Factory New", starAdjustment: 1.5, dangerReduction: 0, minValuePercent: 15, maxValuePercent: 30 },
  { grade: "Minimal Wear", starAdjustment: 1, dangerReduction: 1, minValuePercent: 5, maxValuePercent: 15 },
  { grade: "Field-Tested", starAdjustment: 0, dangerReduction: 2, minValuePercent: -5, maxValuePercent: 5 },
  { grade: "Well-Worn", starAdjustment: -0.5, dangerReduction: 3, minValuePercent: -15, maxValuePercent: -5 },
  { grade: "Battle-Scarred", starAdjustment: -1, dangerReduction: 4, minValuePercent: -35, maxValuePercent: -15 }
] as const;

export function rollAbility(
  ability: AbilityDefinition,
  random: () => number = Math.random
): RolledAbility {
  const conditionRule = CONDITION_RULES[Math.floor(random() * CONDITION_RULES.length)];
  const baseDangerIndex = DANGER_LEVELS.indexOf(ability.baseDanger);
  const effectiveDangerIndex = Math.max(0, baseDangerIndex - conditionRule.dangerReduction);
  const effectiveDanger = DANGER_LEVELS[effectiveDangerIndex];
  const dangerStarAdjustment = (effectiveDangerIndex - 2) * 0.25;
  const finalStars = Math.max(
    0.5,
    Math.min(5, Math.round((ability.baseStars + conditionRule.starAdjustment + dangerStarAdjustment) * 2) / 2)
  );
  const conditionValuePercent =
    conditionRule.minValuePercent +
    Math.floor(random() * (conditionRule.maxValuePercent - conditionRule.minValuePercent + 1));
  const starValueMultiplier = Math.round((0.65 + finalStars * 0.1) * 100) / 100;
  const marketValue = Math.max(
    1,
    Math.round(ability.baseValue * (1 + conditionValuePercent / 100) * starValueMultiplier)
  );

  return {
    ...ability,
    condition: conditionRule.grade,
    conditionStarAdjustment: conditionRule.starAdjustment,
    dangerStarAdjustment,
    effectiveDanger,
    finalStars,
    conditionValuePercent,
    starValueMultiplier,
    marketValue
  };
}

export function formatCredits(value: number): string {
  return `${Math.round(value).toLocaleString("en-US")} credits`;
}

export function formatSigned(value: number, decimals = 1): string {
  const rounded = Number(value.toFixed(decimals));
  return `${rounded > 0 ? "+" : ""}${rounded.toFixed(decimals)}`;
}

export function formatStars(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}
