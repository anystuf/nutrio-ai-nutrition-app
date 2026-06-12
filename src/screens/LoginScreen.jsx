import { FontAwesome } from "@expo/vector-icons";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/Button";
import { Screen } from "@/components/Screen";
import { TextField } from "@/components/TextField";
import { auth, db } from "@/config/firebase";
import { signInWithGoogleAccount } from "@/services/googleAuth";
import { colors } from "@/theme/colors";







export function LoginScreen({ onSignup, onForgotPassword, onDone }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    if (!email.trim() || !password.trim()) {
      Alert.alert("Missing info", "Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email.trim(), password);
      const snap = await getDoc(doc(db, "users", result.user.uid));
      onDone();
      if (!snap.exists() || snap.data().onboardingCompleted !== true) {
        Alert.alert("Profile setup", "Please finish the Nutrio onboarding flow.");
      }
    } catch (error) {
      Alert.alert("Sign in failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function submitGoogle() {
    setLoading(true);
    try {
      const googleUser = await signInWithGoogleAccount();
      const snap = await getDoc(doc(db, "users", googleUser.uid));
      onDone();
      if (!snap.exists() || snap.data().onboardingCompleted !== true) {
        Alert.alert("Profile setup", "Please finish the Nutrio onboarding flow.");
      }
    } catch (error) {
      Alert.alert("Google Sign-In failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen scroll>
      <Text style={styles.title}>Welcome Back!</Text>
      <Text style={styles.subtitle}>Sign in to continue your journey towards a healthier you.</Text>
      <View style={styles.form}>
        <TextField label="Email" icon="mail-outline" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        <TextField label="Password" icon="lock-closed-outline" value={password} onChangeText={setPassword} password />
        <View style={styles.loginOptions}>
          <Pressable style={styles.remember} onPress={() => setRememberMe((value) => !value)}>
            <View style={[styles.checkbox, rememberMe && styles.checkboxActive]} />
            <Text style={styles.optionText}>Remember me</Text>
          </Pressable>
          <Pressable onPress={onForgotPassword}>
            <Text style={styles.forgot}>Forgot Password?</Text>
          </Pressable>
        </View>
        <Button onPress={submit} disabled={loading}>{loading ? "Signing in..." : "Sign in"}</Button>
      </View>
      <SocialLoginRow disabled={loading} onGoogle={() => void submitGoogle()} />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Do not have an account?</Text>
        <Button variant="ghost" onPress={onSignup}>Sign up</Button>
      </View>
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
    marginTop: 34,
    color: colors.text,
    fontSize: 34,
    fontWeight: "900"
  },
  subtitle: {
    marginTop: 8,
    color: colors.textMuted,
    fontSize: 16,
    lineHeight: 22
  },
  form: {
    marginTop: 34
  },
  loginOptions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18
  },
  remember: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
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
  optionText: {
    color: colors.text,
    fontSize: 14
  },
  forgot: {
    color: colors.primaryDark,
    fontWeight: "900"
  },
  socialWrap: {
    marginTop: 28
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
    minWidth: 76,
    minHeight: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surface
  },
  socialPressed: {
    opacity: 0.78
  },
  footer: {
    marginTop: 26,
    alignItems: "center"
  },
  footerText: {
    color: colors.textMuted
  }
});
