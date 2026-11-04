# Bốn nghiệp vụ NVS – nhật ký tích hợp và nghiệm thu

**Nhánh thử nghiệm:** `feature/hva-four-nghiep-vu-20261104`. Không triển khai thẳng vào `main`.

## Phạm vi
1. **Sổ đầu bài BD HSG 12**: giữ nguyên dự án Apps Script/Google Sheet và dữ liệu hiện hành. Trang `SoDauBai_BDHSG12.html` **chỉ mở Web App cũ**, không tạo sổ thứ hai. Điền URL Web App đã xác minh vào `HVA4_Links.js`; hiện còn trống vì không có URL thực trong mã được cung cấp.
2. **Sổ chủ nhiệm điện tử**: `SoChuNhiem_DienTu.html`. 21 nhóm nội dung, nhập Excel/CSV có xem trước, không lưu danh sách học sinh vào localStorage. Phải xác thực lớp GVCN phía máy chủ.
3. **Kê khai NQ 52**: `NQ52_KeKhai.html`. GV trực tiếp nhập; phân biệt NQ 52/2025/NQ-HĐND (thu nhập tăng thêm) với QĐ 32/2026/QĐ-UBND (đánh giá theo hiệu quả công việc). Không tự quyết định mức chi.
4. **Sổ theo dõi thiết bị**: `SoTheoDoi_ThietBi.html`. Có bảng ghi sử dụng, danh sách GV–phân công, phần nhận xét của lãnh đạo theo đúng loại sổ giấy. BGH ký/nhận xét phải do máy chủ xác nhận.

## Backend dự kiến (chưa triển khai)
- `backend/HVA4_Store.gs` và `backend/HVA4_Business.gs` là **mã phụ trợ** cho NVS, không có `doGet/doPost` để tránh va chạm.
- Sau khi đối chiếu toàn bộ Backend đang chạy, gọi `HVA4_dispatch_(payload, principal)` **chỉ từ router đã xác thực `sessionToken`**. `principal` phải được máy chủ xác định từ phiên thực và nguồn nhân sự (username, vai trò, lớp GVCN, năm học). Không lấy principal từ JSON người dùng gửi.
- Đặt Script Property `HVA4_DATA_SPREADSHEET_ID` trỏ tới kho riêng đã phân quyền của NVS; quản trị chạy `HVA4_setupByAdmin_()` **một lần trên bản kiểm thử** sau khi sao lưu và đối chiếu. Không đưa ID/số liệu nhân sự nhạy cảm lên kho mã nguồn công khai.
- Các thao tác `hva4Get`, `hva4Save`, `hva4ImportRoster` phải phản hồi `schemaVersion: 'HVA4-1'` và `module` đúng. Khi Backend chưa hỗ trợ, trang **chặn ghi** và thông báo rõ.
- Các màn hình duyệt của BGH, chữ ký/nhận xét, xác nhận đăng ký thiết bị, và chuyển dữ liệu sổ hiện hành còn phải xây dựng/đối chiếu nghiệp vụ trước triển khai thật.

## Điều kiện PASS
- [ ] URL Sổ đầu bài thật được xác minh, mở từ EDOS đúng Web App đang dùng, dữ liệu cũ còn nguyên.
- [ ] Sổ chủ nhiệm: thử với GVCN, lớp thật; nhập danh sách; tải lại, không mất dữ liệu; giáo viên khác bị chặn.
- [ ] NQ52: tự kê khai → nháp → gửi → kiểm tra nguồn minh chứng và xác nhận đúng quyền, không được tự chấm thay BGH.
- [ ] Sổ thiết bị: ghi buổi dạy, sổ tổ/trường và nhận xét BGH, xuất mẫu và kiểm tra phân quyền.
- [ ] Báo cáo chủ nhiệm, DTHT và các chức năng PASS trước đó vẫn chạy (kiểm thử hồi quy).
- [ ] Backend cùng các bảng Sheet đã sao lưu; không có nhân sự hoặc học sinh bị lộ dữ liệu.

