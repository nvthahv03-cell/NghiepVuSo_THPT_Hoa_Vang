# HVA–EDOS · QT5.4 – Trung tâm tra cứu tổng hợp và xuất file
**Ngày:** 08/11/2026  
**Trạng thái:** Giao diện và module Backend đã commit GitHub; **CHƯA triển khai lên Google Apps Script EDOS hiện hành**. Chưa PASS–LOCK.

## I. Mục tiêu nghiệp vụ

Cung cấp hai chế độ trong **Quản trị → QT5.4 – Tra cứu tổng hợp**:

1. **Theo giáo viên/nhân viên:** Chọn người từ danh sách nhân sự xác thực, xem các hồ sơ thuộc nguồn đã kết nối, đối chiếu theo năm học, tổ, từ khóa.
2. **Theo nội dung:** Chọn các lĩnh vực DTHT, kiểm tra nội bộ, hồ sơ A, giao việc hoặc tất cả; lọc theo điều kiện và xuất bảng theo quyền.

Tìm được hồ sơ không đồng nghĩa hồ sơ đã được duyệt; không tìm thấy hồ sơ không đồng nghĩa giáo viên chưa hoàn thành nhiệm vụ.

## II. Nguồn dữ liệu và mức xác minh

| Mã | Nguồn | Tình trạng |
|---|---|---|
| DTHT | Sheet `NVS_DTHT` – báo cáo giáo viên dạy thêm – học thêm | Có hợp đồng 19 cột trong bản Backend EDOS thầy từng giao; cần xác minh trên môi trường đang chạy |
| A22 | Sheet `NVS_HO_SO_A22` – hồ sơ 22 mẫu A | Module đã xây dựng trên GitHub; còn chờ triển khai Backend A22 |
| TASK | Sheet `NVS_GIAO_VIEC` – giao việc và báo cáo kết quả | Có hợp đồng 17 cột trong bản Backend lưu; cần xác minh triển khai hiện hành |
| KTNB | Kiểm tra nội bộ số hóa | Có giao diện lập danh mục, tiếp nhận bản scan; **chưa có nguồn hồ sơ tập trung được xác minh**. Báo `NOT_CONNECTED`, không trả 0 hồ sơ như một kết luận nghiệp vụ |

DTHT ở cấu trúc hiện có lưu một dòng cho mỗi giáo viên/năm học và số phiên bản cập nhật; công cụ tra cứu này **không tự nhận là truy xuất toàn bộ lịch sử các bản báo cáo đã thay thế**.

## III. Mã đã triển khai

| Tệp | Nội dung |
|---|---|
| `QuanTri.html` | Nút nổi bật **Trung tâm tra cứu tổng hợp** và QT5.4; 6 nhóm, **19 chức năng**; mục mới ghi **Chờ Backend** |
| `NVS_QuanTri_TraCuu.html` | Giao diện tìm kiếm theo người/nội dung, chọn giáo viên từ nhân sự, năm học, tổ, từ khóa, mục đích, trạng thái nguồn |
| `HVA_Admin_Lookup_Controller.js` | Kiểm tra capability, yêu cầu API theo phiên, dựng kết quả từ phản hồi xác thực, khóa xuất khi thiếu nguồn hoặc kết quả bị cắt |
| `HVA_Admin_Lookup_Export.js` | Xuất **Excel .xlsx** (ZIP OpenXML thuần JavaScript), **CSV UTF-8 BOM**, và chức năng in/chọn **Save as PDF** của trình duyệt; không tải dữ liệu ra dịch vụ bên thứ ba |
| `backend/HVA_NVS_ADMIN_LOOKUP.gs` | Module GAS độc lập, 4 action, xác thực quyền BGH trên danh sách nhân sự, danh sách nguồn cho phép, ghi nhật ký tra cứu/xuất |
| `tests/verify-edos-admin-lookup.cjs` | Bộ **47 kiểm tra tĩnh và mô phỏng** gồm quyền, lọc, nguồn, kiểm toán, xuất XLSX/CSV |
| `tests/verify-edos-quantri-v1.cjs` | Bộ **33 kiểm tra** cấu trúc/điều hướng/quyền xem |

## IV. Xuất file

Nút được cung cấp:
- **Xuất Excel (.xlsx):** bảng kết quả, mã hồ sơ, giáo viên, tổ, năm học, nội dung, trạng thái, thời điểm cập nhật, cùng phần đầu ghi tiêu chí tra cứu, thời điểm, người xuất, mục đích và trạng thái từng nguồn.
- **Xuất CSV:** tương tự, Unicode UTF-8 BOM để Excel nhận tiếng Việt; bảo vệ các giá trị bắt đầu bằng ký tự có thể bị diễn giải thành công thức.
- **In / Lưu PDF:** sau khi Backend xác thực và ghi nhật ký xuất, mở hộp thoại in; chọn **Lưu dưới dạng PDF** để tạo tệp PDF.

