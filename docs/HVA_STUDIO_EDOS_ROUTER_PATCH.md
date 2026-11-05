# EDOS — hướng tích hợp thử nghiệm HVA Learning Studio
Ngày đối chiếu: 05/11/2026

## Trạng thái
- Đã đặt module riêng tại `backend/HVA_STUDIO_AI_TEST.gs` trong repository EDOS.
- Đối chiếu tệp Backend HVA mới nhất do nhà trường gửi trong cuộc trao đổi (có tuyến Google Meet). Đó là bản nguồn; **chưa xác minh phiên bản triển khai Apps Script hiện tại**.
- Bản nguồn đối chiếu có `doPost`, `nvsActor_`, `hvaTraCuuNhanSuTheoUser_` và `nvsGeminiFallbackV441_`; chưa có tuyến `hva_studio_ai_generate`.
- **KHÔNG ĐƯỢC xem file trong GitHub là Backend đã deploy.** Chưa kiểm thử cuộc gọi Gemini, chưa có SSO Studio↔EDOS.

## Chỉ thay router trong dự án TEST sau khi sao lưu và kiểm toán
Trong `doPost(e)`, sau phần xác định `action` và trước `return ...Action POST không hợp lệ`, thêm đúng một tuyến:

```javascript
if (action === 'hva_studio_ai_generate') {
  return nvsResp_(hvaStudioAiGenerate_(payload));
}
```

Không tạo `doPost` thứ hai, không sửa logic đăng nhập, `submitDTHT`, `submitChuNhiem`, Google Meet, lịch hay báo cáo khác. Không nạp nhiều file có khai báo `CONFIG`, `doGet`, `doPost` trùng nhau.

## Cấu hình Script Properties (chỉ trên Apps Script TEST)
- `GEMINI_API_KEY`: giá trị khóa đặt trực tiếp trong Script Properties, **không dán vào GitHub**.
- `HVA_STUDIO_GEMINI_MODEL`: model hợp lệ với tài khoản/thử nghiệm.
- `HVA_STUDIO_TEST_USERS`: danh sách username GV thử nghiệm ngăn cách bằng dấu phẩy; **không cho toàn trường**.

Module chỉ hỗ trợ bài dạy Toán 10 – Mệnh đề và tập hợp, trả `answer`, `requestId`, `draft:true`, `reviewRequired:true`, `provider:'gemini'`. Cơ chế giới hạn hiện là tối đa 5 yêu cầu trên một cửa sổ cache 6 giờ, nhằm giảm rủi ro trong giai đoạn thử. Đây không phải cơ chế hạn mức sản xuất; để nâng cấp production phải có hạn mức lâu bền và nhật ký phù hợp.

## Kiểm thử server-side trước khi cấp cầu nối Studio
1. Xác thực đúng một phiên hợp lệ của tài khoản được cho phép, từ máy chủ, không đưa sessionToken vào log hoặc ảnh chụp.
2. Thử không phiên, sai quyền, sai môn/lớp, quá dung lượng và gửi lại requestId.
3. Thử gọi Gemini thực tế; đối chiếu định dạng với adapter Studio; kiểm tra lỗi 429, 503 và timeout.
4. Chưa cung cấp `HVA_STUDIO_AUTHORIZED_SEND` cho trình duyệt ngoài origin đến khi có cơ chế SSO/ủy quyền qua máy chủ. **Không copy token EDOS vào URL, localStorage Studio hoặc JavaScript tĩnh.**
5. Chỉ khi có kết quả thử thật mới đánh dấu PASS và xin bật cho GV thử giáo án.

## Lưu ý bảo toàn PASS
- Production EDOS không thay đổi khi chỉ cập nhật các file trên GitHub.
- Các chức năng cần kiểm tra hồi quy: đăng nhập, DTHT, chủ nhiệm, lịch, Meet, kho văn bản, thông báo, trợ lý AI.
- Không mô phỏng phản hồi Gemini. Không tự lưu hoặc phát hành giáo án AI.
