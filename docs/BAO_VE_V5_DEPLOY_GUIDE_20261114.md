# Bàn giao tích hợp HVA–EDOS V5: Nhật ký Bảo vệ
Ngày 14/11/2026 · Trạng thái: **ĐÃ CODE STAGING – CHƯA DEPLOY / CHƯA PASS NGHIỆM THU**

## Đã tạo
- `backend/HVA_NVS_BAO_VE_V1_STAGING.gs`: 6 tab dữ liệu trong CSDL nghiệp vụ, tạo và tra cứu hồ sơ, xác nhận BGH / nhận ca, truy vết, PDF và lịch tác vụ.
- `HVA_NVS_BaoVe_UI.js`: 4 biểu mẫu nhập liệu tương ứng nhật ký, ra/vào, bàn giao, tài sản; hiển thị trạng thái kết nối, ghi dữ liệu sau xác thực và tra cứu.
- `NVS_NhatKyBaoVe.html`: màn hình nhập liệu kết nối script ngoài, giữ 12 nhóm mô tả nghiệp vụ.
- BGH chỉ xác nhận hồ sơ; nhận ca phải do tài khoản được giao nhận xác nhận, không tự xác nhận hai bên.
- Lịch gửi PDF: chỉ trong cửa sổ **06:15 đến trước 06:30**, chu kỳ hồ sơ **06:00 hôm trước đến trước 06:00 hôm nay**; bắt buộc gửi ngay sự việc khẩn cấp theo kênh nhà trường.

## Việc quản trị GAS cần làm (không tự triển khai khi chưa có bản sao lưu và quyền truy cập)
1. Đối chiếu **đúng V5 hiện chạy** (file thầy cung cấp đề dòng đầu ghi bản sao STAGING NVS hợp nhất, không thể kết luận đó là production V5). Sao lưu GAS + Sheets.
2. Thêm mã module STAGING vào bản sao thử nghiệm của dự án V5. **Không thêm doGet/doPost, CONFIG, CommonDb hoặc PersonnelService mới.**
3. Trong **doPost hiện có**, trước dòng báo action POST không hợp lệ:
   ```js
   if (/^hvaBv/.test(action)) return hvaBvRoute_(action, payload);
   ```
   Không route qua GET. Xác thực bằng `nvsActor_`, bắt buộc hàm này trỏ đúng phiên đăng nhập của V5 thực tế (nếu khác phải làm adapter kiểm chứng token phía server).
4. Script Properties: `EDOS_NV_DB_ID` = ID CSDL nghiệp vụ đã xác minh; `EDOS_BV_USERS` = 3 **username thật** cách nhau dấu phẩy; `EDOS_BV_BGH_USERS` = username BGH; `EDOS_BV_BGH_EMAILS` = email BGH đã xác nhận; `EDOS_BV_REPORT_FOLDER_ID` = thư mục Drive lưu PDF. Không gửi mật khẩu hay secret cho ChatGPT.
5. Trên bản sao STAGING có backup, chạy thủ công `hvaBvSetupStaging_` 1 lần để tạo/kiểm tra 6 tab. Không tự động tạo tab khi gọi frontend.
6. Test 3 tài khoản Bảo vệ, tài khoản BGH, giao ca độc lập, tạo lại request trùng, ghi/đọc, không được phép truy cập, email thử nghiệm đến địa chỉ được phép.
7. Chỉ sau nghiệm thu, chạy `hvaBvInstallDailyTriggerStaging_` **trên đúng phiên bản production đã duyệt**. Trigger 5 phút/lần có độ trễ nền tảng, chỉ thực hiện khi rơi vào cửa sổ; giám sát báo cáo chưa gửi, không cam kết phút gửi nếu Google Apps Script chậm.
8. Kênh gửi hiện đã mã hóa: **MailApp gửi BGH và lưu Drive**. Tuyến đưa thông báo vào **Trung tâm Thông báo EDOS** cần đối chiếu API phát hành hiện hữu trước khi tích hợp, chưa PASS.

## Điều kiện nghiệm thu
- CSDL Nề nếp vẫn sử dụng nguyên bảng hiện hành; không tạo đè.
- 3 nhân viên Bảo vệ (Phạm Đức sáng 06–12; Phạm Ba chiều 12–18; Phạm Tấn Tuấn tối 18–06 hôm sau). Phải đối chiếu đúng username Phạm Đức trước khi cấp quyền.
- BGH xác nhận nghiệp vụ; bàn giao do người nhận ca xác nhận; không tự ghi sĩ số lớp.
- Khi chậm/thiếu ca, PDF đánh dấu thiếu dữ liệu; khi sự cố nghiêm trọng phải báo ngay.
- Test theo đúng ngày giờ Việt Nam, phép phân quyền, email thật, file PDF thật, Drive thật và không gửi lặp.
- Module hiện chỉ là bản STAGING, **không được gắn nhãn vận hành thật/PASS**.