**Tình trạng hiện tại:** Đã tạo trang, nối danh mục và mã chuẩn bị Backend trên nhánh thử nghiệm. **CHƯA PASS** do chưa có quyền cập nhật/triển khai Apps Script hiện hành, thiếu URL Web App sổ đầu bài chính xác và chưa có kiểm thử dữ liệu thực tế.
## Kết quả kiểm tra mã ngày 04/11/2026
- Kiểm tra cú pháp JavaScript các trang và thư viện: **ĐẠT**.
- Kiểm tra sơ bộ 14 tình huống Backend bằng dịch vụ SpreadsheetApp/LockService giả lập: **14/14 đạt**, gồm phân quyền đọc hồ sơ cá nhân, GVCN nhập danh sách đúng lớp, chỉ BGH được nhận xét, chặn giáo viên tự ghi nhận xét Hiệu trưởng, chặn sửa bản NQ52 đã duyệt, không ghi đè dữ liệu sổ HSG 12.
- Đã bổ sung giao diện BGH xác nhận/yêu cầu bổ sung và mã xử lý ghi nhật ký.
- **Chưa có kết quả kiểm thử live Apps Script, Google Sheets, quyền trình duyệt hoặc bản in theo sổ giấy. Chưa đủ điều kiện tuyên bố PASS toàn bộ.**

## Kiểm định bổ sung
- Đã mở rộng bộ kiểm thử giả lập đến **16/16 đạt** sau khi sửa lỗi trong chính bộ mô phỏng thao tác ghi ô Google Sheets.
- Đã chặn mã học sinh dạng công thức bảng tính và lớp/mã học sinh không hợp lệ.
- Đã kiểm tra quyền BGH xem hồ sơ, chặn GV khác xem hồ sơ, chặn GV tự nhận xét thay Hiệu trưởng, chặn chỉnh sửa sau khi BGH xác nhận.
- Đã có thao tác BGH xác nhận hoặc yêu cầu bổ sung với nhật ký; vẫn chờ gắn vào router Apps Script và kiểm tra trên Google Sheet thực tế.

## Bản Sổ chủ nhiệm theo 21 nội dung sổ giấy (04/11/2026)
- Bản giao diện `SoChuNhiem_DienTu.html` chuyển từ biểu mẫu chung sang menu 21 mục với trường nhập được thiết kế riêng cho mỗi loại nội dung: văn bản, giáo viên bộ môn, CMHS, cán bộ lớp, thống kê, sơ đồ chỗ ngồi, kế hoạch tháng/tuần, thành tích, theo dõi học sinh, thu nộp và nhận xét Hiệu trưởng.
- Mục 4 dùng **trực tiếp danh sách học sinh đã xác thực**, không lập danh sách thứ hai. Có nhập Excel/CSV, xem trước, tải mẫu và xuất danh sách.
- Mỗi mục được lưu riêng theo `sectionKey + lớp + năm học`. Máy chủ kiểm soát định dạng, năm học, phân quyền và không cho tạo hồ sơ trùng mục. Giáo viên bị chặn ghi mục 21; BGH chỉ lập nhận xét cho lớp có danh sách học sinh trên máy chủ. GVCN được đọc lại nhận xét BGH của lớp mình.
- Đã kiểm tra cú pháp các tệp JS/Backend, 21 nhãn mục, sự tồn tại của các điều khiển giao diện và không thay đổi `BC_ChuNhiem.html`, `BC_DayThemHocThem.html`. Bộ kiểm thử dữ liệu giả lập đã kiểm tra lưu độc lập 19 mục có nhập liệu (mục 4 lấy dữ liệu lớp, mục 21 dành BGH), cách ly lớp, khóa quyền và đọc nhận xét. Đây **không** phải kiểm thử trên Google Sheet thật.
- Cần khi triển khai: kết nối router Apps Script đã xác thực token với `HVA4_dispatch_`; cài `HVA4_DATA_SPREADSHEET_ID`; chạy `HVA4_setupByAdmin_`; kiểm tra phân công GVCN thực trên server và đăng nhập thử GV/BGH trước khi nghiệm thu. Không đưa dữ liệu học sinh thật vào thử nghiệm công khai.
- Nhánh `feature/hva-four-nghiep-vu-20261104` đang khác `main`; đối chiếu thay đổi mới trên `main` trước khi phát hành. Không gộp nhánh và không báo PASS vận hành khi chưa chạy thử thật.

