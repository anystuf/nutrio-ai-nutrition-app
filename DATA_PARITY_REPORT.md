# Data Folder Parity Report

Source: `D:\Projects\mobile-nutrition-app-main\lib\data`

Target: `D:\Projects\Nutrio - javascript\src\data`

## Status

`lib/data` has been reviewed and converted to TypeScript.

## File Mapping

- `database.dart` -> `src/data/database.ts`
  - Ported local database schema equivalents for foods, workout sessions, workout sets, and user goals.
  - Ported `searchFoods`.
  - Ported Vietnamese food seeding behavior using AsyncStorage.

- `database.g.dart` -> skipped
  - Generated Drift output. The equivalent typed records are represented in `src/data/database.ts`.

- `local_recipe.dart` -> `src/data/localRecipe.ts`
  - Ported recipe data type.

- `local_recipes.dart` -> `src/data/localRecipes.ts`
  - Ported local recipe list with corrected Vietnamese text.

- `seed_data.dart` -> `src/data/seedData.ts`
  - Ported original Vietnamese seed foods and seed-to-food conversion helpers.

- `todo_database.dart` -> `src/data/todoDatabase.ts`
  - Ported Hive todo database behavior to AsyncStorage.

## App Wiring

- `ToLearnScreen` now uses `src/data/todoDatabase.ts`, matching the old Hive-backed task flow.
- Search uses `src/data/foods.ts`, `src/data/seedData.ts`, and Firestore personal foods.

## Result

Data folder parity is complete for hand-written Dart files. The generated Drift file is intentionally skipped because its schema and records are represented by TypeScript types and storage helpers.
