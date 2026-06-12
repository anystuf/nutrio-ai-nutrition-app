import { FontAwesome } from "@expo/vector-icons";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { auth, db } from "@/config/firebase";
import { signInWithGoogleAccount } from "@/services/googleAuth";
import { colors } from "@/theme/colors";






export function SignupScreen({ onLogin, onDone }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  async function submit() {
    setErrorMessage("");
    if (!email.trim() || !password || password !== confirm || !agreeToTerms) {
      showError("Use a valid email, matching password, and agree to the terms.");
      return;
    }
    if (password.length < 6) {
      showError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, "users", result.user.uid), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        uid: result.user.uid,
        imageurl: "https://via.placeholder.com/150",
        onboardingCompleted: false,
        createdAt: serverTimestamp()
      });
      onDone();
    } catch (error) {
      showError(toSignupErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }

  function showError(message) {
    setErrorMessage(message);
    Alert.alert("Sign up failed", message);
  }

  async function submitGoogle() {
    setErrorMessage("");
    setLoading(true);
    try {
      await signInWithGoogleAccount();
      onDone();
    } catch (error) {
      showError(error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Join Nutrio Today</Text>
      <Text style={styles.subtitle}>Create an account to track nutrition, meals, and training.</Text>
      <View style={styles.form}>
        <TextField label="First name" icon="person-outline" value={firstName} onChangeText={setFirstName} />
        <TextField label="Last name" icon="person-outline" value={lastName} onChangeText={setLastName} />
        <TextField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} password />
        <TextField label="Confirm password" icon="lock-closed-outline" value={confirm} onChangeText={setConfirm} password />
        <Pressable style={styles.termsRow} onPress={() => setAgreeToTerms((value) => !value)}>
          <View style={[styles.checkbox, agreeToTerms && styles.checkboxActive]} />
          <Text style={styles.termsText}>I agree with the Terms & Conditions</Text>
        </Pressable>
        {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}
        <Button onPress={submit} disabled={loading}>{loading ? "Creating..." : "Sign up"}</Button>
      </View>
      <SocialLoginRow disabled={loading} onGoogle={() => void submitGoogle()} />
      <Button variant="ghost" onPress={onLogin}>Already have an account? Sign in</Button>
    </Screen>);

}

function SocialLoginRow({ disabled, onGoogle }) {
  return (
    <View style={styles.socialWrap}>
      <View style={styles.dividerRow}>
        <View style={styles.divider} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.divider} />
      </View>
      <View style={styles.socialRow}>
        <SocialButton disabled={disabled} icon="google" color="#DB4437" onPress={onGoogle} />
        <SocialButton disabled={disabled} icon="twitter" color="#111111" onPress={() => Alert.alert("Coming soon", "X sign-in is not wired in the Dart version either.")} />
        <SocialButton disabled={disabled} icon="facebook" color="#1E5AA8" onPress={() => Alert.alert("Coming soon", "Facebook sign-in is not wired in the Dart version either.")} />
      </View>
    </View>);

}

function SocialButton(props) {
  return (
    <Pressable disabled={props.disabled} onPress={props.onPress} style={({ pressed }) => [styles.socialButton, pressed && styles.socialPressed]}>
      <FontAwesome name={props.icon} size={24} color={props.color} />
    </Pressable>);

}

const styles = StyleSheet.create({
  title: {
    marginTop: 20,
    color: colors.text,
    fontSize: 32,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22
  },
  form: {
    marginTop: 28
  },
  termsRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 16
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: colors.border
  },
  checkboxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  termsText: {
    flex: 1,
    color: colors.text,
    fontSize: 13
  },
  error: {
    marginBottom: 14,
    color: colors.danger,
    fontWeight: "800",
    lineHeight: 20
  },
  socialWrap: {
    marginTop: 28,
    marginBottom: 12
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.border
  },
  dividerText: {
    color: colors.textMuted,
    fontSize: 13
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: 24
  },
  socialButton: {
    minWidth: 72,
    minHeight: 50,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  socialPressed: {
    opacity: 0.78
  }
});

function toSignupErrorMessage(error) {
  const message = error instanceof Error ? error.message : "Please try again.";

  if (message.includes("auth/email-already-in-use")) return "This email is already registered. Please sign in instead.";
  if (message.includes("auth/invalid-email")) return "The email address is invalid.";
  if (message.includes("auth/weak-password")) return "Password must be at least 6 characters.";
  if (message.includes("auth/operation-not-allowed")) {
    return "Email/password sign-up is disabled in Firebase Authentication. Enable Email/Password provider in Firebase Console.";
  }
  if (message.includes("auth/unauthorized-domain")) {
    return "This domain is not authorized in Firebase Authentication. Add 127.0.0.1 to Authorized domains.";
  }

  return message;
}
