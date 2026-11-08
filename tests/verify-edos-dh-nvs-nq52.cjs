/** EDOS Điều hành–NVS–NQ52 regression. Run: node tests/verify-edos-dh-nvs-nq52.cjs */
function verify(f){
  const D=f['DieuHanh.html']||'',N=f['NghiepVu.html']||'',T=f['NVS_GiaoViec_TheoDoi.html']||'',Q=f['NQ52_TTCM_GiaoSanPhamThang.html']||'';
  const c=[],a=(name,ok)=>c.push({name,pass:!!ok}),count=(s,re)=>(s.match(re)||[]).length;
  const ids=s=>[...s.matchAll(/<[^>]+\bid="([^"]+)"/g)].map(x=>x[1]);
  a('DH 7 nhóm',count(D,/<section class="group">/g)===7);
  a('DH 24 chức năng',count(D,/<a class="tile(?: tile-review)?"/g)===24);
  a('DH bộ đếm chính xác',D.includes('7 nhóm · 24 chức năng'));
  a('DH có NQ52 trong nhóm 1.2',/<h2>1\.2\. PHÂN CÔNG – ĐIỀU PHỐI<\/h2>[\s\S]*?NQ52_TTCM_GiaoSanPhamThang\.html[\s\S]*?<h2>1\.3\./.test(D));
  a('DH đánh dấu NQ52 bản dự thảo',D.includes('Bản dự thảo · Chưa nối Backend'));
  a('DH có hộp tiếp nhận A22 (chưa Backend)',D.includes('href="./NVS_A22_HopTiepNhan.html"')&&D.includes('Hộp tiếp nhận · Chờ Backend'));
  a('NQ52 chưa phát hành',Q.includes('DRAFT_NOT_PUBLISHED')&&Q.includes('CHƯA KẾT NỐI BACKEND'));
  a('NQ52 có kiểm tra phiên/vai trò giao diện',Q.includes('nq52-draft-access-script')&&Q.includes('hvaSessionToken')&&Q.includes('hvaSessionExpiresAt')&&Q.includes('ttcm'));
  a('NVS ba tab A/B/C',count(N,/role="tab"/g)===3);
  a('NVS sáu nhóm A',Array.from({length:6},(_,i)=>N.includes('class="group-num">A.'+(i+1)+'</span>')).every(Boolean));
  a('NVS bốn mục C', ['C.1','C.2','C.3','C.4'].every(x=>N.includes('data-code="'+x+'"')));
  a('NVS B1.2 có lịch',N.includes('data-search="B.1.2 Lịch công tác – Cuộc họp" href="./LichCongTac.html"'));
  a('NVS B1.4 có việc của tôi',N.includes('data-search="B.1.4 Nhiệm vụ được giao" href="./NVS_GiaoViec_TheoDoi.html?view=mine"'));
  a('NVS còn 2 mục B cần nguồn dữ liệu',count(N,/class="item pending"/g)===2);
  a('NVS B2.3 có tra cứu hồ sơ A22',N.includes('href="./NVS_TraCuu_CaNhan.html?view=files"'));
  a('NVS B2.4 có tra cứu tình trạng nhiệm vụ',N.includes('href="./NVS_TraCuu_CaNhan.html?view=results"'));
  a('NVS C1/C2 có điều hướng cá nhân',N.includes("if(id==='C.1'){location.href='./NVS_TraCuu_CaNhan.html?view=files';return;}")&&N.includes("if(id==='C.2'){location.href='./NVS_TraCuu_CaNhan.html?view=tasks';return;}"));
  a('NVS C4 không ẩn tính năng NQ52 chờ tích hợp',N.includes('id="nvsNQ52Handoff"')&&N.includes('id="nvsCPersonalLink"'));
  a('NVS lịch footer mở lịch thật',N.includes("if(b.dataset.nvsNav==='calendar'){location.href='./LichCongTac.html';return;}"));
  a('NVS C4 chú thích NQ52 đúng trạng thái',N.includes('id="nvsNQ52Handoff"')&&N.includes("nq52Note.hidden=id!=='C.4'"));
  a('NVS không tự xếp loại NQ52',N.includes('Không dùng dữ liệu Giao việc thông thường để tự động xếp loại'));
  a('Tác nghiệp tự vào Việc của tôi',T.includes("(manager()?'create':'mine')"));
  a('Ẩn menu giao việc với GV NV',T.includes("!manager()&&b.dataset.page!=='mine'")&&T.includes("if(!manager()&&page!=='mine')page='mine'"));
  a('Có xác thực nhiệm vụ qua Backend',T.includes('nvsTaskList')&&T.includes('sessionToken:token()'));
  a('DH không trùng ID',ids(D).length===new Set(ids(D)).size);
  a('NVS không trùng ID',ids(N).length===new Set(ids(N)).size);
  for(const [name,s] of Object.entries(f)){let good=true;for(const m of s.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){if(/\bsrc=/.test(m[1]))continue;try{new Function(m[2])}catch(_){good=false}}a('Cú pháp JS: '+name,good)}
  return {pass:c.every(x=>x.pass),passed:c.filter(x=>x.pass).length,total:c.length,failed:c.filter(x=>!x.pass),checks:c};
}
module.exports={verify};
if(require.main===module){const fs=require('node:fs'),p=require('node:path');const names=['DieuHanh.html','NghiepVu.html','NVS_GiaoViec_TheoDoi.html','NQ52_TTCM_GiaoSanPhamThang.html'];const f=Object.fromEntries(names.map(n=>[n,fs.readFileSync(p.join(__dirname,'..',n),'utf8')]));const r=verify(f);console.log(JSON.stringify(r,null,2));process.exitCode=r.pass?0:1}
