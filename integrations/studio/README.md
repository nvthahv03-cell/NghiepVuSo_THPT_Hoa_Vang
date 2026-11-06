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
