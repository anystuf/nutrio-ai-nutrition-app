
import { useMemo, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { addFoodToDiary } from "@/services/mealLog";
import { colors } from "@/theme/colors";









export function FoodDetailScreen({ user, food, mealType, onNavigate }) {
  const [servings, setServings] = useState(1);
  const scaled = useMemo(() => ({
    kcal: food.kcal * servings,
    carbs: food.carbs * servings,
    protein: food.protein * servings,
    fat: food.fat * servings
  }), [food, servings]);

  async function add() {
    try {
      await addFoodToDiary(user.uid, { ...food, ...scaled, serving: `${servings} serving(s)` }, mealType);
      Alert.alert("Added", `${food.label} was added to ${mealType}.`);
      onNavigate({ name: "main" });
    } catch (error) {
      Alert.alert("Could not add food", error instanceof Error ? error.message : "Please try again.");
    }
  }

  return (
    <Screen scroll style={styles.screen}>
      <Header title={food.label} subtitle={`Add to ${mealType}`} onBack={() => onNavigate({ name: "search", mealType })} />
      {food.image ? <Image source={{ uri: food.image }} style={styles.image} /> : <View style={styles.imageFallback} />}
      <View style={styles.macroRow}>
        <Macro label="Carbs" value={scaled.carbs} color={colors.danger} />
        <Macro label="Protein" value={scaled.protein} color={colors.blue} />
        <Macro label="Fat" value={scaled.fat} color={colors.orange} />
      </View>
      <Text style={styles.kcal}>Total Calories: {Math.round(scaled.kcal)} kcal</Text>
      <View style={styles.servings}>
        <Pressable style={styles.round} onPress={() => setServings((value) => Math.max(0.5, value - 0.5))}><Text style={styles.roundText}>-</Text></Pressable>
        <Text style={styles.servingText}>{servings} servings</Text>
        <Pressable style={styles.round} onPress={() => setServings((value) => value + 0.5)}><Text style={styles.roundText}>+</Text></Pressable>
      </View>
      <Button onPress={add}>Add to Diary</Button>
    </Screen>);

}

function Macro({ label, value, color }) {
  return (
    <View style={[styles.macro, { borderColor: color }]}>
      <Text style={styles.macroValue}>{Math.round(value)}g</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>);

}

const styles = StyleSheet.create({
  screen: {
    paddingBottom: 28
  },
  image: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    backgroundColor: colors.border
  },
  imageFallback: {
    width: "100%",
    height: 240,
    borderRadius: 18,
    backgroundColor: colors.border
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 24
  },
  macro: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 3,
    alignItems: "center",
    justifyContent: "center"
  },
  macroValue: {
    color: colors.text,
    fontWeight: "900"
  },
  macroLabel: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3
  },
  kcal: {
    textAlign: "center",
    marginVertical: 24,
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  servings: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    marginBottom: 24
  },
  round: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  roundText: {
    color: colors.primaryDark,
    fontSize: 26,
    fontWeight: "900"
  },
  servingText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "800"
  }
});
