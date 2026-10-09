// ============================================================
// DAVID COACHING — Cẩm nang Thay đổi Hành vi
// ============================================================
// The handbook text for the habits page, as data so it can be tested and
// rendered once. Source: "Cẩm nang Thay đổi Hành vi - David Coaching.docx".
//
// What changed on the way onto the site:
//  * The paper worksheets, the habit-tracker sheets, the identity-commitment page
//    and the appendices are gone — the Thiết lập and Theo dõi tabs are those
//    tools now, and sections that used them point there.
//  * Cronometer and Hevy Coach are now David Coaching, the site itself.
//  * The money-based "habit contract" (a donation if the target is missed) is
//    dropped, with its appendix.
//  * Bullets addressed to the coach about the client ("Khuyến khích khách hàng…")
//    are turned to "you". Passages that are really instructions to the coach are
//    kept, but shown to the coach only (kind: 'coach').
//  * Paper-only phrasing is trimmed ("mang theo, viết lên nó, gấp mép trang").
//  * One typo fixed ("chỉu" → "chỉ").
//
// Block kinds: p, h (sub-heading), ul, ol, quote, formula, callout, cta, coach.

const p = (text) => ({ kind: 'p', text });
const h = (text) => ({ kind: 'h', text });
const ul = (...items) => ({ kind: 'ul', items });
const ol = (...items) => ({ kind: 'ol', items });
const quote = (text, by) => ({ kind: 'quote', text, by });
const formula = (title, text, ...examples) => ({ kind: 'formula', title, text, examples });
const callout = (text) => ({ kind: 'callout', text });
const cta = (label, goto) => ({ kind: 'cta', label, goto });
const coach = (title, ...blocks) => ({ kind: 'coach', title, blocks });

export const HANDBOOK_INTRO = Object.freeze({
  id: 'intro',
  title: 'Lời mở đầu',
  blocks: [
    p('Cẩm nang này không dạy bạn nên tập bài gì, tập mấy buổi một tuần, hay ăn bao nhiêu gram protein mỗi ngày. Những con số đó nằm trong chương trình tập luyện và kế hoạch dinh dưỡng mà tôi thiết kế riêng cho bạn, cập nhật trên David Coaching. Cẩm nang này nói về một thứ nền tảng hơn, và theo tôi, quan trọng hơn cả bản thân chương trình: làm sao để bạn thực sự làm theo nó, ngày này qua ngày khác, kể cả những ngày không có động lực.'),
    p('Trong hơn một thập kỷ làm nghề, tôi nhận ra một sự thật khó chịu: chương trình tập tốt nhất, kế hoạch dinh dưỡng khoa học nhất, cũng vô dụng nếu nó không được thực hiện. Vấn đề của phần lớn khách hàng không phải là thiếu kiến thức. Internet có thừa kiến thức. Vấn đề là khoảng cách giữa biết và làm — và khoảng cách đó được lấp đầy bằng thói quen, không phải bằng ý chí.'),
    p('Nội dung trong cẩm nang này được xây dựng dựa trên khoa học hành vi hiện đại — đặc biệt là các nguyên lý được hệ thống hóa trong cuốn Atomic Habits của James Clear, kết hợp với kinh nghiệm thực tế của tôi khi coaching khách hàng tại phòng gym. Đây không phải là mẹo vặt hay châm ngôn truyền cảm hứng. Đây là một mô hình có thể kiểm chứng về cách não bộ con người hình thành và duy trì hành vi, được diễn giải lại cho bối cảnh cụ thể: phòng tập, bữa ăn, giấc ngủ, và những quyết định nhỏ bạn đưa ra mỗi ngày.'),
    h('Cách sử dụng cẩm nang này'),
    ul(
      'Đọc toàn bộ một lượt trong tuần đầu tiên làm việc cùng tôi, trước khi đi sâu vào chi tiết chương trình tập.',
      'Quay lại đọc từng phần khi bạn cảm thấy mất động lực, trật nhịp, hoặc đang vật lộn với một thói quen cụ thể — mỗi phần được thiết kế để đọc độc lập.',
      'Làm phần Thiết lập thói quen ngay trên website. Đó không phải bài tập lý thuyết — đó là công cụ để bạn thiết kế môi trường và hệ thống sống của chính mình.',
      'Xem đây là tài liệu sống. Quay lại đọc sau ba tháng và bạn sẽ đọc nó khác đi.',
    ),
    quote('Bạn không vươn tới tầm mục tiêu bạn đặt ra. Bạn rơi xuống tầm hệ thống bạn xây dựng.', 'James Clear, Atomic Habits'),
    p('Mục tiêu của tôi không phải là giúp bạn có một cơ thể đẹp trong ba tháng rồi mất đi trong ba tháng tiếp theo. Mục tiêu là giúp bạn trở thành kiểu người mà việc tập luyện và ăn uống có kỷ luật là điều hiển nhiên, không cần phải cố gắng níu kéo bằng động lực. Đó là những gì cẩm nang này sẽ giúp bạn xây dựng.'),
  ],
});

