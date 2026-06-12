import DateTimePicker from "@react-native-community/datetimepicker";

import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { useState } from "react";
import { Alert, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { db } from "@/config/firebase";
import { colors } from "@/theme/colors";






const goals = ["Lose Weight", "Gain Muscle", "Maintain Weight", "Boost Energy"];
const activities = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"];
const diets = ["Balanced Diet", "High Protein", "Low Carb", "Vegetarian", "Vegan", "Keto"];

export function OnboardingScreen({ user, onDone }) {
  const [page, setPage] = useState(0);
  const [name, setName] = useState(user.displayName ?? "");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState(new Date(1995, 11, 25));
  const [height, setHeight] = useState(170);
  const [currentWeight, setCurrentWeight] = useState(70);
  const [targetWeight, setTargetWeight] = useState(65);
  const [selectedGoals, setSelectedGoals] = useState([]);
  const [activityLevel, setActivityLevel] = useState("");
  const [dietType, setDietType] = useState("");
  const [breakfastTime, setBreakfastTime] = useState(new Date(1995, 1, 1, 8, 0));
  const [dinnerTime, setDinnerTime] = useState(new Date(1995, 1, 1, 20, 0));
  const [loading, setLoading] = useState(false);

  const total = 11;
  const progress = (page + 1) / total;

  function toggleGoal(goal) {
    setSelectedGoals((current) => current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal]);
  }

  function canContinue() {
    if (page === 0) return name.trim().length > 0;
    if (page === 1) return gender.length > 0;
    if (page === 6) return selectedGoals.length > 0;
    if (page === 7) return activityLevel.length > 0;
    if (page === 8) return dietType.length > 0;
    return true;
  }

  async function save() {
    setLoading(true);
    try {
      const parts = name.trim().split(/\s+/);
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        name: name.trim(),
        firstName: parts[0] ?? "",
        lastName: parts.slice(1).join(" "),
        gender,
        birthDate: birthDate.toISOString(),
        height,
        currentWeight,
        targetWeight,
        goals: selectedGoals,
        mainGoal: selectedGoals[0] ?? "",
        activityLevel,
        dietType,
        breakfastTime: formatTime(breakfastTime),
        dinnerTime: formatTime(dinnerTime),
        onboardingCompleted: true,
        updatedAt: serverTimestamp()
      }, { merge: true });
      onDone();
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function next() {
    if (page === total - 1) {
      void save();
    } else {
      setPage((value) => value + 1);
    }
  }

  return (
    <Screen style={styles.screen}>
      <View>
        <View style={styles.progressHeader}>
          <Text style={styles.progressText}>{page + 1}/{total}</Text>
          <Text style={styles.progressText}>{Math.round(progress * 100)}%</Text>
        </View>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>
      </View>

      <View style={styles.body}>{renderStep()}</View>

      <View style={styles.nav}>
        {page > 0 ? <Button variant="ghost" onPress={() => setPage((value) => value - 1)}>Back</Button> : null}
        <Button onPress={next} disabled={!canContinue() || loading}>{page === total - 1 ? "Complete" : "Continue"}</Button>
      </View>
    </Screen>);


  function renderStep() {
    if (page === 0) {
      return <Step title="What's your name?"><TextField label="Name" value={name} onChangeText={setName} placeholder="Jarvis" /></Step>;
    }
    if (page === 1) {
      return <Step title="What's your gender?"><OptionGrid values={["Male", "Female"]} selected={gender} onSelect={setGender} /></Step>;
    }
    if (page === 2) {
      return (
        <Step title="When's your birthday?">
          <DateTimePicker value={birthDate} mode="date" maximumDate={new Date()} display={Platform.OS === "ios" ? "spinner" : "default"} onChange={(_, value) => value && setBirthDate(value)} />
        </Step>);

    }
    if (page === 3) return <NumberStep title="How tall are you?" value={height} unit="cm" min={100} max={250} onChange={setHeight} />;
    if (page === 4) return <NumberStep title="What's your current weight?" value={currentWeight} unit="kg" min={30} max={300} step={0.5} onChange={setCurrentWeight} />;
    if (page === 5) return <NumberStep title="What's your target weight?" value={targetWeight} unit="kg" min={30} max={300} step={0.5} onChange={setTargetWeight} />;
    if (page === 6) return <Step title="What's your main goals?"><OptionGrid values={goals} selected={selectedGoals} onToggle={toggleGoal} /></Step>;
    if (page === 7) return <Step title="What's your activity level?"><OptionGrid values={activities} selected={activityLevel} onSelect={setActivityLevel} /></Step>;
    if (page === 8) return <Step title="What's your diet type?"><OptionGrid values={diets} selected={dietType} onSelect={setDietType} /></Step>;
    if (page === 9) {
      return <Step title="When do you usually have breakfast?"><DateTimePicker value={breakfastTime} mode="time" onChange={(_, value) => value && setBreakfastTime(value)} /></Step>;
    }
    return <Step title="When do you usually have dinner?"><DateTimePicker value={dinnerTime} mode="time" onChange={(_, value) => value && setDinnerTime(value)} /></Step>;
  }
}

function Step({ title, children }) {
  return (
    <View style={styles.step}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>);

}

function OptionGrid(props)




{
  return (
    <View style={styles.options}>
      {props.values.map((value) => {
        const active = Array.isArray(props.selected) ? props.selected.includes(value) : props.selected === value;
        return (
          <Pressable key={value} onPress={() => props.onToggle ? props.onToggle(value) : props.onSelect?.(value)} style={[styles.option, active && styles.optionActive]}>
            <Text style={[styles.optionText, active && styles.optionTextActive]}>{value}</Text>
          </Pressable>);

      })}
    </View>);

}

function NumberStep(props)







{
  const step = props.step ?? 1;
  return (
    <Step title={props.title}>
      <View style={styles.numberRow}>
        <Pressable style={styles.roundButton} onPress={() => props.onChange(Math.max(props.min, props.value - step))}>
          <Text style={styles.roundText}>-</Text>
        </Pressable>
        <View style={styles.numberValue}>
          <Text style={styles.numberText}>{props.value.toFixed(step < 1 ? 1 : 0)}</Text>
          <Text style={styles.unit}>{props.unit}</Text>
        </View>
        <Pressable style={styles.roundButton} onPress={() => props.onChange(Math.min(props.max, props.value + step))}>
          <Text style={styles.roundText}>+</Text>
        </Pressable>
      </View>
    </Step>);

}

function formatTime(date) {
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  screen: {
    gap: 20
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  progressText: {
    color: colors.textMuted,
    fontWeight: "800"
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 99,
    overflow: "hidden"
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary
  },
  body: {
    flex: 1
  },
  step: {
    flex: 1,
    gap: 24,
    justifyContent: "center"
  },
  title: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 38,
    fontWeight: "900"
  },
  options: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12
  },
  option: {
    minHeight: 58,
    width: "47%",
    borderRadius: 14,
    backgroundColor: colors.muted,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    padding: 12
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: "#ECF7E9"
  },
  optionText: {
    color: colors.text,
    textAlign: "center",
    fontWeight: "800"
  },
  optionTextActive: {
    color: colors.primaryDark
  },
  numberRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  roundButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center"
  },
  roundText: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "900"
  },
  numberValue: {
    alignItems: "center"
  },
  numberText: {
    color: colors.primaryDark,
    fontSize: 58,
    fontWeight: "900"
  },
  unit: {
    color: colors.textMuted,
    fontSize: 18,
    fontWeight: "800"
  },
  nav: {
    gap: 8
  }
});
