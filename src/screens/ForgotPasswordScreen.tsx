import { sendPasswordResetEmail } from "firebase/auth";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { auth } from "@/config/firebase";
import { colors } from "@/theme/colors";

type Props = {
  onBack: () => void;
};

export function ForgotPasswordScreen({ onBack }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  async function reset() {
    if (!email.trim()) {
      Alert.alert("Missing email", "Please enter your email address.");
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      Alert.alert("Email Sent", "A reset link has been sent to your inbox.", [{ text: "OK", onPress: onBack }]);
    } catch (error) {
      Alert.alert("Reset failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Pressable onPress={onBack} style={styles.back}>
        <Text style={styles.backText}>←</Text>
      </Pressable>
      <Text style={styles.title}>Forgot Password?</Text>
      <Text style={styles.subtitle}>Please enter your registered email address below. We'll send you a reset link securely.</Text>
      <View style={styles.form}>
        <TextField
          label="Registered Email Address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          placeholder="jarvis.scott@gmail.com"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>
      <View style={styles.footer}>
        <Button onPress={reset} disabled={loading}>{loading ? "Sending..." : "Send Reset Link"}</Button>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8
  },
  backText: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  title: {
    marginTop: 20,
    color: colors.text,
    fontSize: 28,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 12,
    color: colors.textMuted,
    fontSize: 15,
    lineHeight: 22
  },
  form: {
    marginTop: 40
  },
  footer: {
    marginTop: 250
  }
});
