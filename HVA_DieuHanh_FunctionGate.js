(function(){
'use strict';
// Trình chặn điều hướng theo từng chức năng, không thay đổi quyền thật tại Backend.
// Khi Backend cung cấp danh sách quyền đã xác thực, dùng danh sách đó thay cho hồ sơ trình duyệt.
const policy={
 './CuocHop.html':['BGH','TTVP','TTCM','BTD'],
 './TTPhatHanh.html':['BGH','TTVP'],
 './NVS_GiaoNhiemVu.html':['BGH','TTVP','TTCM','BTD'],
 './DieuHanh_BaoCaoNhiemVu.html':['BGH','TTVP','TTCM','BTD'],
 './dieu-hanh/NVS_PhanCongChuyenMon.html':['BGH','TTCM'],
 './NVS_DayThay.html':['BGH','TTCM','TTVP'],
 './dieu-hanh/NVS_DieuPhoiCongViec.html':['BGH','TTCM','TTVP','BTD'],
 './LichCongTac.html':['BGH','TTVP'],
 './NVS_BinhChon.html':['BGH','TTVP','TTCM','BTD'],
 './NVS_KhaoSat.html':['BGH','TTVP','TTCM','BTD'],
 './dieu-hanh/NVS_NhanSuTaiKhoan.html':['BGH'],
 './dieu-hanh/NVS_PhanQuyenHeThong.html':['BGH'],
 './dieu-hanh/NVS_QuanLyNghiepVu.html':['BGH'],
 './dieu-hanh/NVS_ThongKeBaoCao.html':['BGH','TTVP','TTCM','BTD'],
 './NVS_BaoDamChatLuong.html':['BGH','TTCM'],
 './dieu-hanh/NVS_NhatKyHeThong.html':['BGH']
};
const gate=document.getElementById('hvaFeatureAccessNotice');
const closeBtn=document.getElementById('hvaFeatureAccessClose');
const nameLabel=document.getElementById('hvaFeatureAccessName');
let lastFocus=null;
function store(k){try{return localStorage.getItem(k)||sessionStorage.getItem(k)||''}catch(_){return ''}}
function normalize(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/gi,'d').toLowerCase().replace(/\s+/g,' ').trim()}
function accessRole(){
 if(!window.HVA_DIEUHANH_ACCESS?.valid())return '';
 let u;try{u=JSON.parse(store('user')||'{}')}catch(_){return ''}
 if(!u||typeof u!=='object')return '';
 const raw=normalize([u.chucVu,u.chucDanh,u.viTriViecLam,u.vaiTro,u.role].filter(Boolean).join(' '));
 const codes=String(u.vaiTro||u.role||'').toUpperCase().split(/[^A-Z0-9]+/);
 if(/hieu truong|ban giam hieu/.test(raw)||codes.includes('BGH'))return 'BGH';
 if(/to truong van phong|ttvp/.test(raw)||codes.includes('TTVP'))return 'TTVP';
 if(/to truong chuyen mon|to truong bo mon|ttcm/.test(raw)||codes.includes('TTCM')||(/\bto truong\b/.test(raw)&&!/van phong/.test(raw)))return 'TTCM';
 const person=normalize(u.hoTen||u.fullName||u.name||u.hoVaTen);
 if(person==='hoang xuan sy'&&(/bi thu|doan/.test(raw)||codes.includes('BTD')||codes.includes('BTDOAN')))return 'BTD';
 return '';
}
function check(link){
 const raw=link.getAttribute('href')||'';
 let url;try{url=new URL(raw,location.href)}catch(_){return {allow:false}}
 if(url.origin!==location.origin)return {allow:false};
 const pathname=url.pathname.split('/').filter(Boolean);
 const file=pathname[ pathname.length-1]||'';
 const local=raw.replace(/^\.\//,'').split('?')[0].split('#')[0];
 const policyKey='./'+local;
 const roles=policy[policyKey]||policy['./'+file];
 if(!roles)return {allow:false};
 // Đồng bộ với quyền vào không gian Điều hành; chưa thay thế xác thực Backend.
 return {allow:!!window.HVA_DIEUHANH_ACCESS?.allowed()&&roles.includes(accessRole())};
}
function openNotice(name){
 if(!gate)return;
 lastFocus=document.activeElement;
 nameLabel.textContent=name||'Chức năng này';
 gate.hidden=false;
 closeBtn?.focus();
}
function closeNotice(){
 if(!gate||gate.hidden)return;
 gate.hidden=true;
 if(lastFocus?.isConnected)lastFocus.focus();
 lastFocus=null;
}
document.addEventListener('click',e=>{
 const tile=e.target.closest?.('a.tile[href]');
 if(!tile||!tile.closest('main'))return;
 const result=check(tile);
 if(result.allow)return;
 e.preventDefault();e.stopImmediatePropagation();
 openNotice(tile.textContent.trim());
},true);
closeBtn?.addEventListener('click',closeNotice);
gate?.addEventListener('click',e=>{if(e.target===gate)closeNotice()});
document.addEventListener('keydown',e=>{
 if(gate?.hidden!==false)return;
 if(e.key==='Escape'){e.preventDefault();closeNotice()}
 if(e.key==='Tab'){e.preventDefault();closeBtn?.focus()}
});
})();