import { GEMINI_API_KEY, GEMINI_MODEL } from "@/config/gemini";
























export async function generateGeminiText(prompt) {
  const text = await callGemini([{ text: prompt }]);
  return text.trim();
}

export async function estimateFoodFromImage(base64, mimeType = "image/jpeg") {
  const prompt = [
  "You are Nutrio's nutrition vision assistant.",
  "Identify the main food in this image and estimate nutrition for one visible serving.",
  "Return only valid compact JSON with this exact shape:",
  '{"label":"food name","kcal":0,"carbs":0,"protein":0,"fat":0}',
  "Use grams for carbs, protein, and fat. If no food is visible, use label NO_FOOD and all numeric values 0."].
  join(" ");

  const text = await callGemini([
  { text: prompt },
  { inlineData: { mimeType, data: base64 } }]
  );

  const parsed = parseJsonObject(text);
  return {
    label: String(parsed.label || "Unknown food"),
    kcal: Number(parsed.kcal || 0),
    carbs: Number(parsed.carbs || 0),
    protein: Number(parsed.protein || 0),
    fat: Number(parsed.fat || 0)
  };
}

export async function identifyFoodsFromImage(base64, mimeType = "image/jpeg") {
  const prompt = [
  "Identify food items in this image.",
  "Return only a comma-separated list of food names.",
  "Be specific with quantities if possible, for example: 1 bowl of pho, 2 slices of bread.",
  "If no food is detected, return NO_FOOD."].
  join(" ");

  const text = await callGemini([
  { text: prompt },
  { inlineData: { mimeType, data: base64 } }]
  );

  if (text.toUpperCase().includes("NO_FOOD")) return [];
  return text.
  replace(/^```[\s\S]*?\n/i, "").
  replace(/```$/i, "").
  split(",").
  map((item) => item.trim().replace(/^[-*\d.\s]+/, "")).
  filter(Boolean);
}

async function callGemini(parts) {
  if (!GEMINI_API_KEY) {
    throw new Error("Missing EXPO_PUBLIC_GEMINI_API_KEY in .env.local");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${encodeURIComponent(GEMINI_API_KEY)}`;
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      contents: [{ role: "user", parts }],
      generationConfig: {
        temperature: 0.2
      }
    })
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.error?.message || `Gemini request failed with ${response.status}`);
  }

  const text = data.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
  if (!text) throw new Error("Gemini returned an empty response.");
  return text;
}

function parseJsonObject(text) {
  const cleaned = text.
  replace(/^```json\s*/i, "").
  replace(/^```\s*/i, "").
  replace(/```$/i, "").
  trim();
  const match = cleaned.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("Gemini did not return JSON.");
  return JSON.parse(match[0]);
}
