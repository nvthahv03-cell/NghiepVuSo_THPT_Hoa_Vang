/**
 * HVA NVS A22 – Backend độc lập cho 22 hồ sơ nhóm A.
 * KHÔNG có doPost/doGet; tích hợp vào router Backend tổng sau khi kiểm thử.
 * Cần: nvsActor_, nvsResp_, nvsGetPeople_, hvaGetStorageSheet_, LockService, Utilities.
 * Không ghi khóa API, địa chỉ email, dữ liệu nhân sự vào mã nguồn.
 */
const NVS_A22_RULES_={
  "A.1.1": {
    "required":["loaiBaoCao","noiDungChiTiet"],
    "url":[],
    "fields":["loaiBaoCao","noiDungChiTiet","tuNgay","denNgay"],
    "number":[],
    "date":["tuNgay","denNgay"],
    "select":{"loaiBaoCao":["Báo cáo thực hiện nhiệm vụ được giao","Báo cáo công tác điều động","Báo cáo tập huấn, bồi dưỡng, hội nghị, hội thảo"]}
  },
  "A.1.3-KH": {
    "required": [
      "monBD",
      "khoiBD",
      "thoiGianBD",
      "mucTieuBD",
      "noiDungBD"
    ],
    "url": [],
    "fields": [
      "monBD",
      "khoiBD",
      "thoiGianBD",
      "mucTieuBD",
      "noiDungBD",
      "phanCongBD"
    ],
    "number": [],
    "date": [],
    "select": {
      "khoiBD": [
        "10",
        "11",
        "12"
      ]
    }
  },
  "A.1.3-BC": {
    "required": [
      "tenDoiTuyen",
      "monThi",
      "soLuongHS",
      "ketQuaBD"
    ],
    "url": [],
    "fields": [
      "tenDoiTuyen",
      "monThi",
      "soLuongHS",
      "soBuoiBD",
      "ketQuaBD",
      "khoKhanBD"
    ],
    "number": [
      "soLuongHS",
      "soBuoiBD"
    ],
    "date": [],
    "select": {}
  },
  "A.1.4": {
    "required": [
      "loaiHoatDong",
      "monHoc",
      "khoiLop",
      "noiDungTrienKhai"
    ],
    "url": [],
    "fields": [
      "loaiHoatDong",
      "monHoc",
      "khoiLop",
      "ngayDuKien",
      "noiDungTrienKhai",
      "phoiHop"
    ],
    "number": [],
    "date": [
      "ngayDuKien"
    ],
    "select": {
      "loaiHoatDong": [
        "Ôn thi tốt nghiệp THPT",
        "Phụ đạo học sinh",
        "Kiểm tra khác",
        "Thi thử",
        "Khác"
      ],
      "khoiLop": [
        "10",
        "11",
        "12",
        "Nhiều khối"
      ]
    }
  },
  "A.2.2": {
    "required": [
      "dotKiemTra",
      "monHoc",
      "khoiLop",
      "hinhThuc",
      "maTranUrl",
      "dacTaUrl",
      "deKiemTraUrl",
      "dapAnUrl"
    ],
    "url": [
      "maTranUrl",
      "dacTaUrl",
      "deKiemTraUrl",
      "dapAnUrl"
    ],
    "fields": [
      "dotKiemTra",
      "monHoc",
      "khoiLop",
      "hinhThuc",
      "maTranUrl",
      "dacTaUrl",
      "deKiemTraUrl",
      "dapAnUrl"
    ],
    "number": [],
    "date": [],
    "select": {
      "khoiLop": [
        "10",
        "11",
        "12"
      ],
      "hinhThuc": [
        "Trắc nghiệm",
        "Tự luận",
        "Kết hợp"
      ]
    }
  },
  "A.2.3": {
    "required": [
      "lyDoToChuc",
      "dotKiemTra",
      "monHoc",
      "khoiLop",
      "deKiemTraUrl",
      "dapAnUrl"
    ],
    "url": [
      "deKiemTraUrl",
      "dapAnUrl",
      "maTranUrl"
    ],
    "fields": [
      "lyDoToChuc",
      "dotKiemTra",
      "monHoc",
      "khoiLop",
      "deKiemTraUrl",
      "dapAnUrl",
      "maTranUrl",
      "ngayDeXuat"
    ],
    "number": [],
    "date": [
      "ngayDeXuat"
    ],
    "select": {
      "lyDoToChuc": [
        "Kiểm tra bổ sung",
        "Kiểm tra lại",
        "Học sinh vắng có lý do",
        "Khác"
      ],
      "khoiLop": [
        "10",
        "11",
        "12"
      ]
    }
  },
  "A.2.4": {
    "required": [
      "loaiBaoCao",
      "dotKiemTra",
      "noiDungVuViec",
      "phuongAnXuLy"
    ],
    "url": [],
    "fields": [
      "loaiBaoCao",
      "dotKiemTra",
      "noiDungVuViec",
      "phuongAnXuLy"
    ],
    "number": [],
    "date": [],
    "select": {
      "loaiBaoCao": [
        "Báo cáo kết quả",
        "Đề nghị điều chỉnh",
        "Báo cáo bất thường",
        "Kiến nghị",
        "Khác"
      ]
    }
  },
  "A.3.1": {
    "required": [
      "monHoc",
      "khoiLop",
      "tuanHoc",
      "tenChuDe",
      "keHoachUrl"
    ],
    "url": [
      "keHoachUrl"
    ],
    "fields": [
      "monHoc",
      "khoiLop",
      "tuanHoc",
      "tenChuDe",
      "keHoachUrl"
    ],
    "number": [],
    "date": [],
    "select": {
      "khoiLop": [
        "10",
        "11",
        "12",
        "Nhiều khối"
      ]
    }
  },
  "A.3.2": {
    "required": [
      "monHoc",
      "khoiLop",
      "giaiDoan",
      "tietKeHoach",
      "tietThucHien",
      "danhGiaTienDo"
    ],
    "url": [],
    "fields": [
      "monHoc",
      "khoiLop",
      "giaiDoan",
      "tietKeHoach",
      "tietThucHien",
      "danhGiaTienDo",
      "bienPhap"
    ],
    "number": [
      "tietKeHoach",
      "tietThucHien"
    ],
    "date": [],
    "select": {
      "khoiLop": [
        "10",
        "11",
        "12",
        "Nhiều khối"
      ]
    }
  },
  "A.3.3": {
    "required": [
      "yeuCauSo",
      "loaiMinhChung",
      "phamVi",
      "minhChungUrl",
      "thuyetMinh"
    ],
    "url": [
      "minhChungUrl"
    ],
    "fields": [
      "yeuCauSo",
      "loaiMinhChung",
      "phamVi",
      "minhChungUrl",
      "thuyetMinh"
    ],
    "number": [],
    "date": [],
    "select": {}
  },
  "A.3.4": {
    "required": [
      "loaiHoSo",
      "yeuCauCanCu",
      "phamViHoSo",
      "hoSoUrl"
    ],
    "url": [
      "hoSoUrl"
    ],
    "fields": [
      "loaiHoSo",
      "yeuCauCanCu",
      "phamViHoSo",
      "hoSoUrl",
      "ghiChuHoSo"
    ],
    "number": [],
    "date": [],
    "select": {}
  },
  "A.4.1": {
    "required": [
      "loaiSanPham",
      "tenDeTai",
      "giaiDoan",
      "ketQuaNghienCuu"
    ],
    "url": [
      "sanPhamUrl"
    ],
    "fields": [
      "loaiSanPham",
      "tenDeTai",
      "capQuanLy",
      "giaiDoan",
      "ketQuaNghienCuu",
      "sanPhamUrl"
    ],
    "number": [],
    "date": [],
    "select": {
      "loaiSanPham": [
        "Nghiên cứu khoa học",
        "Sáng kiến",
        "Khoa học kỹ thuật",
        "Bài báo",
        "Khác"
      ]
    }
  },
  "A.4.2": {
    "required": [
      "tenCuocThi",
      "vaiTro",
      "capThi",
      "thoiGianThi"
    ],
    "url": [
      "minhChungUrl"
    ],
    "fields": [
      "tenCuocThi",
      "vaiTro",
      "capThi",
      "thoiGianThi",
      "ketQuaThi",
      "minhChungUrl"
    ],
    "number": [],
    "date": [],
    "select": {
      "vaiTro": [
        "Giáo viên dự thi",
        "Hướng dẫn học sinh",
        "Phụ trách đội tuyển",
        "Khác"
      ]
    }
  },
  "A.4.3": {
    "required": [
      "loaiHoatDong",
      "tenChuyenDe",
      "doiTuong",
      "noiDungChinh"
    ],
    "url": [
      "sanPhamUrl"
    ],
    "fields": [
      "loaiHoatDong",
      "tenChuyenDe",
      "doiTuong",
      "noiDungChinh",
      "sanPhamUrl"
    ],
    "number": [],
    "date": [],
    "select": {
      "loaiHoatDong": [
        "Chuyên đề",
        "Tham luận",
        "Sinh hoạt chuyên môn",
        "Sản phẩm chuyên môn khác"
      ]
    }
  },
  "A.4.4": {
    "required": [
      "loaiHocLieu",
      "monHoc",
      "khoiLop",
      "chuDe",
      "hocLieuUrl",
      "quyenSuDung"
    ],
    "url": [
      "hocLieuUrl"
    ],
    "fields": [
      "loaiHocLieu",
      "monHoc",
      "khoiLop",
      "chuDe",
      "hocLieuUrl",
      "quyenSuDung"
    ],
    "number": [],
    "date": [],
    "select": {
      "loaiHocLieu": [
        "Bài giảng số",
        "Giáo án số",
        "Phiếu học tập",
        "Ngân hàng câu hỏi",
        "Video / mô phỏng",
        "Khác"
      ],
      "khoiLop": [
        "10",
        "11",
        "12",
        "Nhiều khối"
      ]
    }
  },
  "A.5.1": {
    "required": [
      "loaiXinPhep",
      "tuNgay",
      "denNgay",
      "lyDo",
      "phuongAnBanGiao"
    ],
    "url": [],
    "fields": [
      "loaiXinPhep",
      "tuNgay",
      "denNgay",
      "soTiet",
      "lyDo",
      "nguoiPhoiHop",
      "phuongAnBanGiao"
    ],
    "number": [
      "soTiet"
    ],
    "date": [
      "tuNgay",
      "denNgay"
    ],
    "select": {
      "loaiXinPhep": [
        "Nghỉ dạy",
        "Nghỉ làm việc",
        "Ra ngoài trong giờ làm việc",
        "Nghỉ cả ngày",
        "Khác"
      ]
    }
  },
  "A.5.2": {
    "required": [
      "loaiDieuChinh",
      "ngayCu",
      "tietCu",
      "ngayMoi",
      "tietMoi",
      "daThongNhat",
      "lyDoDieuChinh"
    ],
    "url": [],
    "fields": [
      "loaiDieuChinh",
      "ngayCu",
      "tietCu",
      "ngayMoi",
      "tietMoi",
      "nguoiDoi",
      "daThongNhat",
      "lyDoDieuChinh"
    ],
    "number": [],
    "date": [
      "ngayCu",
      "ngayMoi"
    ],
    "select": {
      "loaiDieuChinh": [
        "Đổi tiết",
        "Đổi ca",
        "Điều chỉnh lịch dạy",
        "Điều chỉnh lịch kiểm tra",
        "Khác"
      ],
      "daThongNhat": [
        "Đã thống nhất",
        "Đang chờ xác nhận",
        "Không áp dụng"
      ]
    }
  },
  "A.5.3": {
    "required": [
      "noiDungCongTac",
      "donViNoiDen",
      "tuNgay",
      "denNgay",
      "phuongAnBanGiao"
    ],
    "url": [],
    "fields": [
      "noiDungCongTac",
      "donViNoiDen",
      "tuNgay",
      "denNgay",
      "canCuCongTac",
      "phuongAnBanGiao",
      "kinhPhi"
    ],
    "number": [],
    "date": [
      "tuNgay",
      "denNgay"
    ],
    "select": {}
  },
  "A.5.4": {
    "required": [
      "loaiDeNghi",
      "nguoiGiaiQuyet",
      "noiDungDeNghi",
      "canCu"
    ],
    "url": [],
    "fields": [
      "loaiDeNghi",
      "nguoiGiaiQuyet",
      "noiDungDeNghi",
      "canCu",
      "thoiHan"
    ],
    "number": [],
    "date": [
      "thoiHan"
    ],
    "select": {}
  },
  "A.6.1": {
    "required": [
      "tenThietBi",
      "soLuong",
      "monHoc",
      "lopHoc",
      "ngaySuDung",
      "tietHoc"
    ],
    "url": [],
    "fields": [
      "tenThietBi",
      "soLuong",
      "monHoc",
      "lopHoc",
      "ngaySuDung",
      "tietHoc",
      "yeuCau"
    ],
    "number": [
      "soLuong"
    ],
    "date": [
      "ngaySuDung"
    ],
    "select": {}
  },
  "A.6.2": {
    "required": [
      "loaiPhong",
      "ngaySuDung",
      "tietHoc",
      "lopHoc",
      "mucDich"
    ],
    "url": [],
    "fields": [
      "loaiPhong",
      "ngaySuDung",
      "tietHoc",
      "lopHoc",
      "mucDich",
      "soLuongHocSinh",
      "thietBiYeuCau"
    ],
    "number": [
      "soLuongHocSinh"
    ],
    "date": [
      "ngaySuDung"
    ],
    "select": {
      "loaiPhong": [
        "Phòng bộ môn",
        "Phòng Tin học",
        "Phòng thí nghiệm",
        "Phòng chức năng khác"
      ]
    }
  },
  "A.6.3": {
    "required": [
      "loaiDoiTuong",
      "tenPhongThietBi",
      "thoiGianSuDung",
      "tinhTrang"
    ],
    "url": [],
    "fields": [
      "loaiDoiTuong",
      "tenPhongThietBi",
      "thoiGianSuDung",
      "soLuot",
      "tinhTrang",
      "suCo",
      "kienNghi"
    ],
    "number": [
      "soLuot"
    ],
    "date": [],
    "select": {
      "loaiDoiTuong": [
        "Thiết bị dạy học",
        "Phòng bộ môn",
        "Phòng Tin học",
        "Phòng chức năng khác"
      ]
    }
  },
  "A.6.4": {
    "required": [
      "tenThietBi",
      "viTriThietBi",
      "thoiDiem",
      "mucDo",
      "moTaHuHong",
      "deXuatXuLy"
    ],
    "url": [
      "anhMinhChungUrl"
    ],
    "fields": [
      "tenThietBi",
      "maThietBi",
      "viTriThietBi",
      "thoiDiem",
      "mucDo",
      "moTaHuHong",
      "deXuatXuLy",
      "anhMinhChungUrl"
    ],
    "number": [],
    "date": [
      "thoiDiem"
    ],
    "select": {
      "mucDo": [
        "Nhẹ – sử dụng được",
        "Ảnh hưởng một phần",
        "Không sử dụng được",
        "Nguy cơ mất an toàn"
      ]
    }
  }
};
const NVS_A22_SHEET_='NVS_HO_SO_A22';
const NVS_A22_HEADER_=['RecordId','RequestId','Code','Title','Owner','OwnerName','Team','CreatedAt','Status','BGH','CC_TTCM','PayloadJson','UpdatedAt'];
function nvsA22Norm_(x){return String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim();}
function nvsA22Team_(x){return nvsA22Norm_(x).replace(/^(to|phong|bo phan)\s+/,'').replace(/[^a-z0-9]/g,'');}
function nvsA22User_(p){return String(p&&p.username||'').trim().toLowerCase();}
function nvsA22Plain_(v,n){const s=String(v==null?'':v).trim();if(s.length>(n||5000))throw Error('Dữ liệu vượt độ dài cho phép.');return s;}
function nvsA22Sheet_(){
 const sh=hvaGetStorageSheet_(NVS_A22_SHEET_);
 if(sh.getLastRow()===0){sh.getRange(1,1,1,NVS_A22_HEADER_.length).setValues([NVS_A22_HEADER_]);sh.setFrozenRows(1);}
 else if(sh.getRange(1,1,1,NVS_A22_HEADER_.length).getDisplayValues()[0].join('|')!==NVS_A22_HEADER_.join('|'))throw Error('Sai cấu trúc sheet NVS_HO_SO_A22; dừng để bảo vệ dữ liệu.');
 return sh;
}
function nvsA22Recipients_(actor){
 const people=nvsGetPeople_();
 if(!Array.isArray(people)||!people.length)throw Error('Chưa tải được CSDL nhân sự.');
 const who=nvsA22User_(actor);
 const profile=people.find(p=>nvsA22User_(p)===who);
 if(!profile)throw Error('Tài khoản không thuộc danh sách nhân sự đang công tác.');
 const team=String(profile.to||actor.toBoPhan||'').trim();
 if(!team)throw Error('Chưa xác định tổ/bộ phận của người gửi.');
 const bgh=people.filter(p=>/hieu truong|ban giam hieu|bgh/.test(nvsA22Norm_(p.chucVu||p.vaiTro))).map(p=>nvsA22User_(p)).filter(Boolean);
 const cc=people.filter(p=>nvsA22Team_(p.to)===nvsA22Team_(team)&&/to truong|ttcm|ttvp|truong bo phan/.test(nvsA22Norm_(p.chucVu||p.vaiTro))).map(p=>nvsA22User_(p)).filter(Boolean);
 const unique=a=>[...new Set(a)];
 if(!bgh.length)throw Error('Chưa xác định tài khoản BGH để tiếp nhận.');
 if(!cc.length)throw Error('Chưa xác định TTCM/TTVP của người gửi để đồng nhận.');
 return{owner:who,ownerName:String(profile.hoTen||actor.hoTen||who),team,bgh:unique(bgh),cc:unique(cc)};
}
function nvsA22Validate_(packet,actor){
 const form=packet&&packet.form||{},extras=packet&&packet.extras||{};
 const code=String(form.code||''),rule=Object.prototype.hasOwnProperty.call(NVS_A22_RULES_,code)?NVS_A22_RULES_[code]:null;
 if(!rule)throw Error('Mã nghiệp vụ A không hợp lệ.');
 const requestId=nvsA22Plain_(packet.clientRequestId,100);
 if(!/^[a-zA-Z0-9_-]{12,100}$/.test(requestId))throw Error('Mã gửi hồ sơ không hợp lệ.');
 const title=nvsA22Plain_(form.title,300),schoolYear=nvsA22Plain_(form.schoolYear,20);
 const content=nvsA22Plain_(form.content,12000),result=nvsA22Plain_(form.result,8000),subject=nvsA22Plain_(form.subject,250);
 const evidence=nvsA22Plain_(form.evidence,1500);
 if(!title||!schoolYear)throw Error('Thiếu tiêu đề hoặc năm học.');
 const checkURL=v=>!v||/^https:\/\/[a-z0-9][a-z0-9.-]*(?:\/|[?#:]|$)/i.test(v)&&!/^https:\/\/[^/]+@/.test(v);
 if(evidence&&(!checkURL(evidence)||!/^https:\/\/(?:drive|docs)\.google\.com(?:\/|$)/i.test(evidence)))throw Error('Minh chứng chung phải là liên kết Google Drive/Docs HTTPS.');
 const cleaned={};
 for(const k of rule.fields){
  const v=nvsA22Plain_(extras[k],8000);
  if(rule.required.includes(k)&&!v)throw Error('Thiếu trường nghiệp vụ: '+k);
  if(rule.url.includes(k)&&!checkURL(v))throw Error('Liên kết HTTPS không hợp lệ: '+k);
  cleaned[k]=v;
 }
 for(const k of rule.number){const v=cleaned[k];if(v&&(!/^\d+$/.test(v)||Number(v)>1000000))throw Error('Số lượng không hợp lệ: '+k);}
 for(const k of rule.date){
  const v=cleaned[k];if(v){
   const dt=new Date(v+'T00:00:00Z');
   if(!/^\d{4}-\d{2}-\d{2}$/.test(v)||!Number.isFinite(dt.getTime())||dt.toISOString().slice(0,10)!==v)throw Error('Ngày không hợp lệ: '+k);
  }
 }
 for(const [k,allowed] of Object.entries(rule.select)){if(cleaned[k]&&!allowed.includes(cleaned[k]))throw Error('Giá trị danh mục không hợp lệ: '+k);}
 if(['A.5.1','A.5.3'].includes(code)&&cleaned.tuNgay&&cleaned.denNgay&&cleaned.tuNgay>cleaned.denNgay)throw Error('Ngày kết thúc trước ngày bắt đầu.');
 const data={schema:'HVA-A22-SUBMITTED-1',code,schoolYear,title,content,result,subject,evidence,extras:cleaned,actorUsername:nvsA22User_(actor)};
 const raw=JSON.stringify(data);if(raw.length>30000)throw Error('Hồ sơ vượt giới hạn lưu trữ.');
 return{requestId,code,title,raw};
}
function nvsA22List_(actor,ownOnly){
 const u=nvsA22User_(actor),roster=nvsGetPeople_();
 if(!roster.some(x=>nvsA22User_(x)===u))throw Error('Không có tài khoản trong CSDL nhân sự đang công tác.');
 const sh=nvsA22Sheet_();
 const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,NVS_A22_HEADER_.length).getDisplayValues():[];
 const canSee=r=>r[4].toLowerCase()===u||(!ownOnly&&(r[9].toLowerCase().split(',').includes(u)||r[10].toLowerCase().split(',').includes(u)));
 return{success:true,records:rows.filter(canSee).map(r=>({recordId:r[0],code:r[2],title:r[3],owner:r[5],team:r[6],createdAt:r[7],status:r[8]})).reverse().slice(0,200)};
}
function nvsA22Get_(actor,id){
 const u=nvsA22User_(actor),profile=nvsGetPeople_().find(x=>nvsA22User_(x)===u);
 if(!profile)throw Error('Không tìm thấy tài khoản trong nhân sự đang công tác.');
 const code=nvsA22Plain_(id,100),sh=nvsA22Sheet_();
 const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,NVS_A22_HEADER_.length).getDisplayValues():[];
 const row=rows.find(r=>r[0]===code);
 if(!row)throw Error('Không tìm thấy mã hồ sơ.');
 const has=(csv)=>String(csv||'').toLowerCase().split(',').map(x=>x.trim()).includes(u);
 if(row[4].toLowerCase()!==u&&!has(row[9])&&!has(row[10]))throw Error('Tài khoản không có quyền đọc hồ sơ.');
 return{success:true,recordId:row[0],code:row[2],title:row[3],owner:row[5],team:row[6],createdAt:row[7],status:row[8],form:JSON.parse(row[11])};
}
function nvsA22Route_(action,p){
 try{
  const actor=nvsActor_(p||{});
  if(!actor||!nvsA22User_(actor))return nvsResp_({success:false,message:'Phiên EDOS không hợp lệ hoặc hết hạn.'});
  if(action==='nvsA22List')return nvsResp_(nvsA22List_(actor,false));
  if(action==='nvsA22ListMine')return nvsResp_(nvsA22List_(actor,true));
  if(action==='nvsA22Get')return nvsResp_(nvsA22Get_(actor,p.recordId));
  const recipients=nvsA22Recipients_(actor);
  if(action==='nvsA22Capabilities')return nvsResp_({success:true,supported:true,version:'A22-1',bghCount:recipients.bgh.length,ccCount:recipients.cc.length});
  if(action==='nvsA22Submit'){
   const doc=nvsA22Validate_(p.document||{},actor);
   const lock=LockService.getScriptLock();lock.waitLock(18000);
   try{
    const sh=nvsA22Sheet_();
    const rows=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,NVS_A22_HEADER_.length).getDisplayValues():[];
    const old=rows.find(r=>r[1]===doc.requestId);
    if(old){
      if(old[4]!==recipients.owner)throw Error('Mã yêu cầu đã được sử dụng bởi tài khoản khác.');
      return nvsResp_({success:true,duplicate:true,recordId:old[0],status:old[8],bghCount:recipients.bgh.length,ccCount:recipients.cc.length,notificationStatus:'NOT_CONFIGURED'});
    }
    const recordId='A22-'+Utilities.getUuid(),now=new Date().toISOString();
    const titleSheet=/^[\s]*[=+\-@]/.test(doc.title)?"'"+doc.title:doc.title;
    sh.appendRow([recordId,doc.requestId,doc.code,titleSheet,recipients.owner,recipients.ownerName,recipients.team,now,'Đã tiếp nhận – Chưa phê duyệt',recipients.bgh.join(','),recipients.cc.join(','),doc.raw,now]);
    return nvsResp_({success:true,recordId,status:'Đã tiếp nhận – Chưa phê duyệt',bghCount:recipients.bgh.length,ccCount:recipients.cc.length,notificationStatus:'NOT_CONFIGURED'});
   }finally{lock.releaseLock();}
  }
  return nvsResp_({success:false,message:'Action A22 không hỗ trợ.'});
 }catch(err){return nvsResp_({success:false,message:'A22: '+String(err&&err.message||err)});}
}
/** TEST CHỈ ĐỌC: không tạo sheet, không gửi, không ghi nhân sự. */
function testNVS_A22_CoChe_ChiDoc_(){
 const result={coActor:typeof nvsActor_==='function',coPersonnel:typeof nvsGetPeople_==='function',coStorage:typeof hvaGetStorageSheet_==='function',coRoute:typeof nvsA22Route_==='function',soMau:Object.keys(NVS_A22_RULES_).length,ghiDuLieu:false};
 Logger.log(JSON.stringify(result));return result;
}
