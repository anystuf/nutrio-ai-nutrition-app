import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import {
  breakfastItems,
  buildLegacyMealUpdate,
  dinnerItems,
  lunchItems,
  parseLegacyMealPlan
} from "@/screens/reports/legacyMeals";
import { colors } from "@/theme/colors";
import { AppRoute } from "@/types";

type Props = {
  user: User;
  onNavigate: (route: AppRoute) => void;
};

type Draft = {
  breakfast: Array<{ name: string; amount: string }>;
  lunch: Array<{ name: string; amount: string }>;
  dinner: Array<{ name: string; amount: string }>;
};

const emptyDraft: Draft = {
  breakfast: [{ name: "Nothing to show", amount: "" }, { name: "Nothing to show", amount: "" }],
  lunch: [{ name: "Nothing to show", amount: "" }, { name: "Nothing to show", amount: "" }],
  dinner: [{ name: "Nothing to show", amount: "" }, { name: "Nothing to show", amount: "" }]
};

export function EditMealsScreen({ user, onNavigate }: Props) {
  const [draft, setDraft] = useState<Draft>(emptyDraft);

  useEffect(() => {
    void getDoc(doc(db, "users", user.uid)).then((snapshot) => {
      if (!snapshot.exists()) return;
      const plan = parseLegacyMealPlan(snapshot.data());
      setDraft({
        breakfast: plan.breakfast.map((item) => ({ name: item.name, amount: String(item.amount || "") })),
        lunch: plan.lunch.map((item) => ({ name: item.name, amount: String(item.amount || "") })),
        dinner: plan.dinner.map((item) => ({ name: item.name, amount: String(item.amount || "") }))
      });
    });
  }, [user.uid]);

  function updateMeal(meal: keyof Draft, index: number, patch: Partial<Draft[keyof Draft][number]>) {
    setDraft((current) => ({
      ...current,
      [meal]: current[meal].map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item)
    }));
  }

  async function save() {
    const plan = {
      breakfast: draft.breakfast.map((item) => ({ name: item.name, amount: Number(item.amount || 0) })),
      lunch: draft.lunch.map((item) => ({ name: item.name, amount: Number(item.amount || 0) })),
      dinner: draft.dinner.map((item) => ({ name: item.name, amount: Number(item.amount || 0) }))
    };

    await updateDoc(doc(db, "users", user.uid), buildLegacyMealUpdate(plan));
    Alert.alert("Updated", "Any data changes will be updated.");
    onNavigate({ name: "detailedMeals" });
  }

  return (
    <Screen scroll>
      <Header title="Edit your Meals" subtitle="Choose a meal you like to eat today" onBack={() => onNavigate({ name: "detailedMeals" })} />
      <MealEditor title="Breakfast" meal="breakfast" options={breakfastItems} values={draft.breakfast} onChange={updateMeal} />
      <MealEditor title="Lunch" meal="lunch" options={lunchItems} values={draft.lunch} onChange={updateMeal} />
      <MealEditor title="Dinner" meal="dinner" options={dinnerItems} values={draft.dinner} onChange={updateMeal} />

      <View style={styles.actions}>
        <Pressable style={styles.primary} onPress={() => void save()}>
          <Text style={styles.primaryText}>Update</Text>
        </Pressable>
        <Pressable style={styles.secondary} onPress={() => onNavigate({ name: "detailedMeals" })}>
          <Text style={styles.secondaryText}>Cancel</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function MealEditor(props: {
  title: string;
  meal: keyof Draft;
  options: string[];
  values: Array<{ name: string; amount: string }>;
  onChange: (meal: keyof Draft, index: number, patch: Partial<Draft[keyof Draft][number]>) => void;
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.mealTitle}>{props.title}:</Text>
      {props.values.map((value, index) => (
        <View key={`${props.meal}-${index}`} style={styles.slot}>
          <Text style={styles.slotTitle}>{index === 0 ? "First" : "Alternative"}</Text>
          <View style={styles.options}>
            {props.options.map((option) => {
              const active = value.name === option;
              return (
                <Pressable key={option} style={[styles.option, active && styles.optionActive]} onPress={() => props.onChange(props.meal, index, { name: option })}>
                  <Text style={[styles.optionText, active && styles.optionTextActive]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
          <View style={styles.inputRow}>
            <Ionicons name="fast-food-outline" size={20} color={colors.textMuted} />
            <TextInput
              keyboardType="number-pad"
              maxLength={2}
              value={value.amount}
              onChangeText={(amount) => props.onChange(props.meal, index, { amount: amount.replace(/\D/g, "") })}
              placeholder="Amount to be taken in grams"
              placeholderTextColor={colors.textMuted}
              style={styles.input}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12
  },
  mealTitle: {
    color: colors.danger,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 10
  },
  slot: {
    marginBottom: 16
  },
  slotTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginBottom: 8
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  option: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: colors.background
  },
  optionActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  optionText: {
    color: colors.text,
    fontWeight: "700",
    fontSize: 12
  },
  optionTextActive: {
    color: colors.primaryDark
  },
  inputRow: {
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  input: {
    flex: 1,
    minHeight: 46,
    color: colors.text
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24
  },
  primary: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  primaryText: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 16
  },
  secondary: {
    flex: 1,
    minHeight: 50,
    borderRadius: 14,
    backgroundColor: colors.blue,
    alignItems: "center",
    justifyContent: "center"
  },
  secondaryText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 16
  }
});
