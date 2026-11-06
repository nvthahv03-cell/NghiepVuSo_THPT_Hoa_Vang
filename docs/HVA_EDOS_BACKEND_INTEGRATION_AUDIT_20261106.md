# HVA–EDOS — Khóa giao diện và kiểm kê nối Backend

**Mốc kiểm kê:** 06/11/2026  
**Mục tiêu:** Phát hành phiên bản EDOS cơ bản trước 20/11/2026, chỉ với những nghiệp vụ vượt kiểm thử.  
**Trạng thái:** Tài liệu đối chiếu mã nguồn GitHub; **chưa kiểm thử tích hợp với Backend đang triển khai**, chưa khẳng định action có tồn tại hoặc đã chạy trên máy chủ.

## 1. Phạm vi đã khóa

- Giữ nguyên `DieuHanh.html`, 7 nhóm và 20 ô; không tự phát sinh hoặc thay đổi vị trí chức năng.
- Không sửa các trang nghiệp vụ đã xác nhận PASS nếu chưa có lỗi cụ thể.
- Sáu trang 2.1–2.2 vừa được tạo có thể thao tác soạn dự thảo trong phiên, nhưng **chưa có API lưu thật**. Tuyệt đối không gọi đây là hệ thống quản trị tài khoản hoặc phân quyền đã hoạt động.
- Không sử dụng nháp trong `localStorage` làm hồ sơ chính thức.

## 2. Kiểm kê đường nối hiện diện trong mã nguồn

| Trang / phần dùng chung | Dấu hiệu đã có | Việc phải xác minh trên Backend | Trạng thái |
|---|---|---|---|
| `NVS_GiaoViec_TheoDoi.html` | POST JSON qua `fetch` và `sessionToken`; action `nvsTaskCreate`, `nvsTaskList`, `nvsTaskUpdate` | Ba action được triển khai thật; danh sách đúng người gửi/nhận; quyền thao tác trên server; chống gửi trùng bằng `clientRequestId`; lưu vết | Chưa kiểm chứng tích hợp |
| `NVS_GiaoNhiemVu.html` | Tuyến phát hành nhiệm vụ `nvsTaskCreate` | Có cùng cấu trúc dữ liệu và chặn gửi trùng với Giao việc – Theo dõi; không phát hai lần khi đi qua hai màn hình | Chưa kiểm chứng tích hợp |
| `TTPhatHanh.html` | `publishPoll`, `publishMeeting`, `createMeeting`, `confirmMeetingAttendance`, `requestMeetingAbsence`, `submitSurveyPollResponse`; nhánh phát hành chung | Xác minh từng action và phản hồi; tính duy nhất của phát hành; quyền nhận thông báo; vai trò người nhận | Chưa kiểm chứng tích hợp |
| `HVA_Assistant_Shared.js` | Action `askVirtualAssistant`; yêu cầu phiên đăng nhập | Backend xác minh token, giới hạn gọi, xử lý lỗi; không ghi dữ liệu nghiệp vụ từ phản hồi AI | Chưa kiểm chứng tích hợp |
| `NVS_ThongBao_PhatHanh.html` | Soạn dự thảo trên thiết bị và chuyển sang luồng phát hành | Đối chiếu payload/đích chuyển và thao tác xác nhận của `TTPhatHanh.html`; kiểm tra trùng phát hành | Chưa kiểm chứng tích hợp |
| `LichCongTac.html` | Trang lịch hiện hữu | Xác minh action lịch hiện hành, quyền BGH/TTVP/ủy quyền, xem lịch GV, lịch sử sửa, thông báo, lưu tuần/tháng | Chưa kiểm chứng tích hợp |
| `NVS_BinhChon.html`, `NVS_KhaoSat.html` | Giao diện và hỗ trợ trợ lý | Xác minh action phát hành/nhận phản hồi thực tế, đối tượng bình chọn, quyền khóa, riêng tư, chống gửi trùng | Chưa kiểm chứng tích hợp |
| `NVS_DayThay.html` | Trang nghiệp vụ sẵn có | Xác minh nguồn lịch, xung đột giáo viên, người phê duyệt, nhật ký đổi phân công | Chưa kiểm chứng tích hợp |
| `HVA_Operations_Draft.js` | Nháp phân công chuyên môn/điều phối | Chưa được cấp API ghi; cần kiểm định nghiệp vụ và quyền trước khi nối | Chỉ giao diện |
| `HVA_Councils_Draft.js` | Nháp kiểm tra, thanh tra, thi đua, kỷ luật | Dữ liệu có thể nhạy cảm; cần Backend quyền theo hồ sơ, bảo vệ minh chứng và audit | Chỉ giao diện |
| `HVA_Admin_Draft.js` | Nháp 6 màn hình quản trị/chất lượng | Cần API đúng nghiệp vụ, xác thực server, xác nhận phê duyệt và nhật ký bất biến | Chỉ giao diện |

**Chú ý:** Không suy ra rằng Backend có action chỉ vì HTML gọi action. Không tự tạo action tên mới nếu chưa đối chiếu mã nguồn GAS đang chạy.

## 3. Thứ tự nối Backend, không sửa giao diện

