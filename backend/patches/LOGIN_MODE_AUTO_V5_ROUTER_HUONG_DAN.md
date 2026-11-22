# EDOS V5 – Tự nhận diện hình thức mật khẩu theo tên đăng nhập

## Chức năng

- Nhập tên đăng nhập → EDOS gọi POST \`getLoginPasswordMode\` trên **đúng Web App V5**.
- Backend kiểm tra **có bản ghi mật khẩu đã đổi** trong \`NVS_AUTH_CREDENTIALS\` qua \`nvsPwdFind_\`.
- Nếu chưa đổi: hiện ô **HVA@** cố định + 4 chữ số. Nếu đã đổi: hiện **mật khẩu cá nhân**, không cố định tiền tố.
- Không gửi mật khẩu để tra cứu, không trả mật khẩu/hash/salt hoặc thông tin hồ sơ cá nhân.
- Nếu Backend chưa triển khai, không được đoán trạng thái là đã đổi: màn hình có lựa chọn dự phòng thủ công; khi triển khai thành công, không còn bắt chọn.

## Bắt buộc tích hợp Apps Script V5

1. Tạo **module 38** \`38_NV_LOGIN_PASSWORD_MODE.gs\` trong dự án Apps Script V5 đang chạy, dán nguyên nội dung \`backend/patches/38_NV_LOGIN_PASSWORD_MODE.gs\`.
2. Trong hàm \`doPost(e)\` của **01_ROUTER.gs**, trước nhánh \`if (action === "login")\`, thêm:

\`\`\`javascript
// Nhận diện loại mật khẩu, không tạo phiên, không trả thông tin nhân sự.
if (action === 'getLoginPasswordMode') {
  return hvaLoginPasswordMode_(payload);
}
\`\`\`

3. Lưu → Deploy → Manage deployments → Edit → New version → Deploy, giữ URL Web App V5 đang dùng.

**Không thay** các hàm \`nvsPwdFind_\`, \`nvsPwdCheck_\`, \`hvaXuLyDangNhap_\` hoặc tuyến đăng nhập đang PASS trong bước này.

## Nghiệm thu

- Tài khoản chưa đổi mật khẩu: nhập username → hiện \`HVA@\` cố định + ô 4 chữ số.
- Tài khoản đã đổi: nhập username → chỉ còn ô mật khẩu cá nhân.
- Đổi username ngay khi đang tải: kết quả tra cứu cũ không ghi đè hình thức của tài khoản mới.
- Endpoint lỗi/chưa triển khai: vẫn có lựa chọn dự phòng, không khóa người dùng.
- Kiểm thử đăng nhập thật với tài khoản được phép. Tự nhận diện đúng **không tự sửa** trường hợp CSDL Nhân sự đang lưu mật khẩu mặc định không phù hợp; trường hợp đó cần kiểm tra riêng bản vá \`AUTH_FIRST_LOGIN_00_CORE_PATCH_20261122.md\`.

**An toàn:** Endpoint này trả một bit trạng thái mật khẩu, không trả tài khoản có tồn tại hay không; nên kết hợp các biện pháp chống dò tìm tại lớp hạ tầng, không công khai trạng thái này trong URL hay log.