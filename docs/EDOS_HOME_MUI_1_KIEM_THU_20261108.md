# BIÊN BẢN MŨI SỐ 1 – TRANG CHỦ HVA–EDOS
**Ngày:** 08/11/2026  
**Phạm vi:** Bốn nút dưới và kiểm thử cấu trúc toàn trang chủ.

## A. Thay đổi mã nguồn thực tế
- Commit `3fe0db5ca84105f90a622b5ea193d59467654a54`: chuẩn hóa trạng thái bấm/keyboard focus; tối ưu thanh bốn nút khi rộng 320–360 px; hỗ trợ reduced motion.
- Xóa đúng một khối CSS `edos-v32-role-exclusive` bị trùng nguyên văn trong `index.html` (giữ bản còn lại).
- HTML bốn nút điều hướng, tên nút, ID và **toàn bộ script nghiệp vụ không đổi**.
- Giữ nguyên các phân hệ và quyền truy cập hiện hành; không can thiệp Backend.

## B. Kết quả kiểm tra tự động
- `tests/verify-edos-home-footer.cjs`: **12/12 PASS** (cấu trúc chân trang).
- `tests/verify-edos-home-smoke.cjs`: **27/27 PASS** (DOCTYPE, ID, bốn cổng, bốn tiện ích trên, bốn nút dưới, overlay, điều hướng, responsive CSS, CSS ID, login/logout hooks).
- **22/22** đoạn JavaScript nội bộ trong `index.html` đạt kiểm tra cú pháp; 4 script external không thể được đánh giá cú pháp bằng kiểm tra này.
- Đối chiếu GitHub: các đường dẫn đích `SoDauBai.html`, `HuongDanSuDung.html`, `TienIchSo.html`, `DieuHanh.html`, `NghiepVu.html`, `KhoHocLieuSo.html` và `VanBan_QuyDinh.html` đều tồn tại.
- Sau cập nhật: 67 khối style, 26 script, không có ID HTML trùng phát hiện qua kiểm tra tĩnh.

## C. Phạm vi chưa thể xác nhận
- Chưa kiểm thử browser thật ở 320/360/375/414/768/1280px; chưa có screenshot kiểm chứng sau khi deploy GitHub Pages.
- Chưa test nhấn thực tế với tài khoản người dùng, chưa xác minh backend chat và quyền các phân hệ.
- Truy cập GitHub Pages bằng công cụ kiểm tra web không thành công; không xác nhận được cache, deploy hay Console của trang live.
- Kiểm tra tĩnh **không phải** kiểm thử tích hợp hoặc bảo mật, không thay thế nghiệm thu.

## D. Quy trình nghiệm thu cùng thầy
1. Trên điện thoại và desktop, tải mới trang EDOS; kiểm tra thanh bốn nút đều nhau, không nút đầu khác cỡ, không tràn ngang; nhãn dễ đọc.
2. Bấm lần lượt: Sổ đầu bài → `SoDauBai.html`; Hướng dẫn → `HuongDanSuDung.html`; Tiện ích số → overlay `TienIchSo.html`; HVA Chat → bảng chat.
3. Đóng overlay Tiện ích và Chat, thử phím Escape trên máy tính.
4. Kiểm tra 4 tiện ích phía trên, 4 cổng chính, Menu, Trang chủ, Đăng xuất, chấm Trực tuyến và trạng thái đăng nhập.
5. Nếu xuất hiện lỗi, ghi vị trí, thiết bị, ảnh màn hình, thời điểm để sửa đúng phạm vi.

**Kết luận:** Đạt kiểm tra tĩnh (12/12, 27/27, 22/22), **CHỜ NGHIỆM THU UI VÀ THAO TÁC THẬT**; chưa gắn PASS–LOCK chính thức.
