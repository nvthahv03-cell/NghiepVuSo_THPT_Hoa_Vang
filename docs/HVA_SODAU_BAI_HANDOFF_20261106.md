# BÀN GIAO THỬ NGHIỆM SoDauBai – THPT HÒA VANG

**Ngày:** 06/11/2026  
**Trạng thái:** Bản thử giao diện và xử lý dữ liệu trên trình duyệt; **KHÔNG PASS** toàn tuyến và **KHÔNG kết nối dữ liệu chính thức**.

## 1. Tệp được tạo

- `SoDauBai.html`: giao diện nhập sổ, camera, nhận ảnh/PDF, xem danh sách, thống kê, trích xuất và in.
- `HVA_SoDauBai_Pilot.js`: mô hình dữ liệu tiết học, kiểm tra điểm, rà soát, bảng thống kê thử, ghi lịch sử trong phiên, xuất XLSX, xem/in A3/A4 qua trình duyệt.
- Chưa gắn ô mới vào Điều hành vì chưa được thầy phê duyệt vị trí ô; các phân hệ PASS hiện hữu giữ nguyên.

## 2. Những phần có mã xử lý

- Nhập thông tin: năm học, lớp, tuần; ngày, buổi, tiết, môn, GV, bài dạy, HS vắng, nhận xét, chữ ký ghi trên sổ, điểm HT/KL/VS/tổng, xếp loại.
- Thang điểm: tiết đơn tối đa HT=10, KL=10, VS=5, tổng=25; tiết đôi HT=20, KL=20, VS=10, tổng=50. Các giá trị vượt giới hạn, thiếu hoặc không khớp đều bị cảnh báo; **không tự sửa** điểm người ghi.
- Chụp camera điện thoại từng ảnh hoặc tải tối đa hai ảnh/PDF vào bộ nhớ trang, hiển thị từng bên để đối chiếu thủ công.
- Người sử dụng có thể đánh dấu đối chiếu thử khi đã rà soát. Đây **không phải phê duyệt chính thức**: không có xác thực vai trò và không có lưu trên máy chủ.
- Tổng hợp mẫu chỉ cộng các dòng đã đối chiếu thử và không có cảnh báo; không tự xếp hạng hay quy đổi trọng số.
- Chọn cột và tạo tệp `.xlsx` từ dữ liệu trang bằng bộ phát ZIP/XLSX độc lập, không đưa dữ liệu tới dịch vụ bên ngoài.
- In A3/A4 ngang theo danh sách hiện có, dùng hộp thoại trình duyệt để lưu thành PDF.
- Nhật ký thao tác tạm trong phiên; hỗ trợ tải JSON để lưu bản nháp dự phòng.

## 3. Những phần **CHƯA HOÀN THÀNH**

1. **Mẫu gốc:** Chưa có bản quét/mẫu đầy đủ tất cả trang của Sổ ghi đầu bài giấy hiện hành để đối chiếu chính xác kích thước, tên cột, vị trí chữ ký, mặt trái/phải, nhận xét GVCN/HT. Bố cục đang là **mẫu thử**, không được coi là mẫu giấy đã chuẩn hóa.
2. **OCR/AI:** Chưa có action Backend nhận ảnh/PDF, ghép hai nửa trang đôi theo hàng và nhận dạng chữ viết, chữ ký, HS vắng. Nút nhận dạng hiển thị trạng thái chưa kết nối, không tự tạo dữ liệu.
3. **Lưu & phân quyền:** Chưa có cơ sở dữ liệu tập trung, khóa chống sửa đè, lịch sử bất biến, người duyệt BGH và quyền GVBM/GVCN/bộ phận thi đua xác thực từ EDOS.
4. **Nguồn ảnh:** Ảnh chỉ nằm trong phiên, không gắn vĩnh viễn vào hồ sơ tiết học, chưa có mã ảnh/ô tương ứng để nghe/nhìn đối chiếu tại dòng.
5. **Tổng hợp thời gian:** Trang thử mới quản lý thủ công một lớp/tuần, lọc ngày/giáo viên/môn/trạng thái; chưa có sổ nhiều tuần, tổng hợp tháng/học kỳ/năm và chuẩn tỷ lệ chuyên cần.
6. **In:** Chưa dàn trang đối diện hai trang mẫu chuẩn, chưa có sản xuất PDF từ Backend hoặc bản chính thức xác nhận; các ô chữ ký là vị trí mẫu, không phải chữ ký thật.
7. **Kiểm thử:** Đã kiểm tra cú pháp JS và liên kết mã nguồn. **Chưa** kiểm thử trên trình duyệt thực tế, máy in A3/A4, Excel và ảnh sổ thật; tệp XLSX cần được mở bằng Excel/LibreOffice để nghiệm thu, không coi chỉ kiểm tra cú pháp là đủ.

