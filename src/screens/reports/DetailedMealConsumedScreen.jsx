import { Ionicons } from "@expo/vector-icons";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import { calculateLegacyTotals, parseLegacyMealPlan } from "@/screens/reports/legacyMeals";
import { colors } from "@/theme/colors";







export function DetailedMealConsumedScreen({ user, onNavigate }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.data() : null);
    });
  }, [user.uid]);

  const model = useMemo(() => {
    const plan = parseLegacyMealPlan(profile);
    const totals = calculateLegacyTotals(plan, profile);
    return { plan, totals };
  }, [profile]);

  return (
    <Screen scroll>
      <Header title="Today" subtitle={new Date().toLocaleDateString()} onBack={() => onNavigate({ name: "category" })} />
      <MealBlock title="Breakfast" amount={model.totals.breakfast} color={colors.blue} items={model.plan.breakfast} />
      <MealBlock title="Lunch" amount={model.totals.lunch} color={colors.orange} items={model.plan.lunch} />
      <MealBlock title="Dinner" amount={model.totals.dinner} color={colors.primary} items={model.plan.dinner} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total amount of food</Text>
        <Text style={styles.totalValue}>{model.totals.total} grams</Text>
        <View style={styles.totalBar}>
          <View style={[styles.totalFill, { width: `${Math.min(100, model.totals.total / 594 * 100)}%` }]} />
        </View>
        <Pressable style={styles.edit} onPress={() => onNavigate({ name: "editMeals" })}>
          <Ionicons name="create" size={22} color="#FFFFFF" />
        </Pressable>
      </View>
    </Screen>);

}

function MealBlock({ title, amount, color, items }) {
  return (
    <View style={styles.block}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={[styles.progressDot, { borderColor: color }]} />
          <Text style={styles.title}>{title}</Text>
        </View>
        <Text style={styles.amount}>{amount} <Text style={styles.unit}>grams</Text></Text>
      </View>
      {items.map((item, index) =>
      <View key={`${title}-${index}`} style={styles.item}>
          <View style={[styles.rail, { backgroundColor: color }]} />
          <View style={[styles.square, { backgroundColor: `${color}33` }]} />
          <View>
            <Text style={styles.itemName}>{item.name}</Text>
            <Text style={styles.itemAmount}>{item.amount} grams</Text>
          </View>
        </View>
      )}
    </View>);

}

const styles = StyleSheet.create({
  block: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    marginBottom: 12
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  progressDot: {
    width: 25,
    height: 25,
    borderRadius: 13,
    borderWidth: 4
  },
  title: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  amount: {
    color: colors.text,
    fontWeight: "900"
  },
  unit: {
    color: colors.textMuted,
    fontSize: 12
  },
  item: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  rail: {
    width: 2,
    height: "100%"
  },
  square: {
    width: 52,
    height: 52,
    borderRadius: 16
  },
  itemName: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 15
  },
  itemAmount: {
    color: colors.textMuted,
    marginTop: 4
  },
  totalRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    paddingRight: 68
  },
  totalLabel: {
    color: colors.text,
    fontWeight: "900"
  },
  totalValue: {
    color: colors.text,
    fontWeight: "900",
    marginTop: 5
  },
  totalBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginTop: 10
  },
  totalFill: {
    height: "100%",
    backgroundColor: colors.blue
  },
  edit: {
    position: "absolute",
    right: 14,
    top: 22,
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  }
});
