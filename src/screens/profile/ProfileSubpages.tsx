import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";
import { calculateBMI, calculateBMR, calculateTDEE } from "@/services/nutrition";
import { colors } from "@/theme/colors";
import { UserProfile } from "@/types";

const faqText = [
  "Do you prefer home cooked meal or fast food?",
  "Do you cook?",
  "Do you cook by/for yourself or with/for somebody else?",
  "Are you skilled at cooking?",
  "How often do you cook?",
  "What kind of meals do you prepare?",
  "Easy, intermediate or elaborate?",
  "How often do you know exactly what you want to cook?",
  "Do you plan groceries before deciding what to cook?",
  "How much time does it take you to decide on the exact meal/recipe?",
  "Do you like traditional recipes or unfamiliar meals?",
  "Do you collect different recipes?",
  "What kind of foreign cuisine do you prefer?"
];

export function UpgradePlanContent({ user, onPayment }: { user: User; onPayment: () => void }) {
  const [selected, setSelected] = useState<0 | 1>(0);
  return (
    <View>
      <UserLine user={user} />
      <View style={styles.sparkle}>
        <Ionicons name="sparkles" color={colors.primary} size={42} />
      </View>
      <Text style={styles.bigCenter}>Get Unlimited{"\n"}Access</Text>
      <PlanOption selected={selected === 0} best title="Annually package" price="50$" subtitle="4,1$ / month" onPress={() => setSelected(0)} />
      <PlanOption selected={selected === 1} title="Monthly package" price="15$" subtitle="Pay every month" onPress={() => setSelected(1)} />
      <Pressable style={styles.primaryButton} onPress={onPayment}>
        <Text style={styles.primaryText}>Continue</Text>
      </Pressable>
    </View>
  );
}

export function PaymentMethodContent({ user }: { user: User }) {
  return (
    <View>
      <UserLine user={user} />
      <View style={styles.summary}>
        <Text style={styles.planTitle}>Order Summary</Text>
        <Text style={styles.price}>50$</Text>
      </View>
      <View style={styles.card}>
        <View style={styles.summary}>
          <View>
            <Text style={styles.planTitle}>Annually package</Text>
            <Text style={styles.userEmail}>4,1$ / month</Text>
          </View>
          <Text style={styles.greenText}>Total (one)</Text>
        </View>
        <Text style={styles.sectionTitle}>Credit/Debit Card</Text>
        <TextInput style={styles.input} placeholder="Expiry Date" placeholderTextColor={colors.textMuted} />
        <TextInput style={styles.input} placeholder="Card Holder Name" placeholderTextColor={colors.textMuted} />
      </View>
      <View style={styles.paymentGrid}>
        {["Momo", "Momo", "ZaloPay", "Google Pay", "ZaloPay", "Apple Pay"].map((item, index) => (
          <View key={`${item}-${index}`} style={styles.paymentLogo}>
            <Text style={styles.paymentLogoText}>{item}</Text>
          </View>
        ))}
      </View>
      <Pressable style={styles.primaryButton} onPress={() => Alert.alert("Payment", "Payment feature coming soon!")}>
        <Text style={styles.primaryText}>Confirm & Pay</Text>
      </Pressable>
    </View>
  );
}

export function NotificationSettingsContent() {
  const [meal, setMeal] = useState(true);
  const [water, setWater] = useState(false);
  const [goal, setGoal] = useState(true);
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Reminder Settings</Text>
      <Text style={styles.userEmail}>Stay on track with your health goals by enabling smart reminders.</Text>
      <Toggle title="Meal Reminders" subtitle="Remind you to log breakfast, lunch, and dinner." value={meal} onValueChange={setMeal} />
      <Toggle title="Water Intake" subtitle="Get notified to stay hydrated throughout the day." value={water} onValueChange={setWater} />
      <Toggle title="Goal Achievements" subtitle="Notify when you reach your daily step or calorie goal." value={goal} onValueChange={setGoal} />
    </View>
  );
}

export function ContactUsContent({ user, onDone }: { user: User; onDone: () => void }) {
  const [email, setEmail] = useState(user.email ?? "");
  const [message, setMessage] = useState("");

  function submit() {
    if (!email || !message) {
      Alert.alert("Oh Snap!", "Please fill the empty fields.");
      return;
    }
    if (email.trim() !== user.email) {
      Alert.alert("Oh Snap!", "Please use the email that you signed up with.");
      return;
    }
    Alert.alert("Hello There!", "Thank you for contacting us. Your message will be reviewed within 1 to 2 business days!", [{ text: "OK", onPress: onDone }]);
  }

  return (
    <View>
      <Text style={styles.contactTitle}>Contact us</Text>
      <Text style={styles.contactSubtitle}>We are always available</Text>
      <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="Email" placeholderTextColor={colors.textMuted} />
      <TextInput style={[styles.input, styles.message]} value={message} onChangeText={setMessage} placeholder="Text" placeholderTextColor={colors.textMuted} multiline />
      <Pressable style={styles.primaryButton} onPress={submit}>
        <Text style={styles.primaryText}>SUBMIT</Text>
      </Pressable>
    </View>
  );
}

export function FaqsContent() {
  return (
    <View style={styles.card}>
      {faqText.map((item, index) => (
        <Text key={item} style={styles.faq}>{index + 1}. {item}</Text>
      ))}
    </View>
  );
}