## Chốt hợp đồng giao diện cho kết nối Backend hàng loạt (04/11/2026)

| Giao diện | Mục đích | Action phía giao diện | Trạng thái Backend |
|---|---|---|---|
| `SoDauBai_BDHSG12.html` / liên kết A1.4 | Mở đúng sổ hiện hành `https://tinyurl.com/hva-bdhsg12` | Không gọi action mới | **Đã có liên kết cũ, tuyệt đối không di chuyển dữ liệu** |
| `SoChuNhiem_DienTu.html` | Sổ 21 nội dung theo sổ giấy; danh sách lớp dùng chung | `hva4Get`, `hva4Save`, `hva4ImportRoster`, `hva4Review` | Có code thử nghiệm; chưa tích hợp router chính thức |
| `KeHoach_BDHSG.html` | Giáo viên nộp PDF, ký số ngoài ứng dụng, BGH duyệt/trả lại | `hva4PlanGet`, `hva4PlanSave` | Có code thử nghiệm; chưa tích hợp router chính thức |
| `DoiTuyen_BDHSG.html` | Nhập/xem trước danh sách, gửi chốt đội tuyển, BGH duyệt | `hva4HsgTeamGet`, `hva4HsgTeamSave` | **Chỉ có giao diện; chưa có Backend** |
| `BaoCao_BDHSG.html` | Báo cáo tiến độ/kết quả HSG theo đội tuyển, chuyển BGH/đồng gửi TTCM | `hva4HsgReportGet`, `hva4HsgReportSave` | **Chỉ có giao diện; chưa có Backend** |
| `NQ52_KeKhai.html` | GV nhập công việc/tiêu chí theo tháng, BGH xét | `hva4Get`, `hva4Save`, `hva4Review` | Có code thử nghiệm; chưa tích hợp router chính thức |
| `SoTheoDoi_ThietBi.html` | Ghi sổ 12 cột, thống kê sử dụng, BGH rà soát | `hva4Get`, `hva4Save`, `hva4Review` | Có code thử nghiệm; danh sách GV và nhận xét lãnh đạo chưa có nguồn riêng |

**Điều kiện để bật chức năng khi kết nối một đợt**
1. Máy chủ xác thực `sessionToken` và tạo `principal` đáng tin cậy (tài khoản, vai trò, phân công lớp/tổ). Tuyệt đối không lấy role hay username từ client.
2. Dữ liệu học sinh chỉ gửi/đọc với quyền theo lớp; các bảng giữ nhật ký, không để thông tin nhạy cảm xuất hiện trong log công khai.
3. Mọi action trả `success:true` cùng đúng `schemaVersion` mới được giao diện hiển thị trạng thái đã lưu; nếu chưa có Backend thì tất cả nút ghi phải khóa.
4. Đối với ký số: chỉ lưu liên kết bản PDF đã **được ký bằng chứng thư số thật** qua công cụ được nhà trường sử dụng. Không giả mạo thao tác ký số trực tiếp trong EDOS.
5. Trước triển khai, đối chiếu nhánh thử nghiệm với `main` mới nhất (nhánh chính có thay đổi riêng), kiểm thử hồi quy, không sửa các biểu mẫu DTHT/BC Chủ nhiệm đã PASS.
6. Nghiệm thu bằng **2 tài khoản GV thuộc 2 lớp/tổ khác nhau và 1 tài khoản BGH**, lần lượt kiểm tra quyền, lưu nháp, gửi, trả bổ sung, duyệt, tải lại, in/xuất.
7. Nghiệm thu UI **khác** nghiệm thu Backend. Tình trạng hiện nay: các trang HTML đã tạo, nhưng chưa đủ điều kiện công bố hoàn tất nghiệp vụ.

## Giao diện bổ sung – gói hoàn thiện đợt kế tiếp (04/11/2026)

