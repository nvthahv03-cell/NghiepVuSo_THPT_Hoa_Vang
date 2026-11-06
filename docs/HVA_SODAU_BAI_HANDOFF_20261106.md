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

## Bổ sung ngày 06/11/2026 – nhận dạng ảnh theo hướng có người kiểm soát

Theo ảnh sổ giấy nhà trường cung cấp: cột (4) **Tiết PPCT**, cột (5) **Tên bài, nội dung công việc**, cột (6) **Tên học sinh vắng mặt**, (7) **Nhận xét của giáo viên**, ba thành phần điểm **HT, KL, VS**, xếp loại và giáo viên ký tên. Giáo viên có thể ghi điểm VS lệch ô; **không tạo thành phần CC** theo yêu cầu xác nhận của BGH. Quy tắc 25/50 cho tiết đơn/đôi đang áp dụng ở bản thử theo chỉ đạo trước đó, chưa dùng để thay đổi bất kỳ điểm nào ghi trên ảnh.

### Đã cập nhật trong mã
- Màn hình chụp ảnh cho phép một hoặc hai ảnh; chức năng trợ lý nay gọi `window.HVA_SDB_AUTHORIZED_RECOGNIZE(files, context)` **chỉ khi** EDOS cung cấp hàm cầu nối đã xác thực, đồng thời người sử dụng xác nhận ảnh được phép xử lý. Khi thiếu cầu nối, hiện thông báo không có kết nối và **không tự sinh dữ liệu**.
- Bảng đọc ảnh xuất ra các dòng **nháp**, người dùng sửa những trường chưa rõ, đối chiếu với ảnh, xác nhận từng dòng rồi mới chuyển sang sổ nháp; hàng chưa xác nhận không vào thống kê thi đua. Nếu gặp trùng ngày/buổi/tiết, không tự ghi đè.
- Bản xem/in chia hai trang trái – phải theo nhóm cột của sổ giấy, A3/A4 ngang, có vị trí nhận xét GVCN và Hiệu trưởng. Vẫn là **mẫu in thử**, chưa khẳng định khớp số trang thực tế hoặc ký duyệt.
- Bộ xử lý máy chủ thử nghiệm đặt ở `backend/HVA_SDB_GEMINI_VISION_PILOT.gs`, hàm `hvaSdbRecognizePilot_(p)`. Chưa nối router GAS thật.

### Giao thức cầu nối đề xuất – chưa triển khai

Bên trong EDOS đã xác thực, lớp cầu nối (chưa có) chuyển ảnh thành base64, gửi yêu cầu có `action:'hva_sdb_recognize'`, `requestId:'sdb-...'`, `images:[{mimeType,data}]`, `permissionConfirmed:true` tới router thử nghiệm có bảo vệ phiên. Backend xác định danh tính qua `nvsActor_` và danh sách thử `HVA_SDB_TEST_USERS`, dùng `GEMINI_API_KEY` và `HVA_SDB_VISION_MODEL` trong Script Properties. Không có khóa trong URL/GitHub hoặc frontend. Response dạng `{success:true,draft:true,reviewRequired:true,rows:[...]}`. Hệ thống frontend nhận qua hàm `window.HVA_SDB_AUTHORIZED_RECOGNIZE`, không tự đọc session cross-origin.

**Phải xác minh giới hạn, rủi ro dữ liệu cá nhân học sinh, quyền chia sẻ ảnh, quyền phụ trách lớp, chính sách lưu ảnh, quota, xử lý lỗi/503 và chống lặp trên máy chủ trước khi bật trên dữ liệu thật.** Bản pilot chưa lưu ảnh gốc tập trung và chưa có kết nối duyệt chính thức; không PASS.

### Công việc còn lại theo thứ tự ưu tiên
1. Rà bản in hai trang với bản scan chuẩn đầy đủ một tuần; xử lý ngắt trang có hàng dài và vị trí chữ ký.
2. Kiểm toán bản sao GAS EDOS đang triển khai; nối action thử nghiệm và cầu nối xác thực trên đúng origin/SSO; cấu hình model Gemini hỗ trợ ảnh.
3. Thử trên ảnh trang đôi của trường (không công khai dữ liệu học sinh), kiểm tra ghép hàng, chữ tay, điểm ghi lệch ô, PPCT, nhận xét, vắng, chữ ký.
4. Thiết kế kho ảnh gốc và dữ liệu đã đối chiếu theo ID hồ sơ, revision, quyền và audit máy chủ; tổng hợp chỉ dữ liệu được duyệt chính thức.
5. Nghiệm thu A3/A4, PDF và XLSX bằng thiết bị thật; sau đó mới xin phép đưa vào EDOS.
