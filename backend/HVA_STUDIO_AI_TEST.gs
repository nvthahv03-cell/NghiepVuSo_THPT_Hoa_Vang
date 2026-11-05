/**
 * HVA STUDIO AI — MODULE THỬ NGHIỆM, CHƯA TRIỂN KHAI.
 * Chỉ thêm vào dự án Apps Script thử nghiệm đã kiểm toán.
 * Yêu cầu host cung cấp nvsActor_, hvaTraCuuNhanSuTheoUser_, nvsGeminiFallbackV441_.
 * KHÔNG đặt khóa, token, bí mật hoặc dữ liệu nhân sự tại GitHub.
 * Router test cần gọi:
 *   if (action === 'hva_studio_ai_generate')
 *     return nvsResp_(hvaStudioAiGenerate_(payload));
 */
function hvaStudioAiGenerate_(p) {
  const fail = m => ({success:false,message:m});
  try {
    if (!p || p.action !== 'hva_studio_ai_generate')
      return fail('Yêu cầu không hợp lệ.');
    // Xác thực phía máy chủ; không đọc username/role từ trình duyệt.
    const actor = nvsActor_(p);
    if (!actor || !actor.username)
      return fail('Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    const staff = hvaTraCuuNhanSuTheoUser_(actor.username);
    if (!staff) return fail('Không tìm thấy hồ sơ nhân sự.');
    const props = PropertiesService.getScriptProperties();
    const testUsers = String(props.getProperty('HVA_STUDIO_TEST_USERS') || '')
      .split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
    if (!testUsers.includes(String(actor.username).toLowerCase()))
      return fail('Tài khoản chưa được cấp quyền thử nghiệm Studio.');

    const requestId = String(p.requestId||'').trim();
    if (!/^studio-[A-Za-z0-9-]{12,96}$/.test(requestId))
      return fail('Mã yêu cầu không hợp lệ.');
    if (p.taskType !== 'lesson_plan' || p.program !== 'GDPT_2018' ||
        p.subject !== 'Toán' || String(p.grade) !== '10' ||
        p.outputFormat !== 'markdown')
      return fail('Giai đoạn thử nghiệm chỉ hỗ trợ giáo án Toán 10.');
    const topic = String(p.topic||'').trim();
    const userInput = String(p.input||'').trim();
    if (!topic || topic.length>300 || !userInput || userInput.length>12000)
      return fail('Tên chủ đề hoặc yêu cầu tạo giáo án không hợp lệ.');
    if (!/mệnh đề|menh de/i.test(topic))
      return fail('Đợt thử chỉ dành cho chủ đề Mệnh đề và tập hợp.');

    const key = String(props.getProperty('GEMINI_API_KEY')||'').trim();
    const model = String(props.getProperty('HVA_STUDIO_GEMINI_MODEL')||'gemini-2.5-flash').trim();
    if (!key || !/^[A-Za-z0-9._-]+$/.test(model))
      return fail('Gemini chưa được cấu hình trên máy chủ thử nghiệm.');

    // Lock + cache dùng để hạn chế gọi lặp và chống phát lại cùng requestId.
    const cache = CacheService.getScriptCache();
    const identity = String(actor.username).toLowerCase();
    const digest = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,identity+'|'+requestId);
    const requestKey = 'HVA_STUDIO_REQUEST_'+Utilities.base64EncodeWebSafe(digest).slice(0,42);
    const quotaKey = 'HVA_STUDIO_RATE_'+Utilities.base64EncodeWebSafe(
      Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,identity)).slice(0,42);
    const lock = LockService.getScriptLock();
    if (!lock.tryLock(8000)) return fail('Máy chủ đang bận. Vui lòng thử lại.');
    try {
      if (cache.get(requestKey)) return fail('Yêu cầu đã được tiếp nhận trước đó.');
      const count=Number(cache.get(quotaKey)||'0');
      if (count>=5) return fail('Đã đạt giới hạn lượt thử trong phiên kiểm thử này.');
      cache.put(requestKey,'1',600);
      cache.put(quotaKey,String(count+1),21600); // Hạn mức thử nghiệm theo cửa sổ 6 giờ.
    } finally {lock.releaseLock();}

    const instruction = [
      'Bạn là trợ lý chuẩn bị GIÁO ÁN DỰ THẢO cho giáo viên Toán 10 THPT Hòa Vang.',
      'Bám Chương trình GDPT 2018; không tự nhận đã tra cứu nguồn khi không có dữ liệu.',
      'Chủ đề Mệnh đề và tập hợp, tập trung yêu cầu nhận biết đúng sai mệnh đề trong trường hợp đơn giản.',
      'Bố cục: mục tiêu/yêu cầu cần đạt, học liệu, chuẩn bị, tiến trình khởi động, hình thành kiến thức, luyện tập, vận dụng, kiểm tra đánh giá, điều chỉnh sau dạy.',
      'Nêu thời lượng dự kiến, sản phẩm học tập và tiêu chí đánh giá; toán học chính xác, ví dụ và đáp án rõ.',
      'Chỉ xuất Markdown bằng tiếng Việt, không tự phê duyệt hay phát hành.',
      'Cần ghi rõ BẢN NHÁP AI – GIÁO VIÊN CẦN THẨM ĐỊNH.'
    ].join('\n');
    const prompt = 'Chủ đề: '+topic+'\nYêu cầu giáo viên: '+userInput;
    const result = nvsGeminiFallbackV441_({
      contents:[{role:'user',parts:[{text:prompt}]}],
      systemInstruction:{parts:[{text:instruction}]},
      generationConfig:{temperature:0.25,maxOutputTokens:4800}
    },key,model);
    if (!result || !result.response) return fail('Không nhận được phản hồi từ Gemini.');
    const http=result.response.getResponseCode();
    if (http<200 || http>=300) return fail('Dịch vụ Gemini tạm thời chưa phản hồi thành công.');
    const data=JSON.parse(result.response.getContentText());
    const answer=(data.candidates||[]).flatMap(c=>c.content?.parts||[])
      .map(part=>typeof part.text==='string'?part.text:'').join('\n').trim();
    if (!answer || answer.length>300000) return fail('Gemini không trả nội dung hợp lệ.');
    return {success:true,answer,requestId,draft:true,reviewRequired:true,provider:'gemini'};
  } catch (error) {
    // Không trả stack trace, khóa, yêu cầu gốc hoặc dữ liệu phiên.
    return {success:false,message:'Không thể tạo giáo án trong lần thử này.'};
  }
}
