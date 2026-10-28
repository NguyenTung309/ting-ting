import type { TestDefinition } from "./types";

type FinanceOption = {
  label: string;
  dimensionKey: string;
};

function financeQuestion(key: string, prompt: string, options: FinanceOption[]) {
  return {
    key,
    prompt,
    options: options.map((option, index) => ({
      key: String.fromCharCode(97 + index),
      label: option.label,
      weights: [{ dimensionKey: option.dimensionKey, points: 1 }],
    })),
    pairMatrix: [],
  };
}

function financeProfile(input: {
  key: string;
  title: string;
  subtitle: string;
  summary: string;
  dimensionKey?: string;
  conversationPrompt: string;
  strengths: string[];
  watchouts: string[];
  suggestions: string[];
  fallback?: boolean;
}) {
  return {
    minScore: 0,
    maxScore: 100,
    priority: 1,
    ...input,
    fallback: input.fallback ?? false,
  };
}

export const FINANCE_TEST: TestDefinition = {
  slug: "finance-trend",
  kind: "finance",
  version: 4,
  status: "published",
  title: "Bạn thường nghĩ gì về tiền khi yêu?",
  description: "Chọn cách phản ứng gần với bạn nhất, không phải cách bạn nghĩ mình nên làm. Không có đáp án đúng hay sai.",
  intro: "Một chút tiền, một chút tình",
  estimatedMinutes: 8,
  note: "Bài test dùng để tự khám phá và mở lời đối thoại; đây không phải công cụ chẩn đoán hay tư vấn tài chính cá nhân.",
  dimensions: [
    { key: "security", label: "Người ưu tiên dự phòng" },
    { key: "experience", label: "Người ưu tiên trải nghiệm" },
    { key: "avoidance", label: "Người ngại mở lời về tiền" },
    { key: "control", label: "Người thích chủ động sắp xếp" },
    { key: "independence", label: "Người đề cao tự chủ" },
  ],
  questions: [
    financeQuestion("q1", "Bạn và người yêu đang chọn quán ăn cho buổi hẹn cuối tuần. Có vài lựa chọn với mức giá và trải nghiệm khá khác nhau. Bạn thường nghiêng về cách nào?", [
      { label: "Nếu có một quán cả hai thực sự muốn thử, mình sẵn sàng dành nhiều hơn một chút nếu cảm thấy trải nghiệm đó đáng.", dimensionKey: "experience" },
      { label: "Mình nghiêng về lựa chọn giúp mình vẫn giữ được khoản tài chính cần cho những dự định hoặc tình huống khác.", dimensionKey: "security" },
      { label: "Mình muốn hai người biết tương đối buổi hẹn sẽ tốn bao nhiêu và thống nhất cách chi trước khi chọn.", dimensionKey: "control" },
      { label: "Mình sẽ nói mức mình thấy thoải mái chi trả; nếu người ấy muốn chọn phương án khác, hai người có thể tự cân nhắc cách xử lý phần chênh lệch.", dimensionKey: "independence" },
      { label: "Nếu mức giá cao hơn mình mong muốn, mình thường nghiêng về một lựa chọn khác hoặc để người ấy chọn trước, hơn là nói rõ mình đang băn khoăn về mức chi.", dimensionKey: "avoidance" },
    ]),
    financeQuestion("q2", "Đến dịp tặng quà người yêu, cách nào gần với bạn nhất?", [
      { label: "Mình chọn món mình thực sự muốn tặng trong khả năng của mình, không thấy cần phải cân giá trị món quà với những gì người ấy từng tặng.", dimensionKey: "independence" },
      { label: "Mình muốn món quà phù hợp nhưng vẫn ưu tiên giữ được khoản mình đang để dành cho những việc sau này.", dimensionKey: "security" },
      { label: "Nếu chưa rõ người ấy kỳ vọng giá trị món quà ở mức nào, mình thường tự chọn một phương án mình thấy ổn hơn là hỏi trực tiếp.", dimensionKey: "avoidance" },
      { label: "Mình sẵn sàng dành nhiều hơn cho một món quà hoặc trải nghiệm nếu nó tạo ra một kỷ niệm mình thực sự coi trọng.", dimensionKey: "experience" },
      { label: "Mình thích hai người hiểu tương đối kỳ vọng của nhau về những dịp như thế này để tránh mức chi cho quà quá khác nhau.", dimensionKey: "control" },
    ]),
    financeQuestion("q3", "Có một concert mà cả hai rất muốn tham gia. Nếu mua vé, gần như toàn bộ khoản bạn dự định dành cho việc đi chơi trong tháng sẽ được sử dụng. Bạn nghiêng về:", [
      { label: "Bỏ qua lần này hoặc chọn một hoạt động khác để không dùng gần hết khoản dành cho vui chơi trong tháng.", dimensionKey: "security" },
      { label: "Dù thấy giá vé hơi cao, mình đôi khi vẫn phản hồi kiểu “để xem đã” trước khi đề cập thẳng đến mức mình có thể chi.", dimensionKey: "avoidance" },
      { label: "Mình muốn cùng người yêu xem lại mức chi và những kế hoạch khác trong tháng trước khi hai người quyết định mua vé.", dimensionKey: "control" },
      { label: "Nếu đây là trải nghiệm mình thực sự mong chờ, mình thấy việc dành phần lớn khoản vui chơi cho nó vẫn đáng.", dimensionKey: "experience" },
      { label: "Mình sẽ nói rõ mức mình có thể dành cho concert; người ấy cũng có thể tự quyết mức họ sẵn sàng chi thay vì mặc định hai người phải giống nhau.", dimensionKey: "independence" },
    ]),
    financeQuestion("q4", "Đến lúc thanh toán sau một buổi hẹn, cách nào khiến bạn thoải mái nhất?", [
      { label: "Hai người có một cách xử lý tương đối rõ, chẳng hạn luân phiên, chia theo tỷ lệ hoặc theo cách đã thống nhất trước.", dimensionKey: "control" },
      { label: "Thỉnh thoảng mình thích chủ động mời cả hai nếu điều đó khiến buổi hẹn vui và đặc biệt hơn.", dimensionKey: "experience" },
      { label: "Nếu cách thanh toán hôm đó chưa thật sự hợp lý với mình, mình thường để qua thay vì chủ động bàn lại về việc chia khoản đó.", dimensionKey: "avoidance" },
      { label: "Mỗi người chủ động với khả năng chi của mình; việc một người mời người kia nên xuất phát từ lựa chọn tự nguyện chứ không phải nghĩa vụ.", dimensionKey: "independence" },
      { label: "Mình ưu tiên cách thanh toán giúp mình không vượt quá khoản đã muốn dành cho hẹn hò và vẫn còn đủ cho những kế hoạch khác.", dimensionKey: "security" },
    ]),
    financeQuestion("q5", "Hai bạn muốn đi chơi xa sau vài tháng. Khi bắt đầu chuẩn bị tài chính cho chuyến đi, bạn thường:", [
      { label: "Nghĩ trước những trải nghiệm mình thực sự muốn có trong chuyến đi rồi cân đối tài chính để ưu tiên cho chúng.", dimensionKey: "experience" },
      { label: "Muốn hai người cùng xác định các khoản chính, mức dự kiến và cách đóng góp để biết kế hoạch đang được chuẩn bị đến đâu.", dimensionKey: "control" },
      { label: "Bắt đầu để dành dần từ sớm để gần ngày đi không phải dùng một khoản quá lớn cùng lúc.", dimensionKey: "security" },
      { label: "Thống nhất phần nào là chi phí chung, còn những khoản cá nhân trong chuyến đi thì mỗi người tự quyết.", dimensionKey: "independence" },
      { label: "Nếu thấy chuyến đi có thể tốn nhiều hơn mình nghĩ, mình thường tự điều chỉnh phần chi của mình trước, rồi mới cân nhắc có cần trao đổi lại không.", dimensionKey: "avoidance" },
    ]),
    financeQuestion("q6", "Hai bạn dự định dành khoảng 2.000.000đ/người cho một dịp kỷ niệm. Khi bàn cách sử dụng khoản này, bạn nghiêng về:", [
      { label: "Nếu mức 2 triệu hơi cao với mình, mình thường thử tính xem có thể tự cân đối thế nào trước khi nói rõ băn khoăn với người ấy.", dimensionKey: "avoidance" },
      { label: "Hai người có thể thống nhất phần chung; nếu một người muốn làm thêm điều gì ngoài kế hoạch thì người đó tự cân nhắc phần của mình.", dimensionKey: "independence" },
      { label: "Nếu vẫn có thể có một dịp kỷ niệm ý nghĩa với mức thấp hơn, mình thích giữ lại phần còn lại cho những kế hoạch khác.", dimensionKey: "security" },
      { label: "Mình muốn xác định tương đối khoản nào dành cho ăn uống, hoạt động, di chuyển và cách hai người cùng xử lý nếu vượt mức dự kiến.", dimensionKey: "control" },
      { label: "Mình sẵn sàng dành phần lớn khoản này cho một trải nghiệm đặc biệt mà cả hai thực sự muốn thử.", dimensionKey: "experience" },
    ]),
    financeQuestion("q7", "Tháng này, một người muốn hạn chế chi cho hẹn hò vì đang cần để dành cho việc khác, trong khi người còn lại có thể chi thoải mái hơn. Bạn nghiêng về:", [
      { label: "Không nhất thiết hai người phải chi bằng nhau; mỗi người nên được nói rõ mức mình thấy thoải mái và tự quyết trong phạm vi đó.", dimensionKey: "independence" },
      { label: "Mình muốn hai người cùng thống nhất một mức hoặc nguyên tắc chi cho các buổi hẹn trong tháng để tránh phải xử lý lại mỗi lần.", dimensionKey: "control" },
      { label: "Mình thường nói khá chung chung như “dạo này mình muốn tiết kiệm hơn” thay vì nói cụ thể mức mình có thể dành cho hẹn hò.", dimensionKey: "avoidance" },
      { label: "Mình nghiêng về những hoạt động ít tốn kém hơn để người đang cần để dành vẫn giữ được khoản họ muốn bảo toàn.", dimensionKey: "security" },
      { label: "Nếu có một trải nghiệm cả hai thực sự muốn thử, mình vẫn thấy có thể dành nhiều hơn cho riêng dịp đó nếu cả hai thấy đáng.", dimensionKey: "experience" },
    ]),
    financeQuestion("q8", "Hai bạn đã mua vé cho một sự kiện nhưng sự kiện bị hủy và cả hai đều được hoàn tiền. Khi bàn xem nên làm gì với khoản vừa được hoàn, bạn thường nghiêng về:", [
      { label: "Giữ lại khoản đó thay vì lập tức chuyển sang một hoạt động khác.", dimensionKey: "security" },
      { label: "Dùng ít nhất một phần cho một trải nghiệm khác mà hai người đang muốn thử.", dimensionKey: "experience" },
      { label: "Mỗi người nên được tự quyết phần tiền được hoàn của mình sau khi các khoản chung đã được xử lý xong.", dimensionKey: "independence" },
      { label: "Mình thường để người ấy đề xuất trước rồi mới phản hồi thay vì chủ động nói phương án của mình.", dimensionKey: "avoidance" },
      { label: "Mình muốn xác định rõ khoản này còn thuộc kế hoạch chung hay sẽ trả lại cho từng người trước khi quyết định dùng tiếp.", dimensionKey: "control" },
    ]),
    financeQuestion("q9", "Hai bạn đã lên kế hoạch cho một chuyến đi, nhưng sát ngày mới biết có thêm một khoản chi khá lớn ngoài dự tính. Phản ứng nào gần với bạn nhất?", [
      { label: "Mình muốn rà lại toàn bộ kế hoạch với người yêu để xác định khoản nào cần thay đổi và hai người sẽ xử lý phần phát sinh thế nào.", dimensionKey: "control" },
      { label: "Mình nghiêng về phương án giúp tổng số tài chính phải bỏ thêm thấp nhất và vẫn giữ được một khoảng dự phòng.", dimensionKey: "security" },
      { label: "Mình có xu hướng tự xem mình có thể xoay xở thế nào trước rồi mới cân nhắc có cần nói lại với người yêu hay không.", dimensionKey: "avoidance" },
      { label: "Mình muốn giữ lại những trải nghiệm mình thực sự mong chờ thay vì mặc định phải cắt hết những phần không thiết yếu.", dimensionKey: "experience" },
      { label: "Mình muốn hai người xác định lại mức mỗi người tự nguyện chi thêm chứ không mặc định cả hai đều phải tăng mức đóng góp như nhau.", dimensionKey: "independence" },
    ]),
    financeQuestion("q10", "Hai bạn có khả năng tài chính khá khác nhau ở thời điểm hiện tại. Khi chọn hoạt động hẹn hò, cách nào khiến bạn thoải mái hơn?", [
      { label: "Mỗi người nói rõ mức mình thoải mái; hai người không nhất thiết phải đóng góp bằng nhau trong mọi tình huống.", dimensionKey: "independence" },
      { label: "Hai người thống nhất một nguyên tắc tương đối rõ về mức chi hoặc cách đóng góp để sự khác biệt này không phải được xử lý lại mỗi lần.", dimensionKey: "control" },
      { label: "Mình thường nghiêng về việc đề xuất một hoạt động mà cả hai dễ tham gia, thay vì trực tiếp trao đổi về sự chênh lệch khả năng chi của mỗi người.", dimensionKey: "avoidance" },
      { label: "Ưu tiên những hoạt động phù hợp với người đang cần hạn chế chi để cả hai vẫn giữ được sự an toàn tài chính.", dimensionKey: "security" },
      { label: "Nếu cả hai thật sự muốn một trải nghiệm nào đó, mình thấy người có khả năng thoải mái hơn có thể chủ động dành nhiều hơn nếu họ tự nguyện.", dimensionKey: "experience" },
    ]),
    financeQuestion("q11", "Hai bạn bắt đầu nói về một mục tiêu dài hạn cần khá nhiều tài chính, chẳng hạn một chuyến đi lớn, học tập hoặc kế hoạch sống chung. Bạn nghiêng về:", [
      { label: "Mình thấy yên tâm hơn nếu hai người tạo được một khoản dự phòng để kế hoạch vẫn có thể thích nghi khi có thay đổi.", dimensionKey: "security" },
      { label: "Mình muốn chia mục tiêu thành các mốc tương đối rõ và thỉnh thoảng cùng xem hai người đang tiến gần mục tiêu đến đâu.", dimensionKey: "control" },
      { label: "Hai người có thể cùng thống nhất mục tiêu nhưng mỗi người vẫn tự quyết cách chuẩn bị phần tài chính mà mình cam kết đóng góp.", dimensionKey: "independence" },
      { label: "Nếu phần mình có thể đóng góp thấp hơn kỳ vọng ban đầu, mình thường cần thêm thời gian để tìm cách mở lời về con số đó.", dimensionKey: "avoidance" },
      { label: "Mình vẫn muốn dành một phần tài chính cho những trải nghiệm ở hiện tại thay vì dồn gần như mọi khoản dư vào mục tiêu tương lai.", dimensionKey: "experience" },
    ]),
    financeQuestion("q12", "Hai bạn đang cùng để dành cho một kế hoạch chung. Một ngày, người yêu đề xuất lấy một phần khoản đã để dành đó để chi cho một việc khác mà họ rất muốn làm. Bạn thường nghiêng về:", [
      { label: "Nếu không đồng ý, phản ứng đầu tiên của mình thường là chưa nói gì hoặc chỉ nói “để tính thêm” thay vì phản đối trực tiếp.", dimensionKey: "avoidance" },
      { label: "Nếu việc đó đủ ý nghĩa và không khiến kế hoạch chung bị ảnh hưởng quá nhiều, mình có thể đồng ý dành một phần cho trải nghiệm hiện tại.", dimensionKey: "experience" },
      { label: "Vì đây là khoản chung, mình muốn hai người cùng xem lại mục tiêu, mức ảnh hưởng và thống nhất trước khi thay đổi cách sử dụng.", dimensionKey: "control" },
      { label: "Mình thường muốn giữ nguyên khoản đã để dành để tránh làm giảm mức an toàn của kế hoạch ban đầu.", dimensionKey: "security" },
      { label: "Nếu đây là mong muốn riêng của một người, mình nghiêng về việc người đó sử dụng phần tài chính cá nhân thay vì lấy từ khoản chung.", dimensionKey: "independence" },
    ]),
    financeQuestion("q13", "Khi dự định dành một phần thu nhập cá nhân cho việc hẹn hò trong tháng, bạn thường:", [
      { label: "Chủ động giữ lại một phần để việc hẹn hò không ảnh hưởng đến những khoản mình cần cho tương lai hoặc tình huống phát sinh.", dimensionKey: "security" },
      { label: "Thường trao đổi với người yêu về mức hoặc cách chi tương đối phù hợp nếu hai người có nhiều kế hoạch chung trong tháng.", dimensionKey: "control" },
      { label: "Khi cần giảm chi cho hẹn hò, mình thường tự chọn phương án ít tốn hơn trước khi nói ngay về giới hạn tài chính của mình.", dimensionKey: "avoidance" },
      { label: "Sẵn sàng dành nhiều hơn cho một vài buổi hẹn hoặc trải nghiệm mình cảm thấy thực sự đáng.", dimensionKey: "experience" },
      { label: "Tự xác định mức mình có thể dành cho hẹn hò và không mặc định mức đó phải giống với mức của người yêu.", dimensionKey: "independence" },
    ]),
    financeQuestion("q14", "Khi nhận thấy mức chi cho một hoạt động chung đang cao hơn mức bạn mong đợi, bạn thường:", [
      { label: "Phản ứng khá nhẹ như “cũng được”, “tùy bạn” hoặc dù bản thân vẫn còn băn khoăn về mức chi đó.", dimensionKey: "avoidance" },
      { label: "Chủ động trao đổi để hai người xác định lại mức chi hoặc nguyên tắc phù hợp cho những tình huống tương tự.", dimensionKey: "control" },
      { label: "Nói rõ giới hạn của phần mình có thể chi, nhưng không muốn quyết định thay việc người yêu sử dụng phần tài chính cá nhân của họ thế nào.", dimensionKey: "independence" },
      { label: "Đề xuất phương án ít tốn kém hơn để không ảnh hưởng đến phần tài chính cần giữ lại.", dimensionKey: "security" },
      { label: "Vẫn có thể tiếp tục nếu trải nghiệm đó đủ đáng và mức tăng thêm nằm trong khả năng mình chấp nhận.", dimensionKey: "experience" },
    ]),
    financeQuestion("q15", "Hai bạn đã thống nhất mức chi cho một buổi hẹn, nhưng đến hôm đó người yêu đề xuất đổi sang một hoạt động đắt hơn. Bạn thường:", [
      { label: "Khá dễ đồng ý nếu hoạt động mới đem lại trải nghiệm mình thấy đáng hơn rõ rệt.", dimensionKey: "experience" },
      { label: "Muốn giữ phương án ban đầu nếu thay đổi sẽ làm mình phải sử dụng phần tài chính đang muốn giữ lại.", dimensionKey: "security" },
      { label: "Nói rõ mức mình vẫn sẵn sàng chi; nếu người ấy muốn chọn phương án đắt hơn, hai người có thể tự thống nhất cách xử lý phần chênh lệch.", dimensionKey: "independence" },
      { label: "Nếu người ấy rất muốn đổi, mình khá dễ đồng ý trước rồi tự cân đối lại phần chi của mình sau.", dimensionKey: "avoidance" },
      { label: "Muốn hai người cùng xem lại mức đã thống nhất và chỉ thay đổi khi cả hai đồng ý với cách xử lý khoản tăng thêm.", dimensionKey: "control" },
    ]),
    financeQuestion("q16", "Với những khoản nhỏ khi đi chơi cùng nhau như gửi xe, đồ uống hoặc đồ ăn vặt, bạn thường:", [
      { label: "Vẫn để ý tổng thể để biết những khoản chung đang được chi như thế nào, nhất là khi chúng xuất hiện thường xuyên.", dimensionKey: "control" },
      { label: "Nếu thấy việc ai trả nhiều hơn một chút không quá đáng kể, mình thường để vậy thay vì chủ động nhắc đến chuyện chia lại.", dimensionKey: "avoidance" },
      { label: "Không cần chia chính xác từng khoản, nhưng mình không thích việc một người mặc định người còn lại có trách nhiệm phải trả.", dimensionKey: "independence" },
      { label: "Để ý vì nhiều khoản nhỏ cộng lại có thể khiến mình sử dụng nhiều hơn mức muốn dành cho buổi đi chơi.", dimensionKey: "security" },
      { label: "Khá thoải mái chi thêm cho những khoản nhỏ nếu chúng giúp buổi đi chơi vui hoặc thuận tiện hơn.", dimensionKey: "experience" },
    ]),
    financeQuestion("q17", "Bạn muốn mua một món đồ cá nhân có giá tương đối cao trong thời điểm hai bạn đang cùng chuẩn bị cho một kế hoạch tài chính chung. Bạn thường:", [
      { label: "Tự cân nhắc món đồ bằng phần tài chính cá nhân của mình, miễn là mình vẫn thực hiện đúng phần đã cam kết cho kế hoạch chung.", dimensionKey: "independence" },
      { label: "Kiểm tra xem khoản mua đó có ảnh hưởng đến phần mình đã thống nhất đóng góp hay không; nếu có, mình muốn trao đổi lại trước khi thay đổi kế hoạch chung.", dimensionKey: "control" },
      { label: "Nghĩ nhiều đến số tài chính còn lại sau khi mua và liệu mình có còn cảm thấy đủ an toàn hay không.", dimensionKey: "security" },
      { label: "Nếu thực sự thích và tin rằng mình sẽ tận hưởng món đồ đó nhiều, mình khá sẵn sàng dành tài chính cho nó.", dimensionKey: "experience" },
      { label: "Nếu nghĩ người yêu có thể không đồng tình với khoản mua này, mình thường chỉ nhắc đến khi họ hỏi hoặc khi việc mua đã gần như được quyết định.", dimensionKey: "avoidance" },
    ]),
    financeQuestion("q18", "Nếu sau khi đã lo các nhu cầu cần thiết, hai bạn đều còn một khoản tài chính dư, phản ứng nào gần với cách nghĩ tự nhiên của bạn nhất?", [
      { label: "Có một khoản chưa cần sử dụng ngay khiến mình cảm thấy an tâm hơn.", dimensionKey: "security" },
      { label: "Mỗi người nên được tự quyết phần dư của mình trước khi nghĩ đến việc sử dụng nó cho việc chung.", dimensionKey: "independence" },
      { label: "Mình thích dành ít nhất một phần cho điều gì đó khiến hai người vui ở hiện tại.", dimensionKey: "experience" },
      { label: "Nếu hai người định sử dụng cho việc chung, mình muốn biết tương đối rõ khoản đó sẽ dành cho mục tiêu nào và theo cách nào.", dimensionKey: "control" },
      { label: "Nếu chưa có việc thực sự cần quyết định, mình không muốn chủ động biến khoản dư thành một chủ đề tài chính phải bàn ngay.", dimensionKey: "avoidance" },
    ]),
    financeQuestion("q19", "Trong chuyện tài chính khi yêu, cách nào dưới đây khiến bạn cảm thấy thoải mái nhất?", [
      { label: "Những việc tài chính chung quan trọng có nguyên tắc tương đối rõ để cả hai đều biết mình đang thống nhất điều gì.", dimensionKey: "control" },
      { label: "Hai người không cần phải trao đổi sâu về mọi vấn đề tài chính nếu điều đó chưa thực sự cần thiết.", dimensionKey: "avoidance" },
      { label: "Có phần chung để phối hợp nhưng vẫn có phần tài chính mà mỗi người được toàn quyền tự quyết.", dimensionKey: "independence" },
      { label: "Hai người luôn duy trì được một khoảng đủ an toàn trước khi dành tài chính cho những việc khác.", dimensionKey: "security" },
      { label: "Hai người vẫn có thể dành tài chính cho niềm vui và những trải nghiệm đáng nhớ thay vì lúc nào cũng ưu tiên tương lai.", dimensionKey: "experience" },
    ]),
    financeQuestion("q20", "Khi phải đưa ra một quyết định tài chính chung mà không thể đáp ứng hoàn hảo mọi mong muốn, điều nào bạn KHÔNG muốn đánh đổi nhất?", [
      { label: "Trải nghiệm đáng giá – vẫn có thể dành tài chính cho điều mình thực sự muốn làm ở hiện tại.", dimensionKey: "experience" },
      { label: "Sự rõ ràng – biết hai người đang thống nhất điều gì, mức chi thế nào và quyết định được đưa ra ra sao.", dimensionKey: "control" },
      { label: "Sự an toàn – sau quyết định đó vẫn còn khả năng xử lý những nhu cầu hoặc tình huống phát sinh.", dimensionKey: "security" },
      { label: "Sự thoải mái trong mối quan hệ – không phải đưa mọi khác biệt tài chính ra phân tích hoặc làm rõ đến cùng.", dimensionKey: "avoidance" },
      { label: "Quyền tự quyết – mỗi người vẫn được quyết định trong phạm vi tài chính cá nhân của mình.", dimensionKey: "independence" },
    ]),
    financeQuestion("q21", "Khi hai người có quan điểm khác nhau về một vấn đề tài chính, suy nghĩ nào gần với bạn nhất?", [
      { label: "“Không phải khác biệt nào cũng cần nói hết ngay; đôi khi mình muốn để một thời gian rồi mới quyết định có cần trao đổi thêm hay không.”", dimensionKey: "avoidance" },
      { label: "“Dù chọn phương án nào, mình vẫn muốn chắc rằng sau đó hai người không bị rơi vào thế quá bị động.”", dimensionKey: "security" },
      { label: "“Quan trọng là cuối cùng hai người phải làm rõ được cách xử lý và phương án để có thể áp dụng cho lần sau.”", dimensionKey: "control" },
      { label: "“Hai người có thể không chọn giống nhau, miễn là mỗi người vẫn được tự quyết trong phần thuộc về mình.”", dimensionKey: "independence" },
      { label: "“Nếu điều đó thực sự có ý nghĩa với cả hai, đôi khi đáng để dành nhiều hơn thay vì chỉ chọn phương án an toàn nhất.”", dimensionKey: "experience" },
    ]),
    financeQuestion("q22", "Nếu nghĩ đến chuyện tài chính khi yêu lâu dài, viễn cảnh nào khiến bạn cảm thấy thoải mái nhất?", [
      { label: "Hai người có thể phối hợp cho những việc chung nhưng không mặc định phải gộp hoặc giải thích mọi khoản tài chính cá nhân.", dimensionKey: "independence" },
      { label: "Hai người cùng tạo được một nền tảng đủ an toàn để không quá bị động trước những kế hoạch hoặc thay đổi sau này.", dimensionKey: "security" },
      { label: "Hai người vẫn có thể tạo ra nhiều trải nghiệm đáng nhớ thay vì lúc nào cũng ưu tiên giữ tài chính cho tương lai.", dimensionKey: "experience" },
      { label: "Hai người không cần nói về tài chính quá thường xuyên; khi có việc thực sự cần thì mới cùng xử lý.", dimensionKey: "avoidance" },
      { label: "Những vấn đề tài chính quan trọng có kế hoạch và nguyên tắc tương đối rõ, và các quyết định chung đều được hai người làm rõ với nhau.", dimensionKey: "control" },
    ]),
  ],
  resultProfiles: [
    financeProfile({
      key: "security",
      title: "Người xây nền",
      subtitle: "Người ưu tiên dự phòng",
      dimensionKey: "security",
      summary: "Bạn thường cân nhắc khoản chi hôm nay cùng với những dự định và cảm giác an tâm cho sau này.",
      conversationPrompt: "Điều gì đáng để hai đứa chi thêm, và điều gì mình muốn để dành?",
      strengths: ["Nhìn được bức tranh dài hạn", "Giữ cảm giác an toàn cho cả hai"],
      watchouts: ["Đừng để lo xa lấy mất những niềm vui vừa sức"],
      suggestions: ["Thống nhất một khoản cho trải nghiệm và một khoản cho dự phòng"],
    }),
    financeProfile({
      key: "experience",
      title: "Người sống đầy",
      subtitle: "Người ưu tiên trải nghiệm",
      dimensionKey: "experience",
      summary: "Bạn dễ nhìn thấy giá trị của tiền trong những trải nghiệm và kết nối. Một kế hoạch tốt là kế hoạch vẫn chừa chỗ cho niềm vui.",
      conversationPrompt: "Dịp nào hai đứa thật sự muốn ưu tiên tiền cho một trải nghiệm?",
      strengths: ["Tạo năng lượng và kỷ niệm cho mối quan hệ", "Nhìn ra giá trị cảm xúc của một khoản chi"],
      watchouts: ["Niềm vui sẽ nhẹ hơn khi không để lại áp lực sau đó"],
      suggestions: ["Đặt một ngân sách vui vẻ cố định trước khi chọn trải nghiệm"],
    }),
    financeProfile({
      key: "avoidance",
      title: "Người đang học cách mở lời",
      subtitle: "Người ngại mở lời về tiền",
      dimensionKey: "avoidance",
      summary: "Khi chuyện tiền dễ làm không khí khó xử, bạn thường cần thêm thời gian để bắt đầu cuộc trò chuyện.",
      conversationPrompt: "Mình hơi ngại nói chuyện này, nhưng muốn cùng bạn chọn mức chi mà cả hai thoải mái.",
      strengths: ["Nhạy cảm với cảm xúc của người đối diện", "Biết giữ sự mềm mại trong cuộc trò chuyện"],
      watchouts: ["Im lặng quá lâu có thể khiến hai người đoán ý nhau"],
      suggestions: ["Bắt đầu bằng một câu nói về cảm giác của mình thay vì con số"],
    }),
    financeProfile({
      key: "control",
      title: "Người cầm la bàn",
      subtitle: "Người thích chủ động sắp xếp",
      dimensionKey: "control",
      summary: "Bạn thấy dễ phối hợp hơn khi các khoản liên quan đến cả hai có kế hoạch và thông tin rõ ràng.",
      conversationPrompt: "Khoản nào mình nên cùng theo dõi, và khoản nào mỗi người tự quyết?",
      strengths: ["Biến điều mơ hồ thành kế hoạch dễ làm", "Tạo cảm giác công bằng và rõ ràng"],
      watchouts: ["Không phải mọi khoảnh khắc đẹp đều cần được tối ưu"],
      suggestions: ["Chừa một khoảng linh hoạt trong mọi kế hoạch chung"],
    }),
    financeProfile({
      key: "independence",
      title: "Người giữ khoảng riêng",
      subtitle: "Người đề cao tự chủ",
      dimensionKey: "independence",
      summary: "Bạn coi trọng quyền tự quyết với tiền cá nhân và muốn làm rõ phần trách nhiệm chung.",
      conversationPrompt: "Mỗi người thấy thoải mái khi góp phần nào, còn phần nào muốn tự quyết?",
      strengths: ["Tôn trọng ranh giới và quyền lựa chọn", "Rõ ràng về trách nhiệm cá nhân"],
      watchouts: ["Tự chủ không nhất thiết phải đồng nghĩa với tự xoay xở một mình"],
      suggestions: ["Thử tạo một khoản chung nhỏ nhưng có mục đích thật rõ"],
    }),
    financeProfile({
      key: "harmonizer",
      title: "Người dung hòa",
      subtitle: "Nhiều xu hướng cùng hiện diện",
      summary: "Lựa chọn của bạn trải trên nhiều cách tiếp cận; chưa có một xu hướng tách biệt rõ trong bài test này.",
      conversationPrompt: "Trong các tình huống vừa rồi, câu nào hai đứa sẽ chọn khác nhau nhất?",
      strengths: ["Linh hoạt theo hoàn cảnh", "Có khả năng nhìn vấn đề từ nhiều phía"],
      watchouts: ["Khi mọi thứ đều có thể, đôi khi cần chọn một nguyên tắc nhỏ để bắt đầu"],
      suggestions: ["Nói ra điều bạn ưu tiên nhất trong tình huống gần đây"],
      fallback: true,
    }),
  ],
};

