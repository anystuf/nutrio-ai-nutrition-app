import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { caloriesPerServing } from "@/model/recipe";
import { colors } from "@/theme/colors";







export function RecipeDetailScreen({ recipe, onNavigate }) {
  return (
    <Screen scroll>
      <Header title={recipe.label} subtitle="Recipe detail" onBack={() => onNavigate({ name: "recipes" })} />
      {recipe.image ? <Image source={{ uri: recipe.image }} style={styles.image} /> : <View style={styles.imageFallback} />}
      <Text style={styles.title}>{recipe.label}</Text>
      <View style={styles.info}>
        <Ionicons name="information-circle-outline" color={colors.blue} size={20} />
        <Text style={styles.infoText}>
          Với lượng nguyên liệu dưới đây, sẽ làm được <Text style={styles.bold}>{Math.round(recipe.yield)} khẩu phần ăn</Text> với tổng năng lượng là <Text style={styles.danger}>{Math.round(recipe.calories * recipe.yield)} kcal</Text>.
        </Text>
      </View>
      <View style={styles.cards}>
        <InfoCard icon="flame" color={colors.orange} label={`${Math.round(recipe.calories)} kcal`} />
        <InfoCard icon="timer" color={colors.blue} label={recipe.totalTime > 0 ? `${Math.round(recipe.totalTime)} min` : "N/A"} />
        <InfoCard icon="restaurant" color={colors.primary} label={recipe.source || "Edamam"} />
      </View>
      <Text style={styles.perServing}>~{Math.round(caloriesPerServing(recipe))} kcal per serving</Text>
      <Text style={styles.section}>Ingredients</Text>
      {recipe.ingredientLines.length ? recipe.ingredientLines.map((ingredient) =>
      <View key={ingredient} style={styles.ingredient}>
          <View style={styles.bullet} />
          <Text style={styles.ingredientText}>{ingredient}</Text>
        </View>
      ) : <Text style={styles.empty}>No ingredients information available.</Text>}
    </Screen>);

}

function InfoCard({ icon, color, label }) {
  return (
    <View style={[styles.infoCard, { backgroundColor: `${color}18` }]}>
      <Ionicons name={icon} color={color} size={20} />
      <Text style={[styles.infoCardText, { color }]}>{label}</Text>
    </View>);

}

const styles = StyleSheet.create({
  image: {
    width: "100%",
    height: 250,
    borderRadius: 18,
    backgroundColor: colors.border
  },
  imageFallback: {
    width: "100%",
    height: 250,
    borderRadius: 18,
    backgroundColor: colors.border
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    marginTop: 20
  },
  info: {
    flexDirection: "row",
    gap: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: `${colors.blue}33`,
    backgroundColor: `${colors.blue}10`,
    marginTop: 15
  },
  infoText: {
    flex: 1,
    color: colors.text,
    lineHeight: 20
  },
  bold: {
    fontWeight: "900",
    color: colors.blue
  },
  danger: {
    fontWeight: "900",
    color: colors.danger
  },
  cards: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 8,
    marginTop: 18
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  infoCardText: {
    fontWeight: "900"
  },
  perServing: {
    color: colors.textMuted,
    marginTop: 12
  },
  section: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    marginTop: 24,
    marginBottom: 10
  },
  ingredient: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    paddingVertical: 6
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    marginTop: 7
  },
  ingredientText: {
    flex: 1,
    color: colors.text,
    fontSize: 16,
    lineHeight: 22
  },
  empty: {
    color: colors.textMuted
  }
});
