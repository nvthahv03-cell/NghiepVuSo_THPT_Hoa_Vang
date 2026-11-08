# HVA–EDOS | Rà soát Quản trị và Tra cứu tổng hợp (08/11/2026)

## Phạm vi đã kiểm tra mã nguồn
- `DieuHanh.html`: trang Điều hành – Quản trị, liên kết vào không gian Quản trị; thông báo quyền truy cập.
- `QuanTri.html`: có Trung tâm tra cứu tổng hợp, mục QT5.4.
- `NVS_QuanTri_TraCuu.html`: hai chế độ tra cứu theo giáo viên và nghiệp vụ; lọc DTHT, KTNB, hồ sơ nhóm A, giao việc.
- `HVA_Admin_Lookup_Controller.js`: các lời gọi Backend và kiểm soát luồng tìm kiếm/xuất file.
- `HVA_Admin_Lookup_Export.js`: kết xuất XLSX/CSV, hỗ trợ in PDF.
- `NVS_ThongKeBaoCao.html`, `NVS_NhanSuTaiKhoan.html`: trang nghiệp vụ hiện hữu.

## Kết quả xác minh
1. **Có giao diện** tra cứu theo giáo viên, theo nghiệp vụ và các nút xuất XLSX/CSV/PDF. Đây là xác minh *mã nguồn giao diện*, không phải xác minh Backend vận hành thành công.
2. Bộ điều khiển gọi 4 action: `nvsAdminLookupCapabilities`, `nvsAdminLookupPeople`, `nvsAdminLookupSearch`, `nvsAdminLookupExport`. Cần kiểm thử với Backend đang triển khai trước khi tuyên bố PASS.
3. Controller chỉ cho tra cứu khi Backend trả `supported:true`, `version:'QT-LOOKUP-1'`, `auditRequired:true`. Nút xuất yêu cầu dữ liệu xác thực, có nguồn `CONNECTED` và không bị cắt cụt.
4. Giao diện tuyên bố **KTNB chưa có kho hồ sơ tập trung được xác minh**; vì vậy không được coi kết quả không tìm thấy là bằng chứng giáo viên chưa thực hiện.
5. Đường hiển thị quyền ở `DieuHanh.html` ghi sai một số lượng tổ chuyên môn cố định. Bản sửa đề xuất loại bỏ con số cứng, giữ yêu cầu phân quyền.

## Danh mục cần hoàn thành để nghiệm thu
- [ ] Kiểm tra Backend có hỗ trợ đủ 4 action, định dạng kết quả, giới hạn truy vấn và xử lý lỗi.
- [ ] Kiểm tra quyền BGH với token hợp lệ tại Backend; không tin phân quyền ở trình duyệt.
- [ ] Thử tìm một giáo viên, chọn hồ sơ DTHT, so khớp với bản gốc và ghi thời điểm nguồn.
- [ ] Thử tra cứu theo nghiệp vụ DTHT toàn trường và lọc tổ/năm học.
- [ ] Kiểm thử KTNB: nếu chưa có nguồn, hiển thị trạng thái `NOT_CONNECTED` (không trình bày là `0 hồ sơ`).
- [ ] Kiểm tra xuất XLSX/CSV/PDF khớp số bản ghi, truy vấn và mục đích; xem nhật ký tra cứu/xuất trên máy chủ.
- [ ] Kiểm tra dữ liệu cá nhân không bị lộ cho vai trò ngoài thẩm quyền.
- [ ] Kiểm tra bảo vệ trước ký tự CSV có thể thực thi công thức khi mở bằng Excel.
- [ ] Thử nghiệm trình duyệt desktop và mobile; xác nhận thao tác in PDF và đường dẫn trở về.
- [ ] Rà soát 22 biểu mẫu nhóm A theo danh mục bản gốc trước khi gắn nhãn PASS.

## Nguyên tắc thay đổi
- Không động vào mô-đun PASS–LOCK (A1.10, A7.2).
- Không sửa dữ liệu học sinh/giáo viên, tài khoản hay Backend khi chưa có yêu cầu cụ thể và kiểm thử.
- Mọi thay đổi trước nghiệm thu thực hiện ở nhánh độc lập, chưa tự động đưa vào trang chính.

**Trạng thái: ĐÃ RÀ SOÁT MÃ NGUỒN; CHƯA XÁC NHẬN BACKEND/SSO/EXPORT END-TO-END PASS.**
