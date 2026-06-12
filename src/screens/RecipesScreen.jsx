import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { localRecipes } from "@/data/localRecipes";
import { colors } from "@/theme/colors";


const favoritesKey = "nutrio.favoriteRecipes";






export function RecipesScreen({ onNavigate, favoritesOnly = false }) {
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    void AsyncStorage.getItem(favoritesKey).then((value) => setFavorites(value ? JSON.parse(value) : []));
  }, []);

  async function toggle(label) {
    const next = favorites.includes(label) ? favorites.filter((item) => item !== label) : [...favorites, label];
    setFavorites(next);
    await AsyncStorage.setItem(favoritesKey, JSON.stringify(next));
  }

  const recipes = favoritesOnly ? localRecipes.filter((recipe) => favorites.includes(recipe.label)) : localRecipes;

  return (
    <Screen scroll>
      <Header title={favoritesOnly ? "Favorites" : "Recipes"} subtitle="Nutrio healthy meal ideas" onBack={() => onNavigate({ name: "main" })} />
      {recipes.length === 0 ? <Text style={styles.empty}>No favorite recipes yet.</Text> : null}
      {recipes.map((recipe) =>
      <RecipeCard
        key={recipe.label}
        recipe={recipe}
        active={favorites.includes(recipe.label)}
        onOpen={() => onNavigate({ name: "recipeDetail", recipe })}
        onToggle={() => void toggle(recipe.label)} />

      )}
    </Screen>);

}

function RecipeCard({ recipe, active, onToggle, onOpen }) {
  return (
    <Pressable style={styles.card} onPress={onOpen}>
      <Image source={{ uri: recipe.image }} style={styles.image} />
      <View style={styles.body}>
        <View style={styles.top}>
          <Text style={styles.title}>{recipe.label}</Text>
          <Pressable onPress={onToggle} hitSlop={10}>
            <Ionicons name={active ? "heart" : "heart-outline"} size={24} color={active ? colors.danger : colors.textMuted} />
          </Pressable>
        </View>
        <Text style={styles.meta}>{Math.round(recipe.calories)} kcal • {Math.round(recipe.totalTime)} min • {recipe.source}</Text>
        <Text style={styles.ingredients}>{recipe.ingredientLines.join(", ")}</Text>
      </View>
    </Pressable>);

}

const styles = StyleSheet.create({
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    padding: 28
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 14
  },
  image: {
    width: "100%",
    height: 150,
    backgroundColor: colors.border
  },
  body: {
    padding: 14
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  title: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  meta: {
    color: colors.primaryDark,
    fontWeight: "800",
    marginTop: 6
  },
  ingredients: {
    color: colors.textMuted,
    marginTop: 7,
    lineHeight: 20
  }
});
