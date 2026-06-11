import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query as firestoreQuery } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Alert, Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/Button";
import { FavoriteButton } from "@/components/FavoriteButton";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import { normalizeFoodSearch, searchEdamamFoods, searchLocalFoods } from "@/services/foodSearch";
import { addFoodToDiary } from "@/services/mealLog";
import { colors } from "@/theme/colors";
import { AppRoute, FoodItem, MealType } from "@/types";

type Props = {
  user: User;
  mealType?: MealType;
  onNavigate: (route: AppRoute) => void;
};

type SearchTab = "recent" | "favorites" | "personal";

const tabs: Array<{ key: SearchTab; label: string }> = [
  { key: "recent", label: "Recent" },
  { key: "favorites", label: "Favorites" },
  { key: "personal", label: "Personal" }
];

export function SearchScreen({ user, mealType = "Lunch", onNavigate }: Props) {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<SearchTab>("recent");
  const [saving, setSaving] = useState(false);
  const [selectedFoods, setSelectedFoods] = useState<FoodItem[]>([]);
  const [personalFoods, setPersonalFoods] = useState<FoodItem[]>([]);
  const [favoriteFoods, setFavoriteFoods] = useState<FoodItem[]>([]);
  const [apiFoods, setApiFoods] = useState<FoodItem[]>([]);
  const [apiLoading, setApiLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "personal_foods");
    const q = firestoreQuery(ref, orderBy("createdAt", "desc"));
    return onSnapshot(q, (snap) => {
      setPersonalFoods(snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return toFoodItem({
          label: data.label,
          kcal: data.kcal ?? data.calories,
          carbs: data.carbs,
          protein: data.protein,
          fat: data.fat,
          serving: `${data.serving ?? 100}g`,
          image: data.image,
          source: "Personal"
        });
      }));
    });
  }, [user.uid]);

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "favorites");
    const q = firestoreQuery(ref, orderBy("savedAt", "desc"));
    return onSnapshot(q, (snap) => {
      setFavoriteFoods(snap.docs.map((docSnap) => {
        const data = docSnap.data();
        return toFoodItem({
          label: data.label,
          kcal: data.kcal,
          carbs: data.carbs,
          protein: data.protein,
          fat: data.fat,
          serving: data.serving ?? "1 serving",
          image: data.image,
          source: "Favorite"
        });
      }));
    });
  }, [user.uid]);

  const localResults = useMemo(() => searchLocalFoods(query, []), [query]);

  useEffect(() => {
    const clean = query.trim();
    const normalized = normalizeFoodSearch(clean);
    setApiError("");

    if (normalized.length < 2) {
      setApiFoods([]);
      setApiLoading(false);
      return;
    }

    let cancelled = false;
    const timer = setTimeout(() => {
      setApiLoading(true);
      searchEdamamFoods(clean)
        .then((foods) => {
          if (!cancelled) setApiFoods(foods);
        })
        .catch((error) => {
          if (!cancelled) {
            setApiFoods([]);
            setApiError(error instanceof Error ? error.message : "Food API unavailable.");
          }
        })
        .finally(() => {
          if (!cancelled) setApiLoading(false);
        });
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  const recentResults = useMemo(() => dedupeFoods([...localResults, ...apiFoods]), [apiFoods, localResults]);
  const visibleFoods = useMemo(() => {
    const normalized = normalizeFoodSearch(query);
    const source = tab === "recent" ? recentResults : tab === "favorites" ? favoriteFoods : personalFoods;
    if (!normalized || tab === "recent") return source;
    return source.filter((food) => normalizeFoodSearch(`${food.label} ${food.serving} ${food.tags.join(" ")}`).includes(normalized));
  }, [favoriteFoods, personalFoods, query, recentResults, tab]);

  const selectedTotal = selectedFoods.reduce((sum, food) => sum + Number(food.kcal || 0), 0);

  function toggleSelected(food: FoodItem) {
    setSelectedFoods((current) => {
      const exists = current.some((item) => foodKey(item) === foodKey(food));
      return exists ? current.filter((item) => foodKey(item) !== foodKey(food)) : [...current, food];
    });
  }

  async function addSelected() {
    if (selectedFoods.length === 0) return;
    setSaving(true);
    try {
      for (const food of selectedFoods) {
        await addFoodToDiary(user.uid, food, mealType);
      }
      Alert.alert("Added", `${selectedFoods.length} item(s) added to ${mealType}.`);
      setSelectedFoods([]);
      onNavigate({ name: "main" });
    } catch (error) {
      Alert.alert("Could not add food", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.root}>
      <Screen scroll style={selectedFoods.length > 0 ? styles.screenWithBar : undefined}>
        <Header title={mealType} subtitle="Food search" onBack={() => onNavigate({ name: "main" })} />

        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search (e.g., Chicken)"
            placeholderTextColor="#8D988D"
            style={styles.input}
            autoCapitalize="none"
            returnKeyType="search"
          />
          <Pressable onPress={() => onNavigate({ name: "scanFood", mealType })} hitSlop={8}>
            <Ionicons name="sparkles" size={20} color={colors.blue} />
          </Pressable>
          <Pressable onPress={() => onNavigate({ name: "scanFood", mealType })} hitSlop={8}>
            <Ionicons name="qr-code-outline" size={21} color={colors.textMuted} />
          </Pressable>
        </View>

        <View style={styles.quickActions}>
          <Pressable style={styles.actionButton} onPress={() => onNavigate({ name: "quickLog", mealType })}>
            <Ionicons name="flash" size={18} color={colors.text} />
            <Text style={styles.actionText}>Quick Log</Text>
          </Pressable>
          <Pressable style={styles.actionButton} onPress={() => onNavigate({ name: "createFood" })}>
            <Ionicons name="add-circle-outline" size={18} color={colors.text} />
            <Text style={styles.actionText}>Create Food</Text>
          </Pressable>
        </View>

        <View style={styles.tabs}>
          {tabs.map((item) => {
            const active = item.key === tab;
            return (
              <Pressable key={item.key} style={styles.tab} onPress={() => setTab(item.key)}>
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{item.label}</Text>
                {active ? <View style={styles.tabIndicator} /> : null}
              </Pressable>
            );
          })}
        </View>

        {apiLoading && tab === "recent" ? (
          <View style={styles.apiStatus}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.apiStatusText}>Searching food API...</Text>
          </View>
        ) : null}

        {apiError && tab === "recent" ? <Text style={styles.apiError}>API search: {apiError}</Text> : null}

        {visibleFoods.map((food) => {
          const selected = selectedFoods.some((item) => foodKey(item) === foodKey(food));
          return (
            <Pressable key={foodKey(food)} style={styles.foodRow} onPress={() => onNavigate({ name: "foodDetail", food, mealType })}>
              <Pressable style={styles.selectButton} onPress={() => toggleSelected(food)}>
                <Ionicons name={selected ? "checkmark-circle" : "add-circle-outline"} size={28} color={selected ? colors.primary : colors.textMuted} />
              </Pressable>
              {food.image ? <Image source={{ uri: food.image }} style={styles.foodImage} /> : <View style={styles.foodFallback}><Ionicons name="restaurant" size={23} color={colors.primary} /></View>}
              <View style={styles.foodInfo}>
                <Text style={styles.foodTitle}>{food.label}</Text>
                <Text style={styles.foodSub}>{food.serving} • {Math.round(food.kcal)} kcal{food.source ? ` • ${food.source}` : ""}</Text>
                <Text style={styles.foodMacro}>C {Math.round(food.carbs)}g / P {Math.round(food.protein)}g / F {Math.round(food.fat)}g</Text>
              </View>
              <FavoriteButton user={user} foodData={food} />
              <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
            </Pressable>
          );
        })}

        {visibleFoods.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>{apiLoading ? "Đang tìm món ăn" : tab === "favorites" ? "Chưa có món yêu thích" : "Không tìm thấy món ăn"}</Text>
            <Text style={styles.emptyText}>Thử tìm không dấu: pho, com tam, bun bo, banh mi. Bạn cũng có thể scan barcode hoặc tạo món cá nhân.</Text>
            <Button onPress={() => onNavigate({ name: "createFood" })}>Create Food</Button>
          </View>
        ) : null}
      </Screen>

      {selectedFoods.length > 0 ? (
        <View style={styles.bottomBar}>
          <View>
            <Text style={styles.bottomTotal}>Total: {Math.round(selectedTotal)} kcal</Text>
            <Text style={styles.bottomCount}>{selectedFoods.length} selected</Text>
          </View>
          <Button onPress={() => void addSelected()} disabled={saving} style={styles.bottomButton}>{saving ? "Adding..." : `Add (${selectedFoods.length})`}</Button>
        </View>
      ) : null}
    </View>
  );
}

function toFoodItem(input: Partial<FoodItem> & { label?: unknown; kcal?: unknown; carbs?: unknown; protein?: unknown; fat?: unknown; serving?: unknown; image?: unknown; source?: unknown }): FoodItem {
  return {
    label: String(input.label || "Food"),
    kcal: Number(input.kcal || 0),
    carbs: Number(input.carbs || 0),
    protein: Number(input.protein || 0),
    fat: Number(input.fat || 0),
    serving: String(input.serving || "1 serving"),
    image: String(input.image || ""),
    tags: [String(input.source || "").toLowerCase(), String(input.label || "").toLowerCase()].filter(Boolean),
    source: String(input.source || "")
  };
}

function dedupeFoods(foods: FoodItem[]) {
  const seen = new Set<string>();
  return foods.filter((food) => {
    const key = normalizeFoodSearch(`${food.label}-${food.serving}-${food.kcal}`);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function foodKey(food: FoodItem) {
  return normalizeFoodSearch(`${food.label}-${food.serving}-${food.kcal}-${food.source || ""}`);
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background
  },
  screenWithBar: {
    paddingBottom: 110
  },
  searchBox: {
    minHeight: 56,
    borderRadius: 15,
    backgroundColor: colors.muted,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15
  },
  quickActions: {
    flexDirection: "row",
    gap: 10,
    marginVertical: 12
  },
  actionButton: {
    flex: 1,
    minHeight: 44,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: colors.surface
  },
  actionText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "800"
  },
  tabs: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    marginBottom: 12
  },
  tab: {
    flex: 1,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center"
  },
  tabText: {
    color: colors.textMuted,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.text
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    width: "72%",
    borderRadius: 3,
    backgroundColor: colors.primary
  },
  apiStatus: {
    minHeight: 40,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  apiStatusText: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  apiError: {
    color: colors.danger,
    marginBottom: 10,
    fontWeight: "700"
  },
  foodRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  selectButton: {
    width: 30,
    alignItems: "center"
  },
  foodImage: {
    width: 54,
    height: 54,
    borderRadius: 12
  },
  foodFallback: {
    width: 54,
    height: 54,
    borderRadius: 12,
    backgroundColor: "#ECF7E9",
    alignItems: "center",
    justifyContent: "center"
  },
  foodInfo: {
    flex: 1
  },
  foodTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  foodSub: {
    color: colors.textMuted,
    marginTop: 3,
    fontSize: 12
  },
  foodMacro: {
    color: colors.textMuted,
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700"
  },
  empty: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: colors.border
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 17
  },
  emptyText: {
    color: colors.textMuted,
    lineHeight: 20
  },
  bottomBar: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 20,
    minHeight: 74,
    borderRadius: 20,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 4
  },
  bottomTotal: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  bottomCount: {
    color: colors.textMuted,
    marginTop: 3
  },
  bottomButton: {
    width: 120,
    minHeight: 46
  }
});
