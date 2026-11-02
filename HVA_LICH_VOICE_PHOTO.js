/* HVA Lich cong tac: permission-aware view, per-cell dictation, photo draft. */
(()=>{'use strict';
const $=id=>document.getElementById(id);
const ids=['2','3','4','5','6','7','CN'].flatMap(d=>['sang_','chieu_','ghichu_'].map(k=>k+d));
let allowed=false,active=null,recognition=null;
function role(){
 const sources=[];
 for(const storage of [localStorage,sessionStorage]){
   for(const k of ['user','hvaUser','hva_user','currentUser','nvsUser','HVA_USER']){
     try{const o=JSON.parse(storage.getItem(k)||'null');if(o&&typeof o==='object')sources.push(o)}catch(_){}
   }
 }
 const vals=[];
 for(const o of sources)for(const k of ['workPosition','position','role','chucVu','vaiTro','jobTitle','positionName','tenChucVu','chuc_danh','chuc_vu','title','userRole','chucDanh'])if(typeof o[k]==='string')vals.push(o[k]);
 const raw=vals.join(' ').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();
 return {raw,authorized:/(hieu truong|pho hieu truong|ban giam hieu|\bbgh\b|to truong van phong|ttvp)/.test(raw),hasRole:!!raw};
}
function status(t){const x=$('hvaCalendarAssistStatus');if(x)x.textContent=t}
function showView(){
 if(typeof window.switchViewTab==='function')window.switchViewTab('view-lich-tuan');const p=$('editorPage'),v=$('view-lich-tuan');if(p)p.classList.remove('hidden');if(v)v.classList.remove('hidden');
}
function secureUI(){
 const r=role();allowed=r.authorized;
 const create=$('btnDropdownTaoLich'),menu=$('dropdownMenuTaoLich'),view=$('tab-view-lich-tuan');
 if(create){create.disabled=!allowed;create.setAttribute('aria-disabled',String(!allowed));create.title=allowed?'Tạo lịch công tác':'Chỉ Ban Giám hiệu và Tổ trưởng Văn phòng được tạo lịch';create.style.cssText+=allowed?';opacity:1':';opacity:.43;filter:grayscale(1);cursor:not-allowed;pointer-events:none';}
 if(!allowed){
   if(menu)menu.classList.add('hidden');
   for(const b of document.querySelectorAll('[onclick*="selectTaoLichTab"]')){b.disabled=true;b.style.pointerEvents='none'}
   const prev=window.selectTaoLichTab;if(typeof prev==='function')window.selectTaoLichTab=function(){showView();status('Chỉ BGH và Tổ trưởng Văn phòng được tạo lịch.');};
   for(const id of ids){const e=$(id);if(e){e.readOnly=true;e.setAttribute('aria-readonly','true')}}
   const add=$('hvaCalendarAssistant');if(add)add.hidden=true;
   showView();
 } else {if(view)view.style.cssText+=';background:#fbbf24!important;color:#0f3458!important;font-weight:900!important'}
 if(!allowed&&view)view.style.cssText+=';background:#fbbf24!important;color:#0f3458!important;font-weight:900!important';
}
function apply(id,txt){
 if(!allowed){status('Tài khoản không được tạo lịch.');return}
 const e=$(id);if(!e)return;
 e.value=(e.value.trim()?e.value.trim()+'\n':'')+txt.trim();
 e.dispatchEvent(new Event('input',{bubbles:true}));e.dispatchEvent(new Event('change',{bubbles:true}));
 e.focus();status('Đã nhập vào '+id+'. Vui lòng kiểm tra nội dung trước khi lưu.');
}
function listen(id){
 if(!allowed)return;const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
 if(!SR){status('Trình duyệt này chưa hỗ trợ nhận giọng nói. Hãy dùng Chrome hoặc Edge và cho phép micro.');return}
 if(recognition){try{recognition.stop()}catch(_){}recognition=null;}
 const r=new SR();recognition=r;active=id;r.lang='vi-VN';r.interimResults=true;r.continuous=false;
 const e=$(id);if(!e)return;const before=e.value;let finalText='';
 r.onresult=ev=>{let interim='';for(let i=ev.resultIndex;i<ev.results.length;i++){const chunk=ev.results[i][0].transcript;if(ev.results[i].isFinal)finalText+=chunk+' ';else interim+=chunk}e.value=before+(before.trim()?'\n':'')+(finalText+interim).trim();status('Đang ghi âm cho ô '+id+'…')};
 r.onend=()=>{recognition=null;if(finalText.trim())applyVoiceEnd(e,before,finalText);else {e.value=before;status('Không nhận được lời đọc. Vui lòng thử lại.')}};
 r.onerror=ev=>{status('Micro: '+ev.error+'. Kiểm tra quyền micro và thử lại.')};
 try{r.start();status('Đang nghe: '+id+'. Hãy đọc nội dung, hệ thống sẽ ghi vào đúng ô.')}catch(err){status('Không mở được micro: '+err.message)}
}
function applyVoiceEnd(e,before,text){e.value=before+(before.trim()?'\n':'')+text.trim();e.dispatchEvent(new Event('input',{bubbles:true}));e.focus();status('Đã ghi lời đọc. Vui lòng kiểm tra và chỉnh sửa trước khi lưu.')}
function attachMics(){
 if(!allowed)return;
 ids.forEach(id=>{const e=$(id);if(!e||e.dataset.hvaMic)return;e.dataset.hvaMic='1';const parent=e.parentElement;if(!parent)return;const b=document.createElement('button');b.type='button';b.textContent='🎙 Đọc vào ô';b.className='hva-mic-btn';b.title='Nhập tiếng Việt bằng micro';b.addEventListener('click',()=>listen(id));parent.appendChild(b)});
}
function parseText(str){
 const rows=[];let current=null;
 for(const line of String(str||'').split(/\n/)){const s=line.trim();if(!s)continue;
 const m=s.match(/(?:thứ|thu)\s*(hai|ba|tư|tu|năm|nam|sáu|sau|bảy|bay|[2-7])|(?:chủ nhật|chu nhat)/i);
 const normalized=s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
 if(m){let v=m[1]||'CN';let day={'hai':'2','ba':'3','tu':'4','tư':'4','nam':'5','năm':'5','sau':'6','sáu':'6','bay':'7','bảy':'7'}[v.toLowerCase()]||v;current=day;}
 const segment=/\bchi[eề]u\b/i.test(s)||normalized.includes('chieu')?'chieu':/\bs[aá]ng\b/i.test(s)||normalized.includes('sang')?'sang':null;
 if(current&&segment){let t=s.replace(/^(?:thứ\s*(?:hai|ba|tư|tu|năm|sáu|bảy|[2-7])|chủ nhật)[\s,:.-]*/i,'').replace(/^(?:sáng|chiều)[\s,:.-]*/i,'').trim();rows.push({id:segment+'_'+current,text:t||s});}
 else if(rows.length)rows[rows.length-1].text+='\n'+s;
 }
 return rows;
}
async function photo(file){
 if(!allowed||!file)return;
 if(!/^image\//.test(file.type)||file.size>8*1024*1024){status('Chỉ nhận ảnh JPG/PNG dưới 8MB.');return}
 const text=$('hvaPhotoDraft'),preview=$('hvaPhotoPreview');if(!text)return;
 const url=URL.createObjectURL(file);if(preview){preview.src=url;preview.hidden=false;preview.onload=()=>URL.revokeObjectURL(url)}
 status('Đang thử nhận dạng ảnh (tiếng Việt). Chữ viết tay cần kiểm tra kỹ.');
 try{
   if(!window.Tesseract){await new Promise((yes,no)=>{const sc=document.createElement('script');sc.src='https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js';sc.onload=yes;sc.onerror=()=>no(Error('Không tải được bộ nhận dạng ảnh'));document.head.appendChild(sc)})}
   const result=await window.Tesseract.recognize(file,'vie+eng');
   text.value=(result.data&&result.data.text||'').trim();
   status('Đã nhận dạng bản nháp. Hãy sửa lỗi chữ viết tay rồi bấm Điền vào bảng.');
 }catch(err){status('Chưa nhận dạng được ảnh. Có thể nhập nội dung thủ công vào ô bản nháp bên dưới.');}
}
function fillDraft(){
 if(!allowed)return;const t=$('hvaPhotoDraft')?.value||'';const rows=parseText(t);
 if(!rows.length){status('Chưa nhận được cấu trúc Thứ Hai sáng/chiều… Hãy chỉnh văn bản theo từng dòng, ví dụ: Thứ Hai sáng: Họp BGH.');return}
 if(!confirm('Điền '+rows.length+' mục vào các ô Lịch tuần? Vui lòng xem lại sau khi điền.'))return;
 rows.forEach(r=>apply(r.id,r.text));status('Đã điền '+rows.length+' mục vào lịch tuần. Chưa lưu hoặc phát hành.');
}
function init(){
 const root=document.createElement('section');root.id='hvaCalendarAssistant';root.className='hva-calendar-assist';root.innerHTML='<h3>🎙 TRỢ LÝ NHẬP LỊCH CÔNG TÁC</h3><p>Chọn nút micro ngay dưới ô Sáng, Chiều hoặc Ghi chú và đọc tiếng Việt. Có thể tải ảnh lịch viết tay để nhận dạng bản nháp.</p><div class="hva-photo-controls"><label>📷 Tải ảnh lịch viết tay <input id="hvaPhotoInput" type="file" accept="image/*" /></label><span>Ảnh chỉ dùng để tạo bản nháp, không tự phát hành.</span></div><img id="hvaPhotoPreview" alt="Ảnh lịch đã tải lên" hidden/><textarea id="hvaPhotoDraft" placeholder="Bản nháp nhận dạng. Mỗi dòng nên có dạng: Thứ Hai sáng: Họp BGH…" rows="5"></textarea><button type="button" id="hvaFillDraft">Điền bản nháp vào lịch tuần</button><div role="status" id="hvaCalendarAssistStatus" aria-live="polite">Chọn một ô lịch để đọc hoặc tải ảnh viết tay.</div>';
 const input=$('sang_2');const grid=input?.closest('section')||input?.closest('div[class*="card"]')||input?.closest('table')?.parentElement;
 if(grid)grid.parentElement.insertBefore(root,grid);else document.querySelector('main')?.prepend(root);
 $('hvaPhotoInput')?.addEventListener('change',e=>photo(e.target.files?.[0]));$('hvaFillDraft')?.addEventListener('click',fillDraft);
 secureUI();attachMics();if(!allowed&&!role().hasRole)status('Hệ thống chưa đọc được vai trò từ phiên đăng nhập. Cần xác minh tài khoản; không tự cấp quyền tạo lịch.');
}
const css=document.createElement('style');css.textContent='.hva-calendar-assist{background:#fff;border:1px solid #bbd8f5;border-radius:18px;padding:18px;margin:16px 0;color:#153f67;box-shadow:0 8px 25px #0a4e8520}.hva-calendar-assist h3{font-weight:900;font-size:16px;margin-bottom:8px}.hva-calendar-assist p,.hva-photo-controls span{font-size:12px;color:#536d89;margin-bottom:12px}.hva-photo-controls{display:flex;flex-wrap:wrap;gap:12px;align-items:center;margin:10px 0}.hva-photo-controls label{cursor:pointer;font-weight:800}.hva-photo-controls input{font-size:11px;max-width:100%}.hva-calendar-assist textarea{width:100%;padding:10px;border:1px solid #c1d7ee;border-radius:10px;display:block;margin:10px 0;font-size:13px}.hva-calendar-assist button,.hva-mic-btn{background:#075b9c;color:#fff;border:0;border-radius:8px;padding:8px 11px;font-size:11px;font-weight:800;cursor:pointer}.hva-mic-btn{display:block;margin:5px 0;background:#e4f2ff;color:#075b9c;border:1px solid #bbd9f5}.hva-calendar-assist #hvaPhotoPreview{max-width:100%;max-height:250px;object-fit:contain;margin:12px 0;border-radius:8px}.hva-calendar-assist #hvaCalendarAssistStatus{margin-top:10px;font-size:12px;color:#24628f}';document.head.appendChild(css);
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();