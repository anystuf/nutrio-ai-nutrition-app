import { signOut, User } from "firebase/auth";
import { collection, doc, getDocs, onSnapshot, updateDoc, writeBatch } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { auth, db } from "@/config/firebase";
import { calculateBMI } from "@/services/nutrition";
import { colors } from "@/theme/colors";
import { AppRoute, UserProfile } from "@/types";

export function ProfileScreen({ user, onNavigate }: { user: User; onNavigate: (route: AppRoute) => void }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    return onSnapshot(doc(db, "users", user.uid), (snap) => setProfile(snap.exists() ? snap.data() as UserProfile : null));
  }, [user.uid]);

  const bmi = calculateBMI(profile?.currentWeight ?? 0, profile?.height ?? 0);
  const displayName = profile?.name || `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim() || user.displayName || "User Name";

  async function resetTestData() {
    Alert.alert("Reset data?", "Today calories and meal history will be reset to 0.", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa hết",
        style: "destructive",
        onPress: async () => {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, {
            consumedCalories: 0,
            carbs: 0,
            protein: 0,
            fat: 0,
            breakfast_kcal: 0,
            lunch_kcal: 0,
            dinner_kcal: 0,
            snacks_kcal: 0
          });

          const history = await getDocs(collection(userRef, "meal_history"));
          const batch = writeBatch(db);
          history.docs.forEach((item) => batch.delete(item.ref));
          await batch.commit();
          Alert.alert("Đã reset", "Dữ liệu đã về 0.");
        }
      }
    ]);
  }

  return (
    <Screen scroll>
      <Pressable style={styles.upgradeBanner} onPress={() => onNavigate({ name: "profileTool", title: "Nutrio Pro" })}>
        <View style={styles.premiumIcon}>
          <Text style={styles.premiumIconText}>★</Text>
        </View>
        <View style={styles.upgradeTextWrap}>
          <Text style={styles.upgradeTitle}>Upgrade Plan Now!</Text>
          <Text style={styles.upgradeText}>Enjoy all the benefits and explore more possibilities</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Pressable style={styles.header} onPress={() => onNavigate({ name: "editProfile" })}>
        <Image source={{ uri: profile?.imageurl || user.photoURL || "https://via.placeholder.com/150" }} style={styles.avatar} />
        <Text style={styles.name}>{displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
        <View style={styles.editBadge}>
          <Text style={styles.editBadgeText}>Edit</Text>
        </View>
      </Pressable>

      <View style={styles.panel}>
        <Row label="Height" value={`${profile?.height ?? 0} cm`} />
        <Row label="Current weight" value={`${profile?.currentWeight ?? 0} kg`} />
        <Row label="Target weight" value={`${profile?.targetWeight ?? 0} kg`} />
        <Row label="BMI" value={bmi ? bmi.toFixed(1) : "--"} />
        <Row label="Diet" value={profile?.dietType ?? "--"} />
      </View>

      <View style={styles.panel}>
        {["Body Metrics (TDEE/BMI)", "Calorie Counter", "Personal Data", "Notifications", "Payment Method", "Help & Support", "Contact Us"].map((title) => (
          <Pressable key={title} onPress={() => title === "Body Metrics (TDEE/BMI)" ? onNavigate({ name: "bodyInfo" }) : onNavigate({ name: "profileTool", title })} style={styles.toolRow}>
            <Text style={styles.rowLabel}>{title}</Text>
            <Text style={styles.chevron}>›</Text>
          </Pressable>
        ))}
        <Pressable onPress={() => void resetTestData()} style={styles.toolRow}>
          <Text style={styles.destructive}>Reset Test Data</Text>
          <Text style={styles.destructive}>›</Text>
        </Pressable>
      </View>

      <Button variant="danger" onPress={() => void signOut(auth)}>Logout</Button>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  upgradeBanner: {
    backgroundColor: "#C5E07E",
    borderRadius: 20,
    padding: 18,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 14
  },
  premiumIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center"
  },
  premiumIconText: {
    color: colors.orange,
    fontWeight: "900",
    fontSize: 20
  },
  upgradeTextWrap: {
    flex: 1
  },
  upgradeTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18
  },
  upgradeText: {
    color: colors.text,
    fontSize: 12,
    marginTop: 3
  },
  header: {
    alignItems: "center",
    paddingVertical: 18
  },
  avatar: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: colors.border
  },
  name: {
    marginTop: 14,
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    textAlign: "center"
  },
  email: {
    color: colors.textMuted,
    marginTop: 5
  },
  editBadge: {
    marginTop: 10,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: colors.muted
  },
  editBadgeText: {
    color: colors.text,
    fontWeight: "900"
  },
  panel: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: colors.border
  },
  row: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  rowLabel: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  rowValue: {
    color: colors.text,
    fontWeight: "900"
  },
  toolRow: {
    minHeight: 46,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  chevron: {
    color: colors.textMuted,
    fontSize: 24,
    fontWeight: "900"
  },
  destructive: {
    color: colors.danger,
    fontWeight: "800"
  }
});
