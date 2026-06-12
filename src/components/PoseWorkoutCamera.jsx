import React, { useEffect, useRef, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import * as tf from "@tensorflow/tfjs";
import * as poseDetection from "@tensorflow-models/pose-detection";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "@/theme/colors";


















export function PoseWorkoutCamera({ exercise, reps, calories, saving, onRep, onClose, onSave }) {
  const videoRef = useRef(null);
  const detectorRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const stageRef = useRef("ready");
  const [status, setStatus] = useState(Platform.OS === "web" ? "Starting camera..." : "Native ML Kit pose module is required.");
  const [kneeAngle, setKneeAngle] = useState(0);
  const [stage, setStage] = useState("ready");

  useEffect(() => {
    if (Platform.OS !== "web") return undefined;
    let active = true;

    async function start() {
      try {
        if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
          setStatus("Camera is not available in this browser.");
          return;
        }
        await tf.ready();
        detectorRef.current = await poseDetection.createDetector(poseDetection.SupportedModels.MoveNet, {
          modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING
        });

        streamRef.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: 640, height: 480 },
          audio: false
        });
        if (!active || !videoRef.current) return;
        videoRef.current.srcObject = streamRef.current;
        await videoRef.current.play();
        setStatus("MoveNet is tracking your pose");
        loop();
      } catch (error) {
        setStatus(error instanceof Error ? error.message : "Could not start pose detection.");
      }
    }

    async function loop() {
      if (!active || !detectorRef.current || !videoRef.current) return;
      if (videoRef.current.readyState >= 2) {
        const poses = await detectorRef.current.estimatePoses(videoRef.current);
        const angle = estimateSquatAngle(poses[0]?.keypoints ?? []);
        if (angle > 0) {
          setKneeAngle(Math.round(angle));
          if (exercise === "Squats") updateSquatCounter(angle);
        }
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    function updateSquatCounter(angle) {
      if (angle < 112 && stageRef.current === "ready") {
        stageRef.current = "down";
        setStage("down");
      }
      if (angle > 158 && stageRef.current === "down") {
        stageRef.current = "ready";
        setStage("ready");
        onRep();
      }
    }

    void start();
    return () => {
      active = false;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks?.().forEach((track) => track.stop());
    };
  }, [exercise, onRep]);

  if (Platform.OS !== "web") {
    return (
      <View style={styles.nativeFallback}>
        <Text style={styles.nativeTitle}>Native pose detection needs a dev build</Text>
        <Text style={styles.nativeText}>The Dart app uses Google ML Kit on camera frames. Expo Go cannot load that native detector directly. Use a dev build with Vision Camera + a pose plugin, or a custom ML Kit bridge, to match the Flutter implementation on iOS/Android.</Text>
        <Pressable style={styles.closeButton} onPress={onClose}><Text style={styles.closeText}>Back</Text></Pressable>
      </View>);

  }

  return (
    <View style={styles.root}>
      {React.createElement("video", {
        ref: videoRef,
        muted: true,
        playsInline: true,
        autoPlay: true,
        style: styles.webVideo
      })}
      <View pointerEvents="none" style={styles.overlay}>
        <View style={styles.frame} />
        <Text style={styles.hint}>{stage === "down" ? "Stand up to count" : "Squat down"}</Text>
        <Text style={styles.status}>{status} - Knee angle {kneeAngle || "--"}</Text>
      </View>
      <View style={styles.topBar}>
        <Pressable style={styles.iconButton} onPress={onClose}><Ionicons name="arrow-back" size={26} color="#FFFFFF" /></Pressable>
      </View>
      <View style={styles.stats}>
        <Stat label="REPS" value={String(reps)} />
        <Stat label="KCAL" value={calories.toFixed(1)} />
        <Stat label="EXERCISE" value={exercise} />
      </View>
      <Pressable style={styles.save} onPress={onSave} disabled={saving}>
        <Text style={styles.saveText}>{saving ? "Saving..." : "FINISH WORKOUT"}</Text>
      </Pressable>
    </View>);

}

function estimateSquatAngle(keypoints) {
  const left = angleForSide(keypoints, "left");
  const right = angleForSide(keypoints, "right");
  const values = [left, right].filter((value) => value > 0);
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function angleForSide(keypoints, side) {
  const hip = findPoint(keypoints, side + "_hip");
  const knee = findPoint(keypoints, side + "_knee");
  const ankle = findPoint(keypoints, side + "_ankle");
  if (!hip || !knee || !ankle) return 0;
  return angle(hip, knee, ankle);
}

function findPoint(keypoints, name) {
  const point = keypoints.find((item) => item.name === name);
  if (!point || Number(point.score ?? 0) < 0.2) return null;
  return point;
}

function angle(a, b, c) {
  const ab = { x: a.x - b.x, y: a.y - b.y };
  const cb = { x: c.x - b.x, y: c.y - b.y };
  const dot = ab.x * cb.x + ab.y * cb.y;
  const magA = Math.hypot(ab.x, ab.y);
  const magC = Math.hypot(cb.x, cb.y);
  if (!magA || !magC) return 0;
  const cosine = Math.max(-1, Math.min(1, dot / (magA * magC)));
  return Math.acos(cosine) * 180 / Math.PI;
}

function Stat({ label, value }) {
  return <View style={styles.stat}><Text style={styles.statLabel}>{label}</Text><Text style={styles.statValue}>{value}</Text></View>;
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000000" },
  webVideo: { position: "absolute", left: 0, right: 0, top: 0, bottom: 0, width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)" },
  overlay: { ...StyleSheet.absoluteFillObject, alignItems: "center", justifyContent: "center", padding: 24 },
  frame: { width: 230, height: 360, borderWidth: 3, borderColor: colors.accent, borderRadius: 28, backgroundColor: "transparent" },
  hint: { marginTop: 18, color: "#FFFFFF", fontWeight: "900", fontSize: 20, textShadowColor: "rgba(0,0,0,0.65)", textShadowRadius: 6 },
  status: { marginTop: 8, color: "#FFFFFF", opacity: 0.86, textAlign: "center" },
  topBar: { position: "absolute", top: 42, left: 18, right: 18, flexDirection: "row", justifyContent: "space-between" },
  iconButton: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(0,0,0,0.5)", alignItems: "center", justifyContent: "center" },
  stats: { position: "absolute", left: 18, right: 18, bottom: 90, flexDirection: "row", justifyContent: "space-between", backgroundColor: "rgba(0,0,0,0.58)", borderRadius: 18, padding: 14 },
  stat: { flex: 1, alignItems: "center" },
  statLabel: { color: "rgba(255,255,255,0.7)", fontSize: 11, fontWeight: "800" },
  statValue: { color: "#FFFFFF", fontSize: 21, fontWeight: "900", marginTop: 5, textAlign: "center" },
  save: { position: "absolute", left: 18, right: 18, bottom: 24, minHeight: 50, borderRadius: 15, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  saveText: { color: colors.primaryDark, fontWeight: "900" },
  nativeFallback: { flex: 1, backgroundColor: colors.background, padding: 24, justifyContent: "center", gap: 14 },
  nativeTitle: { color: colors.text, fontSize: 24, fontWeight: "900" },
  nativeText: { color: colors.textMuted, lineHeight: 22 },
  closeButton: { minHeight: 50, borderRadius: 14, backgroundColor: colors.primary, alignItems: "center", justifyContent: "center" },
  closeText: { color: colors.primaryDark, fontWeight: "900" }
});
