# Bốn nghiệp vụ NVS – nhật ký tích hợp và nghiệm thu

**Nhánh thử nghiệm:** `feature/hva-four-nghiep-vu-20261104`. Không triển khai thẳng vào `main`.

## Phạm vi
1. **Sổ đầu bài BD HSG 12**: giữ nguyên dự án Apps Script/Google Sheet và dữ liệu hiện hành. Trang `SoDauBai_BDHSG12.html` **chỉ mở Web App cũ**, không tạo sổ thứ hai. Điền URL Web App đã xác minh vào `HVA4_Links.js`; hiện còn trống vì không có URL thực trong mã được cung cấp.
2. **Sổ chủ nhiệm điện tử**: `SoChuNhiem_DienTu.html`. 21 nhóm nội dung, nhập Excel/CSV có xem trước, không lưu danh sách học sinh vào localStorage. Phải xác thực lớp GVCN phía máy chủ.
3. **Kê khai NQ 52**: `NQ52_KeKhai.html`. GV trực tiếp nhập; phân biệt NQ 52/2025/NQ-HĐND (thu nhập tăng thêm) với QĐ 32/2026/QĐ-UBND (đánh giá theo hiệu quả công việc). Không tự quyết định mức chi.
4. **Sổ theo dõi thiết bị**: `SoTheoDoi_ThietBi.html`. Có bảng ghi sử dụng, danh sách GV–phân công, phần nhận xét của lãnh đạo theo đúng loại sổ giấy. BGH ký/nhận xét phải do máy chủ xác nhận.

## Backend dự kiến (chưa triển khai)
- `backend/HVA4_Store.gs` và `backend/HVA4_Business.gs` là **mã phụ trợ** cho NVS, không có `doGet/doPost` để tránh va chạm.
- Sau khi đối chiếu toàn bộ Backend đang chạy, gọi `HVA4_dispatch_(payload, principal)` **chỉ từ router đã xác thực `sessionToken`**. `principal` phải được máy chủ xác định từ phiên thực và nguồn nhân sự (username, vai trò, lớp GVCN, năm học). Không lấy principal từ JSON người dùng gửi.
- Đặt Script Property `HVA4_DATA_SPREADSHEET_ID` trỏ tới kho riêng đã phân quyền của NVS; quản trị chạy `HVA4_setupByAdmin_()` **một lần trên bản kiểm thử** sau khi sao lưu và đối chiếu. Không đưa ID/số liệu nhân sự nhạy cảm lên kho mã nguồn công khai.
- Các thao tác `hva4Get`, `hva4Save`, `hva4ImportRoster` phải phản hồi `schemaVersion: 'HVA4-1'` và `module` đúng. Khi Backend chưa hỗ trợ, trang **chặn ghi** và thông báo rõ.
- Các màn hình duyệt của BGH, chữ ký/nhận xét, xác nhận đăng ký thiết bị, và chuyển dữ liệu sổ hiện hành còn phải xây dựng/đối chiếu nghiệp vụ trước triển khai thật.

## Điều kiện PASS
- [ ] URL Sổ đầu bài thật được xác minh, mở từ EDOS đúng Web App đang dùng, dữ liệu cũ còn nguyên.
- [ ] Sổ chủ nhiệm: thử với GVCN, lớp thật; nhập danh sách; tải lại, không mất dữ liệu; giáo viên khác bị chặn.
- [ ] NQ52: tự kê khai → nháp → gửi → kiểm tra nguồn minh chứng và xác nhận đúng quyền, không được tự chấm thay BGH.
- [ ] Sổ thiết bị: ghi buổi dạy, sổ tổ/trường và nhận xét BGH, xuất mẫu và kiểm tra phân quyền.
- [ ] Báo cáo chủ nhiệm, DTHT và các chức năng PASS trước đó vẫn chạy (kiểm thử hồi quy).
- [ ] Backend cùng các bảng Sheet đã sao lưu; không có nhân sự hoặc học sinh bị lộ dữ liệu.