- **Sổ chủ nhiệm – 21 mục:** thêm tìm theo mục, thống kê số mục có dữ liệu (không suy diễn đã hoàn thành nội dung), sơ đồ chỗ ngồi trực quan, bản in theo đúng cột của mục đang chọn và cảnh báo chuyển mục/lớp khi đang có nội dung chưa lưu. Đổi bộ nhập CSV từ tách dấu phẩy thủ công sang XLSX parser để đọc ô được đặt trong dấu nháy. Bản in được đánh dấu nếu có chỉnh sửa chưa gửi lên máy chủ.
- **Kê khai NQ 52:** nhóm các trường theo quy trình, hiển thị ba điểm nhóm A (chỉ tính tổng tự khai), ba tỷ lệ kết quả theo đúng dữ liệu nhập, hồ sơ theo tháng và mở lại hồ sơ đã lưu. Có phiếu in riêng đầy đủ trường dữ liệu, hiển thị rõ trạng thái và cảnh báo chưa phải phê duyệt chính thức; không tự suy diễn công thức quy đổi nhóm B.
- **Sổ thiết bị:** nhật ký theo mẫu giấy 12 cột, thống kê lượt sử dụng phòng bộ môn và CNTT; tạo riêng biểu mẫu BGH ghi nhận xét tháng và danh sách nhận xét. Action `hva4DeviceReviewGet` / `hva4DeviceReviewSave`, giao thức `HVA4-DEVREVIEW-1` cần Backend **chưa tồn tại**; nút lưu khóa nếu chưa được máy chủ xác thực.
- **BD HSG:** Kế hoạch BD HSG có lịch sử xử lý, khóa nút theo trạng thái nộp – giáo viên ký – BGH duyệt, liên kết các phiên bản PDF. Đã có trang Danh sách đội tuyển và Báo cáo đội tuyển riêng; hai action mới `hva4HsgTeamGet/Save` và `hva4HsgReportGet/Save` vẫn **chờ Backend**. Không đụng dữ liệu ở Sổ đầu bài BD HSG 12 cũ.
- **Xuất CSV:** đã xử lý giá trị bắt đầu bằng ký tự giống công thức khi tải CSV, giúp giảm rủi ro thực thi công thức trong ứng dụng bảng tính.

Rà soát tĩnh cuối đợt: 10 tệp HTML/JS liên quan đều có cú pháp JS hợp lệ; tất cả ID DOM được gọi từ inline script đều có; 7 liên kết mục nghiệp vụ tồn tại. Chưa thực hiện thử giao diện bằng trình duyệt thực tế, chưa có tích hợp Apps Script production.

## CHỐT GIAO DIỆN A1 – BÁO CÁO CHUYÊN MÔN (04/11/2026)

### Các màn hình thuộc A1 đã có đường dẫn
- **A.1.1** `A.1.1. NhiemVu_BaoCao.html`: KẾ THỪA nguyên trang đang dùng (4 loại báo cáo: nhiệm vụ, điều động, tập huấn–hội nghị, báo cáo khác). Đã có tạo bản xem trước, in PDF; lưu/gửi còn chờ Backend.
- **A.1.2** `SoChuNhiem_DienTu.html`: Sổ CN 21 nội dung, giao diện thử nghiệm có cấu trúc.
- **A.1.2** `BC_ChuNhiem.html`: **PASS–LOCK** hiện hành, không chỉnh sửa.
- **A.1.2** `A1_HoSo_HoaNhap.html`, `A1_KeHoach_GDCN.html`, `A1_TheoDoi_HoaNhap.html`, `A1_BaoCao_HoaNhap.html`: 4 biểu mẫu theo hướng hồ sơ, kế hoạch GD cá nhân, theo dõi và báo cáo GD hòa nhập. **KHÓA nhập nội dung nhạy cảm** nếu `hva4A1DraftAccess` chưa xác thực quyền server. Không lưu trên browser và không ghi dữ liệu học sinh vào hệ thống khác.
- **A.1.3** `A1_SinhHoat_ChuyenMon.html`, `A1_SinhHoat_Cum.html`: 2 màn hình chuyên môn, có nhóm trường dữ liệu, xem trước/in PDF bản chưa ký.
- **A.1.4** `BC_DayThemHocThem.html`: **PASS–LOCK** hiện hành, không chỉnh sửa.
- **A.1.4** `KeHoach_BDHSG.html`, `DoiTuyen_BDHSG.html`, `BaoCao_BDHSG.html`, `A1_PhuDao_OnThi.html`: hồ sơ kế hoạch, đội tuyển, báo cáo HSG, phụ đạo/ôn thi.
- **A.1.4** sổ ghi đầu bài BD HSG 12: giữ đúng URL `https://tinyurl.com/hva-bdhsg12`, không đụng Google Sheet.

