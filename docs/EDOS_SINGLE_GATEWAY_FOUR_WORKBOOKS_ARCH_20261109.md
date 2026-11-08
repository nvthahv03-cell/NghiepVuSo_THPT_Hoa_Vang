# HVA–EDOS | QUYẾT ĐỊNH KIẾN TRÚC: MỘT GATEWAY – BA KHO EDOS – NQ52 ĐỘC LẬP
**Ngày lập:** 09/11/2026 · **Trạng thái:** CHỐT KIẾN TRÚC ĐỀ XUẤT – CHƯA CHUYỂN DỮ LIỆU/CHƯA DEPLOY GAS  
**Căn cứ kiểm kê:** hai tệp Backend do thầy cung cấp ngày 08/11/2026; repository hiện hành của HVA–EDOS; bàn giao HVA NQ52 PRO.

## 1. Quyết định ranh giới hệ thống

### 1.1. Backend EDOS
- **Một dự án Google Apps Script chính thức**, một Web App URL làm cổng API EDOS, một hàm `doGet(e)` và một hàm `doPost(e)` trong toàn dự án.
- **Không phải một tệp Code.gs khổng lồ:** tách các tệp `EDOS_Config.gs`, `EDOS_Gateway.gs`, `EDOS_Auth.gs`, `EDOS_Personnel.gs`, `EDOS_DataAccess.gs`, `EDOS_DieuHanh.gs`, `EDOS_NghiepVu.gs`, `EDOS_QuanTri.gs`, `EDOS_Integrations.gs`, `EDOS_Audit.gs` cùng một dự án. Tất cả top-level symbol phải độc nhất.
- Cấu hình ID Google Sheets qua **Script Properties**: `EDOS_PERSONNEL_MASTER_ID`, `EDOS_DH_DB_ID`, `EDOS_NV_DB_ID`, `EDOS_QT_DB_ID`; không hardcode token, API key hoặc mật khẩu trên GitHub Pages.
- Router chỉ chuyển yêu cầu theo **allowlist action/method/module**; xác thực phiên và phân quyền phía máy chủ theo actor, scope, record owner, trạng thái workflow. Thống nhất `success` / mã lỗi / `requestId`, duy trì adapter tương thích `ok` tạm thời.
- NQ52 vẫn là **ứng dụng/dịch vụ độc lập** của Kim Quy 3, liên thông qua **adapter EDOS ↔ NQ52 đã xác thực**. Không thêm một cổng Web App EDOS công khai thứ hai mang toàn bộ dữ liệu trường.

### 1.2. Tệp dữ liệu Google Sheets: ba tệp EDOS + một tệp riêng NQ52
Ở đây `tệp` = **Google Spreadsheet (workbook)**; trong mỗi tệp có nhiều `tab` = worksheet.

| Mã logic | Tệp đích dự kiến | Tab đầu mối | Chịu trách nhiệm dữ liệu |
|---|---|---|---|
| **EDOS_DH** | `HVA_EDOS_DB_DIEU_HANH` | `DB_03_GiaoViec` (nguồn cũ cần kiểm kê), `DB_01_VanBan`, `DH_LichCongTac`, `DH_CuocHop`, `DH_ThongBao`, `DH_KiemTraNoiBo`, `DH_LichSuXuLy` | Tạo/giao việc, lịch, cuộc họp, văn bản, hồ sơ kiểm tra và chỉ đạo |
| **EDOS_NV** | `HVA_EDOS_DB_NGHIEP_VU` | `NVS_DTHT`, `NVS_CHU_NHIEM`, `NVS_HO_SO_A22`, `NV_TiepNhan`, `NV_MinhChung`, `NV_BDHSG` | Hồ sơ do giáo viên/nhân viên lập, gửi, báo cáo, tiếp nhận |
| **EDOS_QT** | `HVA_EDOS_DB_QUAN_TRI` | `QT_DanhMuc`, `QT_RolePermission`, `QT_UyQuyen`, `QT_DataRegistry`, `QT_AuditLog`, `QT_TraCuuIndex`, `QT_BackupManifest` | Cấu hình, danh mục, quyền, nhật ký quản trị, chỉ mục tra cứu |
| **NQ52** | `HVA_NQ52_DB` **riêng** | `NQ52_Ky`, `NQ52_NhiemVuThang`, `NQ52_SanPham`, `NQ52_NghiemThu`, `NQ52_TuDanhGia`, `NQ52_ThamDinh`, `NQ52_KetQua`, `NQ52_KienNghi`, `NQ52_AuditLog` | Hồ sơ tự đánh giá/thẩm định/xếp loại, theo thẩm quyền riêng |

