# EDOS – Nhật ký thực thi đợt 3: Hoàn thiện tra cứu nhóm B, hồ sơ cá nhân nhóm C
**Ngày:** 08/11/2026  
**Nhánh:** main · Repository: `nvthahv03-cell/NghiepVuSo_THPT_Hoa_Vang`  
**Giới hạn:** Đã thay mã nguồn GitHub; chưa xác nhận triển khai Google Apps Script và chưa nghiệm thu phiên đăng nhập trên thiết bị thật.

## 1. Công việc đã sửa

| Tệp | Thực hiện |
|---|---|
| `NVS_TraCuu_CaNhan.html` (tạo mới) | Giao diện đọc hồ sơ nghiệp vụ A theo chủ tài khoản, nhiệm vụ được giao, tổng hợp trạng thái nhiệm vụ và số hồ sơ đã tiếp nhận. Dữ liệu lấy từ Backend qua session token, không sử dụng dữ liệu giả, không tính điểm NQ52, không lưu danh sách server trong localStorage. |
| `NghiepVu.html` | Kết nối B.2.3 → hồ sơ đã nộp, B.2.4 → tình trạng công việc, B.2.2 → không gian học liệu **bản thử đang tích hợp**. C.1 → hồ sơ cá nhân, C.2 → nhiệm vụ cá nhân, C.4 → lối xem kết quả thực; giữ thông tin NQ52 đang chờ tích hợp. |
| `backend/HVA_NVS_A22_MODULE.gs` | Thêm action `nvsA22ListMine`, lọc hồ sơ **chỉ theo username người tạo**; không dùng danh sách BGH/TTCM của `nvsA22List` cho trang cá nhân. |
| `tests/verify-edos-dh-nvs-nq52.cjs` | Cập nhật hồi quy phù hợp 2 mục B còn chờ nguồn dữ liệu, bổ sung kiểm tra liên kết C.1, C.2 và C.4. |
| `tests/verify-edos-bc-personal.cjs` (tạo mới) | Bộ 28 tiêu chí kiểm tra cấu trúc, logic và mô phỏng quyền của `nvsA22ListMine`. |
| `docs/EDOS_A22_STAGE2_20261108.md` | Bổ sung `nvsA22ListMine` vào hướng dẫn định tuyến `doPost` và nhiệm vụ tích hợp nhóm B/C. |

## 2. Trạng thái nhóm B

| Mã | Trạng thái đúng với mã nguồn |
|---|---|
| B.1.1 | **CHƯA KẾT NỐI** nguồn phân công chuyên môn và thời khóa biểu được xác minh. Repo HVA-TKB-PRO-V36 hiện là mã nguồn công cụ xếp TKB, không phải trang tra cứu TKB nhà trường đã được xác thực. |
| B.1.2 | Đã có lối mở `LichCongTac.html`; phân quyền, dữ liệu thực cần nghiệm thu. |
| B.1.3 | **CHƯA KẾT NỐI** nguồn lịch kiểm tra và phân công coi kiểm tra chính thức. Không dùng `PhanCong_DeKiemTra.html` (phân công ra đề) thay cho phân công coi kiểm tra. |
| B.1.4 | Có lối mở `NVS_GiaoViec_TheoDoi.html?view=mine`. |
| B.2.1 | Có trang `VanBan_QuyDinh.html`; giữ nguyên. |
| B.2.2 | Đã có lối xem `KhoHocLieuSo.html`, trang này vẫn ghi **ĐANG HOÀN THIỆN – CHỜ TÍCH HỢP**; chưa tuyên bố có dữ liệu học liệu của GV. |
| B.2.3 | Có giao diện hồ sơ cá nhân đọc bằng `nvsA22ListMine` và `nvsA22Get`, nhưng action chưa được triển khai trong GAS đang chạy. |
| B.2.4 | Có giao diện tóm tắt công việc từ `nvsTaskList` và số hồ sơ nhóm A; không coi đó là kết quả đánh giá, xếp loại. |

## 3. Trạng thái nhóm C

- **C.1:** Đã có trang tra cứu hồ sơ nhóm A của chính tài khoản; chưa bao phủ mọi loại hồ sơ khác trong trường.
- **C.2:** Đã có trang xem danh sách nhiệm vụ và dẫn sang tuyến báo cáo kết quả hiện hành.
- **C.3:** Mới có khung khen thưởng – nhắc nhở; chưa nối cơ sở dữ liệu đã phê duyệt.
- **C.4:** Có thống kê trạng thái nhiệm vụ và số hồ sơ A từ dữ liệu Backend, không quyết định NQ52; NQ52 vẫn chờ sản phẩm độc lập và hợp đồng API đã được nghiệm thu.

## 4. Kiểm thử sau cập nhật (trên mã GitHub)

- `tests/verify-edos-a22.cjs`: **28/28 PASS**.
- `tests/verify-edos-dh-nvs-nq52.cjs`: **30/30 PASS**.
- `tests/verify-edos-bc-personal.cjs`: **28/28 PASS**.
- **Tổng 86/86 kiểm tra tĩnh và mô phỏng**. Đây không phải 86 kịch bản kiểm thử trình duyệt hoặc tích hợp sản xuất.
- Test mô phỏng `nvsA22ListMine`: GV chỉ thấy hồ sơ của chính mình; TTCM/BGH không được thấy hồ sơ của GV qua *Mine* nhưng có thể tra cứu qua `nvsA22List` khi có quyền.

## 5. Việc cần làm để nghiệm thu

1. Triển khai an toàn module `backend/HVA_NVS_A22_MODULE.gs` vào đúng dự án Apps Script EDOS đang dùng, thêm các action `nvsA22Capabilities`, `nvsA22Submit`, `nvsA22List`, `nvsA22ListMine`, `nvsA22Get` vào router `doPost`. Không ghi đè các action khác.
2. Kiểm thử trên GAS thật với ít nhất GV, TTCM, BGH và người không có quyền. Xác nhận kho lưu trữ và quyền, kiểm tra chống gửi trùng.
3. Kiểm tra điều hướng ở điện thoại và máy tính; công cụ web của phiên này không mở được GitHub Pages nên **chưa chứng thực được giao diện sau triển khai**.
4. Hoàn thiện nguồn dữ liệu của B.1.1 và B.1.3; phải sử dụng thông tin chính thức, không lấy mã nguồn xếp TKB hoặc phân công ra đề thay thế bảng tra cứu.
5. Kết nối dữ liệu C.3 và hệ thống NQ52 độc lập sau khi được chủ nhiệm học thuật/người có thẩm quyền nghiệm thu.

**Trạng thái đợt 3:** ĐÃ COMMIT – KIỂM THỬ TĨNH ĐẠT – CHỜ TRIỂN KHAI API VÀ NGHIỆM THU THỰC TẾ. Không gắn PASS–LOCK.
