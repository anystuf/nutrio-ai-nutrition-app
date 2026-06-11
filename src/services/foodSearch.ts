import { vietnameseFoods } from "@/data/foods";
import { FoodItem } from "@/types";

const appId = "4b9d837f";
const appKey = "eea19fc7c7dd3dd75f8ec213dacb1d50";

type EdamamRecipe = {
  label?: string;
  image?: string;
  calories?: number;
  yield?: number;
  source?: string;
  totalNutrients?: Record<string, { quantity?: number }>;
};

type EdamamResponse = {
  hits?: Array<{ recipe?: EdamamRecipe }>;
};

export function normalizeFoodSearch(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

export function searchLocalFoods(query: string, personalFoods: FoodItem[] = []) {
  const allFoods = [...personalFoods, ...vietnameseFoods];
  const normalized = normalizeFoodSearch(query);
  if (!normalized) return allFoods;
  return allFoods.filter((food) =>
    normalizeFoodSearch(`${food.label} ${food.serving} ${food.tags.join(" ")}`).includes(normalized)
  );
}

export async function searchEdamamFoods(query: string): Promise<FoodItem[]> {
  const clean = query.trim();
  if (!clean) return [];

  const url = new URL("https://api.edamam.com/api/recipes/v2");
  url.searchParams.set("type", "public");
  url.searchParams.set("q", clean);
  url.searchParams.set("app_id", appId);
  url.searchParams.set("app_key", appKey);
  url.searchParams.set("imageSize", "SMALL");

  const response = await fetch(url.toString(), {
    headers: {
      accept: "application/json",
      "Edamam-Account-User": "nutrio-app-user"
    }
  });

  const data = await response.json() as EdamamResponse & { message?: string };
  if (!response.ok) {
    throw new Error(data.message || `Edamam search failed with ${response.status}`);
  }

  return (data.hits ?? [])
    .map((hit): FoodItem | null => {
      const recipe = hit.recipe;
      if (!recipe?.label) return null;
      const servings = Number(recipe.yield || 1) || 1;
      const nutrients = recipe.totalNutrients ?? {};
      return {
        label: recipe.label,
        kcal: Math.round(Number(recipe.calories || 0) / servings),
        carbs: Math.round(Number(nutrients.CHOCDF?.quantity || 0) / servings),
        protein: Math.round(Number(nutrients.PROCNT?.quantity || 0) / servings),
        fat: Math.round(Number(nutrients.FAT?.quantity || 0) / servings),
        serving: "1 serving",
        image: recipe.image || "",
        tags: ["api", "edamam", recipe.source || "", clean].filter(Boolean),
        source: recipe.source || "Edamam"
      };
    })
    .filter((item): item is FoodItem => Boolean(item));
}
