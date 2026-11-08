/** EDOS standalone Quản trị V1 static/role regression.
 * Run: node tests/verify-edos-quantri-v1.cjs
 */
function verify(f){
 const q=f['QuanTri.html']||'',d=f['DieuHanh.html']||'',h=f['index.html']||'',legacy=f['NVS_QuanTri.html']||'';
 const checks=[],test=(name,pass)=>checks.push({name,pass:!!pass}),count=(v,re)=>(v.match(re)||[]).length;
 const catalogSrc=q.match(/<script id="hva-quantri-catalog">([\s\S]*?)<\/script>/)?.[1]||'';
 const guardSrc=q.match(/<script id="hva-quantri-guard">([\s\S]*?)<\/script>/)?.[1]||'';
 const shortcutSrc=d.match(/<script id="hva-quantri-shortcut-policy">([\s\S]*?)<\/script>/)?.[1]||'';
 const match=catalogSrc.match(/const groups=([\s\S]*?);\nconst allowed=/);
 let groups=[];try{groups=new Function('return '+match[1])()}catch(_){}
 const items=groups.flatMap(group=>group.items.map(([code,title,desc,state,href])=>({group:group.id,code,title,desc,state,href})));
 function session(role,valid=true){
  const user=JSON.stringify({chucVu:role,vaiTro:role});
  return{sessionStorage:{getItem:k=>k==='hvaSessionToken'&&valid?'TEST_SESSION_TOKEN':k==='hvaSessionExpiresAt'&&valid?'4102444800000':k==='user'?user:null},localStorage:{getItem:()=>null}};
 }
 function allow(role,valid){
  const win=session(role,valid),doc={addEventListener(){}};
  try{new Function('window','document',guardSrc)(win,doc);return win.HVA_QUANTRI_ACCESS.viewer()}catch(_){return null}
 }
 function navShortcut(role,valid){
  const win=session(role,valid);win.HVA_DIEUHANH_ACCESS={valid:()=>valid};
  const link={hidden:true},doc={getElementById:x=>x==='hvaQuanTriShortcut'?link:null};
  try{new Function('window','document',shortcutSrc)(win,doc);return !link.hidden}catch(_){return null}
 }
 test('Trang Quản trị là tệp riêng',q.includes('<title>Quản trị hệ thống | HVA–EDOS'));
 test('Trang Quản trị có 6 nhóm',groups.length===6);
 test('Danh mục có 19 chức năng',items.length===19);
 test('Các nhóm có 3 hoặc 4 mục; QT5 có 4',groups.every(g=>g.items.length===3||(g.id==='QT5'&&g.items.length===4)));
 test('Mã chức năng Quản trị không trùng',new Set(items.map(i=>i.code)).size===19);
 test('Số mục có mẫu dự thảo chính xác',items.filter(i=>i.state==='draft').length===5);
 test('Có 2 mục chỉ xem: văn bản và tra cứu',items.filter(i=>i.state==='view').length===2);
 test('12 mục chưa triển khai được ghi đúng trạng thái',items.filter(i=>i.state==='planned').length===12);
 test('Các mục chưa triển khai không có đường dẫn',items.filter(i=>i.state==='planned').every(i=>!i.href));
 test('Có 7 liên kết nội bộ đến tệp hiện hành',items.filter(i=>i.href).length===7);
 test('Chỉ dùng đường dẫn nội bộ được kiểm soát',items.filter(i=>i.href).every(i=>/^\.[/][\w.-]+\.html$/.test(i.href)));
 test('Tất cả liên kết nghiệp vụ tồn tại',items.filter(i=>i.href).every(i=>!!f[i.href.slice(2)]));
 test('Trang bảo vệ hiển thị nội dung khi chưa đăng nhập',q.includes('id="qtDenied"')&&q.includes('qt-auth-denied')&&q.includes('body:not(.qt-auth-ok) #qtWorkspace'));
 test('BGH có quyền xem danh mục',allow('Phó Hiệu trưởng',true)===true);
 test('Hiệu trưởng có quyền xem danh mục',allow('Hiệu trưởng',true)===true);
 test('Quản trị viên có quyền xem danh mục',allow('ADMIN',true)===true);
 test('TTCM không tự thành quản trị viên',allow('Tổ trưởng chuyên môn',true)===false);
 test('TTVP không tự thành quản trị viên',allow('Tổ trưởng văn phòng',true)===false);
 test('Giáo viên không vào được Quản trị',allow('Giáo viên',true)===false);
 test('Phiên hết hạn không xem Quản trị',allow('Phó Hiệu trưởng',false)===false);
 test('Điều hành có lối vào Quản trị',d.includes('id="hvaQuanTriShortcut" href="./QuanTri.html"'));
 test('Điều hành giữ đủ 7 nhóm và 24 ô',count(d,/<section class="group">/g)===7&&count(d,/<a class="tile(?: tile-review)?"/g)===24);
 test('BGH thấy lối vào từ Điều hành',navShortcut('Phó Hiệu trưởng',true)===true);
 test('TTCM không thấy lối vào Quản trị',navShortcut('Tổ trưởng chuyên môn',true)===false);
 test('Chưa đăng nhập không thấy lối vào',navShortcut('Phó Hiệu trưởng',false)===false);
 test('Trang chủ vẫn bốn cổng',count(h,/id="nvs(?:Admin|Work|Learning|Document)Gate"/g)===4);
 test('Trang NVS_QuanTri cũ không bị ghi đè',legacy.includes('DANH MỤC NGHIỆP VỤ SỐ'));
 test('Không có xử lý POST hoặc thao tác lưu dữ liệu từ hub',!q.includes('fetch(')&&!q.includes('localStorage.setItem(')&&!q.includes('sessionStorage.setItem('));
 test('QT5.4 tra cứu tổng hợp xuất Excel/PDF có đường dẫn riêng',items.some(i=>i.code==='QT5.4'&&i.href==='./NVS_QuanTri_TraCuu.html')&&q.includes('id="qtSearchHub"'));
 test('Chỉ tạo link cho danh mục đã có href',catalogSrc.includes("const linked=!!href&&allowed.has(href)"));
 test('Tra cứu menu có tìm kiếm',q.includes('id="qtSearch"')&&catalogSrc.includes("search.addEventListener('input',render)"));
 let js=true;for(const sc of [catalogSrc,guardSrc,shortcutSrc])try{new Function(sc)}catch(_){js=false}
 test('Ba script Quản trị và Điều hành đúng cú pháp',js);
 const ids=[...q.matchAll(/\bid="([^"]+)"/g)].map(x=>x[1]);
 test('Không trùng ID trong trang Quản trị',ids.length===new Set(ids).size);
 return{pass:checks.every(x=>x.pass),passed:checks.filter(x=>x.pass).length,total:checks.length,failed:checks.filter(x=>!x.pass),checks};
}
module.exports={verify};
if(require.main===module){
 const fs=require('node:fs'),path=require('node:path');
 const names=['QuanTri.html','DieuHanh.html','index.html','NVS_QuanTri.html','NVS_NhanSuTaiKhoan.html','NVS_PhanQuyenHeThong.html','NVS_QuanLyNghiepVu.html','VanBan_QuyDinh.html','NVS_NhatKyHeThong.html','NVS_ThongKeBaoCao.html','NVS_QuanTri_TraCuu.html'];
 const f=Object.fromEntries(names.map(n=>[n,fs.readFileSync(path.join(__dirname,'..',n),'utf8')]));
 const result=verify(f);console.log(JSON.stringify(result,null,2));process.exitCode=result.pass?0:1;
}
