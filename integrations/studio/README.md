# EDOS ↔ HVA Learning Studio — module thử nghiệm (06/11/2026)

**Trạng thái:** Có mã module trong repository, **CHƯA triển khai trên Google Apps Script**, **CHƯA có SSO**, **CHƯA kiểm thử gọi Gemini thật**, **CHƯA PASS**. Không đưa thẳng vào production.

## Tệp
- `HVA_STUDIO_CONTRACT_TEST.gs`: hàm `hvaStudioContractSelfTest_()` kiểm tra 8 trường hợp (không gọi AI, không đọc khóa); chưa chạy trong GAS.
- `HVA_STUDIO_BACKEND_TEST.gs`: hàm `hvaStudioGenerateTest_(payload)` và action `hva_studio_ai_generate`. Độc lập, không khai báo `doGet` hoặc `doPost`.
- Hợp đồng phía Studio: `HVA-LEARNING-STUDIO/studio-edos-adapter.js`; tài liệu `docs/HVA_EDOS_GEMINI_API_CONTRACT.md` tại repository Studio.

## Quy trình triển khai trên BẢN SAO TEST Apps Script
1. Sao lưu bản Backend đang chạy và đối chiếu mã `nvsActor_`, `hvaTraCuuNhanSuTheoUser_`, router và phiên. Bản code GitHub không phản ánh chắc chắn deployment GAS hiện tại.
2. Thêm tệp `HVA_STUDIO_BACKEND_TEST.gs` vào bản sao thử nghiệm. Không nạp trùng `CONFIG`, `HVA_AI_SERVICE`, `doPost`.
3. Chạy `hvaStudioContractSelfTest_()` trên bản sao Apps Script, yêu cầu tất cả kết quả `pass=true` trước khi cấu hình hoặc bật API.
4. Script Properties **chỉ trên test**: `HVA_STUDIO_TEST_ENABLED=true`, `HVA_STUDIO_ALLOWED_USERS=<username-giáo-viên-thử-nghiệm>`, `GEMINI_API_KEY` (giữ trên máy chủ), `HVA_STUDIO_GEMINI_MODEL=<model-gemini-đang-được-cấp-phép>`.
5. Trên router **test**, sau khi xác minh phiên và loại yêu cầu, thêm nhánh gọi `hvaStudioGenerateTest_(p)` khi `p.action === 'hva_studio_ai_generate'`. Không thay router production.
6. **SSO chưa có**: GitHub Pages Studio không đọc được phiên EDOS tại origin khác. Không truyền sessionToken trong URL, không nhúng API key trong JS. Thiết kế và kiểm thử trao đổi quyền một lần, ràng buộc origin, TTL ngắn, chống dùng lại trước khi bật Studio.
7. Dùng tài khoản giáo viên thử và dữ liệu giả để kiểm tra: 401/403, phiên hết hạn, sai quyền, input sai, trùng yêu cầu, giới hạn 5 request/10 phút, lỗi 429/503, chi phí, hồi quy EDOS. Các mã lỗi HTTP phụ thuộc router GAS; hàm hiện trả kết quả JSON.
8. Chỉ bật production sau khi kiểm tra đúng phiên bản triển khai, có log an toàn, quyền giáo viên chuẩn, SSO, kiểm thử Gemini thực và nghiệm thu.

## Giới hạn hiện tại
- Quyền thử nghiệm dùng danh sách username cấu hình máy chủ và có kiểm tra hồ sơ nhân sự; **chưa phải mô hình phân quyền chính thức**.
- Giới hạn CacheService chỉ là chống lạm dụng mức cơ bản, chưa đủ accounting/quota ngân sách.
- Đã thêm chống gửi lặp `requestId` bằng Script Cache (best-effort, chưa có nhật ký bền vững), giới hạn thử nghiệm 5 lần trong cửa sổ cố định 10 phút; chưa có SSO khác-origin, chưa có OpenAI đối chiếu.
- Chưa thực hiện kiểm thử thực tế trong Apps Script; cấu hình endpoint/model Gemini cần được xác nhận.

