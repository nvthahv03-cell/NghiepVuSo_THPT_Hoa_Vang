/* HVA–EDOS | A.5.2 – Giao diện nghiệp vụ điều chỉnh tiết dạy.
 * Không ghi dữ liệu, không gọi Router, không phát sinh hồ sơ/đề nghị giả.
 */
(()=>{'use strict';
 const by=id=>document.getElementById(id);
 const validExpiry=raw=>{const n=Number(raw);if(Number.isFinite(n)&&n>0)return(n<1e12?n*1000:n)>Date.now();const d=Date.parse(String(raw||''));return Number.isFinite(d)&&d>Date.now()};
 function readIdentity(){
  const valid=['localStorage','sessionStorage'].some(type=>{
   try{const st=window[type];return Boolean(st.getItem('hvaSessionToken'))&&validExpiry(st.getItem('hvaSessionExpiresAt'))}catch(_){return false}
  });
  if(!valid)return null;
  for(const type of ['localStorage','sessionStorage']){
   try{
    const u=JSON.parse(window[type].getItem('user')||'null');
    if(!u||typeof u!=='object'||Array.isArray(u))continue;
    const name=String(u.hoTen||u.fullName||u.hoVaTen||u.name||u.tenHienThi||'').trim();
    if(name)return {name,team:String(u.toBoPhan||u.tenTo||u.toChuyenMon||u.to||'').trim(),role:String(u.viTriViecLam||u.chucVu||u.chucDanh||u.vaiTro||'').trim()};
   }catch(_){}
  }
  return null;
 }
 function refresh(){
  const u=readIdentity();
  by('teacher').value=u?.name||'Chưa xác định phiên đăng nhập EDOS';
  by('team').value=u?.team||'';
  by('role').value=u?.role||'';
 }
 by('preview').addEventListener('click',()=>{
  const t=by('type'),label=t.options[t.selectedIndex].text;
  by('note').textContent='Đang xem bản thiết kế: '+label+
   ' · Ngày dự kiến: '+(by('proposedDate').value||'chưa chọn')+
   ' · Hình thức: '+(by('mode').value==='TRUC_TIEP'?'Trực tiếp':'Trực tuyến')+
   '. Chưa đủ nguồn lớp, môn, tiết, phòng và xác minh Backend; không tạo hồ sơ.';
 });
 refresh();
 window.addEventListener('pageshow',refresh);
 window.addEventListener('focus',refresh);
 window.addEventListener('storage',refresh);
})();