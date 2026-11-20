# HVA–EDOS V5 | A.2.1 ↔ KT01 – Đăng ký lịch kiểm tra không tập trung

**Triển khai theo Kế hoạch 400/KH-THPTHV ngày 18/11/2026.** Sử dụng cùng Backend EDOS V5 đang cấp `hvaSessionToken` và cùng CSDL `EDOS_DH_DB_ID`. Không tạo backend riêng hoặc `doGet/doPost` thứ hai.

## Mã frontend đã cập nhật trên GitHub

- `NVS_BieuMau_NghiepVu.html`: mở A.2.1, nút đầu tiên **Đăng ký lịch KT**, giữ nguyên hai nút **Mở mẫu trên Drive** và **Nộp hồ sơ**.
- `NVS_A21_DangKyLichKT.js`: giáo viên nhập trực tiếp, xem lịch của mình, sửa lịch chưa gửi TTCM. Chỉ báo thành công khi Backend xác nhận.
- `KT01_QuanLyDotKiemTraVaThi.html` và `KT01_LichKiemTra_KhongTapTrung.js`: TTCM xem lịch theo tổ, xác nhận đầy đủ và gửi BGH; BGH xem lịch toàn trường, phê duyệt hoặc trả lại. Chưa phát hành lịch thành kế hoạch riêng.
- `backend/patches/35_DH_KT01_LICH_KT_KHONG_TAP_TRUNG.gs`: module server duy nhất cho lịch, kiểm tra trùng tiết và giới hạn 02 môn/lớp/buổi.

## Việc phải làm tại dự án Apps Script V5 đang vận hành

1. Thêm file `35_DH_KT01_LICH_KT_KHONG_TAP_TRUNG.gs` vào đúng Apps Script V5. Không sửa hàm đã PASS, không tạo Router mới.
2. Trong **doGet** hiện hành, ngay trước nhánh mặc định `Action GET không hợp lệ`, thêm:
```javascript
if (['ktScheduleList','ktScheduleBatches'].includes(action)) {
  return hvaKTLGet_(action,params);
}
```
3. Trong **doPost** hiện hành, ngay trước nhánh mặc định `Action POST không hợp lệ`, thêm:
```javascript
if (['ktScheduleSave','ktScheduleTeamSubmit','ktScheduleDecide'].includes(action)) {
  return hvaKTLPostDispatch_(action,payload);
}
```
4. Kiểm tra hàm nhân sự `nvsPCDKReadPeople_` đang trả **đúng nguồn nhân sự Cuộc họp đã PASS**, có `username`, `hoTen`, `toBoPhan`, `viTriViecLam`; không thay bằng Sheet khác. Nếu schema khác, cần map về các trường này trong module 35; không nới lỏng xác thực.
5. Kiểm tra `CommonDb.ensureSheet` thực sự ghi vào **CSDL điều hành V5 chính thức**; không mở dữ liệu ở spreadsheet kiểm thử hoặc nguồn cũ.
6. Triển khai lại Web App đúng deployment URL mà frontend đang dùng (giữ nguyên URL `/exec`). Nếu triển khai mới đổi URL, cần cập nhật **đồng bộ** ở A.2.1 và KT01.

## Cấu trúc dữ liệu

**Một spreadsheet CSDL điều hành chung**, chứa 3 tab: `DH_KT01_LICH_KTTT` (bản đăng ký), `DH_KT01_LICH_DUYET_TO` (gói xác nhận tổ và BGH), `DH_KT01_LICH_LOG` (nhật ký). Không tạo một file Google Sheet cho mỗi giáo viên.

## Quy tắc nghiệp vụ đã mã hóa

- Ngày 14/12/2026–05/01/2027; loại trừ 24–25/12, 01/01 và Chủ nhật.
- Loại trừ ca tập trung theo khối tại Phụ lục III (21/12 sáng khối 12, chiều khối 11; 22/12 sáng khối 10, chiều khối 12; 23/12 sáng khối 11, chiều khối 10).
- Không trùng tiết và không quá 02 **môn khác nhau trên cùng lớp, ngày và buổi**, đối chiếu toàn bộ đăng ký của trường.
- GV chỉ sửa lịch của chính mình khi còn trạng thái `WAIT_TTCM`.
- TTCM chỉ xác nhận tổ của mình; bắt buộc xác nhận đã đối chiếu PCCM và ghi căn cứ rà soát trước khi gửi BGH.
- BGH duyệt hoặc trả lại theo **gói toàn tổ**; trả lại phải ghi lý do; lưu người xử lý và thời điểm.
- **Không có quyết định tự động từ AI**. Trước mắt dùng quy tắc xác định chắc chắn để chặn lỗi; chỉ bổ sung AI gợi ý khi có dữ liệu chính xác về PCCM/TKB và có nguồn AI đang PASS.

## Hạn chế cần hoàn thiện trước khi nghiệm thu toàn tuyến

- Chưa được phép coi việc TTCM tích ô “đã đầy đủ” là **tự động đối chiếu đủ giáo viên/lớp**; để tự động xác minh cần đối chiếu PCCM/B1 chính thức, loại trừ các lớp/hoạt động không có bài kiểm tra định kỳ.
- Chưa có cơ chế thay đổi lịch **sau khi BGH đã duyệt**; phải xây dựng trình điều chỉnh có lịch sử trước khi cho phép sửa.
- Chưa tạo thông báo nhiệm vụ C4 hay công bố lịch tới giáo viên qua một lịch chính thức.
- Chưa kiểm thử Backend V5/Sheet thực tế; không ghi trạng thái PASS vận hành.

## Đã thử nghiệm độc lập trên module (mô phỏng CSDL)

Kết quả chạy test giả lập trong môi trường JavaScript: GV lưu lịch; ngăn trùng tiết; ngăn môn thứ ba cùng buổi; ngăn ca tập trung; GV thường không thể trình tổ; TTCM trình tổ; BGH duyệt; GV tra cứu trạng thái đã duyệt. Đây là **kiểm thử logic**, không phải kiểm thử Apps Script deployment.

## Nghiệm thu thực tế cần đủ các bước

1. Đăng nhập GV ở NVS, lưu lịch, nhận xác nhận từ Backend và thấy bản ghi mới đúng Sheet.
2. Đăng nhập GV thứ hai, đăng ký trùng tiết/đăng ký môn thứ ba, phải thấy lỗi.
3. Đăng nhập TTCM tổ Toán–Tin, đối chiếu phân công 11 GV và các lớp cần lịch; xác nhận đầy đủ, gửi BGH.
4. Đăng nhập BGH, thấy bản tổng hợp tổ và các lịch toàn trường; phê duyệt hoặc trả lại có ý kiến.
5. GV/TTCM xem trạng thái cập nhật; kiểm tra log, quyền truy cập tổ khác và token hết hạn.
