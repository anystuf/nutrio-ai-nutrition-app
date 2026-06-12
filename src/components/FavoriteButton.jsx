import { Ionicons } from "@expo/vector-icons";

import { deleteDoc, doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable } from "react-native";
import { db } from "@/config/firebase";
import { colors } from "@/theme/colors";
















function javaHashCode(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index) | 0;
  }
  return String(hash);
}

export function FavoriteButton({ user, foodData, size = 24 }) {
  const [isLiked, setIsLiked] = useState(false);
  const docId = useMemo(() => javaHashCode(foodData.label), [foodData.label]);

  useEffect(() => {
    let active = true;
    if (!user) {
      setIsLiked(false);
      return () => {
        active = false;
      };
    }

    void getDoc(doc(db, "users", user.uid, "favorites", docId)).then((snapshot) => {
      if (active) setIsLiked(snapshot.exists());
    });

    return () => {
      active = false;
    };
  }, [docId, user]);

  async function toggle() {
    if (!user) {
      Alert.alert("Đăng nhập", "Vui lòng đăng nhập để lưu món ăn.");
      return;
    }

    const next = !isLiked;
    setIsLiked(next);

    try {
      const ref = doc(db, "users", user.uid, "favorites", docId);
      if (next) {
        await setDoc(ref, {
          label: foodData.label,
          kcal: foodData.kcal ?? 0,
          image: foodData.image ?? "",
          protein: foodData.protein ?? 0,
          carbs: foodData.carbs ?? 0,
          fat: foodData.fat ?? 0,
          savedAt: serverTimestamp()
        });
      } else {
        await deleteDoc(ref);
      }
    } catch (error) {
      setIsLiked(!next);
      Alert.alert("Không thể cập nhật", error instanceof Error ? error.message : "Vui lòng thử lại.");
    }
  }

  return (
    <Pressable accessibilityRole="button" onPress={toggle} hitSlop={10}>
      <Ionicons name={isLiked ? "heart" : "heart-outline"} size={size} color={isLiked ? colors.danger : colors.textMuted} />
    </Pressable>);

}