**Không xuất hồ sơ nguồn/bản scan gốc, không xuất thông tin xác minh chữ ký hay dữ liệu bí mật.**

Các trường hợp bị chặn: thiếu session, Backend chưa có action, tài khoản không phải BGH, chưa nhập mục đích, không có nguồn kết nối hợp lệ, kết quả vượt 150 bản ghi (phải lọc hẹp trước khi xuất), không ghi được nhật ký kiểm toán.

## V. Quyền và kiểm toán

- Chỉ tài khoản BGH có phiên `hvaSessionToken` **được xác thực trên Backend** và có chức vụ BGH trong danh sách nhân sự mới được đọc chéo dữ liệu. TTCM, TTVP, GV/NV và ADMIN kỹ thuật chưa được cấp quyền tra cứu liên nghiệp vụ ở V1.
- Giao diện tự kiểm tra vai trò để hỗ trợ điều hướng, **không thay cho kiểm tra quyền phía Backend**.
- Lọc theo người dựa trên username chọn từ danh sách nhân sự; không nhận tên gõ tự do làm định danh hồ sơ.
- Mọi tìm người, tra cứu và xuất phải có mục đích rõ ràng; server ghi vào nhật ký `DB_AuditLog` trước khi trả kết quả. Nếu không ghi được nhật ký, tra cứu/xuất thất bại.
- Không đưa token, dữ liệu hồ sơ hay khóa dịch vụ vào URL.

## VI. Kết nối Backend tổng (CHƯA thực hiện)

1. Sao lưu dự án GAS EDOS đang chạy và đối chiếu contract với bản mới nhất; không ghi đè `doPost` hoặc các module PASS.
2. Thêm `backend/HVA_NVS_ADMIN_LOOKUP.gs` thành một file script riêng trong dự án GAS hiện hành.
3. Trong router `doPost`, nơi đã trích xuất `action` và `payload`, bổ sung đúng:
   ```javascript
   if (['nvsAdminLookupCapabilities','nvsAdminLookupPeople',
        'nvsAdminLookupSearch','nvsAdminLookupExport'].includes(action)) {
     return nvsAdminLookupRoute_(action,payload);
   }
   ```
4. Xác minh `nvsActor_`, `nvsGetPeople_`, `nvsResp_`, `HVA_CONFIG.SPREADSHEET_STORAGE_ID`, `CommonDb.ensureSheet` và quyền truy cập kho Sheet; **không tạo action thay thế xác thực**.
5. Chạy `testNVS_AdminLookup_ChiDoc()` để đối chiếu thành phần cần thiết. Kiểm thử từng nguồn và điều kiện mất Backend.
6. Kiểm thử BGH, TTCM, GV, ADMIN kỹ thuật; người khác không xem được dù biết URL.
7. Kiểm thử DTHT 2 giáo viên khác nhau, theo năm học; KTNB `NOT_CONNECTED`; tình huống nguồn khác sai schema không được gán nhầm hồ sơ.
8. Kiểm thử xuất Excel, CSV, PDF với Unicode tiếng Việt, kiểm tra file bằng Excel và bản in; kiểm thử kết quả trên 150 bản ghi được chặn xuất.
9. Kiểm tra log tạo theo tài khoản và mục đích; cuối cùng xin thầy nghiệm thu PASS–LOCK.

**Không công bố tuyến tra cứu và xuất đã chạy thật trước khi hoàn tất bước 2–9.**

## VII. Kiểm tra đã thực hiện trên GitHub

- 47/47 kiểm tra tra cứu và xuất file PASS, bao gồm mock quyền, nguồn KTNB thiếu, mã DTHT/A22, khóa xuất sai nguồn, ghi nhật ký truy vấn và xuất.
- 33/33 kiểm tra cấu trúc Quản trị PASS, sau khi thêm QT5.4.
- Kiểm chứng định dạng XLSX bằng phân tích ZIP: 5 thành phần OpenXML và thư mục trung tâm/đoạn kết ZIP đúng định dạng; dữ liệu tiếng Việt và ô công thức không bị thực thi. Đây là kiểm thử cấu trúc; chưa mở bằng Microsoft Excel thật trên máy thầy.
- Chưa kiểm thử thao tác trực tiếp ở GitHub Pages; chưa deploy GAS.

**Kết luận: QT5.4 có giao diện, mã Backend và xuất file; còn thiếu triển khai Backend và kho nguồn KTNB để đạt yêu cầu tra cứu thực tế đầy đủ.**
