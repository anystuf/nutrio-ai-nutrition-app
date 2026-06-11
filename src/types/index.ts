export type RootScreen =
  | "intro"
  | "login"
  | "signup"
  | "forgotPassword"
  | "onboarding"
  | "main";

export type MainTab = "home" | "insights" | "scan" | "workout" | "profile";

export type AppRoute =
  | { name: "main" }
  | { name: "search"; mealType?: MealType }
  | { name: "meal"; mealType: MealType }
  | { name: "recipes" }
  | { name: "aiCoach" }
  | { name: "favorites" }
  | { name: "profileTool"; title: string }
  | { name: "quickLog"; mealType: MealType }
  | { name: "createFood" }
  | { name: "editProfile" }
  | { name: "toLearn" }
  | { name: "category" }
  | { name: "detailedMeals" }
  | { name: "editMeals" }
  | { name: "bodyInfo" }
  | { name: "scanFood"; mealType?: MealType }
  | { name: "recipeDetail"; recipe: Recipe }
  | { name: "foodDetail"; food: FoodItem; mealType: MealType };

export type MealType = "Breakfast" | "Lunch" | "Dinner" | "Snacks";

export type UserProfile = {
  uid: string;
  email: string | null;
  name?: string;
  firstName?: string;
  lastName?: string;
  gender?: string;
  birthDate?: string;
  height?: number;
  currentWeight?: number;
  targetWeight?: number;
  goals?: string[];
  mainGoal?: string;
  activityLevel?: string;
  dietType?: string;
  breakfastTime?: string;
  dinnerTime?: string;
  onboardingCompleted?: boolean;
  targetCalories?: number;
  consumedCalories?: number;
  burnedCalories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  breakfast_kcal?: number;
  lunch_kcal?: number;
  dinner_kcal?: number;
  snacks_kcal?: number;
  imageurl?: string;
  breakfast_1?: string;
  breakfast_2?: string;
  breakfastcontroller1?: string | number;
  breakfastcontroller2?: string | number;
  breakfasttotal?: number;
  lunch_1?: string;
  lunch_2?: string;
  lunchcontroller1?: string | number;
  lunchcontroller2?: string | number;
  lunchtotal?: number;
  dinner_1?: string;
  dinner_2?: string;
  dinnerController1?: string | number;
  dinnerController2?: string | number;
  dinnertotal?: number;
};

export type Recipe = {
  label: string;
  image: string;
  calories: number;
  totalTime: number;
  source: string;
  ingredientLines: string[];
  yield: number;
};

export type FoodLogItem = {
  label: string;
  kcal: number;
  mealType: MealType;
  image?: string;
  carbs?: number;
  protein?: number;
  fat?: number;
};

export type FoodItem = {
  label: string;
  kcal: number;
  carbs: number;
  protein: number;
  fat: number;
  serving: string;
  image?: string;
  tags: string[];
  source?: string;
};

export type DailyLog = {
  date: string;
  total_calories?: number;
  caloriesIn?: number;
  consumedCalories?: number;
  caloriesOut?: number;
  burnedCalories?: number;
  walkingCalories?: number;
  activityCalories?: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  breakfast_kcal?: number;
  lunch_kcal?: number;
  dinner_kcal?: number;
  snacks_kcal?: number;
};