### Ưu tiên 1 — Phiên, nhân sự và quyền

1. Chốt một nguồn phiên đăng nhập và cơ chế hết hạn; xác thực token trên server.
2. Chốt nguồn `HVA_Personnel.js`, định danh nhân sự nhất quán, xử lý nghỉ việc/chuyển tổ.
3. Server phải xác định quyền theo phiên thật; không tin trường `username`, `role` hoặc `manager()` do client gửi.
4. Bổ sung kiểm tra quyền xem/sửa/tải minh chứng trên mọi action có dữ liệu nội bộ.

### Ưu tiên 2 — Luồng nghiệp vụ lõi

1. Giao nhiệm vụ: người có quyền giao → gửi Backend → người nhận đọc → báo cáo sản phẩm → người giao/TTCM/BGH xác nhận theo phân quyền → tra cứu và lịch sử.
2. Thông báo: soạn → kiểm tra người nhận → phát hành một lần → kiểm tra người nhận đọc → lưu lịch sử.
3. Cuộc họp và lịch công tác: quyền tạo/điều chỉnh → phát hành → xem theo đối tượng → ghi nhận thay đổi.
4. Bình chọn, khảo sát: phát hành → nhận phản hồi → ngăn trả lời trùng → khóa → thống kê có quyền.

### Ưu tiên 3 — Các nghiệp vụ quản trị/đặc thù

- 2.1–2.2 và 2.3–2.4 chỉ được chuyển khỏi trạng thái bản nháp sau khi có Backend, phân quyền, lưu trữ và nghiệm thu. Tuyệt đối không biến trang tĩnh thành giao diện cấp quyền thật chỉ bằng nút bấm.
- Phân công chuyên môn, điều phối, dạy thay phải có kiểm tra xung đột và vai trò phê duyệt phù hợp.

## 4. Giao kèo kỹ thuật tối thiểu để thử từng action

- **Request:** `action`, `sessionToken`, nội dung đúng schema, `clientRequestId` cho các thao tác có thể lặp.
- **Response:** quy ước thành công (`ok` hoặc `success`) thống nhất, mã bản ghi, trạng thái, người xử lý; lỗi có thông báo phù hợp người dùng, không lộ thông tin bí mật.
- **Bảo mật:** kiểm tra phiên và quyền *trên Backend*, từ chối sửa bản ghi không thuộc phạm vi, giới hạn kích thước dữ liệu, xác thực URL minh chứng, không đưa khóa/token vào query URL hay log.
- **Tính toàn vẹn:** mọi lần phê duyệt, thay đổi sau phát hành và từ chối phải có bản ghi lịch sử; request lặp cùng khóa phải không tạo bản ghi mới.
- **Kiểm thử:** đúng vai trò, sai vai trò, phiên hết hạn, thiếu trường, trùng yêu cầu, sửa dữ liệu sau duyệt, gián đoạn mạng, mở lại sau tải trang, điện thoại và máy tính.

## 5. Danh sách nghiệm thu bắt buộc

| Mã kiểm thử | Điều kiện đạt |
|---|---|
| AUTH-01 | Có phiên thật mới xem được dữ liệu cá nhân |
| AUTH-02 | Giáo viên không thể tự tạo/phê duyệt nhiệm vụ dành riêng BGH dù sửa mã client |
| STAFF-01 | Danh sách nhân sự đúng nguồn và không lặp |
| TASK-01 | Giao nhiệm vụ tạo 1 bản ghi, người nhận thấy đúng |
| TASK-02 | Báo cáo kết quả, xác nhận, yêu cầu bổ sung theo đúng quyền |
| TASK-03 | Gửi lại cùng `clientRequestId` không sinh bản ghi thứ hai |
| DOC-01 | Phát hành thông báo/họp đúng đối tượng, người nhận thấy được |
| DOC-02 | Phát hành lại không gửi trùng |
| CAL-01 | Giáo viên không thể tạo lịch chung |
| CAL-02 | BGH/TTVP và người ủy quyền hợp lệ quản lý lịch, có lịch sử sửa |
| GOV-01 | Các trang dự thảo không ghi vào dữ liệu thật |
| AUDIT-01 | Hành động chính thức có thời gian, chủ thể đã xác thực, thao tác và kết quả |
| RECOVER-01 | Lỗi mạng không tạo thành công giả, thử lại không nhân đôi dữ liệu |
| REG-01 | Cả 20 đường dẫn Điều hành vẫn mở được sau cập nhật |

Chỉ đánh dấu PASS dựa trên kết quả kiểm thử thật, có thời điểm, tài khoản thử nghiệm và bằng chứng. Cho đến lúc đó, trạng thái là **CHƯA KIỂM THỬ TÍCH HỢP**.

## 6. Điểm chặn hiện tại

Trong repository GitHub này chưa có đầy đủ mã Backend GAS đang triển khai cho tất cả action, nên không thể chứng minh end-to-end hoặc nối API một cách an toàn chỉ bằng HTML. Việc tiếp theo là đối chiếu đúng mã Backend bản chạy hiện hành với kiểm kê trên, sau đó triển khai tuần tự và kiểm thử không ảnh hưởng các chức năng đã hoạt động.
