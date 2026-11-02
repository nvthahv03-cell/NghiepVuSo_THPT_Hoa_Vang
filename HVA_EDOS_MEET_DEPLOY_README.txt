HVA-EDOS - KẾT NỐI GOOGLE MEET VỚI BACKEND
1. Mở đúng dự án Apps Script mà WEB_APP_URL trong CuocHop.html đang gọi.
2. Thêm file HVA_EDOS_GOOGLE_MEET_SERVER.gs từ GitHub vào cùng dự án Apps Script.
3. Trong hàm doPost(e) hiện có, ngay sau dòng const action = String(payload.action || "").trim(); thêm:
   if (action === "createMeetingGoogleMeet") return hvaEDOSCreateMeetingGoogleMeet_(payload);
   KHÔNG thay thế toàn bộ doPost và KHÔNG chỉnh các router khác.
4. appsscript.json: giữ các OAuth scopes hiện tại và thêm:
   https://www.googleapis.com/auth/calendar.events
   https://www.googleapis.com/auth/script.external_request
5. Đây là cách triển khai theo danh tính chủ sở hữu Web App (Execute as me). Sự kiện được tạo trong Google Calendar của tài khoản CHỦ TRIỂN KHAI, không phải mặc định lịch cá nhân giáo viên.
6. Ủy quyền Calendar cho Apps Script, Deploy > Manage deployments > Edit > New version.
7. Chạy TEST_HVA_EDOS_MEET_MODULE_PRESENT để kiểm tra phụ thuộc (không tạo sự kiện). Sau đó thử tạo đúng một cuộc họp và xác nhận link Meet trên lịch Google.
8. Nếu MEET_PENDING, tra cứu sự kiện qua eventId thay vì bấm tạo lại. Cache chống trùng chỉ giữ 10 phút; tuyệt đối kiểm tra lịch trước khi thử lại khi lỗi kết nối.
9. Không đưa access token/refresh token, client secret lên GitHub.
TRẠNG THÁI: mã được chuẩn bị trên GitHub; chưa triển khai vào máy chủ Google Apps Script; chưa PASS tích hợp thực.
