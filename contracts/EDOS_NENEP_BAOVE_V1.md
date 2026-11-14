# HVA–EDOS V5 | Hợp đồng dữ liệu Nề nếp và Nhật ký Bảo vệ
Ngày cập nhật: 14/11/2026. Trạng thái: **CHỜ TRIỂN KHAI BACKEND V5 VÀ KIỂM THỬ THẬT**.

## Kiến trúc đã chốt
- Duy nhất **Backend HVA–EDOS V5** (không thêm doGet/doPost hoặc Web App mới).
- Dùng **CSDL Nghiệp vụ** hiện hành (`EDOS_NV_DB_ID` chỉ khi đã xác minh đúng workbook; không tự động tạo workbook mới).
- **Nề nếp** và **Bảo vệ** có các **tab chuyên biệt**; không trộn hồ sơ, không tạo hai bảng giống nhau. Học sinh từ nguồn `EDOS_STUDENTS_MASTER_ID`, nhân sự từ nguồn personnel đã xác minh; không sao chép sổ nhân sự/học sinh sang bảng tác nghiệp.
- Không tuyên bố các bảng bên dưới đã tồn tại nếu chưa được truy cập trực tiếp qua Apps Script và xác nhận tiêu đề.

## Bảng Nề nếp
Kế thừa các bảng và action đang có. Trước khi triển khai kiểm kê `hvaNnHealth`, `hvaNnStudents`, `hvaNnCreate`, `hvaNnAdminList`, `hvaNnVerify`. Không tự tạo `NN_GhiNhan` nếu đã có bảng nguồn khác đang được action sử dụng. Hỗ trợ phân loại trễ, vắng, vi phạm và trễ chào cờ **chỉ sau khi Backend hỗ trợ rõ**.

## Các tab Bảo vệ đề xuất, độc lập nghiệp vụ
| Tab | Nhiệm vụ | Trường cốt lõi |
|---|---|---|
| `BV_NhatKy` | Mọi sự việc/hoạt động trong ca | ID, ngày/giờ, ca, loại nghiệp vụ, nội dung, lớp/nhóm, phòng, người phụ trách, nhân viên ghi nhận, trạng thái, thời điểm ghi, mã yêu cầu chống trùng |
| `BV_RaVao` | Khách và học sinh ra/vào trường | ID, đối tượng, mã học sinh (nếu có), lớp, mục đích, giờ vào, giờ ra, người cho phép, mã nhật ký, trạng thái |
| `BV_BanGiao` | Bàn giao giữa 3 Bảo vệ | ID, ca giao, ca nhận, người giao, người nhận, nội dung chưa xử lý, thời điểm giao/nhận xác nhận độc lập, trạng thái |
| `BV_TaiSan` | Đồ bỏ quên, vật dụng thất lạc | ID, vật dụng, nơi/thời điểm tiếp nhận, người đang giữ, lớp/GVCN liên quan, người nhận, thời điểm nhận, trạng thái |
| `BV_Audit` | Truy vết thao tác | ID, tài khoản đã xác thực, hành động, hồ sơ, thời gian, kết quả |

Khi triển khai cần kiểm tra bảng hiện hữu, đối chiếu header trước khi thêm tab; **không xóa hoặc sửa schema đang có**.

## Ràng buộc
1. **Bảo vệ không điểm danh và không nhập sĩ số**. Bảo vệ ghi nhận có hoạt động theo lịch, phòng và người phụ trách; GV điểm danh.
2. HS xin về sớm: giờ thực tế rời cổng + người cho phép; liên kết Nề nếp (không tự kết luận có phép).
3. Bảo vệ giao ca, người nhận ca xác nhận bằng **tài khoản riêng**, không được tự xác nhận thay hai bên.
4. Đồ thất lạc: chưa có xác nhận người nhận thì chưa coi là hoàn thành.
5. Mọi thao tác ghi chỉ nhận thông tin người thực hiện do **server giải mã phiên hợp lệ**, không tin `actor`, `role`, `username` do Frontend cung cấp. Chỉ phía server có thể lập ID, ngày ghi và audit.
6. BGH đọc/kiểm tra theo phân quyền; Bảo vệ chỉ sửa hồ sơ cho phép trong ca; giữ dấu vết chỉnh sửa.
7. Ghi chú/tệp minh chứng phải tuân thủ quy định bảo vệ dữ liệu trẻ em, không lộ thông tin nhạy cảm qua trang công khai.
8. **Tạo bảng / cấp quyền / kích hoạt API phải thử trên bản STAGING** trước, có sao lưu, mới xét đưa vào production V5.

## Hợp đồng API dự kiến
Bảo vệ: `hvaBvHealth`, `hvaBvListSchedule`, `hvaBvCreate`, `hvaBvList`, `hvaBvRegisterExit`, `hvaBvHandover`, `hvaBvAcceptHandover`, `hvaBvTransferItem`, `hvaBvAcceptItem`. Các action này **chưa được chứng minh hiện diện trên Backend V5**.

Frontend chỉ gửi request đến endpoint EDOS V5 qua phiên hợp lệ. Sau `hvaBvHealth` trả `ready:true`, `writeEnabled:true` và server xác minh phân quyền, các nút nghiệp vụ mới được bật. Bất kỳ lỗi mạng/quyền/server nào đều phải khóa ghi, không lưu “thành công” cục bộ.

## Chặn triển khai
Trong tài khoản kết nối hiện tại chỉ truy cập được repo giao diện; chưa có quyền sửa/dựng Web App Apps Script V5 đang chạy, chưa xem được Google Sheets thực tế hoặc kết quả thử POST. Do đó **không tạo hoặc khẳng định đã tạo bảng thật**, không công bố PASS.