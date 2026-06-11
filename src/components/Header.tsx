import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  title: string;
  subtitle?: string;
  onBack?: () => void;
};

export function Header({ title, subtitle, onBack }: Props) {
  return (
    <View style={styles.wrap}>
      {onBack ? (
        <Pressable onPress={onBack} style={styles.back}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
      ) : null}
      <View style={styles.copy}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 18
  },
  back: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center"
  },
  copy: {
    flex: 1
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900"
  },
  subtitle: {
    color: colors.textMuted,
    marginTop: 4,
    lineHeight: 20
  }
});
