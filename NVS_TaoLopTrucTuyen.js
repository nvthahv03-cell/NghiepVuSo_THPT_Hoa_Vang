/* HVA–EDOS | Online class draft: no fake server receipt or BGH submission. */
(()=>{'use strict';const $=x=>document.getElementById(x),fields=['approval','className','subject','date','start','end','lesson','meet','attendance','evidence','recording','notes'];
function validExp(raw){const n=Number(raw);if(Number.isFinite(n)&&n>0)return(n<1e12?n*1000:n)>Date.now();const t=Date.parse(String(raw||''));return Number.isFinite(t)&&t>Date.now()}
function identity(){if(!['localStorage','sessionStorage'].some(x=>{try{return Boolean(window[x].getItem('hvaSessionToken'))&&validExp(window[x].getItem('hvaSessionExpiresAt'))}catch(_){return false}}))return null;
for(const x of ['localStorage','sessionStorage'])try{const u=JSON.parse(window[x].getItem('user')||'null');if(!u||typeof u!=='object'||Array.isArray(u))continue;const name=String(u.hoTen||u.fullName||u.hoVaTen||u.name||u.tenHienThi||'').trim();if(name)return {name,team:String(u.toBoPhan||u.tenTo||u.toChuyenMon||u.to||'').trim(),id:String(u.username||u.tenDangNhap||u.userName||name)}}catch(_){}return null}
const person=identity();$('teacher').value=person?.name||'Cần đăng nhập EDOS';$('team').value=person?.team||'';
for(const [grade,total] of [[10,9],[11,9],[12,12]])for(let i=1;i<=total;i++){const o=document.createElement('option');o.value=grade+'/'+i;o.textContent='Lớp '+o.value;$('className').append(o)}
const key=person?'hva-edos-online-class-draft-'+encodeURIComponent(person.id):'';
function message(t,kind=''){$('message').textContent=t;$('message').dataset.kind=kind}
function okUrl(v,hosts){try{const u=new URL(v.trim());return u.protocol==='https:'&&hosts.includes(u.hostname)&&!u.username&&!u.password}catch(_){return false}}
function values(){return Object.fromEntries(fields.map(x=>[x,$(x).value.trim()]))}
function check(){if(!person){message('Cần đăng nhập HVA–EDOS để lưu bản nháp.','error');return false}
for(const f of ['className','subject','date','start','end','lesson','meet'])if(!$(f).value.trim()){$(f).focus();message('Vui lòng điền đủ các trường bắt buộc.','error');return false}
if($('start').value>=$('end').value){message('Giờ kết thúc phải sau giờ bắt đầu.','error');$('end').focus();return false}
if(!okUrl($('meet').value,['meet.google.com'])){message('Liên kết phòng phải thuộc Google Meet và sử dụng HTTPS.','error');return false}
for(const f of ['attendance','evidence','recording'])if($(f).value&&!okUrl($(f).value,['drive.google.com','docs.google.com'])){message('Minh chứng chỉ nhận liên kết HTTPS Google Drive/Docs.','error');$(f).focus();return false}
return true}
$('join').addEventListener('click',()=>{if(okUrl($('meet').value,['meet.google.com']))window.open($('meet').value.trim(),'_blank','noopener,noreferrer');else message('Vui lòng dán liên kết Google Meet hợp lệ.','error')});
$('previewBtn').addEventListener('click',()=>{if(!check())return;const v=values();$('preview').textContent='BẢN NHÁP – CHƯA GỬI BGH\n\n'+Object.entries(v).filter(x=>x[1]).map(x=>x[0]+': '+x[1]).join('\n');$('preview').hidden=false;message('Đã xem trước; chưa được EDOS tiếp nhận.','ok')});
$('save').addEventListener('click',()=>{if(!check())return;try{localStorage.setItem(key,JSON.stringify({version:1,data:values(),at:new Date().toISOString()}));message('Đã lưu bản nháp trên thiết bị; BGH chưa nhận minh chứng.','ok')}catch(_){message('Không thể lưu trên thiết bị này.','error')}});
$('clear').addEventListener('click',()=>{if(!window.confirm('Xóa bản nháp lớp học trực tuyến trên thiết bị?'))return;try{localStorage.removeItem(key)}catch(_){}fields.forEach(x=>$(x).value='');$('preview').hidden=true;message('Đã xóa bản nháp. Chưa có hồ sơ nào được gửi.')});
if(key)try{const raw=localStorage.getItem(key);if(raw){const v=JSON.parse(raw);if(v.version===1&&v.data){fields.forEach(x=>{if(Object.hasOwn(v.data,x))$(x).value=String(v.data[x]||'')});message('Đã khôi phục bản nháp trên thiết bị. Chưa gửi BGH.','ok')}}}catch(_){}
})();