**Không đặt khóa hoặc token thật trong GitHub, URL, ảnh chụp hay tài liệu bàn giao.**

## Cầu nối cửa sổ TEST – 06/11/2026
- EDOS: `integrations/studio/HVA_STUDIO_EDOS_BRIDGE_TEST.js`, **không được nạp tự động trên trang chính**.
- Studio: `studio-edos-window-bridge-test.js` (repository HVA-LEARNING-STUDIO), **chưa được gắn vào trang chính**.
- EDOS mở URL Studio cố định, xác minh `event.source`, origin, pathname và mã kênh; Studio xác minh opener/origin/kênh. EDOS giữ token phiên trong phạm vi EDOS, chỉ truyền payload học liệu và phản hồi bản nháp.
- `authorizedSend(request)` phải được lập trình viên EDOS cung cấp trong ngữ cảnh đã xác thực; **không có URL Backend mặc định, không chuyển token qua postMessage hoặc query string**. Khi chưa có callback này, bridge không mở.
- Cả hai trang GitHub Pages cùng host `nvthahv03-cell.github.io`, khác đường dẫn nhưng **cùng origin** theo trình duyệt. Vì vậy kiểm tra origin **không đủ**: bắt buộc so khớp `event.source`, cửa sổ đã mở và pathname Studio; không coi đây là cơ chế tách biệt bảo mật giữa hai ứng dụng. Không dựa vào localStorage của Studio.
- Cảnh báo: Cầu nối trên chỉ chứng minh đường thông điệp. Chưa hoàn thành xác thực quyền server, chưa có SSO toàn diện, chưa có callback kết nối router GAS thật.
- Kiểm thử trong JavaScript mô phỏng: 01 yêu cầu thành công, 01 lần gọi authorizedSend, không có trường token trong payload, listener được dọn. **Chưa kiểm thử trên trình duyệt hoặc Google Apps Script thật**.

### Kích hoạt thử nghiệm sau khi có bản sao Backend
1. Khởi tạo EDOS TEST tách khỏi production. Xác minh `nvsActor_`, role, hồ sơ nhân sự và router GAS.
2. Triển khai action riêng trên router TEST; callback `authorizedSend` tại EDOS TEST phải gắn `sessionToken` hợp lệ từ chính phiên EDOS vào body khi gọi Backend TEST, không truyền về Studio; chỉ nhận trường cho phép từ payload.
3. Nạp bridge JS ở giao diện EDOS TEST, nối nút Học liệu TEST với `HVA_STUDIO_EDOS_BRIDGE_TEST.open({ authorizedSend })`. Không thay nút Học liệu production.
4. Nạp module Studio trong bản TEST và dùng `connectEdosStudioTest()` để lấy `client.generate(task)`. Không gọi trực tiếp Backend bằng token nhúng.
5. Kiểm thử thực tế desktop/mobile, các trạng thái phiên hết hạn, người dùng thiếu quyền, mở Studio trực tiếp, giả mạo message, đóng cửa sổ, lặp ID, lỗi mạng, quota và rollback.

## Chẩn đoán Gemini — 06/11/2026
- Đã bổ sung mã lỗi an toàn `GEMINI_QUOTA`, `GEMINI_UNAVAILABLE`, `GEMINI_AUTH`, `GEMINI_MODEL`, `GEMINI_REQUEST`, `GEMINI_BAD_JSON`, `GEMINI_SAFETY`, `GEMINI_TRUNCATED`, `GEMINI_EMPTY`, `GEMINI_NETWORK`.
- Đã chạy **11/11 tình huống Gemini mô phỏng đạt** (không gửi yêu cầu mạng thật).
- Tài liệu: [DIAG_GEMINI_2026-11-06.md](./DIAG_GEMINI_2026-11-06.md) — có nhánh router chính xác cho bản Backend tham chiếu 03/11 trên **bản sao thử nghiệm**.
- Mã lỗi chỉ hỗ trợ tìm nguyên nhân, không chứng minh Gemini thật đã hoạt động.
