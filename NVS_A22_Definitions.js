/* HVA EDOS A22 – 22 nghiệp vụ có trường chuyên biệt, không kết nối backend. */
(function(root,factory){'use strict';const value=factory();if(typeof module==='object'&&module.exports)module.exports=value;if(root)root.HVA_A22_DEFS=value;})(typeof window==='undefined'?null:window,function(){'use strict';
const rows=[
  [
    "A.1.3-KH",
    "Kế hoạch bồi dưỡng học sinh giỏi",
    "Lập kế hoạch theo môn, đối tượng, nội dung và tiến độ; không nhập danh sách học sinh nhạy cảm.",
    [
      [
        "monBD",
        "Môn bồi dưỡng",
        "text",
        1
      ],
      [
        "khoiBD",
        "Khối lớp",
        "select",
        1,
        [
          "10",
          "11",
          "12"
        ]
      ],
      [
        "thoiGianBD",
        "Thời gian triển khai",
        "text",
        1
      ],
      [
        "mucTieuBD",
        "Mục tiêu / yêu cầu đạt được",
        "textarea",
        1
      ],
      [
        "noiDungBD",
        "Nội dung, chuyên đề và tiến độ thực hiện",
        "textarea",
        1
      ],
      [
        "phanCongBD",
        "Phân công giảng dạy, phối hợp",
        "textarea",
        0
      ]
    ]
  ],
  [
    "A.1.3-BC",
    "Danh sách và báo cáo đội tuyển học sinh giỏi",
    "Thống kê đội tuyển, quá trình bồi dưỡng và kết quả; không kê khai thông tin cá nhân học sinh tại bản nháp công khai.",
    [
      [
        "tenDoiTuyen",
        "Tên đội tuyển / kỳ thi",
        "text",
        1
      ],
      [
        "monThi",
        "Môn / nội dung thi",
        "text",
        1
      ],
      [
        "soLuongHS",
        "Số học sinh",
        "number",
        1
      ],
      [
        "soBuoiBD",
        "Số buổi bồi dưỡng",
        "number",
        0
      ],
      [
        "ketQuaBD",
        "Kết quả thực hiện và kỳ thi",
        "textarea",
        1
      ],
      [
        "khoKhanBD",
        "Khó khăn và đề xuất",
        "textarea",
        0
      ]
    ]
  ],
  [
    "A.1.4",
    "Thi – Kiểm tra khác, ôn thi và phụ đạo",
    "Lập hồ sơ tổ chức, kế hoạch, báo cáo các hoạt động ôn tập, kiểm tra hoặc phụ đạo.",
    [
      [
        "loaiHoatDong",
        "Loại hoạt động",
        "select",
        1,
        [
          "Ôn thi tốt nghiệp THPT",
          "Phụ đạo học sinh",
          "Kiểm tra khác",
          "Thi thử",
          "Khác"
        ]
      ],
      [
        "monHoc",
        "Môn học",
        "text",
        1
      ],
      [
        "khoiLop",
        "Khối lớp",
        "select",
        1,
        [
          "10",
          "11",
          "12",
          "Nhiều khối"
        ]
      ],
      [
        "ngayDuKien",
        "Ngày dự kiến",
        "date",
        0
      ],
      [
        "noiDungTrienKhai",
        "Nội dung / phương án tổ chức",
        "textarea",
        1
      ],
      [
        "phoiHop",
        "Đơn vị phối hợp",
        "text",
        0
      ]
    ]
  ],
  [
    "A.2.2",
    "Nộp ma trận, bản đặc tả và đề kiểm tra",
    "Hồ sơ đề gồm đủ ma trận, bản đặc tả, đề và đáp án/hướng dẫn chấm; chỉ dùng liên kết được phân quyền.",
    [
      [
        "dotKiemTra",
        "Đợt kiểm tra",
        "text",
        1
      ],
      [
        "monHoc",
        "Môn kiểm tra",
        "text",
        1
      ],
      [
        "khoiLop",
        "Khối lớp",
        "select",
        1,
        [
          "10",
          "11",
          "12"
        ]
      ],
      [
        "hinhThuc",
        "Hình thức đề",
        "select",
        1,
        [
          "Trắc nghiệm",
          "Tự luận",
          "Kết hợp"
        ]
      ],
      [
        "maTranUrl",
        "Liên kết ma trận",
        "url",
        1
      ],
      [
        "dacTaUrl",
        "Liên kết bản đặc tả",
        "url",
        1
      ],
      [
        "deKiemTraUrl",
        "Liên kết đề kiểm tra",
        "url",
        1
      ],
      [
        "dapAnUrl",
        "Liên kết đáp án / hướng dẫn chấm",
        "url",
        1
      ]
    ]
  ],
  [
    "A.2.3",
    "Nộp đề kiểm tra bổ sung, đề kiểm tra lại",
    "Hồ sơ đề bổ sung/kiểm tra lại cần nêu lý do, đối tượng và đủ tài liệu chuyên môn.",
    [
      [
        "lyDoToChuc",
        "Lý do kiểm tra",
        "select",
        1,
        [
          "Kiểm tra bổ sung",
          "Kiểm tra lại",
          "Học sinh vắng có lý do",
          "Khác"
        ]
      ],
      [
        "dotKiemTra",
        "Đợt kiểm tra liên quan",
        "text",
        1
      ],
      [
        "monHoc",
        "Môn kiểm tra",
        "text",
        1
      ],
      [
        "khoiLop",
        "Khối lớp",
        "select",
        1,
        [
          "10",
          "11",
          "12"
        ]
      ],
      [
        "deKiemTraUrl",
        "Liên kết đề",
        "url",
        1
      ],
      [
        "dapAnUrl",
        "Liên kết đáp án / hướng dẫn chấm",
        "url",
        1
      ],
      [
        "maTranUrl",
        "Liên kết ma trận / đặc tả",
        "url",
        0
      ],
      [
        "ngayDeXuat",
        "Ngày dự kiến",
        "date",
        0
      ]
    ]
  ],
  [
    "A.2.4",
    "Báo cáo, đề nghị về kiểm tra, đánh giá",
    "Tổng hợp vụ việc, kết quả và đề xuất giải pháp thuộc công tác kiểm tra, đánh giá.",
    [
      [
        "loaiBaoCao",
        "Loại nội dung",
        "select",
        1,
        [
          "Báo cáo kết quả",
          "Đề nghị điều chỉnh",
          "Báo cáo bất thường",
          "Kiến nghị",
          "Khác"
        ]
      ],
      [
        "dotKiemTra",
        "Đợt kiểm tra / kỳ đánh giá",
        "text",
        1
      ],
      [
        "noiDungVuViec",
        "Nội dung và số liệu liên quan",
        "textarea",
        1
      ],
      [
        "phuongAnXuLy",
        "Đề xuất giải pháp / hướng xử lý",
        "textarea",
        1
      ]
    ]
  ],
  [
    "A.3.1",
    "Nộp liên kết kế hoạch bài dạy",
    "Đăng ký đường dẫn hồ sơ kế hoạch bài dạy theo môn/lớp/tuần; không coi liên kết là đã duyệt.",
    [
      [
        "monHoc",
        "Môn học",
        "text",
        1
      ],
      [
        "khoiLop",
        "Khối lớp",
        "select",
        1,
        [
          "10",
          "11",
          "12",
          "Nhiều khối"
        ]
      ],
      [
        "tuanHoc",
        "Tuần / giai đoạn",
        "text",
        1
      ],
      [
        "tenChuDe",
        "Tên chủ đề / bài học",
        "text",
        1
      ],
      [
        "keHoachUrl",
        "Liên kết kế hoạch bài dạy",
        "url",
        1
      ]
    ]
  ],
  [
    "A.3.2",
    "Báo cáo tiến độ thực hiện chương trình",
    "Đối chiếu tiến độ thực hiện với kế hoạch dạy học, ghi rõ nguyên nhân và điều chỉnh.",
    [
      [
        "monHoc",
        "Môn học",
        "text",
        1
      ],
      [
        "khoiLop",
        "Khối lớp",
        "select",
        1,
        [
          "10",
          "11",
          "12",
          "Nhiều khối"
        ]
      ],
      [
        "giaiDoan",
        "Giai đoạn báo cáo",
        "text",
        1
      ],
      [
        "tietKeHoach",
        "Số tiết theo kế hoạch",
        "number",
        1
      ],
      [
        "tietThucHien",
        "Số tiết đã thực hiện",
        "number",
        1
      ],
      [
        "danhGiaTienDo",
        "Đánh giá tiến độ / chênh lệch",
        "textarea",
        1
      ],
      [
        "bienPhap",
        "Biện pháp khắc phục",
        "textarea",
        0
      ]
    ]
  ],
  [
    "A.3.3",
    "Nộp minh chứng chuyên môn theo yêu cầu",
    "Nêu yêu cầu tiếp nhận và đối chiếu minh chứng với nhiệm vụ được giao.",
    [
      [
        "yeuCauSo",
        "Văn bản / yêu cầu minh chứng",
        "text",
        1
      ],
      [
        "loaiMinhChung",
        "Loại minh chứng",
        "text",
        1
      ],
      [
        "phamVi",
        "Phạm vi / thời gian",
        "text",
        1
      ],
      [
        "minhChungUrl",
        "Liên kết minh chứng",
        "url",
        1
      ],
      [
        "thuyetMinh",
        "Thuyết minh nội dung minh chứng",
        "textarea",
        1
      ]
    ]
  ],
  [
    "A.3.4",
    "Nộp hồ sơ dạy học khác theo yêu cầu",
    "Hồ sơ dạy học ngoài các nhóm đã phân loại, có căn cứ và mô tả rõ.",
    [
      [
        "loaiHoSo",
        "Loại hồ sơ",
        "text",
        1
      ],
      [
        "yeuCauCanCu",
        "Căn cứ / yêu cầu nộp",
        "text",
        1
      ],
      [
        "phamViHoSo",
        "Phạm vi hồ sơ",
        "text",
        1
      ],
      [
        "hoSoUrl",
        "Liên kết hồ sơ",
        "url",
        1
      ],
      [
        "ghiChuHoSo",
        "Ghi chú, thuyết minh",
        "textarea",
        0
      ]
    ]
  ],
  [
    "A.4.1",
    "Nghiên cứu khoa học, kỹ thuật và sáng kiến",
    "Theo dõi nghiên cứu khoa học, sáng kiến và kết quả theo hồ sơ chứng minh.",
    [
      [
        "loaiSanPham",
        "Loại hình",
        "select",
        1,
        [
          "Nghiên cứu khoa học",
          "Sáng kiến",
          "Khoa học kỹ thuật",
          "Bài báo",
          "Khác"
        ]
      ],
      [
        "tenDeTai",
        "Tên đề tài / sáng kiến",
        "text",
        1
      ],
      [
        "capQuanLy",
        "Cấp quản lý / cuộc thi",
        "text",
        0
      ],
      [
        "giaiDoan",
        "Giai đoạn thực hiện",
        "text",
        1
      ],
      [
        "ketQuaNghienCuu",
        "Kết quả / sản phẩm dự kiến",
        "textarea",
        1
      ],
      [
        "sanPhamUrl",
        "Liên kết sản phẩm",
        "url",
        0
      ]
    ]
  ],
  [
    "A.4.2",
    "Giáo viên tham gia và hướng dẫn học sinh tham gia các cuộc thi",
    "Ghi nhận hoạt động tham gia hoặc hướng dẫn thi, có minh chứng kết quả khi được xác nhận.",
    [
      [
        "tenCuocThi",
        "Tên cuộc thi",
        "text",
        1
      ],
      [
        "vaiTro",
        "Vai trò",
        "select",
        1,
        [
          "Giáo viên dự thi",
          "Hướng dẫn học sinh",
          "Phụ trách đội tuyển",
          "Khác"
        ]
      ],
      [
        "capThi",
        "Cấp tổ chức",
        "text",
        1
      ],
      [
        "thoiGianThi",
        "Thời gian / địa điểm",
        "text",
        1
      ],
      [
        "ketQuaThi",
        "Kết quả đã được xác nhận (nếu có)",
        "textarea",
        0
      ],
      [
        "minhChungUrl",
        "Liên kết văn bản / minh chứng",
        "url",
        0
      ]
    ]
  ],
  [
    "A.4.3",
    "Chuyên đề, tham luận và sản phẩm chuyên môn khác",
    "Theo dõi chuyên đề, tham luận và hồ sơ sản phẩm chuyên môn.",
    [
      [
        "loaiHoatDong",
        "Loại hoạt động",
        "select",
        1,
        [
          "Chuyên đề",
          "Tham luận",
          "Sinh hoạt chuyên môn",
          "Sản phẩm chuyên môn khác"
        ]
      ],
      [
        "tenChuyenDe",
        "Tên chuyên đề / tham luận",
        "text",
        1
      ],
      [
        "doiTuong",
        "Đối tượng áp dụng",
        "text",
        1
      ],
      [
        "noiDungChinh",
        "Mục tiêu và nội dung trọng tâm",
        "textarea",
        1
      ],
      [
        "sanPhamUrl",
        "Liên kết tài liệu / sản phẩm",
        "url",
        0
      ]
    ]
  ],
  [
    "A.4.4",
    "Học liệu số và tài nguyên dạy học",
    "Kê khai học liệu, mục đích sử dụng, quyền khai thác và liên kết.",
    [
      [
        "loaiHocLieu",
        "Loại học liệu",
        "select",
        1,
        [
          "Bài giảng số",
          "Giáo án số",
          "Phiếu học tập",
          "Ngân hàng câu hỏi",
          "Video / mô phỏng",
          "Khác"
        ]
      ],
      [
        "monHoc",
        "Môn học",
        "text",
        1
      ],
      [
        "khoiLop",
        "Khối lớp",
        "select",
        1,
        [
          "10",
          "11",
          "12",
          "Nhiều khối"
        ]
      ],
      [
        "chuDe",
        "Tên chủ đề",
        "text",
        1
      ],
      [
        "hocLieuUrl",
        "Liên kết học liệu",
        "url",
        1
      ],
      [
        "quyenSuDung",
        "Quyền sử dụng / nguồn",
        "text",
        1
      ]
    ]
  ],
  [
    "A.5.1",
    "Xin phép nghỉ dạy, nghỉ làm việc, ra ngoài",
    "Đề nghị có thời gian, lý do và phương án bàn giao công việc.",
    [
      [
        "loaiXinPhep",
        "Hình thức xin phép",
        "select",
        1,
        [
          "Nghỉ dạy",
          "Nghỉ làm việc",
          "Ra ngoài trong giờ làm việc",
          "Nghỉ cả ngày",
          "Khác"
        ]
      ],
      [
        "tuNgay",
        "Từ ngày",
        "date",
        1
      ],
      [
        "denNgay",
        "Đến ngày",
        "date",
        1
      ],
      [
        "soTiet",
        "Số tiết / buổi liên quan",
        "number",
        0
      ],
      [
        "lyDo",
        "Lý do xin phép",
        "textarea",
        1
      ],
      [
        "nguoiPhoiHop",
        "Người phối hợp / dạy thay (nếu có)",
        "text",
        0
      ],
      [
        "phuongAnBanGiao",
        "Phương án bàn giao công việc",
        "textarea",
        1
      ]
    ]
  ],
  [
    "A.5.2",
    "Đề nghị đổi tiết, điều chỉnh lịch",
    "Nêu rõ lịch hiện tại, lịch đề nghị, người đổi cùng và xác nhận thống nhất.",
    [
      [
        "loaiDieuChinh",
        "Loại điều chỉnh",
        "select",
        1,
        [
          "Đổi tiết",
          "Đổi ca",
          "Điều chỉnh lịch dạy",
          "Điều chỉnh lịch kiểm tra",
          "Khác"
        ]
      ],
      [
        "ngayCu",
        "Ngày theo lịch hiện tại",
        "date",
        1
      ],
      [
        "tietCu",
        "Tiết / ca hiện tại",
        "text",
        1
      ],
      [
        "ngayMoi",
        "Ngày đề nghị",
        "date",
        1
      ],
      [
        "tietMoi",
        "Tiết / ca đề nghị",
        "text",
        1
      ],
      [
        "nguoiDoi",
        "Giáo viên đổi cùng / phối hợp",
        "text",
        0
      ],
      [
        "daThongNhat",
        "Tình trạng trao đổi với người liên quan",
        "select",
        1,
        [
          "Đã thống nhất",
          "Đang chờ xác nhận",
          "Không áp dụng"
        ]
      ],
      [
        "lyDoDieuChinh",
        "Lý do đề nghị",
        "textarea",
        1
      ]
    ]
  ],
  [
    "A.5.3",
    "Đề nghị công tác, công vụ",
    "Đề xuất nhiệm vụ công tác và phương án bố trí chuyên môn khi vắng trường.",
    [
      [
        "noiDungCongTac",
        "Nội dung công tác",
        "text",
        1
      ],
      [
        "donViNoiDen",
        "Đơn vị / địa điểm công tác",
        "text",
        1
      ],
      [
        "tuNgay",
        "Từ ngày",
        "date",
        1
      ],
      [
        "denNgay",
        "Đến ngày",
        "date",
        1
      ],
      [
        "canCuCongTac",
        "Căn cứ / văn bản mời",
        "text",
        0
      ],
      [
        "phuongAnBanGiao",
        "Phương án bàn giao / dạy thay",
        "textarea",
        1
      ],
      [
        "kinhPhi",
        "Kinh phí dự kiến (nếu có)",
        "text",
        0
      ]
    ]
  ],
  [
    "A.5.4",
    "Đơn, đề nghị khác",
    "Đơn, đề nghị khác chưa có biểu mẫu riêng; cần trình bày đầy đủ đối tượng giải quyết và căn cứ.",
    [
      [
        "loaiDeNghi",
        "Loại đề nghị",
        "text",
        1
      ],
      [
        "nguoiGiaiQuyet",
        "Đơn vị / người có thẩm quyền giải quyết",
        "text",
        1
      ],
      [
        "noiDungDeNghi",
        "Nội dung đề nghị cụ thể",
        "textarea",
        1
      ],
      [
        "canCu",
        "Căn cứ, lý do",
        "textarea",
        1
      ],
      [
        "thoiHan",
        "Thời hạn mong muốn (nếu có)",
        "date",
        0
      ]
    ]
  ],
  [
    "A.6.1",
    "Đăng ký, đề xuất sử dụng thiết bị, đồ dùng dạy học",
    "Đăng ký thiết bị theo số lượng, môn, lớp và thời gian sử dụng.",
    [
      [
        "tenThietBi",
        "Thiết bị / đồ dùng cần sử dụng",
        "text",
        1
      ],
      [
        "soLuong",
        "Số lượng",
        "number",
        1
      ],
      [
        "monHoc",
        "Môn học",
        "text",
        1
      ],
      [
        "lopHoc",
        "Lớp / nhóm",
        "text",
        1
      ],
      [
        "ngaySuDung",
        "Ngày sử dụng",
        "date",
        1
      ],
      [
        "tietHoc",
        "Tiết / ca",
        "text",
        1
      ],
      [
        "yeuCau",
        "Yêu cầu chuẩn bị / bàn giao",
        "textarea",
        0
      ]
    ]
  ],
  [
    "A.6.2",
    "Đăng ký, đề xuất sử dụng phòng bộ môn, phòng Tin học, phòng chức năng",
    "Đăng ký phòng theo thời gian, đối tượng, mục đích và nhu cầu thiết bị.",
    [
      [
        "loaiPhong",
        "Loại phòng",
        "select",
        1,
        [
          "Phòng bộ môn",
          "Phòng Tin học",
          "Phòng thí nghiệm",
          "Phòng chức năng khác"
        ]
      ],
      [
        "ngaySuDung",
        "Ngày sử dụng",
        "date",
        1
      ],
      [
        "tietHoc",
        "Tiết / ca",
        "text",
        1
      ],
      [
        "lopHoc",
        "Lớp / nhóm",
        "text",
        1
      ],
      [
        "mucDich",
        "Mục đích sử dụng",
        "textarea",
        1
      ],
      [
        "soLuongHocSinh",
        "Số học sinh dự kiến",
        "number",
        0
      ],
      [
        "thietBiYeuCau",
        "Yêu cầu thiết bị đi kèm",
        "text",
        0
      ]
    ]
  ],
  [
    "A.6.3",
    "Báo cáo sử dụng thiết bị và phòng học chức năng",
    "Ghi nhận tình trạng sử dụng, bàn giao và sự cố (nếu có).",
    [
      [
        "loaiDoiTuong",
        "Đối tượng báo cáo",
        "select",
        1,
        [
          "Thiết bị dạy học",
          "Phòng bộ môn",
          "Phòng Tin học",
          "Phòng chức năng khác"
        ]
      ],
      [
        "tenPhongThietBi",
        "Tên phòng / thiết bị",
        "text",
        1
      ],
      [
        "thoiGianSuDung",
        "Thời gian sử dụng",
        "text",
        1
      ],
      [
        "soLuot",
        "Số lượt / tiết sử dụng",
        "number",
        0
      ],
      [
        "tinhTrang",
        "Tình trạng sau sử dụng",
        "textarea",
        1
      ],
      [
        "suCo",
        "Sự cố phát sinh (nếu có)",
        "textarea",
        0
      ],
      [
        "kienNghi",
        "Kiến nghị",
        "textarea",
        0
      ]
    ]
  ],
  [
    "A.6.4",
    "Báo hỏng, đề nghị sửa chữa, bổ sung thiết bị",
    "Báo hỏng, xác định mức độ, thời điểm phát hiện và phương án xử lý.",
    [
      [
        "tenThietBi",
        "Tên thiết bị / đồ dùng",
        "text",
        1
      ],
      [
        "maThietBi",
        "Mã tài sản / thiết bị (nếu có)",
        "text",
        0
      ],
      [
        "viTriThietBi",
        "Vị trí / phòng",
        "text",
        1
      ],
      [
        "thoiDiem",
        "Ngày phát hiện",
        "date",
        1
      ],
      [
        "mucDo",
        "Mức độ ảnh hưởng",
        "select",
        1,
        [
          "Nhẹ – sử dụng được",
          "Ảnh hưởng một phần",
          "Không sử dụng được",
          "Nguy cơ mất an toàn"
        ]
      ],
      [
        "moTaHuHong",
        "Mô tả sự cố / nhu cầu bổ sung",
        "textarea",
        1
      ],
      [
        "deXuatXuLy",
        "Đề nghị sửa chữa / thay thế / bổ sung",
        "textarea",
        1
      ],
      [
        "anhMinhChungUrl",
        "Liên kết ảnh / biên bản",
        "url",
        0
      ]
    ]
  ]
];
const definitions=Object.fromEntries(rows.map(([code,title,purpose,fields])=>[code,{code,title,purpose,fields:fields.map(([key,label,type,required,options])=>({key,label,type,required:!!required,options:options||[]}))}]));return Object.freeze(definitions);
});