const compatibilityOptions = [
  { key: "a", label: "Cần nhiều thời gian để suy nghĩ" },
  { key: "b", label: "Muốn nói chuyện để cùng quyết định" },
  { key: "c", label: "Thường làm theo cảm nhận" },
];

function compatibilityQuestion(key: string, prompt: string) {
  return {
    key,
    prompt,
    options: compatibilityOptions.map((option) => ({ ...option, weights: [] })),
    pairMatrix: compatibilityOptions.flatMap((left) =>
      compatibilityOptions.map((right) => ({
        optionA: left.key,
        optionB: right.key,
        points: left.key === right.key ? 100 : left.key === "b" || right.key === "b" ? 75 : 45,
      })),
    ),
  };
}

function compatibilityProfile(input: { key: string; title: string; subtitle: string; summary: string; minScore: number; maxScore: number; priority: number }) {
  return {
    ...input,
    conversationPrompt: "Điều gì khiến hai bạn cảm thấy được lắng nghe hơn?",
    strengths: ["Có thêm một góc nhìn để bắt đầu cuộc trò chuyện"],
    watchouts: ["Điểm số không thay thế những điều hai bạn trực tiếp chia sẻ"],
    suggestions: ["Chọn một câu hỏi trong kết quả và nói với nhau trong tuần này"],
    fallback: false,
  };
}

