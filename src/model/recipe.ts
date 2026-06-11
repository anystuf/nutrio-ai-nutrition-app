import { Recipe } from "@/types";

export function recipeFromJson(json: Record<string, unknown>): Recipe {
  return {
    label: String(json.label ?? ""),
    image: String(json.image ?? ""),
    calories: Number(json.calories ?? 0),
    totalTime: Number(json.totalTime ?? 0),
    source: String(json.source ?? ""),
    ingredientLines: Array.isArray(json.ingredientLines) ? json.ingredientLines.map(String) : [],
    yield: Number(json.yield ?? 1)
  };
}

export function caloriesPerServing(recipe: Pick<Recipe, "calories" | "yield">) {
  const servings = recipe.yield > 0 ? recipe.yield : 1;
  return recipe.calories / servings;
}
