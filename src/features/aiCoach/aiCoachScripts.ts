export type ScriptedReply = {
  text: string;
  quickReplies?: string[];
};

export const coachPrompts = [
  "Gợi ý thực đơn thông minh",
  "Đề xuất chế độ ăn phù hợp",
  "Tính calories và macro cho tôi",
  "Nhắc tôi uống nước và vận động"
];

export const dailyReminderMessages = [
  {
    hour: 7,
    minute: 30,
    text: "Chào buổi sáng! Bữa sáng là bữa quan trọng nhất. Hãy ăn đủ protein và tinh bột phức hợp để nạp năng lượng nhé."
  },
  {
    hour: 11,
    minute: 30,
    text: "Sắp đến giờ ăn trưa rồi! Gợi ý hôm nay: thêm nhiều rau xanh và chọn tinh bột hấp thu chậm để no lâu hơn."
  },
  {
    hour: 15,
    minute: 30,
    text: "Khung giờ dễ thèm ngọt đây rồi. Thử một quả táo hoặc sữa chua không đường thay vì đồ uống nhiều đường nhé."
  },
  {
    hour: 17,
    minute: 30,
    text: "Tan làm rồi! Dành 30 phút vận động nhẹ để đốt bớt calo thừa trong ngày nhé."
  },
  {
    hour: 21,
    minute: 30,
    text: "Sắp đến giờ ngủ. Tránh ăn đêm để dạ dày được nghỉ và ngủ sâu hơn nhé."
  }
];

export const fixedIngredientSchedule = [
  "Mình đã nhận được nguyên liệu của bạn rồi! Đây là gợi ý thực đơn Eat Clean hôm nay:",
  "",
  "Bữa sáng: Yến mạch ngâm sữa tươi không đường và nửa quả chuối. (350 kcal)",
  "Bữa trưa: Cơm lứt, 150g ức gà áp chảo và salad dầu giấm. (450 kcal)",
  "Bữa xế: 1 hộp sữa chua Hy Lạp. (100 kcal)",
  "Bữa tối: Cá hồi nướng măng tây và khoai lang luộc. (400 kcal)",
  "",
  "Tổng: khoảng 1300 kcal. Bạn có muốn lưu thực đơn này vào nhật ký không?"
].join("\n");

export function scriptedReply(text: string): ScriptedReply | null {
  const normalized = text.trim();
  const lower = normalized.toLowerCase();

  if (normalized === "Gợi ý thực đơn thông minh") {
    return {
      text: "Nutrio Coach xin chào! Hôm nay bạn muốn mình gợi ý thực đơn dựa trên nguyên liệu có sẵn hay theo mục tiêu calo?",
      quickReplies: ["Gợi ý theo nguyên liệu", "Tính calo mục tiêu"]
    };
  }

  if (normalized === "Gợi ý theo nguyên liệu") {
    return {
      text: "Tuyệt vời! Bạn hãy gửi ảnh chụp các nguyên liệu trong tủ lạnh hoặc nhắn tên các món bạn có nhé."
    };
  }

  if (normalized === "Lưu vào nhật ký ăn uống cho tôi.") {
    return {
      text: [
        "Đã xong! Thực đơn đã được đồng bộ vào Nhật ký Nutrio của bạn.",
        "",
        "Đừng quên uống đủ 2 lít nước mỗi ngày để hỗ trợ trao đổi chất nhé.",
        "",
        "Chúc bạn một ngày ăn ngon, dáng thon!"
      ].join("\n")
    };
  }

  if (normalized === "Đề xuất chế độ ăn phù hợp") {
    return {
      text: "Hôm nay bạn muốn hướng tới mục tiêu nào? Mình có vài chế độ ăn chuẩn khoa học cho bạn đây:",
      quickReplies: ["Giảm cân an toàn", "Tăng cơ giảm mỡ", "Duy trì vóc dáng"]
    };
  }

  if (normalized === "Giảm cân an toàn") {
    return {
      text: "Để thiết kế lộ trình giảm cân thâm hụt calo chuẩn xác nhất, hãy cho mình xin cân nặng và chiều cao của bạn nhé."
    };
  }

  if (lower.includes("1m6") || lower.includes("42") || lower.includes("chiều cao")) {
    return {
      text: [
        "Cảm ơn bạn! Dựa trên chỉ số cơ thể của bạn, lượng calo duy trì khoảng 1500 kcal.",
        "",
        "Để giảm cân an toàn, mục tiêu mỗi ngày nên ở mức khoảng 1200 kcal. Macro gợi ý: 40% carb, 30% protein, 30% fat.",
        "",
        "Mình đề xuất thử thách Ăn Sạch 7 Ngày: cắt giảm đường tinh luyện, ăn đủ protein mỗi bữa và cardio nhẹ 15 phút mỗi sáng.",
        "",
        "Bạn có muốn mình đồng hành nhắc nhở không?"
      ].join("\n"),
      quickReplies: ["Hay đó, nhắc mình đi."]
    };
  }

  if (normalized === "Hay đó, nhắc mình đi.") {
    return {
      text: "Nhận lệnh! Nutrio Coach sẽ nhắc bạn ghi chép bữa ăn mỗi ngày. Bắt đầu hành trình độ dáng thôi!"
    };
  }

  if (normalized === "Mã ưu đãi") {
    return {
      text: "Bạn đang có voucher giảm 20% cho gói Thực đơn Premium. Mã: NUTRIOPRO. HSD: 20/03/2026."
    };
  }

  if (normalized === "Đăng ký thành viên") {
    return {
      text: "Nutrio Pro mở khóa thực đơn cá nhân hóa, theo dõi macro nâng cao và tư vấn AI sâu hơn."
    };
  }

  if (normalized === "Đổi điểm") {
    return {
      text: "Bạn đang có 213 điểm và hạng Healthy Pro. Có thể đổi điểm để nhận ưu đãi tư vấn dinh dưỡng 1:1."
    };
  }

  return null;
}
