import { Ionicons } from "@expo/vector-icons";
import { MainTab } from "@/types";

export const mainTabs: Array<{ key: MainTab; icon: keyof typeof Ionicons.glyphMap }> = [
  { key: "home", icon: "home" },
  { key: "insights", icon: "bar-chart" },
  { key: "scan", icon: "scan" },
  { key: "workout", icon: "fitness" },
  { key: "profile", icon: "person" }
];
