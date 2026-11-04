# Tích hợp Google Meet – Cuộc họp HVA-EDOS

## Trạng thái thực tế
- Giao diện **CuocHop.html** đã có kết nối OAuth, tạo Meet và kiểm tra link đang chờ.
- Module **backend/HVA_Meet_OAuth_Service.gs** đã kiểm tra cú pháp và chạy kiểm thử mô phỏng.
- **CHƯA KÍCH HOẠT trên Backend GAS hiện hành.** GitHub Pages không triển khai Apps Script.
- Không được công bố PASS tạo link Google Meet thực tế khi chưa triển khai OAuth và kiểm thử với tài khoản được cấp quyền.

## Phương án ghép an toàn vào Backend NVS
Backend nguồn đang sử dụng `HVA_EDOS_Backend_TichHop_Chat_20261103.gs`, có một `doPost(e)` chung. Giữ nguyên toàn bộ các module đã hoạt động.

1. Thêm **nội dung** `backend/HVA_Meet_OAuth_Service.gs` thành file .gs mới trong **cùng dự án** GAS hiện hành. Không thêm doGet/doPost thứ hai.
2. Trong `doPost(e)`, ngay trước tuyến `nvsIntegratedPost_` hoặc trước `return hvaJSON_({ ok: false, message: "Action POST không hợp lệ: " + action });`, bổ sung:

```javascript
if ([
  'googleCalendarStatus',
  'startGoogleCalendarConnect',
  'createMeetingGoogleMeet',
  'getMeetingGoogleMeetStatus'
].includes(action)) return hvaMeetRoutePost_(action, payload);
```

3. Tại Google Cloud Console của dự án chứa Apps Script, bật Google Calendar API và tạo OAuth client loại **Web application**. Authorized redirect URI:
   `https://script.google.com/macros/d/<SCRIPT_ID>/usercallback`

4. Cấu hình Script Properties của **GAS, không đưa lên GitHub**:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

5. Đảm bảo Apps Script manifest cấp quyền `https://www.googleapis.com/auth/script.external_request` và `https://www.googleapis.com/auth/script.scriptapp`; giữ nguyên các quyền sẵn có. Cấp quyền cho lần chạy đầu.
6. Cập nhật bản triển khai **Web app** hiện hữu, giữ nguyên URL /exec đang dùng cho EDOS và chế độ thực thi đã có; không triển khai trùng Backend.
7. Đăng nhập bằng tài khoản có quyền Điều hành; chọn **Trực tuyến (Google Meet)**. Bấm **KẾT NỐI GOOGLE CALENDAR**, chấp thuận quyền; sau đó bấm **TẠO GOOGLE MEET**.
8. Xác nhận trả về một link `https://meet.google.com/aaa-bbbb-ccc` thật; kiểm thử trường hợp tạo lại cùng mã yêu cầu chỉ tạo một sự kiện; trường hợp chưa trả link hiển thị **KIỂM TRA LINK MEET**.
9. Chỉ đánh dấu PASS sau khi kiểm tra được: kết nối OAuth; phát hành link, lưu vào thông tin cuộc họp; tạo lại không trùng; quyền người dùng không hợp lệ bị từ chối.

### Bảo mật
- **Không đưa client_secret, refresh token, access token lên GitHub, Sheet công khai, localStorage hay trình duyệt.**
- Username trong action không được tin cậy: dùng `nvsActor_(payload)` từ sessionToken và `nvsIsManager_(actor)` từ Backend.
- Định danh sự kiện xác định theo username + requestKey, tạo lại cùng yêu cầu không tạo trùng.
- Google OAuth callback sử dụng state token do GAS cấp, có hạn sử dụng.
- Tài khoản kết nối chỉ được phép cấp phạm vi Google Calendar events, không yêu cầu quyền Gmail hoặc Google Drive.

### Kiểm thử không làm phát sinh cuộc họp
`TEST_HVA_MEET_NO_SIDE_EFFECT()` kiểm tra thời gian không hợp lệ bị từ chối trước khi gọi API.

**Lưu ý:** Mọi thao tác tạo phòng họp thật trên Google Calendar cần có sự đồng ý của người dùng khi bấm TẠO GOOGLE MEET.
