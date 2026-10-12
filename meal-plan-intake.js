// ============================================================
// DAVID COACHING — Bộ câu hỏi lấy thông tin để lên Meal Plan
// ============================================================
// Bản David copy và gửi cho khách trước khi lên kế hoạch dinh dưỡng. Trang
// "meal-plan-intake.html" hiện nội dung này để sao chép.
//
// ĐỂ SỬA NỘI DUNG: chỉ sửa phần chữ trong dấu nháy đơn '...' hoặc `...` bên dưới.
//   * Mỗi câu hỏi là một dòng trong danh sách `questions` của mục đó.
//   * Số thứ tự câu hỏi được đánh tự động, liên tục giữa các mục.
//   * `defaultOn: false` nghĩa là mục đó mặc định KHÔNG gửi (David tick thêm khi cần).
//   * `fills` là gợi ý: câu trả lời của khách nhập vào ô nào của Nutrition Builder.
// Bộ câu hỏi bám theo những gì Nutrition Builder cần ở bước "1. Hiểu khách hàng".

export const INTAKE_TITLE = 'KHẢO SÁT THÔNG TIN ĐỂ LÊN KẾ HOẠCH DINH DƯỠNG';

export const INTAKE_INTRO = `Chào bạn, để mình lên kế hoạch dinh dưỡng đúng với cơ thể và cuộc sống của bạn, bạn giúp mình trả lời các câu hỏi dưới đây nhé.

Bạn cứ trả lời đúng thực tế, không cần "đẹp" — mình cần biết bạn đang ăn và sinh hoạt thế nào thì kế hoạch mới dễ theo được. Câu nào chưa rõ thì để trống hoặc ghi "không biết", mình sẽ hỏi lại. Bạn có thể trả lời thẳng vào tin nhắn và đánh số theo từng câu.`;

export const INTAKE_CLOSING = `Cảm ơn bạn! Mình sẽ dùng thông tin này để lên kế hoạch dinh dưỡng riêng cho bạn và gửi lại sau khi xem xong. Nếu bạn có bệnh lý hoặc đang mang thai/cho con bú, mình sẽ trao đổi thêm với bạn trước khi gửi kế hoạch.`;

