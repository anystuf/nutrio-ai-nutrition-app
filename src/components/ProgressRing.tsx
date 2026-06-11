import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle } from "react-native-svg";
import { colors } from "@/theme/colors";

type Props = {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel: string;
  color?: string;
};

export function ProgressRing({ value, size = 190, stroke = 14, label, sublabel, color = colors.primary }: Props) {
  const pct = Math.max(0, Math.min(1, value));
  const inner = size - stroke * 2;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - pct);
  const labelSize = Math.max(12, Math.round(size * 0.2));
  const sublabelSize = Math.max(10, Math.round(size * 0.075));

  return (
    <View style={[styles.outer, { width: size, height: size, borderRadius: size / 2 }]}>
      <Svg width={size} height={size} style={styles.arc}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.border}
          strokeWidth={stroke}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={stroke}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={dashOffset}
          rotation="-90"
          originX={size / 2}
          originY={size / 2}
        />
      </Svg>
      <View style={[styles.inner, { width: inner, height: inner, borderRadius: inner / 2 }]}>
        <Text style={[styles.label, { fontSize: labelSize }]}>{label}</Text>
        <Text style={[styles.sublabel, { fontSize: sublabelSize }]}>{sublabel}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    alignItems: "center",
    justifyContent: "center"
  },
  arc: {
    position: "absolute"
  },
  inner: {
    backgroundColor: colors.background,
    alignItems: "center",
    justifyContent: "center"
  },
  label: {
    fontWeight: "900",
    color: colors.text
  },
  sublabel: {
    color: colors.textMuted,
    fontWeight: "600"
  }
});
