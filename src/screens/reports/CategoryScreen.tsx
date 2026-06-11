import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { Header } from "@/components/Header";
import { vietnameseFoods } from "@/data/foods";
import { ProgressRing } from "@/components/ProgressRing";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import {
  activeMealLabel,
  calculateLegacyNutrition,
  calculateLegacyTotals,
  greetingForHour,
  parseLegacyMealPlan,
  selectedMealCalories
} from "@/screens/reports/legacyMeals";
import { colors } from "@/theme/colors";
import { AppRoute, UserProfile } from "@/types";

type Props = {
  user: User;
  onNavigate: (route: AppRoute) => void;
};

const tips = "Eat a variety of food. Cut back on salt. Reduce some fats and oil. Limit sugar intake.";

export function CategoryScreen({ user, onNavigate }: Props) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return onSnapshot(doc(db, "users", user.uid), (snapshot) => {
      setProfile(snapshot.exists() ? snapshot.data() as UserProfile : null);
      setLoading(false);
    });
  }, [user.uid]);

  const model = useMemo(() => {
    const plan = parseLegacyMealPlan(profile);
    const totals = calculateLegacyTotals(plan, profile);
    const nutrition = calculateLegacyNutrition(totals);
    return { plan, totals, nutrition };
  }, [profile]);

  if (loading) {
    return (
      <Screen>
        <ActivityIndicator size="large" color={colors.primary} />
      </Screen>
    );
  }

  const now = new Date();
  const selected = selectedMealCalories(now.getHours(), model.nutrition);

  return (
    <Screen scroll>
      <Header title="Eat Healthy" subtitle="Today report" onBack={() => onNavigate({ name: "main" })} />
      <View style={styles.greeting}>
        <Text style={styles.greetingText}>{greetingForHour(now.getHours())}</Text>
        <Text style={styles.name}>{profile?.firstName ?? profile?.name ?? user.email}</Text>
      </View>

      <View style={styles.reportRow}>
        <MetricCard title="Intake" icon="pizza" label={activeMealLabel(now.getHours())} value={selected} color={colors.orange} />
        <MetricCard title="Burned" icon="flame" label={activeMealLabel(now.getHours())} value={selected} color={colors.danger} />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Ionicons name="star" color={colors.text} size={22} />
          <Text style={styles.title}>Stats</Text>
        </View>
        <Text style={styles.muted}>Average nutrients present in the selected meals:</Text>
        <View style={styles.nutrients}>
          <Nutrient label="Fats" value={model.nutrition.fatsTotal} total={model.nutrition.allTotal} color={colors.primary} />
          <Nutrient label="Proteins" value={model.nutrition.proteinTotal} total={model.nutrition.allTotal} color={colors.danger} />
          <Nutrient label="Carbs" value={model.nutrition.carbsTotal} total={model.nutrition.allTotal} color={colors.blue} />
        </View>
        <Text style={styles.total}>Total {model.nutrition.allTotal.toFixed(2)} / 2700 kcal</Text>
        <View style={styles.bar}>
          <View style={[styles.fill, { width: `${Math.min(100, model.nutrition.allTotal / 2700 * 100)}%` }]} />
        </View>
      </View>

      <Pressable style={styles.linkRow} onPress={() => onNavigate({ name: "detailedMeals" })}>
        <Text style={styles.linkText}>View all / edit meals for the day</Text>
        <Ionicons name="chevron-forward" size={20} color={colors.primaryDark} />
      </Pressable>

      <ValueIntakeGrid nutrition={model.nutrition} />
      <FoodsAvailableWidget />
      <ReportActionGrid onNavigate={onNavigate} />

      <View style={styles.card}>
        <View style={styles.cardTitle}>
          <Ionicons name="restaurant" color={colors.text} size={22} />
          <Text style={styles.title}>Meals Consumed</Text>
        </View>
        <MealSummary title="Breakfast" value={model.totals.breakfast} items={model.plan.breakfast} color={colors.blue} />
        <MealSummary title="Lunch" value={model.totals.lunch} items={model.plan.lunch} color={colors.orange} />
        <MealSummary title="Dinner" value={model.totals.dinner} items={model.plan.dinner} color={colors.primary} />
      </View>

      <View style={styles.tip}>
        <Ionicons name="bulb" color={colors.text} size={22} />
        <Text style={styles.tipTitle}>Tips</Text>
        <Text style={styles.tipBody}>{tips}</Text>
      </View>
    </Screen>
  );
}

