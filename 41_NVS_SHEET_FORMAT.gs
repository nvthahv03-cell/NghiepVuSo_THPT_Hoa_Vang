/**
 * HVA–EDOS V5 | 41_NVS_SHEET_FORMAT.gs
 * Trình bày Google Sheets hồ sơ theo nhận diện EDOS.
 *
 * CHỈ ĐỊNH DẠNG: Không tạo Sheet, không đổi tên tab, không thêm/xóa/sắp xếp cột,
 * không sửa dữ liệu, công thức, liên kết, mã tiếp nhận hay route Backend.
 * Không tự chạy khi mở/nộp: người quản trị gọi thủ công một lần khi cần.
 *
 * CÁCH DÙNG TRONG APPS SCRIPT:
 * 1) Thêm nguyên tệp này vào project Apps Script EDOS V5 hiện hành.
 * 2) Đặt NVS_FMT_SPREADSHEET_ID là ID Spreadsheet tiếp nhận, HOẶC bỏ trống
 *    và chạy khi project được liên kết trực tiếp với bảng tính đó.
 * 3) Chạy nvsFormatHoSoA22_() cho tab dữ liệu cũ.
 * 4) Sau khi Backend thật đã tách tab mới, chạy nvsFormatHoSoA41_().
 *
 * TUYỆT ĐỐI không gọi trực tiếp từ doGet/doPost hoặc tuyến lưu hồ sơ.
 */
const NVS_FMT_SPREADSHEET_ID = ''; // ID từ URL, chỉ điền ID thật khi xác minh.
const NVS_FMT_CONFIG = Object.freeze({
  headerBg: '#0B4F87',
  headerText: '#FFFFFF',
  bodyText: '#213E57',
  zebraWhite: '#FFFFFF',
  zebraBlue: '#F3F8FD',
  border: '#DCE9F3',
  linkColor: '#0869B4',
  maxRowsPerRun: 3000
});

function nvsFormatHoSoA22_() {
  return nvsFormatHoSoSheets_(['NVS_HO_SO_A22']);
}

function nvsFormatHoSoA41_() {
  // Chỉ định dạng những Sheet ĐÃ TỒN TẠI. Không tự tạo các tab mới.
  return nvsFormatHoSoSheets_([
    'NVS_A.4.1_KHKT', 'NVS_A.4.1_SK', 'NVS_A.4.1_NCKH'
  ]);
}

function nvsFormatHoSoSheets_(sheetNames) {
  const ss = NVS_FMT_SPREADSHEET_ID
    ? SpreadsheetApp.openById(NVS_FMT_SPREADSHEET_ID)
    : SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('Chưa xác định Spreadsheet EDOS. Cần nhập đúng ID bảng tính tiếp nhận.');
  const names = Array.isArray(sheetNames) ? sheetNames : [];
  if (!names.length) throw new Error('Chưa chọn Sheet cần định dạng.');
  const out = [];
  names.forEach(function(name) {
    const sheet = ss.getSheetByName(name);
    if (!sheet) {
      out.push({ sheet: name, status: 'KHONG_TON_TAI', note: 'Không tự tạo tab' });
      return;
    }
    nvsFormatOneHoSoSheet_(sheet);
    out.push({ sheet: name, status: 'DA_DINH_DANG', rows: sheet.getLastRow() });
  });
  console.log(JSON.stringify(out));
  return out;
}

function nvsFmtNormalize_(x) {
  return String(x == null ? '' : x).normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
}

function nvsFmtWidth_(header) {
  const t = nvsFmtNormalize_(header);
  if (!t) return 138;
  if (/(stt|sothutu)$/.test(t)) return 62;
  if (/(mahoso|madinhdanh|recordid|clientrequestid|requestid|matiepnhan)/.test(t)) return 190;
  if (/(tenhoso|tensanpham|tendetai|tieude|title)/.test(t)) return 270;
  if (/(giaovien|nguoinop|nguoilap|hoten|owner|username)/.test(t)) return 195;
  if (/(tochuyenmon|tobophan|department|team)/.test(t)) return 160;
  if (/(link|url|evidence|sanpham|word|pdf)/.test(t)) return 235;
  if (/(trangthai|status)/.test(t)) return 140;
  if (/(thoigian|ngaynop|ngaygui|createdat|timestamp)/.test(t)) return 170;
  if (/(ghichu|note|ketqua)/.test(t)) return 220;
  return 145;
}

function nvsFormatOneHoSoSheet_(sheet) {
  const nrow = sheet.getLastRow();
  const ncol = sheet.getLastColumn();
  if (nrow < 1 || ncol < 1) return;
  // Hàng 1 đang là tiêu đề trong bảng tiếp nhận hiện có; nếu khác cần kiểm tra trước.
  const header = sheet.getRange(1, 1, 1, ncol);
  const headers = header.getDisplayValues()[0];
  const cfg = NVS_FMT_CONFIG;
  if (headers.every(function(h){ return !String(h).trim(); })) {
    throw new Error('Dòng 1 của '+sheet.getName()+' trống: chưa thể xác định hàng tiêu đề.');
  }
  const count = Math.min(Math.max(nrow - 1, 0), cfg.maxRowsPerRun);
  sheet.setFrozenRows(1);
  header.setBackground(cfg.headerBg).setFontColor(cfg.headerText)
    .setFontFamily('Arial').setFontSize(11).setFontWeight('bold')
    .setHorizontalAlignment('center').setVerticalAlignment('middle')
    .setWrap(true);
  sheet.setRowHeight(1, 48);
  for (let c = 1; c <= ncol; c++) sheet.setColumnWidth(c, nvsFmtWidth_(headers[c-1]));
  if (!count) return;
  const body = sheet.getRange(2, 1, count, ncol);
  body.setFontFamily('Arial').setFontSize(10)
    .setFontColor(cfg.bodyText).setVerticalAlignment('middle')
    .setWrapStrategy(SpreadsheetApp.WrapStrategy.CLIP);
  const bg = Array.from({length:count},(_,i)=>Array(ncol).fill(i%2 ? cfg.zebraBlue : cfg.zebraWhite));
  body.setBackgrounds(bg);
  body.setBorder(null,null,null,null,false,true,cfg.border,SpreadsheetApp.BorderStyle.SOLID);
  sheet.setRowHeights(2,count,34);
  headers.forEach(function(headerName,index){
    const t=nvsFmtNormalize_(headerName),col=index+1,range=sheet.getRange(2,col,count,1);
    if (/(stt|sothutu|mahoso|matiepnhan|recordid|trangthai|status|ngaynop|createdat)/.test(t)) {
      range.setHorizontalAlignment('center');
    } else {
      range.setHorizontalAlignment('left');
    }
    if (/(word|pdf|url|lienket|link|evidence)/.test(t)) {
      // Chỉ tô màu văn bản, không thay URL gốc thành HYPERLINK hay nội dung rút gọn.
      range.setFontColor(cfg.linkColor);
    }
  });
  if (!sheet.getFilter()) {
    // Không thay hoặc xóa bộ lọc sẵn có.
    sheet.getRange(1,1,nrow,ncol).createFilter();
  }
}
