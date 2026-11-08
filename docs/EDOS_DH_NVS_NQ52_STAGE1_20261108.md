# EDOS – Nhật ký triển khai Điều hành / Nghiệp vụ số / NQ52
**Ngày:** 08/11/2026  
**Đợt:** 1 – kết nối giao diện hiện hữu; không sửa Backend hay Quản trị hệ thống.  
**Nguyên tắc:** giữ nguyên module PASS, công khai trạng thái dự thảo.

## 1. Thực hiện trên GitHub

| Tệp | Thay đổi | Commit |
|---|---|---|
| `DieuHanh.html` | Thêm ô **NQ52 – Giao sản phẩm tháng** tại nhóm 1.2; kết nối giao diện TTCM đã có, ghi rõ chưa Backend; sửa bộ đếm **7 nhóm · 23 chức năng** | `420e0044a8ed48007f7e68b25483e36180427308` |
| `NVS_GiaoViec_TheoDoi.html` | Mặc định vào **Việc của tôi** với GV/NV; ẩn tab giao việc/giám sát phía trình duyệt với người không thuộc BGH; hỗ trợ điều hướng `?view=mine` | `b27d62efb2e13f5fb722bb882ae93d7df120e829` |
| `NghiepVu.html` | Nối B.1.2 đến `LichCongTac.html`, B.1.4 đến `NVS_GiaoViec_TheoDoi.html?view=mine`; nút lịch trên thanh NVS mở trang Lịch thực; thêm thông báo NQ52 tại C.4; không gán NQ52 là đã hoạt động | `405ba85d55909311c023377e7929e15a854cc761` |
| `NQ52_TTCM_GiaoSanPhamThang.html` | Bổ sung kiểm tra phiên/nhận diện BGH/TTCM phía trình duyệt để không tự do mở giao diện dự thảo từ trang EDOS; chưa có bảo mật Backend | `40093fbd6364ca8add4ddb998d24e005fbf61933` |
| `tests/verify-edos-dh-nvs-nq52.cjs` | Thêm 25 kiểm tra tĩnh và cú pháp script | `2df5389b4deb2f595f28635536581b680b7eea5c` |

## 2. Kết quả kiểm thử

**25/25 kiểm tra tĩnh đạt** theo mã nguồn trên nhánh mặc định:
- Điều hành vẫn có 7 nhóm; 22 ô cũ và 1 ô NQ52 mới = 23.
- NVS có đủ 3 tab A/B/C; 6 nhóm A; 4 mục C; B.1.2 và B.1.4 có liên kết; 5 mục B còn pending.
- Không phát hiện ID HTML trùng ở `DieuHanh.html` và `NghiepVu.html`.
- JavaScript inline của 4 trang liên quan kiểm tra cú pháp đạt.

**Chưa kiểm thử:** đăng nhập thực theo vai trò, phân quyền Backend, thời gian tải, chức năng di động, giao việc và tự báo cáo NQ52.

## 3. Tồn tại cần xử lý trong đợt tiếp theo

### Điều hành
- Nhiều trang chuyên môn/quản trị mới hỗ trợ dự thảo; các luồng lưu, gửi, duyệt và ghi lịch sử còn thiếu.
- Cần ma trận phân quyền BGH / TTCM / TTVP / Bí thư Đoàn **ở Backend**. Kiểm tra menu trình duyệt không thay thế cho kiểm soát truy cập dữ liệu.
- Không sửa nhóm Quản trị hệ thống trong đợt 1, thực hiện sau khi Điều hành/NVS đã hoàn thiện.

### NVS
- Nhóm A có 22 đường dẫn sử dụng chung `NVS_BieuMau_NghiepVu.html` với cơ chế soạn bản nháp; chưa có tuyến nộp BGH/đồng gửi TTCM.
- Nhóm B vẫn còn 5 mục chưa có chức năng tra cứu phù hợp: B.1.1, B.1.3, B.2.2, B.2.3, B.2.4. Không chuyển một biểu mẫu quản lý sang trang tra cứu GV nếu nghiệp vụ không phù hợp.
- Nhóm C mới có khung cửa sổ, chưa có hồ sơ và kết quả thực từ Backend.
- Công tác chủ nhiệm và giáo dục hòa nhập còn những tiểu mục chưa hoàn thiện; bảo toàn `BC_ChuNhiem.html` và `BC_DayThemHocThem.html`.

### NQ52
- `NQ52_TTCM_GiaoSanPhamThang.html` chỉ lập và xuất phương án **bản nháp**.
- Chưa có action Backend để phê duyệt, phát hành, ghi minh chứng, tổng hợp hay kết nối module NQ52 độc lập do Kim Quy 3 xây dựng.
- NQ52 **không tự chấm** và không thay người có thẩm quyền ra quyết định.
- Chỉ kết nối NQ52 độc lập vào Điều hành/C.4 NVS sau khi Quy 3 bàn giao hợp đồng API và nghiệm thu PASS.

## 4. Kiểm thử nghiệm thu với tài khoản thực

1. BGH mở Điều hành, kiểm tra đủ 23 ô; NQ52 hiện là *Bản dự thảo · Chưa nối Backend*.
2. TTCM mở NQ52, kiểm tra tải được danh sách nhân sự đúng tổ (chưa phát hành); tài khoản GV/NV truy cập trực tiếp bị chặn tại giao diện.
3. GV/NV ở NVS tab B mở B.1.2 và B.1.4; xác minh B.1.4 vào đúng trang *Việc của tôi*.
4. NVS tab C mở C.4 để xem thông báo NQ52 chờ tích hợp, không hiển thị dữ liệu xếp loại giả.
5. Kiểm tra desktop/mobile, không vỡ layout; chạy `node tests/verify-edos-dh-nvs-nq52.cjs` sau mỗi thay đổi.

## 5. Chốt trạng thái

**ĐỢT 1: ĐÃ CẬP NHẬT MÃ – KIỂM THỬ TĨNH PASS – CHƯA NGHIỆM THU NGHIỆP VỤ THỰC.**

Không gắn PASS–LOCK cho Điều hành, NVS hay NQ52 ở giai đoạn này.
