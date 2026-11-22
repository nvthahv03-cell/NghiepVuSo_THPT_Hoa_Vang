/**
 * EDOS V5 | 39_NV_TRA_CUU_NHAN_SU.gs
 * Danh bạ nội bộ (chỉ đọc). Đọc cùng Sheet với Cuộc họp, giới hạn trường trả về.
 * Router GET: if(action==='getPersonnelDirectory') return hvaPersonnelDirectoryGet_(params);
 * Không khai báo doGet/doPost. Không trả CCCD, mật khẩu, địa chỉ hoặc lương.
 */
function hvaPersonnelDirectoryGet_(params) {
  const p=params||{},callback=String(p.callback||'');
  if(!/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(callback))
    return hvaJSON_({success:false,message:'Callback không hợp lệ.'});
  let result;
  try {
    const actor=nvsActor_(p);
    if(!actor||!actor.username) {
      result={success:false,message:'Phiên đăng nhập EDOS không hợp lệ hoặc đã hết hạn.'};
    } else {
      const sh=hvaGetSheetNhanSu_();
      if(!sh) throw Error('Không tìm thấy nguồn nhân sự EDOS.');
      const lastCol=sh.getLastColumn(),lastRow=sh.getLastRow();
      const header=lastCol?sh.getRange(6,1,1,lastCol).getDisplayValues()[0]:[];
      const normalize=v=>String(v||'').trim().toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d')
        .replace(/[^a-z0-9]/g,'');
      const cols=header.map(normalize);
      const findCol=(names,patterns=[])=>{
        for(const name of names) {
          const key=normalize(name),i=cols.findIndex(x=>x===key);
          if(i>=0)return i;
        }
        // Chỉ nhận header có dấu hiệu rõ ràng; không đoán dựa vào vị trí cột.
        return cols.findIndex(x=>patterns.some(re=>re.test(x)));
      };
      const birthdayCol=findCol(
        ['Ngày tháng năm sinh','Ngày sinh','Ngày, tháng, năm sinh','Ngày/tháng/năm sinh','NgayThangNamSinh','NgaySinh','Ngày sinh (dd/mm/yyyy)','Ngày tháng năm sinh GV'],
        [/^ngay(?:thang)?namsinh(?:gv)?$/, /^ngaysinh(?:gv|ddmmyyyy)?$/]
      );
      const phoneCol=findCol(
        ['Số điện thoại','Điện thoại','SĐT','Số ĐT','Số điện thoại liên hệ','Điện thoại di động','Điện thoại liên hệ','Số điện thoại cá nhân','SoDienThoai','SĐT cá nhân','Điện thoại GV'],
        [/^(?:so)?dienthoai(?:lienhe|didong|canhan|gv)?$/, /^sdt(?:lienhe|canhan|gv)?$/]
      );
      const extraCol=findCol(['Kiêm nhiệm','Công tác kiêm nhiệm','Nhiệm vụ kiêm nhiệm']);
      const cell=(r,i)=>i>=0?String(r[i]||'').trim():'';
      const norm=v=>String(v||'').trim().toLowerCase().normalize('NFD')
        .replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
      const active=v=>/^(dang lam viec|dang cong tac|active)$/i.test(norm(v));
      const rows=lastRow>=7?sh.getRange(7,1,lastRow-6,lastCol).getDisplayValues():[];
      const byUser=new Map();
      rows.forEach(r=>{
        if(!active(r[6]))return;
        const username=String(r[14]||'').trim();
        if(!username)return;
        const k=username.toLowerCase();
        if(byUser.has(k))return;
        byUser.set(k,{
          username,
          hoTen:String(r[2]||'').trim(),
          // Cột J = Vị trí việc làm; cột Q = Vai trò (GV/TTCM/TPCM...).
          // Chức vụ hiển thị theo vai trò đã được cập nhật tại nguồn nhân sự.
          chucVu:(()=>{
            const position=String(r[9]||'').trim();
            const role=String(r[16]||'').trim().toUpperCase();
            if(role==='TTCM')return 'Tổ trưởng chuyên môn';
            if(role==='TPCM')return 'Tổ phó chuyên môn';
            if(role==='HT')return 'Hiệu trưởng';
            if(role==='PHT')return 'Phó Hiệu trưởng';
            return position||String(r[16]||'').trim();
          })(),
          vaiTro:String(r[16]||'').trim(),
          viTriViecLam:String(r[9]||'').trim(),
          tenTo:String(r[12]||'').trim(),
          monDay:String(r[13]||'').trim(),
          ngaySinh:cell(r,birthdayCol),
          dienThoai:cell(r,phoneCol),
          kiemNhiem:cell(r,extraCol)
        });
      });
      result={success:true,people:[...byUser.values()]};
    }
  }catch(err){
    console.error('HVA_DIRECTORY',String(err&&err.message||err));
    result={success:false,message:'Không thể đọc danh bạ nhân sự.'};
  }
  const json=JSON.stringify(result).replace(/</g,'\\u003c')
    .replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  return ContentService.createTextOutput(callback+'('+json+');')
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}