
import { Pressable, StyleSheet, Text } from "react-native";
import { colors } from "@/theme/colors";









export function Button({ children, onPress, disabled, variant = "primary", style }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
      styles.base,
      styles[variant],
      disabled && styles.disabled,
      pressed && !disabled && styles.pressed,
      style]
      }>
      
      <Text style={[styles.text, variant === "ghost" && styles.ghostText]}>{children}</Text>
    </Pressable>);

}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 18
  },
  primary: {
    backgroundColor: colors.primary
  },
  ghost: {
    backgroundColor: "transparent"
  },
  danger: {
    backgroundColor: colors.danger
  },
  disabled: {
    backgroundColor: colors.border
  },
  pressed: {
    opacity: 0.82
  },
  text: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "800"
  },
  ghostText: {
    color: colors.primary
  }
});
