# HVA EDOS — Kiểm tra chẩn đoán Gemini (06/11/2026)

## Trạng thái
- Đã cập nhật `HVA_STUDIO_BACKEND_TEST.gs` trên GitHub.
- **11/11 bài kiểm tra mô phỏng đạt** bằng cách thay thế `UrlFetchApp` với phản hồi giả lập; không sử dụng API key thật, không gửi request Gemini thật.
- **Chưa kết luận** khóa API Gemini của EDOS đúng/sai, hạn mức thực tế còn/đã hết, hoặc model thật đang hoạt động.

## Bảng diễn giải mã chẩn đoán an toàn
| Tình huống | errorCode | Ý nghĩa / bước xử lý |
|---|---|---|
| 200 có nội dung | success | Xử lý bản nháp |
| 429 | GEMINI_QUOTA | Kiểm tra hạn mức, ngân sách, tần suất; không tự gọi lặp |
| 503 / 502 / 504 | GEMINI_UNAVAILABLE | Máy chủ bận; thử lại thủ công sau |
| 401 / 403 | GEMINI_AUTH | Xác minh khóa, dự án và quyền trên máy chủ |
| 404 | GEMINI_MODEL | Rà soát model, quyền truy cập, endpoint |
| 400 | GEMINI_REQUEST | Kiểm tra cấu trúc request, định dạng model |
| 200 JSON sai | GEMINI_BAD_JSON | Kiểm tra dạng phản hồi dịch vụ |
| 200 promptFeedback bị chặn | GEMINI_SAFETY | Xem lại nội dung đầu vào, không bypass |
| 200 finishReason=MAX_TOKENS | GEMINI_TRUNCATED | Bản nháp chưa hoàn chỉnh, không công bố |
| 200 kết quả trống | GEMINI_EMPTY | Không có nội dung hợp lệ |
| UrlFetchApp lỗi mạng | GEMINI_NETWORK | Xác minh kết nối, quyền external_request |

**Chú ý:** `errorCode` không phải chứng cứ lỗi thật cho đến khi có request được phép từ Backend Apps Script TEST. Không ghi API key, sessionToken, prompt, phản hồi nguyên bản hoặc stack trace trong log.

## Router chính trong bản Backend ngày 03/11/2026 (chỉ là bản tham chiếu)
Tệp `HVA_EDOS_Backend_TichHop_Chat_20261103.gs` đã được nhà trường bàn giao trước đây, chứa `doPost`, biến `action` và helper `hvaJSON_`.

Tại **bản sao thử nghiệm** sau khi kiểm toán, có thể đặt nhánh trước lệnh `return hvaJSON_({ ok:false, message:'Action POST không hợp lệ: ' + action })`:

```javascript
// CHỈ TRÊN BẢN SAO TEST, không thêm vào production chưa kiểm toán.
if (action === 'hva_studio_ai_generate') {
  return hvaJSON_(hvaStudioTestRoute_(payload));
}
```

Gắn `HVA_STUDIO_BACKEND_TEST.gs` và `HVA_STUDIO_ROUTER_TEST_SNIPPET.gs` vào cùng dự án bản sao. Giữ `HVA_STUDIO_TEST_ENABLED` tắt cho tới khi đã có nhân sự thử nghiệm và cấu hình hoàn chỉnh. Chạy `hvaStudioContractSelfTest_()`, sau đó thử một request với dữ liệu giả bằng tài khoản được phép.

## Cổng nghiệm thu tiếp theo
1. Xác nhận chính xác mã Backend đang được triển khai (bản 03/11 chỉ là bản tham chiếu).
2. Tạo bản sao dự án GAS, không thay `doPost` production.
3. Xác minh quyền GV qua nhân sự thực, không lấy role tự khai báo.
4. Chạy request Gemini thật theo danh tính GV thử nghiệm, ghi **mã chẩn đoán và thời gian**, không ghi dữ liệu nhạy cảm.
5. Kiểm tra SSO và phân vùng origin: hai trang hiện có cùng origin GitHub Pages; cơ chế popup mock chưa đủ bảo đảm độc lập nguồn gốc và phiên. Cần phương án cách ly origin hoặc kiểm toán mô hình tin cậy chung.
6. Chỉ sau khi PASS mới tính tích hợp chính thức.

**Kết luận:** Hệ thống đã có công cụ phân biệt nhóm lỗi; nguyên nhân lỗi thực tế của Gemini chưa xác định.