export const INTAKE_SECTIONS = Object.freeze([
  {
    id: 'basic', title: 'THÔNG TIN CƠ BẢN', defaultOn: true,
    fills: 'Giới tính, Tuổi, Chiều cao, Cân nặng',
    questions: [
      'Giới tính:',
      'Tuổi (hoặc năm sinh):',
      'Chiều cao (cm):',
      'Cân nặng hiện tại (kg). Nếu bạn nhớ, cho mình biết thêm cân nặng cách đây khoảng 1 tháng:',
    ],
  },
  {
    id: 'goal', title: 'MỤC TIÊU', defaultOn: true,
    fills: 'Mục tiêu',
    questions: [
      'Mục tiêu chính của bạn là gì (tăng cơ, giảm mỡ, giữ cân, tăng cân)? Bạn muốn đạt cân nặng hoặc hình thể thế nào, trong khoảng bao lâu?',
      'Trước đây bạn đã từng ăn kiêng hoặc theo kế hoạch ăn nào chưa? Điều gì có hiệu quả, và điều gì khiến bạn khó theo?',
    ],
  },
  {
    id: 'activity', title: 'VẬN ĐỘNG VÀ TẬP LUYỆN', defaultOn: true,
    fills: 'Vận động hằng ngày, Số buổi tập/tuần, Thời điểm tập, Mức độ tập',
    questions: [
      'Công việc hằng ngày của bạn thuộc loại nào: ngồi nhiều, đi lại/đứng nhiều, hay lao động chân tay? Nếu có đo, mỗi ngày bạn đi khoảng bao nhiêu bước?',
      'Mỗi tuần bạn tập mấy buổi, mỗi buổi bao lâu, tập kiểu gì (tạ, cardio, thể thao...) và thường vào giờ nào?',
    ],
  },
  {
    id: 'schedule', title: 'LỊCH SINH HOẠT', defaultOn: true,
    fills: 'Lịch làm việc, Giờ ngủ, Giờ thức dậy, Số bữa/ngày',
    questions: [
      'Bạn thường thức dậy và đi ngủ lúc mấy giờ? Lịch làm việc hoặc học của bạn thế nào (giờ bắt đầu, giờ kết thúc, thời gian di chuyển)?',
      'Bạn muốn ăn mấy bữa mỗi ngày (3, 4 hay 5 bữa)? Bạn hay bỏ bữa nào không?',
    ],
  },
  {
    id: 'habits', title: 'THÓI QUEN ĂN UỐNG HIỆN TẠI', defaultOn: true,
    fills: 'Món khách thường ăn, Món ăn khách nấu được / hay ăn',
    questions: [
      'Bạn kể giúp mình một ngày ăn bình thường gần đây: từng bữa lúc mấy giờ, ăn gì, uống gì (kể cả đồ ăn vặt, nước ngọt, cà phê, trà sữa, bia rượu).',
      'Bạn thường tự nấu, mua đồ ăn sẵn hay ăn ngoài quán? Mỗi tuần ăn ngoài khoảng mấy bữa? Bếp của bạn có những gì (tủ lạnh, lò vi sóng, nồi chiên không dầu...) và bạn có tối đa bao nhiêu phút để chuẩn bị một bữa?',
      'Ngân sách ăn uống mỗi ngày hoặc mỗi tuần của bạn khoảng bao nhiêu?',
    ],
  },
  {
    id: 'likes', title: 'SỞ THÍCH VÀ ĐIỀU CẦN TRÁNH', defaultOn: true,
    fills: 'Món khách thường ăn, Món cần tránh, Món ăn không dùng',
    questions: [
      'Những món bạn thích và hay ăn:',
      'Những món hoặc thực phẩm bạn không thích hay không ăn được:',
      'Bạn có dị ứng hoặc không dung nạp thực phẩm nào không (hải sản, sữa, đậu phộng, gluten...)? Bạn có ăn chay hoặc kiêng theo tôn giáo hay lối sống nào không?',
    ],
  },
  {
    id: 'health', title: 'SỨC KHỎE', defaultOn: true,
    fills: 'Tiêu hoá',
    questions: [
      'Hệ tiêu hóa của bạn thế nào (đau dạ dày, trào ngược, đầy hơi, táo bón hoặc tiêu chảy, nhạy với sữa...)?',
      'Bạn có bệnh lý hoặc đang theo dõi vấn đề sức khỏe nào không (tiểu đường, huyết áp, mỡ máu, gout, tuyến giáp...)? Bác sĩ có dặn gì về ăn uống không?',
      'Bạn đang dùng thuốc hoặc thực phẩm bổ sung nào (whey, creatine, vitamin...)?',
    ],
  },
  {
    id: 'women', title: 'DÀNH RIÊNG CHO NỮ (chỉ trả lời nếu phù hợp)', defaultOn: false,
    fills: 'Chu kỳ (nữ)',
    questions: [
      'Bạn có đang mang thai hoặc cho con bú không? Chu kỳ kinh nguyệt của bạn có đều không, và ngày đầu của kỳ gần nhất là khi nào?',
    ],
  },
]);

/**
 * The text to send, built from the sections chosen. Questions are numbered 1, 2, 3… straight
 * through, so the client can answer by number. Plain text only: it is pasted into a chat app.
 */
export function intakeText(sectionIds = INTAKE_SECTIONS.filter((section) => section.defaultOn).map((section) => section.id)) {
  const wanted = new Set(sectionIds);
  const chosen = INTAKE_SECTIONS.filter((section) => wanted.has(section.id));
  let number = 0;
  const blocks = chosen.map((section, index) => {
    const lines = section.questions.map((question) => `${++number}. ${question}`);
    return `PHẦN ${index + 1} — ${section.title}\n${lines.join('\n')}`;
  });
  return [INTAKE_TITLE, INTAKE_INTRO, ...blocks, INTAKE_CLOSING].join('\n\n');
}

/** How many questions the chosen sections hold. */
export function intakeQuestionCount(sectionIds) {
  const wanted = new Set(sectionIds);
  return INTAKE_SECTIONS.filter((section) => wanted.has(section.id)).reduce((sum, section) => sum + section.questions.length, 0);
}
