import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { collection, doc, increment, serverTimestamp, setDoc, updateDoc } from "firebase/firestore";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { PoseWorkoutCamera } from "@/components/PoseWorkoutCamera";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import { estimateCalories } from "@/features/workout/workoutLogic";
import { colors } from "@/theme/colors";

type Props = {
  user: User;
};

const workouts = [
  { name: "Squats", subtitle: "MoveNet camera counter using the Dart rep-threshold logic.", icon: "body", color: colors.orange },
  { name: "Pushups", subtitle: "Manual counter until the native pushup pose model is mapped.", icon: "fitness", color: colors.blue }
] as const;

export function WorkoutScreen({ user }: Props) {
  const [exercise, setExercise] = useState<(typeof workouts)[number]["name"]>("Squats");
  const [reps, setReps] = useState(0);
  const [saving, setSaving] = useState(false);
  const [cameraMode, setCameraMode] = useState(false);
  const calories = useMemo(() => estimateCalories({ exercise, reps, userWeightKg: 65 }), [exercise, reps]);
  const handleRep = useCallback(() => setReps((value) => value + 1), []);

  async function saveWorkout() {
    if (!reps) {
      Alert.alert("No reps yet", "Log at least 1 rep before saving.");
      return;
    }

    setSaving(true);
    try {
      const todayId = new Date().toISOString().slice(0, 10);
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        burnedCalories: increment(calories)
      });
      await setDoc(doc(collection(userRef, "daily_logs"), todayId), {
        caloriesOut: increment(calories),
        workoutReps: increment(reps),
        workoutExercise: exercise,
        updatedAt: serverTimestamp()
      }, { merge: true });
      Alert.alert("Great work!", "You burned " + calories.toFixed(1) + " kcal.");
      setReps(0);
      setCameraMode(false);
    } catch (error) {
      Alert.alert("Could not save", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  if (cameraMode) {
    return (
      <PoseWorkoutCamera
        exercise={exercise}
        reps={reps}
        calories={calories}
        saving={saving}
        onRep={handleRep}
        onClose={() => setCameraMode(false)}
        onSave={() => void saveWorkout()}
      />
    );
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Nutrio Workout AI</Text>
      <Text style={styles.subtitle}>Match the Flutter workout flow: choose an exercise, open the camera counter, and save calories burned to the daily log.</Text>
      {workouts.map((item) => {
        const active = exercise === item.name;
        return (
          <Pressable key={item.name} style={[styles.row, active && styles.activeRow]} onPress={() => { setExercise(item.name); setReps(0); }}>
            <View style={[styles.icon, { backgroundColor: item.color + "22" }]}>
              <Ionicons name={item.icon} size={24} color={item.color} />
            </View>
            <View style={styles.rowText}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.reps}>{item.subtitle}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </Pressable>
        );
      })}

      <Pressable style={styles.cameraCounterButton} onPress={() => setCameraMode(true)}>
        <Ionicons name="camera" size={22} color={colors.primaryDark} />
        <Text style={styles.cameraCounterText}>Open AI camera counter</Text>
      </Pressable>

      <View style={styles.counter}>
        <Text style={styles.counterTitle}>{exercise}</Text>
        <View style={styles.stats}>
          <Stat label="REPS" value={String(reps)} />
          <Stat label="KCAL" value={calories.toFixed(1)} />
          <Stat label="EXERCISE" value={exercise} />
        </View>
        <View style={styles.controls}>
          <Pressable style={styles.control} onPress={() => setReps((value) => Math.max(0, value - 1))}>
            <Text style={styles.controlText}>-</Text>
          </Pressable>
          <Pressable style={[styles.control, styles.add]} onPress={() => setReps((value) => value + 1)}>
            <Text style={styles.controlText}>+</Text>
          </Pressable>
          <Pressable style={styles.control} onPress={() => setReps(0)}>
            <Text style={styles.resetText}>Reset</Text>
          </Pressable>
        </View>
        <Pressable style={styles.save} onPress={() => void saveWorkout()} disabled={saving}>
          <Text style={styles.saveText}>{saving ? "Saving..." : "FINISH WORKOUT"}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  title: { color: colors.text, fontSize: 30, fontWeight: "900" },
  subtitle: { marginTop: 8, color: colors.textMuted, lineHeight: 22, marginBottom: 24 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, backgroundColor: colors.surface, borderRadius: 20, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  activeRow: { borderColor: colors.primary, backgroundColor: colors.primary + "10" },
  icon: { width: 50, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center" },
  rowText: { flex: 1 },
  name: { color: colors.text, fontWeight: "900", fontSize: 18 },
  reps: { color: colors.textMuted, marginTop: 4 },
  cameraCounterButton: { minHeight: 54, borderRadius: 16, backgroundColor: colors.primary, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 10 },
  cameraCounterText: { color: colors.primaryDark, fontWeight: "900" },
  counter: { marginTop: 14, backgroundColor: "#1A1A1A", borderRadius: 20, padding: 18 },
  counterTitle: { color: "#FFFFFF", fontWeight: "900", fontSize: 20, marginBottom: 14 },
  stats: { flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(255,255,255,0.08)", borderRadius: 16, padding: 14 },
  stat: { flex: 1, alignItems: "center" },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "800" },
  statValue: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", marginTop: 5, textAlign: "center" },
  controls: { flexDirection: "row", gap: 10, marginTop: 16 },
  control: { flex: 1, height: 48, borderRadius: 14, backgroundColor: "rgba(255,255,255,0.12)", alignItems: "center", justifyContent: "center" },
  add: { backgroundColor: colors.primary },
  controlText: { color: "#FFFFFF", fontSize: 26, fontWeight: "900" },
  resetText: { color: "#FFFFFF", fontWeight: "900" },
  save: { marginTop: 15, minHeight: 50, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  saveText: { color: colors.primaryDark, fontWeight: "900" }
});
