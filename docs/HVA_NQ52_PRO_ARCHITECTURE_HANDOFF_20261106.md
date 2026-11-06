# HVA NQ52 PRO – BIÊN BẢN TIẾP NHẬN VÀ THẨM ĐỊNH KIẾN TRÚC

**Ngày:** 06/11/2026  
**Đầu mối:** Kim Quy Pro (kiến trúc HVA–EDOS), phối hợp Kim Quy 3 (nghiệp vụ NQ52)  
**Đầu vào:** Tệp bàn giao `HVA_NQ52_GIAO_DIEN_HOAN_CHINH(1).html` do Kim Quy 3 chuyển.  
**Kết luận hiện tại:** **TIẾP NHẬN BẢN MÔ PHỎNG – CHƯA ĐỦ ĐIỀU KIỆN TÍCH HỢP VẬN HÀNH.**

## 1. Nội dung đã xác nhận trực tiếp từ mã nguồn

- HTML độc lập (CSS/JS nhúng cùng trang), có 10 mục: Tổng quan; Kế hoạch tháng; Giao nhiệm vụ; Thực hiện công việc; Nghiệm thu sản phẩm; Tự đánh giá; Thẩm định, xếp loại; Kết quả, kiến nghị; Thống kê, hồ sơ; Quy định, hướng dẫn.
- Mô phỏng ba nhóm VCQL/GV/NV; danh sách nhân sự mẫu, trong đó có 01 HT và 02 PHT mẫu; có thêm vai trò TTCM, bộ phận tham mưu và cấp trên.
- Quản lý kế hoạch, nhiệm vụ theo sản phẩm, tiến độ, minh chứng; tự đánh giá; thẩm định; kết quả và kiến nghị bằng các biến JS trong phiên.
- Có cơ chế kiểm soát chọn người khác khi xem vai trò, nhưng đây chỉ là ràng buộc trong frontend. Người sử dụng có thể đổi vai trò ngay trên giao diện; không phải xác thực.
- Nguồn dữ liệu `START` và `P` đều cố định. `DB` là bản sao trong bộ nhớ trang; làm mới trang mất dữ liệu vừa nhập; `logs` chỉ là sự kiện ghi vào mảng JS.
- Chưa có `fetch`, API, cơ chế tiếp nhận nhân sự EDOS, token phiên, lưu dữ liệu máy chủ hoặc ký số. Không được coi quyết định mô phỏng là quyết định hành chính.
- Có JSON/CSV xuất dữ liệu thử và lệnh `window.print()`. Chưa có kết xuất Word chuẩn, PDF được sinh từ hồ sơ đã duyệt hay mẫu 01KH/01TKNV/5A/02/03 được kiểm chứng với bản gốc.
- JavaScript đã được kiểm tra bằng `node --check`: **không phát hiện lỗi cú pháp**. Chưa chạy thử quy trình toàn tuyến trên trình duyệt.

## 2. Các rủi ro và điểm phải sửa trước khi kết nối dữ liệu thật