### Kiểm toán A1
- Thêm **7/7 giao diện còn thiếu** (4 hòa nhập, 2 sinh hoạt, 1 phụ đạo–ôn thi), nối đúng 7/7 liên kết ở `NghiepVu.html`. Kiểm tra cấu trúc cấu hình từng trang (11–16 trường) và cú pháp JavaScript bộ máy dùng chung đều đạt.
- KHÔNG sửa `A.1.1. NhiemVu_BaoCao.html`, `BC_ChuNhiem.html`, `BC_DayThemHocThem.html`.
- Trạng thái A1: **hoàn thành cấu trúc màn hình HTML**, chưa kiểm thử click và in bằng trình duyệt thật; chưa có Backend cho bảy mẫu mới; còn việc xác nhận nội dung biểu mẫu hòa nhập bám đúng mẫu do trường phê duyệt.
- Cần kiểm tra lại phân quyền ký số, thông báo BGH/đồng gửi TTCM, hồ sơ và mẫu in trước khi nghiệm thu nghiệp vụ. Chỉ kết nối Backend hàng loạt sau khi tất cả giao diện A1–A6 thống nhất.
- Nhánh thử nghiệm khác `main` (main có thay đổi riêng). Không tự ý merge; phải so sánh và thử hồi quy trước khi phát hành.

## GIAO DIỆN A2 – KIỂM TRA, ĐÁNH GIÁ (04/11/2026)

- **A.2.1** `PhanCong_DeKiemTra.html`: trang hiện hành đã kết nối, giữ nguyên tuyệt đối.
- **A.2.2** `A2_NopMaTran_DeKiemTra.html`: 15 trường, các nhóm nhiệm vụ, ma trận, bản đặc tả, đề, đáp án, lần nộp; bắt buộc link Drive/Docs HTTPS.
- **A.2.3** `A2_NopDeBoSung.html`: 14 trường, kiểm tra bổ sung, kiểm tra lại hoặc đề thay thế; lý do và link đề/đáp án có phân quyền.
- **A.2.4** `A2_BaoCao_DeNghi.html`: 14 trường, báo cáo tiến độ, điều chỉnh lịch/phân công, sự cố, kết quả và kiến nghị.
- **Bộ máy UI chung:** `HVA_A2_FormEngine.js` có xác thực điều kiện nhập, xem trước và in bản chưa ký; bảo vệ điều kiện trường bắt buộc và link Drive. `hvaA2List`, `hvaA2Save` yêu cầu giao thức `HVA-A2-1`; hai hành động này **chưa có Backend** nên các nút lưu/gửi luôn khóa trừ khi router xác nhận đúng phiên, mã module và quyền.
- **Tiếp nhận BGH/Tổ trưởng:** hiển thị nút gửi theo quy trình dự kiến, nhưng cần Backend thực hiện lưu, phân luồng BGH/đồng gửi TTCM và nhật ký đúng quyền, không tự coi đã gửi khi chỉ xem trước.
- **Bảo mật:** tuyệt đối không nhúng nội dung đề thi/đáp án vào trang tĩnh, không dùng liên kết công khai; sử dụng tài liệu Drive có phân quyền và xác minh theo người được giao nhiệm vụ; không cung cấp khả năng đọc dữ liệu bằng tên tài khoản người dùng phía client.
- **Kiểm thử:** 33/33 phép kiểm tĩnh về cấu hình trang, tồn tại các điều khiển, liên kết danh mục và cú pháp engine đạt. Không sửa `PhanCong_DeKiemTra.html`, `BC_ChuNhiem.html`, `BC_DayThemHocThem.html`. **Chưa test bằng trình duyệt, chưa test Backend thật.**
- Đợt nối Backend phải lấy phân công A.2.1 đã xác thực từ server làm căn cứ quyết định giáo viên có quyền nộp đề cho môn/khối/đợt hay không. Việc gắn chung phương thức mở trang theo mẫu Báo cáo chủ nhiệm cần kiểm tra hồi quy trên EDOS trước khi merge.
