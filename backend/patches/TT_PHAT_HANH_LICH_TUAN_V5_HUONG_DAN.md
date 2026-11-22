# EDOS V5 – Kết nối phát hành Lịch tuần vào Backend V5

## Đã xác minh từ ba tệp Backend người dùng cung cấp ngày 22/11/2026

- \`01_ROUTER.gs\` đã xử lý \`ltSaveDraft\`, \`ltApprove\`, \`ltStagePdf\` và \`ltPublish\`.
- \`30_DH_HE_THONG.gs\` hiện chặn \`LichTuanEDOS\` trong \`nvsPublishGeneralV19_\`, chỉ nhận \`ThongBao\` và \`GiaoViec\`. **Không sửa hàm này**, để bảo vệ các nghiệp vụ đã PASS.
- Phiên đăng nhập xác thực bằng \`nvsActor_\` và \`CacheService.getScriptCache()\`. TTPH trước đây gửi sang Web App khác, dẫn đến nguy cơ token không được nhận diện giữa các dự án Apps Script.

## Thực hiện trong dự án Apps Script V5 (chưa được triển khai tự động)

1. Thêm file mới \`36_DH_TTPH_LICH_TUAN.gs\` với nội dung của \`backend/patches/36_DH_TTPH_LICH_TUAN.gs\`.
2. Tại **doPost(e)** trong \`01_ROUTER.gs\`, ngay trước khối **M. ĐIỀU HÀNH TÍCH HỢP**, thêm:

\`\`\`javascript
// Chỉ phát hành thông báo Lịch tuần qua cùng Web App V5.
if (action === 'ltPublishNotification') {
  return hvaLtNotificationPost_(payload);
}
\`\`\`

3. Giữ nguyên toàn bộ các nhánh hiện hành, đặc biệt \`publishDocument\`/\`publishDocuments\`, \`ltPublish\` và \`publishMeeting\`.
4. Triển khai Web App V5 bằng **New version**. Nếu tạo URL triển khai mới, cần cập nhật URL V5 tương ứng trong \`TTPhatHanh.html\`.
5. Kiểm tra trạng thái Lịch tuần đã công bố trên EDOS và bảng \`DB_02_PhatHanh\` + \`DB_04_ThongBao\` trước khi thử gửi lại. Thử với **một tài khoản GV** và kiểm tra đọc nội dung/PDF.

## Điều kiện bảo vệ

- BGH mới được gửi; tất cả người nhận phải là tài khoản thuộc CSDL nhân sự.
- PDF phải tồn tại trong Google Drive; nếu có property \`EDOS_LICH_TUAN_FOLDER_ID\` thì phải thuộc đúng thư mục đó.
- Không ghi thông báo cho các tài khoản chưa chọn.
- Bản ghi lịch trùng \`lichId + driveFileId\` chỉ được tiếp tục phát hành với **cùng** danh sách người nhận; nếu cần đổi, phải tạo phiên bản điều chỉnh.
- Chỉ báo thành công sau khi đối chiếu đủ thông báo.
- Chưa triển khai trực tiếp hoặc nghiệm thu trên Apps Script. Pull Request được giữ ở trạng thái nháp, không đẩy giao diện mới lên \`main\` trước khi Backend V5 sẵn sàng.
