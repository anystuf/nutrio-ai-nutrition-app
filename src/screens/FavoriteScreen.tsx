import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useState } from "react";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import { addFoodToDiary } from "@/services/mealLog";
import { colors } from "@/theme/colors";
import { AppRoute, FoodLogItem, MealType } from "@/types";

type Props = {
  user: User;
  onNavigate: (route: AppRoute) => void;
};

type FavoriteFood = FoodLogItem & {
  id: string;
};

const meals: Array<{ type: MealType; icon: keyof typeof Ionicons.glyphMap; color: string }> = [
  { type: "Breakfast", icon: "partly-sunny", color: colors.orange },
  { type: "Lunch", icon: "sunny", color: colors.accent },
  { type: "Dinner", icon: "moon", color: colors.blue },
  { type: "Snacks", icon: "fast-food", color: colors.pink }
];

export function FavoriteScreen({ user, onNavigate }: Props) {
  const [foods, setFoods] = useState<FavoriteFood[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "favorites");
    const q = query(ref, orderBy("savedAt", "desc"));
    return onSnapshot(q, (snapshot) => {
      setFoods(snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as FavoriteFood)));
      setLoading(false);
    });
  }, [user.uid]);

  async function add(food: FavoriteFood, mealType: MealType) {
    try {
      await addFoodToDiary(user.uid, food, mealType);
      Alert.alert("Đã thêm", `Đã thêm vào ${mealType}.`);
    } catch (error) {
      Alert.alert("Không thể thêm món", error instanceof Error ? error.message : "Vui lòng thử lại.");
    }
  }

  return (
    <Screen scroll>
      <Header title="Món yêu thích" subtitle="Thêm nhanh vào nhật ký ăn uống" onBack={() => onNavigate({ name: "main" })} />
      {loading ? <Text style={styles.empty}>Đang tải...</Text> : null}
      {!loading && foods.length === 0 ? <Text style={styles.empty}>Chưa có món yêu thích nào.</Text> : null}
      {foods.map((food) => (
        <View key={food.id} style={styles.card}>
          {food.image ? <Image source={{ uri: food.image }} style={styles.image} /> : (
            <View style={styles.imageFallback}>
              <Ionicons name="fast-food" size={26} color={colors.textMuted} />
            </View>
          )}
          <View style={styles.body}>
            <View style={styles.top}>
              <View style={styles.titleWrap}>
                <Text style={styles.title}>{food.label}</Text>
                <Text style={styles.meta}>{Math.round(Number(food.kcal || 0))} kcal</Text>
              </View>
              <FavoriteButton user={user} foodData={food} />
            </View>
            <View style={styles.mealRow}>
              {meals.map((meal) => (
                <Pressable key={meal.type} style={styles.meal} onPress={() => void add(food, meal.type)}>
                  <Ionicons name={meal.icon} color={meal.color} size={16} />
                  <Text style={styles.mealText}>{meal.type}</Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    padding: 28
  },
  card: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 10,
    marginBottom: 12,
    gap: 12
  },
  image: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.border
  },
  imageFallback: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: colors.muted,
    alignItems: "center",
    justifyContent: "center"
  },
  body: {
    flex: 1
  },
  top: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10
  },
  titleWrap: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  meta: {
    color: colors.textMuted,
    marginTop: 4
  },
  mealRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 11
  },
  meal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 6
  },
  mealText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "800"
  }
});
