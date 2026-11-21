/**
 * HVA EDOS V5 — KT01 Lich kiem tra khong tap trung, KH 400/KH-THPTHV.
 * Additive module only. Router wiring described separately. NO doGet/doPost.
 * One shared EDOS_DH_DB spreadsheet; tabs DH_KT01_LICH_KTTT,
 * DH_KT01_LICH_DUYET_TO, DH_KT01_LICH_LOG.
 */
var HVA_KTL_HEADERS_=['ID','Username','Ho ten','To CM','Mon','Lop','Ngay','Buoi','Tiet dau','Tiet cuoi','Hinh thuc','Trang thai','Ma dot','Lan cap nhat','JSON'];
var HVA_KTL_BATCH_HEADERS_=['ID','To CM','Trang thai','TTCM','Ngay gui BGH','BGH','Ngay duyet','Ghi chu','Phien ban','JSON'];
function hvaKTLSh_(){return CommonDb.ensureSheet('DH_KT01_LICH_KTTT',HVA_KTL_HEADERS_);}
function hvaKTLBatchSh_(){return CommonDb.ensureSheet('DH_KT01_LICH_DUYET_TO',HVA_KTL_BATCH_HEADERS_);}

/* KT01 isolated notifications, same EDOS DB; no new Router */
function hvaKTLNoticeSh_(){return CommonDb.ensureSheet('DH_KT01_THONG_BAO',['ID','Loai','To CM','Nguoi gui','Noi dung','Thoi diem','Nguoi da doc','JSON']);}
function hvaKTLPccmSh_(){return CommonDb.ensureSheet('DH_KT01_PCCM_DOT',['To CM','Username GV','Lop','Mon','Bat buoc 1/0']);}
function hvaKTLNoticeRows_(){return hvaKTLRead_(hvaKTLNoticeSh_(),8);}
function hvaKTLNotice_(kind,actor,id,body){
 var key='KT01:'+kind+':'+id,sh=hvaKTLNoticeSh_();
 if(hvaKTLNoticeRows_().some(function(x){return x.data.id===key;}))return;
 var n={id:key,kind:kind,team:actor.team,actor:actor.username,
 title:kind==='SEND_TTCM'?'KT01 – Đăng ký kiểm tra mới':'KT01 – Hồ sơ tổ chờ BGH',
 content:body,createdAt:new Date().toISOString(),readBy:[]};
 sh.appendRow([key,kind,actor.team,actor.username,body,n.createdAt,'',JSON.stringify(n)]);
}
function hvaKTLNoticeAllowed_(n,a){
 return n.kind==='SEND_TTCM'&&a.chief&&hvaKTLNorm_(n.team)===hvaKTLNorm_(a.team)||
 n.kind==='TEAM_SUBMIT'&&a.bgh;
}
function hvaKTLInbox_(a){
 return hvaKTLNoticeRows_().filter(function(x){return hvaKTLNoticeAllowed_(x.data,a);})
 .map(function(x){var n=x.data;return {id:n.id,title:n.title,content:n.content,createdAt:n.createdAt,
 read:(n.readBy||[]).some(function(u){return hvaKTLNorm_(u)===hvaKTLNorm_(a.username);}),
 link:'./KT01_QuanLyDotKiemTraVaThi.html'};})
 .sort(function(a,b){return String(b.createdAt).localeCompare(String(a.createdAt));});
}
function hvaKTLMarkNotice_(a,id){
 var x=hvaKTLNoticeRows_().find(function(y){return y.data.id===id;});
 if(!x||!hvaKTLNoticeAllowed_(x.data,a))throw Error('Thông báo không tồn tại hoặc không được phép.');
 var n=x.data;if(!Array.isArray(n.readBy))n.readBy=[];
 if(!n.readBy.some(function(u){return hvaKTLNorm_(u)===hvaKTLNorm_(a.username);}))n.readBy.push(a.username);
 hvaKTLNoticeSh_().getRange(x.row,1,1,8).setValues([[n.id,n.kind,n.team,n.actor,n.content,n.createdAt,n.readBy.join(','),JSON.stringify(n)]]);
 return {ok:true,success:true,message:'Đã đọc.'};
}
function hvaKTLPccmReview_(team,items){
 var sh=hvaKTLPccmSh_(),n=sh.getLastRow();
 var raw=n>1?sh.getRange(2,1,n-1,5).getValues():[];
 var source=raw.filter(function(x){return hvaKTLNorm_(x[0])===hvaKTLNorm_(team)&&['1','true','x','co'].indexOf(hvaKTLNorm_(x[4]))>=0;});
 var required=[],seen={};source.forEach(function(x){
  var teacher=String(x[1]||'').trim(),cls=String(x[2]||'').trim(),subject=String(x[3]||'').trim();
  if(!teacher||!cls||!subject)return;
  var key=hvaKTLNorm_(cls)+'|'+hvaKTLNorm_(subject);
  if(!seen[key]){required.push({username:teacher,className:cls,subject:subject,key:key});seen[key]=true;}
 });
 if(!required.length)return {ready:false,total:0,submitted:0,missing:[],
 errors:['Chưa có danh mục PCCM được xác nhận tại DH_KT01_PCCM_DOT. Không thể tự xác nhận đã đủ.']};
 var rows=items.map(function(x){return x.data;}).filter(function(x){
 return hvaKTLNorm_(x.team)===hvaKTLNorm_(team)&&x.status==='WAIT_TTCM';});
 var got={};rows.forEach(function(x){got[hvaKTLNorm_(x.className)+'|'+hvaKTLNorm_(x.subject)]=x;});
 var missing=required.filter(function(x){return !got[x.key];}),errors=[];
 required.forEach(function(x){var d=got[x.key];if(d&&hvaKTLNorm_(d.username)!==hvaKTLNorm_(x.username))
 errors.push('GV không khớp PCCM: '+x.className+' – '+x.subject);});
 rows.forEach(function(x){
 var key=hvaKTLNorm_(x.className)+'|'+hvaKTLNorm_(x.subject);
 if(!seen[key])errors.push('Lịch ngoài danh mục PCCM: '+x.className+' – '+x.subject);
 try{hvaKTLTime_(x);}catch(e){errors.push(x.className+' – '+x.subject+': '+String(e.message||e));}
 });
 return {ready:!missing.length&&!errors.length,total:required.length,submitted:required.length-missing.length,
 missing:missing.map(function(x){return x.className+' – '+x.subject+' ('+x.username+')';}),errors:errors};
}

