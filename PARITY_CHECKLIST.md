# Nutrio Flutter to JavaScript Parity Checklist

Target: make `D:\Projects\Nutrio - javascript` match the Flutter Nutrio app feature-for-feature.

## Ported

- App boot, Firebase auth, login, signup
- 11-step onboarding
- Main bottom navigation
- Home calorie dashboard, macro summary, meal cards, promo banner
- Meal detail and daily meal history
- Food search with local Vietnamese foods
- Food detail with serving scaling
- Quick Log
- Create Food saved to Firestore personal foods
- Barcode scanner
- AI food scanner with Gemini `gemini-2.5-flash-lite`
- Nutrio Coach with Gemini chat persistence
- Recipes and favorites
- Insights BMI, BMR, TDEE, macro goals
- Profile summary, edit profile, profile utility pages
- Cooking task / To Learn list
- Workout menu shell

## Still Needs Deeper Parity

- Exact Flutter visual matching for every screen
- Full Search API parity with Edamam recipe/nutrition services
- Personal foods rendered inside Search results
- Full AI Coach menu/cards/voucher/redeem/register UI
- AI Coach image ingredient flow
- Firestore edit/delete meal screens
- Category/statistics legacy screens
- Profile payment, upgrade, notification settings as complete workflows
- Real Firebase Storage avatar upload
- Workout pose detection and rep counter
- Splash/intro animation parity
- Sidebar/drawer parity
- Mobile native camera QA on device
