import { User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { db } from "@/config/firebase";
import { calculateBMR, calculateTDEE } from "@/services/nutrition";
import { colors } from "@/theme/colors";
import { AppRoute } from "@/types";

type Props = {
  user: User;
  onNavigate: (route: AppRoute) => void;
};

const activityOptions = [
  { key: "sedentary", label: "Ít vận động (Văn phòng)" },
  { key: "light", label: "Nhẹ (Tập 1-3 ngày/tuần)" },
  { key: "moderate", label: "Vừa (Tập 3-5 ngày/tuần)" },
  { key: "active", label: "Nhiều (Tập 6-7 ngày/tuần)" },
  { key: "very_active", label: "Rất nhiều (VĐV/Lao động nặng)" }
];

export function BodyInfoScreen({ user, onNavigate }: Props) {
  const [age, setAge] = useState("25");
  const [height, setHeight] = useState("170");
  const [weight, setWeight] = useState("60");
  const [gender, setGender] = useState("male");
  const [activityLevel, setActivityLevel] = useState("moderate");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getDoc(doc(db, "users", user.uid)).then((snapshot) => {
      if (!snapshot.exists()) return;
      const data = snapshot.data();
      setAge(String(data.age ?? 25));
      setHeight(String(data.height ?? 170));
      setWeight(String(data.currentWeight ?? data.weight ?? 60));
      setGender(String(data.gender ?? "male"));
      setActivityLevel(String(data.activityLevel ?? "moderate"));
    });
  }, [user.uid]);

  async function save() {
    if (!age || !height || !weight) {
      Alert.alert("Thiếu dữ liệu", "Nhập đủ tuổi, chiều cao và cân nặng.");
      return;
    }

    setSaving(true);
    try {
      const numericWeight = Number(weight);
      const numericHeight = Number(height);
      const numericAge = Number(age);
      const bmr = calculateBMR({ weight: numericWeight, height: numericHeight, age: numericAge, gender });
      const tdee = calculateTDEE(bmr, activityLevel);

      await updateDoc(doc(db, "users", user.uid), {
        age: numericAge,
        height: numericHeight,
        weight: numericWeight,
        currentWeight: numericWeight,
        gender,
        activityLevel,
        targetCalories: Math.round(tdee),
        updatedAt: serverTimestamp()
      });
      Alert.alert("Đã cập nhật", "Đã cập nhật chỉ số và mục tiêu calo.");
      onNavigate({ name: "main" });
    } catch (error) {
      Alert.alert("Không thể lưu", error instanceof Error ? error.message : "Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <Header title="Cập nhật chỉ số cơ thể" subtitle="Tính lại mục tiêu calo TDEE" onBack={() => onNavigate({ name: "main" })} />
      <Text style={styles.help}>Thông tin này giúp tính toán chính xác mục tiêu Calo (TDEE) của bạn.</Text>
      <Text style={styles.section}>Giới tính</Text>
      <View style={styles.genderRow}>
        <GenderCard label="Male" value="male" current={gender} onPress={setGender} />
        <GenderCard label="Female" value="female" current={gender} onPress={setGender} />
      </View>
      <View style={styles.row}>
        <View style={styles.half}><TextField label="Tuổi" value={age} onChangeText={setAge} keyboardType="numeric" /></View>
        <View style={styles.half}><TextField label="Chiều cao (cm)" value={height} onChangeText={setHeight} keyboardType="numeric" /></View>
      </View>
      <TextField label="Cân nặng (kg)" value={weight} onChangeText={setWeight} keyboardType="numeric" />
      <Text style={styles.section}>Mức độ vận động</Text>
      <View style={styles.options}>
        {activityOptions.map((option) => {
          const active = activityLevel === option.key;
          return (
            <Pressable key={option.key} style={[styles.option, active && styles.optionActive]} onPress={() => setActivityLevel(option.key)}>
              <Text style={[styles.optionText, active && styles.optionTextActive]}>{option.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <Button onPress={save} disabled={saving}>{saving ? "Đang lưu..." : "Lưu & Tính toán lại"}</Button>
    </Screen>
  );
}

function GenderCard({ label, value, current, onPress }: { label: string; value: string; current: string; onPress: (value: string) => void }) {
  const active = current === value;
  return (
    <Pressable style={[styles.gender, active && styles.genderActive]} onPress={() => onPress(value)}>
      <Text style={[styles.genderIcon, active && styles.genderIconActive]}>{value === "male" ? "♂" : "♀"}</Text>
      <Text style={[styles.genderText, active && styles.genderTextActive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  help: {
    color: colors.textMuted,
    lineHeight: 21,
    marginBottom: 20
  },
  section: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16,
    marginBottom: 10
  },
  genderRow: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20
  },
  gender: {
    flex: 1,
    minHeight: 88,
    borderRadius: 15,
    backgroundColor: colors.muted,
    borderWidth: 2,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center"
  },
  genderActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}25`
  },
  genderIcon: {
    color: colors.textMuted,
    fontSize: 30,
    fontWeight: "900"
  },
  genderIconActive: {
    color: colors.primary
  },
  genderText: {
    color: colors.textMuted,
    fontWeight: "900"
  },
  genderTextActive: {
    color: colors.primary
  },
  row: {
    flexDirection: "row",
    gap: 15
  },
  half: {
    flex: 1
  },
  options: {
    gap: 8,
    marginBottom: 24
  },
  option: {
    borderRadius: 14,
    padding: 13,
    backgroundColor: colors.muted,
    borderWidth: 1,
    borderColor: colors.border
  },
  optionActive: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}20`
  },
  optionText: {
    color: colors.text,
    fontWeight: "700"
  },
  optionTextActive: {
    color: colors.primaryDark
  }
});
