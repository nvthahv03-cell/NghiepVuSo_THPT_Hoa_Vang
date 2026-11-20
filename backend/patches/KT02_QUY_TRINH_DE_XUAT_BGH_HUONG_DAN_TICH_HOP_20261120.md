# KT02 – Quy trình TTCM đề xuất → BGH duyệt → TTCM phân công

Ngày 20/11/2026. Triển khai theo EDOS V5 hiện hành. Không thay `00_CORE.gs`, `30_DH_HE_THONG.gs`, `CuocHop.html` hoặc `HVA_Personnel.js` (nhân sự đã PASS).

## 1. Những gì đã có trên GitHub

- `PhanCong_DeKiemTra.html`: có giao diện đề xuất/phê duyệt và chặn chuyển phát hành.
- `KT02_Approval_Workflow.js`: gọi API từ đúng Backend đăng nhập `index.html`, dùng phiên EDOS hiện hành, không đăng nhập lần hai.
- `backend/patches/34_DH_KT02_PHE_DUYET_NOI_DUNG_20261120.gs`: module bổ sung, tạo bảng `DH_KT02_DE_XUAT_NOI_DUNG`, nhật ký `DH_KT02_NHAT_KY_DUYET`; không lưu đề, đáp án.

## 2. Thao tác bắt buộc tại Apps Script V5

Chép **nội dung** file `34_DH_KT02_PHE_DUYET_NOI_DUNG_20261120.gs` vào **một file mới 34_DH_KT02_PheDuyetNoiDung.gs trong đúng dự án Apps Script đang cấp phiên đăng nhập cho `index.html`**.

Không tạo `doGet`/`doPost` mới.

### Chèn Router GET ngay trước tuyến fallback

```javascript
if (['kt02ScopeList','kt02ScopeGet'].includes(action)) {
  return hvaKT02ScopeDispatchGet_(action, params);
}
```

### Chèn Router POST ngay trước tuyến fallback

```javascript
if (['kt02ScopeSave','kt02ScopeSubmit','kt02ScopeDecide'].includes(action)) {
  return hvaKT02ScopeDispatchPost_(action, payload);
}
```

Tuyến `nvsActor_(...)` phải kiểm chứng phiên từ cùng Backend đăng nhập EDOS. Module dùng `CommonDb.ensureSheet`, `nvsPCDKReadPeople_` và `hvaJSON_` đã có trong V5. **Không thay chúng bằng hàm giả hoặc bỏ xác thực**. Phải xác nhận `CommonDb` đang trỏ đến `EDOS_DH_DB_ID`.

## 3. Chặn ghi phân công không có phê duyệt từ SERVER (module 32 hiện hành)

Trong `32_DH_KT02_PhanCong.gs`, tại `hvaKT02RoutePost_`, ngay sau dòng đang có:

```javascript
var d=hvaKT02CheckRecord_(raw,actor,hit&&hit.data);
```

thêm:

```javascript
d.scopeApprovalId = String(raw.scopeApprovalId || '').trim();
if (!hvaKT02ScopeApprovedFor_(d,actor)) {
  throw new Error('KT02 chưa có đề xuất nội dung được BGH phê duyệt đúng tổ, khối, môn và kỳ kiểm tra.');
}
```

Hàm `hvaKT02ScopeApprovedFor_` trong module 34 **đọc lại bản ghi trên Backend**; không tin trường `status` hay `actor` gửi từ trình duyệt. Không được thêm các action khác vào `hvaKT02RoutePost_` nếu chúng chưa có xử lý đúng.

**Quan trọng:** Hệ thống hiện có tuyến ký/phát hành khác `nvsPCDKPublish_`. Trước khi công nhận PASS toàn tuyến, phải thêm kiểm tra `scopeApprovalId` tương tự tại **Backend phát hành**, căn cứ `document.data.scopeApprovalId` (hoặc trường tương đương trong payload thực tế). Nếu chưa kiểm tra được payload và tuyến phát hành chính xác thì **không bật phát hành chính thức**.

## 4. Hướng hoàn thiện frontend lưu phân công

Bảng V2 hiện ở `#kt02Unified` vẫn chỉ lưu bản nháp trên thiết bị, chưa ghi `DH_KT02_PHAN_CONG`. Cần map từng đề xuất đã duyệt sang bản phân công của module 32 và gọi `kt02Save` có `scopeApprovalId`, sau khi kiểm tra schema. Không thể coi việc chuyển `TTPhatHanh.html` hoặc lưu `sessionStorage` là đã ghi hồ sơ.

## 5. Trình tự nghiệm thu bắt buộc

1. Đăng nhập tài khoản TTCM tổ Toán–Tin; xác nhận đủ 11 nhân sự vẫn tải được.
2. TTCM lập đề xuất có số KH, môn, khối, kỳ, phạm vi, yêu cầu cần đạt; bấm Lưu; tải lại và kiểm tra bản ghi ở Sheet `DH_KT02_DE_XUAT_NOI_DUNG`.
3. TTCM gửi BGH; trạng thái phải thành `PENDING`; lúc này nút phân công/phát hành phải bị khóa.
4. BGH đăng nhập, thấy đề xuất; bấm Yêu cầu chỉnh sửa kèm lý do; TTCM sửa và gửi lại.
5. BGH duyệt; trạng thái `APPROVED`; TTCM mở hồ sơ và chọn đúng tổ/môn/khối/kỳ thì mới mở phân công.
6. BGH/GV khác không được chỉnh sửa đề xuất TTCM, TTCM không duyệt được, TTCM tổ khác không xem được.
7. Trình duyệt giả mạo `APPROVED`, thay tổ/môn/khối hoặc token hết hạn phải bị Backend từ chối.
8. Hồ sơ được ghi vào `DH_KT02_PHAN_CONG` và phát hành chỉ khi cả module 32 **và Backend phát hành** đã thực thi kiểm tra phê duyệt.

## 6. Trạng thái bàn giao

- **Đã cập nhật GitHub:** giao diện, module 34 đề xuất và nhật ký, tài liệu.
- **Chưa triển khai Apps Script V5 thực tế:** GET/POST action và kiểm tra trong module 32 vẫn cần đưa vào dự án đúng version rồi deploy.
- **Chưa PASS vận hành:** chỉ kiểm tra cú pháp; chưa kiểm thử BGH/TTCM với Sheet thực.