| Mức | Vấn đề | Xử lý bắt buộc |
|---|---|---|
| Chặn triển khai | Chọn vai trò `#actor` ở frontend có thể chuyển từ GV sang HT/cấp trên | Ẩn cơ chế mô phỏng ở bản thực; Backend tự xác định người dùng/nhóm quyền từ phiên đăng nhập, không nhận vai trò quyết định từ client |
| Chặn triển khai | Nghiệp vụ hiện chỉ thao tác mảng `DB`; log có thể bị sửa/mất | Thiết kế kho dữ liệu có phiên bản, xử lý giao dịch có điều kiện, audit log chỉ ghi phía máy chủ |
| Chặn triển khai | Kết quả, điểm và quyết định có thể bị thao tác qua logic frontend | Backend xác minh người quyết định, thời điểm, trạng thái, nhóm tương đồng, căn cứ và điểm chính thức |
| Chặn triển khai | Chưa xác định pháp lý đầy đủ tiêu chí/biểu mẫu, điều kiện nhóm VCQL/GV/NV, trường hợp hè và tỷ lệ | Kim Quy 3 cung cấp bản đối chiếu điều/khoản/phụ lục gốc đã kiểm chứng và bảng tình huống kiểm thử |
| Cao | Hàm `canSee`, `canReview`, `canAssessSubject` trong bản mô phỏng đang cho lãnh đạo/nhóm rộng nhìn nhiều hồ sơ | Xác định quyền theo vai trò **và phạm vi được giao**: cá nhân, tổ, bộ phận, lĩnh vực, toàn trường, cấp trên; tránh truy cập vượt phạm vi |
| Cao | Nhiệm vụ hiện dùng `assignee` một người; chưa có đóng góp riêng của nhóm | Hỗ trợ công việc nhiều người với chủ trì và phân công/tiêu chí nghiệm thu cụ thể của từng cá nhân |
| Cao | Mã minh chứng là chuỗi tự nhập; không xác thực nguồn/độ mật | Đính kèm/tra cứu tham chiếu dữ liệu đã được EDOS xác thực, kiểm quyền truy cập và chống trùng |
| Cao | Nhãn “Đã duyệt/Đã nghiệm thu/Đã quyết định” là trạng thái mô phỏng | Ở môi trường thử phải gắn “MÔ PHỎNG”; khi chạy thật cần chữ ký/xác nhận, phiên bản và lịch sử thay đổi |
| Cao | Xuất 01TKNV mới là CSV; mẫu tự đánh giá chưa đối chiếu phụ lục | Áp dụng dịch vụ xuất hồ sơ hành chính DOCX/PDF dùng chung đã được đặt chuẩn |
| Trung bình | Điểm chung 30 + kết quả 70 và các điều kiện phân loại đang bị ràng buộc một phần trong JS | Tách bộ quy tắc pháp lý có phiên bản hiệu lực, khóa tự quyết khi chưa xác minh |
| Trung bình | Phản hồi kiến nghị chưa có đồng hồ hạn và luồng điều chỉnh kết quả phê duyệt | Lưu mốc thông báo, thời điểm nhận, hạn theo lịch làm việc, hồ sơ giải quyết và lịch sử sửa kết quả |
| Trung bình | Mẫu nhân sự dữ liệu cố định dễ bị hiểu nhầm dữ liệu thật | Tách dữ liệu test khỏi cấu hình vận hành, có banner môi trường rõ ràng |

### Lưu ý nghiệp vụ

Không mặc nhiên 02 PHT tương đương 01 suất xuất sắc/tháng. Hiệu trưởng có hồ sơ đánh giá tại đơn vị nhưng thẩm quyền quyết định theo phân cấp. Ba nhóm VCQL/GV/NV là cấu trúc nghiệp vụ hiện dùng; mẫu số và phân nhóm tương đồng để tính hạn mức chỉ được kích hoạt khi có xác nhận hợp lệ từ người có thẩm quyền. Không chia suất trước cho tổ.

## 3. Kiến trúc tích hợp đề nghị

**Giữ nguyên ứng dụng HVA NQ52 PRO độc lập** (giao diện, hành trình công việc, kiểm định của Kim Quy 3). Không sao chép mã JS mô phỏng vào `DieuHanh.html`.

### Lớp A – Giao diện NQ52
- Nhận ngữ cảnh phiên an toàn từ EDOS, không nhận token trong URL.
- Tách mô-đun giao diện theo nhóm: kế hoạch, nhiệm vụ, báo cáo tiến độ, nghiệm thu, tự đánh giá, thẩm định, quyết định, kiến nghị, thống kê.
- Mọi hành động chỉnh sửa phải gửi tới API có thẩm quyền; chỉ hiển thị trạng thái API xác nhận.
- Duy trì chế độ demo riêng, không trộn dữ liệu chính thức.

### Lớp B – Dịch vụ Backend `HVA_NQ52_SERVICE`
- Xác thực dựa trên phiên EDOS hoặc cơ chế cấp phiên ngắn hạn có kiểm chứng ở server.
- Kiểm tra quyền tại từng API trên **actor, scope, đối tượng, giai đoạn hồ sơ, phiên bản**.
- Chống sửa đè bằng `revision`/điều kiện chuyển trạng thái; chống gửi lặp bằng idempotency key.
- Định danh và liên kết nguồn: `personId`, `unitId`, `taskId`, `evidenceId`, `documentId`.
- Audit server-side có user ID, thời điểm, hành động, ID hồ sơ, trước/sau có kiểm soát; không ghi token và nội dung bí mật vào log.

