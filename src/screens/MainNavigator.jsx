import { Ionicons } from "@expo/vector-icons";

import { Pressable, StyleSheet, View } from "react-native";
import { useState } from "react";
import { AppDrawer } from "@/components/AppDrawer";
import { mainTabs } from "@/navigation/mainTabs";
import { colors } from "@/theme/colors";

import { HomeScreen } from "@/screens/HomeScreen";
import { InsightsScreen } from "@/screens/InsightsScreen";
import { ScanScreen } from "@/screens/ScanScreen";
import { WorkoutScreen } from "@/screens/WorkoutScreen";
import { ProfileScreen } from "@/screens/ProfileScreen";
import { SearchScreen } from "@/screens/SearchScreen";
import { MealDetailScreen } from "@/screens/MealDetailScreen";
import { AICoachScreen } from "@/screens/AICoachScreen";
import { RecipesScreen } from "@/screens/RecipesScreen";
import { FavoriteScreen } from "@/screens/FavoriteScreen";
import { ProfileToolScreen } from "@/screens/ProfileToolScreen";
import { QuickLogScreen } from "@/screens/QuickLogScreen";
import { CreateFoodScreen } from "@/screens/CreateFoodScreen";
import { FoodDetailScreen } from "@/screens/FoodDetailScreen";
import { ToLearnScreen } from "@/screens/ToLearnScreen";
import { EditProfileScreen } from "@/screens/EditProfileScreen";
import { CategoryScreen } from "@/screens/reports/CategoryScreen";
import { DetailedMealConsumedScreen } from "@/screens/reports/DetailedMealConsumedScreen";
import { EditMealsScreen } from "@/screens/reports/EditMealsScreen";
import { BodyInfoScreen } from "@/screens/BodyInfoScreen";
import { RecipeDetailScreen } from "@/screens/RecipeDetailScreen";





export function MainNavigator({ user }) {
  const [tab, setTab] = useState("home");
  const [route, setRoute] = useState({ name: "main" });
  const [drawerOpen, setDrawerOpen] = useState(false);

  function navigate(nextRoute) {
    setRoute(nextRoute);
  }

  function switchTab(nextTab) {
    setRoute({ name: "main" });
    setTab(nextTab);
  }

  if (route.name === "search") return <SearchScreen user={user} mealType={route.mealType} onNavigate={navigate} />;
  if (route.name === "meal") return <MealDetailScreen user={user} mealType={route.mealType} onNavigate={navigate} />;
  if (route.name === "aiCoach") return <AICoachScreen user={user} onNavigate={navigate} />;
  if (route.name === "recipes") return <RecipesScreen onNavigate={navigate} />;
  if (route.name === "favorites") return <FavoriteScreen user={user} onNavigate={navigate} />;
  if (route.name === "profileTool") return <ProfileToolScreen user={user} title={route.title} onNavigate={navigate} />;
  if (route.name === "quickLog") return <QuickLogScreen user={user} mealType={route.mealType} onNavigate={navigate} />;
  if (route.name === "createFood") return <CreateFoodScreen user={user} onNavigate={navigate} />;
  if (route.name === "foodDetail") return <FoodDetailScreen user={user} food={route.food} mealType={route.mealType} onNavigate={navigate} />;
  if (route.name === "toLearn") return <ToLearnScreen onNavigate={navigate} />;
  if (route.name === "editProfile") return <EditProfileScreen user={user} onNavigate={navigate} />;
  if (route.name === "category") return <CategoryScreen user={user} onNavigate={navigate} />;
  if (route.name === "detailedMeals") return <DetailedMealConsumedScreen user={user} onNavigate={navigate} />;
  if (route.name === "editMeals") return <EditMealsScreen user={user} onNavigate={navigate} />;
  if (route.name === "bodyInfo") return <BodyInfoScreen user={user} onNavigate={navigate} />;
  if (route.name === "scanFood") return <ScanScreen user={user} mealType={route.mealType} onNavigate={navigate} />;
  if (route.name === "recipeDetail") return <RecipeDetailScreen recipe={route.recipe} onNavigate={navigate} />;

  return (
    <View style={styles.root}>
      <View style={styles.content}>
        {tab === "home" ? <HomeScreen user={user} onNavigate={navigate} /> : null}
        {tab === "insights" ? <InsightsScreen user={user} /> : null}
        {tab === "scan" ? <ScanScreen user={user} /> : null}
        {tab === "workout" ? <WorkoutScreen user={user} /> : null}
        {tab === "profile" ? <ProfileScreen user={user} onNavigate={navigate} /> : null}
      </View>
      <Pressable style={styles.menuButton} onPress={() => setDrawerOpen(true)}>
        <Ionicons name="menu" size={24} color={colors.primaryDark} />
      </Pressable>
      <View style={styles.nav}>
        {mainTabs.map((item) => {
          const active = item.key === tab;
          return (
            <Pressable key={item.key} onPress={() => switchTab(item.key)} style={[styles.navItem, item.key === "scan" && styles.scanItem]}>
              <Ionicons name={item.icon} size={item.key === "scan" ? 30 : 25} color={active ? colors.primary : colors.textMuted} />
            </Pressable>);

        })}
      </View>
      {drawerOpen ? <AppDrawer user={user} activeTab={tab} onClose={() => setDrawerOpen(false)} onNavigate={navigate} onTab={switchTab} /> : null}
    </View>);

}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    flex: 1
  },
  menuButton: {
    position: "absolute",
    top: 38,
    left: 16,
    zIndex: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  nav: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around"
  },
  navItem: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center"
  },
  scanItem: {
    backgroundColor: colors.accent,
    marginTop: -28
  }
});