**Tình trạng hiện tại:** Đã tạo trang, nối danh mục và mã chuẩn bị Backend trên nhánh thử nghiệm. **CHƯA PASS** do chưa có quyền cập nhật/triển khai Apps Script hiện hành, thiếu URL Web App sổ đầu bài chính xác và chưa có kiểm thử dữ liệu thực tế.
## Kết quả kiểm tra mã ngày 04/11/2026
- Kiểm tra cú pháp JavaScript các trang và thư viện: **ĐẠT**.
- Kiểm tra sơ bộ 14 tình huống Backend bằng dịch vụ SpreadsheetApp/LockService giả lập: **14/14 đạt**, gồm phân quyền đọc hồ sơ cá nhân, GVCN nhập danh sách đúng lớp, chỉ BGH được nhận xét, chặn giáo viên tự ghi nhận xét Hiệu trưởng, chặn sửa bản NQ52 đã duyệt, không ghi đè dữ liệu sổ HSG 12.
- Đã bổ sung giao diện BGH xác nhận/yêu cầu bổ sung và mã xử lý ghi nhật ký.
- **Chưa có kết quả kiểm thử live Apps Script, Google Sheets, quyền trình duyệt hoặc bản in theo sổ giấy. Chưa đủ điều kiện tuyên bố PASS toàn bộ.**

## Kiểm định bổ sung
- Đã mở rộng bộ kiểm thử giả lập đến **16/16 đạt** sau khi sửa lỗi trong chính bộ mô phỏng thao tác ghi ô Google Sheets.
- Đã chặn mã học sinh dạng công thức bảng tính và lớp/mã học sinh không hợp lệ.
- Đã kiểm tra quyền BGH xem hồ sơ, chặn GV khác xem hồ sơ, chặn GV tự nhận xét thay Hiệu trưởng, chặn chỉnh sửa sau khi BGH xác nhận.
- Đã có thao tác BGH xác nhận hoặc yêu cầu bổ sung với nhật ký; vẫn chờ gắn vào router Apps Script và kiểm tra trên Google Sheet thực tế.

## Bản Sổ chủ nhiệm theo 21 nội dung sổ giấy (04/11/2026)
- Bản giao diện `SoChuNhiem_DienTu.html` chuyển từ biểu mẫu chung sang menu 21 mục với trường nhập được thiết kế riêng cho mỗi loại nội dung: văn bản, giáo viên bộ môn, CMHS, cán bộ lớp, thống kê, sơ đồ chỗ ngồi, kế hoạch tháng/tuần, thành tích, theo dõi học sinh, thu nộp và nhận xét Hiệu trưởng.
- Mục 4 dùng **trực tiếp danh sách học sinh đã xác thực**, không lập danh sách thứ hai. Có nhập Excel/CSV, xem trước, tải mẫu và xuất danh sách.
- Mỗi mục được lưu riêng theo `sectionKey + lớp + năm học`. Máy chủ kiểm soát định dạng, năm học, phân quyền và không cho tạo hồ sơ trùng mục. Giáo viên bị chặn ghi mục 21; BGH chỉ lập nhận xét cho lớp có danh sách học sinh trên máy chủ. GVCN được đọc lại nhận xét BGH của lớp mình.
- Đã kiểm tra cú pháp các tệp JS/Backend, 21 nhãn mục, sự tồn tại của các điều khiển giao diện và không thay đổi `BC_ChuNhiem.html`, `BC_DayThemHocThem.html`. Bộ kiểm thử dữ liệu giả lập đã kiểm tra lưu độc lập 19 mục có nhập liệu (mục 4 lấy dữ liệu lớp, mục 21 dành BGH), cách ly lớp, khóa quyền và đọc nhận xét. Đây **không** phải kiểm thử trên Google Sheet thật.
- Cần khi triển khai: kết nối router Apps Script đã xác thực token với `HVA4_dispatch_`; cài `HVA4_DATA_SPREADSHEET_ID`; chạy `HVA4_setupByAdmin_`; kiểm tra phân công GVCN thực trên server và đăng nhập thử GV/BGH trước khi nghiệm thu. Không đưa dữ liệu học sinh thật vào thử nghiệm công khai.
- Nhánh `feature/hva-four-nghiep-vu-20261104` đang khác `main`; đối chiếu thay đổi mới trên `main` trước khi phát hành. Không gộp nhánh và không báo PASS vận hành khi chưa chạy thử thật.