### Lớp C – Nguồn dữ liệu EDOS kế thừa, không ghi đè
- **Nhân sự:** dùng `HVA_Personnel.js` / nguồn `searchNhanSuQuick`, `getPersonnelWorkgroups`; định danh gốc theo `username` (fallback theo quy tắc nguồn hiện có). Cần kiểm thử với danh sách thật trước khi chốt mapping; không lấy tên hiển thị làm khóa.
- **Tài khoản/SSO:** kế thừa dịch vụ xác thực hiện hữu; NQ52 chỉ nhận quyền truy cập qua adapter an toàn.
- **Nhiệm vụ:** tham chiếu hệ thống Giao việc – Theo dõi hiện hữu, thiết kế đồng bộ ID nguồn và mốc trạng thái để **không nhập lại một nhiệm vụ hai lần**.
- **Hồ sơ:** dùng chuẩn `docs/HVA_EDOS_HO_SO_HANH_CHINH_EXPORT_STANDARD.md`; bản dự thảo và bản đã duyệt phải phân biệt.
- **AI:** tham mưu, đối soát, rà soát hình thức; không tự chấm, duyệt, phân suất hoặc gửi tài liệu nhạy cảm trái quyền.

## 4. Hợp đồng Backend đề xuất (chưa triển khai)

Các lệnh bên dưới là **đề xuất giao diện kết nối**, không phải action đã có:
- `nq52_getContext`: trả ngữ cảnh vai trò/phạm vi và kỳ đánh giá từ máy chủ.
- `nq52_listTasks`, `nq52_getTask`, `nq52_createTaskDraft`, `nq52_submitTask`, `nq52_approveTask`.
- `nq52_acceptTask`, `nq52_submitProgress`, `nq52_reviewDeliverable`.
- `nq52_getEvaluation`, `nq52_saveSelfAssessment`, `nq52_submitSelfAssessment`.
- `nq52_reviewAssessment`, `nq52_decideClassification`, `nq52_publishResult`, `nq52_fileAppeal`, `nq52_respondAppeal`.
- `nq52_getQuotaContext`: chỉ trả nhóm/mẫu số/hạn mức đã được xác minh; chưa có thì trả “không đủ căn cứ”, **không dự đoán suất**.
- `nq52_exportDocument`: tải DOCX/PDF qua dịch vụ hồ sơ chuẩn theo biểu mẫu và quyền.

Ví dụ phản hồi chuẩn:
```json
{
  "success": false,
  "code": "LEGAL_RULE_PENDING",
  "message": "Chưa đủ căn cứ xác định nhóm tương đồng và giới hạn tỷ lệ.",
  "data": null,
  "requestId": "do-server-cap",
  "revision": null
}
```

Không coi mã action gợi ý là hợp đồng Backend đã được EDOS xác nhận. Phải thống nhất với Kim Quy 3 và kỹ thuật Backend trước khi triển khai.

## 5. Lộ trình nghiệm thu bắt buộc

1. **Kim Quy 3** xác nhận phụ lục gốc, công thức, đối tượng, các trường hợp đặc thù; chuẩn hóa mẫu đầu ra và đưa bộ ca kiểm thử.
2. **Kim Quy Pro** hoàn thiện sơ đồ dữ liệu, API adapter, nguồn nhân sự, xác thực, RBAC/ABAC và lưu trữ, không sửa các module PASS.
3. Kiểm thử trên dữ liệu **giả lập**: giao việc đầu tháng → nhận nhiệm vụ → sản phẩm → nghiệm thu → 01TKNV → tự đánh giá → thẩm định → quyết định → thông báo/kiến nghị → hồ sơ Word/PDF.
4. Kiểm thử các trường hợp âm: GV gọi API duyệt, TTCM đọc hồ sơ ngoài tổ, người không có thẩm quyền đổi xếp loại, dữ liệu lỗi/thiếu, không đủ cơ sở tỷ lệ, trùng minh chứng, dữ liệu cuộc thi kéo dài.
5. Kiểm tra ghi log bất biến, phân quyền dữ liệu, phục hồi sự cố, kết xuất đúng mẫu, bảo vệ dữ liệu.
6. Chỉ sau khi toàn bộ PASS và được thầy phê duyệt mới tạo lối mở NQ52 trong EDOS, **không tự sinh thêm ô Điều hành**.

## 6. Phạm vi trách nhiệm

- **Kim Quy 3:** chủ trì nghiệp vụ, căn cứ pháp lý, mẫu biểu, tiêu chí và chấp nhận kết quả kiểm thử.
- **Kim Quy Pro:** kiến trúc, adapter EDOS, xác thực, Backend, quyền, an toàn dữ liệu và quy chuẩn kết xuất.
- **BGH/cấp có thẩm quyền:** phê duyệt phạm vi triển khai và quyết định đánh giá.

**Kết quả thẩm định:** Mã nguồn đủ để tiếp tục phát triển nguyên mẫu và kiểm thử nghiệp vụ; **không đủ điều kiện sử dụng để đánh giá hoặc chi trả chính thức.**