**Nguồn phụ trợ độc lập đang có:** `PERSONNEL_MASTER` = tệp nhân sự chính thức đang dùng. Đây là **nguồn thứ năm về mặt tệp**, nhưng **không phải tệp nghiệp vụ EDOS thứ tư**. Cả DH/NV/QT/NQ52 chỉ tham chiếu một `personId/username` chuẩn. Không tạo bốn bản nhân sự có thể sửa độc lập.

**Không tạo ngay tệp hoặc tab chưa có thật, không tự tạo/chuyển dữ liệu từ bản mô tả.** Các tên `DH_...`, `NV_...`, `QT_...`, `NQ52_...` là thiết kế đích, chưa phải xác nhận tab tồn tại. Giữ nguyên tên tab và header hiện tại của các nghiệp vụ đã chạy trong lúc chuyển tiếp.

## 2. Một dữ liệu – một chủ sở hữu ghi

| Đối tượng | Nguồn ghi chính được đề xuất | Cách đọc ở phân hệ khác |
|---|---|---|
| Nhân sự, username, tổ, vai trò gốc | PERSONNEL_MASTER | Toàn hệ thống đọc qua Personnel Service (không nhân bản bảng có quyền ghi) |
| Công việc giao và tiến độ | EDOS_DH, đích `DB_03_GiaoViec` sau đối chiếu dữ liệu thực | NVS `Việc của tôi`, QT tra cứu chỉ đọc; `NVS_GIAO_VIEC` nếu còn dữ liệu là **legacy cần đối soát**, không ghi song song |
| Báo cáo DTHT | EDOS_NV – `NVS_DTHT` | BGH/QT tra cứu có quyền; `submitDTHTReport` cũ chỉ được làm adapter sau khi xác minh payload |
| Báo cáo chủ nhiệm | EDOS_NV – `NVS_CHU_NHIEM` | BGH/QT theo quyền; giữ luồng đã PASS–LOCK |
| Hồ sơ biểu mẫu nhóm A | EDOS_NV – `NVS_HO_SO_A22` | BGH/TTCM theo vai trò và phạm vi; QT chỉ mục metadata |
| Kiểm tra nội bộ | EDOS_DH – `DH_KiemTraNoiBo` **đích thiết kế** | QT tra cứu chỉ đọc, cần nguồn hồ sơ và quyền đã nghiệm thu |
| Quyền và cấu hình | EDOS_QT | Gateway đọc qua Auth/Permission service; không đưa ma trận quyền lên client làm nguồn quyết định |
| Nhật ký hệ thống | EDOS_QT – `QT_AuditLog` (đích) | DH/NV gửi nhật ký qua dịch vụ; log cũ `DB_AuditLog` lưu đối chiếu, chưa xóa |
| Hồ sơ xếp loại NQ52 | NQ52 riêng | EDOS chỉ nhận trạng thái hoặc tham chiếu được cho phép; **không chép điểm/xếp loại sang NV/QT không kiểm soát** |

Lưu ý: hồ sơ minh chứng/bản scan, DOCX/PDF nặng cần kho Drive có phân quyền và lưu **ID/tham chiếu** trong Sheets, không nhét tệp nhị phân vào ô.

