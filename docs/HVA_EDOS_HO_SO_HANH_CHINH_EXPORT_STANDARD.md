# QUY CHUẨN XUẤT HỒ SƠ HÀNH CHÍNH – HVA–EDOS

**Trạng thái:** Quy chuẩn thiết kế bắt buộc, được chốt ngày 06/11/2026 theo chỉ đạo Ban Giám hiệu Trường THPT Hòa Vang.

## 1. Nguyên tắc xuyên suốt

HVA–EDOS là **hệ thống quản lý hồ sơ điện tử**. Mọi nghiệp vụ có hồ sơ, sổ, biểu mẫu, báo cáo, biên bản, quyết định, thông báo, lịch, thống kê, phiếu theo dõi hoặc kết quả xử lý cần có **đầu ra hồ sơ đúng loại văn bản**, có thể lưu trữ, xuất bản và in khi cần. Không được xem JSON, CSV, ảnh chụp giao diện hoặc nút “In trang” là sản phẩm hành chính hoàn chỉnh.

Không ép dữ liệu kỹ thuật nhạy cảm (token, nhật ký bảo mật thô, dữ liệu riêng tư không được phép công bố) thành hồ sơ phổ biến. Nếu cần cung cấp, chỉ xuất **báo cáo/trích xuất theo phạm vi và thẩm quyền**, có che giấu dữ liệu phù hợp.

## 2. Đầu ra bắt buộc

- **Word (.docx)**: Bản có thể biên tập, đúng thể thức và bố cục, không lệch công thức, bảng biểu.
- **PDF (.pdf)**: Bản cố định để xem, lưu và in, khớp bản Word đã phê duyệt.
- **Bản xem trước A4**: Hiển thị bản hồ sơ đã dàn trang theo mẫu, khác với giao diện nhập liệu.
- **Bản in**: Có ngắt trang, tiêu đề bảng lặp lại khi cần, không in nút bấm, thanh điều hướng hay nhãn kỹ thuật.

Hồ sơ được xuất **theo mẫu đúng nghiệp vụ**: nhật ký công tác, nhật ký trực lãnh đạo, báo cáo, biên bản, phiếu, thông báo, văn bản hành chính, bảng tổng hợp... Không dùng chung một bố cục văn bản tùy tiện cho mọi loại hồ sơ. Với sổ/nhật ký, phải có thể xuất theo **một mục**, **khoảng ngày**, **tháng** hoặc **toàn kỳ** khi phạm vi dữ liệu và quyền cho phép.

## 2A. Phân biệt hồ sơ tạo mới và hồ sơ giấy được số hóa

**Kiểm tra nội bộ là trường hợp ưu tiên số hóa hồ sơ giấy đã lập, ký, ban hành theo quy trình hiện hành**, gồm kế hoạch, biên bản, báo cáo và kết luận kiểm tra. Các tài liệu này không mặc nhiên được EDOS soạn mới hoặc tạo lại Word/PDF từ dữ liệu nhập.

Luồng hồ sơ giấy: **Tiếp nhận văn bản giấy/bản PDF scan → phân loại theo cuộc kiểm tra và loại văn bản → gắn số/ký hiệu, ngày văn bản, người ký, đơn vị, năm học, đợt kiểm tra và mức độ tiếp cận → đối chiếu tính đủ trang, chữ ký, dấu → lưu tệp số hóa nguyên trạng → tra cứu/tải bản PDF/in theo quyền**.

- Lưu bản scan gốc bất biến; nếu cần xử lý nâng chất lượng ảnh hoặc OCR thì lưu **bản phái sinh riêng**, có liên kết và nhật ký, không thay thế bản scan gốc.
- OCR/AI chỉ hỗ trợ nhận dạng dữ liệu và gợi ý phân loại, không tự tạo kết luận, thay đổi nội dung, chữ ký, dấu hay xác nhận giá trị pháp lý của bản sao.
- Không yêu cầu tạo file Word cho hồ sơ scan nếu không có nghiệp vụ biên tập hoặc văn bản mới được người có thẩm quyền cho phép.
- Một **hồ sơ cuộc kiểm tra** có thể gồm nhiều tài liệu giấy được số hóa (kế hoạch, quyết định nếu có, biên bản, báo cáo, kết luận, tài liệu khắc phục...) với danh mục theo dõi mức độ đầy đủ, người phụ trách, thời gian và quyền xem.
- Khi in lại phải là nội dung bản số hóa đúng nguồn; không in giao diện nhập liệu thay cho bản gốc. Bản scan và việc lưu trữ phải thực hiện theo quy định về văn thư, lưu trữ và bảo vệ dữ liệu; không mặc nhiên coi scan là bản điện tử có ký số.
- Các biểu mẫu hay văn bản **phát sinh mới trực tiếp trên EDOS** vẫn phải tuân thủ quy chuẩn kết xuất Word/PDF và quy trình ký, duyệt tương ứng.

**Nguyên tắc chung:** Phân hệ có hồ sơ giấy nguồn thì ưu tiên **số hóa – bảo quản – lập mục lục – tra cứu – in lại**; phân hệ sinh văn bản mới mới cần **kết xuất Word/PDF theo mẫu**. Không ép mọi hồ sơ số hóa phải tạo lại bằng Word.

## 3. Chuẩn trình bày

