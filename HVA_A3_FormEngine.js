(function(){'use strict';
const conf=window.HVA_A3_FORM, $=id=>document.getElementById(id);if(!conf)return;
const make=(t,text)=>{const x=document.createElement(t);if(text!==undefined)x.textContent=String(text);return x};
let dirty=false,shown=false,connected=false,records=[];
const fieldMap=new Map(),status=(msg,type='')=>{$('formStatus').textContent=msg;$('formStatus').className='status'+(type?' '+type:'')};
function block(t){const x=make('div');x.className=t?'span3':'';return x}
function build(){
 $('title').textContent=conf.title;$('subtitle').textContent=conf.code+' · '+conf.lead;$('caution').textContent=conf.safety;
 for(const [heading,fields] of conf.sections){const head=make('h2',heading);head.className='section-head';$('formFields').append(head);const grid=make('div');grid.className='grid';for(const [id,label,type,required,options] of fields){
 const cell=block(type==='textarea'),lab=make('label',label+(required?' *':''));lab.htmlFor=id;cell.append(lab);let inp;
 if(type==='textarea'){inp=make('textarea');inp.rows=3;inp.maxLength=3000}
 else if(type==='select'){inp=make('select');const first=make('option','-- Chọn --');first.value='';inp.append(first);for(const item of options){const opt=make('option',item);opt.value=item;inp.append(opt)}}
 else{inp=make('input');inp.type=type;inp.maxLength=type==='url'?1200:180;if(type==='number'){inp.min=id==='version'?'1':'0';inp.max='9999';inp.step='1'}}
 inp.id=id;inp.name=id;inp.required=!!required;inp.setAttribute('aria-label',label);
 if(id==='year')inp.value='2026–2027';inp.addEventListener('input',()=>{dirty=true;shown=false;$('previewSection').hidden=true;$('unsaved').textContent='Có thay đổi chưa lưu.'});fieldMap.set(id,{input:inp,label,type,required});cell.append(inp);grid.append(cell)}
 $('formFields').append(grid)}
 for(const btn of document.querySelectorAll('[data-server]'))btn.disabled=true;
 $('preview').onclick=preview;$('print').onclick=()=>{if(shown)window.print()};
 $('clear').onclick=()=>{if(dirty&&!confirm('Xóa nội dung đang nhập nhưng chưa lưu?'))return;for(const [id,v] of fieldMap)v.input.value=id==='year'?'2026–2027':'';dirty=false;shown=false;$('previewSection').hidden=true;$('unsaved').textContent='Đã làm mới biểu mẫu. Chưa ghi dữ liệu.'};
 $('refresh').onclick=checkConnection;$('save').onclick=()=>send('draft');$('submit').onclick=()=>send('submit');
 checkConnection();
 window.addEventListener('beforeunload',event=>{if(!dirty)return;event.preventDefault();event.returnValue=''});
}
function values(){return Object.fromEntries([...fieldMap].map(([id,c])=>[id,c.input.value.trim()]))}
function validate(strict){const v=values();for(const [id,field] of fieldMap){
 if(strict&&field.required&&!v[id]){field.input.focus();throw Error('Vui lòng nhập '+field.label)}
 if(v[id]&&field.type==='url'){let link;try{link=new URL(v[id])}catch(e){throw Error('Liên kết không hợp lệ: '+field.label)}if(link.protocol!=='https:'||!['drive.google.com','docs.google.com'].includes(link.hostname))throw Error('Tài liệu phải dùng liên kết Drive/Docs HTTPS có phân quyền: '+field.label)}
}
if(v.fromDate&&v.toDate&&v.toDate<v.fromDate)throw Error('Ngày kết thúc không được trước ngày bắt đầu.');
if(conf.code==='A.3.2'&&v.plannedLessons!==''&&v.deliveredLessons!==''){
 const planned=Number(v.plannedLessons),delivered=Number(v.deliveredLessons);
 if(!Number.isFinite(planned)||!Number.isFinite(delivered)||planned<0||delivered<0||!Number.isInteger(planned)||!Number.isInteger(delivered))throw Error('Số tiết phải là số nguyên không âm.');
 if(planned!==delivered&&!v.lagReason)throw Error('Tiến độ có chênh lệch, cần ghi rõ nguyên nhân.');
}
if(v.deadline&&v.requestDate&&v.deadline<v.requestDate)throw Error('Hạn nộp không được trước ngày yêu cầu.');
return v}
function paper(v){const area=$('paper');area.replaceChildren();const institution=make('p','SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG · TRƯỜNG THPT HÒA VANG');institution.style.textAlign='center';const title=make('h2',conf.title.toUpperCase());title.style.textAlign='center';const watermark=make('p','BẢN XEM TRƯỚC – CHƯA LƯU, CHƯA GỬI, CHƯA PHÊ DUYỆT');watermark.style.textAlign='center';area.append(institution,title,watermark);
for(const [heading,fields] of conf.sections){area.append(make('h3',heading));const tab=make('table'),body=make('tbody');for(const [id,label]of fields){const tr=make('tr'),left=make('th',label),right=make('td',v[id]||'—');left.style.whiteSpace='normal';left.style.width='36%';tr.append(left,right);body.append(tr)}tab.append(body);area.append(tab)}
}
function preview(){try{const v=validate(true);paper(v);shown=true;$('previewSection').hidden=false;status('Đã tạo bản xem trước. Không ghi vào máy chủ.','ok');$('previewSection').scrollIntoView({block:'start'})}catch(e){status(e.message,'error')}}
async function checkConnection(){connected=false;for(const btn of document.querySelectorAll('[data-server]'))btn.disabled=true;status('Đang kiểm tra khả năng kết nối và quyền nộp hồ sơ A3…');try{
 if(!window.HVA4)throw Error('Chưa có thư viện kết nối.');
 const r=await window.HVA4.api('hvaA3List',{module:conf.code});
 if(r.schemaVersion!=='HVA-A3-1'||r.module!==conf.code||!Array.isArray(r.records)||r.meta?.canSubmit!==true)throw Error('Backend chưa kích hoạt hoặc chưa cấp quyền cho biểu mẫu '+conf.code);
 records=r.records;renderHistory();connected=true;for(const btn of document.querySelectorAll('[data-server]'))btn.disabled=false;status('Máy chủ đã xác thực quyền. Có thể nộp hồ sơ.','ok')
 }catch(e){records=[];renderHistory();status('Giao diện đã sẵn sàng để xem trước/in. Chức năng lưu–gửi đang chờ Backend: '+e.message,'error')}}
function renderHistory(){
 const count=$('savedCount'),box=$('savedRecords');if(!count||!box)return;
 count.textContent=records.length+' hồ sơ do máy chủ trả về theo quyền truy cập.';
 box.replaceChildren();const table=make('table'),head=make('thead'),tr=make('tr');
 for(const name of ['Mã hồ sơ','Ngày gửi','Người nộp','Trạng thái','Ghi chú xử lý'])tr.append(make('th',name));
 head.append(tr);table.append(head);const tbody=make('tbody');
 records.forEach(item=>{const line=make('tr');[item.id||'',item.submittedAt||item.updatedAt||'',item.owner||'',item.status||'',item.reviewComment||''].forEach(v=>line.append(make('td',v)));tbody.append(line)});
 table.append(tbody);box.append(table);
}
async function send(mode){if(!connected){status('Backend chưa xác nhận quyền gửi. Không có dữ liệu nào được lưu.','error');return}let data;try{data=validate(mode==='submit')}catch(e){status(e.message,'error');return}
 for(const btn of document.querySelectorAll('[data-server]'))btn.disabled=true;
 try{const r=await window.HVA4.api('hvaA3Save',{module:conf.code,mode,record:data});if(r.schemaVersion!=='HVA-A3-1'||r.module!==conf.code||!r.id)throw Error('Máy chủ chưa xác nhận mã hồ sơ.');dirty=false;$('unsaved').textContent='Máy chủ đã ghi nhận hồ sơ.';await checkConnection();status(r.message||'Đã lưu hồ sơ trên máy chủ.','ok')}
 catch(e){status('Không thể xác nhận việc ghi dữ liệu: '+e.message,'error');for(const btn of document.querySelectorAll('[data-server]'))btn.disabled=!connected}
}
build();
})();