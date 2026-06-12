import { Ionicons } from "@expo/vector-icons";

import { doc, onSnapshot } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ProgressRing } from "@/components/ProgressRing";
import { db } from "@/config/firebase";
import { ageFromBirthDate, calculateBMR, calculateMacroGoals, calculateTDEE } from "@/services/nutrition";
import { colors } from "@/theme/colors";









const meals = [
{ type: "Breakfast", field: "breakfast_kcal", color: colors.orange, targetRatio: 0.25, icon: "cafe" },
{ type: "Lunch", field: "lunch_kcal", color: colors.textMuted, targetRatio: 0.35, icon: "restaurant" },
{ type: "Dinner", field: "dinner_kcal", color: colors.primary, targetRatio: 0.3, icon: "leaf" },
{ type: "Snacks", field: "snacks_kcal", color: colors.pink, targetRatio: 0.1, icon: "ice-cream" }];


export function HomeScreen({ user, onNavigate, onOpenMenu }) {
  const [profile, setProfile] = useState(null);
  const [dailyLog, setDailyLog] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [loading, setLoading] = useState(true);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const selectedDateId = useMemo(() => toDateId(selectedDate), [selectedDate]);
  const todayId = toDateId(new Date());
  const isToday = selectedDateId === todayId;

  useEffect(() => {
    return onSnapshot(doc(db, "users", user.uid), (snap) => {
      setProfile(snap.exists() ? snap.data() : null);
      setLoading(false);
    });
  }, [user.uid]);

  useEffect(() => {
    return onSnapshot(doc(db, "users", user.uid, "daily_logs", selectedDateId), (snap) => {
      setDailyLog(snap.exists() ? { date: selectedDateId, ...snap.data() } : null);
    });
  }, [selectedDateId, user.uid]);

  const computed = useMemo(() => {
    const weight = profile?.currentWeight ?? 60;
    const height = profile?.height ?? 170;
    const age = ageFromBirthDate(profile?.birthDate);
    const bmr = calculateBMR({ weight, height, age, gender: profile?.gender });
    const target = Number(profile?.targetCalories || 0) || calculateTDEE(bmr, profile?.activityLevel);
    const macros = calculateMacroGoals(target);
    const consumed = numberOrFallback(dailyLog?.caloriesIn, dailyLog?.total_calories, dailyLog?.consumedCalories, isToday ? profile?.consumedCalories : 0);
    const carbs = numberOrFallback(dailyLog?.carbs, isToday ? profile?.carbs : 0);
    const protein = numberOrFallback(dailyLog?.protein, isToday ? profile?.protein : 0);
    const fat = numberOrFallback(dailyLog?.fat, isToday ? profile?.fat : 0);
    const burned = numberOrFallback(dailyLog?.caloriesOut, dailyLog?.burnedCalories, isToday ? profile?.burnedCalories : 0);
    const walking = numberOrFallback(dailyLog?.walkingCalories, 0);
    const activity = numberOrFallback(dailyLog?.activityCalories, Math.max(0, burned - walking));
    const mealValues = meals.reduce((acc, meal) => {
      acc[meal.type] = numberOrFallback(dailyLog?.[meal.field], isToday ? profile?.[meal.field] : 0);
      return acc;
    }, { Breakfast: 0, Lunch: 0, Dinner: 0, Snacks: 0 });

    return {
      target,
      consumed,
      burned,
      walking,
      activity,
      remaining: target + burned - consumed,
      macros,
      eatenMacros: { carbs, protein, fat },
      mealValues
    };
  }, [dailyLog, isToday, profile]);

  function changeDate(days) {
    setSelectedDate((current) => {
      const next = new Date(current);
      next.setDate(next.getDate() + days);
      return next;
    });
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>);

  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.greenHeader}>
          <Pressable style={styles.menuButton} onPress={onOpenMenu}>
            <Ionicons name="menu" size={24} color={colors.primaryDark} />
          </Pressable>
          <View style={styles.brandWrap}>
            <Image source={require("../../images/introimages/Logo (1).png")} style={styles.logo} />
            <Text style={styles.appTitle}>Nutrio</Text>
          </View>
          <Pressable style={styles.bell} onPress={() => setNotificationsOpen((value) => !value)}>
            <Ionicons name="notifications-outline" size={22} color={colors.primaryDark} />
            <View style={styles.redDot} />
          </Pressable>
          {notificationsOpen ? <NotificationPanel /> : null}
        </View>

        <View style={styles.dashboardCard}>
          <View style={styles.dateBar}>
            <Pressable hitSlop={10} onPress={() => changeDate(-1)}>
              <Ionicons name="chevron-back" size={24} color={colors.textMuted} />
            </Pressable>
            <Text style={styles.dateText}>{formatDateLabel(selectedDate, isToday)}</Text>
            <Pressable hitSlop={10} onPress={() => changeDate(1)}>
              <Ionicons name="chevron-forward" size={24} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.eatenRow}>
            <Stat label="Eaten" value={Math.round(computed.consumed)} color={colors.primary} />
            <ProgressRing
              value={computed.target + computed.burned > 0 ? computed.consumed / (computed.target + computed.burned) : 0}
              size={136}
              stroke={11}
              label={Math.max(0, Math.round(computed.remaining)).toString()}
              sublabel="kcal left" />
            
            <Stat label="Burned" value={Math.round(computed.burned)} color={colors.orange} />
          </View>

          <Text style={styles.dividerTitle}>Eaten</Text>
          <View style={styles.macroCircles}>
            <MacroCircle label="Carbs" value={computed.eatenMacros.carbs} target={computed.macros.carbs} color={colors.danger} />
            <MacroCircle label="Protein" value={computed.eatenMacros.protein} target={computed.macros.protein} color={colors.orange} />
            <MacroCircle label="Fat" value={computed.eatenMacros.fat} target={computed.macros.fat} color={colors.blue} />
          </View>

          <Text style={styles.dividerTitle}>Burned</Text>
          <View style={styles.burnedRow}>
            <Burned label="Walking" value={Math.round(computed.walking)} icon="walk" />
            <View style={styles.verticalDivider} />
            <Burned label="Activity" value={Math.round(computed.activity)} icon="flash" />
          </View>
        </View>

        <Text style={styles.sectionTitle}>Khám Phá Nutrio</Text>
        <View style={styles.quickGrid}>
          <Quick icon="restaurant" label="Recipes" onPress={() => onNavigate({ name: "recipes" })} />
          <Quick icon="heart" label="Favorites" onPress={() => onNavigate({ name: "favorites" })} />
          <Quick icon="analytics" label="Today Report" onPress={() => onNavigate({ name: "category" })} />
          <Quick icon="sparkles" label="AI Coach" onPress={() => onNavigate({ name: "aiCoach" })} />
          <Quick icon="book" label="To Learn" onPress={() => onNavigate({ name: "toLearn" })} />
        </View>

        <Text style={styles.sectionTitle}>Eaten Meals</Text>
        {meals.map((meal) => {
          const current = computed.mealValues[meal.type];
          const target = computed.target * meal.targetRatio;
          return (
            <MealRow
              key={meal.type}
              {...meal}
              current={current}
              target={target}
              onPress={() => onNavigate({ name: "meal", mealType: meal.type })}
              onAdd={() => onNavigate({ name: "search", mealType: meal.type })} />);


        })}
      </ScrollView>
    </SafeAreaView>);

}

