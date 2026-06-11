import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { collection, doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { BMIGauge, MonthlyLineChart, WeeklyBarChart } from "@/components/NutrioCharts";
import { ProgressRing } from "@/components/ProgressRing";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import { ageFromBirthDate, calculateBMI, calculateBMR, calculateMacroGoals, calculateTDEE, getDetailedBMIStatus } from "@/services/nutrition";
import { colors } from "@/theme/colors";
import { DailyLog, UserProfile } from "@/types";

type Period = "week" | "month";

type ChartPoint = {
  label: string;
  value: number;
  dateId: string;
};

const primaryGreen = "#C5E07E";

export function InsightsScreen({ user }: { user: User }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  const [period, setPeriod] = useState<Period>("week");

  useEffect(() => {
    return onSnapshot(doc(db, "users", user.uid), (snap) => setProfile(snap.exists() ? snap.data() as UserProfile : null));
  }, [user.uid]);

  useEffect(() => {
    return onSnapshot(collection(db, "users", user.uid, "daily_logs"), (snap) => {
      const nextLogs = snap.docs
        .map((docSnap) => {
          const data = docSnap.data();
          return { date: dateIdFromValue(data.date, docSnap.id), ...data } as DailyLog;
        })
        .sort((a, b) => a.date.localeCompare(b.date));
      setLogs(nextLogs);
    });
  }, [user.uid]);

  const stats = useMemo(() => {
    const weight = profile?.currentWeight ?? 60;
    const height = profile?.height ?? 170;
    const bmr = calculateBMR({ weight, height, age: ageFromBirthDate(profile?.birthDate), gender: profile?.gender });
    const tdee = Number(profile?.targetCalories || 0) || calculateTDEE(bmr, profile?.activityLevel);
    const bmi = calculateBMI(weight, height);
    const eaten = Number(profile?.consumedCalories ?? 0);
    const macros = calculateMacroGoals(tdee);
    return {
      bmi,
      bmr,
      tdee,
      eaten,
      remaining: Math.max(0, tdee - eaten),
      macros,
      eatenMacros: {
        carbs: Number(profile?.carbs ?? 0),
        protein: Number(profile?.protein ?? 0),
        fat: Number(profile?.fat ?? 0)
      }
    };
  }, [profile]);

  const chartData = useMemo(() => {
    const days = period === "week" ? 7 : 30;
    return buildChartData(logs, days);
  }, [logs, period]);

  return (
    <Screen scroll style={styles.content}>
      <Text style={styles.appTitle}>Health Insights</Text>

      <View style={styles.segmentWrap}>
        {(["week", "month"] as Period[]).map((item) => {
          const active = period === item;
          return (
            <Pressable key={item} onPress={() => setPeriod(item)} style={[styles.segmentItem, active && styles.segmentActive]}>
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{item === "week" ? "Weekly" : "Monthly"}</Text>
            </Pressable>
          );
        })}
      </View>

      <OverviewCard eaten={stats.eaten} goal={stats.tdee} remaining={stats.remaining} />

      <MacroDetailCard
        carbs={stats.eatenMacros.carbs}
        goalCarbs={stats.macros.carbs}
        protein={stats.eatenMacros.protein}
        goalProtein={stats.macros.protein}
        fat={stats.eatenMacros.fat}
        goalFat={stats.macros.fat}
      />

      {period === "week" ? (
        <WeeklyChartCard points={chartData} goal={stats.tdee} />
      ) : (
        <MonthlyChartCard points={chartData} goal={stats.tdee} />
      )}

      <BMIGaugeCard bmi={stats.bmi} />
    </Screen>
  );
}

function OverviewCard({ eaten, goal, remaining }: { eaten: number; goal: number; remaining: number }) {
  const progress = goal > 0 ? Math.min(1, eaten / goal) : 0;
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Today's Progress</Text>
        <Ionicons name="today-outline" size={22} color={colors.textMuted} />
      </View>
      <View style={styles.overviewBody}>
        <ProgressRing
          value={progress}
          size={120}
          stroke={13}
          color={primaryGreen}
          label={`${Math.round(progress * 100)}%`}
          sublabel=""
        />
        <View style={styles.overviewStats}>
          <InfoRow label="Eaten" value={`${Math.round(eaten)} kcal`} color={primaryGreen} />
          <View style={styles.thinDivider} />
          <InfoRow label="Goal" value={`${Math.round(goal)} kcal`} color={colors.text} />
          <View style={styles.thinDivider} />
          <InfoRow label="Left" value={`${Math.round(remaining)} kcal`} color={colors.textMuted} />
        </View>
      </View>
    </View>
  );
}

function MacroDetailCard(props: {
  carbs: number;
  goalCarbs: number;
  protein: number;
  goalProtein: number;
  fat: number;
  goalFat: number;
}) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>Nutrition Details</Text>
        <Ionicons name="pie-chart-outline" size={22} color={colors.textMuted} />
      </View>
      <View style={styles.macroRow}>
        <MacroCircle label="Carbs" value={props.carbs} goal={props.goalCarbs} color="#FF8A80" />
        <MacroCircle label="Protein" value={props.protein} goal={props.goalProtein} color="#FFD180" />
        <MacroCircle label="Fat" value={props.fat} goal={props.goalFat} color="#80D8FF" />
      </View>
    </View>
  );
}

