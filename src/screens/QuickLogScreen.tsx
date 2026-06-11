import { User } from "firebase/auth";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { addFoodToDiary } from "@/services/mealLog";
import { colors } from "@/theme/colors";
import { AppRoute, MealType } from "@/types";

type Props = {
  user: User;
  mealType: MealType;
  onNavigate: (route: AppRoute) => void;
};

export function QuickLogScreen({ user, mealType, onNavigate }: Props) {
  const [name, setName] = useState("");
  const [kcal, setKcal] = useState("");
  const [saving, setSaving] = useState(false);

  async function submit() {
    const calories = Number(kcal);
    if (!name.trim() || !Number.isFinite(calories) || calories <= 0) {
      Alert.alert("Check details", "Enter a food name and valid calories.");
      return;
    }
    setSaving(true);
    try {
      await addFoodToDiary(user.uid, {
        label: name.trim(),
        kcal: calories,
        carbs: 0,
        protein: 0,
        fat: 0,
        serving: "quick log",
        tags: ["quick"]
      }, mealType);
      Alert.alert("Logged", `${Math.round(calories)} kcal added to ${mealType}.`);
      onNavigate({ name: "main" });
    } catch (error) {
      Alert.alert("Quick log failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen>
      <Header title="Quick Log" subtitle={`Add calories to ${mealType}`} onBack={() => onNavigate({ name: "search", mealType })} />
      <View style={styles.icon}>
        <Text style={styles.plus}>+</Text>
      </View>
      <TextField label="Food name" value={name} onChangeText={setName} placeholder="Sandwich, pizza, etc." icon="restaurant-outline" />
      <TextField label="Calorie (kcal)" value={kcal} onChangeText={setKcal} placeholder="250" keyboardType="numeric" icon="flame-outline" />
      <View style={styles.spacer} />
      <Button onPress={submit} disabled={saving}>{saving ? "Saving..." : "+ Add"}</Button>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.surface,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 24
  },
  plus: {
    color: colors.textMuted,
    fontSize: 42,
    fontWeight: "500"
  },
  spacer: {
    flex: 1
  }
});
