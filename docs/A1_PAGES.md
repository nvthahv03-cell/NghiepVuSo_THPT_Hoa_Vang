# A.1 trên Cổng NVS GitHub Pages

Nhánh: `feature/a1-github-pages`, nền `main` tại commit `921701cef57346dc46d3a05d2987109e7f2472fe`. Đây là nhánh để xem xét trước khi hợp nhất; chưa triển khai hoặc nghiệm thu.

## Thao tác đúng trong giao diện hiện hành

Sau khi PR được chủ dự án duyệt, hợp nhất và GitHub Pages xuất bản bản đó:

1. Đăng nhập như hiện tại ở `index.html`, mở **Tác nghiệp số** → **A.1 – Báo cáo chuyên môn**. Mở nhóm bằng mũi tên theo hành vi menu hiện có.
2. A.1.1 mở trang chung, chọn nhiệm vụ/điều động/tập huấn/báo cáo khác. A.1.3 mở sinh hoạt tổ/nhóm hoặc cụm. A.1.4 mở HSG/phụ đạo/ôn thi và link DTHT cũ riêng.
3. Nhập nội dung và các trường riêng, link Drive/Docs, bấm **Xem trước**, rồi **Quay lại chỉnh sửa**. Danh tính hiển thị lấy từ phiên NVS đã đăng nhập; không tạo đăng nhập mới.
4. Lưu nháp, gửi báo cáo mới và lịch sử/phản hồi ghi **Đang phát triển**, bị khóa vì chưa xác minh kết nối backend thật. Không có thông báo gửi thành công hoặc bản ghi mẫu. Nội dung nhập chỉ nằm trong bộ nhớ lần mở trang, không được lưu vào localStorage/SQLite.
5. Ở sinh hoạt tổ/cụm, **Tải danh sách nhân sự** gọi helper HVA_Personnel hiện có theo phiên/quyền server. Nếu không tải được thì báo lỗi, không dùng nhân sự giả.
6. Trợ lý gọi HVA_Assistant_Shared.draftReport hiện có khi người dùng bấm; kết quả chỉ để kiểm tra rồi chép thủ công vào nội dung, không tự lưu/gửi. Chưa xác minh tích hợp AI trên deployment thật.
7. A.1.2 chỉ danh mục/điều kiện phát triển, không mở dữ liệu học sinh. **Báo cáo chủ nhiệm hiện hành** và **DTHT hiện hành** vẫn tới đúng tệp gốc, không đổi nghiệp vụ.

Không yêu cầu người dùng cài Python/Windows/SQLite hoặc chạy phần mềm riêng. Các script ở tests/ chỉ dành cho kiểm thử phát triển, không phải kiến trúc vận hành.

## Phạm vi mã

- `NghiepVu.html`: chỉ nối các mục A.1 và accordion A.1.4; giữ nguyên CSS/menu nhóm khác. Selector accordion chỉ áp dụng button có aria-controls, tránh lỗi khi bấm link A.1.1.
- `A.1.1. NhiemVu_BaoCao.html`: giữ URL cũ bằng chuyển tiếp cùng đường dẫn dự án tới trang A.1 chung.
- `NVS_BaoCao_A1.html`, `NVS_A1.js`, `NVS_A1.css`, `NVS_A1.schemas.json`: các biểu mẫu/nhập/xem trước. Header lấy nguyên mẫu từ A.1.1 hiện hành; không dựng cổng NVS độc lập.
- `index.html`: chỉ bỏ nhánh rỗng của regex isBGH, là lỗi đã được chủ dự án cho sửa trước đó. Không đổi CSS index hoặc các handler khác.
- Tests/tài liệu: kiểm tra subpath Pages, link/menu, 9 biểu mẫu, không phiên/hết phiên, lỗi helper và source giữ nguyên.

Giữ nguyên byte: đăng nhập (ngoài predicate BGH một dòng), HVA_Personnel.js, HVA_Assistant_Shared.js, BC_ChuNhiem.html, BC_DayThemHocThem.html, CuocHop.html, NVS_ThongBao.html, NVS_BinhChon.html, TTPhatHanh.html, PhanCong_DeKiemTra.html và các tệp ngoài phạm vi. Không thêm/copy Apps Script backend, launcher Windows hoặc SQLite từ nhánh trước lên kho công khai. Bản S01 và backend thử nghiệm trước đó vẫn nằm ở nhánh/kho bàn giao riêng, không được triển khai hoặc ghép vào main ở PR này. S02 không sửa.

## Kiểm thử và giới hạn

- Chromium dưới đúng prefix `/NghiepVuSo_THPT_Hoa_Vang/`: 17 mục kỹ thuật gồm 9 biểu mẫu, menu, URL tương thích, link CN/DTHT, URL/ngày sai, hết phiên, không phiên, helper nhân sự/AI và trạng thái khóa gửi/lưu.
- 375/663/900/1200 px: không tràn ngang trang biểu mẫu.
- isBGH: GV/TTCM false, Hiệu trưởng/Phó Hiệu trưởng true (4 ca).
- Source/cú pháp: 39/42 tệp nền giữ nguyên; 3 tệp nền đổi đúng phạm vi. Không kiểm thử tích hợp/ghi dữ liệu production. Các request remote trong browser test được intercept, không tính PASS tích hợp.

Xem A1_PAGES_CHECKLIST.csv (đủ 11 cột), A1_PAGES_TEST_RESULTS.json. PASS kỹ thuật không phải PASS tích hợp hoặc PASS nghiệm thu. Chủ dự án cần kiểm tra trên app có version được chốt và backend thử được cấp phép; không thử ghi dữ liệu thật để nghiệm thu.

## PR và địa chỉ website

Một repository GitHub Pages chỉ phục vụ bản được cấu hình xuất bản; nhánh PR không tự có địa chỉ preview tại URL hiện hành. URL `https://nvthahv03-cell.github.io/NghiepVuSo_THPT_Hoa_Vang/` vẫn phục vụ bản đã xuất bản, chưa có thay đổi từ nhánh này. Không tự merge hoặc đổi cấu hình Pages để ghi đè website.

Để người dùng thao tác đúng URL đó cần chủ dự án duyệt/hợp nhất PR và Pages build thành công, hoặc cấp riêng một host preview. Việc push nhánh/chuẩn bị PR không được gọi là đã cập nhật website. Chưa có URL preview riêng được cấp.

Hoàn nguyên: PR chưa merge nên main/website chưa đổi. Nếu sau này được phép hợp nhất, chủ dự án có thể revert commit qua PR; không tự triển khai rollback hoặc thay dữ liệu backend.
