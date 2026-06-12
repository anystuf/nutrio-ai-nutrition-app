# Nutrio Flutter `lib` -> Expo JavaScript parity

## Top-level `lib`

- `data`: ported to `src/data/*`.
- `model`: ported to `src/model/*`.
- `providers`: ported to `src/providers/dashboardProvider.js`.
- `widgets`: ported to `src/components/FavoriteButton.jsx`.
- `firebase_options.dart`: ported to `src/config/firebaseOptions.js` and used by `src/config/firebase.js`.
- `main.dart`: represented by `App.jsx`, `src/screens/MainNavigator.jsx`, app bootstrap, Firebase Auth state, and onboarding routing.

## `lib/screen`

- `categorydata`: ported to `src/screens/categorydata/*`, including legacy meal edit/detail/report logic.
- `chatbot`: ported through `src/screens/AICoachScreen.jsx` and `src/screens/chatbot/aiCoachScripts.js`.
- `constants`: ported through `src/theme/colors.js`, `src/screens/constants/*`, and `src/screens/MainNavigator.jsx`.
- `fav`: ported to `src/screens/fav/*` and `src/components/FavoriteButton.jsx`.
- `home`: ported to `src/screens/HomeScreen.jsx` plus optional banner modules in `src/screens/home/*`.
- `Introscreen`: ported to `src/screens/IntroScreen.jsx` with original three intro slides.
- `logins`: ported through `App.jsx`, `LoginScreen`, `SignupScreen`, `ForgotPasswordScreen`, and auth-state routing.
- `profile`: ported through `ProfileScreen`, `EditProfileScreen`, `ProfileToolScreen`, and `BodyInfoScreen`.
- `screens`: ported through main app screens, plus `RecipeDetailScreen`, `BodyInfoScreen`, `ScanScreen`, `MainNavigator`, and intro/welcome flow.
- `search`: ported through `SearchScreen`, `QuickLogScreen`, `CreateFoodScreen`, `FoodDetailScreen`, and `ScanScreen`.
- `services`: ported to `src/services/nutritionAnalysis.js` and `src/model/apiService.js`.
- `tolearn`: ported through `ToLearnScreen`, `src/data/todoDatabase.js`, and nutrition helpers in `src/services/nutrition.js`.
- `workout`: ported through `WorkoutScreen` and `src/screens/workout/workoutLogic.js`.

## Notes

- Generated Flutter files such as Drift `.g.dart` are not copied line-for-line; their behavior is represented by JavaScript data helpers.
- Flutter-only camera/MLKit painter APIs are represented by JavaScript logic and an Expo-compatible workout counter flow. The rep-counting state machine and kcal formula are ported.
- Coupon/banner assets are ported as optional components but not rendered on Home because the user explicitly requested that banner be removed.
- The source tree now also includes compatibility wrappers using Flutter-like file names, for example `src/screens/categorydata/category.jsx`, `src/screens/logins/login.jsx`, `src/screens/search/search.jsx`, and `src/screens/workout/workoutLogic.js`. These wrappers make the mapping auditable without duplicating business logic.
