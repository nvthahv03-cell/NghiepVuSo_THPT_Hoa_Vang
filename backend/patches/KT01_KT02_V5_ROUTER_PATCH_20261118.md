# HVA–EDOS V5 — Bản nối Router KT01/KT02 (18/11/2026)

**Chỉ tích hợp trên dự án Apps Script V5 đang chạy.** Giữ nguyên `00_CORE.gs`, `30_DH_HE_THONG.gs`, `31_DH_KT01_...`, `32_DH_KT02_...`, các module đã PASS. Không thêm `doGet` hoặc `doPost` thứ hai.

## 1. GET: chèn ngay trước nhánh mở rộng `hvaEdosExtraGet_` trong Router trung tâm

```js
if (['kt01List', 'kt01Get'].includes(action)) {
  return hvaKT01DispatchGet_(action, params);
}
if (['kt02Personnel', 'kt02List', 'kt02Get'].includes(action)) {
  return hvaKT02DispatchGet_(action, params);
}
```

## 2. POST: chèn trước nhánh mở rộng `hvaEdosExtraPost_`

```js
if (['kt01Save', 'kt01Archive'].includes(action)) {
  return hvaKT01DispatchPost_(action, payload);
}
if (action === 'kt02Save') {
  return hvaKT02DispatchPost_(action, payload);
}
```

## 3. Kiểm tra bắt buộc trước triển khai

- **Cùng Backend với `index.html`:** KT01/KT02 phải được deploy trong dự án chứa action `login` tạo phiên. Không dùng URL Backend Cuộc họp riêng cho KT02.
- **Nguồn nhân sự:** `nvsPCDKReadPeople_()` phải đọc Sheet nhân sự chuẩn `1_cGuyrJvOrBD4gU3U5eRIrdNbd7qDdq3QYoTrvdf-L4`, tab có header dòng 6; không thay cấu hình của các module DTHT/CN đang PASS.
- **Phiên:** `nvsActor_(p)` phải nhận cùng `sessionToken` mà `hvaXuLyDangNhap_` cấp tại chính **cùng Apps Script deployment**. Không bỏ kiểm tra phiên, không chấp nhận username do client gửi là bằng chứng xác thực.
- **Phân quyền:** BGH xem được tổ, TTCM chỉ xem tổ của mình; GV không được lấy danh sách nhân sự bằng `kt02Personnel`.
- **Bảo vệ dữ liệu:** JSON chỉ trả username, họ tên, tổ, môn dạy, chức danh; không trả CCCD, điện thoại, mật khẩu, hoặc dữ liệu thô của Sheet.
- **Không đánh dấu PASS** trước khi thử thật tài khoản BGH, TTCM, GV, token hết hạn, kiểm tra Sheet và việc lưu/đọc lại.

## 4. Chặn lỗi hiện có trong module 32

`hvaKT02RoutePost_` hiện xử lý mọi action như lưu bản nháp, do đó Router **chỉ** chuyển action `kt02Save` vào đó. Không định tuyến các action ký/phát hành tới hàm lưu nháp.

`hvaKT02Roster_` chỉ nên trả các tổ chuyên môn thực tế (loại 'Ban giám hiệu' và bộ phận hành chính theo danh mục đã xác nhận); BGH phải chọn tổ, TTCM bị giới hạn tổ trong Backend.

## 5. Trạng thái

- GitHub `PhanCong_DeKiemTra.html` đã chuyển tới `kt02Personnel` ở địa chỉ Backend đăng nhập trang chủ.
- Chưa kết nối KT01/C4/Trung tâm phát hành trên Backend và chưa triển khai Apps Script.
- Mã này là **hướng dẫn chèn Router**, không tự động cập nhật dự án Apps Script.
