import { UserProfile } from "@/types";

export type LegacyMealSlot = {
  name: string;
  amount: number;
};

export type LegacyMealPlan = {
  breakfast: LegacyMealSlot[];
  lunch: LegacyMealSlot[];
  dinner: LegacyMealSlot[];
};

export type LegacyMealTotals = {
  breakfast: number;
  lunch: number;
  dinner: number;
  total: number;
};

export const breakfastItems = ["Pancake", "Egg Curry", "Banana Chips", "Rice Eggs", "Nothing to show"];
export const lunchItems = ["Pizza", "Steak", "Pasta", "Burger", "Nothing to show"];
export const dinnerItems = ["Chips Burger", "Minced Meat", "Cheese pie Meat", "Grilled Meat", "Nothing to show"];

function numberFrom(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function stringFrom(value: unknown) {
  return String(value ?? "Nothing to show");
}

export function parseLegacyMealPlan(data: Record<string, unknown> | UserProfile | null): LegacyMealPlan {
  const record = data ?? {};
  return {
    breakfast: [
      { name: stringFrom(record.breakfast_1), amount: numberFrom(record.breakfastcontroller1) },
      { name: stringFrom(record.breakfast_2), amount: numberFrom(record.breakfastcontroller2) }
    ],
    lunch: [
      { name: stringFrom(record.lunch_1), amount: numberFrom(record.lunchcontroller1) },
      { name: stringFrom(record.lunch_2), amount: numberFrom(record.lunchcontroller2) }
    ],
    dinner: [
      { name: stringFrom(record.dinner_1), amount: numberFrom(record.dinnerController1) },
      { name: stringFrom(record.dinner_2), amount: numberFrom(record.dinnerController2) }
    ]
  };
}

export function calculateLegacyTotals(plan: LegacyMealPlan, data?: Record<string, unknown> | UserProfile | null): LegacyMealTotals {
  const record = data ?? {};
  const breakfast = numberFrom(record.breakfasttotal) || plan.breakfast.reduce((sum, item) => sum + item.amount, 0);
  const lunch = numberFrom(record.lunchtotal) || plan.lunch.reduce((sum, item) => sum + item.amount, 0);
  const dinner = numberFrom(record.dinnertotal) || plan.dinner.reduce((sum, item) => sum + item.amount, 0);
  return { breakfast, lunch, dinner, total: breakfast + lunch + dinner };
}

export function calculateLegacyNutrition(totals: LegacyMealTotals) {
  const carbsTotal = totals.total / 7 * 16.7;
  const fatsTotal = totals.total / 7 * 29.3;
  const proteinTotal = totals.total / 7 * 14.2;
  const allTotal = fatsTotal + carbsTotal + proteinTotal;
  const lunchTotal = totals.lunch / 7 * 29.3 + totals.lunch / 7 * 16.7 * 2;
  const dinnerTotal = totals.dinner / 12 * 29.3 + totals.dinner / 7 * 16.7 * 2;
  const breakfastTotal = totals.breakfast / 7 * 29.3 + totals.breakfast / 7 * 16.7 * 2;
  return { carbsTotal, fatsTotal, proteinTotal, allTotal, lunchTotal, dinnerTotal, breakfastTotal };
}

export function greetingForHour(hour: number) {
  if (hour >= 12 && hour < 19) return "GoodAfternoon,";
  if (hour > 18 && hour < 25) return "GoodEvening,";
  return "GoodMorning,";
}

export function activeMealLabel(hour: number) {
  if (hour > 18 && hour < 25) return "Supper time";
  if (hour > 12 && hour < 19) return "Lunch time";
  return "Breakfast time";
}

export function selectedMealCalories(hour: number, nutrition: ReturnType<typeof calculateLegacyNutrition>) {
  if (hour > 18 && hour < 25) return nutrition.dinnerTotal;
  if (hour > 12 && hour < 19) return nutrition.lunchTotal;
  return nutrition.breakfastTotal;
}

export function buildLegacyMealUpdate(plan: LegacyMealPlan) {
  const breakfastTotal = plan.breakfast.reduce((sum, item) => sum + item.amount, 0);
  const lunchTotal = plan.lunch.reduce((sum, item) => sum + item.amount, 0);
  const dinnerTotal = plan.dinner.reduce((sum, item) => sum + item.amount, 0);

  return {
    lunch_1: plan.lunch[0]?.name ?? "Nothing to show",
    lunch_2: plan.lunch[1]?.name ?? "Nothing to show",
    breakfast_1: plan.breakfast[0]?.name ?? "Nothing to show",
    breakfast_2: plan.breakfast[1]?.name ?? "Nothing to show",
    dinner_1: plan.dinner[0]?.name ?? "Nothing to show",
    dinner_2: plan.dinner[1]?.name ?? "Nothing to show",
    lunchcontroller1: String(plan.lunch[0]?.amount ?? 0),
    lunchcontroller2: String(plan.lunch[1]?.amount ?? 0),
    breakfastcontroller1: String(plan.breakfast[0]?.amount ?? 0),
    breakfastcontroller2: String(plan.breakfast[1]?.amount ?? 0),
    dinnerController1: String(plan.dinner[0]?.amount ?? 0),
    dinnerController2: String(plan.dinner[1]?.amount ?? 0),
    breakfasttotal: breakfastTotal,
    lunchtotal: lunchTotal,
    dinnertotal: dinnerTotal
  };
}
