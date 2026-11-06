# HVA–EDOS | Bàn giao giao diện nhóm 1.2 và 1.3

Ngày rà soát: 06/11/2026. **Chưa nghiệm thu thực tế bằng tài khoản người dùng.**

## Phạm vi và nguyên tắc

Hoàn thiện HTML và chức năng thao tác phía trình duyệt trước. Kết nối Backend theo một kế hoạch riêng, có kiểm thử tích hợp, **không được hiểu thao tác lưu nháp là giao việc/phát hành thật**. Không ghi đè những trang đã có nghiệp vụ đang chạy.

## Danh sách trang

| Nhóm | Nghiệp vụ | Trang hiện hành | Trạng thái |
| --- | --- | --- | --- |
| 1.2 | Phân công chuyên môn | NVS_PhanCongChuyenMon.html | Giao diện dự thảo mới, chưa có tuyến ghi Backend |
| 1.2 | Phân công dạy thay | NVS_DayThay.html | Kế thừa trang sẵn có, chưa thay đổi tuyến ghi |
| 1.2 | Điều phối công việc | NVS_DieuPhoiCongViec.html | Giao diện dự thảo mới, chưa có tuyến ghi Backend |
| 1.3 | Lịch công tác HVA | LichCongTac.html?mode=manage | Giữ nguyên trang lớn sẵn có |
| 1.3 | Bình chọn | NVS_BinhChon.html | Giữ nguyên giao diện và nghiệp vụ sẵn có |
| 1.3 | Khảo sát | NVS_KhaoSat.html | Giữ nguyên giao diện và nghiệp vụ sẵn có |

### Nguồn dùng chung cho hai trang mới
- HVA_Personnel.js: xây dựng nhóm Hội đồng, tổ/bộ phận, nhóm công tác; chống trùng username.
- HVA_Assistant_Shared.js: hỏi AI ngữ cảnh Công việc, giới hạn tối đa 4.000 ký tự; không tự ghi Backend.
- HVA_Operations_Draft.js: tải danh sách, chọn nhóm/cá nhân, chủ trì, chia đầu việc; tạo dự thảo AI, điền biểu mẫu (sau khi duyệt), giữ dữ liệu bổ sung trong bản nháp.

## Khung dữ liệu dự kiến cho kết nối một lần

### 1.2 Phân công chuyên môn
```json
{
  "module": "PhanCongChuyenMon",
  "fields": {
    "schoolYear": "",
    "grade": "",
    "subject": "",
    "className": "",
    "periods": "",
    "teacher": "",
    "notes": "",
    "__ops": {
      "people": [],
      "leader": "",
      "rows": [
        {"name": "", "owner": "", "due": "", "result": ""}
      ]
    }
  },
  "savedAt": ""
}
```

Backend tương lai cần thẩm định định mức, phân công trùng lớp/môn/giáo viên, tải trọng tiết, quyền duyệt và phiên bản phương án. Không thể coi kiểm tra trên HTML là kiểm tra xung đột TKB.

### 1.2 Điều phối công việc
```json
{
  "module": "DieuPhoiCongViec",
  "fields": {
    "title": "",
    "source": "",
    "owner": "",
    "members": "",
    "deadline": "",
    "deliverable": "",
    "priority": "",
    "details": "",
    "__ops": {
      "people": [],
      "leader": "",
      "rows": [
        {"name": "", "owner": "", "due": "", "result": ""}
      ]
    }
  },
  "savedAt": ""
}
```

Backend tương lai cần: tạo mã nhiệm vụ, vai trò chủ trì/phối hợp, thông báo người nhận, tiến độ đầu việc, minh chứng, xin gia hạn, kiểm tra/duyệt kết thúc, nhật ký, chống gửi trùng, thông báo và phân quyền máy chủ.

### 1.3 Lịch, bình chọn và khảo sát

Trước khi kết nối đồng loạt cần kiểm kê action hiện hành của từng trang và máy chủ; không tự phát minh tên API. Phải xác minh quyền tạo lịch, quyền bình chọn, chính sách ẩn danh, khóa kết quả, giới hạn đối tượng, lưu vết lịch sử và nghiệp vụ đóng khảo sát.

## Kiểm thử tối thiểu trước nghiệm thu

1. Mở sáu trang từ DieuHanh.html (không 404), nút quay lại hoạt động.
2. Nguồn nhân sự VIP: Hội đồng, tổ/bộ phận, nhóm công tác; chọn trọn nhóm và cá nhân không trùng.
3. Trợ lý: tạo phản hồi có trường hợp thiếu dữ liệu và không suy diễn người/giờ; ĐIỀN FORM không phát hành.
4. Tạo nhiều đầu việc, chỉ định người phụ trách; lưu nháp rồi mở lại giữ thông tin.
5. Kiểm tra biểu mẫu thiếu trường bắt buộc và ngày/giờ sai.
6. Dùng trên điện thoại và desktop; không có khối tràn.
7. Từ máy chủ: chỉ sau khi có xác thực, kiểm tra quyền, idempotency, theo dõi và audit mới chuyển sang trạng thái PASS.
