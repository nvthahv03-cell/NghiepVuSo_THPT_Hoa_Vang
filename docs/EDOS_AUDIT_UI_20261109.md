# HVA–EDOS | Báo cáo rà soát tổng thể và chuẩn hóa giao diện
**Ngày rà soát:** 09/11/2026  
**Phạm vi:** Repository `nvthahv03-cell/NghiepVuSo_THPT_Hoa_Vang`, nhánh `main`  
**Trách nhiệm:** Kim Quy Pro – tổng hợp và kiểm thử mã nguồn, không thay thế nghiệm thu BGH.

## 1. Phạm vi rà soát

- Kiểm tra cây repository: **131 tệp** trong snapshot đã đọc, gồm **51 tệp HTML (50 trang chính + 1 bản lưu trữ)**; tài nguyên JavaScript, CSS, Apps Script và tài liệu kỹ thuật.
- Kiểm tra đường dẫn nội bộ dạng `href="./..."` và `src="./..."` trong **50 trang vận hành**, đối chiếu tên tệp thực có trên nhánh `main`.
- Kiểm tra cú pháp JavaScript nội tuyến (bỏ qua `<script type="application/json">` chứa dữ liệu mã hóa). Không phát hiện lỗi cú pháp trong các script thực thi đã kiểm tra.
- Kiểm tra trọng điểm cấu trúc Điều hành, A/B/C Nghiệp vụ, Quản trị, QT5.4 tra cứu, Học liệu số, Hướng dẫn.
- Không sửa `index.html`, `BC_DayThemHocThem.html`, `BC_ChuNhiem.html`, các Backend GAS thật hoặc module đã PASS–LOCK.

## 2. Các thay đổi thực tế đã commit

| Tệp | Kết quả |
|---|---|
| `HVA_EDOS_UI_Standard_V1.css` **(tạo mới)** | Bộ quy tắc **opt-in** qua `body.hva-ui-v1`: màu/tương phản, focus bàn phím, vùng bấm tối thiểu 44 px, co giãn header, hỗ trợ giảm hiệu ứng chuyển động. Không thay CSS toàn hệ thống bằng selector chung không giới hạn. |
| `DieuHanh.html` | Áp dụng chuẩn UI, bổ sung đường dẫn Hướng dẫn; sửa nút về Trang chủ thay vì `history.back()` khó đoán; giữ nguyên 7 nhóm, 24 ô chức năng. |
| `NghiepVu.html` | Áp dụng chuẩn UI, bổ sung Hướng dẫn vào thanh đầu trang; vẫn giữ 3 nhóm A/B/C và các liên kết nghiệp vụ đang có. |
| `QuanTri.html` | Áp dụng chuẩn UI, điều hướng rõ về Điều hành và Hướng dẫn; vẫn giữ cấu trúc 6 nhóm, 19 mục (QT5.4 đang chờ Backend). |
| `NVS_TraCuu_CaNhan.html` | Đồng bộ nút quay lại Nghiệp vụ và Hướng dẫn, không sửa quyền Backend. |
| `NVS_QuanTri_TraCuu.html` | Đồng bộ thanh điều hướng và CSS, giữ thông điệp chỉ xuất file sau khi Backend xác thực quyền và nhật ký. |
| `KhoHocLieuSo.html` | Thêm điều hướng rõ về Nghiệp vụ và Hướng dẫn, giữ trạng thái **bản thử chờ tích hợp Learning Studio**. |
| `HuongDanSuDung.html` | Áp dụng chuẩn CSS dùng chung; giữ nguyên cấu trúc Giới thiệu & Hướng dẫn. |
| `A.1.1. NhiemVu_BaoCao.html` | Loại bỏ tham chiếu tệp **`NVS_A1.assistant.js` không tồn tại**; ba nút Trợ lý chưa có adapter được đánh dấu **chờ kết nối và vô hiệu hóa**, không giả chức năng AI đã chạy. |
| `TapHuan.html` | Sửa liên kết quay lại `./NVS_NghiepVu.html` (không tồn tại) thành **`./NghiepVu.html`**. |
| `tests/verify-edos-ui-standard-v1.cjs` **(tạo mới)** | 50 tiêu chí về cấu trúc giao diện, quyền điều hướng, liên kết, Javascript và phạm vi ảnh hưởng. |

## 3. Kết quả kiểm thử hồi quy

