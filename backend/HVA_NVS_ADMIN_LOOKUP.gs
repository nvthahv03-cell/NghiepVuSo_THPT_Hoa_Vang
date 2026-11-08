/**
 * HVA–EDOS / QUẢN TRỊ – TRUNG TÂM TRA CỨU TỔNG HỢP V1
 * Bộ nối Google Apps Script độc lập; không khai báo doGet/doPost.
 * Chỉ đọc dữ liệu nghiệp vụ hiện hữu; GHI nhật ký mỗi truy vấn thành công.
 * Router doPost phải gọi nvsAdminLookupRoute_(action,payload) cho 3 action đã duyệt.
 * Phụ thuộc Backend tổng: nvsActor_, nvsGetPeople_, nvsResp_, HVA_CONFIG,
 * SpreadsheetApp, CommonDb, LockService.
 * Không cho phép client chỉ định sheet/column, không truy xuất file scan hoặc CCCD.
 */
const HVA_ADMIN_LOOKUP_V1_={
  actions:['nvsAdminLookupCapabilities','nvsAdminLookupPeople','nvsAdminLookupSearch','nvsAdminLookupExport'],
  maxResults:150,maxPeople:30,
  sources:{
    dtht:{sheet:'NVS_DTHT',title:'Báo cáo dạy thêm – học thêm'},
    a22:{sheet:'NVS_HO_SO_A22',title:'Hồ sơ nghiệp vụ nhóm A'},
    task:{sheet:'NVS_GIAO_VIEC',title:'Giao việc và báo cáo kết quả'},
    ktnb:{sheet:null,title:'Kiểm tra nội bộ'}
  }
};
function nvsAdminLookupText_(value,max){const v=String(value==null?'':value).trim();if(v.length>(max||200))throw Error('Giá trị truy vấn vượt độ dài cho phép.');return v;}
function nvsAdminLookupNorm_(value){return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim();}
function nvsAdminLookupUsername_(x){return String(x&&x.username||x&&x.userName||x&&x.tenDangNhap||'').trim().toLowerCase();}
function nvsAdminLookupAuth_(p){
  if(typeof nvsActor_!=='function'||typeof nvsGetPeople_!=='function')throw Error('Chưa tích hợp xác thực của Backend EDOS.');
  const actor=nvsActor_(p||{});if(!actor)throw Error('Phiên đăng nhập không hợp lệ hoặc hết hạn.');
  const u=nvsAdminLookupUsername_(actor);
  const roster=nvsGetPeople_();
  if(!u||!Array.isArray(roster))throw Error('Không xác minh được tài khoản và nhân sự.');
  const actual=roster.find(x=>nvsAdminLookupUsername_(x)===u);
  if(!actual)throw Error('Tài khoản không có trong nguồn nhân sự đang công tác.');
  // Chỉ BGH được đọc dữ liệu liên nghiệp vụ ở V1. ADMIN kỹ thuật phải có quyền riêng trên Backend mới được mở rộng.
  const role=nvsAdminLookupNorm_(actual.chucVu||actual.vaiTro||'');
  const manager=/(?:^|\s)(hieu truong|pho hieu truong|hieu pho|ban giam hieu)(?:$|\s)/.test(role);
  if(!manager)throw Error('Chỉ BGH đã được xác thực mới được tra cứu liên nghiệp vụ.');
  return{actor:actual,username:u,roster};
}
function nvsAdminLookupSafeSheet_(name){
  if(!Object.values(HVA_ADMIN_LOOKUP_V1_.sources).some(s=>s.sheet===name))throw Error('Nguồn dữ liệu không được phép.');
  if(typeof HVA_CONFIG==='undefined'||!HVA_CONFIG.SPREADSHEET_STORAGE_ID)throw Error('Chưa cấu hình kho dữ liệu EDOS.');
  const sh=SpreadsheetApp.openById(HVA_CONFIG.SPREADSHEET_STORAGE_ID).getSheetByName(name);
  if(!sh)return null; // Không tự tạo sheet hay coi thiếu sheet là 0 hồ sơ
  const expected={NVS_DTHT:19,NVS_HO_SO_A22:13,NVS_GIAO_VIEC:17};
  if(sh.getLastColumn()<(expected[name]||1))throw Error('Cấu trúc dữ liệu nguồn chưa tương thích.');
  const known={
    NVS_HO_SO_A22:['RecordId','RequestId','Code','Title','Owner','OwnerName','Team','CreatedAt','Status','BGH','CC_TTCM','PayloadJson','UpdatedAt'],
    NVS_GIAO_VIEC:['RecordId','TaskId','Title','Content','Deadline','Priority','Deliverable','SourceUrl','Assignee','AssigneeName','Assigner','AssignerName','Status','ResultUrl','Note','CreatedAt','UpdatedAt']
  };
  if(known[name]){
    const header=sh.getRange(1,1,1,known[name].length).getDisplayValues()[0];
    if(header.join('|')!==known[name].join('|'))throw Error('Tiêu đề cột không đúng hợp đồng nguồn; đã chặn tra cứu để tránh gán nhầm giáo viên.');
  }
  if(sh.getLastRow()<2)return [];
  if(sh.getLastRow()>100000)throw Error('Nguồn dữ liệu vượt ngưỡng đọc an toàn.');
  return sh.getRange(2,1,sh.getLastRow()-1,sh.getLastColumn()).getDisplayValues();
}
function nvsAdminLookupAudit_(username,operation,query,count){
  if(typeof CommonDb==='undefined'||typeof CommonDb.ensureSheet!=='function')throw Error('Nhật ký kiểm toán chưa khả dụng; không trả dữ liệu.');
  const sh=CommonDb.ensureSheet('DB_AuditLog',['Thời gian','Hành động','Người thực hiện','Mã đối tượng','Chi tiết']);
  if(!sh)throw Error('Không ghi được nhật ký tra cứu.');
  const detail={module:'QUAN_TRI_TRA_CUU_V1',operation,mode:query.mode||'',topic:query.topic||'',teacherUsername:query.teacherUsername||'',schoolYear:query.schoolYear||'',keyword:query.keyword||'',reason:query.reason||'',resultCount:count};
  // Không ghi sessionToken, dữ liệu báo cáo hay nội dung cá nhân vào nhật ký
  sh.appendRow([new Date(),'ADMIN_LOOKUP',username,'QUAN_TRI',JSON.stringify(detail)]);
}
function nvsAdminLookupDisplayPerson_(p){return{username:nvsAdminLookupUsername_(p),name:String(p.hoTen||'').slice(0,150),team:String(p.to||p.toBoPhan||'').slice(0,100),role:String(p.chucVu||p.vaiTro||'').slice(0,100)}}
function nvsAdminLookupPeople_(q,access){
  const text=nvsAdminLookupNorm_(nvsAdminLookupText_(q.query,100));
  const reason=nvsAdminLookupText_(q.reason,300);
  if(reason.length<8)throw Error('Chưa nêu đủ mục đích tra cứu nhân sự.');
  if(text.length<2)throw Error('Nhập ít nhất 2 ký tự để tìm giáo viên/nhân viên.');
  const result=access.roster.map(nvsAdminLookupDisplayPerson_).filter(p=>nvsAdminLookupNorm_([p.name,p.username,p.team].join(' ')).includes(text)).slice(0,HVA_ADMIN_LOOKUP_V1_.maxPeople);
  nvsAdminLookupAudit_(access.username,'PEOPLE',{mode:'person',keyword:text,reason},result.length);
  return{success:true,people:result,limit:HVA_ADMIN_LOOKUP_V1_.maxPeople};
}
function nvsAdminLookupCell_(row,i){return String(row[i]==null?'':row[i]).trim()}
function nvsAdminLookupMake_(source,id,username,name,team,schoolYear,title,status,updatedAt,detail){
  return{source,sourceName:HVA_ADMIN_LOOKUP_V1_.sources[source].title,recordId:String(id||''),username:String(username||'').toLowerCase(),name:String(name||''),team:String(team||''),schoolYear:String(schoolYear||''),title:String(title||''),status:String(status||''),updatedAt:String(updatedAt||''),detail:String(detail||'')};
}
function nvsAdminLookupDTHT_(rows){
  return rows.map(row=>{
    const participated=/^(true|1|co|có)$/i.test(nvsAdminLookupCell_(row,7));
    const version=nvsAdminLookupCell_(row,13);
    return nvsAdminLookupMake_('dtht',nvsAdminLookupCell_(row,1),nvsAdminLookupCell_(row,3),nvsAdminLookupCell_(row,4),nvsAdminLookupCell_(row,5),nvsAdminLookupCell_(row,6),
      'Báo cáo DTHT · '+(participated?'Có tham gia theo kê khai':'Không tham gia theo kê khai'),
      nvsAdminLookupCell_(row,18)||nvsAdminLookupCell_(row,14)||'Chưa xác định',
      nvsAdminLookupCell_(row,15)||nvsAdminLookupCell_(row,16),
      'Phiên bản: '+(version||'—')+'; Tình trạng gửi: '+(nvsAdminLookupCell_(row,14)||'—'));
  }).filter(x=>x.username&&x.recordId);
}
function nvsAdminLookupA22_(rows){
  return rows.map(row=>{
    let year='';try{const p=JSON.parse(nvsAdminLookupCell_(row,11));year=String(p.schoolYear||'').slice(0,20)}catch(_){}
    return nvsAdminLookupMake_('a22',nvsAdminLookupCell_(row,0),nvsAdminLookupCell_(row,4),nvsAdminLookupCell_(row,5),
      nvsAdminLookupCell_(row,6),year,nvsAdminLookupCell_(row,2)+' · '+nvsAdminLookupCell_(row,3),nvsAdminLookupCell_(row,8),
      nvsAdminLookupCell_(row,12)||nvsAdminLookupCell_(row,7),'Đã nhận hồ sơ; xem nội dung tại hệ thống phân quyền A22.');
  }).filter(x=>x.username&&x.recordId);
}
function nvsAdminLookupTask_(rows){
  return rows.map(row=>nvsAdminLookupMake_('task',nvsAdminLookupCell_(row,0),nvsAdminLookupCell_(row,8),nvsAdminLookupCell_(row,9),'','',
      nvsAdminLookupCell_(row,2),nvsAdminLookupCell_(row,12),nvsAdminLookupCell_(row,16)||nvsAdminLookupCell_(row,15),
      'Người giao: '+nvsAdminLookupCell_(row,11)+'; hạn: '+nvsAdminLookupCell_(row,4)))
    .filter(x=>x.username&&x.recordId);
}
function nvsAdminLookupSearch_(p,access,operation){
  const mode=nvsAdminLookupText_(p.mode,20),topic=nvsAdminLookupText_(p.topic||'all',20),
      teacherUsername=nvsAdminLookupText_(p.teacherUsername,120).toLowerCase(),
      schoolYear=nvsAdminLookupText_(p.schoolYear,20),
      keyword=nvsAdminLookupNorm_(nvsAdminLookupText_(p.keyword,180)),
      team=nvsAdminLookupNorm_(nvsAdminLookupText_(p.team,100)),
      reason=nvsAdminLookupText_(p.reason,300);
  if(!['person','topic'].includes(mode))throw Error('Chế độ tra cứu không hợp lệ.');
  if(!['all','dtht','ktnb','a22','task'].includes(topic))throw Error('Loại nghiệp vụ không hợp lệ.');
  if(reason.length<8)throw Error('Cần nêu mục đích tra cứu (ít nhất 8 ký tự) để ghi nhận nhật ký.');
  if(schoolYear&&!/^\d{4}[-–]\d{4}$/.test(schoolYear))throw Error('Năm học không hợp lệ.');
  if(mode==='person'&&!teacherUsername)throw Error('Chưa chọn giáo viên/nhân viên trong danh sách đã xác thực.');
  if(mode==='topic'&&topic==='all'&&keyword.length<2&&!teacherUsername)throw Error('Hãy chọn nghiệp vụ hoặc nhập từ khóa ít nhất 2 ký tự.');
  if(teacherUsername&&!access.roster.some(x=>nvsAdminLookupUsername_(x)===teacherUsername))throw Error('Người được tra cứu không thuộc danh sách nhân sự xác thực.');
  const all=Object.keys(HVA_ADMIN_LOOKUP_V1_.sources),keys=topic==='all'?all:[topic],result=[],sources=[];
  for(const key of keys){
    const spec=HVA_ADMIN_LOOKUP_V1_.sources[key];
    if(!spec.sheet){sources.push({topic:key,status:'NOT_CONNECTED',label:spec.title,reason:'Chưa có kho hồ sơ tập trung đã được xác thực.'});continue;}
    try{
      const rows=nvsAdminLookupSafeSheet_(spec.sheet);
      if(rows===null){sources.push({topic:key,status:'NOT_CONNECTED',label:spec.title,reason:'Chưa tìm thấy nguồn dữ liệu đã xác minh.'});continue;}
      const decoded=key==='dtht'?nvsAdminLookupDTHT_(rows):key==='a22'?nvsAdminLookupA22_(rows):nvsAdminLookupTask_(rows);
      sources.push({topic:key,status:'CONNECTED',label:spec.title,reason:'Nguồn dữ liệu đọc được; chưa mặc nhiên chứng minh tính đầy đủ của hồ sơ.'});
      result.push(...decoded);
    }catch(e){sources.push({topic:key,status:'READ_ERROR',label:spec.title,reason:'Không đọc được nguồn dữ liệu: '+String(e.message||e).slice(0,130)});}
  }
  const matched=result.filter(x=>
    (!teacherUsername||x.username===teacherUsername)&&
    (!schoolYear||!!x.schoolYear&&x.schoolYear.replace('–','-')===schoolYear.replace('–','-'))&&
    (!team||nvsAdminLookupNorm_(x.team).includes(team))&&
    (!keyword||nvsAdminLookupNorm_([x.sourceName,x.title,x.detail,x.name,x.team,x.recordId].join(' ')).includes(keyword))
  ).sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt),'vi'));
  // Nhật ký tra cứu phải ghi thành công trước khi trả dữ liệu.
  nvsAdminLookupAudit_(access.username,operation==='EXPORT'?'EXPORT':'SEARCH',{mode,topic,teacherUsername,schoolYear,keyword,team,reason},matched.length);
  return{success:true,records:matched.slice(0,HVA_ADMIN_LOOKUP_V1_.maxResults),totalFound:matched.length,truncated:matched.length>HVA_ADMIN_LOOKUP_V1_.maxResults,sources,serverTime:new Date().toISOString()};
}
function nvsAdminLookupRoute_(action,p){
  try{
    if(!HVA_ADMIN_LOOKUP_V1_.actions.includes(action))throw Error('Action tra cứu không được phép.');
    const access=nvsAdminLookupAuth_(p||{});
    if(action==='nvsAdminLookupCapabilities')return nvsResp_({success:true,supported:true,version:'QT-LOOKUP-1',readOnlyBusinessData:true,auditRequired:true,topics:Object.keys(HVA_ADMIN_LOOKUP_V1_.sources)});
    if(action==='nvsAdminLookupPeople')return nvsResp_(nvsAdminLookupPeople_(p||{},access));
    if(action==='nvsAdminLookupSearch')return nvsResp_(nvsAdminLookupSearch_(p||{},access,'SEARCH'));
    if(action==='nvsAdminLookupExport')return nvsResp_(nvsAdminLookupSearch_(p||{},access,'EXPORT'));
  }catch(e){return nvsResp_({success:false,message:'Tra cứu Quản trị: '+String(e.message||e)})}
}
function testNVS_AdminLookup_ChiDoc(){
 const data={coRoute:typeof nvsAdminLookupRoute_==='function',coXacThuc:typeof nvsActor_==='function',coDanhSachNhanSu:typeof nvsGetPeople_==='function',coNhapKy:typeof CommonDb!=='undefined'&&typeof CommonDb.ensureSheet==='function',soNguon:Object.keys(HVA_ADMIN_LOOKUP_V1_.sources).length,khongGhiHoSoNghiepVu:true};
 Logger.log(JSON.stringify(data));return data;
}
