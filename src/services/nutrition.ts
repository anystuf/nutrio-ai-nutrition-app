export function calculateBMR(input: {
  weight: number;
  height: number;
  age: number;
  gender?: string;
}) {
  const s = input.gender?.toLowerCase() === "male" ? 5 : -161;
  return 10 * input.weight + 6.25 * input.height - 5 * input.age + s;
}

export function calculateTDEE(bmr: number, activityLevel?: string) {
  switch ((activityLevel ?? "").toLowerCase()) {
    case "sedentary":
      return bmr * 1.2;
    case "light":
    case "lightly active":
      return bmr * 1.375;
    case "moderate":
    case "moderately active":
      return bmr * 1.55;
    case "active":
    case "very active":
      return bmr * 1.725;
    case "very_active":
      return bmr * 1.9;
    default:
      return bmr * 1.2;
  }
}

export function calculateBMI(weight: number, height: number) {
  if (!height) return 0;
  const heightM = height / 100;
  return weight / (heightM * heightM);
}

export function calculateMacroGoals(tdee: number) {
  return {
    carbs: (tdee * 0.5) / 4,
    protein: (tdee * 0.3) / 4,
    fat: (tdee * 0.2) / 9
  };
}

export function getDetailedBMIStatus(bmi: number) {
  if (bmi < 16) return { status: "Very Severely Underweight", color: "#BC2020", advice: "Bạn cần gặp bác sĩ dinh dưỡng ngay." };
  if (bmi < 17) return { status: "Severely Underweight", color: "#D35D6E", advice: "Cân nặng rất thấp, hãy bổ sung dinh dưỡng." };
  if (bmi < 18.5) return { status: "Underweight", color: "#F8B24F", advice: "Hơi gầy, hãy ăn thêm các bữa phụ." };
  if (bmi < 25) return { status: "Normal", color: "#8DBF45", advice: "Tuyệt vời! Hãy duy trì chế độ này." };
  if (bmi < 30) return { status: "Overweight", color: "#EEC643", advice: "Hơi thừa cân, hãy tăng cường vận động." };
  if (bmi < 35) return { status: "Obese Class I", color: "#FE9756", advice: "Béo phì độ 1, cần kiểm soát calo chặt chẽ." };
  if (bmi < 40) return { status: "Obese Class II", color: "#E45F2E", advice: "Béo phì độ 2, nguy cơ tim mạch cao." };
  return { status: "Obese Class III", color: "#D62828", advice: "Béo phì độ 3, cần can thiệp y tế." };
}

export function ageFromBirthDate(value?: string) {
  if (!value) return 25;
  const birthday = new Date(value);
  const today = new Date();
  let age = today.getFullYear() - birthday.getFullYear();
  const monthDelta = today.getMonth() - birthday.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthday.getDate())) {
    age -= 1;
  }
  return Number.isFinite(age) && age > 0 ? age : 25;
}
