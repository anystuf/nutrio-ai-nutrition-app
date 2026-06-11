import { Ionicons } from "@expo/vector-icons";
import { User } from "firebase/auth";
import { Image, Pressable, Share, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";
import { AppRoute, MainTab } from "@/types";

type Props = {
  user: User;
  activeTab: MainTab;
  onClose: () => void;
  onNavigate: (route: AppRoute) => void;
  onTab: (tab: MainTab) => void;
};

const tabItems: Array<{ tab: MainTab; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { tab: "home", label: "Dashboard", icon: "home-outline" },
  { tab: "insights", label: "Insights", icon: "bar-chart-outline" },
  { tab: "workout", label: "Workout", icon: "fitness-outline" },
  { tab: "profile", label: "Profile", icon: "person-outline" }
];

export function AppDrawer({ user, activeTab, onClose, onNavigate, onTab }: Props) {
  const displayName = user.displayName || user.email || "Nutrio user";
  async function shareApp() {
    await Share.share({ message: "Try Nutrio, your nutrition and workout companion." });
  }

  return (
    <View style={styles.scrim}>
      <Pressable style={styles.dismiss} onPress={onClose} />
      <View style={styles.drawer}>
        <View style={styles.header}>
          <Text style={styles.brand}>Welcome To Mobile Nutrition</Text>
          <View style={styles.account}>
            <Image source={{ uri: user.photoURL || "https://via.placeholder.com/120" }} style={styles.avatar} />
            <View style={styles.accountText}>
              <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
              <Text style={styles.email} numberOfLines={1}>{user.email || "Not signed in"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          {tabItems.map((item) => {
            const active = item.tab === activeTab;
            return (
              <DrawerRow
                key={item.tab}
                icon={item.icon}
                label={item.label}
                active={active}
                onPress={() => { onTab(item.tab); onClose(); }}
              />
            );
          })}
        </View>

        <View style={styles.section}>
          <DrawerRow icon="reader-outline" label="My Activity list" onPress={() => { onNavigate({ name: "toLearn" }); onClose(); }} />
          <DrawerRow icon="share-social-outline" label="Share" onPress={() => void shareApp()} />
          <DrawerRow icon="arrow-back-outline" label="Back" onPress={onClose} />
        </View>
      </View>
    </View>
  );
}

function DrawerRow({ icon, label, active, onPress }: { icon: keyof typeof Ionicons.glyphMap; label: string; active?: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.row, active && styles.rowActive]} onPress={onPress}>
      <Ionicons name={icon} size={22} color={active ? colors.primaryDark : colors.text} />
      <Text style={[styles.rowText, active && styles.rowTextActive]}>{label}</Text>
      <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scrim: { ...StyleSheet.absoluteFillObject, zIndex: 20, flexDirection: "row", backgroundColor: "rgba(0,0,0,0.28)" },
  dismiss: { flex: 1 },
  drawer: { position: "absolute", left: 0, top: 0, bottom: 0, width: 314, maxWidth: "84%", backgroundColor: colors.surface, borderTopRightRadius: 22, borderBottomRightRadius: 22, overflow: "hidden", shadowColor: "#000000", shadowOpacity: 0.18, shadowRadius: 18, elevation: 8 },
  header: { backgroundColor: colors.primary, paddingTop: 48, paddingHorizontal: 18, paddingBottom: 20 },
  brand: { color: colors.primaryDark, fontWeight: "900", fontSize: 24, lineHeight: 30, marginBottom: 18 },
  account: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.surface },
  accountText: { flex: 1 },
  name: { color: colors.primaryDark, fontWeight: "900", fontSize: 17 },
  email: { color: colors.primaryDark, opacity: 0.72, marginTop: 2 },
  section: { paddingHorizontal: 12, paddingTop: 12 },
  row: { minHeight: 54, borderRadius: 14, flexDirection: "row", alignItems: "center", gap: 12, paddingHorizontal: 12, marginBottom: 6 },
  rowActive: { backgroundColor: colors.primary },
  rowText: { flex: 1, color: colors.text, fontWeight: "800", fontSize: 16 },
  rowTextActive: { color: colors.primaryDark }
});
