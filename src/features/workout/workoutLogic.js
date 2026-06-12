











let isSquatDown = false;

export function calculateAngle(first, middle, last) {
  let radians = Math.atan2(last.y - middle.y, last.x - middle.x) - Math.atan2(first.y - middle.y, first.x - middle.x);
  let degrees = Math.abs(radians * 180 / Math.PI);
  if (degrees > 180) degrees = 360 - degrees;
  return degrees;
}

export function countSquat(pose) {
  const { hip, knee, ankle } = pose;
  if (!hip || !knee || !ankle) return 0;
  if ((hip.likelihood ?? 1) < 0.6 || (knee.likelihood ?? 1) < 0.6 || (ankle.likelihood ?? 1) < 0.6) return 0;

  const kneeAngle = calculateAngle(hip, knee, ankle);
  if (kneeAngle < 100) isSquatDown = true;
  if (isSquatDown && kneeAngle > 160) {
    isSquatDown = false;
    return 1;
  }
  return 0;
}

export function resetSquatState() {
  isSquatDown = false;
}

export function estimateCalories({ exercise, reps, userWeightKg }) {
  const weight = userWeightKg > 0 ? userWeightKg : 60;
  const factor = exercise === "Squats" ? 0.0065 : exercise === "Pushups" ? 0.0085 : 0.005;
  return Number((factor * weight * reps).toFixed(2));
}
