# HVA–EDOS | Cấu trúc phân hệ QUẢN TRỊ – phiên bản 1
**Ngày:** 08/11/2026  
**Chủ nhiệm nghiệp vụ:** BGH Trường THPT Hòa Vang  
**Phạm vi:** Tách danh mục Quản trị khỏi tác nghiệp Điều hành; chưa phát hành tính năng cấu hình hệ thống thực tế.

## I. Quan điểm tổ chức

- **Điều hành:** Chỉ đạo, giao việc, tổ chức hoạt động, họp, thông báo, lịch, điều phối, giám sát và công tác hội đồng.
- **Nghiệp vụ số:** Cá nhân nhận và thực hiện nhiệm vụ, lập/nộp báo cáo, tra cứu, lưu hồ sơ theo quyền.
- **Quản trị:** Thiết lập, thẩm định thay đổi cấu hình, tài khoản, quyền, dữ liệu, các kết nối và kiểm toán hệ thống.

**Trang Quản trị có địa chỉ `QuanTri.html`, riêng với `NVS_QuanTri.html` cũ vốn là danh mục Nghiệp vụ số. Không xóa/ghi đè tệp NVS cũ.** Không thêm cổng thứ năm vào trang chủ, không thay đổi bốn cổng đã có. Lối vào Quản trị đặt trên trang Điều hành.

## II. Danh mục 6 nhóm – 18 chức năng

| Mã | Tên chức năng | Hiện trạng ở V1 |
|---|---|---|
| **QT1** | **NHÂN SỰ VÀ TÀI KHOẢN** | |
| QT1.1 | Nhân sự & Tài khoản | Có mẫu dự thảo `NVS_NhanSuTaiKhoan.html` |
| QT1.2 | Tổ, bộ phận và cơ cấu nhân sự | Chưa triển khai |
| QT1.3 | Vòng đời tài khoản | Chưa triển khai |
| **QT2** | **PHÂN QUYỀN VÀ ỦY QUYỀN** | |
| QT2.1 | Phân quyền hệ thống | Có mẫu dự thảo `NVS_PhanQuyenHeThong.html` |
| QT2.2 | Ủy quyền và phân cấp | Chưa triển khai |
| QT2.3 | Kiểm tra và thu hồi quyền | Chưa triển khai |
| **QT3** | **DANH MỤC VÀ CẤU HÌNH NGHIỆP VỤ** | |
| QT3.1 | Quản lý danh mục nghiệp vụ | Có mẫu dự thảo `NVS_QuanLyNghiepVu.html` |
| QT3.2 | Biểu mẫu và quy trình xử lý | Chưa triển khai |
| QT3.3 | Phiên bản và PASS–LOCK | Chưa triển khai |
| **QT4** | **DỮ LIỆU VÀ LƯU TRỮ** | |
| QT4.1 | Quản trị nguồn dữ liệu | Chưa triển khai |
| QT4.2 | Kho văn bản – biểu mẫu số | Mở kho hiện hành **chỉ để xem**; chưa có công cụ quản trị kho |
| QT4.3 | Sao lưu và phục hồi | Chưa triển khai |
| **QT5** | **GIÁM SÁT VÀ KIỂM TOÁN** | |
| QT5.1 | Nhật ký hệ thống | Có mẫu dự thảo `NVS_NhatKyHeThong.html` |
| QT5.2 | Thống kê – báo cáo hệ thống | Có mẫu dự thảo `NVS_ThongKeBaoCao.html` |
| QT5.3 | Giám sát truy cập và phiên | Chưa triển khai |
| **QT6** | **TÍCH HỢP VÀ HỖ TRỢ VẬN HÀNH** | |
| QT6.1 | Kết nối Backend, API và SSO | Chưa triển khai |
| QT6.2 | Cấu hình thông báo và lịch trình | Chưa triển khai |
| QT6.3 | Hỗ trợ sự cố và yêu cầu kỹ thuật | Chưa triển khai |

Tổng: 6 nhóm, 18 chức năng. Năm chức năng có mẫu dự thảo, một chức năng có liên kết chỉ xem, mười hai chức năng chưa được triển khai.

## III. Phân quyền đề xuất và điều kiện bắt buộc

