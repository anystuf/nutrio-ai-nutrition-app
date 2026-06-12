# Nutrio AI Nutrition App

Expo + React Native JavaScript nutrition app.

Nutrio helps users track food, calories, macros, workouts, and nutrition progress with Firebase data, barcode lookup, AI food scanning, and a Gemini-powered coach.

## Run locally

```powershell
cd "D:\Projects\Nutrio - javascript"
$env:__UNSAFE_EXPO_HOME_DIRECTORY="D:\Projects\Nutrio - javascript\.expo-home"
$env:NPM_CONFIG_CACHE="D:\Projects\Nutrio - javascript\.npm-cache"
npm.cmd install
npm.cmd run web:8081
```

Open:

```text
http://127.0.0.1:8083
```

## Key Features

- Firebase email/password auth, Google Sign-In flow, and profile onboarding
- Home dashboard with calories, macros, meals, quick actions, and daily logs
- Food search, quick logging, custom food creation, and meal portion editing
- Barcode lookup and AI food scanner flow
- Gemini Nutrio Coach using `gemini-2.5-flash-lite`
- Recipes, favorites, and food detail screens
- Insights with BMI, BMR, TDEE, charts, and macro goals
- Workout screen with web MoveNet squat pose detection and native dev-build guidance
- Profile, Nutrio Pro, payment, notifications, FAQ, contact, and personal data pages
- Sidebar/navigation drawer and mobile-first app flow

## Tech Stack

- Expo
- React Native
- Firebase Authentication
- Cloud Firestore
- Gemini API
- TensorFlow MoveNet for web pose detection

## Environment

Copy `.env.example` to `.env.local` and fill local secrets there.

```text
EXPO_PUBLIC_GEMINI_MODEL=gemini-2.5-flash-lite
EXPO_PUBLIC_GEMINI_API_KEY=your-gemini-api-key
```

Keep `.env.local` private. It is ignored by git.

## Migration Notes

The original Flutter/Dart app was used only as the source visual and feature reference during migration. This repository contains the JavaScript Expo app plus parity notes in:

- `DATA_PARITY_REPORT.md`
- `LIB_PARITY_REPORT.md`
- `PARITY_CHECKLIST.md`