function NotificationPanel() {
  return (
    <View style={styles.notificationPanel}>
      <Text style={styles.notificationTitle}>Notifications</Text>
      <Text style={styles.notificationText}>No new alerts right now.</Text>
      <Text style={styles.notificationText}>Meal and goal reminders will appear here.</Text>
    </View>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={styles.stat}>
      <View style={styles.statLabelRow}>
        <View style={[styles.dot, { backgroundColor: color }]} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statUnit}>kcal</Text>
    </View>);

}

function MacroCircle({ label, value, target, color }) {
  return (
    <View style={styles.macroCircleWrap}>
      <View style={[styles.macroCircle, { borderColor: color }]}>
        <Text style={styles.macroNumber}>{Math.round(value)}</Text>
        <Text style={styles.macroTarget}>/ {Math.round(target)} g</Text>
      </View>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>);

}

function Burned({ label, value, icon }) {
  return (
    <View style={styles.burned}>
      <View style={styles.burnedLabelRow}>
        <Ionicons name={icon} size={16} color={colors.orange} />
        <Text style={styles.burnedLabel}>{label}</Text>
      </View>
      <Text style={styles.burnedValue}>{value}</Text>
      <Text style={styles.statUnit}>kcal</Text>
    </View>);

}

function Quick({ icon, label, onPress }) {
  return (
    <Pressable style={styles.quick} onPress={onPress}>
      <Ionicons name={icon} color={colors.primaryDark} size={23} />
      <Text style={styles.quickText}>{label}</Text>
    </Pressable>);

}

function MealRow(props)







