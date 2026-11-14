/* HVA–EDOS / A22: giao diện nghiệp vụ – chưa có tuyến gửi Backend xác thực. */
(function(){'use strict';
const D=window.HVA_A22_DEFS||{};
const names=Object.keys(D);
const ids=['code','schoolYear','owner','team','date','subject','title','content','result','evidence'];
const by=id=>document.getElementById(id);
if(!names.length||!by('form')||!by('specialFields')){console.error('Thiếu cấu hình biểu mẫu A22');return;}
const storeRead=key=>{for(const kind of ['sessionStorage','localStorage'])try{const v=window[kind].getItem(key);if(v)return v;}catch(_){}return ''};
function currentUser(){try{return JSON.parse(storeRead('user')||'{}')||{}}catch(_){return {}}}
function namePart(){const u=currentUser();return String(u.username||u.tenDangNhap||u.maNhanVien||'').replace(/[^a-z0-9_.-]/gi,'').slice(0,55)}
function storageKey(){return 'HVA_A22_SESSION_'+namePart()+'_'+by('code').value}
function notice(text,ok=false){const n=by('feedback');n.textContent=text;n.style.color=ok?'#087e56':'#a22532'}
function clean(t){return String(t==null?'':t).replace(/\r/g,'').trim()}
function safeUrl(value){if(!value)return true;try{const u=new URL(value);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch(_){return false}}
function validDrive(value){if(!value)return true;try{const u=new URL(value);return safeUrl(value)&&['drive.google.com','docs.google.com'].includes(u.hostname)}catch(_){return false}}
function setDate(){const d=new Date();const pad=v=>String(v).padStart(2,'0');by('date').value=[d.getFullYear(),pad(d.getMonth()+1),pad(d.getDate())].join('-')}
function makeField(spec){
 const wrap=document.createElement('div');wrap.className=spec.type==='textarea'?'wide':'';
 const elId='a22_'+spec.key;
 const label=document.createElement('label');label.htmlFor=elId;label.textContent=spec.label+(spec.required?' *':'');
 let input;
 if(spec.type==='textarea'){input=document.createElement('textarea');input.rows=3;input.maxLength=8000}
 else if(spec.type==='select'){
   input=document.createElement('select');
   const blank=document.createElement('option');blank.value='';blank.textContent='— Chọn —';input.append(blank);
   for(const option of spec.options||[]){const o=document.createElement('option');o.value=option;o.textContent=option;input.append(o)}
 } else {
   input=document.createElement('input');input.type=spec.type||'text';
   if(spec.type==='number'){input.min='0';input.step='1';input.inputMode='numeric'}
   if(spec.type==='url')input.placeholder='https://drive.google.com/...';
   if(spec.type==='text')input.maxLength=350;
 }
 input.id=elId;input.name='a22_'+spec.key;input.required=!!spec.required;
 if(spec.required)input.setAttribute('aria-required','true');
 wrap.append(label,input);return wrap;
}
function setCode(code,keepTitle=false){
 if(!Object.prototype.hasOwnProperty.call(D,code))return false;
 by('code').value=code;const def=D[code];
 by('heading').textContent=code+' – '+def.title;
 by('specialTitle').textContent='Thông tin nghiệp vụ '+code;
 by('specialHint').textContent=def.purpose;
 const holder=by('specialFields');holder.replaceChildren(...def.fields.map(makeField));
 if(!keepTitle||!by('title').value.trim())by('title').value=def.title;
 by('previewPanel').classList.add('hidden');
 const url=new URL(location.href);url.searchParams.set('code',code);history.replaceState(null,'',url.pathname+url.search+url.hash);
 return true;
}
const select=by('code');for(const code of names){const op=new Option(code+' — '+D[code].title,code);select.add(op)}
const selected=new URL(location.href).searchParams.get('code');const defaultCode=Object.prototype.hasOwnProperty.call(D,selected)?selected:names[0];
setDate();const u=currentUser();
by('owner').value=clean(u.hoTen||u.fullName||u.name||'');
by('team').value=clean(u.toBoPhan||u.tenTo||u.to||'');
setCode(defaultCode);
function collect(){
 const base=Object.fromEntries(ids.map(id=>[id,clean(by(id).value)]));
 const extras=Object.fromEntries(D[base.code].fields.map(spec=>[spec.key,clean(by('a22_'+spec.key).value)]));
 return {base,extras};
}
function validate(){
 if(!by('form').reportValidity())return false;
 const {base,extras}=collect();
 if(!validDrive(base.evidence)){notice('Minh chứng chung chỉ nhận liên kết Google Drive/Docs HTTPS.');by('evidence').focus();return false}
 for(const spec of D[base.code].fields){
   const v=extras[spec.key],input=by('a22_'+spec.key);
   if(spec.type==='url'&&v&&!safeUrl(v)){notice('Liên kết '+spec.label+' phải dùng HTTPS và có tên miền hợp lệ.');input.focus();return false}
 }
 if(['A.5.1','A.5.3'].includes(base.code)&&extras.tuNgay&&extras.denNgay&&extras.tuNgay>extras.denNgay){
   notice('Ngày kết thúc không được trước ngày bắt đầu.');by('a22_denNgay').focus();return false;
 }
 return true;
}
function linesFor(data){
 const {base,extras}=data,def=D[base.code];
 const lines=['SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG','TRƯỜNG THPT HÒA VANG','','BẢN DỰ THẢO — CHƯA KÝ — CHƯA GỬI','',base.code+' – '+def.title,'','Người lập: '+base.owner,'Tổ / bộ phận: '+base.team,'Năm học: '+base.schoolYear,'Ngày lập: '+base.date,'Môn / lớp / đối tượng / địa điểm: '+(base.subject||'—'),'',
 'I. THÔNG TIN NGHIỆP VỤ'];
 for(const spec of def.fields)lines.push(spec.label+': '+(extras[spec.key]||'—'));
 lines.push('','II. NỘI DUNG / CĂN CỨ','Tiêu đề: '+base.title,base.content||'—',
 '','III. KẾT QUẢ / KIẾN NGHỊ',base.result||'—',
 '','IV. MINH CHỨNG BỔ SUNG',base.evidence||'—',
 '','NGƯỜI LẬP HỒ SƠ','(Chưa ký)');
 return lines;
}
function preview(){
 if(!validate())return false;
 by('preview').textContent=linesFor(collect()).join('\n');
 by('previewPanel').classList.remove('hidden');
 by('previewPanel').scrollIntoView({behavior:'smooth'});
 notice('Đã kiểm tra nội dung và dựng bản xem trước. Hồ sơ chưa được gửi hoặc lưu trên Backend.',true);
 return true;
}
function makeDownload(name,text){
 const blob=new Blob([text],{type:'application/json;charset=utf-8'}),url=URL.createObjectURL(blob);
 const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();
 setTimeout(()=>URL.revokeObjectURL(url),1200);
}
function draft(){
 const {base,extras}=collect();
 return{schema:'HVA-A22-DRAFT-2',version:2,savedAt:new Date().toISOString(),state:'DRAFT_NOT_SUBMITTED',form:base,extras};
}
function applyDraft(raw){
 if(!raw||!['HVA-A22-DRAFT-2','HVA-DRAFT-1'].includes(raw.schema)||!raw.form||!Object.prototype.hasOwnProperty.call(D,raw.form.code))throw Error('Tệp không đúng phiên bản hoặc mã nghiệp vụ');
 const base=raw.form;
 setCode(base.code);
 for(const id of ids)if(id!=='code')by(id).value=String(base[id]??'').slice(0,by(id).maxLength>0?by(id).maxLength:12000);
 for(const spec of D[base.code].fields){
   const el=by('a22_'+spec.key);const value=String(raw.schema==='HVA-A22-DRAFT-2'?(raw.extras?.[spec.key]??''):'');
   if(spec.type==='select'&&!spec.options.includes(value))el.value='';else el.value=value.slice(0,8000);
 }
 by('previewPanel').classList.add('hidden');
 return raw.schema==='HVA-DRAFT-1';
}
by('form').addEventListener('submit',e=>{e.preventDefault();preview()});
by('export').addEventListener('click',()=>{if(!validate())return;const data=draft();makeDownload('HVA_'+data.form.code.replaceAll('.','_')+'_DU_THAO.json',JSON.stringify(data,null,2));notice('Tệp JSON là bản sao dữ liệu để lưu và chỉnh sửa; không phải giấy biên nhận nộp hồ sơ.',true)});
by('import').addEventListener('click',()=>by('file').click());
by('file').addEventListener('change',async e=>{
 const f=e.target.files?.[0];if(!f)return;
 if(f.size>250000){notice('Tệp lớn hơn 250 KB, không tiếp nhận.');e.target.value='';return}
 try{const raw=JSON.parse(await f.text());const legacy=applyDraft(raw);notice(legacy?'Đã nhập bản nháp phiên bản cũ. Vui lòng điền các trường nghiệp vụ mới trước khi xuất lại.':'Đã nạp bản nháp mới. Cần kiểm tra nội dung trước khi gửi.',true)}
 catch(err){notice('Không nạp được tệp: '+err.message)}
 finally{e.target.value=''}
});
by('saveSession').addEventListener('click',()=>{
 if(!namePart()){notice('Chưa xác định tài khoản EDOS; vui lòng tải JSON thay vì lưu tạm trên thiết bị dùng chung.');return}
 try{sessionStorage.setItem(storageKey(),JSON.stringify(draft()));notice('Đã lưu bản nháp trong phiên trình duyệt này; chưa gửi máy chủ.',true)}
 catch(_){notice('Không lưu được trên thiết bị. Hãy tải JSON để giữ bản nháp.')}
});
by('restoreSession').addEventListener('click',()=>{
 if(!namePart()){notice('Chưa xác định tài khoản EDOS để khôi phục bản nháp.');return}
 try{const saved=sessionStorage.getItem(storageKey());if(!saved){notice('Không có bản nháp trong phiên cho mã nghiệp vụ này.');return}
 applyDraft(JSON.parse(saved));notice('Đã nạp bản nháp trong phiên. Chưa gửi máy chủ.',true)}
 catch(err){notice('Không thể khôi phục bản nháp: '+err.message)}
});
by('print').addEventListener('click',()=>{if(submittedId){window.print();return}if(preview())window.print()});
by('edit').addEventListener('click',()=>by('form').scrollIntoView({behavior:'smooth'}));
select.addEventListener('change',()=>{setCode(select.value);notice('Đã chuyển mẫu. Hãy kiểm tra lại thông tin trước khi xuất.')});
by('send').disabled=true;
/* Tuyến tiếp nhận dùng chung chỉ mở khi Backend đã triển khai action A22 và trả chứng nhận hỗ trợ. */
const A22_BACKEND_URL='https://script.google.com/macros/s/AKfycbzZBemNxnkqhIT2iz0CdtdFJqhlOu8LgZMzmnNjMxSGZRrz-ULuvEZb7MbKoufelWNY/exec';
let canSubmit=false,clientRequestId=null,submittedId="";
const token=()=>storeRead('hvaSessionToken');
function newRequestId(){
 if(window.crypto&&typeof window.crypto.randomUUID==='function')return 'A22-'+window.crypto.randomUUID();
 return 'A22-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,16);
}
async function a22API(action,payload={}){
 const sessionToken=token();if(!sessionToken)throw Error('Phiên EDOS không hợp lệ. Vui lòng đăng nhập lại.');
 const res=await fetch(A22_BACKEND_URL,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken,...payload})});
 if(!res.ok)throw Error('Backend không phản hồi hợp lệ (HTTP '+res.status+').');
 let data;try{data=await res.json()}catch(_){throw Error('Backend trả dữ liệu không phải JSON.')}
 if(!data||!(data.success||data.ok))throw Error(String(data?.message||'Backend chưa tiếp nhận hồ sơ.'));
 return data;
}
async function probeBackend(){
 if(!token()){notice('Chưa có phiên EDOS; có thể chuẩn bị và tải bản nháp, chưa thể gửi hồ sơ.');return}
 try{
  const r=await a22API('nvsA22Capabilities');
  if(r.supported!==true||r.version!=='A22-1'||!r.bghCount||!r.ccCount)throw Error('Backend chưa xác nhận tuyến tiếp nhận đủ BGH và TTCM.');
  canSubmit=true;
  by('send').disabled=false;
  by('send').textContent='Nộp hồ sơ vào hộp tiếp nhận BGH / TTCM';
  by('send').title='Chỉ báo đã tiếp nhận khi Backend trả mã hồ sơ';
  notice('Tuyến tiếp nhận A22 đã xác thực. Hãy kiểm tra và xem trước hồ sơ trước khi nộp.',true);
 }catch(err){
  canSubmit=false;by('send').disabled=true;
  by('send').title='Chưa có tuyến Backend A22 được xác thực';
  notice('Chưa thể nộp hồ sơ: '+err.message+' Có thể lưu nháp và xuất JSON.');
 }
}
by('form').addEventListener('input',()=>{clientRequestId=null;submittedId='';by('previewPanel').classList.add('hidden');by('send').disabled=!canSubmit;if(canSubmit)by('send').textContent='Nộp hồ sơ vào hộp tiếp nhận BGH / TTCM';});
select.addEventListener('change',()=>{clientRequestId=null;submittedId='';if(canSubmit){by('send').disabled=false;by('send').textContent='Nộp hồ sơ vào hộp tiếp nhận BGH / TTCM';}});
by('file').addEventListener('change',()=>{clientRequestId=null;submittedId=''});
by('restoreSession').addEventListener('click',()=>{clientRequestId=null;submittedId=''});
by('send').addEventListener('click',async()=>{
 if(!canSubmit){notice('Chưa có Backend A22 đã xác thực; hồ sơ chưa được gửi.');return}
 if(submittedId){notice('Hồ sơ đã có mã tiếp nhận: '+submittedId+'. Hãy chỉnh sửa nội dung trước khi tạo lần nộp mới.',true);return}
 if(!validate())return;
 if(!window.confirm('Xác nhận nộp hồ sơ '+by('code').value+' vào hộp tiếp nhận BGH và đồng nhận TTCM?'))return;
 const btn=by('send');btn.disabled=true;btn.textContent='Đang kiểm tra tiếp nhận...';
 try{
  if(!clientRequestId)clientRequestId=newRequestId();
  const data=collect();
  const r=await a22API('nvsA22Submit',{document:{clientRequestId,form:data.base,extras:data.extras}});
  if(!r.recordId||!r.bghCount||!r.ccCount)throw Error('Backend chưa cấp đủ mã tiếp nhận và người nhận.');
  notice('ĐÃ TIẾP NHẬN hồ sơ số '+r.recordId+' · BGH: '+r.bghCount+' · TTCM: '+r.ccCount+'. Trạng thái: '+r.status+'. '+(r.notificationStatus==='NOT_CONFIGURED'?'Thông báo tự động chưa được cấu hình.':'') ,true);
  by('preview').textContent=linesFor(data).map(x=>x==='BẢN DỰ THẢO — CHƯA KÝ — CHƯA GỬI'?'ĐÃ TIẾP NHẬN — CHỜ PHÊ DUYỆT — CHƯA KÝ SỐ':x).join('\n')+'\n\nMÃ TIẾP NHẬN: '+r.recordId+'\nTRẠNG THÁI: '+r.status;
  by('previewPanel').classList.remove('hidden');by('previewPanel').scrollIntoView({behavior:'smooth'});
  submittedId=r.recordId;
 }catch(err){notice('CHƯA XÁC NHẬN NỘP HỒ SƠ: '+err.message+' Nếu mạng gián đoạn, hãy thử lại mà không sửa nội dung để tránh gửi trùng.')}
 finally{btn.disabled=!canSubmit||!!submittedId;btn.textContent=submittedId?'Đã tiếp nhận hồ sơ · '+submittedId:canSubmit?'Nộp hồ sơ vào hộp tiếp nhận BGH / TTCM':'Gửi BGH / Đồng gửi TTCM · Chưa kết nối'}
});
probeBackend();

})();
