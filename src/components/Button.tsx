import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { colors } from "@/theme/colors";

type Props = {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  variant?: "primary" | "ghost" | "danger";
  style?: ViewStyle;
};

export function Button({ children, onPress, disabled, variant = "primary", style }: Props) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        disabled && styles.disabled,
        pressed && !disabled && styles.pressed,
        style
      ]}
    >
      <Text style={[styles.text, variant === "ghost" && styles.ghostText]}>{children}</Text>
    </Pressable>
  );
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