| Vai trò | Xem danh mục Quản trị | Sửa cấu hình / dữ liệu hệ thống |
|---|---|---|
| Hiệu trưởng | Có | Chỉ khi Backend cấp đúng quyền và có quy trình kiểm soát |
| Phó hiệu trưởng | Có | Theo ủy quyền thực tế, được xác thực tại Backend |
| Quản trị viên được giao nhiệm vụ | Có | Theo danh sách quyền cụ thể, có nhật ký |
| TTCM / TTVP | Không tự động | Không; có thể được cấp quyền chức năng cụ thể có giới hạn ở các phân hệ khác |
| Giáo viên / nhân viên | Không | Không |
| Bí thư Đoàn | Không tự động | Không |

**Đặc biệt:** Kiểm tra phiên và chức danh trong `QuanTri.html` mới chỉ là **giới hạn điều hướng phía trình duyệt**, không phải xác thực hoặc phân quyền bảo mật. Các trang mẫu hiện có **không được phép thực thi tác vụ cập nhật dữ liệu thật** khi Backend chưa có kiểm tra thẩm quyền tương ứng. Không lưu token/API key trên URL hoặc tệp GitHub Pages.

Quy tắc nghiệp vụ khi xây dựng Backend:
1. Người đề nghị, người duyệt, người thực thi thay đổi nên được tách khi nghiệp vụ yêu cầu; lưu bằng chứng phê duyệt và thời hạn.
2. Ghi nhật ký đối với các thao tác cấp/thu hồi quyền, tạo/khóa tài khoản, sửa dữ liệu và thay đổi cấu hình.
3. Có phương án khôi phục và kiểm soát phiên bản trước khi thực hiện chỉnh sửa.
4. Không cấp toàn quyền hệ thống theo vai trò TTCM/TTVP chỉ vì họ được vào Điều hành.
5. Không cho AI tự phê duyệt hoặc thực thi thay đổi quản trị.

## IV. Mã đã cập nhật GitHub

- `QuanTri.html` (mới): danh mục độc lập, giao diện gọn, tìm kiếm, phân nhóm, trạng thái, lọc vai trò xem.
- `DieuHanh.html`: thêm nút **⚙ Quản trị hệ thống** chỉ hiển thị theo vai trò BGH/ADMIN hợp lệ; 7 nhóm, 24 ô nghiệp vụ cũ **không thay đổi**.
- `tests/verify-edos-quantri-v1.cjs`: 32 kiểm tra tĩnh và mô phỏng vai trò.

**Lưu ý:** Các liên kết Quản trị trực tiếp cũ trong nhóm 2.1/2.2 Điều hành vẫn được giữ nguyên để không làm gián đoạn thói quen sử dụng. Việc gom hoàn toàn những nút này về trang Quản trị nên thực hiện trong giai đoạn nghiệm thu lại giao diện Điều hành để tránh nhầm lẫn chức năng.

## V. Trình tự phát triển đề xuất

- **Giai đoạn QT–01:** Chốt danh mục, quyền xem, mã chức năng và bố cục giao diện (**đã cập nhật mã**).
- **QT–02:** Xây dựng cơ chế quyền Backend và yêu cầu quản trị tài khoản, nhóm/tổ.
- **QT–03:** Danh mục nghiệp vụ, quy trình xử lý, quản lý phiên bản và PASS–LOCK.
- **QT–04:** Dữ liệu, lưu trữ, sao lưu/khôi phục; nhật ký, báo cáo và truy vết.
- **QT–05:** Cấu hình kết nối/SSO, hỗ trợ sự cố, kiểm thử vai trò, bảo mật và vận hành.

## VI. Tiêu chí nghiệm thu

- BGH/ADMIN thấy được lối vào Quản trị sau khi đăng nhập EDOS.
- TTCM/TTVP/GV không thấy lối tắt Quản trị; truy cập thẳng bị từ chối ở giao diện.
- 18 chức năng hiển thị đủ và đúng trạng thái; 12 mục chưa triển khai không giả có hành động.
- Các trang mẫu không tuyên bố đã cập nhật dữ liệu.
- Giao diện trên máy tính, điện thoại và quyền Backend thực cần kiểm thử độc lập.
- Bốn cổng trang chủ giữ nguyên; không ảnh hưởng A/B/C hay các module PASS–LOCK.

**Trạng thái: QUẢN TRỊ V1 ĐÃ CẬP NHẬT GITHUB, CHƯA TÍCH HỢP BACKEND VÀ CHƯA PASS–LOCK.**