## 3. Kết quả đối chiếu HAI mã Backend do thầy giao

| Hạng mục | Bản NVS thống nhất | Bản Điều hành TTĐHS_HVA | Xử lý |
|---|---|---|---|
| doGet/doPost | Có 1 cặp | Có 1 cặp | Chỉ một cặp trong dự án EDOS đích; phải hợp nhất registry action |
| Tên biến/hằng dùng chung | `CONFIG`, `CommonDb`, `PersonnelService` và nhiều tên khác | Cùng các tên tương ứng | Không ghép mã trực tiếp: **trùng top-level namespace** |
| Định danh nhân sự | Tệp nhân sự đang có, tab `Du_lieu_NhanSu_THPT_HOA_VANG` | Cùng ID tệp nhân sự, tab `Du_lieu_NhanSu_HVA` | **PHẢI KIỂM TRA TAB THỰC TẾ** và chốt một tên; chặn fallback vào trang tính đầu tiên |
| Dữ liệu chuyên môn | Tệp storage với `NVS_DTHT` và `NVS_CHU_NHIEM` | Dùng tệp Điều hành với `DB_03_GiaoViec`, `DB_01_VanBan`, `DB_AuditLog` | Giữ data có thật, không trộn bảng/cột trái schema |
| Đăng nhập | `hvaXuLyDangNhap_` so mật khẩu dạng chuỗi; phiên cache riêng | `AuthService.login`, `HVA_GATEWAY_V1.guard_` | Thẩm định 2 tuyến, chọn **một Auth Service**; lên phương án băm mật khẩu/đổi mật khẩu, thu hồi phiên; tương thích cổng PASS trong giai đoạn chuyển |
| DTHT | `getDTHTInitial`, `submitDTHT` | `getDTHTInitial`, `submitDTHTReport` | Một service/nguồn chính; hai action cũ adapter theo hợp đồng đã đối chiếu |
| Công việc | `nvsTaskCreate/List/Update`, có kho `NVS_GIAO_VIEC` | `createTask/updateTaskStatus/updateTaskProgress` với `DB_03_GiaoViec` | Rà bản ghi và quyết định migration; **không dual write** |
| Cuộc họp/AI | Các hàm cuộc họp và AI trùng tên | Cùng nhiều hàm/trong doPost có hai case `generateMeetingAIDraft` | Chọn một service/khử duplicate switch, kiểm thử tất cả action |
| NQ52 | Chưa là tuyến chính thức trong hai bản | Chưa là tuyến chính thức | Chỉ bàn giao adapter từ Kim Quy 3 sau nghiệm thu |
| A22 và tra cứu QT5.4 | Có module riêng trên GitHub, **chưa được tích hợp vào router trong hai tệp gửi** | Chưa định tuyến | Đưa vào action registry sau khi xác minh quyền, không tuyên bố đã chạy |

**Kiểm chứng bằng parser:** từng tệp nguồn tự kiểm tra cú pháp JS được; **ghép trực tiếp cả hai tệp thất bại với `SyntaxError: Identifier 'CONFIG' has already been declared`**. Không đưa bản ghép lên Apps Script.

## 4. Hợp đồng Gateway và điều kiện bảo mật

