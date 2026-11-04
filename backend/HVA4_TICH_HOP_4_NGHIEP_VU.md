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