function hvaKTLLog_(action,actor,id,detail){
 CommonDb.ensureSheet('DH_KT01_LICH_LOG',['Ngay gio','Hanh dong','Nguoi thuc hien','ID','Chi tiet'])
 .appendRow([new Date().toISOString(),action,actor.username,id,String(detail||'').slice(0,1000)]);
}
function hvaKTLNorm_(v){return String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').trim().toLowerCase();}
function hvaKTLRoomKey_(v){
 var s=hvaKTLNorm_(v).replace(/\s+/g,' ').trim();
 // Tránh tách P. 01 / P01 / Phòng 01 thành nhiều phòng.
 var m=s.match(/^(?:p\.?|phong|room)\s*0*(\d{1,2})(?:\s*[-–].*)?$/);
 if(m&&Number(m[1])>=1&&Number(m[1])<=17)
  return 'P'+String(Number(m[1])).padStart(2,'0');
 return s.replace(/[.\s_-]/g,'');
}
function hvaKTLRoomDisplay_(v){
 var key=hvaKTLRoomKey_(v);
 return /^P(?:0[1-9]|1[0-7])$/.test(key)?'P. '+key.slice(1):String(v||'').trim();
}
function hvaKTLActor_(p){
 var a=nvsActor_(p||{});
 if(!a||!a.username)throw Error('Phiên EDOS hết hạn hoặc chưa hợp lệ.');
 // Canonical personnel lookup from the V5 backend supplied by the school.
 // Do not use the old PCDK personnel workbook or trust actor roles supplied by client.
 if(typeof hvaTraCuuNhanSuTheoUser_!=='function')throw Error('Backend chưa có tuyến nhân sự chuẩn V5.');
 var x=hvaTraCuuNhanSuTheoUser_(String(a.username||''));
 if(!x||hvaKTLNorm_(x.username||x.tenDangNhap)!==hvaKTLNorm_(a.username))
  throw Error('Không xác định được nhân sự của phiên trên nguồn chuẩn.');
 var role=hvaKTLNorm_([x.viTriViecLam,x.chucVu,x.vaiTro].join(' '));
 return {username:String(x.username),name:String(x.hoTen||''),team:String(x.toBoPhan||''),
  chief:/(^| )(to truong|to truong chuyen mon|ttcm)( |$)/.test(role),
  bgh:/(^| )(pho hieu truong|hieu truong|hieu pho|bgh|pht|ht)( |$)/.test(role)};
}
function hvaKTLRead_(sheet,n){var last=sheet.getLastRow();if(last<=1)return [];
 return sheet.getRange(2,1,last-1,n).getValues().map(function(v,i){try{return {row:i+2,data:JSON.parse(v[n-1])};}catch(_){return null;}}).filter(Boolean);}
function hvaKTLRow_(d){return [d.id,d.username,d.teacher,d.team,d.subject,d.className,d.date,d.session,
 d.start,d.end,d.assessment,d.status,d.batchId||'',d.updatedAt,JSON.stringify(d)];}
function hvaKTLBatchRow_(d){return [d.id,d.team,d.status,d.chief||'',d.submittedAt||'',
 d.approver||'',d.decidedAt||'',d.comment||'',d.version||1,JSON.stringify(d)];}
function hvaKTLFind_(items,id){return items.find(function(x){return x.data.id===id;})||null;}
function hvaKTLTime_(r){
 var d=String(r.date||''),className=String(r.className||'').trim(),
  sub=String(r.subject||'').trim(),ses=String(r.session||'').trim();
 var a=Number(r.start),b=Number(r.end);
 if(!/^20\d\d-\d\d-\d\d$/.test(d)||d<'2026-12-14'||d>'2027-01-05')throw Error('Ngày ngoài khoảng 14/12/2026–05/01/2027.');
 var dt=new Date(d+'T00:00:00Z');if(isNaN(dt.getTime())||dt.toISOString().slice(0,10)!==d)throw Error('Ngày kiểm tra không hợp lệ.');
 if(['2026-12-24','2026-12-25','2027-01-01'].indexOf(d)>=0||dt.getUTCDay()===0)throw Error('Không tổ chức kiểm tra vào ngày nghỉ hoặc ngày 24–25/12.');
 if(!/^(10|11|12)\/(?:[1-9]|[1-9][0-9])$/.test(className))throw Error('Lớp phải đúng dạng 10/3, 11/5 hoặc 12/9.');
 if(['Sáng','Chiều'].indexOf(ses)<0||!Number.isInteger(a)||!Number.isInteger(b)||a<1||b>5||a>b)throw Error('Buổi/tiết không hợp lệ.');
 if(!sub||sub.length>120||!r.assessment||String(r.assessment).length>120)throw Error('Thiếu môn hoặc hình thức kiểm tra.');
 var roomType=String(r.roomType||'CLASSROOM').trim();
 var room=hvaKTLRoomDisplay_(String(r.room||'').trim().replace(/\s+/g,' '));
 if(['CLASSROOM','COMPUTER','LAB','FUNCTION','OUTDOOR'].indexOf(roomType)<0)
  throw Error('Loại địa điểm kiểm tra không hợp lệ.');
 if(!room||room.length>90)throw Error('Bắt buộc nhập phòng/khu vực kiểm tra (tối đa 90 ký tự), kể cả kiểm tra tại lớp.');

 
 if(['ngu van','toan','tieng anh','lich su'].indexOf(hvaKTLNorm_(sub))>=0)
  throw Error('Kế hoạch 400: môn này kiểm tra tập trung cuối kỳ I; không đăng ký lịch không tập trung trong đợt này.');
 var fixed={'2026-12-21':{'Sáng':'12','Chiều':'11'},'2026-12-22':{'Sáng':'10','Chiều':'12'},'2026-12-23':{'Sáng':'11','Chiều':'10'}};
 if(fixed[d]&&fixed[d][ses]===className.split('/')[0])throw Error('Buổi này khối đã kiểm tra tập trung theo Phụ lục III Kế hoạch 400.');
 return {date:d,className:className,subject:sub,session:ses,start:a,end:b,assessment:String(r.assessment).slice(0,120),roomType:roomType,room:room};
}
function hvaKTLClash_(r,items,except){
 // Một lớp – một môn – một đợt KH400: duy nhất một đăng ký,
 // kể cả khi khác ngày/buổi và người đăng ký khác nhau.
 // Đợt này được định nghĩa bởi khung ngày trong hvaKTLTime_.
 // Chỉ bỏ qua chính ID khi sửa, hoặc bản ghi đã huỷ.
 var sameClassSubject=items.map(function(x){return x.data;}).find(function(x){
  return x.id!==except&&x.status!=='CANCELLED'&&x.status!=='RETURNED'
   &&x.className===r.className&&hvaKTLNorm_(x.subject)===hvaKTLNorm_(r.subject);
 });
 if(sameClassSubject)
  throw Error('Lớp '+r.className+' đã đăng ký môn '+r.subject+
   ' trong đợt kiểm tra này (ngày '+sameClassSubject.date+
   ', trạng thái '+sameClassSubject.status+'). Mỗi lớp/môn chỉ đăng ký 01 lần trong một đợt; hãy xem đăng ký đã có.');
 var peers=items.map(function(x){return x.data;}).filter(function(x){
 return x.id!==except&&x.status!=='CANCELLED'&&x.status!=='RETURNED'
 &&x.className===r.className&&x.date===r.date&&x.session===r.session;
 });
 if(peers.some(function(x){return hvaKTLNorm_(x.subject)===hvaKTLNorm_(r.subject);}))
  throw Error('Lớp đã có lịch cùng môn trong buổi này.');
 if((new Set(peers.map(function(x){return hvaKTLNorm_(x.subject);}))).size>=2)
  throw Error('Một lớp không được có quá 02 môn kiểm tra trong một buổi.');
 if(peers.some(function(x){return Number(r.start)<=Number(x.end)&&Number(x.start)<=Number(r.end);}))
  throw Error('Trùng tiết với một môn kiểm tra khác của lớp trong cùng buổi.');
 // Đối chiếu TOÀN TRƯỜNG: một phòng/khu vực không được cấp cho hai lớp trùng tiết.
 var roomKey=hvaKTLRoomKey_(r.room);
 var roomPeers=items.map(function(x){return x.data;}).filter(function(x){
  return x.id!==except&&x.status!=='CANCELLED'&&x.status!=='RETURNED'
    &&x.date===r.date&&x.session===r.session&&x.className!==r.className
    &&hvaKTLRoomKey_(x.room||'')===roomKey
    &&Number(r.start)<=Number(x.end)&&Number(x.start)<=Number(r.end);
 });
 if(roomPeers.length)
  throw Error('Phòng '+r.room+' đã được đăng ký cho lớp '+roomPeers[0].className+
    ' trong cùng buổi và trùng tiết. Hãy chọn phòng hoặc tiết khác.');

}
function hvaKTLList_(action,p){
 var actor=hvaKTLActor_(p),items=hvaKTLRead_(hvaKTLSh_(),15);
 var batches=hvaKTLRead_(hvaKTLBatchSh_(),10);
 if(action==='ktScheduleList'){
  var batchIndex={};batches.forEach(function(x){batchIndex[x.data.id]=x.data;});
  var mine=items.filter(function(x){
   return x.data.username===actor.username ||
    (x.data.status!=='DRAFT'&&(actor.bgh||actor.chief&&hvaKTLNorm_(x.data.team)===hvaKTLNorm_(actor.team)));
  });
  return {ok:true,success:true,items:mine.map(function(x){
   var d=Object.assign({},x.data),b=batchIndex[d.batchId];
   // Server-originated approver details, never trust client-submitted names.
   if(b){d.review={chief:b.chief||'',chiefName:b.chiefName||b.chief||'',
    confirmedAt:b.submittedAt||'',approver:b.approver||'',approverName:b.approverName||b.approver||'',
    approvedAt:b.decidedAt||'',comment:b.comment||'',batchStatus:b.status||''};}
   return d;
  }),inbox:hvaKTLInbox_(actor),pccm:actor.chief?hvaKTLPccmReview_(actor.team,items):null,actor:{username:actor.username,team:actor.team,name:actor.name,chief:actor.chief,bgh:actor.bgh}};
 }
 if(!actor.bgh&&!actor.chief)throw Error('Chỉ TTCM/BGH xem được hồ sơ trình duyệt.');
 var bs=batches.filter(function(x){return actor.bgh||hvaKTLNorm_(x.data.team)===hvaKTLNorm_(actor.team);}).map(function(x){return x.data;});
 return {ok:true,success:true,batches:bs,actor:{username:actor.username,team:actor.team,chief:actor.chief,bgh:actor.bgh}};
}
function hvaKTLPost_(action,p){
 var lock=LockService.getScriptLock();try{
 var actor=hvaKTLActor_(p),now=new Date().toISOString();
 lock.waitLock(20000);
 try{
  var sh=hvaKTLSh_(),items=hvaKTLRead_(sh,15);
  var bh=hvaKTLBatchSh_(),bs=hvaKTLRead_(bh,10);
  var teamKey=hvaKTLNorm_(actor.team);
  if(action==='ktScheduleSave'){
   if(p.notificationReadId)return hvaKTLMarkNotice_(actor,String(p.notificationReadId));
   if(!teamKey)throw Error('Tài khoản chưa có tổ chuyên môn chuẩn.');
   // Stay on the existing Router action; sendId is an explicit transition,
   // not a save that silently forwards a draft to TTCM.
   var sendId=String(p.sendId||'').trim();
   if(sendId){
    var draftHit=hvaKTLFind_(items,sendId);
    if(!draftHit||draftHit.data.username!==actor.username)throw Error('Không tìm thấy bản nháp thuộc tài khoản.');
    if(draftHit.data.status!=='DRAFT')throw Error('Chỉ gửi được lịch đang ở trạng thái bản nháp.');
    if(bs.some(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&['WAIT_BGH','APPROVED'].indexOf(x.data.status)>=0;}))
     throw Error('Tổ đã có lịch trình BGH hoặc đã được duyệt. Cần quy trình điều chỉnh.');
    var checked=hvaKTLTime_(draftHit.data);hvaKTLClash_(checked,items,sendId);
    draftHit.data=Object.assign({},draftHit.data,checked,{status:'WAIT_TTCM',sentAt:now,updatedAt:now});
    sh.getRange(draftHit.row,1,1,15).setValues([hvaKTLRow_(draftHit.data)]);
    hvaKTLLog_('SEND_TTCM',actor,sendId,'Giáo viên gửi lịch cho TTCM tổ '+actor.team);
    hvaKTLNotice_('SEND_TTCM',actor,sendId,'GV '+actor.name+' gửi '+draftHit.data.subject+
     ' – lớp '+draftHit.data.className+' – ngày '+draftHit.data.date+'. Mở KT01 để rà soát.');
    return {ok:true,success:true,item:draftHit.data,message:'Đã gửi lịch cho TTCM '+actor.team+'; chờ TTCM xác nhận.'};
   }
   var raw=p.record||{},id=String(raw.id||'').trim();
   var hit=id?hvaKTLFind_(items,id):null;
   if(id&&!hit)throw Error('Không tìm thấy lịch cần sửa.');
   // Backward compatibility: old WAIT_TTCM rows were sent by the old "Save" button.
   // They remain submitted. Only permit correction if a legacy row has no room.
   var legacyCorrection=!!(hit&&hit.data.status==='WAIT_TTCM'&&!String(hit.data.room||'').trim());
   if(hit&&(hit.data.username!==actor.username||(!legacyCorrection&&hit.data.status!=='DRAFT')))
    throw Error('Lịch đã gửi TTCM hoặc đã duyệt; không được sửa trực tiếp.');
   if(legacyCorrection){
    // Do not allow silent edits of a previously submitted schedule.
    // Only fill its missing room and the room type; other fields stay unchanged.
    var previous=hit.data;
    ['className','subject','date','session','assessment'].forEach(function(k){
     if(String(raw[k]||'').trim()!==String(previous[k]||'').trim())
      throw Error('Lịch này đã gửi TTCM. Chỉ được bổ sung phòng; không được thay đổi '+k+'.');
    });
    if(Number(raw.start)!==Number(previous.start)||Number(raw.end)!==Number(previous.end))
     throw Error('Lịch đã gửi TTCM, không được thay đổi tiết kiểm tra.');
   }
   var v=hvaKTLTime_(raw);hvaKTLClash_(v,items,id);
   var d=Object.assign({},legacyCorrection?hit.data:{},v,{id:id||'KTL-'+Utilities.getUuid(),username:actor.username,
    teacher:actor.name,team:actor.team,status:legacyCorrection?'WAIT_TTCM':'DRAFT',
    batchId:legacyCorrection?(hit.data.batchId||''):'',
    sentAt:legacyCorrection?(hit.data.sentAt||hit.data.updatedAt||now):'',updatedAt:now});
   if(bs.some(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&['WAIT_BGH','APPROVED'].indexOf(x.data.status)>=0;}))
    throw Error('Lịch của tổ đã trình BGH hoặc phê duyệt. Cần quy trình yêu cầu điều chỉnh.');
   if(hit)sh.getRange(hit.row,1,1,15).setValues([hvaKTLRow_(d)]);else sh.appendRow(hvaKTLRow_(d));
   hvaKTLLog_(legacyCorrection?'CORRECT_LEGACY':'SAVE_DRAFT',actor,d.id,'');
   return {ok:true,success:true,item:d,message:legacyCorrection?'Đã bổ sung phòng cho lịch cũ đang chờ TTCM.':'Đã lưu bản nháp trên EDOS. Chọn Gửi TTCM khi kiểm tra xong.'};
  }
  if(action==='ktScheduleTeamSubmit'){
   if(!actor.chief||!teamKey)throw Error('Chỉ TTCM được xác nhận lịch tổ.');
   var reason=String(p.completenessNote||'').trim();
   if(!p.confirmComplete||reason.length<10)throw Error('TTCM phải rà danh sách GV, lớp, môn và xác nhận đầy đủ; ghi căn cứ rà soát ít nhất 10 ký tự.');
   var teamRows=items.filter(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&x.data.status==='WAIT_TTCM';});
   if(!teamRows.length)throw Error('Tổ chưa có lịch đăng ký chờ xác nhận.');
   var review=hvaKTLPccmReview_(actor.team,items);
   if(!review.ready)throw Error('Chưa đủ điều kiện gửi BGH. '+
    (review.missing.length?'Thiếu '+review.missing.length+'/'+review.total+': '+review.missing.slice(0,8).join('; ')+'. ':'')+
    review.errors.slice(0,8).join('; '));
   var existing=bs.find(function(x){return hvaKTLNorm_(x.data.team)===teamKey&&['WAIT_BGH','APPROVED'].indexOf(x.data.status)>=0;});
   if(existing)throw Error('Tổ đã có gói lịch đang chờ BGH hoặc đã duyệt.');
   // Recheck all global records before team submission, including provisional registrations.
   teamRows.forEach(function(x){
    // Re-validate persisted data as well, including pre-room-catalog records.
    // A schedule created before mandatory-room rollout must be corrected first.
    try{hvaKTLTime_(x.data);hvaKTLClash_(x.data,items,x.data.id);}
    catch(err){throw Error('Lịch '+x.data.className+' – '+x.data.subject+': '+String(err.message||err));}
   });
   var batch={id:'KTLTO-'+Utilities.getUuid(),team:actor.team,status:'WAIT_BGH',
    chief:actor.username,chiefName:actor.name,submittedAt:now,approver:'',approverName:'',decidedAt:'',comment:'',
    completenessNote:reason,count:teamRows.length,version:1};
   teamRows.forEach(function(x){x.data.status='WAIT_BGH';x.data.batchId=batch.id;x.data.updatedAt=now;sh.getRange(x.row,1,1,15).setValues([hvaKTLRow_(x.data)]);});
   bh.appendRow(hvaKTLBatchRow_(batch));hvaKTLLog_('TEAM_SUBMIT',actor,batch.id,'TTCM: '+actor.name+' | '+reason);
   hvaKTLNotice_('TEAM_SUBMIT',actor,batch.id,'TTCM '+actor.name+' trình BGH '+teamRows.length+
    ' lịch thuộc tổ '+actor.team+'. Mở KT01 để phê duyệt.');
   return {ok:true,success:true,batch:batch,message:'TTCM đã xác nhận và chuyển lịch tổ đến BGH.'};
  }
  if(action==='ktScheduleDecide'){
   if(!actor.bgh)throw Error('Chỉ BGH được quyết định lịch tổ.');
   var bid=String(p.batchId||''),hit=hvaKTLFind_(bs,bid);
   if(!hit||hit.data.status!=='WAIT_BGH')throw Error('Gói lịch không đang chờ BGH.');
   var decision=String(p.decision||''),comment=String(p.comment||'').trim();
   if(['APPROVED','RETURNED'].indexOf(decision)<0)throw Error('Quyết định không hợp lệ.');
   if(decision==='RETURNED'&&comment.length<5)throw Error('BGH cần ghi lý do trả lại.');
   var selected=items.filter(function(x){return x.data.batchId===bid;});
   if(!selected.length)throw Error('Gói lịch không có bản đăng ký.');
   if(decision==='APPROVED')selected.forEach(function(x){
    try{hvaKTLTime_(x.data);hvaKTLClash_(x.data,items,x.data.id);}
    catch(err){throw Error('Lịch '+x.data.className+' – '+x.data.subject+': '+String(err.message||err));}
   });
   hit.data.status=decision;hit.data.approver=actor.username;hit.data.approverName=actor.name;hit.data.decidedAt=now;hit.data.comment=comment;
   bh.getRange(hit.row,1,1,10).setValues([hvaKTLBatchRow_(hit.data)]);
   selected.forEach(function(x){x.data.status=decision==='APPROVED'?'APPROVED':'WAIT_TTCM';x.data.updatedAt=now;
     if(decision!=='APPROVED')x.data.batchId='';
     sh.getRange(x.row,1,1,15).setValues([hvaKTLRow_(x.data)]);
   });
   hvaKTLLog_('BGH_'+decision,actor,bid,'BGH: '+actor.name+' | '+comment);
   return {ok:true,success:true,batch:hit.data,message:decision==='APPROVED'?'BGH đã phê duyệt lịch tổ.':'BGH đã trả lại lịch cho TTCM điều chỉnh.'};
  }
  throw Error('Action KT01 không hợp lệ.');
 }finally{lock.releaseLock();}
 }catch(e){return {ok:false,success:false,message:String(e.message||e)};}
}
function hvaKTLGet_(action,p){
 var d;try{d=hvaKTLList_(action,p);}catch(e){d={ok:false,success:false,message:String(e.message||e)};}
 if(p&&p.callback){
  var cb=String(p.callback);if(!/^[A-Za-z_$][A-Za-z0-9_$]{0,100}$/.test(cb))return hvaJSON_({ok:false,success:false,message:'Callback không hợp lệ.'});
  return ContentService.createTextOutput(cb+'('+JSON.stringify(d).replace(/</g,'\\u003c')+');').setMimeType(ContentService.MimeType.JAVASCRIPT);
 }
 return hvaJSON_(d);
}
function hvaKTLPostDispatch_(action,p){return hvaJSON_(hvaKTLPost_(action,p));}