export const HANDBOOK_PARTS = Object.freeze([
  {
    id: 'A',
    title: 'Nền tảng: vì sao thay đổi nhỏ tạo ra kết quả lớn',
    sections: [
      {
        id: 'a1',
        title: 'A1. Lãi kép của thói quen',
        blocks: [
          p('Một vận động viên tốt hơn 1% mỗi ngày không tạo ra khác biệt bạn có thể nhìn thấy trong một buổi tập. Nhưng nếu duy trì trong một năm, phép tính là 1.01³⁶⁵ ≈ 37.8 — tốt hơn gần 38 lần so với điểm xuất phát. Ngược lại, tệ hơn 1% mỗi ngày trong một năm sẽ đưa bạn gần về 0. Đây chính xác là cách British Cycling — đội tuyển đua xe đạp Anh Quốc từng gần một thế kỷ không có huy chương — trở thành đội mạnh nhất lịch sử Olympic chỉ trong 5 năm, bằng cách cải thiện 1% ở hàng trăm chi tiết nhỏ: từ nệm yên xe, gel massage, đến cách rửa tay đúng cách để giảm cảm cúm.'),
          p('Kết quả bạn có hôm nay — cân nặng, sức mạnh, sức bền, tình trạng sức khỏe — là chỉ số trễ (lagging measure) của thói quen bạn đã lặp lại trong quá khứ. Câu hỏi quan trọng không phải là bạn đang ở đâu, mà là quỹ đạo của bạn đang đi về đâu. Một người thừa cân nhưng đang xây dựng thói quen ăn uống đúng mỗi ngày đang ở quỹ đạo tốt hơn nhiều so với một người đang ở mức cân nặng lý tưởng nhưng thói quen đang trôi dần theo hướng xấu.'),
          h('Cao nguyên Tiềm năng Ẩn (Plateau of Latent Potential)'),
          p('Đây là lý do phổ biến nhất khiến khách hàng bỏ cuộc: họ tập đúng, ăn đúng trong 3-4 tuần, không thấy thay đổi rõ rệt trên cân hay gương, và kết luận rằng “cách này không hiệu quả với mình”. Nhưng tiến bộ sinh học không diễn ra tuyến tính. Giống như một cục nước đá trong phòng đang ấm dần từ 25°F lên 31°F — không có gì xảy ra — cho đến khi chạm 32°F, nó tan chảy. Nỗ lực ở 25-31 độ không hề lãng phí, nó đang được tích lũy dưới ngưỡng quan sát được. James Clear gọi giai đoạn này là Cao nguyên Tiềm năng Ẩn, và giai đoạn nản lòng trước khi đột phá là Thung lũng Thất vọng (Valley of Disappointment).'),
          coach('Ứng dụng với khách hàng',
            p('Khi khách hàng nói “em tập cả tháng rồi mà không thấy gì khác”, đừng vội đổi chương trình. Hỏi: hệ thống (số buổi tập, chất lượng giấc ngủ, protein trung bình/ngày) có đang được duy trì đều đặn không? Nếu có, đây là Thung lũng Thất vọng, không phải chương trình sai.'),
            p('Dùng các chỉ số không phải cân nặng (non-scale victories) để khách nhìn thấy bằng chứng tiến bộ trong giai đoạn cao nguyên: số kg tạ tăng, số rep hoàn thành, năng lượng trong ngày, chất lượng giấc ngủ, vòng eo.'),
          ),
          h('Hệ thống, không phải mục tiêu'),
          p('“Giảm 10kg” là một mục tiêu. Mục tiêu chỉ tạo ra thay đổi tạm thời — đạt được rồi, nếu hệ thống phía sau (thói quen ăn uống, vận động) không đổi, bạn sẽ quay về điểm cũ. Đây là hiệu ứng yo-yo kinh điển trong giảm cân. Bốn vấn đề của tư duy chỉ tập trung vào mục tiêu:'),
          ol(
            'Người thắng và người thua có cùng một mục tiêu — ai cũng muốn giảm cân, khác biệt nằm ở hệ thống hằng ngày, không nằm ở mục tiêu.',
            'Đạt mục tiêu chỉ là thay đổi khoảnh khắc — phòng dọn sạch rồi sẽ bừa lại nếu thói quen dọn dẹp không đổi.',
            'Mục tiêu giới hạn hạnh phúc vào một cột mốc duy nhất trong tương lai — bạn trì hoãn sự hài lòng cho đến khi “đạt được”.',
            'Mục tiêu xung đột với tiến bộ dài hạn — nhiều người ngừng tập ngay sau khi đạt mục tiêu vì động lực (cuộc thi, đám cưới, mùa hè) đã qua đi.',
          ),
          p('Vai trò của tôi với bạn không phải là đặt ra một con số để chinh phục rồi buông. Vai trò của tôi là giúp bạn xây dựng một hệ thống mà bạn có thể vận hành suốt đời — bất kể mục tiêu ngắn hạn là gì.'),
        ],
      },
      {
        id: 'a2',
        title: 'A2. Danh tính quyết định hành vi',
        blocks: [
          p('Đây là phần quan trọng nhất của toàn bộ cẩm nang. Thay đổi hành vi thực sự xảy ra ở ba tầng: tầng kết quả (bạn đạt được gì — giảm cân, tăng cơ), tầng quy trình (bạn làm gì — chương trình tập, kế hoạch ăn), và tầng danh tính (bạn tin mình là ai). Hầu hết mọi người bắt đầu từ tầng kết quả. Cách bền vững hơn là đi ngược lại: bắt đầu từ danh tính.'),
          p('So sánh hai câu trả lời khi được mời một điếu thuốc: “Không, cảm ơn, tôi đang cố bỏ” so với “Không, cảm ơn, tôi không hút thuốc”. Câu đầu tiên vẫn tin mình là người hút thuốc đang cố kìm chế. Câu thứ hai đã đổi danh tính. Áp dụng vào bối cảnh của bạn: sự khác biệt giữa “tôi đang cố giảm cân” và “tôi là người chăm sóc cơ thể mình” không chỉ là ngôn từ — nó quyết định hành vi bạn chọn khi không có ai giám sát.'),
          quote('Mục tiêu không phải là đọc một cuốn sách, mục tiêu là trở thành một người đọc sách. Mục tiêu không phải là chạy một cuộc marathon, mục tiêu là trở thành một người chạy bộ.', 'James Clear'),
          h('Quy trình hai bước để thay đổi danh tính'),
          ol(
            'Quyết định bạn muốn trở thành kiểu người nào — không phải “tôi muốn giảm 10kg” mà là “tôi là kiểu người có kỷ luật với sức khỏe của mình”.',
            'Chứng minh điều đó cho chính mình bằng những chiến thắng nhỏ, lặp đi lặp lại.',
          ),
          p('Mỗi lần bạn đến buổi tập đã hẹn, mỗi lần bạn chọn bữa ăn phù hợp thay vì tiện lợi, đó là một lá phiếu cho danh tính “người có kỷ luật”. Bạn không cần một cuộc bỏ phiếu toàn thắng — bạn chỉ cần đa số. Bỏ lỡ một buổi tập không phá hủy danh tính đó, miễn là phần lớn các lá phiếu vẫn đi đúng hướng.'),
          coach('Bài tập cho buổi onboarding',
            ul(
              'Hỏi khách hàng: “Ai là kiểu người có thể đạt được kết quả bạn muốn?” — không hỏi “bạn muốn giảm bao nhiêu kg”.',
              'Giúp khách viết ra 2-3 câu danh tính cụ thể và treo nó ở nơi nhìn thấy mỗi ngày — tủ lạnh, màn hình khóa điện thoại.',
              'Trong các buổi PT tiếp theo, liên tục gắn hành động với danh tính: “Đây chính là điều một người coi trọng sức khỏe sẽ làm” — thay vì chỉ khen kết quả.',
            ),
          ),
          cta('Viết câu “Tôi là kiểu người…” của bạn', 'setup'),
        ],
      },
      {
        id: 'a3',
        title: 'A3. Vòng lặp thói quen và Bốn Quy luật',
        blocks: [
          p('Mọi thói quen — tốt hay xấu — vận hành qua cùng một chu trình bốn bước, lặp lại liên tục và gần như hoàn toàn ở mức vô thức:'),
          callout('1. Tín hiệu (Cue) → 2. Khao khát (Craving) → 3. Phản ứng (Response) → 4. Phần thưởng (Reward)'),
          ul(
            'Tín hiệu: một mẩu thông tin dự báo phần thưởng — đồng hồ báo 6 giờ sáng, túi tập để sẵn cạnh cửa.',
            'Khao khát: động lực đằng sau hành vi. Bạn không thèm tập gym, bạn thèm cảm giác tràn năng lượng hoặc sự tự hào sau đó.',
            'Phản ứng: hành vi thực tế — bạn có tập hay không, phụ thuộc vào mức độ khao khát và độ khó (ma sát) của hành động.',
            'Phần thưởng: thỏa mãn khao khát, đồng thời dạy não bộ ghi nhớ “hành vi này đáng lặp lại”.',
          ),
          p('Từ bốn bước này, James Clear hệ thống hóa thành Bốn Quy luật Thay đổi Hành vi — một khung ứng dụng thực tế mà toàn bộ Phần B của cẩm nang này sẽ khai triển chi tiết:'),
          formula('Bốn Quy luật', '', 'Quy luật 1 (Tín hiệu) — Làm cho nó Hiển nhiên', 'Quy luật 2 (Khao khát) — Làm cho nó Hấp dẫn', 'Quy luật 3 (Phản ứng) — Làm cho nó Dễ dàng', 'Quy luật 4 (Phần thưởng) — Làm cho nó Thỏa mãn'),
          p('Muốn xây một thói quen tốt (tập luyện, ăn uống điều độ, ngủ đủ giấc), áp dụng cả bốn quy luật theo chiều thuận. Muốn phá một thói quen xấu (ăn vặt đêm khuya, lướt điện thoại thay vì ngủ), đảo ngược cả bốn: làm cho nó vô hình, kém hấp dẫn, khó khăn, và không thỏa mãn. Phần B sẽ đi sâu vào từng quy luật với ứng dụng cụ thể cho tập luyện và dinh dưỡng.'),
          cta('Thiết lập thói quen của bạn', 'setup'),
        ],
      },
    ],
  },
  {
    id: 'B',
    title: 'Bốn Quy luật — ứng dụng vào tập luyện và dinh dưỡng',
    sections: [
      {
        id: 'b1',
        title: 'B1. Quy luật 1 — Làm cho nó Hiển nhiên',
        blocks: [
          p('Phần lớn thói quen thất bại không phải vì thiếu động lực, mà vì thiếu nhận thức. Con người thường không nhận ra tín hiệu nào đang kích hoạt hành vi của mình. Bước đầu tiên để thay đổi là biến những tín hiệu vô thức trở thành có ý thức.'),
          h('Ý định thực thi (Implementation Intention)'),
          p('Nghiên cứu cho thấy những người lập kế hoạch cụ thể về thời gian và địa điểm hành động có tỷ lệ thực hiện cao hơn đáng kể so với những người chỉ có ý định chung chung. Công thức:'),
          formula('Công thức Ý định thực thi', 'Tôi sẽ [HÀNH VI] vào lúc [THỜI GIAN] tại [ĐỊA ĐIỂM].',
            'Tôi sẽ tập luyện lúc 6:30 sáng tại phòng gym gần nhà, trước khi đi làm.',
            'Tôi sẽ chuẩn bị bữa trưa vào 20:00 tối hôm trước, tại bếp nhà mình.'),
          h('Chồng thói quen (Habit Stacking)'),
          p('Gắn một thói quen mới vào một thói quen đã ổn định sẵn trong ngày của bạn — thay vì cố nhớ nó một cách độc lập.'),
          formula('Công thức Chồng thói quen', 'Sau khi [THÓI QUEN HIỆN TẠI], tôi sẽ [THÓI QUEN MỚI].',
            'Sau khi tôi pha xong ly cà phê sáng, tôi sẽ chuẩn bị túi đồ tập để ở cửa ra vào.',
            'Sau khi tôi ngồi vào bàn ăn tối, tôi sẽ mở David Coaching ghi lại bữa trưa.'),
          p('Yếu tố quyết định: tín hiệu phải cụ thể và có thể hành động ngay. “Sau giờ nghỉ trưa tôi sẽ tập 10 cái hít đất” mơ hồ — trước hay sau khi ăn? Ở đâu? “Sau khi đóng laptop nghỉ trưa, tôi sẽ tập 10 cái hít đất ngay cạnh bàn làm việc” thì không còn mơ hồ.'),
          h('Thiết kế môi trường'),
          p('Môi trường định hình hành vi mạnh hơn ý chí. Não bộ phản ứng với những gì nổi bật trong tầm mắt. Nguyên tắc: làm cho tín hiệu của thói quen tốt hiển nhiên và dễ thấy, làm cho tín hiệu của thói quen xấu biến mất khỏi tầm mắt.'),
          p('Ứng dụng thực tế:'),
          ul(
            'Để sẵn quần áo tập và bình nước ngay cạnh giường hoặc cửa ra vào từ tối hôm trước.',
            'Chuẩn bị sẵn hộp cơm/trái cây cắt sẵn ở vị trí đầu tiên nhìn thấy khi mở tủ lạnh; giấu đồ ăn vặt vào ngăn kín, khó lấy.',
            'Đặt lịch tập cố định trong lịch điện thoại với thông báo nhắc trước 30 phút — biến thời gian thành tín hiệu chủ động thay vì chờ “cảm thấy có động lực”.',
            'Mỗi không gian nên gắn với một chức năng: nếu có thể, tách khu vực ăn uống khỏi khu vực làm việc/giải trí để tránh ăn vô thức trước màn hình.',
          ),
          h('Bí mật của tự chủ: giảm tiếp xúc, không phải chống lại'),
          p('Tự chủ (self-control) là chiến lược ngắn hạn, không phải giải pháp dài hạn — không ai có đủ ý chí để liên tục chống lại cám dỗ. Người có vẻ “tự chủ tốt” thực ra thường chỉ đơn giản là ít đặt mình vào tình huống cám dỗ hơn. Nghịch đảo của Quy luật 1: làm cho thói quen xấu trở nên vô hình.'),
          ul(
            'Không mua sẵn đồ ăn vặt ở nhà thay vì cố “không đụng vào” khi đã có sẵn trong bếp.',
            'Tắt thông báo app giao đồ ăn nhanh, xoá khỏi màn hình chính.',
            'Nếu hay bỏ tập vì lướt điện thoại buổi sáng, để điện thoại ở phòng khác qua đêm, dùng đồng hồ báo thức riêng.',
          ),
          cta('Viết tín hiệu cho thói quen của bạn', 'setup'),
        ],
      },
      {
        id: 'b2',
        title: 'B2. Quy luật 2 — Làm cho nó Hấp dẫn',
        blocks: [
          p('Thói quen là một vòng lặp được thúc đẩy bởi dopamine. Điều thú vị: dopamine tăng vọt không phải khi bạn nhận được phần thưởng, mà khi bạn kỳ vọng nó. Chính sự kỳ vọng — không phải sự thỏa mãn — mới là thứ thúc đẩy hành động. Đây là lý do vì sao việc khiến một thói quen trở nên hấp dẫn trong tâm trí lại quan trọng đến vậy.'),
          h('Gộp cám dỗ (Temptation Bundling)'),
          p('Ghép một hành động bạn cần làm với một hành động bạn muốn làm, để việc “cần” trở nên hấp dẫn hơn.'),
          formula('Công thức Gộp cám dỗ', 'Sau khi [HÀNH VI CẦN LÀM], tôi sẽ [HÀNH VI MUỐN LÀM].',
            'Chỉ nghe podcast/playlist yêu thích khi đang tập luyện — không nghe vào lúc khác.',
            'Chỉ xem tập phim yêu thích trong lúc đạp xe đạp tại chỗ (cardio).'),
          h('Vai trò của gia đình, bạn bè và cộng đồng'),
          p('Con người có xu hướng bắt chước hành vi của ba nhóm xã hội: nhóm gần gũi (gia đình, bạn thân), nhóm đông (cộng đồng xung quanh), và nhóm quyền lực (người có địa vị, được ngưỡng mộ). Một thói quen sẽ hấp dẫn hơn rất nhiều nếu nó là hành vi “bình thường” trong nhóm bạn thuộc về.'),
          p('Ứng dụng thực tế:'),
          ul(
            'Tập cùng bạn bè, tham gia nhóm nhỏ tại phòng gym, hoặc chia sẻ tiến trình với người thân — biến việc tập luyện thành chuẩn mực xã hội của bạn, không phải nỗ lực đơn độc.',
            'Nếu môi trường xã hội hiện tại của bạn (đồng nghiệp hay rủ nhậu, gia đình ăn uống không lành mạnh) đi ngược với mục tiêu, hãy tìm một cộng đồng phụ mới có cùng giá trị — một lớp nhóm, một hội chạy bộ.',
            'Với khách hàng của David Coaching: các buổi PT định kỳ và checklist chia sẻ tiến trình chính là một hình thức “cộng đồng” tạo áp lực tích cực và chuẩn mực xã hội.',
          ),
          h('Định hình lại cảm nhận: từ “phải” sang “được”'),
          p('Mọi hành vi đều có một động lực bề mặt và một động lực sâu xa hơn phía dưới. Cảm giác hấp dẫn hay không hấp dẫn không đến từ bản thân hành động, mà đến từ cách bạn dự đoán và diễn giải nó trong đầu. Thay vì nghĩ “tôi phải đi tập”, diễn giải lại thành “tôi được có cơ hội xây dựng sức mạnh và năng lượng cho cơ thể mình”. Đây không phải là tự lừa dối bản thân — đây là việc chọn khung diễn giải nào phản ánh đúng lợi ích thật sự của hành động.'),
          quote('Với một lý do đủ lớn (why), bạn có thể vượt qua bất kỳ cách thức khó khăn nào (how).', 'Friedrich Nietzsche, trích trong Atomic Habits'),
        ],
      },
      {
        id: 'b3',
        title: 'B3. Quy luật 3 — Làm cho nó Dễ dàng',
        blocks: [
          p('Số lần bạn lặp lại một hành vi quan trọng hơn thời gian đã trôi qua. Không có con số kỳ diệu “21 ngày” hay “66 ngày” để hình thành thói quen — điều quan trọng là tần suất thực hiện. Và tần suất chỉ có thể cao khi hành vi đủ dễ để thực hiện, kể cả vào những ngày bạn mệt mỏi, bận rộn, hoặc không có động lực.'),
          h('Định luật Nỗ lực Tối thiểu'),
          p('Con người tự nhiên hướng về lựa chọn tốn ít công sức nhất. Đây không phải là điểm yếu — đây là cách não bộ tiết kiệm năng lượng. Chiến lược đúng không phải là cố chống lại quy luật này, mà là thiết kế môi trường sao cho hành vi đúng cũng là hành vi ít ma sát nhất.'),
          p('Giảm ma sát cho hành vi tốt:'),
          ul(
            'Chuẩn bị đồ tập, giày, bình nước từ tối hôm trước — giảm số bước cần làm vào buổi sáng.',
            'Chọn phòng gym trên đường đi làm/đi học thay vì phòng gym “tốt hơn” nhưng xa hơn 20 phút — khoảng cách di chuyển là yếu tố dự báo tỷ lệ bỏ tập mạnh nhất.',
            'Meal prep theo tuần thay vì nấu từng bữa — biến quyết định ăn uống lành mạnh thành lựa chọn mặc định, không cần cân nhắc mỗi lần đói.',
            'Đăng ký gói tập trả trước theo năm/quý (một quyết định một lần) thay vì trả theo buổi — biến việc đến gym thành “đã trả tiền rồi, phải đi” thay vì một quyết định phải đưa ra mỗi ngày.',
          ),
          p('Tăng ma sát cho hành vi xấu:'),
          ul(
            'Không tích trữ đồ ăn vặt tại nhà — mỗi lần muốn ăn phải ra ngoài mua, ma sát đó đủ để nhiều người bỏ qua.',
            'Log out ứng dụng giao đồ ăn nhanh, xoá thông tin thẻ đã lưu.',
            'Nếu hay bỏ tập vì rủ rê đi nhậu sau giờ làm, chuẩn bị sẵn lý do và đồ tập trong cốp xe để việc “đến gym trước” dễ hơn việc “đi nhậu trước”.',
          ),
          h('Quy tắc Hai Phút'),
          p('Mọi thói quen lớn đều có thể được thu nhỏ thành một phiên bản khởi động chưa đến hai phút. Mục tiêu không phải là hoàn thành cả buổi tập trong hai phút — mục tiêu là biến việc “bắt đầu” trở nên gần như không có rào cản. Một khi đã bắt đầu, việc tiếp tục dễ hơn nhiều so với việc khởi động từ số không.'),
          ul(
            '“Tập thể dục 3 lần/tuần” → phiên bản 2 phút: “Thay đồ tập và bước ra khỏi cửa.”',
            '“Ăn uống lành mạnh” → phiên bản 2 phút: “Chuẩn bị thực đơn tuần vào Chủ nhật.”',
            '“Ngủ đủ 7-8 tiếng” → phiên bản 2 phút: “Tắt màn hình và đặt điện thoại ngoài phòng ngủ lúc 22:00.”',
          ),
          p('Đây cũng là chiến lược quan trọng nhất cho người mới bắt đầu hoặc đang mất động lực nghiêm trọng: đừng bắt đầu bằng chương trình tối ưu, hãy bắt đầu bằng phiên bản chuẩn hóa tối thiểu, rồi mới tối ưu dần. Không thể cải thiện một thói quen chưa tồn tại.'),
          h('Tự động hóa: biến hành vi tốt thành điều tất yếu'),
          p('Một quyết định một lần (one-time decision) có thể tạo ra lợi ích lặp lại mãi mãi mà không cần ý chí liên tục. Đây là hình thức mạnh nhất của Quy luật 3.'),
          ul(
            'Đặt lịch PT cố định hằng tuần thay vì đặt lịch linh hoạt từng buổi — biến buổi tập thành cam kết cấu trúc thay vì quyết định phải đưa ra mỗi tuần.',
            'Đặt báo thức điện thoại nhắc ghi bữa ăn trên David Coaching vào giờ cố định.',
            'Chuyển khoản tự động một khoản nhỏ vào “quỹ sức khỏe” mỗi tháng để duy trì gói tập/PT — loại bỏ rào cản tài chính là rào cản quyết định lại từ đầu mỗi tháng.',
          ),
          cta('Viết phiên bản 2 phút của bạn', 'setup'),
        ],
      },
      {
        id: 'b4',
        title: 'B4. Quy luật 4 — Làm cho nó Thỏa mãn',
        blocks: [
          quote('Quy luật Cốt lõi của Thay đổi Hành vi: điều gì được thưởng ngay lập tức sẽ được lặp lại. Điều gì bị phạt ngay lập tức sẽ bị tránh né.', 'James Clear'),
          p('Não bộ con người được lập trình để ưu tiên phần thưởng tức thì hơn phần thưởng trì hoãn — một di sản tiến hóa từ thời tổ tiên chúng ta cần phản ứng nhanh với môi trường xung quanh để sống sót. Đây chính là lý do việc tập luyện và ăn uống lành mạnh khó duy trì: chi phí (mệt mỏi, phải kiêng khem) đến ngay lập tức, còn phần thưởng (sức khỏe, vóc dáng) đến sau hàng tuần, hàng tháng. Ngược lại, đồ ăn nhanh và lười vận động mang lại thỏa mãn tức thì, còn cái giá phải trả đến rất muộn.'),
          p('Chiến lược: tạo ra một hình thức thỏa mãn tức thì, gắn liền với hành vi dài hạn đúng đắn — để não bộ có bằng chứng ngay lập tức rằng hành động này “đáng làm”.'),
          h('Theo dõi thói quen (Habit Tracking)'),
          p('Ghi lại một hành vi đã hoàn thành — đánh dấu X vào lịch, tích vào ứng dụng — tạo ra một dạng thỏa mãn tức thì: bằng chứng trực quan rằng bạn đang tiến bộ. Đây cũng là công cụ nhận thức: bạn không thể cải thiện một thứ bạn không đo lường. Tab Theo dõi chính là bảng theo dõi của bạn.'),
          ul(
            'Đừng làm đứt chuỗi (Don’t break the chain) — nhìn thấy chuỗi ngày liên tục tạo động lực mạnh để không phá vỡ nó.',
            'Không bao giờ bỏ lỡ hai lần liên tiếp (Never miss twice) — bỏ lỡ một buổi tập là tai nạn, bỏ lỡ hai buổi liên tiếp bắt đầu là một thói quen mới đang hình thành. Quay lại ngay ở buổi tiếp theo.',
            'Đo lường không chỉ giới hạn ở cân nặng — số buổi tập hoàn thành, số ngày đạt mục tiêu protein, chất lượng giấc ngủ đều là những chỉ số hợp lệ, đặc biệt hữu ích khi cân nặng chững lại (Cao nguyên Tiềm năng Ẩn ở phần A1).',
          ),
          h('Đối tác trách nhiệm'),
          p('Chúng ta luôn cố gắng thể hiện phiên bản tốt nhất của mình trước người khác. Khi có ai đó biết và theo dõi cam kết của bạn, cái giá phải trả cho việc không thực hiện tăng lên đáng kể — không chỉ là thất hứa với bản thân, mà còn với người khác.'),
          ul(
            'Vai trò PT của tôi tự nhiên đã là một hình thức đối tác trách nhiệm — lịch hẹn cố định, check-in hằng tuần chính là cấu trúc “có người đang theo dõi”.',
            'Công khai mục tiêu với một người thân/bạn bè cụ thể, hoặc tìm một partner tập cùng để tạo áp lực tích cực hai chiều.',
          ),
          p('Lưu ý quan trọng: phần thưởng ngắn hạn cần được chọn sao cho không mâu thuẫn với danh tính dài hạn bạn đang xây dựng. Tự thưởng một chiếc bánh kem sau buổi tập chân nặng có thể tạo ra hai lá phiếu đối lập cho hai danh tính khác nhau, triệt tiêu lẫn nhau. Một buổi massage, một món đồ tập mới, hoặc đơn giản là việc đánh dấu X vào tracker, là phần thưởng phù hợp hơn — vừa là một điều xa xỉ, vừa là một lá phiếu cho việc chăm sóc cơ thể.'),
          cta('Bắt đầu theo dõi hôm nay', 'today'),
        ],
      },
    ],
  },
  {
    id: 'C',
    title: 'Từ ổn định đến bền vững lâu dài',
    sections: [
      {
        id: 'c1',
        title: 'C1. Chọn đúng sân chơi của bạn',
        blocks: [
          p('Bốn Quy luật giúp bất kỳ thói quen nào cũng dễ xây dựng hơn. Nhưng thói quen dễ duy trì nhất là thói quen phù hợp với bản chất tự nhiên của bạn — tạng người, sở thích vận động, nhịp sinh học, tính cách. Gen không loại bỏ nhu cầu nỗ lực — gen giúp bạn biết nên nỗ lực vào đâu.'),
          p('Trong bối cảnh tập luyện: không phải ai cũng cần yêu thích powerlifting để có sức khỏe tốt. Người thích vận động ngoài trời có thể xây dựng thói quen bền vững hơn nhiều qua chạy bộ, leo núi, bơi lội, so với việc ép mình vào phòng gym truyền thống. Vai trò của tôi là giúp bạn tìm ra hình thức vận động và cấu trúc dinh dưỡng mà bạn có thể duy trì suốt đời — không phải hình thức “tối ưu về mặt lý thuyết” nhưng bạn ghét mỗi lần thực hiện.'),
          h('Câu hỏi tự đánh giá'),
          ul(
            'Tôi thích tập một mình hay tập theo nhóm/lớp?',
            'Tôi có xu hướng làm tốt hơn với cấu trúc chặt chẽ (chương trình cố định) hay sự linh hoạt (tự điều chỉnh theo cảm giác)?',
            'Khung giờ nào trong ngày tôi có năng lượng và kỷ luật cao nhất — sáng sớm, trưa, hay tối?',
          ),
          p('Đừng so sánh tiến độ của mình với người khác. Hãy so sánh với chính mình ở quá khứ. Gen và hoàn cảnh sống là khác nhau — điều quan trọng là bạn có đang khai thác hết tiềm năng của chính mình không.'),
        ],
      },
      {
        id: 'c2',
        title: 'C2. Quy luật Goldilocks và Trạng thái Flow',
        blocks: [
          p('Con người đạt động lực cao nhất khi đối mặt với thử thách nằm ngay ở rìa năng lực hiện tại — không quá dễ (gây nhàm chán) và không quá khó (gây lo lắng, bỏ cuộc). Đây gọi là Quy luật Goldilocks. Nghiên cứu chỉ ra trạng thái flow — trạng thái “nhập tâm” hoàn toàn — thường xảy ra khi nhiệm vụ khó hơn năng lực hiện tại khoảng 4%.'),
          p('Ứng dụng vào chương trình tập: giai đoạn đầu, mục tiêu là làm cho thói quen dễ nhất có thể để duy trì đều đặn (Quy luật 3). Một khi thói quen đã ổn định, sự tiến bộ và những thử thách mới — tăng tạ, kỹ thuật mới, mục tiêu hiệu suất — là điều cần thiết để duy trì hứng thú lâu dài. Đây cũng chính là lý do định kỳ điều chỉnh chương trình tập (progressive overload, đổi bài, đổi mục tiêu chu kỳ) quan trọng không chỉ về mặt sinh lý mà cả về mặt tâm lý.'),
          h('Sự nhàm chán — kẻ thù thật sự, không phải thất bại'),
          p('Vận động viên đỉnh cao không phải là người có động lực vô tận. Họ cảm thấy chán, mệt, và không muốn tập giống như bất kỳ ai khác. Khác biệt duy nhất: họ vẫn xuất hiện, kể cả khi không có tâm trạng.'),
          quote('Người chuyên nghiệp tuân theo lịch trình; người nghiệp dư để cuộc sống cản đường.', 'James Clear'),
          p('Đây là ranh giới thực sự giữa người đạt được kết quả bền vững và người không: khả năng chịu đựng sự nhàm chán của việc lặp lại cùng một hành vi, ngày này qua ngày khác, ngay cả khi nó không còn mới mẻ hay thú vị. Cách duy nhất để trở nên xuất sắc thực sự là học cách yêu (hoặc ít nhất chấp nhận) sự lặp lại đó.'),
        ],
      },
      {
        id: 'c3',
        title: 'C3. Mặt trái của thói quen: khi tự động hóa trở thành cái bẫy',
        blocks: [
          p('Thói quen giải phóng năng lực tinh thần — nhưng cái giá phải trả là bạn dễ trở nên kém nhạy cảm với phản hồi. Khi một động tác đã trở nên tự động, bạn ngừng chú ý đến những lỗi nhỏ. Đây là lý do vì sao “tập nhiều năm” không tự động đồng nghĩa với “tập đúng kỹ thuật” — lặp lại một sai lầm hàng nghìn lần chỉ khắc sâu thêm sai lầm đó.'),
          formula('Công thức của sự thành thạo thực sự', 'Thói quen (tự động hóa) + Luyện tập có chủ đích (deliberate practice, có phản hồi và điều chỉnh) = Sự thành thạo'),
          h('Phản tư định kỳ'),
          p('Những vận động viên và chuyên gia hàng đầu đều có một hệ thống rà soát định kỳ — không phải để trừng phạt bản thân, mà để phát hiện sớm những gì đang trôi dần sai hướng. Tôi khuyến khích khách hàng áp dụng hai loại phản tư đơn giản:'),
          ul(
            'Rà soát hằng tháng: Điều gì đang hiệu quả? Điều gì không? Tôi cần điều chỉnh gì trong hệ thống (không phải mục tiêu)?',
            'Rà soát mỗi quý: Danh tính tôi đang xây dựng có còn đúng với con người tôi muốn trở thành không? Tôi có đang sống đúng với các giá trị tôi đề ra không?',
          ),
          h('Giữ danh tính linh hoạt'),
          p('Một nghịch lý: chính niềm tự hào về danh tính giúp bạn duy trì thói quen cũng có thể khiến bạn cứng nhắc, từ chối thay đổi khi hoàn cảnh đòi hỏi. Người quá gắn chặt với danh tính “vận động viên” có thể rơi vào khủng hoảng khi chấn thương buộc phải nghỉ tập dài hạn. Giải pháp: định nghĩa danh tính đủ rộng để linh hoạt theo hoàn cảnh — không phải “tôi là người tập gym 6 buổi/tuần” mà là “tôi là người luôn tìm cách chăm sóc cơ thể mình, bằng hình thức phù hợp với hoàn cảnh hiện tại”.'),
          quote('Cái mềm dẻo, uyển chuyển thuộc về sự sống. Cái cứng nhắc, bất biến thuộc về cái chết.', 'Lão Tử, Đạo Đức Kinh'),
        ],
      },
    ],
  },
  {
    id: 'D',
    title: 'Tổng kết',
    sections: [
      {
        id: 'd1',
        title: 'D1. Hai mươi nguyên lý cốt lõi',
        blocks: [
          p('Bản tóm lược nhanh để bạn đọc lại bất cứ khi nào cần một lời nhắc.'),
          ol(
            'Kết quả bạn có hôm nay là chỉ số trễ của thói quen quá khứ — quan tâm đến quỹ đạo, không chỉ điểm hiện tại.',
            'Tiến bộ không tuyến tính. Cao nguyên Tiềm năng Ẩn là có thật — đừng bỏ cuộc trong Thung lũng Thất vọng.',
            'Tập trung vào hệ thống, không phải mục tiêu. Bạn rơi xuống tầm hệ thống bạn xây dựng.',
            'Thay đổi hành vi bền vững là thay đổi danh tính, không chỉ thay đổi kết quả.',
            'Mỗi hành động là một lá phiếu cho kiểu người bạn muốn trở thành. Bạn không cần thắng tuyệt đối, chỉ cần thắng đa số.',
            'Mọi thói quen vận hành qua vòng lặp Tín hiệu → Khao khát → Phản ứng → Phần thưởng.',
            'Quy luật 1: Làm cho nó Hiển nhiên — dùng ý định thực thi, chồng thói quen, thiết kế môi trường.',
            'Quy luật 2: Làm cho nó Hấp dẫn — dùng gộp cám dỗ, chọn đúng cộng đồng xã hội.',
            'Quy luật 3: Làm cho nó Dễ dàng — giảm ma sát, dùng Quy tắc Hai Phút, tự động hóa quyết định.',
            'Quy luật 4: Làm cho nó Thỏa mãn — theo dõi tiến độ, tìm đối tác trách nhiệm, thưởng đúng cách.',
            'Muốn phá thói quen xấu: đảo ngược cả bốn quy luật — vô hình, kém hấp dẫn, khó khăn, không thỏa mãn.',
            'Không bao giờ bỏ lỡ hai lần liên tiếp.',
            'Chọn hình thức vận động và dinh dưỡng phù hợp với bản chất tự nhiên của bạn, không phải phiên bản “tối ưu lý thuyết” bạn ghét thực hiện.',
            'Động lực cao nhất nằm ở rìa năng lực hiện tại — không quá dễ, không quá khó.',
            'Kẻ thù thực sự không phải thất bại, mà là sự nhàm chán. Người chuyên nghiệp vẫn xuất hiện khi không có tâm trạng.',
            'Thói quen + Luyện tập có chủ đích = Thành thạo thực sự.',
            'Rà soát định kỳ hằng tháng và hằng quý để tránh trôi dạt không nhận ra.',
            'Giữ danh tính đủ linh hoạt để thích ứng khi hoàn cảnh thay đổi.',
            'Đừng để một khoảnh khắc trật nhịp phá hủy cả hệ thống — quay lại ngay ở lần kế tiếp.',
            'Thay đổi có ý nghĩa không cần phải là thay đổi lớn. Những gì nhỏ và lặp lại đều đặn mới là thứ tồn tại lâu dài.',
          ),
        ],
      },
      {
        id: 'd3',
        title: 'Lời kết',
        blocks: [
          p('Không có cẩm nang nào, kể cả cẩm nang này, có thể tập thay bạn hay ăn thay bạn. Những gì nó có thể làm là giúp bạn hiểu vì sao bạn đã từng thất bại với những nỗ lực trước đây — không phải vì bạn thiếu ý chí, mà vì hệ thống chưa được thiết kế đúng — và trao cho bạn một khung tư duy để thiết kế lại nó.'),
          p('Vai trò của tôi trong hành trình này không chỉ là người lên chương trình tập hay tính toán khẩu phần ăn. Vai trò của tôi là người đồng hành giúp bạn xây dựng hệ thống đó, điều chỉnh nó khi cuộc sống thay đổi, và nhắc bạn quay lại đúng hướng khi bạn trật nhịp — điều chắc chắn sẽ xảy ra, và hoàn toàn bình thường.'),
          p('Chào mừng bạn đến với David Coaching. Hãy bắt đầu từ những điều nhỏ nhất.'),
          p('— David (Đình Bảo)'),
          cta('Thiết lập thói quen đầu tiên của bạn', 'setup'),
        ],
      },
    ],
  },
]);

