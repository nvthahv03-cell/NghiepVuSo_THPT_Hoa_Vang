# Quy trình cập nhật HVA–EDOS PWA

## Đã kiểm định qua mã nguồn – 13/11/2026
- `manifest.json` dùng `./index.html` làm `start_url` và `./` làm `scope`.
- `sw.js` chỉ đăng ký `install/activate`, không có `fetch` hay lưu trữ Cache Storage.
- `index.html` không chứa lời gọi `navigator.serviceWorker.register` trong tệp được rà soát.
- Cơ chế cập nhật V1 gắn vào `index.html`, `NghiepVu.html`, `DieuHanh.html`, `NVS_QuanTri.html`.
- V1 không xóa phiên đăng nhập, localStorage, sessionStorage hay dữ liệu người dùng; không tự reload khi nhập liệu.
- Chưa nghiệm thu tải thực tế trên Chrome Android/PWA đã cài, chưa áp dụng trực tiếp trên các trang chức năng con.

## Quy trình phát hành phiên bản tiếp theo
1. Kiểm thử STAGING, nhất là lịch cá nhân, đăng nhập, TTPhatHanh và nộp Nghiệp vụ.
2. Khi phát hành, tăng `version` trong `HVA_EDOS_VERSION.json` (ví dụ `2026.11.13.2`), đồng thời thay `data-build` và truy vấn `?v=` của script updater tại các trang đã tích hợp.
3. Truy cập trang chủ, Nghiệp vụ, Điều hành và Quản trị trên Chrome điện thoại và PWA; xác nhận có cảnh báo cập nhật trên bản cũ, người dùng bấm cập nhật đúng phiên bản mới, không mất phiên đang sử dụng.
4. Kiểm tra chức năng nhập liệu trên trang có thay đổi; kiểm tra không có tải lại tự động khi đang điền biểu mẫu.
5. Không thay đổi `manifest.id`/`start_url`/`scope` bừa bãi vì có thể làm thành ứng dụng thứ hai.
6. Trước khi triển khai cho mọi trang con, rà soát mã JavaScript và liên kết trên từng tệp HTML; không chèn vào các tệp đã tích hợp một cách mù quáng.

## Hạn chế và hướng mở rộng
- Các bản HTML cũ chưa có updater sẽ cần **một lần tải lại hoặc mở URL kèm tham số phiên bản** để nhận mã cập nhật.
- Service Worker hiện tại không thể bảo đảm làm mới trang nếu trang khác bị HTTP cache giữ; cần kiểm tra thực địa với trình duyệt.
- Bộ quản lý phiên bản này chỉ thông báo và điều hướng cập nhật, không phải cơ chế tự phát hành GitHub Pages.
- Để cập nhật toàn bộ trang con, triển khai thư viện updater trên các module chủ lực sau khi kiểm thử thực tế. Không khai báo PASS toàn hệ thống khi mới kiểm tra tĩnh.
