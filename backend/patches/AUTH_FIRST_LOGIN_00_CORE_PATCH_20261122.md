# Sửa đăng nhập lần đầu: mật khẩu mặc định HVA@xxxx

**Phạm vi:** đúng một hàm `nvsPwdCheck_` trong `00_CORE.gs` của Backend Apps Script V5. Không tạo thêm file `.gs` chứa hàm cùng tên (Apps Script dùng namespace chung). Không sửa giao diện hoặc phát hành.

## Nguyên nhân được kiểm tra từ bản Core người dùng cung cấp

Giao diện `index.html` gửi `HVA@xxxx` cho mật khẩu gồm 4 chữ số hoặc `HVA@xxxx` nhập nguyên dạng. Trong khi đó Core cũ so sánh `candidate` nguyên dạng với `person.matKhau`, không chuẩn hóa khi Sheet nhân sự lưu đúng 4 chữ số `xxxx`. Lỗi chỉ xảy ra theo giả thiết này; nếu bản ghi nhân sự không khớp hay tài khoản đã có mật khẩu băm, cần kiểm tra nguyên nhân khác.

## Thay duy nhất hàm nvsPwdCheck_ trong 00_CORE.gs bằng

```javascript
function nvsPwdCheck_(username, provided, legacy) {
  const match = nvsPwdFind_(username).record;
  if (match) {
    if (!match.salt || !match.hash || !Number.isInteger(match.rounds) ||
        match.rounds < 12000 || match.rounds > 100000) {
      throw new Error('Bản ghi mật khẩu không hợp lệ.');
    }
    return {
      ok: nvsPwdEqual_(nvsPwdPBKDF2_(provided, match.salt, match.rounds), match.hash),
      changed: true,
      version: match.version
    };
  }
  // Chỉ chuẩn hóa mã 4 số của tài khoản chưa đổi mật khẩu.
  // Không chấp nhận mật khẩu không khớp, không thay đổi nhánh mật khẩu băm.
  const candidate = /^\d{4}$/.test(String(provided || ''))
    ? 'HVA@' + String(provided)
    : String(provided || '');
  const stored = String(legacy || '').trim();
  const expected = /^\d{4}$/.test(stored) ? 'HVA@' + stored : stored;
  return {ok: !!stored && nvsPwdEqual_(candidate, expected),
          changed: false, version: '0'};
}
```

## Kiểm thử trước khi triển khai

| Mật khẩu người dùng | Cột P của Sheet (giả định) | Kết quả ở nhánh chưa đổi |
|---|---|---|
| `HVA@1234` | `1234` | Đúng |
| `1234` | `1234` | Đúng |
| `HVA@1234` | `HVA@1234` | Đúng |
| `HVA@9999` | `1234` | Sai |
| `HVA@1234` | `5678` | Sai |

Tài khoản đã đổi mật khẩu (có bản ghi `NVS_AUTH_CREDENTIALS`) vẫn chỉ kiểm tra PBKDF2 theo quy định; mật khẩu mặc định không được dùng thay thế.

## Triển khai an toàn

Sao lưu `00_CORE.gs` đang chạy. Chỉ thay hàm `nvsPwdCheck_` hiện có, không thêm hàm thứ hai. Save → Deploy → Manage deployments → Edit → New version → Deploy. Kiểm thử bằng tài khoản giáo viên được cho phép; không chia sẻ mật khẩu hay token. Nếu còn sai, cần kiểm tra cột O/P thực tế, tình trạng bản ghi `NVS_AUTH_CREDENTIALS`, và mã người dùng được tra cứu trước khi thử sửa thêm.

**Lưu ý:** GitHub không tự đồng bộ với Apps Script. Bản vá này chưa có hiệu lực nếu chưa sửa `00_CORE.gs` trong dự án GAS V5 và triển khai phiên bản mới.