- Khổ giấy A4; lề trên và dưới 20–25 mm, trái 30–35 mm, phải 15–20 mm.
- Phông **Times New Roman**, mã Unicode; cỡ chữ, giãn dòng, tiêu đề, bảng, trang và cách đánh số theo mẫu tương ứng.
- Áp dụng **Nghị định 30/2020/NĐ-CP** và văn bản hiện hành đối với văn bản hành chính thuộc phạm vi điều chỉnh; với sổ, phiếu, bảng biểu chuyên ngành phải ưu tiên mẫu được cơ quan có thẩm quyền ban hành.
- Quốc hiệu – tiêu ngữ, cơ quan ban hành, số/ký hiệu, địa danh/ngày tháng, tên văn bản, căn cứ, nơi nhận, chữ ký... **chỉ xuất khi mẫu và tính chất văn bản yêu cầu**; không tự chèn vào mọi trang nhật ký.
- Căn cứ pháp lý và nội dung phải được kiểm tra; không tự đặt số văn bản, ngày ký, tên người ký, nội dung kết luận.
- Khi có từ hai trang, áp dụng quy cách đánh số trang theo mẫu hành chính Hòa Vang; bảo đảm bảng không vỡ hàng, tên cột rõ ràng và dễ in trắng đen.

## 4. Dữ liệu, duyệt và tính pháp lý

- Hồ sơ gốc được lưu ở Backend với ID, loại nghiệp vụ, phiên bản, người tạo, thời gian, đơn vị, tình trạng và lịch sử chỉnh sửa.
- AI hỗ trợ tạo **bản dự thảo**, không quyết định nội dung hoặc tự ban hành hồ sơ.
- Quy trình: **Tạo hồ sơ → Biên tập/đối chiếu → Trình duyệt → Phê duyệt → Kết xuất Word/PDF → Lưu trữ/in**. Các bước có thể thay đổi theo từng nghiệp vụ.
- Bản dự thảo phải thể hiện rõ **DỰ THẢO**, không giả mạo văn bản đã ký; bản chính thức chỉ xuất khi đủ điều kiện duyệt. Không tự tạo chữ ký số, dấu, số văn bản hoặc xác nhận phê duyệt.
- Hồ sơ ký số phải sử dụng cơ chế ký số hợp lệ; Word/PDF xuất ra phải thể hiện đúng trạng thái ký/xác thực; không coi hình chữ ký là chữ ký số.
- Minh chứng và tệp âm thanh phải được liên kết phù hợp, bảo vệ dữ liệu cá nhân; đầu ra chia sẻ chỉ chứa thông tin người nhận có quyền xem.

## 5. Thiết kế mô-đun dùng chung

Xây dựng **HVA_DOCUMENT_EXPORT_SERVICE** độc lập, không sửa các phân hệ đã PASS. Hợp đồng gợi ý:

```js
exportDocument({
  documentType,      // nhật ký công tác, nhật ký trực, biên bản, báo cáo...
  recordIds,         // hồ sơ được xác thực từ Backend
  scope,             // từng hồ sơ, khoảng ngày, tháng, toàn kỳ
  templateId,        // mẫu hành chính/chuyên ngành đã duyệt
  outputFormat,      // docx hoặc pdf
  actorSession,      // xác thực phía máy chủ; không đưa token vào URL
  approvedRevision   // phiên bản đã duyệt nếu xuất bản chính thức
})
```

Tuyến này phải kiểm tra quyền, phạm vi dữ liệu, tình trạng duyệt, phiên bản mẫu; trả về tệp tải được và lưu lịch sử kết xuất. Không chạy kết xuất dựa trên dữ liệu tùy ý từ trình duyệt như thể đó là bản chính thức.

## 6. Yêu cầu riêng đối với hai nhật ký

### Nhật ký công tác
Cho phép xuất theo từng cuộc làm việc hoặc sổ tổng hợp theo thời gian; thể hiện ngày/giờ, thành phần phù hợp quyền, nội dung làm việc, kết quả, chỉ đạo/kết luận thực tế, công việc chuyển tiếp, người lập và xác nhận (nếu mẫu yêu cầu). Nội dung xã giao được lược trong bản biên tập; bản gốc liên quan đến khiếu nại hoặc xác minh phải bảo toàn theo quy định.

### Nhật ký trực lãnh đạo
Cho phép xuất theo ca trực, ngày, tuần/tháng; nêu người trực, diễn biến, tình hình, sự việc bất thường, biện pháp xử lý, việc còn tồn, bàn giao và xác nhận theo mẫu. Không tự biến nhật ký thành biên bản kỷ luật hoặc quyết định.

## 7. Tiêu chí nghiệm thu

Một phân hệ có đầu ra hồ sơ **không được công nhận PASS toàn diện** nếu chưa kiểm thử xuất Word/PDF, xem trước và in A4 theo mẫu thực tế (bản nháp và bản đã duyệt, khi có), cùng kiểm thử quyền truy cập, dữ liệu dài, bảng nhiều trang, dấu tiếng Việt và đối chiếu nội dung. Những phân hệ chỉ mới có giao diện hoặc xuất JSON phải ghi rõ **CHƯA HOÀN THÀNH KẾT XUẤT HỒ SƠ**.

**Quy chuẩn này không tự xác nhận rằng chức năng Word/PDF hiện đã được xây dựng hoặc kết nối.**
