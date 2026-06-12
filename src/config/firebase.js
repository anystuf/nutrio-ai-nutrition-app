import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { currentFirebaseOptions } from "@/config/firebaseOptions";

export const app = getApps().length ? getApps()[0] : initializeApp(currentFirebaseOptions);

export const auth = getAuth(app);

export const db = getFirestore(app);