export const COMPATIBILITY_TEST: TestDefinition = {
  slug: "couple-compatibility",
  kind: "compatibility",
  version: 1,
  status: "published",
  title: "Hai bạn gặp nhau ở đâu?",
  description: "Cùng trả lời một vài câu hỏi để nhìn thấy những điểm đồng điệu và khác biệt thú vị giữa hai người.",
  intro: "Một bài test nhỏ cho hai người",
  estimatedMinutes: 5,
  note: "Không có kết quả nào nói thay câu chuyện của hai bạn. Hãy xem đây như một lời mời để bắt đầu cuộc trò chuyện.",
  dimensions: [],
  questions: [
    compatibilityQuestion("q1", "Khi có một chuyện cần giải quyết, bạn muốn…"),
    compatibilityQuestion("q2", "Một buổi hẹn lý tưởng với bạn là…"),
    compatibilityQuestion("q3", "Khi cần được quan tâm, bạn thường…"),
    compatibilityQuestion("q4", "Điều quan trọng nhất trong một cuộc trò chuyện là…"),
  ],
  resultProfiles: [
    compatibilityProfile({ key: "spark", title: "Nhiều tia lửa", subtitle: "Nhiều điểm chạm tự nhiên", summary: "Hai bạn có nhiều điểm chạm tự nhiên và dễ tạo ra năng lượng vui vẻ khi ở cạnh nhau.", minScore: 70, maxScore: 100, priority: 3 }),
    compatibilityProfile({ key: "bridge", title: "Một cây cầu đẹp", subtitle: "Khác biệt có thể thành tò mò", summary: "Hai bạn có những khác biệt thú vị, và chính việc tò mò về nhau sẽ giúp cây cầu này bền hơn.", minScore: 40, maxScore: 69, priority: 2 }),
    compatibilityProfile({ key: "discover", title: "Một cuộc khám phá", subtitle: "Còn nhiều điều để tìm hiểu", summary: "Hai bạn còn nhiều điều để tìm hiểu. Hãy bắt đầu bằng những câu hỏi nhỏ và những lần lắng nghe thật kỹ.", minScore: 0, maxScore: 39, priority: 1 }),
  ],
};
