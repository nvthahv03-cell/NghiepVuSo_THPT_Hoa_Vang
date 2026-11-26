// EDOS V5 - A1.4 - append-only adjustment records.
function nvA14Route_(action,p){
  const a=nvsActor_(p);
  if(!a)return hvaJSON_({ok:false,success:false,message:'Phiên đăng nhập không hợp lệ.'});
  const year=String(p.namHoc||'2026-2027').trim();
  if(!/^\d{4}-\d{4}$/.test(year)||Number(year.slice(5))!==Number(year.slice(0,4))+1)return hvaJSON_({ok:false,message:'Năm học không hợp lệ.'});
  const u=String(a.username).trim().toLowerCase();
  const base=hvaGetStorageSheet_(HVA_CONFIG.SHEET_DTHT_NAME);
  const rows=base.getLastRow()>1?base.getRange(2,1,base.getLastRow()-1,19).getValues():[];
  const original=rows.find(r=>String(r[3]).trim().toLowerCase()===u&&String(r[6]).trim()===year);
  const headers=['Mã điều chỉnh','Mã hồ sơ gốc','Username','Họ tên','Năm học','Loại báo cáo','Cơ sở','Hiệu lực','Đến ngày','Nội dung','Minh chứng','Thời điểm gửi','Trạng thái','Mã yêu cầu'];
  const lock=LockService.getScriptLock();
  lock.waitLock(20000);
  try{
    const sh=hvaGetStorageSheet_('NVS_DTHT_DIEU_CHINH');
    if(!sh.getLastRow()){sh.appendRow(headers);sh.setFrozenRows(1);}
    if(sh.getRange(1,1,1,headers.length).getDisplayValues()[0].join('|')!==headers.join('|'))throw Error('Sai cấu trúc bảng điều chỉnh.');
    const history=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,headers.length).getDisplayValues().filter(r=>r[2].toLowerCase()===u&&r[4]===year):[];
    if(action==='nvA14ListMine')return hvaJSON_({ok:true,success:true,maHoSo:original?String(original[1]):'',records:history.reverse()});
    if(action!=='nvA14Submit')return hvaJSON_({ok:false,message:'Action không hỗ trợ.'});
    if(!original||!original[1])return hvaJSON_({ok:false,message:'Chưa có hồ sơ DTHT gốc.'});
    const kind=String(p.kind||''),facility=String(p.facility||'').trim(),from=String(p.from||''),to=String(p.to||''),reason=String(p.reason||'').trim(),link=String(p.link||'').trim(),requestId=String(p.requestId||'');
    const kinds=['Thay đổi thông tin dạy thêm','Tạm nghỉ dạy thêm','Tiếp tục dạy thêm','Chấm dứt tham gia dạy thêm','Bổ sung hồ sơ, minh chứng'];
    const dateOk=s=>/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(Date.parse(s))&&new Date(s).toISOString().slice(0,10)===s;
    if(!kinds.includes(kind)||!facility||facility.length>500||!reason||reason.length>10000||!dateOk(from)||!requestId||requestId.length>100|| (to&&(!dateOk(to)||to<from))||(kind!==kinds[1]&&to)||(link&&!/^https:\/\/(drive|docs)\.google\.com\//i.test(link))||(kind===kinds[4]&&!link))return hvaJSON_({ok:false,message:'Dữ liệu báo cáo chưa hợp lệ.'});
    const old=history.find(r=>r[13]===requestId);if(old)return hvaJSON_({ok:true,success:true,recordId:old[0],duplicated:true});
    const id='A14-'+Utilities.getUuid();
    const safe=s=>/^[=+\-@]/.test(s)?"'"+s:s;
    sh.appendRow([id,String(original[1]),u,safe(String(a.hoTen||'')),year,kind,safe(facility),from,to,safe(reason),link,new Date(),'CHỜ BẢN KÝ TAY',safe(requestId)]);
    SpreadsheetApp.flush();
    if(!sh.getRange(sh.getLastRow(),1).getDisplayValue().includes(id))throw Error('Không xác minh được dữ liệu đã lưu.');
    return hvaJSON_({ok:true,success:true,recordId:id,savedToSheet:true,signatureStatus:'CHO_KY_TAY'});
  }finally{lock.releaseLock();}
}
