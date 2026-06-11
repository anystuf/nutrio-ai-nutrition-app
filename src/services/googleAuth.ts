import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";
import { getAdditionalUserInfo, GoogleAuthProvider, signInWithCredential, signInWithPopup, User } from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Platform } from "react-native";
import { auth, db } from "@/config/firebase";

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogleAccount() {
  if (Platform.OS === "web") {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    const credential = await signInWithPopup(auth, provider);
    await ensureGoogleUserDocument(credential.user, getAdditionalUserInfo(credential)?.isNewUser === true);
    return credential.user;
  }

  const idToken = await requestNativeGoogleIdToken();
  const credential = GoogleAuthProvider.credential(idToken);
  const result = await signInWithCredential(auth, credential);
  await ensureGoogleUserDocument(result.user, getAdditionalUserInfo(result)?.isNewUser === true);
  return result.user;
}

async function requestNativeGoogleIdToken() {
  const clientId = Platform.OS === "ios"
    ? process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID
    : process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

  if (!clientId) {
    throw new Error("Missing native Google client ID. Set EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID or EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID before building the native app.");
  }

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: process.env.EXPO_PUBLIC_AUTH_SCHEME || "nutrio"
  } as AuthSession.AuthSessionRedirectUriOptions);

  const request = new AuthSession.AuthRequest({
    clientId,
    redirectUri,
    scopes: ["openid", "profile", "email"],
    responseType: AuthSession.ResponseType.IdToken,
    extraParams: {
      nonce: Math.random().toString(36).slice(2)
    }
  });

  const result = await request.promptAsync({
    authorizationEndpoint: "https://accounts.google.com/o/oauth2/v2/auth"
  });

  if (result.type !== "success") {
    throw new Error(result.type === "cancel" ? "Google Sign-In was cancelled." : "Google Sign-In did not complete.");
  }

  const idToken = result.params.id_token;
  if (!idToken) throw new Error("Google did not return an ID token.");
  return idToken;
}

async function ensureGoogleUserDocument(user: User, forceCreate: boolean) {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);
  if (snapshot.exists() && !forceCreate) return snapshot;

  const [firstName = "", ...rest] = (user.displayName || "").trim().split(/\s+/);
  const lastName = rest.join(" ");
  await setDoc(userRef, {
    uid: user.uid,
    email: user.email,
    name: user.displayName || "",
    firstName,
    lastName,
    "first name": firstName,
    "last name": lastName,
    imageurl: user.photoURL || "",
    onboardingCompleted: snapshot.exists() ? snapshot.data().onboardingCompleted === true : false,
    createdAt: snapshot.exists() ? snapshot.data().createdAt ?? serverTimestamp() : serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  return getDoc(userRef);
}