| Bộ kiểm tra | Kết quả |
|---|---:|
| `tests/verify-edos-ui-standard-v1.cjs` | **50/50 PASS** |
| `tests/verify-edos-a22.cjs` | **28/28 PASS** |
| `tests/verify-edos-bc-personal.cjs` | **28/28 PASS** |
| `tests/verify-edos-dh-nvs-nq52.cjs` | **43/43 PASS** |
| `tests/verify-edos-quantri-v1.cjs` | **33/33 PASS** |
| `tests/verify-edos-admin-lookup.cjs` | **47/47 PASS** |
| **Tổng** | **229/229 PASS** |

Lưu ý quan trọng: Đây là các **kiểm tra tĩnh, kiểm thử hồi quy ở cấp mã nguồn và mô phỏng quyền/nguồn dữ liệu**, không phải 229 ca thử nghiệm thực tế trên trình duyệt hoặc hệ thống đang chạy.

## 4. Các bất cập nghiệp vụ còn tồn tại

1. **Backend A22:** Mô-đun nhận hồ sơ nhóm A đã có trong repository nhưng chưa chứng thực việc tích hợp vào dự án GAS EDOS đang chạy.
2. **QT5.4 – Tra cứu tổng hợp:** Giao diện và xuất Excel/CSV/PDF đã có mã; chưa triển khai và kiểm thử action tra cứu trên Backend thật. Kho hồ sơ kiểm tra nội bộ chưa có nguồn tập trung được xác minh.
3. **Nhóm B Nghiệp vụ:** B.1.1 (TKB/phân công chuyên môn) và B.1.3 (lịch kiểm tra/coi kiểm tra) cần nguồn dữ liệu chính thức.
4. **Nhóm C:** Khen thưởng/nhắc nhở chưa có dữ liệu đã được xác nhận; NQ52 là hệ thống độc lập, chưa được tích hợp nghiệm thu.
5. **Học liệu số:** Learning Studio là bản thử riêng, chưa SSO chính thức qua EDOS.
6. **A1.1 Trợ lý:** Ba nút AI đang được khóa an toàn; cần adapter tích hợp/kiểm thử thực tế mới kích hoạt.
7. **Môi trường thật:** Chưa có biên bản kiểm thử trình duyệt đa thiết bị, kiểm thử bảo mật máy chủ, hoặc xác nhận dữ liệu GAS và số lần tải file thật.

## 5. Kiểm tra đường dẫn và giới hạn kiểm tra

- Đã đối chiếu tất cả đường dẫn tham chiếu tệp nội bộ tương đối trên **50 trang HTML vận hành** với các tệp trong repository, sau chỉnh sửa không còn đường dẫn tệp bị thiếu ở phạm vi biểu thức `href/src` dạng `./path` được quét.
- Bản lưu `docs/archive/NVS_BieuMau_NghiepVu_20261108.html` có liên kết tương đối về `NghiepVu.html` không tương thích vị trí thư mục lưu trữ; **không sử dụng bản archive như trang chạy**, nên giữ nguyên để bảo toàn dấu vết.
- Không kiểm chứng bằng mắt trên nhiều trình duyệt; chưa xác minh quyền/phiên thật trên Google Apps Script; không kết luận cả EDOS đã PASS.
- Không có công việc nào được thực hiện tự động sau khi cuộc hội thoại kết thúc.

## 6. Bước nghiệm thu đề xuất

1. Thầy mở trên máy tính và điện thoại: `DieuHanh.html`, `NghiepVu.html`, `QuanTri.html`, `KhoHocLieuSo.html` để phản biện bố cục và nút điều hướng.
2. Kết nối thử nghiệm Backend A22 và QT5.4 tại môi trường tách biệt, kiểm thử phân quyền GV/TTCM/BGH và xử lý lỗi trước khi công bố.
3. Dùng danh mục nguồn dữ liệu chính thức để nối TKB, lịch coi kiểm tra và hồ sơ KTNB; không dùng dữ liệu mẫu.
4. Chỉ chuyển trạng thái PASS–LOCK sau khi có nghiệm thu nghiệp vụ và kiểm thử trên tài khoản thực.

**KẾT LUẬN:** Đã hoàn thành chuẩn hóa giao diện có phạm vi và sửa các đường dẫn bị lỗi; **229/229 kiểm tra tĩnh/mô phỏng đạt**. Trạng thái dự án tổng thể: **ĐANG HOÀN THIỆN – CHƯA NGHIỆM THU VẬN HÀNH**.
