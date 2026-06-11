# Nutrio - JavaScript

Expo + TypeScript migration of the Nutrio Flutter app.

## Run

```powershell
cd "D:\Projects\Nutrio - javascript"
$env:__UNSAFE_EXPO_HOME_DIRECTORY="D:\Projects\Nutrio - javascript\.expo-home"
$env:NPM_CONFIG_CACHE="D:\Projects\Nutrio - javascript\.npm-cache"
npm.cmd install
npm.cmd run web:8081
```

Open:

```text
http://127.0.0.1:8081
```

## Included Features

- Firebase auth and profile onboarding
- Home dashboard with calorie, macro, meals, banner, quick actions
- Meal detail and daily meal history
- Food search and quick logging
- Barcode scanner and AI food scanner
- Gemini Nutrio Coach using `gemini-2.5-flash-lite`
- Recipes and favorites
- Insights with BMI, BMR, TDEE and macro goals
- Workout menu
- Profile, Nutrio Pro, payments, notifications, contact, FAQ placeholders

## Environment

The real Gemini key is stored in `.env.local`. Keep that file private.

Use `.env.example` as the template when moving the app to another machine.