1. Một `doGet/doPost` quản lý danh sách action rõ ràng; Google Calendar OAuth callback phải được giữ đúng tuyến hiện có khi hợp nhất.
2. Một `AuthService` xác minh token server-side, trạng thái tài khoản, thời hạn, revocation; không nhận vai trò/username do frontend tự khai làm căn cứ cấp quyền.
3. Hành động đọc hồ sơ cá nhân phải xác minh **chính chủ**; hành động đọc liên nghiệp vụ phải có quyền BGH hoặc ủy quyền hợp lệ cùng phạm vi.
4. Cấp/quyết định/xóa/sửa quyền: ghi nhật ký; không chấp nhận khi dịch vụ audit không hoạt động. Ghi `requestId`, chống gửi trùng `clientRequestId`, kiểm tra phiên bản để tránh ghi đè.
5. Không dùng số CCCD làm bằng chứng chữ ký số theo nghĩa pháp lý; rà soát luồng xác minh GVCN/DTHT, không trả CCCD trong API/log.
6. Không lưu mật khẩu thuần, token phiên hoặc API key trong tệp công khai hay các tab truy cập rộng. Nâng cấp xác thực theo lộ trình, không xóa dữ liệu tài khoản khi chưa có kế hoạch chuyển đổi.
7. Không xóa hay di chuyển data production chỉ vì thiết kế mới. Kho QT chỉ mục metadata, tra cứu thời gian và nguồn; không sao chép toàn bộ tài liệu nhạy cảm.

## 5. Thứ tự thực hiện bắt buộc

**GATE-0: KIỂM KÊ & SAO LƯU**
- Xác nhận dự án GAS Web App đang chạy, mã deployment URL hiện hành và bản gốc của hai code.
- Kiểm tra thực tế tệp nhân sự chứa tab nào; kiểm tra hai tệp data hiện có, header, số dòng, độ mới, quyền truy cập.
- Sao lưu từng Spreadsheet và mã Apps Script; ghi mốc hồi phục; không công bố ID/khóa qua GitHub.

**GATE-1: CHỐT REGISTRY & CANONICAL SOURCES**
- Chọn đúng một Auth/Personnel, map tất cả action, phát hiện action trùng và thiếu; khởi tạo QT database khi được phân quyền.
- Đối soát `NVS_GIAO_VIEC` và `DB_03_GiaoViec` trên mã nhiệm vụ, người thực hiện, thời gian, trạng thái; chọn kho chính và viết migration có khả năng hoàn nguyên.

**GATE-2: GHÉP Ở MÔI TRƯỜNG THỬ**
- Tạo dự án GAS thử có duy nhất một gateway; module theo namespace rõ ràng, ID qua Script Properties.
- Tạo adapter cho các API frontend đã dùng, không thay biểu mẫu DTHT/chủ nhiệm PASS–LOCK.
- Test auth/role, GET và POST, lịch/Meet OAuth, hồ sơ A22, DTHT, giao việc, xuất báo cáo, tra cứu QT5.4, audit.

**GATE-3: CUTOVER CÓ KHẢ NĂNG QUAY LUI**
- Một URL API EDOS chính thức được chuyển sang backend mới khi kiểm thử thật đạt.
- Chỉ ghi vào nguồn được chọn; nguồn cũ chuyển **read-only/archive** sau đối soát, không xóa.
- Theo dõi lỗi/mất phiên/trùng bản ghi; có điều kiện rollback được xác nhận.

**GATE-4: KẾT NỐI NQ52**
- Kim Quy 3 nghiệm thu NQ52, tạo tệp dữ liệu riêng và quyền riêng; adapter SSO server-to-server, không token trong URL; chỉ đồng bộ ID nhiệm vụ/minh chứng được phép.
- Trạng thái tự đánh giá, thẩm định, xếp loại do đúng người có thẩm quyền quyết định; không tự chấm hoặc gộp quyền Quản trị EDOS sang NQ52.

## 6. Quyết định trạng thái

**CHỐT PHẠM VI THIẾT KẾ:**
- **01 Backend EDOS chính thức**
- **03 tệp Google Sheets nghiệp vụ EDOS: Điều hành – Nghiệp vụ – Quản trị**
- **01 tệp Google Sheets riêng cho NQ52 PRO**
- **01 tệp nhân sự hiện hữu làm nguồn master chung, không nhân bản**.

**CHƯA CHỐT TRIỂN KHAI:** Chưa ghép mã/đổi URL, chưa tạo tệp dữ liệu mới, chưa chuyển dòng dữ liệu, chưa xác minh trực tiếp Apps Script/Google Sheets đang chạy; chưa ghi PASS–LOCK.
