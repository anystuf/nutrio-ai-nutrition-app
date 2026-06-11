import { User } from "firebase/auth";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { db } from "@/config/firebase";
import { deleteFoodLogItem, updateFoodLogItem } from "@/services/mealLog";
import { colors } from "@/theme/colors";
import { AppRoute, MealType } from "@/types";

type HistoryItem = {
  id: string;
  label: string;
  kcal: number;
  carbs?: number;
  protein?: number;
  fat?: number;
  image?: string;
  serving?: string;
  source?: string;
  portion?: number;
  baseKcal?: number;
  baseCarbs?: number;
  baseProtein?: number;
  baseFat?: number;
};

type Props = {
  user: User;
  mealType: MealType;
  onNavigate: (route: AppRoute) => void;
};

type EditForm = {
  portion: string;
};

export function MealDetailScreen({ user, mealType, onNavigate }: Props) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [editingItem, setEditingItem] = useState<HistoryItem | null>(null);
  const [form, setForm] = useState<EditForm>({ portion: "1" });
  const [saving, setSaving] = useState(false);
  const todayId = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const ref = collection(db, "users", user.uid, "meal_history");
    const q = query(ref, orderBy("timestamp", "desc"));
    return onSnapshot(q, (snap) => {
      setItems(snap.docs
        .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() } as HistoryItem & { date?: string; mealType?: string }))
        .filter((item) => item.date === todayId && item.mealType === mealType));
    });
  }, [mealType, todayId, user.uid]);

  const totals = useMemo(() => items.reduce((acc, item) => ({
    kcal: acc.kcal + Number(item.kcal || 0),
    carbs: acc.carbs + Number(item.carbs || 0),
    protein: acc.protein + Number(item.protein || 0),
    fat: acc.fat + Number(item.fat || 0)
  }), { kcal: 0, carbs: 0, protein: 0, fat: 0 }), [items]);

  function openEditor(item: HistoryItem) {
    setEditingItem(item);
    setForm({
      portion: formatNumber(getItemPortion(item))
    });
  }

  async function saveEdit() {
    if (!editingItem) return;
    const portion = parseNumber(form.portion);
    if (portion <= 0) {
      Alert.alert("Invalid portion", "Portion must be greater than 0. Example: 0.5, 1, 2.");
      return;
    }
    const base = getBaseNutrition(editingItem);

    const next = {
      label: editingItem.label,
      kcal: roundMacro(base.kcal * portion),
      carbs: roundMacro(base.carbs * portion),
      protein: roundMacro(base.protein * portion),
      fat: roundMacro(base.fat * portion),
      image: editingItem.image || "",
      serving: `${formatNumber(portion)} portion(s)`,
      source: editingItem.source || "",
      portion,
      baseKcal: base.kcal,
      baseCarbs: base.carbs,
      baseProtein: base.protein,
      baseFat: base.fat
    };

    setSaving(true);
    try {
      await updateFoodLogItem(user.uid, editingItem.id, editingItem, next, mealType);
      setEditingItem(null);
      Alert.alert("Updated", "Meal portion was updated.");
    } catch (error) {
      Alert.alert("Update failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteEdit() {
    if (!editingItem) return;
    setSaving(true);
    try {
      await deleteFoodLogItem(user.uid, editingItem.id, editingItem, mealType);
      setEditingItem(null);
      Alert.alert("Deleted", "Meal item was removed.");
    } catch (error) {
      Alert.alert("Delete failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Screen scroll>
      <Header title={mealType} subtitle={`${todayId} meal history`} onBack={() => onNavigate({ name: "main" })} />
      <View style={styles.summary}>
        <Metric label="Calories" value={`${Math.round(totals.kcal)}`} />
        <Metric label="Carbs" value={`${Math.round(totals.carbs)}g`} />
        <Metric label="Protein" value={`${Math.round(totals.protein)}g`} />
        <Metric label="Fat" value={`${Math.round(totals.fat)}g`} />
      </View>
      <Button onPress={() => onNavigate({ name: "search", mealType })}>Add food</Button>
      <Text style={styles.section}>Logged foods</Text>
      {items.length === 0 ? <Text style={styles.empty}>No foods logged yet.</Text> : null}
      {items.map((item) => (
        <Pressable key={item.id} style={styles.row} onPress={() => openEditor(item)}>
          <View style={styles.rowMain}>
            <Text style={styles.title}>{item.label}</Text>
            <Text style={styles.portion}>{formatNumber(getItemPortion(item))} portion(s)</Text>
            <Text style={styles.sub}>C {Math.round(item.carbs || 0)}g / P {Math.round(item.protein || 0)}g / F {Math.round(item.fat || 0)}g</Text>
          </View>
          <View style={styles.rowSide}>
            <Text style={styles.kcal}>{Math.round(item.kcal || 0)} kcal</Text>
            <Text style={styles.editHint}>Edit</Text>
          </View>
        </Pressable>
      ))}

      <Modal visible={Boolean(editingItem)} transparent animationType="fade" onRequestClose={() => setEditingItem(null)}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Edit portion</Text>
            {editingItem ? <Text style={styles.modalSubtitle}>{editingItem.label}</Text> : null}
            <Field label="How many portions did you eat?" value={form.portion} keyboardType="numeric" onChangeText={(value) => setForm({ portion: value })} />
            {editingItem ? <NutritionPreview item={editingItem} portion={parseNumber(form.portion)} /> : null}

            <View style={styles.modalActions}>
              <Button variant="ghost" onPress={() => setEditingItem(null)} disabled={saving} style={styles.modalButton}>Cancel</Button>
              <Button onPress={() => void saveEdit()} disabled={saving} style={styles.modalButton}>{saving ? "Saving..." : "Save"}</Button>
            </View>
            <Button variant="danger" onPress={() => void deleteEdit()} disabled={saving}>Delete item</Button>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function Field(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  keyboardType?: "default" | "numeric";
  compact?: boolean;
}) {
  return (
    <View style={props.compact ? styles.fieldCompact : styles.field}>
      <Text style={styles.fieldLabel}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        keyboardType={props.keyboardType}
        style={styles.input}
        placeholderTextColor="#8D988D"
      />
    </View>
  );
}

function NutritionPreview({ item, portion }: { item: HistoryItem; portion: number }) {
  const safePortion = Number.isFinite(portion) && portion > 0 ? portion : 0;
  const base = getBaseNutrition(item);
  const next = {
    kcal: base.kcal * safePortion,
    carbs: base.carbs * safePortion,
    protein: base.protein * safePortion,
    fat: base.fat * safePortion
  };

  return (
    <View style={styles.preview}>
      <Text style={styles.previewTitle}>Nutrition preview</Text>
      <Text style={styles.previewText}>Base: {Math.round(base.kcal)} kcal / portion</Text>
      <View style={styles.previewGrid}>
        <Metric label="Calories" value={`${Math.round(next.kcal)}`} />
        <Metric label="Carbs" value={`${Math.round(next.carbs)}g`} />
        <Metric label="Protein" value={`${Math.round(next.protein)}g`} />
        <Metric label="Fat" value={`${Math.round(next.fat)}g`} />
      </View>
    </View>
  );
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function getItemPortion(item: HistoryItem) {
  const explicit = Number(item.portion);
  if (Number.isFinite(explicit) && explicit > 0) return explicit;
  const match = String(item.serving || "").match(/(\d+(?:[.,]\d+)?)/);
  if (!match) return 1;
  const parsed = Number(match[1].replace(",", "."));
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

function getBaseNutrition(item: HistoryItem) {
  const portion = getItemPortion(item);
  return {
    kcal: numberOrFallback(item.baseKcal, Number(item.kcal || 0) / portion),
    carbs: numberOrFallback(item.baseCarbs, Number(item.carbs || 0) / portion),
    protein: numberOrFallback(item.baseProtein, Number(item.protein || 0) / portion),
    fat: numberOrFallback(item.baseFat, Number(item.fat || 0) / portion)
  };
}

function numberOrFallback(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function roundMacro(value: number) {
  return Math.round(value * 10) / 10;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "1";
  return Number.isInteger(value) ? String(value) : String(Math.round(value * 100) / 100);
}

const styles = StyleSheet.create({
  summary: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 16
  },
  metric: {
    width: "47%",
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14
  },
  metricValue: {
    color: colors.primaryDark,
    fontSize: 24,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.textMuted,
    fontWeight: "800"
  },
  section: {
    marginTop: 22,
    marginBottom: 10,
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  empty: {
    color: colors.textMuted,
    textAlign: "center",
    padding: 20
  },
  row: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  rowMain: {
    flex: 1
  },
  rowSide: {
    alignItems: "flex-end",
    gap: 5
  },
  title: {
    color: colors.text,
    fontWeight: "900"
  },
  sub: {
    color: colors.textMuted,
    marginTop: 4,
    fontSize: 12
  },
  portion: {
    color: colors.primary,
    marginTop: 4,
    fontSize: 12,
    fontWeight: "900"
  },
  kcal: {
    color: colors.primaryDark,
    fontWeight: "900"
  },
  editHint: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  modalCard: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 18,
    backgroundColor: colors.surface,
    padding: 18,
    gap: 12
  },
  modalTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontWeight: "800"
  },
  field: {
    gap: 6
  },
  fieldCompact: {
    width: "47%",
    gap: 6
  },
  fieldLabel: {
    color: colors.textMuted,
    fontWeight: "800",
    fontSize: 12
  },
  input: {
    minHeight: 46,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    color: colors.text,
    fontWeight: "700"
  },
  formGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  preview: {
    borderRadius: 14,
    backgroundColor: colors.muted,
    padding: 12,
    gap: 8
  },
  previewTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  previewText: {
    color: colors.textMuted,
    fontWeight: "700"
  },
  previewGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10
  },
  modalActions: {
    flexDirection: "row",
    gap: 10
  },
  modalButton: {
    flex: 1
  }
});
