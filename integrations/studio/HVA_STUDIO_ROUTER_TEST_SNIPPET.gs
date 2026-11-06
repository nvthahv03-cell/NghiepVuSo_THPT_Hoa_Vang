/**
 * HVA STUDIO – ĐIỂM NỐI DÀNH RIÊNG CHO ROUTER BẢN SAO TEST.
 *
 * ĐÂY KHÔNG PHẢI doPost; không tự nối router hoặc triển khai.
 * Tại router thử nghiệm hiện có, chỉ sau khi đọc JSON thành p, gọi:
 *
 *   if (p && p.action === 'hva_studio_ai_generate') {
 *     return hvaStudioTestRoute_(p);
 *   }
 *
 * Lưu ý: Router chính có thể cần wrapper JSON/ContentService.
 * Kiểm tra hình dạng response của router hiện tại trước khi nối.
 * KHÔNG nạp code này vào production khi chưa thẩm định.
 */
function hvaStudioTestRoute_(p) {
  if (!p || typeof p !== 'object' || Array.isArray(p)) {
    return {success:false,message:'Yêu cầu không hợp lệ.',draft:true,reviewRequired:true};
  }
  if (p.action !== 'hva_studio_ai_generate') {
    return {success:false,message:'Chức năng không hợp lệ.',draft:true,reviewRequired:true};
  }
  if (typeof hvaStudioGenerateTest_ !== 'function') {
    return {success:false,message:'Học liệu số chưa được cấu hình.',draft:true,reviewRequired:true};
  }
  // Hàm chuyên môn phải tự xác thực phiên qua nvsActor_ và kiểm tra quyền.
  return hvaStudioGenerateTest_(p);
}
