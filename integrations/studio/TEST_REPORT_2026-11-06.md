# Biên bản kiểm tra module HVA Studio – 06/11/2026

## Phạm vi và môi trường
- Đọc mã nguồn trực tiếp từ GitHub, kiểm tra bằng môi trường JavaScript độc lập.
- Mock các API `PropertiesService`, `CacheService`, `LockService`, `Utilities`, `UrlFetchApp`, `nvsActor_`, `hvaTraCuuNhanSuTheoUser_`.
- **Không có kết nối Google Apps Script triển khai thật; không gọi Gemini API thật; không kiểm tra SSO khác origin.**

## Kết quả kiểm thử đã thực thi
**Kiểm tra hợp đồng đầu vào: 8/8 đạt.**
1. Dữ liệu hợp lệ – đạt.
2. Action không đúng – từ chối đúng.
3. Lớp 9 – từ chối đúng.
4. Trường đặc quyền từ client (model/isAdmin/apiKey) – loại bỏ đúng khi chuẩn hóa.
5. Không có chủ đề – từ chối đúng.
6. Output format HTML – từ chối đúng.
7. RequestId sai định dạng – từ chối đúng.
8. Nội dung quá 12.000 ký tự – từ chối đúng.

**Kiểm tra luồng xử lý giả lập: 8/8 đạt.**
1. Phiên giả lập hợp lệ, Gemini giả lập trả bản nháp – đạt.
2. Gửi lại requestId – bị từ chối.
3. Phiên giả lập sai – bị từ chối.
4–7. Yêu cầu hợp lệ thứ 2 đến thứ 5 – được xử lý.
8. Yêu cầu thứ 6 trong cùng cửa sổ 10 phút – bị từ chối.
Tổng số lần gửi request đến Gemini giả lập: **5**.

## Những phần chưa đạt điều kiện triển khai
- Cần kiểm tra `nvsActor_`, `hvaTraCuuNhanSuTheoUser_` trên bản GAS thử nghiệm thực tế.
- Cần kết nối route `hva_studio_ai_generate` trên bản sao router đã xác thực.
- Cần SSO khác origin với cơ chế trao đổi mã một lần, kiểm tra origin, TTL, chống phát lại.
- Cần thử Gemini thực, xử lý hạn mức/cost, timeout, phản hồi 429/503, kiểm tra hồi quy.
- Script Cache chỉ là cơ chế chống lạm dụng cơ bản, không thay thế quota bền vững.

**Kết luận:** PASS kiểm thử hợp đồng và mô phỏng; **KHÔNG PASS triển khai Google Apps Script / Gemini / SSO / EDOS chính thức**.

## Cập nhật kiểm tra tiếp theo (cùng ngày)
- Sửa Backend để từ chối yêu cầu thiếu `sessionToken` và che lỗi nội bộ khi tra cứu actor.
- Thêm `HVA_STUDIO_ROUTER_TEST_SNIPPET.gs`: hàm nối thử nghiệm tách biệt, **chưa gắn vào router thật**.
- Chạy lại bộ hợp đồng mới: **9/9 đạt** (thêm trường hợp thiếu phiên).
- Chạy 10 trường hợp Backend mô phỏng: **10/10 đạt**; gồm hợp lệ, chặn lặp, thiếu/sai phiên, bỏ qua `role` giả mạo, giới hạn, và tắt chức năng. Có 5 request giả lập đi đến bộ xử lý Gemini mock.
- Các kết quả trên **không thay thế kiểm thử Google Apps Script thật, SSO hoặc Gemini thật**.
