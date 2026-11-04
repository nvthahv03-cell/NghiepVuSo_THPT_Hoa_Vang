(function(){'use strict';
const h=window.HVA4,w=window,mod=document.body.dataset.module,cfg=w.HVA4_SCHEMA&&w.HVA4_SCHEMA[mod];if(!cfg)return;
const $=h.$;let records=[],meta={},ready=false;
const el=(tag,attrs={},label)=>{const x=document.createElement(tag);Object.entries(attrs).forEach(([key,value])=>x.setAttribute(key,value));if(label!==undefined)x.textContent=String(label);return x};
const fval=key=>{const x=$(key);return x?String(x.value||''):''};
function addField(f){
 const group=mod==='nq52'?({'month':'I. Kỳ kê khai','duties':'II. Kết quả thực hiện nhiệm vụ','a1':'III. Tự đánh giá các tiêu chí','strength':'IV. Tự nhận xét và đề xuất'}[f.key]||''):mod==='device'?({'date':'I. Thông tin buổi dạy','phbmTH':'II. Nơi thực hiện và phương tiện','teacherComment':'III. Nhận xét và ghi chú'}[f.key]||''):'';
 if(group)$('fields').append(el('div',{class:'grouphead'},group));
 const wrap=el('div'),label=el('label',{for:f.key},f.label+(f.required?' *':''));wrap.append(label);
 let input;if(f.type==='textarea')input=el('textarea',{name:f.key,id:f.key,rows:'3'});else if(f.type==='select'){input=el('select',{name:f.key,id:f.key});input.append(el('option',{value:''},'-- Chọn --'));(f.options||[]).forEach(v=>input.append(el('option',{value:v},v)))}else input=el('input',{name:f.key,id:f.key,type:f.type});
 if(f.required)input.required=true;if(f.type==='number'){input.min='0';if(['a1','a2','a3'].includes(f.key)){input.max='10';input.step='0.5'}else if(['quantity','quality','progress'].includes(f.key)){input.max='100';input.step='0.5'}else input.step='1'}
 input.addEventListener('input',updateInfo);wrap.append(input);$('fields').append(wrap)
}
function rows(){return records.map((item,i)=>{const v=item.data||item;return cfg.row(Object.assign({},v,{owner:item.owner||v.owner,updatedAt:item.updatedAt||v.updatedAt,status:item.status||v.status,submittedAt:item.submittedAt||v.submittedAt}),i)})}
function updateInfo(){
 if(mod==='nq52'){
  const own=records.find(x=>x.owner===h.username()&&(x.data||{}).month===fval('month'));const nums=['a1','a2','a3'].map(k=>fval(k));const total=nums.some(x=>x==='')?'—':String(nums.reduce((a,x)=>a+Number(x),0));$('nq52StatA').textContent=total+' / 30';
  const rates=['quantity','quality','progress'].map(k=>fval(k));$('nq52StatB').textContent=rates.every(Boolean)?rates.join(' / ')+' %':'Chưa đủ dữ liệu';
  $('nq52StatStatus').textContent=own?own.status:'Chưa có hồ sơ';
  const locked=!!own&&!['NHÁP','YÊU CẦU BỔ SUNG'].includes(own.status);$('saveDraft').disabled=!ready||locked;$('submitForm').disabled=!ready||locked;
 }
 if(mod==='device'){
  $('deviceTotal').textContent=ready?String(records.length):'—';
  $('deviceRoomTotal').textContent=ready?String(records.filter(x=>{const v=x.data||x;return v.phbmTH==='Có'||v.phbmLT==='Có'}).length):'—';
  $('deviceItTotal').textContent=ready?String(records.filter(x=>(x.data||x).it==='Có').length):'—';
 }
}
function showExisting(){
 if(mod!=='nq52')return;const date=fval('month'),own=records.find(x=>x.owner===h.username()&&(x.data||{}).month===date);if(own){const d=own.data||{};cfg.fields.forEach(f=>{const input=$(f.key);if(input)input.value=d[f.key]||''});h.status('Đã mở hồ sơ tháng '+date+' ('+own.status+').','ok')}
 else{for(const f of cfg.fields){if(f.key!=='month')$(f.key).value=''}h.status('Tháng '+date+' chưa có hồ sơ.','ok')}updateInfo();
}
function display(){
 h.table('records',cfg.headers,rows());$('recordCount').textContent=records.length+' bản ghi đã được máy chủ trả về.';
 let nav=$('chooseRecord');if(!nav){nav=el('div',{id:'chooseRecord',class:'actions'});$('records').parentElement.insertBefore(nav,$('records'))}nav.replaceChildren();
 if(mod==='nq52'){records.filter(x=>x.owner===h.username()).forEach(x=>{const btn=el('button',{type:'button',class:'btn'},'Mở tháng '+(x.data&&x.data.month||'')+' · '+x.status);btn.onclick=()=>{$('month').value=x.data.month;showExisting()};nav.append(btn)})}
 else if(mod==='device'){nav.append(el('span',{class:'muted'},'Bảng dưới đây là dữ liệu đã được máy chủ xác thực. In hoặc xuất theo mẫu giấy.'))}
 if(w.HVA4_Extras&&typeof w.HVA4_Extras.render==='function')w.HVA4_Extras.render(mod,meta,ready,records);updateInfo();
}
async function load(){
 ready=false;$('saveDraft').disabled=true;$('submitForm').disabled=true;h.status('Đang kiểm tra quyền và tải dữ liệu từ Backend…');
 try{const r=await h.api('hva4Get',{module:mod});if(r.module!==mod||r.schemaVersion!=='HVA4-1'||!Array.isArray(r.records))throw Error('Máy chủ chưa hỗ trợ giao thức nghiệp vụ mới. Không cho phép ghi dữ liệu.');
  records=r.records;meta=r.meta||{};ready=true;h.status('Đã kết nối và được Backend xác nhận quyền truy cập.','ok');$('saveDraft').disabled=false;$('submitForm').disabled=false;
 }catch(e){records=[];meta={};h.status(e.message,'error')}display()
}
function validate(v){
 if(mod==='nq52'){for(const k of ['a1','a2','a3','quantity','quality','progress']){if(v[k]==='')continue;const n=Number(v[k]),max=k.startsWith('a')?10:100;if(!Number.isFinite(n)||n<0||n>max)throw Error('Giá trị '+k+' nằm ngoài phạm vi cho phép.')}
 const own=records.find(x=>x.owner===h.username()&&(x.data||{}).month===v.month);if(own&&!['NHÁP','YÊU CẦU BỔ SUNG'].includes(own.status))throw Error('Hồ sơ tháng này đã gửi hoặc đã được xác nhận. Không thể sửa trực tiếp.');
 }
 if(mod==='device'&&!/^\d{1,2}\/\d{1,2}$/.test(v.className||''))throw Error('Lớp phải đúng dạng 10/1, 11/2 hoặc 12/3.')
}
async function send(draft){
 if(!ready){h.status('Chưa xác minh quyền ghi. Không có dữ liệu nào được gửi.','error');return}
 if(!draft&&!$('entryForm').reportValidity())return;
 const rec=h.form($('entryForm'));try{validate(rec)}catch(e){h.status(e.message,'error');return}
 const btn=$(draft?'saveDraft':'submitForm');btn.disabled=true;
 try{const r=await h.api('hva4Save',{module:mod,draft,record:rec});if(r.module!==mod||r.schemaVersion!=='HVA4-1')throw Error('Máy chủ chưa xác nhận bản ghi theo giao thức nghiệp vụ.');$('entryForm').reset();if(mod==='nq52')$('month').value=rec.month;await load();if(mod==='nq52')showExisting();h.status(r.message||'Đã lưu và nhận xác nhận từ máy chủ.','ok')}
 catch(e){h.status(e.message,'error')}finally{updateInfo()}
}
function printRecord(){
 if(mod!=='nq52'){w.print();return}
 const paper=$('nq52PrintSheet');if(!paper)return;
 paper.replaceChildren();const values=h.form($('entryForm')),matched=records.find(x=>x.owner===h.username()&&(x.data||{}).month===values.month);
 const title=el('h2',{},'PHIẾU TỰ KÊ KHAI, ĐÁNH GIÁ KẾT QUẢ CÔNG VIỆC'),subtitle=el('p',{},'TRƯỜNG THPT HÒA VANG · Tháng '+(values.month||'chưa chọn')),identity=el('p',{},'Người kê khai: '+(h.user().hoTen||h.user().fullName||h.user().name||h.username()||'Chưa xác thực'));
 const status=el('p',{},'Trạng thái: '+(matched?matched.status:'Bản đang nhập – chưa nộp'));status.style.fontWeight='700';
 const warning=el('p',{},'Bản in theo nội dung đang hiển thị trên biểu mẫu. Không phải quyết định xếp loại hoặc phê duyệt thu nhập tăng thêm.');
 const table=el('table'),body=el('tbody');for(const item of cfg.fields){const tr=el('tr'),a=el('th',{},item.label),b=el('td',{},values[item.key]||'—');a.style.width='39%';a.style.whiteSpace='normal';tr.append(a,b);body.append(tr)}table.append(body);
 const sign=el('p',{},'Người kê khai\n(Ký, ghi rõ họ tên)');sign.style.whiteSpace='pre-line';sign.style.textAlign='right';sign.style.marginTop='35px';paper.append(title,subtitle,identity,status,warning,table,sign);w.print();
}
function init(){
 $('moduleTitle').textContent=cfg.title;$('moduleDesc').textContent=cfg.description;const user=h.user();$('userLabel').textContent='Tài khoản: '+(user.hoTen||user.fullName||user.name||h.username()||'Chưa đăng nhập');cfg.fields.forEach(addField);
 if(mod==='nq52'){$('month').value=new Date().toISOString().slice(0,7);$('month').addEventListener('change',showExisting)}
 if(w.HVA4_Extras&&typeof w.HVA4_Extras.init==='function')w.HVA4_Extras.init(mod,()=>meta,()=>ready);
 $('saveDraft').onclick=()=>send(true);$('submitForm').onclick=()=>send(false);$('refresh').onclick=async()=>{await load();if(mod==='nq52'&&ready)showExisting()};$('print').onclick=printRecord;$('exportCsv').onclick=()=>h.csv('HVA_'+mod+'.csv',cfg.headers,rows());load()
}
init();
})();