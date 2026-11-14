/**
 * HVA–EDOS V5 | NHẬT KÝ BẢO VỆ (STAGING)
 * Thêm file này cùng dự án V5 SAU kiểm thử, KHÔNG tạo doGet/doPost mới.
 * Gateway hiện hữu: if (/^hvaBv/.test(action)) return hvaBvRoute_(action,payload);
 * Phải đặt tuyến sau login; mọi action Bảo vệ đều xác thực server session.
 * Properties: EDOS_NV_DB_ID, EDOS_BV_USERS (CSV username 3 bảo vệ),
 * EDOS_BV_BGH_USERS (CSV tài khoản BGH), EDOS_BV_BGH_EMAILS (CSV email đã xác nhận),
 * EDOS_BV_REPORT_FOLDER_ID (thư mục Drive, không ghi chung root).
 * Độc lập Nề nếp, không sửa module đã PASS.
 */
const HVA_BV_CFG_ = Object.freeze({
 TZ:'Asia/Ho_Chi_Minh',
 HEADERS:{
  BV_NhatKy:['ID','Thời điểm tạo','Ngày ca','Ca','Loại','Tiêu đề','Nội dung','Lớp/nhóm','Phòng','Người phụ trách','Mức độ','Trạng thái','Người ghi','Thời gian xảy ra','Cần BGH xác nhận','Người xác nhận','Thời điểm xác nhận','Ý kiến BGH','Mã yêu cầu'],
  BV_RaVao:['ID','Thời điểm tạo','Ngày ca','Ca','Đối tượng','Họ tên / mã HS','Lớp','Đơn vị','Mục đích','Người liên hệ','Giờ vào','Giờ ra','Người cho phép','Người ghi','Trạng thái','Mức độ','Mã yêu cầu'],
  BV_BanGiao:['ID','Thời điểm tạo','Ngày ca','Ca giao','Ca nhận','Người giao','Người nhận','Tình trạng cổng, CSVC, an ninh','Việc tồn','Thời điểm xác nhận nhận','Người xác nhận nhận','Trạng thái','Mã yêu cầu'],
  BV_TaiSan:['ID','Thời điểm tạo','Ngày ca','Ca','Tên vật dụng','Địa điểm nhận','Thông tin liên quan','Người giữ','GVCN/người nhận dự kiến','Người đã nhận','Thời điểm nhận','Trạng thái','Người ghi','Mã yêu cầu'],
  BV_Audit:['Thời điểm','Username','Action','ID hồ sơ','Kết quả','Chi tiết'],
  BV_BaoCao:['ID','Ngày báo cáo','Bắt đầu','Kết thúc','Thời điểm tạo','Trạng thái','Tổng hồ sơ','Số bất thường','Số chưa xử lý','URL PDF','Lần gửi','Thời điểm gửi','Người nhận','Lỗi gần nhất']
 }
});
function hvaBvProp_(key){return String(PropertiesService.getScriptProperties().getProperty(key)||'').trim();}
function hvaBvUsers_(key){return hvaBvProp_(key).split(/[;,\n]/).map(x=>x.trim().toLowerCase()).filter(Boolean);}
function hvaBvActor_(p){
 // nvsActor_ là hàm xác thực token do Backend phát hành, không tin client-provided username.
 if(typeof nvsActor_!=='function')throw Error('Thiếu trình xác thực phiên V5.');
 const actor=nvsActor_(p);
 if(!actor||!actor.username)throw Error('Phiên EDOS không hợp lệ hoặc đã hết hạn.');
 return actor;
}
function hvaBvRole_(actor){
 const u=String(actor.username).toLowerCase();
 if(hvaBvUsers_('EDOS_BV_BGH_USERS').includes(u))return 'BGH';
 if(hvaBvUsers_('EDOS_BV_USERS').includes(u))return 'BAOVE';
 return '';
}
function hvaBvSheet_(name,create){
 if(!HVA_BV_CFG_.HEADERS[name])throw Error('Bảng Bảo vệ không hợp lệ.');
 const id=hvaBvProp_('EDOS_NV_DB_ID');
 if(!id)throw Error('Thiếu cấu hình EDOS_NV_DB_ID.');
 const ss=SpreadsheetApp.openById(id);
 let sh=ss.getSheetByName(name),h=HVA_BV_CFG_.HEADERS[name];
 if(!sh){
  if(!create)throw Error('Chưa tồn tại Sheet '+name+'.');
  sh=ss.insertSheet(name);sh.getRange(1,1,1,h.length).setValues([h]);sh.setFrozenRows(1);
 }else{
  const actual=sh.getRange(1,1,1,h.length).getDisplayValues()[0];
  if(actual.join('\u001f')!==h.join('\u001f'))throw Error('Cấu trúc Sheet '+name+' không khớp hợp đồng; không ghi đè.');
 }
 return sh;
}
function hvaBvAudit_(actor,action,id,result,detail){
 try{hvaBvSheet_('BV_Audit',false).appendRow([new Date(),actor.username,action,id,result,JSON.stringify(detail||{}).slice(0,2000)]);}
 catch(e){Logger.log('BV audit: '+e.message);throw Error('Không thể ghi nhật ký kiểm toán: '+e.message);}
}
function hvaBvClean_(v,max){let s=String(v==null?'':v).trim().slice(0,max||1000);return /^[=+@\-\t\r]/.test(s)?"'"+s:s;}
function hvaBvClock_(d){return Utilities.formatDate(d,HVA_BV_CFG_.TZ,'yyyy-MM-dd HH:mm:ss');}
function hvaBvDay_(d){return Utilities.formatDate(d,HVA_BV_CFG_.TZ,'yyyy-MM-dd');}
function hvaBvShift_(d){
 const h=Number(Utilities.formatDate(d,HVA_BV_CFG_.TZ,'H'));
 return h>=6&&h<12?'SANG':h>=12&&h<18?'CHIEU':'DEM';
}
function hvaBvShiftDay_(d){
 const h=Number(Utilities.formatDate(d,HVA_BV_CFG_.TZ,'H'));
 return hvaBvDay_(h<6?new Date(d.getTime()-86400000):d);
}
function hvaBvRows_(name,limit){
 const sh=hvaBvSheet_(name,false),last=sh.getLastRow();
 if(last<2)return [];
 return sh.getRange(Math.max(2,last-(limit||3000)+1),1,Math.min(last-1,limit||3000),HVA_BV_CFG_.HEADERS[name].length).getValues();
}
function hvaBvCreate_(p,actor,role){
 if(role!=='BAOVE')throw Error('Chỉ nhân viên Bảo vệ được ghi nhật ký.');
 const type=String(p.kind||'journal');
 const sheets={journal:'BV_NhatKy',gate:'BV_RaVao',handover:'BV_BanGiao',item:'BV_TaiSan'};
 const table=sheets[type];if(!table)throw Error('Nghiệp vụ không hợp lệ.');
 const d=p.data||{},requestKey=String(p.requestKey||'').trim();
 if(!/^[a-zA-Z0-9_-]{10,100}$/.test(requestKey))throw Error('Thiếu mã yêu cầu chống ghi trùng.');
 const now=new Date(),ca=hvaBvShift_(now),day=hvaBvShiftDay_(now);
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const sh=hvaBvSheet_(table,false),rows=hvaBvRows_(table,5000),lastIdx=HVA_BV_CFG_.HEADERS[table].length-1;
  const dup=rows.find(r=>String(r[lastIdx])===requestKey);
  if(dup)return {success:true,duplicate:true,recordId:String(dup[0])};
  const id='BV-'+Utilities.formatDate(now,HVA_BV_CFG_.TZ,'yyyyMMdd')+'-'+Utilities.getUuid().slice(0,8).toUpperCase();
  let row;
  if(type==='journal'){
   const title=hvaBvClean_(d.title,200),detail=hvaBvClean_(d.detail,6000);
   if(!title||!detail)throw Error('Cần nhập tiêu đề và nội dung.');
   const severity=['THUONG','CHU_Y','KHAN_CAP'].includes(d.severity)?d.severity:'THUONG';
   row=[id,now,day,ca,hvaBvClean_(d.category,80),title,detail,hvaBvClean_(d.group,80),hvaBvClean_(d.room,80),hvaBvClean_(d.inCharge,140),severity,'CHO_BGH',actor.username,hvaBvClean_(d.eventTime,35),true,'','','',requestKey];
  }else if(type==='gate'){
   if(!d.person||!d.purpose)throw Error('Thiếu người ra/vào và mục đích.');
   row=[id,now,day,ca,hvaBvClean_(d.personType,40),hvaBvClean_(d.person,140),hvaBvClean_(d.className,40),hvaBvClean_(d.unit,140),hvaBvClean_(d.purpose,400),hvaBvClean_(d.contact,120),hvaBvClean_(d.inAt,35),hvaBvClean_(d.outAt,35),hvaBvClean_(d.authorizedBy,120),actor.username,'CHO_BGH',d.alert?'CHU_Y':'THUONG',requestKey];
  }else if(type==='handover'){
   if(!d.nextUser||!d.condition)throw Error('Thiếu người nhận ca hoặc tình trạng bàn giao.');
   const target=String(d.nextUser).toLowerCase().trim();
   if(!hvaBvUsers_('EDOS_BV_USERS').includes(target)||target===actor.username.toLowerCase())throw Error('Người nhận ca không hợp lệ.');
   row=[id,now,day,ca,hvaBvClean_(d.nextShift,20),actor.username,target,hvaBvClean_(d.condition,3000),hvaBvClean_(d.pending,3000),'','','CHO_NHAN',requestKey];
  }else{
   if(!d.itemName||!d.location)throw Error('Thiếu tên vật dụng hoặc nơi tiếp nhận.');
   row=[id,now,day,ca,hvaBvClean_(d.itemName,180),hvaBvClean_(d.location,200),hvaBvClean_(d.related,400),actor.username,hvaBvClean_(d.recipient,140),'','','DANG_GIU',actor.username,requestKey];
  }
  sh.appendRow(row);
  hvaBvAudit_(actor,'CREATE_'+type,id,'OK',{sheet:table});
  return {success:true,recordId:id};
 }finally{lock.releaseLock();}
}
function hvaBvFind_(table,id){
 const sh=hvaBvSheet_(table,false),last=sh.getLastRow();
 if(last<2)throw Error('Không tìm thấy hồ sơ.');
 const values=sh.getRange(2,1,last-1,1).getDisplayValues();
 const at=values.findIndex(r=>r[0]===id);
 if(at<0)throw Error('Không tìm thấy hồ sơ.');
 return {sh,row:at+2};
}
function hvaBvConfirm_(p,actor,role){
 const id=String(p.recordId||''),kind=String(p.kind||'journal');
 const tables={journal:'BV_NhatKy',gate:'BV_RaVao',handover:'BV_BanGiao',item:'BV_TaiSan'};
 const table=tables[kind];if(!table)throw Error('Loại hồ sơ không hợp lệ.');
 const lock=LockService.getScriptLock();lock.waitLock(20000);
 try{
  const f=hvaBvFind_(table,id),r=f.sh.getRange(f.row,1,1,HVA_BV_CFG_.HEADERS[table].length).getValues()[0];
  if(kind==='handover'){
   if(role!=='BAOVE'||actor.username.toLowerCase()!==String(r[6]).toLowerCase())throw Error('Chỉ người được giao nhận ca mới xác nhận.');
   if(r[11]!=='CHO_NHAN')throw Error('Bàn giao đã được xác nhận.');
   f.sh.getRange(f.row,10,1,3).setValues([[new Date(),actor.username,'DA_NHAN']]);
  }else{
   if(role!=='BGH')throw Error('Chỉ Ban Giám hiệu có thẩm quyền xác nhận.');
   const note=hvaBvClean_(p.note,1500);
   if(!note)throw Error('Cần có ý kiến xác nhận của BGH.');
   if(kind==='journal')f.sh.getRange(f.row,12,1,7).setValues([['DA_XAC_NHAN',r[12],r[13],r[14],actor.username,new Date(),note]]);
   else if(kind==='gate')f.sh.getRange(f.row,15).setValue('DA_XAC_NHAN');
   else if(kind==='item')f.sh.getRange(f.row,12).setValue('BGH_DA_XAC_NHAN');
  }
  hvaBvAudit_(actor,'CONFIRM_'+kind,id,'OK',{note:hvaBvClean_(p.note,500)});
  return {success:true,recordId:id};
 }finally{lock.releaseLock();}
}
function hvaBvRoute_(action,p){
 try{
  const actor=hvaBvActor_(p),role=hvaBvRole_(actor);
  if(!role)throw Error('Tài khoản chưa được cấp quyền Bảo vệ/BGH.');
  if(action==='hvaBvHealth'){
   const all=Object.keys(HVA_BV_CFG_.HEADERS).every(name=>{try{hvaBvSheet_(name,false);return true;}catch(e){return false;}});
   return hvaJSON_({ok:true,success:true,ready:all,writeEnabled:all&&role==='BAOVE',role,username:actor.username,reportWindow:'06:15–06:30',message:all?'Đã sẵn sàng':'Chưa khởi tạo đủ Sheet hoặc sai tiêu đề'});
  }
  if(action==='hvaBvCreate'){const ret=hvaBvCreate_(p,actor,role);return hvaJSON_(Object.assign({ok:true},ret));}
  if(action==='hvaBvConfirm'){const ret=hvaBvConfirm_(p,actor,role);return hvaJSON_(Object.assign({ok:true},ret));}
  if(action==='hvaBvList'){
   const kind=String(p.kind||'journal'),names={journal:'BV_NhatKy',gate:'BV_RaVao',handover:'BV_BanGiao',item:'BV_TaiSan'};
   const name=names[kind];if(!name)throw Error('Không hợp lệ.');
   const h=HVA_BV_CFG_.HEADERS[name],rows=hvaBvRows_(name,1000);
   const records=rows.filter(r=>role==='BGH'||(kind==='handover'?(r[5]===actor.username||r[6]===actor.username):(r[kind==='journal'?12:kind==='gate'?13:12]===actor.username))).slice(-150).reverse().map(r=>Object.fromEntries(h.map((key,i)=>[key,r[i] instanceof Date?hvaBvClock_(r[i]):r[i]])));
   return hvaJSON_({ok:true,success:true,role,records});
  }
  throw Error('Action Bảo vệ chưa hỗ trợ.');
 }catch(e){return hvaJSON_({ok:false,success:false,message:String(e.message||e)});}
}
function hvaBvSetupStaging_(){
 // Chạy thủ công trên bản sao STAGING đã có bản sao lưu, tuyệt đối không tự chạy khi nạp script.
 Object.keys(HVA_BV_CFG_.HEADERS).forEach(name=>hvaBvSheet_(name,true));
 return 'Đã tạo/kiểm tra 6 tab Bảo vệ trên EDOS_NV_DB_ID';
}
function hvaBvReportDate_(today){
 // Báo cáo chu kỳ 06:00 hôm trước đến 06:00 hôm nay; tiêu đề theo ngày kết thúc.
 return Utilities.formatDate(today,HVA_BV_CFG_.TZ,'yyyy-MM-dd');
}
function hvaBvReportHtml_(date,start,end,rows,alerts,open){
 const esc=x=>String(x==null?'':x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const tr=r=>'<tr><td>'+esc(r[2])+'</td><td>'+esc(r[3])+'</td><td>'+esc(r[5]||r[4])+'</td><td>'+esc(r[6]||'')+'</td><td>'+esc(r[10]||r[11])+'</td></tr>';
 return '<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:Arial,sans-serif;margin:35px;color:#182b40;font-size:11px}h1{text-align:center;font-size:19px}h2{margin-top:21px;font-size:13px}table{border-collapse:collapse;width:100%}th,td{padding:6px;border:1px solid #abbaca;text-align:left;vertical-align:top}th{background:#ebf2f9}.warn{color:#a11;font-weight:bold}</style></head><body><div style="text-align:center">SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG<br><b>TRƯỜNG THPT HÒA VANG</b></div><h1>BÁO CÁO TÌNH HÌNH TRỰC BẢO VỆ HẰNG NGÀY</h1><p><b>Ngày báo cáo:</b> '+esc(date)+'<br><b>Chu kỳ:</b> '+esc(hvaBvClock_(start))+' đến '+esc(hvaBvClock_(end))+'</p><h2>I. TÌNH HÌNH CHUNG</h2><p>Tổng hồ sơ nhật ký: '+rows.length+'. Nội dung bất thường: '+alerts.length+'. Hồ sơ chưa xử lý/xác nhận: '+open.length+'.</p><h2 class="warn">II. NỘI DUNG CẦN BAN GIÁM HIỆU LƯU Ý</h2>'+(alerts.length?'<table><tr><th>Ngày</th><th>Ca</th><th>Tiêu đề</th><th>Nội dung</th><th>Mức độ</th></tr>'+alerts.map(tr).join('')+'</table>':'<p>Không có bản ghi được đánh dấu bất thường trong dữ liệu đã tổng hợp.</p>')+'<h2>III. NHẬT KÝ GHI NHẬN</h2>'+(rows.length?'<table><tr><th>Ngày</th><th>Ca</th><th>Tiêu đề</th><th>Nội dung</th><th>Mức độ</th></tr>'+rows.map(tr).join('')+'</table>':'<p>Không có bản ghi trong kỳ. Cần kiểm tra tính đầy đủ của nhật ký ca.</p>')+'<h2>IV. VIỆC TỒN, CHƯA XÁC NHẬN</h2><p>'+open.length+' nội dung chưa được BGH xác nhận hoặc hoàn tất.</p><p><i>Báo cáo được tổng hợp tự động từ dữ liệu nhập hệ thống; không thay thế xử lý khẩn cấp, xác minh thực tế hoặc chữ ký BGH.</i></p></body></html>';
}
function hvaBvDailyReport_(){
 // Trigger định kỳ 5 phút, chỉ hành động từ 06:15 đến trước 06:30.
 const now=new Date(),hour=Number(Utilities.formatDate(now,HVA_BV_CFG_.TZ,'H')),minute=Number(Utilities.formatDate(now,HVA_BV_CFG_.TZ,'m'));
 if(hour!==6||minute<15||minute>=30)return {skipped:true,reason:'Ngoài khung 06:15–06:30'};
 const lock=LockService.getScriptLock();if(!lock.tryLock(15000))return {skipped:true,reason:'Đang xử lý'};
 try{
  const date=hvaBvReportDate_(now),sh=hvaBvSheet_('BV_BaoCao',false);
  const all=sh.getLastRow()>1?sh.getRange(2,1,sh.getLastRow()-1,14).getValues():[];
  const old=all.find(r=>String(r[1])===date);
  if(old&&old[5]==='DA_GUI')return {skipped:true,reason:'Đã gửi ngày '+date};
  const folderId=hvaBvProp_('EDOS_BV_REPORT_FOLDER_ID'),emails=hvaBvUsers_('EDOS_BV_BGH_EMAILS').filter(x=>/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(x));
  if(!folderId||!emails.length)throw Error('Chưa xác nhận thư mục báo cáo và email BGH.');
  const day=Utilities.formatDate(now,HVA_BV_CFG_.TZ,'yyyy-MM-dd');
  const end=new Date(day+'T06:00:00+07:00');
  const start=new Date(end.getTime()-86400000);
  const inRange=t=>{const x=t instanceof Date?t:new Date(t);return !isNaN(x)&&x>=start&&x<end};
  const records=hvaBvRows_('BV_NhatKy',10000).filter(r=>inRange(r[1]));
  const gate=hvaBvRows_('BV_RaVao',10000).filter(r=>inRange(r[1]));
  const handovers=hvaBvRows_('BV_BanGiao',10000).filter(r=>inRange(r[1]));
  const items=hvaBvRows_('BV_TaiSan',10000).filter(r=>inRange(r[1]));
  const alerts=records.filter(r=>r[10]==='CHU_Y'||r[10]==='KHAN_CAP');
  const gateAlerts=gate.filter(r=>r[15]==='CHU_Y');
  const open=records.filter(r=>r[11]!=='DA_XAC_NHAN');
  const pendingHandover=handovers.filter(r=>r[11]!=='DA_NHAN');
  const pendingItems=items.filter(r=>!['DA_NHAN','BGH_DA_XAC_NHAN'].includes(String(r[11])));
  const extra='<h2>V. TÌNH HÌNH RA/VÀO, BÀN GIAO, TÀI SẢN</h2>'+
    '<p>Khách/học sinh ra vào: '+gate.length+' lượt; bàn giao ca: '+handovers.length+' lượt; vật dụng tiếp nhận: '+items.length+'.</p>'+
    '<p>Bàn giao chưa được nhận: '+pendingHandover.length+'; vật dụng đang giữ: '+pendingItems.length+'; lượt ra/vào cần lưu ý: '+gateAlerts.length+'.</p>'+
    '<h2>VI. TÌNH TRẠNG ĐỦ DỮ LIỆU</h2><p>'+
    ([...new Set(records.map(r=>r[3]))].length<3?'CHƯA ĐỦ NHẬT KÝ CẢ 3 CA; cần BGH kiểm tra.':'Đã có bản ghi từ đủ 3 ca; cần đối chiếu chất lượng nội dung.')+'</p>';
  const html=hvaBvReportHtml_(date,start,end,records,alerts,open).replace('</body>',extra+'</body>');
  // Tạo PDF và lưu trạng thái TRƯỚC khi gửi, để khi lỗi không tạo nhiều báo cáo trùng.
  const folder=DriveApp.getFolderById(folderId);
  const filename='HVA_BAO_CAO_BAO_VE_'+date+'.pdf';
  let files=folder.getFilesByName(filename),file=files.hasNext()?files.next():null;
  if(!file)file=folder.createFile(Utilities.newBlob(html,'text/html',filename+'.html').getAs(MimeType.PDF).setName(filename));
  const url=file.getUrl(),index=old?all.indexOf(old)+2:sh.getLastRow()+1;
  const row=['BV-BC-'+date,date,hvaBvClock_(start),hvaBvClock_(end),now,'CHO_GUI',records.length+gate.length+handovers.length+items.length,alerts.length+gateAlerts.length,open.length+pendingHandover.length+pendingItems.length,url,old?Number(old[10]||0):0,'',emails.join(', '),''];
  if(old)sh.getRange(index,1,1,14).setValues([row]);else sh.appendRow(row);
  const subject='[HVA–EDOS] Báo cáo trực Bảo vệ '+date+(alerts.length?' · CÓ '+alerts.length+' LƯU Ý':'');
  const body='Kính gửi Ban Giám hiệu,\n\nBáo cáo trực Bảo vệ ngày '+date+' (06:00 hôm trước – 06:00 hôm nay).\nTổng hồ sơ: '+(records.length+gate.length+handovers.length+items.length)+'; bất thường: '+(alerts.length+gateAlerts.length)+'; chưa xác nhận: '+(open.length+pendingHandover.length+pendingItems.length)+'.\nPDF: '+url+'\n\nCác sự việc khẩn cấp phải được thông báo ngay, không đợi báo cáo.';
  // MailApp chỉ gửi sau khi được cấu hình email và cấp quyền Gmail trong GAS.
  MailApp.sendEmail({to:emails.join(','),subject,body,attachments:[file.getBlob()],name:'HVA–EDOS | THPT Hòa Vang'});
  sh.getRange(index,6).setValue('DA_GUI');sh.getRange(index,11,1,2).setValues([[row[10]+1,new Date()]]);
  return {success:true,url,reportDate:date,alerts:alerts.length};
 }catch(e){Logger.log('BV REPORT ERROR '+e.stack);throw e;}
 finally{lock.releaseLock();}
}
function hvaBvInstallDailyTriggerStaging_(){
 // Chỉ chạy thủ công sau khi đã kiểm thử email / Drive / lịch / quyền BGH.
 const name='hvaBvDailyReport_';
 if(ScriptApp.getProjectTriggers().some(t=>t.getHandlerFunction()===name))return 'Đã có trigger, không tạo trùng.';
 ScriptApp.newTrigger(name).timeBased().everyMinutes(5).create();
 return 'Đã cài trigger kiểm tra 5 phút/lần; chỉ phát trong cửa sổ 06:15–06:30 (không cam kết phút chính xác).';
}
