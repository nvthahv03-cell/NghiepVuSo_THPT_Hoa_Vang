/**
 * HVA–EDOS V5 – A.4.1 KHKT (bổ sung độc lập; CHƯA KÍCH HOẠT).
 *
 * Tạo mã nghiệp vụ A4.1-KHKT-0001, ... cho hồ sơ đã được tuyến A22 tiếp nhận.
 * Giữ nguyên recordId A22 để truy xuất và kiểm toán. Một mã cho một recordId.
 *
 * Triển khai:
 * 1) Đối chiếu với 01_ROUTER và nvsA22Route_ trên Apps Script V5 ĐANG CHẠY.
 * 2) Bổ sung NHÁNH TRƯỚC nhánh A22 trong doPost:
 *    if (action === 'nvsA41KhktSubmit')
 *      return hvaA41KhktSubmit_(payload);
 * 3) Chỉ sau kiểm thử mới đổi riêng lời gọi KHKT trên NVS_A41_HoSo.js
 *    từ nvsA22Submit sang nvsA41KhktSubmit và hiển thị r.businessCode.
 *    Các hồ sơ Sáng kiến/NCKH không thay đổi.
 *
 * Script Property EDOS_NV_DB_ID: ID Spreadsheet nghiệp vụ EDOS.
 * Không tự di chuyển hoặc sửa 3 hồ sơ đã tiếp nhận trước đây.
 * Chưa tích hợp Apps Script hoặc chạy kiểm thử thực tế.
 */
var HVA_A41_KHKT_SHEET = 'NVS_A.4.1_KHKT';
var HVA_A41_KHKT_HEADERS = [
  'Mã hồ sơ','Mã tiếp nhận A22','Mã yêu cầu','Giáo viên nộp',
  'Tài khoản','Tổ chuyên môn','Năm học','Tên sản phẩm',
  'Word','PDF','Ngày giờ tiếp nhận','Trạng thái'
];

function hvaA41KhktJson_(data) {
  if (typeof hvaJSON_ === 'function') return hvaJSON_(data);
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function hvaA41KhktResult_(value) {
  if (value && typeof value.getContent === 'function') {
    return JSON.parse(value.getContent());
  }
  return typeof value === 'string' ? JSON.parse(value) : value;
}

function hvaA41KhktSubmit_(payload) {
  var p = payload || {};
  try {
    if (typeof nvsActor_ !== 'function' || typeof nvsA22Route_ !== 'function') {
      throw new Error('Thiếu tuyến xác thực hoặc tiếp nhận A22 hiện hành.');
    }
    var actor = nvsActor_(p);
    if (!actor || !String(actor.username || '').trim()) {
      throw new Error('Phiên đăng nhập EDOS không hợp lệ.');
    }
    var doc = p.document || {};
    var form = doc.form || {};
    var extras = doc.extras || {};
    if (String(form.code || '') !== 'A.4.1' ||
        String(extras.loaiSanPham || '').trim() !== 'Khoa học kỹ thuật') {
      throw new Error('Tuyến này chỉ xử lý hồ sơ A.4.1 – Khoa học kỹ thuật.');
    }
    var title = String(form.title || '').trim();
    var word = String(extras.sanPhamUrl || '').trim();
    var pdf = String(form.evidence || '').trim();
    var requestId = String(doc.clientRequestId || '').trim();
    if (!requestId || requestId.length > 180) {
      throw new Error('Thiếu mã yêu cầu để chống gửi trùng.');
    }
    if (!title || title.length > 250 ||
        !/^https:\/\//i.test(word) || !/^https:\/\//i.test(pdf)) {
      throw new Error('Thiếu tên sản phẩm hoặc đường dẫn Word/PDF hợp lệ.');
    }

    // Tuyến A22 hiện hành quyết định việc tiếp nhận, phân quyền và thông báo.
    // Không tự cấp mã nếu A22 từ chối hoặc chưa phản hồi đủ người nhận.
    var raw = nvsA22Route_('nvsA22Submit', p);
    var accepted = hvaA41KhktResult_(raw);
    if (!accepted || (accepted.ok !== true && accepted.success !== true) ||
        !accepted.recordId || !accepted.bghCount || !accepted.ccCount) {
      return raw; // Giữ nguyên phản hồi lỗi của tuyến cũ.
    }
    var recordId = String(accepted.recordId).trim();
    var lock = LockService.getScriptLock();
    if (!lock.tryLock(30000)) {
      throw new Error('Hệ thống đang cấp mã hồ sơ; vui lòng thử lại bằng cùng yêu cầu.');
    }
    try {
      var dbId = String(PropertiesService.getScriptProperties()
        .getProperty('EDOS_NV_DB_ID') || '').trim();
      if (!dbId) throw new Error('Chưa cấu hình EDOS_NV_DB_ID.');
      var ss = SpreadsheetApp.openById(dbId);
      var sh = ss.getSheetByName(HVA_A41_KHKT_SHEET);
      if (!sh) {
        sh = ss.insertSheet(HVA_A41_KHKT_SHEET);
        sh.getRange(1,1,1,HVA_A41_KHKT_HEADERS.length)
          .setValues([HVA_A41_KHKT_HEADERS]);
        sh.setFrozenRows(1);
      }
      var head = sh.getRange(1,1,1,HVA_A41_KHKT_HEADERS.length).getValues()[0];
      if (JSON.stringify(head) !== JSON.stringify(HVA_A41_KHKT_HEADERS)) {
        throw new Error('Cấu trúc Sheet KHKT khác chuẩn, không tự ghi dữ liệu.');
      }
      var last = sh.getLastRow(), max = 0, existing = '';
      if (last > 1) {
        var pairs = sh.getRange(2,1,last-1,2).getValues();
        pairs.forEach(function(row) {
          var code = String(row[0] || '');
          var match = /^A4\.1-KHKT-(\d+)$/.exec(code);
          if (match) max = Math.max(max, Number(match[1]));
          if (String(row[1] || '') === recordId) existing = code;
        });
      }
      if (!existing) {
        var next = max + 1;
        if (next > 9999) throw new Error('Đã hết dải 4 chữ số; cần phê duyệt mở rộng.');
        existing = 'A4.1-KHKT-' + String(next).padStart(4, '0');
        // Chống công thức độc hại trong các trường văn bản Google Sheets.
        var safe = function(v) {
          var t = String(v || '').trim();
          return /^[=+@\-]/.test(t) ? "'" + t : t;
        };
        var now = Utilities.formatDate(new Date(),'Asia/Ho_Chi_Minh','yyyy-MM-dd HH:mm:ss');
        sh.appendRow([
          existing,recordId,requestId,safe(form.owner),
          String(actor.username),safe(form.team),safe(form.schoolYear),
          safe(title),safe(word),safe(pdf),now,'Đã tiếp nhận'
        ]);
        SpreadsheetApp.flush();
      }
      accepted.businessCode = existing;
      accepted.khktSheet = HVA_A41_KHKT_SHEET;
      return hvaA41KhktJson_(accepted);
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return hvaA41KhktJson_({
      ok:false,success:false,
      message:String(err && err.message || err)
    });
  }
}
