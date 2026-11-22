# EDOS V5 – Tra cứu nhân sự trong Cá nhân → Tra cứu nhanh

## Đã triển khai trên GitHub
- \`index.html\`: liên kết **Tra cứu nhân sự** trong **Cá nhân → Tra cứu nhanh**, giữ nguyên **Việc của tôi** ở bốn nút phía trên.
- \`TraCuuNhanSu.html\`: màn hình tìm nhân sự, lọc nhóm, danh sách từ cùng \`HVA_Personnel.js\` với Cuộc họp, tra cứu tên/tổ/môn/chức vụ/kiêm nhiệm/GVCN, điện thoại có liên kết \`tel:\`.
- Không lưu dữ liệu danh bạ trong localStorage; luôn sử dụng phiên xác thực EDOS hiện hành.
- Nếu trường thông tin chưa có trong nguồn Cuộc họp, hiện "Chưa cập nhật", không tự điền giả.

## Vì sao cần thêm Backend 39?
Backend \`getNVSMeetingPersonnel\` đang chạy của Cuộc họp chỉ trả \`username, hoTen, chucVu, tenTo\` và \`lopChuNhiem\` theo nhóm. **Không trả môn dạy, ngày sinh, điện thoại**. Các trường này cần tuyến đọc có xác thực, giới hạn dữ liệu.

## Tích hợp module 39 vào Apps Script V5 (chưa thể triển khai tự động từ GitHub)

1. Tạo tệp \`39_NV_TRA_CUU_NHAN_SU.gs\` trong dự án Apps Script V5, dán **nguyên nội dung** từ \`backend/patches/39_NV_TRA_CUU_NHAN_SU.gs\`.
2. Trong **doGet(e)** của \`01_ROUTER.gs\`, sau khi đã có \`action\` và \`params\`, đặt **trước** tuyến bắt mặc định:

\`\`\`javascript
if (action === 'getPersonnelDirectory') {
  return hvaPersonnelDirectoryGet_(params);
}
\`\`\`

3. Lưu → Deploy → Manage deployments → Edit → **New version** → Deploy (giữ URL Web App V5 hiện có).

**Không thêm vào doPost. Không sửa \`00_CORE.gs\`, \`30_DH_HE_THONG.gs\` hoặc hàm Cuộc họp đang PASS.**

## Kiểm thử
- Đăng nhập tài khoản GV hợp lệ → Cá nhân → Tra cứu nhanh → Tra cứu nhân sự.
- Tìm theo tên; kiểm tra tổ, chức vụ, môn dạy từ cột 14, kiêm nhiệm từ các nhóm đang phân công (chỉ vai trò có nguồn).
- Kiểm tra trường ngày sinh và số điện thoại: Backend 39 dò các tên cột tương ứng ở hàng tiêu đề 6; cột nào không xác định thì bỏ trống và hiện "Chưa cập nhật".
- Nếu có điện thoại hợp lệ, nhấn **Gọi ngay** trên điện thoại để gọi số đã công bố trong danh bạ nội bộ.
- Đối chiếu bằng 2 tài khoản giáo viên có quyền; khi hết phiên phải bị từ chối.
- Không để các thông tin cá nhân này xuất hiện ở trang công khai hoặc tài khoản chưa đăng nhập.
- Hiện chưa nghiệm thu dữ liệu thực tế, cần xác minh quyền được phép công khai nội bộ ngày sinh/số điện thoại theo quy định nhà trường.

**Tuyến GET JSONP được xây theo mẫu đã dùng trong Cuộc họp.** Chỉ trả trường danh bạ được duyệt; không gửi CCCD, mật khẩu, địa chỉ hoặc dữ liệu lương. Việc hạn chế chia sẻ thông tin cá nhân và phân quyền thuộc trách nhiệm hệ thống trước triển khai chính thức.