{
  const pct = props.target > 0 ? Math.min(1, props.current / props.target) : 0;
  return (
    <Pressable style={styles.meal} onPress={props.onPress}>
      <View style={[styles.mealIcon, { backgroundColor: `${props.color}22` }]}>
        <Ionicons name={props.icon} color={props.color} size={24} />
      </View>
      <View style={styles.mealContent}>
        <View style={styles.mealTop}>
          <Text style={styles.mealTitle}>{props.type}</Text>
          <Text style={[styles.mealPct, { color: props.color }]}>{Math.round(pct * 100)}%</Text>
        </View>
        <Text style={styles.mealSub}>{Math.round(props.current)} / {Math.round(props.target)} kcal</Text>
        <View style={styles.mealBar}>
          <View style={[styles.mealFill, { width: `${pct * 100}%`, backgroundColor: props.color }]} />
        </View>
      </View>
      <Pressable onPress={props.onAdd} hitSlop={10}>
        <Ionicons name="add-circle" size={28} color={colors.primary} />
      </Pressable>
    </Pressable>);

}

function numberOrFallback(...values) {
  for (const value of values) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue)) return numberValue;
  }
  return 0;
}

function toDateId(date) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDateLabel(date, isToday) {
  const label = `${date.toLocaleString("en", { month: "short" })} ${date.getDate()}`;
  return isToday ? `Today, ${label}` : `${date.toLocaleString("en", { weekday: "short" })}, ${label}`;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  content: {
    paddingBottom: 28
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background
  },
  greenHeader: {
    backgroundColor: colors.primarySoft,
    height: 150,
    paddingHorizontal: 30,
    paddingTop: 18,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    position: "relative",
    zIndex: 2
  },
  menuButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4
  },
  brandWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 20,
    alignItems: "center",
    pointerEvents: "none"
  },
  logo: {
    width: 30,
    height: 30
  },
  appTitle: {
    color: colors.primaryDark,
    fontSize: 23,
    fontWeight: "900",
    marginTop: 5
  },
  bell: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.primaryDark,
    alignItems: "center",
    justifyContent: "center"
  },
  redDot: {
    position: "absolute",
    top: 11,
    right: 12,
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: "#E53935"
  },
  notificationPanel: {
    position: "absolute",
    top: 72,
    right: 20,
    width: 250,
    borderRadius: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    shadowColor: "#000000",
    shadowOpacity: 0.16,
    shadowRadius: 14,
    elevation: 8,
    zIndex: 5
  },
  notificationTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 6
  },
  notificationText: {
    color: colors.textMuted,
    lineHeight: 20,
    fontSize: 13
  },
  dashboardCard: {
    marginHorizontal: 24,
    marginTop: -44,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 20,
    shadowColor: "#000000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 5
  },
  dateBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },
  dateText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  eatenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  stat: {
    width: 82,
    alignItems: "center"
  },
  statLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4
  },
  statLabel: {
    color: colors.textMuted,
    fontSize: 12
  },
  statValue: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 8
  },
  statUnit: {
    color: colors.textMuted,
    fontSize: 12
  },
  dividerTitle: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 18,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  macroCircles: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14
  },
  macroCircleWrap: {
    alignItems: "center"
  },
  macroCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 6,
    alignItems: "center",
    justifyContent: "center"
  },
  macroNumber: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18
  },
  macroTarget: {
    color: colors.textMuted,
    fontSize: 10
  },
  macroLabel: {
    color: colors.text,
    fontWeight: "700",
    marginTop: 8
  },
  burnedRow: {
    flexDirection: "row",
    alignItems: "center",
    minHeight: 98,
    position: "relative"
  },
  burned: {
    flex: 1,
    alignItems: "center"
  },
  burnedLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5
  },
  burnedLabel: {
    color: colors.textMuted,
    fontSize: 12
  },
  burnedValue: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8
  },
  verticalDivider: {
    width: 1,
    height: 58,
    backgroundColor: colors.border
  },
  sectionTitle: {
    marginHorizontal: 20,
    marginTop: 24,
    marginBottom: 10,
    color: colors.text,
    fontWeight: "900",
    fontSize: 17
  },
  quickGrid: {
    marginHorizontal: 20,
    backgroundColor: colors.surface,
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    rowGap: 16,
    justifyContent: "space-around",
    borderWidth: 1,
    borderColor: colors.border
  },
  quick: {
    alignItems: "center",
    gap: 7,
    width: 86
  },
  quickText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center"
  },
  meal: {
    marginHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 13,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  mealIcon: {
    width: 50,
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center"
  },
  mealContent: {
    flex: 1,
    gap: 6
  },
  mealTop: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  mealTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  mealPct: {
    fontWeight: "900",
    fontSize: 12
  },
  mealSub: {
    color: colors.textMuted,
    fontSize: 12
  },
  mealBar: {
    height: 6,
    borderRadius: 99,
    backgroundColor: colors.border,
    overflow: "hidden"
  },
  mealFill: {
    height: "100%"
  }
});
