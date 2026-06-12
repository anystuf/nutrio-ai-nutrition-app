
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { db } from "@/config/firebase";
import { colors } from "@/theme/colors";







export function CreateFoodScreen({ user, onNavigate }) {
  const [label, setLabel] = useState("");
  const [serving, setServing] = useState("100");
  const [kcal, setKcal] = useState("");
  const [carbs, setCarbs] = useState("");
  const [protein, setProtein] = useState("");
  const [fat, setFat] = useState("");
  const [saving, setSaving] = useState(false);

  async function save() {
    if (!label.trim() || !kcal.trim()) {
      Alert.alert("Required", "Food name and calories are required.");
      return;
    }
    setSaving(true);
    try {
      await addDoc(collection(db, "users", user.uid, "personal_foods"), {
        label: label.trim(),
        serving: Number(serving) || 100,
        calories: Number(kcal) || 0,
        kcal: Number(kcal) || 0,
        carbs: Number(carbs) || 0,
        protein: Number(protein) || 0,
        fat: Number(fat) || 0,
        image: "https://cdn-icons-png.flaticon.com/512/706/706164.png",
        createdAt: serverTimestamp()
      });
      Alert.alert("Saved", "Food was saved to your personal foods.");
      onNavigate({ name: "search" });
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <Header title="Create Food" subtitle="Add your own nutrition item" onBack={() => onNavigate({ name: "search" })} />
      <View style={styles.icon}><Text style={styles.plus}>+</Text></View>
      <TextField label="Food name" value={label} onChangeText={setLabel} placeholder="Salad, sandwich, etc." />
      <View style={styles.row}>
        <View style={styles.half}><TextField label="Serving" value={serving} onChangeText={setServing} keyboardType="numeric" /></View>
        <View style={styles.half}><TextField label="Unit" value="gram (g)" editable={false} /></View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}><TextField label="Calorie (kcal)" value={kcal} onChangeText={setKcal} keyboardType="numeric" /></View>
        <View style={styles.half}><TextField label="Carb (g)" value={carbs} onChangeText={setCarbs} keyboardType="numeric" /></View>
      </View>
      <View style={styles.row}>
        <View style={styles.half}><TextField label="Protein (g)" value={protein} onChangeText={setProtein} keyboardType="numeric" /></View>
        <View style={styles.half}><TextField label="Fat (g)" value={fat} onChangeText={setFat} keyboardType="numeric" /></View>
      </View>
      <Button onPress={save} disabled={saving}>{saving ? "Saving..." : "+ Add"}</Button>
    </Screen>);

}

const styles = StyleSheet.create({
  icon: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24
  },
  plus: {
    color: colors.textMuted,
    fontSize: 42
  },
  row: {
    flexDirection: "row",
    gap: 12
  },
  half: {
    flex: 1
  }
});
