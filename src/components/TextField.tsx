import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, TextInputProps, View } from "react-native";
import { colors } from "@/theme/colors";

type Props = TextInputProps & {
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
  password?: boolean;
};

export function TextField({ label, icon, password, ...props }: Props) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.field}>
        {icon ? <Ionicons name={icon} size={20} color={colors.textMuted} /> : null}
        <TextInput
          {...props}
          secureTextEntry={password && !visible}
          placeholderTextColor="#9AA49A"
          style={styles.input}
        />
        {password ? (
          <Pressable onPress={() => setVisible((value) => !value)} hitSlop={10}>
            <Ionicons name={visible ? "eye-off-outline" : "eye-outline"} size={20} color={colors.textMuted} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
    marginBottom: 16
  },
  label: {
    color: colors.text,
    fontWeight: "800"
  },
  field: {
    minHeight: 54,
    borderRadius: 14,
    backgroundColor: colors.muted,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10
  },
  input: {
    flex: 1,
    color: colors.text,
    fontSize: 15
  }
});
