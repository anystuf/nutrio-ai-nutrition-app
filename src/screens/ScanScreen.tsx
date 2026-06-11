import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { User } from "firebase/auth";
import { useRef, useState } from "react";
import { ActivityIndicator, Alert, Image, Platform, Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "@/components/Button";
import { Header } from "@/components/Header";
import { Screen } from "@/components/Screen";
import { identifyFoodsFromImage } from "@/services/gemini";
import { addFoodToDiary } from "@/services/mealLog";
import { analyzeIngredients } from "@/services/nutritionAnalysis";
import { colors } from "@/theme/colors";
import { AppRoute, FoodItem, MealType } from "@/types";

type Props = {
  user: User;
  mealType?: MealType;
  onNavigate?: (route: AppRoute) => void;
};

type OpenFoodFactsResponse = {
  status?: number;
  product?: {
    product_name?: string;
    generic_name?: string;
    serving_size?: string;
    image_front_small_url?: string;
    image_url?: string;
    nutriments?: Record<string, unknown>;
  };
};

export function ScanScreen({ user, mealType = "Lunch", onNavigate }: Props) {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [product, setProduct] = useState<FoodItem | null>(null);
  const [pickedImage, setPickedImage] = useState("");
  const [detectedFoods, setDetectedFoods] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [cameraBlocked, setCameraBlocked] = useState(false);
  const scanLocked = useRef(false);

  async function startBarcodeScanner() {
    setProduct(null);
    setStatus("");
    setCameraBlocked(false);
    scanLocked.current = false;

    const allowed = await ensureCameraPermission();
    if (allowed) setScanning(true);
  }

  async function ensureCameraPermission() {
    if (permission?.granted) return true;

    try {
      const nextPermission = await requestPermission();
      if (nextPermission.granted) {
        setCameraBlocked(false);
        setStatus("");
        return true;
      }

      if (Platform.OS === "web" && typeof navigator !== "undefined" && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach((track) => track.stop());
          setCameraBlocked(false);
          setStatus("");
          return true;
        } catch {
          // Fall through to the guided blocked state below.
        }
      }

      setCameraBlocked(true);
      setStatus(
        Platform.OS === "web"
          ? "Camera permission is blocked in the browser. Allow Camera for 127.0.0.1:8083, then tap Retry camera."
          : "Camera permission was denied. Enable camera permission in device settings, then tap Retry camera."
      );
      return false;
    } catch (error) {
      setCameraBlocked(true);
      setStatus(error instanceof Error ? error.message : "Could not request camera permission.");
      return false;
    }
  }

  async function lookupBarcode(barcode: string) {
    const clean = barcode.trim();
    if (!clean) {
      Alert.alert("Barcode required", "Enter or scan a barcode first.");
      return;
    }

    setBusy(true);
    setStatus("Looking up barcode...");
    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(clean)}.json`);
      const data = await response.json() as OpenFoodFactsResponse;
      if (data.status !== 1 || !data.product) {
        Alert.alert("Not found", "No product information was found for this barcode.");
        return;
      }

      const nutriments = data.product.nutriments ?? {};
      const kcal = numberFrom(nutriments["energy-kcal_serving"], nutriments["energy-kcal_100g"], nutriments["energy-kcal"]);
      const carbs = numberFrom(nutriments.carbohydrates_serving, nutriments.carbohydrates_100g, nutriments.carbohydrates);
      const protein = numberFrom(nutriments.proteins_serving, nutriments.proteins_100g, nutriments.proteins);
      const fat = numberFrom(nutriments.fat_serving, nutriments.fat_100g, nutriments.fat);

      setProduct({
        label: data.product.product_name || data.product.generic_name || "Unknown product",
        kcal: Math.round(kcal),
        carbs: Math.round(carbs),
        protein: Math.round(protein),
        fat: Math.round(fat),
        serving: data.product.serving_size || "100g",
        image: data.product.image_front_small_url || data.product.image_url || "",
        tags: ["barcode", "open-food-facts", clean],
        source: "Open Food Facts"
      });
      setBarcodeInput(clean);
      setDetectedFoods([]);
      setPickedImage("");
      setStatus("Barcode product found.");
    } catch (error) {
      Alert.alert("Lookup failed", error instanceof Error ? error.message : "Please try again.");
      setStatus("Barcode lookup failed. Try manual search or create food.");
    } finally {
      setBusy(false);
      setScanning(false);
      scanLocked.current = false;
    }
  }

  async function saveProduct() {
    if (!product) return;
    setBusy(true);
    try {
      await addFoodToDiary(user.uid, product, mealType);
      Alert.alert("Saved", `${product.label} was added to ${mealType}.`);
      setProduct(null);
      setDetectedFoods([]);
      setPickedImage("");
      setStatus("Saved to diary.");
    } catch (error) {
      Alert.alert("Save failed", error instanceof Error ? error.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function pickFoodImage(source: "camera" | "gallery") {
    setBusy(true);
    setProduct(null);
    setDetectedFoods([]);
    setStatus(source === "camera" ? "Opening camera..." : "Opening gallery...");

    try {
      if (source === "camera") {
        const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
        if (!cameraPermission.granted) {
          setStatus("Camera permission was denied.");
          return;
        }
      }

      const result = source === "camera"
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.85, base64: true })
        : await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.85, base64: true });

      if (result.canceled) {
        setStatus("");
        return;
      }

      const asset = result.assets[0];
      if (!asset.base64) throw new Error("Could not read image data.");

      setPickedImage(asset.uri);
      setStatus("Detecting foods with Gemini...");

      const foods = await identifyFoodsFromImage(asset.base64, asset.mimeType || "image/jpeg");
      if (foods.length === 0) {
        Alert.alert("No food detected", "Please choose a clearer food photo.");
        setStatus("No food detected.");
        return;
      }

      setDetectedFoods(foods);
      setStatus("Tap a detected food to estimate nutrition.");
    } catch (error) {
      Alert.alert("AI scan failed", error instanceof Error ? error.message : "Please try again.");
      setStatus("AI scan failed.");
    } finally {
      setBusy(false);
    }
  }

  async function selectDetectedFood(foodName: string) {
    setBusy(true);
    setStatus(`Estimating nutrition for ${foodName}...`);
    try {
      const nutrition = await analyzeIngredients([foodName]);
      if (nutrition.kcal === 0 && nutrition.protein === 0) {
        Alert.alert("Nutrition not found", `Could not find nutrition data for "${foodName}". Try a clearer name or create food manually.`);
        setStatus("Nutrition lookup returned no data.");
        return;
      }

      setProduct({
        label: foodName,
        kcal: Math.round(nutrition.kcal),
        carbs: Math.round(nutrition.carbs),
        protein: Math.round(nutrition.protein),
        fat: Math.round(nutrition.fat),
        serving: "AI estimate",
        image: pickedImage,
        tags: ["ai", "gemini", "edamam"],
        source: "Gemini + Edamam"
      });
      setStatus("Nutrition estimate ready.");
    } catch (error) {
      Alert.alert("Nutrition failed", error instanceof Error ? error.message : "Please try again.");
      setStatus("Nutrition lookup failed.");
    } finally {
      setBusy(false);
    }
  }

  if (scanning) {
    return (
      <View style={styles.cameraRoot}>
        <CameraView
          style={styles.camera}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e", "qr", "code128", "code39"] }}
          onBarcodeScanned={({ data }) => {
            if (scanLocked.current) return;
            scanLocked.current = true;
            setScanning(false);
            void lookupBarcode(data);
          }}
          onMountError={(event) => {
            setScanning(false);
            setCameraBlocked(true);
            setStatus(`Camera error: ${event.message || "Could not start camera."}`);
          }}
        />
        <View pointerEvents="none" style={styles.scanOverlay}>
          <View style={styles.scanFrame} />
          <Text style={styles.scanHint}>Align the barcode inside the frame</Text>
          {Platform.OS === "web" ? <Text style={styles.scanSubHint}>Web camera scan can be unreliable. Manual lookup is available.</Text> : null}
        </View>
        <Pressable style={styles.closeScan} onPress={() => setScanning(false)}>
          <Text style={styles.closeText}>Close</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <Screen scroll>
      {onNavigate ? <Header title="Scan food" subtitle={`Logging to ${mealType}`} onBack={() => onNavigate({ name: "search", mealType })} /> : null}
      {!onNavigate ? <Text style={styles.title}>Scan food</Text> : null}
      {!onNavigate ? <Text style={styles.subtitle}>Barcode lookup or AI food scanner.</Text> : null}

      <View style={styles.actions}>
        <Button onPress={() => void startBarcodeScanner()} disabled={busy}>{busy ? "Working..." : "Scan barcode"}</Button>
        <Button variant="ghost" onPress={() => void pickFoodImage("camera")} disabled={busy}>{busy ? "Working..." : "AI camera"}</Button>
        <Button variant="ghost" onPress={() => void pickFoodImage("gallery")} disabled={busy}>{busy ? "Working..." : "AI gallery"}</Button>
      </View>

      <View style={styles.manualBox}>
        <Text style={styles.manualLabel}>Manual barcode</Text>
        <Text style={styles.manualHint}>Use this if browser camera scanning does not fire on web preview.</Text>
        <View style={styles.manualRow}>
          <TextInput
            value={barcodeInput}
            onChangeText={setBarcodeInput}
            keyboardType="number-pad"
            placeholder="Example: 737628064502"
            placeholderTextColor="#8D988D"
            style={styles.manualInput}
          />
          <Button onPress={() => void lookupBarcode(barcodeInput)} disabled={busy} style={styles.lookupButton}>Lookup</Button>
        </View>
      </View>

      {cameraBlocked ? (
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>Camera access needed</Text>
          <Text style={styles.permissionText}>
            {Platform.OS === "web"
              ? "Click the camera/lock icon in the browser address bar, set Camera to Allow for this site, then press Retry camera."
              : "Enable camera access for Nutrio in system settings, then press Retry camera."}
          </Text>
          <Button onPress={() => void startBarcodeScanner()} disabled={busy}>Retry camera</Button>
        </View>
      ) : null}

      {status ? (
        <View style={styles.statusBox}>
          {busy ? <ActivityIndicator color={colors.primary} /> : null}
          <Text style={styles.statusText}>{status}</Text>
        </View>
      ) : null}

      {pickedImage ? <Image source={{ uri: pickedImage }} style={styles.previewImage} /> : null}

      {detectedFoods.length > 0 ? (
        <View style={styles.detectedBox}>
          <Text style={styles.detectedTitle}>Detected foods</Text>
          {detectedFoods.map((food) => (
            <Pressable key={food} onPress={() => void selectDetectedFood(food)} style={styles.detectedRow}>
              <Text style={styles.detectedName}>{food}</Text>
              <Text style={styles.detectedAdd}>Estimate</Text>
            </Pressable>
          ))}
        </View>
      ) : null}

      {product ? (
        <View style={styles.product}>
          {product.image ? <Image source={{ uri: product.image }} style={styles.productImage} /> : <View style={styles.productFallback}><Text style={styles.productFallbackText}>AI</Text></View>}
          <View style={styles.productInfo}>
            <Text style={styles.productTitle}>{product.label}</Text>
            <Text style={styles.productSub}>{product.serving} • {Math.round(product.kcal)} kcal • {product.source}</Text>
            <Text style={styles.productMacro}>
              C {Math.round(product.carbs)}g / P {Math.round(product.protein)}g / F {Math.round(product.fat)}g
            </Text>
          </View>
          <Button onPress={() => void saveProduct()} disabled={busy} style={styles.saveButton}>Add</Button>
        </View>
      ) : null}
    </Screen>
  );
}

function numberFrom(...values: unknown[]) {
  for (const value of values) {
    const numberValue = Number(value);
    if (Number.isFinite(numberValue) && numberValue > 0) return numberValue;
  }
  return 0;
}

const styles = StyleSheet.create({
  title: {
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
  actions: {
    marginTop: 18,
    gap: 12
  },
  cameraRoot: {
    flex: 1,
    backgroundColor: "#000000"
  },
  camera: {
    flex: 1
  },
  scanOverlay: {
    position: "absolute",
    inset: 0,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24
  },
  scanFrame: {
    width: 260,
    height: 160,
    borderRadius: 18,
    borderWidth: 3,
    borderColor: colors.accent,
    backgroundColor: "transparent"
  },
  scanHint: {
    marginTop: 18,
    color: "#FFFFFF",
    fontWeight: "900",
    textAlign: "center"
  },
  scanSubHint: {
    marginTop: 8,
    color: "#FFFFFF",
    opacity: 0.8,
    textAlign: "center",
    fontSize: 12
  },
  closeScan: {
    position: "absolute",
    top: 52,
    right: 20,
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 9
  },
  closeText: {
    color: colors.text,
    fontWeight: "900"
  },
  manualBox: {
    marginTop: 18,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: colors.border
  },
  manualLabel: {
    color: colors.text,
    fontWeight: "900",
    marginBottom: 4
  },
  manualHint: {
    color: colors.textMuted,
    fontSize: 12,
    marginBottom: 10
  },
  manualRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center"
  },
  manualInput: {
    flex: 1,
    minHeight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    paddingHorizontal: 12
  },
  lookupButton: {
    width: 98,
    minHeight: 48
  },
  statusBox: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: colors.muted,
    padding: 12
  },
  statusText: {
    flex: 1,
    color: colors.textMuted,
    fontWeight: "700"
  },
  permissionBox: {
    marginTop: 16,
    gap: 10,
    borderRadius: 14,
    backgroundColor: "#FFF7E8",
    borderWidth: 1,
    borderColor: "#FFD7A6",
    padding: 14
  },
  permissionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16
  },
  permissionText: {
    color: colors.textMuted,
    lineHeight: 20
  },
  previewImage: {
    marginTop: 18,
    width: "100%",
    height: 240,
    borderRadius: 18,
    backgroundColor: colors.border
  },
  detectedBox: {
    marginTop: 18,
    gap: 10
  },
  detectedTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18
  },
  detectedRow: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  detectedName: {
    color: colors.text,
    fontWeight: "800",
    flex: 1
  },
  detectedAdd: {
    color: colors.primary,
    fontWeight: "900"
  },
  product: {
    marginTop: 28,
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border
  },
  productImage: {
    width: 58,
    height: 58,
    borderRadius: 12
  },
  productFallback: {
    width: 58,
    height: 58,
    borderRadius: 12,
    backgroundColor: "#ECF7E9",
    alignItems: "center",
    justifyContent: "center"
  },
  productFallbackText: {
    color: colors.primaryDark,
    fontWeight: "900"
  },
  productInfo: {
    flex: 1
  },
  productTitle: {
    color: colors.text,
    fontWeight: "900"
  },
  productSub: {
    color: colors.textMuted,
    marginTop: 4
  },
  productMacro: {
    color: colors.textMuted,
    marginTop: 3,
    fontSize: 12,
    fontWeight: "700"
  },
  saveButton: {
    width: 82,
    minHeight: 44
  }
});
