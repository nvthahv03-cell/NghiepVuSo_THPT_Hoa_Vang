/** EDOS NVS B/C regression and mock owner-only A22 access. node tests/verify-edos-bc-personal.cjs */
function verify(f){
const n=f['NghiepVu.html']||'',p=f['NVS_TraCuu_CaNhan.html']||'',b=f['backend/HVA_NVS_A22_MODULE.gs']||'',t=f['NVS_GiaoViec_TheoDoi.html']||'',defs=f['NVS_A22_Definitions.js']||'';
const c=[],ck=(name,pass)=>c.push({name,pass:!!pass}),count=(s,re)=>(s.match(re)||[]).length;
ck('NVS có ba tab A/B/C',count(n,/role="tab"/g)===3);
ck('NVS đủ tám mục B',count(n,/data-search="B\.[12]\.[1-4] /g)===8);
ck('Chỉ hai mục B còn chờ nguồn chính thức',count(n,/class="item pending"/g)===2);
ck('B1.1 vẫn chờ TKB',n.includes('class="item pending" data-search="B.1.1'));
ck('B1.3 vẫn chờ lịch coi kiểm tra',n.includes('class="item pending" data-search="B.1.3'));
ck('B1.2 dùng Lịch HVA thật',n.includes('href="./LichCongTac.html"'));
ck('B1.4 dùng Giao việc cá nhân',n.includes('href="./NVS_GiaoViec_TheoDoi.html?view=mine"'));
ck('B2.2 ghi rõ bản thử học liệu',n.includes('Xem không gian học liệu (đang tích hợp)'));
ck('B2.3 dẫn hồ sơ A22 cá nhân',n.includes('href="./NVS_TraCuu_CaNhan.html?view=files"'));
ck('B2.4 dẫn kết quả công việc',n.includes('href="./NVS_TraCuu_CaNhan.html?view=results"'));
ck('C1 dẫn hồ sơ chính chủ',n.includes("if(id==='C.1'){location.href='./NVS_TraCuu_CaNhan.html?view=files';return;}"));
ck('C2 dẫn việc cá nhân',n.includes("if(id==='C.2'){location.href='./NVS_TraCuu_CaNhan.html?view=tasks';return;}"));
ck('C4 giữ ghi chú NQ52 chờ tích hợp',n.includes('id="nvsNQ52Handoff"')&&n.includes('id="nvsCPersonalLink"'));
ck('Trang cá nhân có 3 tab dữ liệu', ['files','tasks','results'].every(v=>p.includes('id="panel-'+v+'"')));
ck('Trang cá nhân yêu cầu phiên EDOS',p.includes("getItem('hvaSessionToken')"));
ck('Trang cá nhân hỏi server hồ sơ chính chủ',p.includes("nvsA22ListMine"));
ck('Trang cá nhân xem chi tiết qua API',p.includes("nvsA22Get")&&p.includes('sessionToken,...args'));
ck('Trang cá nhân chỉ lọc nhiệm vụ view mine',p.includes("nvsTaskList")&&p.includes("filter(x=>x.view==='mine')"));
ck('Kết quả tổng hợp cả hồ sơ và nhiệm vụ',p.includes('id="s-forms"')&&p.includes('id="s-all"'));
ck('Trang cá nhân không xếp loại NQ52',p.includes('Không dùng để kết luận chất lượng')&&p.includes('chưa tổng hợp hoặc xếp loại NQ52'));
ck('Dữ liệu server chỉ render textContent',!p.includes('.innerHTML=')&&p.includes('.textContent='));
ck('Truy vấn thất bại xoá dữ liệu bộ nhớ',p.includes('state.tasks=null')&&p.includes('state.files=null'));
ck('Backend A22 có endpoint listMine',b.includes("if(action==='nvsA22ListMine')return nvsResp_(nvsA22List_(actor,true))"));
ck('Backend A22 có bộ lọc ownOnly',b.includes("const canSee=r=>r[4].toLowerCase()===u||(!ownOnly"));
ck('Backend A22 kiểm tra quyền mở chi tiết',b.includes("throw Error('Tài khoản không có quyền đọc hồ sơ.')"));
ck('GV/NV được đưa vào Việc của tôi',t.includes("(manager()?'create':'mine')"));
let scriptsOk=true;try{new Function(p.match(/<script>([\s\S]*?)<\/script>/)[1]);new Function(b);new Function(defs)}catch(_){scriptsOk=false}ck('JavaScript các phần mới đúng cú pháp',scriptsOk);
let rolePass=false;
try{
 const staff=[{username:'gv1',hoTen:'GV 1',chucVu:'Giáo viên',to:'Toán–Tin'},{username:'ttcm1',hoTen:'TTCM 1',chucVu:'Tổ trưởng chuyên môn',to:'Toán–Tin'},{username:'bgh1',hoTen:'PHT 1',chucVu:'Phó Hiệu trưởng',to:'BGH'}];
 const table=[['RecordId','RequestId','Code','Title','Owner','OwnerName','Team','CreatedAt','Status','BGH','CC_TTCM','PayloadJson','UpdatedAt'],['A22-test','request-123','A.2.2','Hồ sơ kiểm thử','gv1','GV 1','Toán–Tin','2026-11-08','Đã tiếp nhận','bgh1','ttcm1','{}','2026-11-08']];
 const sheet={getLastRow:()=>table.length,getRange:(r,co,rows,cols)=>({getDisplayValues:()=>table.slice(r-1,r-1+rows).map(x=>x.slice(co-1,co-1+cols))})};
 const make=new Function('nvsActor_','nvsResp_','nvsGetPeople_','hvaGetStorageSheet_','LockService','Utilities',b+';return nvsA22Route_;');
 const route=make(x=>staff.find(u=>u.username===x.sessionToken)||null,x=>x,()=>staff,()=>sheet,{getScriptLock:()=>({waitLock(){},releaseLock(){}})},{getUuid:()=> 'mock'});
 const gv=route('nvsA22ListMine',{sessionToken:'gv1'}),tt=route('nvsA22ListMine',{sessionToken:'ttcm1'}),bgh=route('nvsA22ListMine',{sessionToken:'bgh1'}),shared=route('nvsA22List',{sessionToken:'ttcm1'});
 rolePass=gv.records?.length===1&&tt.records?.length===0&&bgh.records?.length===0&&shared.records?.length===1;
}catch(_){}
ck('Mock: chỉ chủ hồ sơ thấy bản ghi trong listMine',rolePass);
return{pass:c.every(x=>x.pass),passed:c.filter(x=>x.pass).length,total:c.length,failed:c.filter(x=>!x.pass),checks:c};
}
module.exports={verify};
if(require.main===module){const fs=require('node:fs'),path=require('node:path'),names=['NghiepVu.html','NVS_TraCuu_CaNhan.html','backend/HVA_NVS_A22_MODULE.gs','NVS_GiaoViec_TheoDoi.html','NVS_A22_Definitions.js'];const f=Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(__dirname,'..',n),'utf8')]));const r=verify(f);console.log(JSON.stringify(r,null,2));process.exitCode=r.pass?0:1}
