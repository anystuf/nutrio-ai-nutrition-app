# Data Folder Parity Report

Source: `D:\Projects\mobile-nutrition-app-main\lib\data`

Target: `D:\Projects\Nutrio - javascript\src\data`

## Status

`lib/data` has been reviewed and converted to JavaScript.

## File Mapping

- `database.dart` -> `src/data/database.js`
  - Ported local database schema equivalents for foods, workout sessions, workout sets, and user goals.
  - Ported `searchFoods`.
  - Ported Vietnamese food seeding behavior using AsyncStorage.

- `database.g.dart` -> skipped
  - Generated Drift output. The equivalent typed records are represented in `src/data/database.js`.

- `local_recipe.dart` -> `src/data/localRecipe.js`
  - Ported recipe data type.

- `local_recipes.dart` -> `src/data/localRecipes.js`
  - Ported local recipe list with corrected Vietnamese text.

- `seed_data.dart` -> `src/data/seedData.js`
  - Ported original Vietnamese seed foods and seed-to-food conversion helpers.

- `todo_database.dart` -> `src/data/todoDatabase.js`
  - Ported Hive todo database behavior to AsyncStorage.

## App Wiring

- `ToLearnScreen` now uses `src/data/todoDatabase.js`, matching the old Hive-backed task flow.
- Search uses `src/data/foods.js`, `src/data/seedData.js`, and Firestore personal foods.

## Result

Data folder parity is complete for hand-written Dart files. The generated Drift file is intentionally skipped because its schema and records are represented by JavaScript data and storage helpers.
