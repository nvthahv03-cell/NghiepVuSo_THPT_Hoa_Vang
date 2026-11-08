/** EDOS Quản trị tra cứu: structural, privacy, mock business and XLSX regression. */
function verify(f){
 const h=f['NVS_QuanTri_TraCuu.html']||'',ct=f['HVA_Admin_Lookup_Controller.js']||'',ex=f['HVA_Admin_Lookup_Export.js']||'',gs=f['backend/HVA_NVS_ADMIN_LOOKUP.gs']||'',hub=f['QuanTri.html']||'';
 const checks=[],test=(name,x)=>checks.push({name,pass:!!x});
 function user(username,role,name){return{username,hoTen:name||username,to:'Toán',chucVu:role}}
 const roster=[user('bgh1','Phó Hiệu trưởng','Lãnh đạo'),user('gv1','Giáo viên','Nguyễn Văn A'),user('gv2','Giáo viên','Nguyễn Văn B'),user('ttcm1','Tổ trưởng chuyên môn','Tổ trưởng'),user('admin1','Nhân viên CNTT','Kỹ thuật')];
 const dtHead=Array.from({length:19},(_,i)=>'C'+i),dt=(u,name)=>{const x=Array(19).fill('');x[1]='DTHT-'+u;x[3]=u;x[4]=name;x[5]='Toán';x[6]='2026-2027';x[7]='TRUE';x[13]='2';x[14]='ĐÃ GỬI';x[15]='08/11/2026';x[18]='CHỜ TIẾP NHẬN';return x};
 const aHead=['RecordId','RequestId','Code','Title','Owner','OwnerName','Team','CreatedAt','Status','BGH','CC_TTCM','PayloadJson','UpdatedAt'];
 const tHead=['RecordId','TaskId','Title','Content','Deadline','Priority','Deliverable','SourceUrl','Assignee','AssigneeName','Assigner','AssignerName','Status','ResultUrl','Note','CreatedAt','UpdatedAt'];
 const tables={NVS_DTHT:[dtHead,dt('gv1','Nguyễn Văn A'),dt('gv2','Nguyễn Văn B')],
  NVS_HO_SO_A22:[aHead,['A22-1','R1','A.2.2','Ma trận kiểm tra','gv1','Nguyễn Văn A','Toán','2026-11-07','Đã tiếp nhận','bgh1','ttcm1','{"schoolYear":"2026-2027"}','2026-11-08']],
  NVS_GIAO_VIEC:[tHead,['TR1','T1','Báo cáo kết quả','Hồ sơ','2026-11-10','Thường','Sản phẩm','','gv1','Nguyễn Văn A','bgh1','Lãnh đạo','Đang thực hiện','','','2026-11-01','2026-11-08']]};
 const audits=[];
 const sheets=name=>tables[name]?{getLastRow:()=>tables[name].length,getLastColumn:()=>tables[name][0].length,getRange:(r,c,n,m)=>({getDisplayValues:()=>tables[name].slice(r-1,r-1+n).map(row=>row.slice(c-1,c-1+m))})}:null;
 const factory=new Function('nvsActor_','nvsGetPeople_','nvsResp_','HVA_CONFIG','SpreadsheetApp','CommonDb','Logger',gs+';return nvsAdminLookupRoute_;');
 function make(auditOn=true){return factory(p=>roster.find(x=>x.username===p.sessionToken)||null,()=>roster,x=>x,{SPREADSHEET_STORAGE_ID:'mock'},
 {openById:()=>({getSheetByName:sheets})},auditOn?{ensureSheet:()=>({appendRow:x=>audits.push(x)})}:null,{log:()=>{}})}
 let route=null;try{route=make()}catch(_){}
 const base={sessionToken:'bgh1',mode:'person',topic:'all',teacherUsername:'gv1',schoolYear:'2026-2027',reason:'Rà soát báo cáo giáo viên'};
 const answer=(action,p)=>route&&route(action,p);
 test('Menu QT5.4 đúng liên kết',hub.includes("['QT5.4','Tra cứu tổng hợp")&&hub.includes('href="./NVS_QuanTri_TraCuu.html"'));
 test('Chỉ được xem sau khi frontend kiểm tra phiên',h.includes('body:not(.lookup-auth-ok) #app')&&h.includes('hvaSessionExpiresAt'));
 test('Giao diện có 2 chế độ tra cứu',h.includes('id="modePerson"')&&h.includes('id="modeTopic"'));
 test('Giao diện có 4 nguồn nghiệp vụ', ['dtht','ktnb','a22','task'].every(x=>h.includes('<option value="'+x+'">')));
 test('Lọc theo người, năm học, tổ và từ khóa', ['personQuery','schoolYear','team','keyword','topic'].every(x=>h.includes('id="'+x+'"')));
 test('Có trường mục đích tra cứu bắt buộc',h.includes('id="reason"')&&h.includes('required'));
 test('Có đủ nút xuất Excel, CSV, PDF', ['exportXlsx','exportCsv','exportPdf'].every(x=>h.includes('id="'+x+'"')));
 test('Nút xuất mặc định khóa', ['exportXlsx','exportCsv','exportPdf'].every(x=>new RegExp('id="'+x+'"[^>]* disabled').test(h)));
 test('Xử lý kết quả bằng textContent, không render HTML',ct.includes('.textContent')&&!ct.includes('innerHTML'));
 test('Không có danh sách giáo viên hardcode',!ct.includes('Nguyễn Văn A')&&!h.includes('Nguyễn Văn A'));
 test('Backend chỉ định nguồn cho phép, không nhận tên sheet tùy ý',gs.includes('nvsAdminLookupSafeSheet_')&&gs.includes('Nguồn dữ liệu không được phép.'));
 test('Backend BGH quyền đọc riêng',gs.includes('Chỉ BGH đã được xác thực'));
 test('Backend không có doPost/doGet ghi đè',!/\bfunction\s+do(?:Post|Get)\s*\(/.test(gs));
 test('Backend có nhật ký truy vấn và xuất',gs.includes("operation==='EXPORT'?'EXPORT':'SEARCH'")&&gs.includes("'ADMIN_LOOKUP'"));
 test('Backend bảo vệ cột hồ sơ A22 và giao việc',gs.includes('NVS_HO_SO_A22:[')&&gs.includes('NVS_GIAO_VIEC:['));
 test('Kiểm tra nội bộ được ghi nguồn chưa kết nối',gs.includes("ktnb:{sheet:null"));
 test('Backend trả capability hợp lệ',answer('nvsAdminLookupCapabilities',{sessionToken:'bgh1'})?.supported===true);
 test('GV/TTCM/quản trị kỹ thuật không đọc chéo', ['gv1','ttcm1','admin1'].every(x=>answer('nvsAdminLookupSearch',{...base,sessionToken:x})?.success===false));
 test('Không cho truy vấn nhân sự thiếu mục đích',answer('nvsAdminLookupPeople',{sessionToken:'bgh1',query:'Nguyễn'})?.success===false);
 const ppl=answer('nvsAdminLookupPeople',{sessionToken:'bgh1',query:'Nguyễn',reason:'Rà soát báo cáo nội bộ'});
 test('Tìm đúng người theo danh sách nhân sự',ppl?.people?.length===2);
 const result=answer('nvsAdminLookupSearch',base);
 test('Tìm đúng GV với 2 hồ sơ có năm học',result?.records?.length===2&&result.records.every(x=>x.username==='gv1'));
 test('Không lẫn tài khoản giáo viên khác',!result?.records?.some(x=>x.username==='gv2'));
 test('Nhóm KTNB chưa kết nối không bị coi là không thực hiện',result?.sources?.some(x=>x.topic==='ktnb'&&x.status==='NOT_CONNECTED'));
 test('Tìm đúng hồ sơ DTHT',result?.records?.some(x=>x.source==='dtht'&&x.recordId==='DTHT-gv1'));
 test('Tìm đúng A22 theo mã',result?.records?.some(x=>x.source==='a22'&&x.recordId==='A22-1'));
 const task=answer('nvsAdminLookupSearch',{sessionToken:'bgh1',mode:'topic',topic:'task',reason:'Rà soát nhiệm vụ công tác'});
 test('Tìm nhiệm vụ từ sheet giao việc',task?.records?.length===1&&task.records[0].username==='gv1');
 const wrongYear=answer('nvsAdminLookupSearch',{...base,schoolYear:'2027-2028'});
 test('Lọc năm học không gán nhầm dữ liệu thiếu năm',wrongYear?.records?.length===0);
 const invalid=answer('nvsAdminLookupSearch',{...base,teacherUsername:'arbitrary'});
 test('Không cho chỉ định giáo viên ngoài danh sách',invalid?.success===false);
 const noConnected=answer('nvsAdminLookupSearch',{sessionToken:'bgh1',mode:'topic',topic:'ktnb',reason:'Kiểm tra nội bộ định kỳ'});
 test('KTNB riêng không trả bản ghi giả',noConnected?.records?.length===0&&noConnected?.sources?.[0]?.status==='NOT_CONNECTED');
 const exported=answer('nvsAdminLookupExport',base);
 test('Xuất phải qua action riêng có Backend xác thực',exported?.success===true&&audits.some(x=>JSON.parse(x[4]).operation==='EXPORT'));
 test('Audit có mục đích và tài khoản truy vấn',audits.every(x=>x[2]==='bgh1'&&JSON.parse(x[4]).reason?.length>=8));
 const failAudit=(()=>{try{return make(false)('nvsAdminLookupSearch',base)}catch(_){return null}})();
 test('Không trả dữ liệu nếu nhật ký không khả dụng',failAudit?.success===false);
 const original=tables.NVS_HO_SO_A22[0];tables.NVS_HO_SO_A22[0]=Array(13).fill('WRONG');
 const errorSchema=answer('nvsAdminLookupSearch',{...base,topic:'a22'});
 tables.NVS_HO_SO_A22[0]=original;
 test('Dữ liệu sai header bị báo lỗi nguồn',errorSchema?.sources?.[0]?.status==='READ_ERROR'&&errorSchema.records.length===0);
 const saved=tables.NVS_DTHT.slice();for(let i=0;i<160;i++)tables.NVS_DTHT.push(dt('gv1','Nguyễn Văn A'));
 const large=answer('nvsAdminLookupSearch',{...base,topic:'dtht'});
 tables.NVS_DTHT=saved;
 test('Kết quả trên 150 bị đánh dấu cắt, không giả đầy đủ',large?.truncated===true&&large.records.length===150&&large.totalFound>150);
 test('Client khóa xuất nếu dữ liệu bị cắt',ct.includes('state.results.truncated')&&ct.includes('result.truncated'));
 test('Client khóa xuất nếu không có nguồn nào CONNECTED',ct.includes("state.results.sources.some(x=>x.status==='CONNECTED')")&&ct.includes("!state.results.sources?.some(x=>x.status==='CONNECTED')"));
 test('Client xuất phải dùng action có audit trên server',ct.includes("api('nvsAdminLookupExport',c)"));
 test('Client in PDF sau khi Backend xác thực',ct.includes("window.print()")&&ct.includes("nvsAdminLookupExport"));
 test('Client chặn xuất khi thiếu Backend',ct.includes('!state.ready||state.busy||!state.results'));
 test('Client khóa điều kiện trong lúc xuất',ct.includes("'modePerson','modeTopic','clear'")&&ct.includes("=state.busy"));
 let scriptPass=true;for(const s of [gs,ct,ex])try{new Function(s)}catch(_){scriptPass=false}
 test('Cú pháp backend, controller, exporter hợp lệ',scriptPass);
 let excel=null,rows=[],csv=null;
 try{
  function FakeEncoder(){}FakeEncoder.prototype.encode=s=>Uint8Array.from(unescape(encodeURIComponent(s)),c=>c.charCodeAt(0));
  const win={};excel=new Function('window','TextEncoder',ex+';return window.HVA_ADMIN_LOOKUP_EXPORT')(win,FakeEncoder);
  rows=excel.dataset([{sourceName:'DTHT',recordId:'DTHT-1',username:'gv1',name:'Nguyễn Văn A',team:'Toán',schoolYear:'2026-2027',title:'=HYPERLINK("bad")',status:'ĐÃ GỬI',updatedAt:'2026-11-08',detail:'bình thường'}],{reason:'Rà soát công việc',exportedAt:'2026-11-08'},[]);
  csv=excel.csv(rows);
 }catch(_){}
 test('XLSX có khả năng sinh dữ liệu hợp lệ',!!excel&&rows.length>15);
 const bytes=excel?.buildXlsx(rows);
 test('File XLSX có chữ ký ZIP chuẩn',bytes?.[0]===0x50&&bytes?.[1]===0x4b&&bytes?.length>2000);
 test('CSV UTF-8 BOM và ngăn Excel formula injection',csv?.startsWith('\uFEFF')&&csv.includes('\'=HYPERLINK'));
 test('XLSX lưu công thức độc hại dưới kiểu inlineStr',!!bytes&&Array.from(bytes).some((x,i)=>x===105&&bytes[i+1]===110&&bytes[i+2]===108&&bytes[i+3]===105));
 let archiveOk=false;try{
  const u16=i=>bytes[i]|bytes[i+1]<<8,u32=i=>(bytes[i]|(bytes[i+1]<<8)|(bytes[i+2]<<16)|(bytes[i+3]<<24))>>>0;
  const decoder=v=>String.fromCharCode(...v);
  const names=[],strings=[];let at=0,guard=0;
  while(u32(at)===0x04034b50&&guard++<10){
    const n=u16(at+26),extra=u16(at+28),size=u32(at+18),name=decoder(bytes.slice(at+30,at+30+n));
    names.push(name);strings.push(decoder(bytes.slice(at+30+n+extra,at+30+n+extra+size)));at+=30+n+extra+size;
  }
  let central=0;while(u32(at)===0x02014b50&&central++<10)at+=46+u16(at+28)+u16(at+30)+u16(at+32);
  archiveOk=names.length===5&&central===5&&u32(at)===0x06054b50&&names.includes('[Content_Types].xml')&&names.includes('xl/worksheets/sheet1.xml')&&strings.some(x=>x.includes('inlineStr'));
 }catch(_){}
 test('ZIP XLSX đúng 5 file, mục lục trung tâm và kết thúc chuẩn',archiveOk);
 test('Trang không nhúng API key bí mật',!/(?:AIza|sk-)[A-Za-z0-9_-]{18,}/.test(h+ct+ex));
 return{pass:checks.every(x=>x.pass),passed:checks.filter(x=>x.pass).length,total:checks.length,failed:checks.filter(x=>!x.pass),checks};
}
module.exports={verify};
if(require.main===module){const fs=require('node:fs'),p=require('node:path');const names=['NVS_QuanTri_TraCuu.html','HVA_Admin_Lookup_Controller.js','HVA_Admin_Lookup_Export.js','backend/HVA_NVS_ADMIN_LOOKUP.gs','QuanTri.html'];const f=Object.fromEntries(names.map(n=>[n,fs.readFileSync(p.join(__dirname,'..',n),'utf8')]));const out=verify(f);console.log(JSON.stringify(out,null,2));process.exitCode=out.pass?0:1;}
