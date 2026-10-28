import type { TrendProfile } from "./types";

export const DIMENSION_TO_PERSONALITY: Record<string, string> = {
  security: "S", experience: "P", avoidance: "A", control: "C", independence: "I",
};

export function personalityCodeForTrendKey(key: string) {
  return key.split("-").map((part) => DIMENSION_TO_PERSONALITY[part] ?? "").join("") || key;
}

export function characterIdForTrendKey(imageChoice: "SUN" | "MOON", key: string) {
  return `${imageChoice}_${personalityCodeForTrendKey(key)}`;
}

const base = (input: Omit<TrendProfile, "kind" | "status" | "sortOrder">): TrendProfile => ({
  ...input,
  personalityCode: input.personalityCode || DIMENSION_TO_PERSONALITY[input.key] || input.key,
  kind: "base",
  status: "published",
  sortOrder: 0,
});

const hybrid = (input: Omit<TrendProfile, "kind" | "status" | "sortOrder">): TrendProfile => ({
  ...input,
  personalityCode: input.personalityCode || personalityCodeForTrendKey(input.key),
  kind: "hybrid",
  status: "draft",
  sortOrder: 10,
});

export const TREND_PROFILES: TrendProfile[] = [
  base({
    key: "security", slug: "nguoi-xay-nen", title: "Người xây nền", tagline: "An tâm trước, đi xa sau.", icon: "◒",
    description: "Bạn thường cân nhắc khoản chi hôm nay cùng với những dự định và cảm giác an tâm cho sau này.",
    strengths: ["Nhìn được bức tranh dài hạn", "Giữ cảm giác an toàn cho cả hai"],
    watchouts: ["Đừng để lo xa lấy mất những niềm vui vừa sức"],
    harmonyReason: "Bạn tạo cảm giác vững vàng khi mọi người cần một điểm tựa.",
    frictionReason: "Bạn có thể cần thêm thời gian trước những lựa chọn nhiều bất ngờ.",
    conversationPrompts: ["Điều gì đáng để hai đứa chi thêm, và điều gì mình muốn để dành?"],
    dimensionKeys: ["security"],
  }),
  base({
    key: "experience", slug: "nguoi-song-day", title: "Người sống đầy", tagline: "Tiền cũng có thể trở thành kỷ niệm.", icon: "✦",
    description: "Bạn dễ nhìn thấy giá trị của tiền trong những trải nghiệm và kết nối. Một kế hoạch tốt vẫn chừa chỗ cho niềm vui.",
    strengths: ["Tạo năng lượng và kỷ niệm cho mối quan hệ", "Nhìn ra giá trị cảm xúc của một khoản chi"],
    watchouts: ["Niềm vui sẽ nhẹ hơn khi không để lại áp lực sau đó"],
    harmonyReason: "Bạn thường kéo cuộc trò chuyện về điều hai người thật sự muốn trải nghiệm.",
    frictionReason: "Bạn có thể thấy những giới hạn tài chính làm mất nhịp vui.",
    conversationPrompts: ["Dịp nào hai đứa thật sự muốn ưu tiên tiền cho một trải nghiệm?"],
    dimensionKeys: ["experience"],
  }),
  base({
    key: "avoidance", slug: "nguoi-mo-loi", title: "Người đang học cách mở lời", tagline: "Nói ra để nhẹ lòng hơn.", icon: "△",
    description: "Khi chuyện tiền dễ làm không khí khó xử, bạn thường cần thêm thời gian để bắt đầu cuộc trò chuyện.",
    strengths: ["Nhạy cảm với cảm xúc của người đối diện", "Biết giữ sự mềm mại trong cuộc trò chuyện"],
    watchouts: ["Im lặng quá lâu có thể khiến hai người đoán ý nhau"],
    harmonyReason: "Bạn nhận ra những cảm xúc nằm phía sau một con số.",
    frictionReason: "Bạn dễ lùi lại khi cuộc trò chuyện cần một câu trả lời thật rõ.",
    conversationPrompts: ["Mình hơi ngại nói chuyện này, nhưng muốn cùng bạn chọn mức chi mà cả hai thoải mái."],
    dimensionKeys: ["avoidance"],
  }),
  base({
    key: "control", slug: "nguoi-cam-la-ban", title: "Người cầm la bàn", tagline: "Rõ ràng để cùng đi.", icon: "✧",
    description: "Bạn thấy dễ phối hợp hơn khi các khoản liên quan đến cả hai có kế hoạch và thông tin rõ ràng.",
    strengths: ["Biến điều mơ hồ thành kế hoạch dễ làm", "Tạo cảm giác công bằng và rõ ràng"],
    watchouts: ["Không phải mọi khoảnh khắc đẹp đều cần được tối ưu"],
    harmonyReason: "Bạn giúp những dự định chung có hình dáng và bước tiếp theo.",
    frictionReason: "Bạn có thể vô tình biến một cuộc trò chuyện thành một bảng tính.",
    conversationPrompts: ["Khoản nào mình nên cùng theo dõi, và khoản nào mỗi người tự quyết?"],
    dimensionKeys: ["control"],
  }),
  base({
    key: "independence", slug: "nguoi-giu-khoang-rieng", title: "Người giữ khoảng riêng", tagline: "Tự chủ cũng là một cách thương nhau.", icon: "□",
    description: "Bạn coi trọng quyền tự quyết với tiền cá nhân và muốn làm rõ phần trách nhiệm chung.",
    strengths: ["Tôn trọng ranh giới và quyền lựa chọn", "Rõ ràng về trách nhiệm cá nhân"],
    watchouts: ["Tự chủ không nhất thiết phải đồng nghĩa với tự xoay xở một mình"],
    harmonyReason: "Bạn giữ cho mỗi người có không gian lựa chọn mà vẫn tôn trọng phần chung.",
    frictionReason: "Bạn có thể thấy những quy ước chung làm hẹp bớt tự do của mình.",
    conversationPrompts: ["Mỗi người thấy thoải mái khi góp phần nào, còn phần nào muốn tự quyết?"],
    dimensionKeys: ["independence"],
  }),
  hybrid({ key: "security-control", slug: "xay-nen-cam-la-ban", title: "Người xây nền có la bàn", tagline: "Vững vàng và có kế hoạch.", icon: "◒✧", description: "Bạn kết hợp nhu cầu an tâm với thói quen biến những điều chung thành kế hoạch dễ theo dõi.", strengths: ["Kiên định", "Dễ tạo cảm giác đáng tin"], watchouts: ["Chừa một khoảng linh hoạt cho điều bất ngờ"], harmonyReason: "Hai người dễ đồng điệu khi cùng muốn một kế hoạch đủ rõ.", frictionReason: "Khác biệt có thể xuất hiện khi một người muốn đổi hướng thật nhanh.", conversationPrompts: ["Mình muốn chắc phần nào trước, và phần nào có thể để mở?"], dimensionKeys: ["security", "control"] }),
  hybrid({ key: "security-experience", slug: "xay-nen-song-day", title: "Người xây nền sống đầy", tagline: "Để dành cho những điều đáng.", icon: "◒✦", description: "Bạn biết giữ nhịp an toàn nhưng cũng muốn những khoản tiền có thể mở ra kỷ niệm.", strengths: ["Biết cân bằng", "Nhìn được cả hiện tại và tương lai"], watchouts: ["Đừng biến mọi niềm vui thành một bài toán cần tối ưu"], harmonyReason: "Hai người dễ gặp nhau khi cùng chọn điều thật sự đáng ưu tiên.", frictionReason: "Một người có thể thấy người kia quá thận trọng hoặc quá nhanh.", conversationPrompts: ["Khoản nào là niềm vui đáng để mình dành riêng?"], dimensionKeys: ["security", "experience"] }),
  hybrid({ key: "security-independence", slug: "xay-nen-giu-khoang-rieng", title: "Người xây nền tự chủ", tagline: "An tâm theo cách của mình.", icon: "◒□", description: "Bạn coi trọng dự phòng nhưng vẫn muốn quyền quyết định tài chính cá nhân được tôn trọng.", strengths: ["Có ranh giới lành mạnh", "Biết chuẩn bị cho tương lai"], watchouts: ["Đừng để tự chủ khiến phần chung bị bỏ quên"], harmonyReason: "Hai người dễ hòa hợp khi thỏa thuận rõ phần riêng và phần chung.", frictionReason: "Bạn có thể khó chịu với những kỳ vọng tài chính không được nói trước.", conversationPrompts: ["Phần nào là của riêng mình, phần nào là điều cả hai cùng giữ?"], dimensionKeys: ["security", "independence"] }),
  hybrid({ key: "security-avoidance", slug: "xay-nen-mo-loi", title: "Người xây nền đang mở lời", tagline: "An tâm hơn khi nói thật.", icon: "◒△", description: "Bạn muốn chuẩn bị đủ chắc chắn nhưng cũng đang học cách gọi tên những băn khoăn về tiền trong mối quan hệ.", strengths: ["Cẩn thận và chân thành", "Biết quan sát cảm xúc trước khi quyết định"], watchouts: ["Đừng chờ mọi thứ hoàn hảo mới bắt đầu một cuộc trò chuyện"], harmonyReason: "Hai người dễ đồng điệu khi cùng tạo được cảm giác an toàn để nói thật.", frictionReason: "Sự thận trọng có thể khiến điều cần nói bị trì hoãn quá lâu.", conversationPrompts: ["Điều gì sẽ giúp mình thấy đủ an toàn để nói chuyện này?"], dimensionKeys: ["security", "avoidance"] }),
  hybrid({ key: "experience-avoidance", slug: "song-day-mo-loi", title: "Người sống đầy đang mở lời", tagline: "Muốn vui cùng nhau, muốn nói thật hơn.", icon: "✦△", description: "Bạn trân trọng trải nghiệm nhưng đôi lúc cần thêm an toàn để nói rõ giới hạn của mình.", strengths: ["Giàu cảm xúc", "Nhạy với bầu không khí giữa hai người"], watchouts: ["Một câu nói sớm thường nhẹ hơn một điều giữ lại quá lâu"], harmonyReason: "Hai người dễ gần nhau qua những trải nghiệm được chọn bằng sự chân thành.", frictionReason: "Bạn có thể né phần ngân sách khi cuộc vui đang ở phía trước.", conversationPrompts: ["Mình muốn đi cùng bạn, và mức nào sẽ khiến mình thoải mái?"], dimensionKeys: ["experience", "avoidance"] }),
  hybrid({ key: "experience-control", slug: "song-day-cam-la-ban", title: "Người sống đầy có la bàn", tagline: "Lên kế hoạch cho điều đáng nhớ.", icon: "✦✧", description: "Bạn thích những trải nghiệm có chủ đích và thường chủ động biến mong muốn thành lịch trình cụ thể.", strengths: ["Nhiệt tình và chủ động", "Giỏi biến ý tưởng thành trải nghiệm"], watchouts: ["Đừng để kế hoạch làm mất đi sự ngẫu hứng"], harmonyReason: "Hai người dễ cùng tần số khi cùng muốn làm một điều thật đáng nhớ.", frictionReason: "Một người có thể muốn tự do hơn trong khi người kia muốn chốt sớm.", conversationPrompts: ["Điều gì mình muốn lên lịch, và điều gì để dành cho bất ngờ?"], dimensionKeys: ["experience", "control"] }),
  hybrid({ key: "experience-independence", slug: "song-day-tu-chu", title: "Người sống đầy tự chủ", tagline: "Niềm vui có phần của mỗi người.", icon: "✦□", description: "Bạn muốn tận hưởng trọn vẹn nhưng vẫn tôn trọng khả năng và lựa chọn chi tiêu riêng của mỗi người.", strengths: ["Cởi mở", "Tôn trọng sự khác biệt"], watchouts: ["Nói rõ phần đóng góp để niềm vui không thành áp lực"], harmonyReason: "Hai người dễ đồng điệu khi không cần chi giống nhau để cùng vui.", frictionReason: "Bạn có thể thấy những quy ước chung là không cần thiết.", conversationPrompts: ["Mình muốn trải nghiệm điều này theo cách nào để cả hai cùng thoải mái?"], dimensionKeys: ["experience", "independence"] }),
  hybrid({ key: "avoidance-control", slug: "mo-loi-cam-la-ban", title: "Người mở lời có la bàn", tagline: "Tập nói rõ để cùng yên tâm.", icon: "△✧", description: "Bạn biết mình cần sự rõ ràng, dù việc bắt đầu những cuộc nói chuyện về tiền đôi khi vẫn còn khó.", strengths: ["Tinh tế", "Có mong muốn xây cách phối hợp bền vững"], watchouts: ["Bắt đầu bằng cảm xúc trước khi đi vào con số"], harmonyReason: "Hai người dễ đi cùng nhau khi có không gian nói chậm và không phán xét.", frictionReason: "Sự im lặng có thể làm những giả định nhỏ lớn dần lên.", conversationPrompts: ["Mình muốn nói điều này sớm hơn để hai đứa đỡ phải đoán nhau."], dimensionKeys: ["avoidance", "control"] }),
  hybrid({ key: "avoidance-independence", slug: "mo-loi-giu-khoang-rieng", title: "Người mở lời tự chủ", tagline: "Ranh giới cũng cần được gọi tên.", icon: "△□", description: "Bạn đề cao không gian riêng nhưng đang tìm cách nói về điều đó mà không làm người bên cạnh thấy xa cách.", strengths: ["Tôn trọng ranh giới", "Biết lắng nghe cảm giác của mình"], watchouts: ["Nói rõ không có nghĩa là phải giải thích mọi thứ"], harmonyReason: "Hai người dễ hòa hợp khi mỗi người được nói bằng nhịp của mình.", frictionReason: "Bạn có thể giữ quá nhiều điều trong lòng để bảo vệ sự tự do.", conversationPrompts: ["Điều gì mình muốn tự quyết, và điều gì mình muốn được cùng bàn?"], dimensionKeys: ["avoidance", "independence"] }),
  hybrid({ key: "control-independence", slug: "cam-la-ban-tu-chu", title: "Người cầm la bàn tự chủ", tagline: "Rõ ràng mà không kiểm soát.", icon: "✧□", description: "Bạn thích thông tin rõ ràng nhưng cũng muốn mỗi người có quyền tự quyết với phần của mình.", strengths: ["Công bằng", "Biết tạo ranh giới rõ"], watchouts: ["Thống nhất không nhất thiết là kiểm soát"], harmonyReason: "Hai người dễ cùng nhịp khi thỏa thuận được cách phối hợp và quyền lựa chọn.", frictionReason: "Bạn có thể thấy khó chịu khi thông tin hoặc trách nhiệm không rõ ràng.", conversationPrompts: ["Mình cần biết điều gì để cùng phối hợp, và phần nào để mỗi người tự quyết?"], dimensionKeys: ["control", "independence"] }),
];

export function getFallbackTrend(key: string) {
  return TREND_PROFILES.find((trend) => trend.key === key || trend.personalityCode === key);
}
