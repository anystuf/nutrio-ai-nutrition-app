# Nutrio Flutter `lib` -> Expo TypeScript parity

## Top-level `lib`

- `data`: ported to `src/data/*`.
- `model`: ported to `src/model/*`.
- `providers`: ported to `src/providers/dashboardProvider.ts`.
- `widgets`: ported to `src/components/FavoriteButton.tsx`.
- `firebase_options.dart`: ported to `src/config/firebaseOptions.ts` and used by `src/config/firebase.ts`.
- `main.dart`: represented by `App.tsx`, `src/screens/MainNavigator.tsx`, app bootstrap, Firebase Auth state, and onboarding routing.

## `lib/screen`

- `categorydata`: ported to `src/screens/categorydata/*`, including legacy meal edit/detail/report logic.
- `chatbot`: ported through `src/screens/AICoachScreen.tsx` and `src/screens/chatbot/aiCoachScripts.ts`.
- `constants`: ported through `src/theme/colors.ts`, `src/screens/constants/*`, and `src/screens/MainNavigator.tsx`.
- `fav`: ported to `src/screens/fav/*` and `src/components/FavoriteButton.tsx`.
- `home`: ported to `src/screens/HomeScreen.tsx` plus optional banner modules in `src/screens/home/*`.
- `Introscreen`: ported to `src/screens/IntroScreen.tsx` with original three intro slides.
- `logins`: ported through `App.tsx`, `LoginScreen`, `SignupScreen`, `ForgotPasswordScreen`, and auth-state routing.
- `profile`: ported through `ProfileScreen`, `EditProfileScreen`, `ProfileToolScreen`, and `BodyInfoScreen`.
- `screens`: ported through main app screens, plus `RecipeDetailScreen`, `BodyInfoScreen`, `ScanScreen`, `MainNavigator`, and intro/welcome flow.
- `search`: ported through `SearchScreen`, `QuickLogScreen`, `CreateFoodScreen`, `FoodDetailScreen`, and `ScanScreen`.
- `services`: ported to `src/services/nutritionAnalysis.ts` and `src/model/apiService.ts`.
- `tolearn`: ported through `ToLearnScreen`, `src/data/todoDatabase.ts`, and nutrition helpers in `src/services/nutrition.ts`.
- `workout`: ported through `WorkoutScreen` and `src/screens/workout/workoutLogic.ts`.

## Notes

- Generated Flutter files such as Drift `.g.dart` are not copied line-for-line; their behavior is represented by TypeScript data helpers.
- Flutter-only camera/MLKit painter APIs are represented by TypeScript logic and an Expo-compatible workout counter flow. The rep-counting state machine and kcal formula are ported.
- Coupon/banner assets are ported as optional components but not rendered on Home because the user explicitly requested that banner be removed.
- The source tree now also includes compatibility wrappers using Flutter-like file names, for example `src/screens/categorydata/category.tsx`, `src/screens/logins/login.tsx`, `src/screens/search/search.tsx`, and `src/screens/workout/workoutLogic.ts`. These wrappers make the mapping auditable without duplicating business logic.