## 4. Thiết kế Backend đề xuất

Phân hệ phải kế thừa đăng nhập EDOS, kiểm tra quyền trên **server**. Định danh dữ liệu bằng `schoolYearId`, `classId`, `weekNo`, `date`, `session`, `period` và ID hồ sơ. Cần xem xét `doublePeriodGroupId` để tránh đếm hai lần tiết đôi; lưu riêng `slotCount`, `maxScore`, điểm thực ghi và tổng thực ghi.

Kho dữ liệu đề xuất:
- `logbook_headers`: năm học, lớp, tuần, người quản lý, tình trạng khóa/mở.
- `logbook_entries`: dòng tiết, điểm thành phần, tổng ghi sổ, xếp loại, người ký, mã nguồn ảnh, người nhập, revision.
- `logbook_attachments`: file gốc, vị trí trái/phải, hash, liên kết trang/tiết, trạng thái chuyển chữ.
- `logbook_recognition_drafts`: dữ liệu OCR thô, cấu trúc theo tiết, độ tin cậy, vùng ảnh, lịch sử xác nhận.
- `logbook_approvals`: người kiểm tra/duyệt, thời điểm, đối tượng, ý kiến, phạm vi quyền.
- `logbook_audit`: hành động, nhân sự, timestamp máy chủ, bản trước/sau có kiểm soát.
- `logbook_exports`: loại, bộ lọc, cột, mẫu, tệp, phiên bản, lịch sử kết xuất.

Các action **đề xuất, chưa tồn tại**: `hva_logbook_createEntry`, `hva_logbook_listEntries`, `hva_logbook_uploadPage`, `hva_logbook_recognizePage`, `hva_logbook_confirmRecognition`, `hva_logbook_approveWeek`, `hva_logbook_getReport`, `hva_logbook_exportDocument`.

Lưu ý: việc ghi chữ ký trong nguồn là **ghi nhận sự hiện diện của chữ ký hoặc trạng thái chưa rõ**, AI không xác minh danh tính người ký chỉ từ nét chữ; cần đối chiếu theo quy trình. Không dùng dữ liệu học sinh ngoài quyền và không gửi ảnh chứa thông tin cá nhân tới AI chưa được phê duyệt.

## 5. Điều kiện nghiệm thu

Bắt đầu bằng **01 lớp, 01 tuần**, cung cấp ảnh hai mặt của tối thiểu một trang đôi sổ giấy và đầy đủ các kiểu tiết đơn/tiết đôi (có trường hợp ghi 25/50, thiếu/chênh điểm). Thử nhận dạng, đối chiếu từng dòng với bản gốc, loại tiết, số tiết, tổng, số lượt vắng, xác nhận, bản in A3/A4, mở file XLSX và đối chiếu thống kê. Chỉ sau đó mới nhân rộng; không sửa các phân hệ EDOS đã PASS.

**Kết luận:** Có bản thử phục vụ thao tác và rà soát, không phải hệ thống hồ sơ Sổ ghi đầu bài điện tử đang vận hành.
