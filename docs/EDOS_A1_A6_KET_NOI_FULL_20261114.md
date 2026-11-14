# HVA–EDOS | Bàn giao kết nối Nhóm A.1–A.6 | 14/11/2026
**Trạng thái: ĐÃ GHÉP MÃ, CHƯA NGHIỆM THU VẬN HÀNH TRÊN GOOGLE APPS SCRIPT**

## Phạm vi đã xử lý
- **A.1.1**: Giữ giao diện báo cáo hiện hành; nối nộp **3 loại báo cáo có biểu mẫu** (nhiệm vụ, điều động, tập huấn/hội nghị) với mã `A.1.1` của Backend. Không kích hoạt “Báo cáo khác” vì mới là dự thảo.
- **A.1.2**: Báo cáo công tác chủ nhiệm giữ tuyến ký và nộp hiện hành. Sổ chủ nhiệm điện tử và hồ sơ hòa nhập chưa nằm trong bản tích hợp này.
- **A.1.3**: Kế hoạch HSG, danh sách/báo cáo đội tuyển sử dụng bộ tiếp nhận Nhóm A; sổ HSG lớp 12 và báo cáo DTHT giữ đường dẫn hiện hành.
- **A.1.4**: Tiếp nhận báo cáo thi/kiểm tra/ôn thi/phụ đạo qua bộ biểu mẫu.
- **A.2.1**: Phân công đề kiểm tra giữ nguyên; A.2.2–A.2.4 nối bộ tiếp nhận.
- **A.3–A.6**: 16 biểu mẫu nối bộ tiếp nhận, hồ sơ chỉ hiện thành công sau khi Backend trả mã.
- **Tổng:** 22 cấu hình biểu mẫu dùng chung + 1 nghiệp vụ báo cáo A.1.1 thêm mới = **23 mã trên Backend**. Nhóm A.1.2 và A.2.1 có tuyến khác, không thay thế.

## Mã nguồn
- `backend/HVA_EDOS_BACKEND_A1_A6_TICH_HOP_20261114.gs` — file tích hợp 1 tệp, giữ gateway cũ và module 23 quy tắc A, chưa chạy GAS thật.
- `backend/HVA_NVS_A22_MODULE.gs` — mô-đun riêng để đối chiếu. **KHÔNG cài lại module này** nếu đã dùng tệp tích hợp ở trên (trùng `const NVS_A22_RULES_`).
- `NVS_A22_Controller.js`, `NVS_A22_HopTiepNhan.html`, `NVS_TraCuu_CaNhan.html`, `A.1.1. NhiemVu_BaoCao.html`, `NghiepVu.html`: đã nối URL của trang chủ V5.
- `NVS_BieuMau_NghiepVu.html`: tăng phiên bản script để tránh cache.

## Tiêu chí an toàn
1. Bản Backend nguồn là **bản sao NVS hợp nhất để thử nghiệm**, KHÔNG xác thực là bản V5 production. Sao lưu dự án đang chạy và so sánh chức năng trước khi triển khai, **không ghi đè các chức năng V5 đã PASS**.
2. Nếu dùng file đầy đủ 1 tệp, không nạp đồng thời với tệp `HVA_NVS_A22_MODULE.gs` khác hoặc một gateway `doPost` trùng.
3. Dữ liệu A.1–A.6 được nộp vào `NVS_HO_SO_A22` trên CSDL nghiệp vụ `EDOS_NV_DB_ID`; có thể tự tạo bảng khi nộp lần đầu. Cần xác minh CSDL và quyền đối với dữ liệu kiểm tra/đề thi trước khi mở cho GV toàn trường.
4. Khung nộp trả `recordId` và nơi nhận BGH/TTCM, trạng thái **Đã tiếp nhận – Chưa phê duyệt**. **Chưa có thông báo đẩy tự động, duyệt/ký số hoàn chỉnh cho 23 hồ sơ này**.
5. Khi Backend trả `nvsA22Capabilities` đúng phiên và nơi nhận, menu mới đổi nhãn “Có thể nộp”. Nếu chưa, vẫn cho soạn nháp và xuất PDF/JSON ở biểu mẫu đã hỗ trợ.

## Kiểm tra đã thực hiện
- Cú pháp JavaScript file tích hợp đạt.
- 22/22 cấu hình biểu mẫu khớp quy tắc Backend; 23 quy tắc gồm A.1.1.
- Mã A.1.1 chấp nhận bộ dữ liệu hợp lệ, từ chối thiếu trường và danh mục trái phép.
- Chưa kiểm thử có ghi và đọc thực tế trên Google Sheets, ký/duyệt, quyền của các tài khoản thật, thông báo, trình duyệt thực và hồi quy hệ thống V5.

## Kịch bản nghiệm thu bắt buộc
1. GV thuộc tổ có TTCM gửi A.1.1 → nhận mã A22-..., xem ở hộp tiếp nhận và trong Tra cứu cá nhân.
2. GV khác không đọc được hồ sơ; TTCM/BGH được phân quyền mới đọc được.
3. Lặp lại cùng `clientRequestId` không phát sinh bản ghi trùng.
4. Gửi mẫu A.2.2 có đề kiểm tra/mã Drive đúng phân quyền; không công khai liên kết nhạy cảm.
5. Thử A.3–A.6 ít nhất một nghiệp vụ/mỗi cụm.
6. Chủ nhiệm, DTHT, phân công đề, lịch, nhân sự, nề nếp, bảo vệ trên V5 không bị hồi quy.
