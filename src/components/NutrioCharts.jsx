import { StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Rect, Stop, Text as SvgText } from "react-native-svg";
import { colors } from "@/theme/colors";




















export function WeeklyBarChart({ points, goal, height = 220, color = "#C5E07E" }) {
  const width = 330;
  const chartTop = 14;
  const chartHeight = height - 42;
  const maxY = Math.max(goal * 1.5, ...points.map((point) => point.value), 100);
  const barGap = 16;
  const barWidth = Math.max(12, (width - 48 - barGap * (points.length - 1)) / Math.max(1, points.length));
  const goalY = chartTop + chartHeight - Math.min(maxY, goal) / maxY * chartHeight;

  return (
    <View style={styles.chartWrap}>
      <Svg width="100%" viewBox={`0 0 ${width} ${height}`} height={height}>
        <Line x1="24" x2={width - 10} y1={goalY} y2={goalY} stroke="#FF9B3D" strokeWidth="1.5" strokeDasharray="5 5" />
        {points.map((point, index) => {
          const x = 24 + index * (barWidth + barGap);
          const barHeight = Math.max(4, point.value / maxY * chartHeight);
          const y = chartTop + chartHeight - barHeight;
          const active = index === points.length - 1;
          return (
            <G key={`${point.label}-${index}`}>
              <Rect x={x} y={chartTop} width={barWidth} height={chartHeight} rx="7" fill="#F3F3F3" />
              <Rect x={x} y={y} width={barWidth} height={barHeight} rx="7" fill={point.value > goal ? colors.danger : color} />
              <SvgText x={x + barWidth / 2} y={height - 12} textAnchor="middle" fontSize="12" fontWeight={active ? "900" : "700"} fill={active ? colors.text : colors.textMuted}>
                {point.label}
              </SvgText>
            </G>);

        })}
      </Svg>
      <View style={styles.legend}>
        <View style={styles.goalDash} />
        <Text style={styles.legendText}>Goal {Math.round(goal)} kcal</Text>
      </View>
    </View>);

}

export function MonthlyLineChart({ points, goal, height = 220, color = "#C5E07E" }) {
  const width = 330;
  const left = 22;
  const right = 12;
  const top = 14;
  const bottom = 34;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const maxY = Math.max(goal * 1.5, ...points.map((point) => point.value), 100);
  const safePoints = points.length > 1 ? points : [...points, { label: "", value: 0 }];
  const plotted = safePoints.map((point, index) => {
    const x = left + index / Math.max(1, safePoints.length - 1) * chartWidth;
    const y = top + chartHeight - Math.min(maxY, point.value) / maxY * chartHeight;
    return { x, y, ...point };
  });
  const path = plotted.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const areaPath = `${path} L ${plotted[plotted.length - 1].x.toFixed(1)} ${top + chartHeight} L ${plotted[0].x.toFixed(1)} ${top + chartHeight} Z`;
  const goalY = top + chartHeight - Math.min(maxY, goal) / maxY * chartHeight;

  return (
    <View style={styles.chartWrap}>
      <Svg width="100%" viewBox={`0 0 ${width} ${height}`} height={height}>
        <Defs>
          <LinearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity="0.24" />
            <Stop offset="1" stopColor={color} stopOpacity="0.02" />
          </LinearGradient>
        </Defs>
        {[0, 0.25, 0.5, 0.75, 1].map((step) => {
          const y = top + chartHeight * step;
          return <Line key={step} x1={left} x2={width - right} y1={y} y2={y} stroke="#EFEFEF" strokeWidth="1" />;
        })}
        <Line x1={left} x2={width - right} y1={goalY} y2={goalY} stroke="#FF9B3D" strokeWidth="1.5" strokeDasharray="5 5" />
        <Path d={areaPath} fill="url(#lineFill)" />
        <Path d={path} fill="transparent" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        {plotted.filter((_, index) => index % 5 === 0 || index === plotted.length - 1).map((point, index) =>
        <SvgText key={`${point.label}-${index}`} x={point.x} y={height - 10} textAnchor="middle" fontSize="10" fill={colors.textMuted}>
            {point.label}
          </SvgText>
        )}
      </Svg>
    </View>);

}





export function BMIGauge({ bmi }) {
  const width = 260;
  const height = 150;
  const centerX = width / 2;
  const centerY = 132;
  const radius = 105;
  const stroke = 18;
  const t = Math.max(0, Math.min(1, (bmi - 15) / 25));
  const angle = Math.PI + t * Math.PI;
  const needleX = centerX + (radius - 22) * Math.cos(angle);
  const needleY = centerY + (radius - 22) * Math.sin(angle);

  return (
    <View style={styles.gaugeWrap}>
      <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
        <GaugeArc start={180} end={216} color="#6DD3FF" radius={radius} stroke={stroke} cx={centerX} cy={centerY} />
        <GaugeArc start={216} end={270} color="#8DBF45" radius={radius} stroke={stroke} cx={centerX} cy={centerY} />
        <GaugeArc start={270} end={306} color="#EEC643" radius={radius} stroke={stroke} cx={centerX} cy={centerY} />
        <GaugeArc start={306} end={360} color="#FF6B6B" radius={radius} stroke={stroke} cx={centerX} cy={centerY} />
        <Line x1={centerX} y1={centerY} x2={needleX} y2={needleY} stroke="#607D8B" strokeWidth="4" strokeLinecap="round" />
        <Circle cx={centerX} cy={centerY} r="8" fill="#607D8B" />
      </Svg>
      <View style={styles.gaugeValue}>
        <Text style={styles.bmiValue}>{bmi.toFixed(1)}</Text>
        <Text style={styles.bmiUnit}>kg/m²</Text>
      </View>
    </View>);

}

function GaugeArc(props) {
  const start = polar(props.cx, props.cy, props.radius, props.start);
  const end = polar(props.cx, props.cy, props.radius, props.end);
  const largeArc = props.end - props.start > 180 ? 1 : 0;
  const d = `M ${start.x} ${start.y} A ${props.radius} ${props.radius} 0 ${largeArc} 1 ${end.x} ${end.y}`;
  return <Path d={d} stroke={props.color} strokeWidth={props.stroke} strokeLinecap="butt" fill="transparent" />;
}

function polar(cx, cy, radius, angleDeg) {
  const angle = angleDeg * Math.PI / 180;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle)
  };
}

const styles = StyleSheet.create({
  chartWrap: {
    width: "100%"
  },
  legend: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 6
  },
  goalDash: {
    width: 26,
    height: 2,
    backgroundColor: colors.orange
  },
  legendText: {
    color: colors.textMuted,
    fontSize: 12
  },
  gaugeWrap: {
    alignItems: "center",
    minHeight: 168,
    justifyContent: "center"
  },
  gaugeValue: {
    position: "absolute",
    bottom: 6,
    alignItems: "center"
  },
  bmiValue: {
    color: colors.text,
    fontSize: 40,
    fontWeight: "900",
    lineHeight: 44
  },
  bmiUnit: {
    color: colors.textMuted,
    fontSize: 12
  }
});