function ValueIntakeGrid({ nutrition }: { nutrition: { fatsTotal: number; proteinTotal: number; carbsTotal: number; allTotal: number } }) {
  const rows = [
    { label: "Fats", value: nutrition.fatsTotal, color: colors.primary },
    { label: "Proteins", value: nutrition.proteinTotal, color: colors.danger },
    { label: "Carbs", value: nutrition.carbsTotal, color: colors.blue },
    { label: "Total", value: nutrition.allTotal, color: colors.orange }
  ];
  return (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <Ionicons name="analytics" color={colors.text} size={22} />
        <Text style={styles.title}>Value Intake</Text>
      </View>
      <View style={styles.valueGrid}>
        {rows.map((row) => (
          <View key={row.label} style={styles.valueCard}>
            <View style={[styles.valueDot, { backgroundColor: row.color }]} />
            <Text style={styles.valueAmount}>{row.value.toFixed(2)}</Text>
            <Text style={styles.valueLabel}>{row.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function FoodsAvailableWidget() {
  return (
    <View style={styles.card}>
      <View style={styles.cardTitle}>
        <Ionicons name="fast-food" color={colors.text} size={22} />
        <Text style={styles.title}>Foods Available</Text>
      </View>
      {vietnameseFoods.slice(0, 6).map((food) => (
        <View key={food.label} style={styles.foodRow}>
          <View style={styles.foodThumb}>
            <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
          </View>
          <View style={styles.foodBody}>
            <Text style={styles.foodTitle}>{food.label}</Text>
            <Text style={styles.foodMeta}>{food.serving} - {food.kcal} kcal</Text>
          </View>
          <Text style={styles.foodMacro}>C {food.carbs} / P {food.protein} / F {food.fat}</Text>
        </View>
      ))}
    </View>
  );
}

function ReportActionGrid({ onNavigate }: { onNavigate: (route: AppRoute) => void }) {
  return (
    <View style={styles.actionGrid}>
      <Pressable style={styles.actionCard} onPress={() => onNavigate({ name: "detailedMeals" })}>
        <Ionicons name="list" size={24} color={colors.primaryDark} />
        <Text style={styles.actionText}>Detailed Meals</Text>
      </Pressable>
      <Pressable style={styles.actionCard} onPress={() => onNavigate({ name: "editMeals" })}>
        <Ionicons name="create" size={24} color={colors.primaryDark} />
        <Text style={styles.actionText}>Edit Meals</Text>
      </Pressable>
    </View>
  );
}

function MetricCard({ title, icon, label, value, color }: { title: string; icon: keyof typeof Ionicons.glyphMap; label: string; value: number; color: string }) {
  return (
    <View style={styles.metric}>
      <View style={styles.metricTop}>
        <Text style={styles.metricTitle}>{title}</Text>
        <Ionicons name={icon} size={22} color={color} />
      </View>
        <Text style={styles.muted}>Meal taken at:</Text>
        <View style={styles.metricBody}>
        <ProgressRing value={Math.min(1, value / 900)} size={62} stroke={6} label={`${Math.round(Math.min(99, value / 9))}%`} sublabel="" color={color} />
        <View style={styles.metricValues}>
          <Text style={styles.metricLabel}>{label}</Text>
          <Text style={styles.metricValue}>{value.toFixed(2)}</Text>
          <Text style={styles.muted}>kCal</Text>
        </View>
      </View>
    </View>
  );
}

function Nutrient({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  return (
    <View style={styles.nutrient}>
      <View style={styles.verticalBar}>
        <View style={[styles.verticalFill, { height: `${Math.min(100, total > 0 ? value / total * 100 : 0)}%`, backgroundColor: color }]} />
      </View>
      <View>
        <Text style={styles.nutrientLabel}>{label}</Text>
        <Text style={styles.nutrientValue}>{value.toFixed(2)}</Text>
        <Text style={styles.muted}>kCal</Text>
      </View>
    </View>
  );
}

function MealSummary({ title, value, items, color }: { title: string; value: number; items: Array<{ name: string; amount: number }>; color: string }) {
  const visibleItems = items.filter((item) => item.name !== "Nothing to show" || item.amount > 0);
  return (
    <View style={styles.mealSummary}>
      <View style={[styles.mealBadge, { backgroundColor: `${color}22` }]}>
        <Ionicons name="fast-food-outline" size={18} color={color} />
      </View>
      <View style={styles.mealSummaryBody}>
        <View style={styles.mealSummaryTop}>
          <Text style={styles.mealSummaryTitle}>{title}</Text>
          <Text style={styles.mealSummaryValue}>{value} grams</Text>
        </View>
        <Text style={styles.mealSummaryItems}>{visibleItems.map((item) => `${item.name} ${item.amount}g`).join(" • ") || "Nothing to show"}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  greeting: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16
  },
  greetingText: {
    color: colors.textMuted,
    fontWeight: "900",
    fontSize: 17
  },
  name: {
    color: colors.text,
    fontSize: 16
  },
  reportRow: {
    flexDirection: "row",
    gap: 10
  },
  metric: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14
  },
  metricTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  metricTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  metricBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 10
  },
  metricValues: {
    flex: 1
  },
  metricLabel: {
    color: colors.blue,
    fontWeight: "900"
  },
  metricValue: {
    color: colors.text,
    fontWeight: "900",
    marginTop: 4
  },
  muted: {
    color: colors.textMuted,
    fontSize: 12
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 14,
    marginTop: 16
  },
  cardTitle: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  title: {
    color: colors.danger,
    fontSize: 24,
    fontWeight: "900"
  },
  nutrients: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12
  },
  valueGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 12
  },
  valueCard: {
    flexGrow: 1,
    minWidth: 118,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 12
  },
  valueDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 8
  },
  valueAmount: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18
  },
  valueLabel: {
    color: colors.textMuted,
    marginTop: 3,
    fontWeight: "800"
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingVertical: 11,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  foodThumb: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center"
  },
  foodBody: {
    flex: 1
  },
  foodTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  foodMeta: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 2
  },
  foodMacro: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "800"
  },
  actionGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  actionCard: {
    flex: 1,
    minHeight: 74,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    gap: 6
  },
  actionText: {
    color: colors.primaryDark,
    fontWeight: "900"
  },
  nutrient: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minWidth: 118,
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 10
  },
  verticalBar: {
    width: 7,
    height: 58,
    borderRadius: 4,
    backgroundColor: colors.border,
    justifyContent: "flex-end",
    overflow: "hidden"
  },
  verticalFill: {
    width: "100%"
  },
  nutrientLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  nutrientValue: {
    color: colors.text,
    fontWeight: "800"
  },
  total: {
    color: colors.text,
    fontWeight: "900",
    marginTop: 16
  },
  bar: {
    height: 8,
    borderRadius: 5,
    backgroundColor: colors.border,
    overflow: "hidden",
    marginTop: 8
  },
  fill: {
    height: "100%",
    backgroundColor: colors.primary
  },
  linkRow: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  linkText: {
    color: colors.text,
    fontWeight: "900"
  },
  tip: {
    marginTop: 16,
    backgroundColor: "#FFE9AA",
    borderRadius: 14,
    padding: 14,
    gap: 6
  },
  tipTitle: {
    color: colors.danger,
    fontSize: 20,
    fontWeight: "900"
  },
  tipBody: {
    color: colors.text,
    lineHeight: 20
  },
  mealSummary: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  mealBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  mealSummaryBody: {
    flex: 1
  },
  mealSummaryTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10
  },
  mealSummaryTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  mealSummaryValue: {
    color: colors.text,
    fontWeight: "800"
  },
  mealSummaryItems: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12
  }
});