export function PersonalDataContent({ profile, onEdit }: { profile: UserProfile | null; onEdit: () => void }) {
  const rows = [
    ["Full Name", profile?.name || `${profile?.firstName ?? ""} ${profile?.lastName ?? ""}`.trim()],
    ["Gender", profile?.gender],
    ["Height", profile?.height ? `${profile.height} cm` : undefined],
    ["Current Weight", profile?.currentWeight ? `${profile.currentWeight} kg` : undefined],
    ["Target Weight", profile?.targetWeight ? `${profile.targetWeight} kg` : undefined],
    ["Diet Type", profile?.dietType]
  ];

  return (
    <View>
      <View style={styles.greenPanel}>
        {rows.map(([label, value]) => <InfoRow key={label} label={label ?? ""} value={value || "Not set"} />)}
      </View>
      <Pressable style={styles.primaryButton} onPress={onEdit}>
        <Text style={styles.primaryText}>Edit Data</Text>
      </Pressable>
    </View>
  );
}

export function BodyMetricsContent({ profile }: { profile: UserProfile | null }) {
  const weight = profile?.currentWeight ?? 0;
  const height = profile?.height ?? 0;
  const bmi = calculateBMI(weight, height);
  const bmr = calculateBMR({ weight, height, age: 25, gender: profile?.gender });
  const tdee = calculateTDEE(bmr, profile?.activityLevel);
  return (
    <View style={styles.card}>
      <InfoRow label="BMI" value={bmi ? bmi.toFixed(1) : "--"} />
      <InfoRow label="BMR" value={bmr ? `${Math.round(bmr)} kcal` : "--"} />
      <InfoRow label="TDEE" value={tdee ? `${Math.round(tdee)} kcal` : "--"} />
      <InfoRow label="Activity" value={profile?.activityLevel ?? "Not set"} />
    </View>
  );
}

export function CalorieCounterContent({ profile }: { profile: UserProfile | null }) {
  return (
    <View style={styles.card}>
      <InfoRow label="Consumed Calories" value={`${Math.round(profile?.consumedCalories ?? 0)} kcal`} />
      <InfoRow label="Carbs" value={`${Math.round(profile?.carbs ?? 0)} g`} />
      <InfoRow label="Protein" value={`${Math.round(profile?.protein ?? 0)} g`} />
      <InfoRow label="Fat" value={`${Math.round(profile?.fat ?? 0)} g`} />
    </View>
  );
}

function UserLine({ user }: { user: User }) {
  return (
    <View style={styles.userLine}>
      <Image source={{ uri: user.photoURL || "https://via.placeholder.com/150" }} style={styles.userAvatar} />
      <View>
        <Text style={styles.userName}>{user.displayName || "User"}</Text>
        <Text style={styles.userEmail}>{user.email}</Text>
      </View>
    </View>
  );
}

function PlanOption(props: { selected: boolean; best?: boolean; title: string; price: string; subtitle: string; onPress: () => void }) {
  return (
    <Pressable style={[styles.plan, props.selected && styles.planSelected]} onPress={props.onPress}>
      {props.best ? <Text style={styles.best}>BEST VALUE</Text> : null}
      <View>
        <Text style={styles.planTitle}>{props.title}</Text>
        <Text style={styles.userEmail}>{props.subtitle}</Text>
      </View>
      <Text style={styles.price}>{props.price}</Text>
    </Pressable>
  );
}

function Toggle({ title, subtitle, value, onValueChange }: { title: string; subtitle: string; value: boolean; onValueChange: (next: boolean) => void }) {
  return (
    <View style={styles.toggle}>
      <View style={styles.toggleText}>
        <Text style={styles.planTitle}>{title}</Text>
        <Text style={styles.userEmail}>{subtitle}</Text>
      </View>
      <Switch value={value} onValueChange={onValueChange} trackColor={{ true: colors.primary }} />
    </View>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  userLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 24
  },
  userAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.border
  },
  userName: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  userEmail: {
    color: colors.textMuted,
    fontSize: 13,
    marginTop: 2
  },
  sparkle: {
    width: 78,
    height: 78,
    borderRadius: 39,
    backgroundColor: `${colors.primary}22`,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center"
  },
  bigCenter: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    lineHeight: 31,
    textAlign: "center",
    marginVertical: 24
  },
  plan: {
    borderRadius: 20,
    borderWidth: 2,
    borderColor: colors.border,
    padding: 18,
    marginBottom: 15,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  planSelected: {
    borderColor: colors.primary,
    backgroundColor: `${colors.primary}18`
  },
  best: {
    position: "absolute",
    top: -12,
    left: 20,
    backgroundColor: colors.primary,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 4,
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 10
  },
  planTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  price: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 23
  },
  primaryButton: {
    minHeight: 55,
    borderRadius: 30,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 18
  },
  primaryText: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 18
  },
  summary: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    marginBottom: 18
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: colors.border
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 10
  },
  greenText: {
    color: colors.primary,
    fontWeight: "900"
  },
  input: {
    minHeight: 54,
    borderRadius: 16,
    backgroundColor: colors.muted,
    paddingHorizontal: 14,
    color: colors.text,
    marginTop: 12
  },
  paymentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  paymentLogo: {
    width: "30%",
    minHeight: 58,
    borderRadius: 15,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center"
  },
  paymentLogoText: {
    color: colors.blue,
    fontWeight: "900"
  },
  toggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  toggleText: {
    flex: 1,
    paddingRight: 12
  },
  contactTitle: {
    color: colors.danger,
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center"
  },
  contactSubtitle: {
    color: colors.text,
    fontSize: 20,
    textAlign: "center",
    marginTop: 5,
    marginBottom: 15
  },
  message: {
    minHeight: 160,
    textAlignVertical: "top",
    paddingTop: 14
  },
  faq: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 26,
    marginBottom: 14
  },
  greenPanel: {
    backgroundColor: "#DEF0D5",
    borderRadius: 15,
    padding: 12
  },
  infoRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  infoLabel: {
    color: colors.text,
    fontWeight: "900"
  },
  infoValue: {
    color: colors.textMuted,
    marginTop: 4
  }
});
