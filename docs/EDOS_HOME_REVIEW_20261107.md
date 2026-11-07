# RÀ SOÁT TRANG CHỦ HVA–EDOS — 07/11/2026

## Phạm vi chỉ đạo
1. Trang chủ: nhiều lớp CSS/JavaScript tích lũy, cần giảm xung đột và nâng khả năng bảo trì.
2. Cụm bốn nút dưới: chuẩn hóa hiển thị và kiểm tra tính ổn định mobile.

**Giới hạn bắt buộc:** Không sửa login, Backend, phân quyền, lưu dữ liệu, action điều hướng, các module nghiệp vụ đã PASS. Không tự công bố nghiệm thu thực tế.

## Mốc trước sửa và kết quả
- Tệp: `index.html` trên repository `nvthahv03-cell/NghiepVuSo_THPT_Hoa_Vang`.
- Mã trước sửa: 397.147 ký tự; 71 khối `<style>`; 27 khối `<script>`.
- Mã sau sửa: 389.105 ký tự; 68 khối `<style>`; 26 khối `<script>`.
- Giảm **8.042 ký tự**; không thay đổi markup của `nav.nvs-premium-nav` hay script nghiệp vụ.
- Chỉ loại bỏ các style hoàn toàn dành cho giao diện chân trang, đã bị các lớp cập nhật thay thế:
  `edos-v37-footer-round-3d`,
  `hva-footer-icon-glyph-color-fix-20261105`,
  `hva-footer-four-icons-unified`.
- Loại bỏ `edos-v36-footer-bounce-js` (chỉ gắn hiệu ứng nhún trang trí).
- Giữ lại duy nhất lớp giao diện mới nhất `hva-footer-four-clean-20261106` làm lớp chuẩn hóa cuối, không thay event handler.
- Không gỡ các lớp cũ khác đang chứa khai báo dùng chung cho những thành phần khác.

## Kiểm thử đã thực hiện
- Kiểm tra tự động bằng `tests/verify-edos-home-footer.cjs`: **12/12 PASS**.
- Giữ đúng thứ tự `sdb`, `help`, `connect`, `chat`.
- Giữ ID `hvaDigitalUtilitiesToggle` và `hvaChatToggle`.
- Giữ đường dẫn Sổ đầu bài, Hướng dẫn sử dụng, CSS trạng thái trực tuyến.
- Đối chiếu văn bản nguồn trước/sau: phần thay đổi chỉ thuộc 3 style và 1 script trang trí.
- Giữ quy tắc responsive của lớp chân trang cuối: 4 cột và kích thước icon co giãn trên màn hình hẹp.

## Giới hạn kiểm thử và tồn tại
- **Chưa chụp/kiểm tra trình duyệt thực** trên Android, iOS, desktop ở 320/375/414/768/1280 px; chưa xác minh GitHub Pages phát hành phiên bản mới trong cache trình duyệt.
- **Chưa kiểm thử thao tác bấm thật** đối với Sổ đầu bài, Hướng dẫn, Tiện ích, Chat trên phiên đăng nhập của thầy.
- Trang chủ vẫn có 68 khối CSS và 26 khối script; còn **18 khối CSS** chứa selector liên quan `nvs-premium-nav` (một số chứa thành phần khác).
- Phát hiện một cặp `<style id="edos-v32-role-exclusive">` giống hệt nhau. **Chưa tự ý xóa** vì cần kiểm tra thứ tự cascade và khả năng ghi đè các quy tắc nằm giữa.
- Đây là giai đoạn **dọn chồng lấn có kiểm soát**, chưa phải tái cấu trúc hoàn toàn trang chủ.

## Đề nghị nghiệm thu 2 món
1. Trên điện thoại, tải lại trang `https://nvthahv03-cell.github.io/NghiepVuSo_THPT_Hoa_Vang/` (nếu cần xóa cache) và kiểm tra hình dáng cả bốn nút: cùng kích thước icon, không còn nút đầu nổi riêng, nhãn đọc được, không tràn màn hình.
2. Nhấn thử từng nút bằng tài khoản được phép: Sổ đầu bài -> trang sổ, Hướng dẫn -> trang hướng dẫn, Tiện ích -> bảng tiện ích, HVA Chat -> khung trò chuyện.
3. Kiểm tra trang chủ ở desktop và điện thoại: đăng nhập, chấm xanh trực tuyến, menu/Trang chủ, trợ lý và các nút chức năng ở trên còn hoạt động.
4. Nếu xuất hiện lỗi: quay về commit trước sửa của `index.html`; không khôi phục các tệp Backend hoặc nghiệp vụ khác.

**Chốt:** PASS kiểm tra cấu trúc tĩnh; **CHỜ NGHIỆM THU HIỂN THỊ VÀ THAO TÁC THỰC TẾ**.