/** "I'm struggling with…" — each lands on the part of the handbook written for it. */
export const HANDBOOK_STRUGGLES = Object.freeze([
  { label: 'Tập cả tháng mà chưa thấy thay đổi', target: 'a1' },
  { label: 'Hay quên, không biết bắt đầu từ đâu', target: 'b1' },
  { label: 'Không có hứng thú', target: 'b2' },
  { label: 'Quá bận hoặc quá mệt', target: 'b3' },
  { label: 'Vừa bỏ lỡ vài ngày', target: 'b4' },
  { label: 'Thấy nhàm chán', target: 'c2' },
  { label: 'Không biết thói quen nào hợp với mình', target: 'c1' },
]);

export function handbookSections() {
  return [HANDBOOK_INTRO, ...HANDBOOK_PARTS.flatMap((part) => part.sections)];
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[char]);
}

function blockMarkup(block, { forCoach }) {
  switch (block.kind) {
    case 'p': return `<p>${escapeHtml(block.text)}</p>`;
    case 'h': return `<h4>${escapeHtml(block.text)}</h4>`;
    case 'ul': return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
    case 'ol': return `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
    case 'quote': return `<blockquote><p>“${escapeHtml(block.text)}”</p><cite>— ${escapeHtml(block.by)}</cite></blockquote>`;
    case 'callout': return `<p class="hb-callout">${escapeHtml(block.text)}</p>`;
    case 'formula': return `<div class="hb-formula"><strong>${escapeHtml(block.title)}</strong>${block.text ? `<p>${escapeHtml(block.text)}</p>` : ''}${block.examples.length ? `<ul>${block.examples.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>` : ''}</div>`;
    case 'cta': return forCoach ? '' : `<p><button type="button" class="btn btn-outline" data-goto="${escapeHtml(block.goto)}">${escapeHtml(block.label)}</button></p>`;
    case 'coach': return forCoach
      ? `<aside class="hb-coach"><strong>Ghi chú cho HLV · ${escapeHtml(block.title)}</strong>${block.blocks.map((inner) => blockMarkup(inner, { forCoach })).join('')}</aside>`
      : '';
    default: return '';
  }
}

function sectionMarkup(section, options) {
  return `<details class="hb-section" id="hb-${section.id}" data-section="${section.id}"><summary>${escapeHtml(section.title)}</summary><div class="hb-body">${section.blocks.map((block) => blockMarkup(block, options)).join('')}</div></details>`;
}

/** The whole handbook tab. The coach also gets the passages written for the coach;
 *  the client gets the buttons that lead to the tools instead. */
export function handbookMarkup({ forCoach = false } = {}) {
  const options = { forCoach };
  const struggles = `<div class="hb-struggles"><strong>Tôi đang vật lộn với…</strong><div>${HANDBOOK_STRUGGLES.map((item) => `<button type="button" class="hb-chip" data-open="${item.target}">${escapeHtml(item.label)}</button>`).join('')}</div></div>`;
  const parts = HANDBOOK_PARTS.map((part) => `
    <div class="hb-part"><span class="eyebrow">Phần ${part.id}</span><h3>${escapeHtml(part.title)}</h3>
    ${part.sections.map((section) => sectionMarkup(section, options)).join('')}</div>`).join('');
  return `
    <div class="hb-head"><span class="eyebrow">Cẩm nang</span><h2>Thay đổi hành vi, thay đổi cuộc sống</h2>
      <p class="muted">Cẩm nang khoa học hành vi cho hành trình tập luyện và dinh dưỡng, biên soạn bởi David.</p></div>
    ${struggles}
    <div class="hb-part">${sectionMarkup(HANDBOOK_INTRO, options)}</div>
    ${parts}`;
}