function WeeklyChartCard({ points, goal }: { points: ChartPoint[]; goal: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Last 7 Days</Text>
      <WeeklyBarChart points={points} goal={goal} color={primaryGreen} />
    </View>
  );
}

function MonthlyChartCard({ points, goal }: { points: ChartPoint[]; goal: number }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Last 30 Days Trend</Text>
      <Text style={styles.chartSubtitle}>Calorie intake history</Text>
      <MonthlyLineChart points={points} goal={goal} color={primaryGreen} />
    </View>
  );
}

function BMIGaugeCard({ bmi }: { bmi: number }) {
  const status = getDetailedBMIStatus(bmi);

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>BMI Score</Text>
        <View style={[styles.statusPill, { backgroundColor: `${status.color}22` }]}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.status}</Text>
        </View>
      </View>
      <BMIGauge bmi={bmi} />
      <View style={styles.adviceBox}>
        <Ionicons name="information-circle-outline" size={20} color={colors.textMuted} />
        <Text style={styles.adviceText}>{status.advice}</Text>
      </View>
      <View style={styles.legendDivider} />
      <Legend range="< 18.5" label="Underweight" color="#6DD3FF" />
      <Legend range="18.5 - 25" label="Normal" color="#8DBF45" />
      <Legend range="25 - 30" label="Overweight" color="#EEC643" />
      <Legend range="> 30" label="Obese" color="#FF6B6B" />
    </View>
  );
}

function InfoRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={[styles.infoValue, { color }]}>{value}</Text>
    </View>
  );
}

function MacroCircle({ label, value, goal, color }: { label: string; value: number; goal: number; color: string }) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  return (
    <View style={styles.macroItem}>
      <ProgressRing value={pct} size={66} stroke={7} color={color} label={`${Math.round(pct * 100)}%`} sublabel="" />
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>{Math.round(value)}/{Math.round(goal)}g</Text>
    </View>
  );
}

function Legend({ range, label, color }: { range: string; label: string; color: string }) {
  return (
    <View style={styles.legendRow}>
      <View style={styles.legendName}>
        <View style={[styles.legendDot, { backgroundColor: color }]} />
        <Text style={styles.legendLabel}>{label}</Text>
      </View>
      <Text style={styles.legendRange}>{range}</Text>
    </View>
  );
}

function buildChartData(logs: DailyLog[], days: number) {
  const today = new Date();
  const result: ChartPoint[] = [];
  for (let i = 0; i < days; i += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const dateId = toDateId(date);
    const log = logs.find((item) => item.date === dateId);
    result.push({
      dateId,
      value: numberFrom(log?.caloriesIn, log?.total_calories, log?.consumedCalories),
      label: days === 7 ? date.toLocaleDateString("en", { weekday: "short" }).slice(0, 1) : `${date.getDate()}/${date.getMonth() + 1}`
    });
  }
  return result;
}

function numberFrom(...values: Array<number | undefined>) {
  for (const value of values) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return 0;
}

function dateIdFromValue(value: unknown, fallback: string) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) return value.slice(0, 10);
  if (value && typeof value === "object" && "toDate" in value && typeof (value as { toDate: () => Date }).toDate === "function") {
    return toDateId((value as { toDate: () => Date }).toDate());
  }
  if (value instanceof Date) return toDateId(value);
  return fallback;
}

function toDateId(date: Date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const styles = StyleSheet.create({
  content: {
    backgroundColor: "#FAFAFA",
    paddingBottom: 100
  },
  appTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 18
  },
  segmentWrap: {
    flexDirection: "row",
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    padding: 4,
    marginBottom: 20
  },
  segmentItem: {
    flex: 1,
    borderRadius: 25,
    minHeight: 42,
    alignItems: "center",
    justifyContent: "center"
  },
  segmentActive: {
    backgroundColor: primaryGreen
  },
  segmentText: {
    color: colors.textMuted,
    fontWeight: "900"
  },
  segmentTextActive: {
    color: colors.text
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#EEEEEE",
    shadowColor: "#000000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 2
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  overviewBody: {
    flexDirection: "row",
    alignItems: "center",
    gap: 20
  },
  overviewStats: {
    flex: 1
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  infoLabel: {
    color: colors.textMuted,
    fontSize: 14
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "900"
  },
  thinDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around"
  },
  macroItem: {
    alignItems: "center",
    width: 90
  },
  macroLabel: {
    color: colors.text,
    fontWeight: "900",
    marginTop: 8
  },
  macroValue: {
    color: colors.textMuted,
    fontSize: 12,
    marginTop: 3
  },
  chartSubtitle: {
    color: colors.textMuted,
    marginTop: 5,
    fontSize: 12
  },
  statusPill: {
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6
  },
  statusText: {
    fontWeight: "900",
    fontSize: 12
  },
  adviceBox: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    padding: 12
  },
  adviceText: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
    fontStyle: "italic"
  },
  legendDivider: {
    height: 1,
    backgroundColor: "#EEEEEE",
    marginVertical: 12
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4
  },
  legendName: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6
  },
  legendLabel: {
    color: colors.textMuted,
    fontSize: 13
  },
  legendRange: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  }
});
