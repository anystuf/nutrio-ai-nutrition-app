import { collection, deleteDoc, doc, increment, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/config/firebase";


const mealFieldByType = {
  Breakfast: "breakfast_kcal",
  Lunch: "lunch_kcal",
  Dinner: "dinner_kcal",
  Snacks: "snacks_kcal"
};

export async function addFoodToDiary(userId, food, mealType) {
  const userRef = doc(db, "users", userId);
  const historyRef = doc(collection(userRef, "meal_history"));
  const todayId = new Date().toISOString().slice(0, 10);
  const mealField = mealFieldByType[mealType];
  const kcal = Number(food.kcal || 0);
  const carbs = Number(food.carbs || 0);
  const protein = Number(food.protein || 0);
  const fat = Number(food.fat || 0);
  const serving = "serving" in food ? String(food.serving || "") : "";
  const portion = parsePortion(serving);
  const safePortion = portion > 0 ? portion : 1;

  await setDoc(historyRef, {
    label: food.label,
    kcal,
    carbs,
    protein,
    fat,
    image: food.image || "",
    serving,
    portion: safePortion,
    baseKcal: kcal / safePortion,
    baseCarbs: carbs / safePortion,
    baseProtein: protein / safePortion,
    baseFat: fat / safePortion,
    source: "source" in food ? food.source || "" : "",
    mealType,
    timestamp: serverTimestamp(),
    date: todayId
  });

  await setDoc(userRef, {
    consumedCalories: increment(kcal),
    carbs: increment(carbs),
    protein: increment(protein),
    fat: increment(fat),
    [mealField]: increment(kcal),
    updatedAt: serverTimestamp()
  }, { merge: true });

  await setDoc(doc(collection(userRef, "daily_logs"), todayId), {
    date: todayId,
    total_calories: increment(kcal),
    caloriesIn: increment(kcal),
    consumedCalories: increment(kcal),
    caloriesOut: increment(0),
    burnedCalories: increment(0),
    carbs: increment(carbs),
    protein: increment(protein),
    fat: increment(fat),
    [mealField]: increment(kcal),
    updatedAt: serverTimestamp()
  }, { merge: true });
}

















export async function updateFoodLogItem(userId, itemId, previous, next, mealType) {
  const userRef = doc(db, "users", userId);
  const historyRef = doc(collection(userRef, "meal_history"), itemId);
  const todayId = new Date().toISOString().slice(0, 10);
  const mealField = mealFieldByType[mealType];
  const delta = macroDelta(previous, next);

  await setDoc(historyRef, {
    label: next.label,
    kcal: Number(next.kcal || 0),
    carbs: Number(next.carbs || 0),
    protein: Number(next.protein || 0),
    fat: Number(next.fat || 0),
    image: next.image || "",
    serving: next.serving || "",
    portion: Number(next.portion || 1),
    baseKcal: Number(next.baseKcal ?? next.kcal ?? 0),
    baseCarbs: Number(next.baseCarbs ?? next.carbs ?? 0),
    baseProtein: Number(next.baseProtein ?? next.protein ?? 0),
    baseFat: Number(next.baseFat ?? next.fat ?? 0),
    source: next.source || "",
    mealType,
    date: todayId,
    updatedAt: serverTimestamp()
  }, { merge: true });

  await applyMealDelta(userRef, todayId, mealField, delta);
}

function parsePortion(serving) {
  const match = serving.match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 1;
  const value = Number(match[1].replace(",", "."));
  return Number.isFinite(value) && value > 0 ? value : 1;
}

export async function deleteFoodLogItem(userId, itemId, previous, mealType) {
  const userRef = doc(db, "users", userId);
  const historyRef = doc(collection(userRef, "meal_history"), itemId);
  const todayId = new Date().toISOString().slice(0, 10);
  const mealField = mealFieldByType[mealType];
  const delta = macroDelta(previous, { label: previous.label, kcal: 0, carbs: 0, protein: 0, fat: 0 });

  await deleteDoc(historyRef);
  await applyMealDelta(userRef, todayId, mealField, delta);
}

function macroDelta(previous, next) {
  return {
    kcal: Number(next.kcal || 0) - Number(previous.kcal || 0),
    carbs: Number(next.carbs || 0) - Number(previous.carbs || 0),
    protein: Number(next.protein || 0) - Number(previous.protein || 0),
    fat: Number(next.fat || 0) - Number(previous.fat || 0)
  };
}

async function applyMealDelta(
userRef,
todayId,
mealField,
delta)
{
  await setDoc(userRef, {
    consumedCalories: increment(delta.kcal),
    carbs: increment(delta.carbs),
    protein: increment(delta.protein),
    fat: increment(delta.fat),
    [mealField]: increment(delta.kcal),
    updatedAt: serverTimestamp()
  }, { merge: true });

  await setDoc(doc(collection(userRef, "daily_logs"), todayId), {
    date: todayId,
    total_calories: increment(delta.kcal),
    caloriesIn: increment(delta.kcal),
    consumedCalories: increment(delta.kcal),
    carbs: increment(delta.carbs),
    protein: increment(delta.protein),
    fat: increment(delta.fat),
    [mealField]: increment(delta.kcal),
    updatedAt: serverTimestamp()
  }, { merge: true });
}
