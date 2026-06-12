import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { auth, db } from "@/config/firebase";
import { MainNavigator } from "@/screens/MainNavigator";
import { IntroScreen } from "@/screens/IntroScreen";
import { LoginScreen } from "@/screens/LoginScreen";
import { SignupScreen } from "@/screens/SignupScreen";
import { ForgotPasswordScreen } from "@/screens/ForgotPasswordScreen";
import { OnboardingScreen } from "@/screens/OnboardingScreen";
import { colors } from "@/theme/colors";


export default function App() {
  const [screen, setScreen] = useState("intro");
  const [user, setUser] = useState(null);
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    return onAuthStateChanged(auth, async (nextUser) => {
      setUser(nextUser);
      if (!nextUser) {
        setScreen("intro");
        setBooting(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", nextUser.uid));
      setScreen(snap.exists() && snap.data().onboardingCompleted === true ? "main" : "onboarding");
      setBooting(false);
    });
  }, []);

  let content = null;

  if (booting) {
    content =
    <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Nutrio...</Text>
      </View>;

  } else if (screen === "login") {
    content = <LoginScreen onSignup={() => setScreen("signup")} onForgotPassword={() => setScreen("forgotPassword")} onDone={() => setScreen("main")} />;
  } else if (screen === "signup") {
    content = <SignupScreen onLogin={() => setScreen("login")} onDone={() => setScreen("onboarding")} />;
  } else if (screen === "forgotPassword") {
    content = <ForgotPasswordScreen onBack={() => setScreen("login")} />;
  } else if (screen === "onboarding" && user) {
    content = <OnboardingScreen user={user} onDone={() => setScreen("main")} />;
  } else if (screen === "main" && user) {
    content = <MainNavigator user={user} />;
  } else {
    content = <IntroScreen onLogin={() => setScreen("login")} onSignup={() => setScreen("signup")} />;
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      {content}
    </SafeAreaProvider>);

}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    gap: 12
  },
  loadingText: {
    color: colors.textMuted,
    fontWeight: "700"
  }
});
