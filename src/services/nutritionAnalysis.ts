export type NutritionAnalysis = {
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
};

const appId = "4b9d837f";
const appKey = "eea19fc7c7dd3dd75f8ec213dacb1d50";

export async function analyzeIngredients(ingredients: string[]): Promise<NutritionAnalysis> {
  const url = `https://api.edamam.com/api/nutrition-details?app_id=${encodeURIComponent(appId)}&app_key=${encodeURIComponent(appKey)}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        title: "User Scanned Meal",
        ingr: ingredients
      })
    });

    if (!response.ok) {
      console.warn("Edamam nutrition analysis failed:", response.status, await response.text());
      return zeroNutrition();
    }

    const data = await response.json() as {
      totalNutrients?: Record<string, { quantity?: number }>;
    };
    const nutrients = data.totalNutrients ?? {};
    return {
      kcal: Number(nutrients.ENERC_KCAL?.quantity ?? 0),
      carbs: Number(nutrients.CHOCDF?.quantity ?? 0),
      protein: Number(nutrients.PROCNT?.quantity ?? 0),
      fat: Number(nutrients.FAT?.quantity ?? 0)
    };
  } catch (error) {
    console.warn("Edamam nutrition analysis exception:", error);
    return zeroNutrition();
  }
}

function zeroNutrition(): NutritionAnalysis {
  return { kcal: 0, carbs: 0, protein: 0, fat: 0 };
}
