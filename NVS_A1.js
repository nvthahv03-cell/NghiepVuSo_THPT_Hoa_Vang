/* GitHub Pages A.1: existing NVS session/helpers, input and preview only.
 * No report persistence, no new backend, no SQLite/local operating data.
 */
(()=>{'use strict';
const $=id=>document.getElementById(id),query=new URL(location.href).searchParams;
const group=['A11','A12','A13','A14'].includes(query.get('group'))?query.get('group'):'A11';
const groups={A11:'A.1.1 — Thực hiện nhiệm vụ – Báo cáo khác',A12:'A.1.2 — Công tác chủ nhiệm và giáo dục hòa nhập',A13:'A.1.3 — Sinh hoạt chuyên môn, sinh hoạt cụm',A14:'A.1.4 — Bồi dưỡng HSG, phụ đạo, ôn thi'};
const types={task:{group:'A11',name:'Báo cáo nhiệm vụ được giao'},deployment:{group:'A11',name:'Báo cáo công tác điều động'},training:{group:'A11',name:'Báo cáo tập huấn, bồi dưỡng, hội nghị, hội thảo'},other:{group:'A11',name:'Báo cáo khác theo yêu cầu'},team:{group:'A13',name:'Sinh hoạt tổ/nhóm chuyên môn'},cluster:{group:'A13',name:'Sinh hoạt cụm chuyên môn'},gifted:{group:'A14',name:'Bồi dưỡng học sinh giỏi'},support:{group:'A14',name:'Phụ đạo học sinh'},exam:{group:'A14',name:'Ôn thi'}};
let schemas={},actor=null,actorUsername='',people=[],renderedType='',detailCache={},busy=false,dirty=false;
const fieldIds=['type','year','title','reference','organizer','start','end','content','result','recommend','evidence'];
function notice(message,error=false){$('notice').textContent=message;$('notice').dataset.error=String(error);}
function stored(key){for(const kind of ['localStorage','sessionStorage']){try{const value=window[kind].getItem(key);if(value)return value;}catch(_){}}return '';}
function readSession(){
 const token=stored('hvaSessionToken'),expiry=Number(stored('hvaSessionExpiresAt'));let user={};
 try{user=JSON.parse(stored('user')||'{}')||{};}catch(_){}
 const username=String(user.tenDangNhap||user.username||user.userName||'').trim();
 if(!token||!Number.isFinite(expiry)||expiry<=Date.now()||!username)throw Error('Phiên đăng nhập chưa có hoặc đã hết hạn. Vui lòng trở về trang chủ để đăng nhập.');
 return {token,user,username};
}
function requireSession(){try{const current=readSession();if(actorUsername&&current.username.toLowerCase()!==actorUsername.toLowerCase())throw Error('Tài khoản NVS đã thay đổi. Vui lòng tải lại trang trước khi tiếp tục.');return current;}catch(error){$('fields').disabled=true;$('askAI').disabled=true;$('loginLink').hidden=false;throw error;}}
function element(tag,text){const node=document.createElement(tag);if(text!==undefined)node.textContent=text;return node;}
function details(){return Object.fromEntries([...$('specificFields').querySelectorAll('[data-detail]')].map(node=>[node.dataset.detail,node.value.trim()]));}
function participants(){return [...$('participants').selectedOptions].map(x=>x.value);}
function countPeople(){$('participantCount').textContent=people.length?'Đã chọn '+participants().length+' người từ danh sách nhận được theo quyền hiện có.':'Chưa tải danh sách nhân sự; không dùng dữ liệu mẫu.';}
function renderSpecific(restore){
 if(renderedType)detailCache[renderedType]=details();renderedType=$('type').value;
 const schema=schemas[renderedType]||{fields:[]},values=restore||detailCache[renderedType]||{};
 $('specificFields').replaceChildren();
 for(const [key,label,kind] of schema.fields){const wrap=element('label',label),input=element(kind==='textarea'?'textarea':'input');input.id='detail-'+key;input.dataset.detail=key;input.maxLength=kind==='textarea'?4000:1000;if(kind!=='textarea')input.type=kind;if(kind==='number'){input.min='0';input.max=key==='progress'?'100':'100000';input.step='any';}if(kind==='textarea')wrap.className='full';input.value=values[key]||'';wrap.append(input);$('specificFields').append(wrap);}
 $('participantBlock').hidden=!schema.participants;if(!schema.participants)for(const option of $('participants').options)option.selected=false;countPeople();
}
function driveUrl(value){return !value||/^https:\/\/(?:drive|docs)\.google\.com\/(?:file\/d\/|document\/d\/|spreadsheets\/d\/|presentation\/d\/|drive\/folders\/)[A-Za-z0-9_-]+(?:[/?#].*)?$/.test(value);}
function values(){return {...Object.fromEntries(fieldIds.map(id=>[id,$(id).value.trim()])),details:details(),participants:participants()};}
function validate(){
 requireSession();if(!$('reportForm').reportValidity())return false;
 if($('start').value&&$('end').value&&$('end').value<$('start').value)throw Error('Ngày kết thúc không được trước ngày bắt đầu.');
 if(!driveUrl($('evidence').value.trim()))throw Error('Minh chứng phải là liên kết Google Drive hoặc Google Docs hợp lệ.');
 for(const [key,,kind] of schemas[$('type').value].fields)if(kind==='url'&&!driveUrl($('detail-'+key).value.trim()))throw Error('Tài liệu/biên bản phải là liên kết Google Drive hoặc Google Docs hợp lệ.');return true;
}
function previewText(data){
 const labels={year:'Năm học',title:'Tên báo cáo',reference:'Mã nhiệm vụ/số văn bản',organizer:'Đơn vị giao nhiệm vụ/tổ chức',start:'Bắt đầu',end:'Kết thúc',content:'Nội dung đã thực hiện',result:'Kết quả và số liệu có nguồn',recommend:'Kiến nghị/đề xuất',evidence:'Minh chứng'};
 const lines=['TRƯỜNG THPT HÒA VANG','BÁO CÁO '+types[data.type].name,'Người báo cáo: '+$('name').value,'Tổ/bộ phận: '+$('unit').value,'Chức vụ: '+$('role').value];
 for(const [key,label] of Object.entries(labels))if(data[key])lines.push(label+': '+data[key]);
 for(const [key,label] of schemas[data.type].fields)if(data.details[key])lines.push(label+': '+data.details[key]);
 if(data.participants.length)lines.push('Thành phần tham dự: '+data.participants.map(id=>people.find(p=>p.username===id)?.hoTen||id).join(', '));
 lines.push('BẢN XEM TRƯỚC — CHƯA LƯU, CHƯA GỬI.');return lines.join('\n\n');
}
async function run(fn){if(busy)return;busy=true;const controls=[$('askAI'),$('loadPeople'),$('applyAI')],states=controls.map(x=>x.disabled);controls.forEach(x=>x.disabled=true);try{await fn();}catch(error){notice(error.message,true);}finally{busy=false;controls.forEach((x,i)=>x.disabled=states[i]);let valid=false;try{valid=readSession().username.toLowerCase()===actorUsername.toLowerCase();}catch(_){}$('askAI').disabled=!valid;$('loadPeople').disabled=!valid;$('applyAI').disabled=!$('aiDraft').value||!valid;if(!valid)$('fields').disabled=true;}}
$('heading').textContent=groups[group];document.title=groups[group]+' | Trường THPT Hòa Vang';
for(const node of document.querySelectorAll('[data-group]'))if(node.dataset.group===group)node.setAttribute('aria-current','page');
$('blocked').hidden=group!=='A12';$('legacyDTHT').hidden=group!=='A14';$('formSection').hidden=group==='A12';$('assistant').hidden=group==='A12';$('historySection').hidden=group==='A12';
$('reportForm').addEventListener('submit',event=>{event.preventDefault();notice('Đang phát triển — chưa mở chức năng lưu/gửi báo cáo mới.');});
for(const event of ['input','change'])$('reportForm').addEventListener(event,()=>{dirty=true;});
$('type').onchange=()=>{renderSpecific();$('previewSection').hidden=true;};
$('participants').onchange=countPeople;
$('participantSearch').oninput=()=>{const q=$('participantSearch').value.toLocaleLowerCase('vi');for(const option of $('participants').options)option.hidden=!option.text.toLocaleLowerCase('vi').includes(q);};
$('preview').onclick=()=>{try{if(!validate())return;$('previewText').textContent=previewText(values());$('previewSection').hidden=false;notice('Đã mở bản xem trước. Nội dung CHƯA được lưu hoặc gửi.');$('previewSection').scrollIntoView({behavior:'smooth'});}catch(error){notice(error.message,true);}};
$('edit').onclick=()=>{$('previewSection').hidden=true;$('formSection').scrollIntoView({behavior:'smooth'});};
$('newReport').onclick=()=>{if(dirty&&!confirm('Làm mới nội dung chưa lưu trong trang này?'))return;const selected=$('type').value;$('reportForm').reset();$('type').value=selected;renderedType='';detailCache={};renderSpecific({});$('previewSection').hidden=true;dirty=false;notice('Đã làm mới nội dung trên trang; không có dữ liệu nào được gửi.');};
$('loadPeople').onclick=()=>run(async()=>{
 requireSession();notice('Đang tải danh sách nhân sự từ nguồn NVS hiện có…');
 let groups;try{groups=await window.HVAPersonnel.buildGroups();}catch(_){throw Error('Chưa tải được nhân sự theo phiên NVS hiện có. Vui lòng kiểm tra đăng nhập hoặc liên hệ quản trị.');}const unique=new Map();
 for(const item of groups||[])for(const member of item.members||[]){const username=String(member.username||'').trim();if(username)unique.set(username.toLowerCase(),{username,hoTen:String(member.hoTen||username),toBoPhan:String(member.tenTo||member.toBoPhan||item.tenTo||'')});}
 people=[...unique.values()].sort((a,b)=>a.hoTen.localeCompare(b.hoTen,'vi'));$('participants').replaceChildren();for(const p of people)$('participants').append(new Option(p.hoTen+' · '+p.toBoPhan,p.username));countPeople();notice(people.length?'Đã nhận danh sách nhân sự theo phiên hiện có. Lựa chọn chỉ dùng cho bản xem trước.':'Nguồn hiện có không trả danh sách nhân sự; không thay bằng dữ liệu mẫu.');
});
$('askAI').onclick=()=>run(async()=>{const session=requireSession(),prompt=$('aiPrompt').value.trim();if(!prompt)throw Error('Vui lòng nhập yêu cầu và thông tin có nguồn.');notice('Đang yêu cầu trợ lý NVS hiện có soạn dự thảo…');$('aiDraft').value='';let draft;try{draft=await window.HVA_Assistant_Shared.draftReport({prompt,reportType:types[$('type').value].name,sessionToken:session.token});}catch(_){throw Error('Trợ lý chưa trả được dự thảo. Vui lòng kiểm tra phiên đăng nhập hoặc liên hệ quản trị.');}$('aiDraft').value=draft;notice('Đã nhận dự thảo. Cần kiểm tra nội dung, số liệu và nguồn; chưa lưu/gửi báo cáo.');});
$('applyAI').onclick=()=>{try{requireSession();if(confirm('Chép dự thảo vào nội dung để bạn kiểm tra, không tự lưu/gửi?')){$('content').value=$('aiDraft').value;dirty=true;notice('Đã chép dự thảo để chỉnh sửa. CHƯA lưu hoặc gửi.');}}catch(error){notice(error.message,true);}};
if(group==='A12'){notice('Đang phát triển — các phân hệ mới chưa mở dữ liệu học sinh. Báo cáo chủ nhiệm hiện hành giữ nguyên.');return;}
(async()=>{try{const response=await fetch('./NVS_A1.schemas.json',{cache:'no-store'});if(!response.ok)throw Error('Chưa tải được biểu mẫu. Vui lòng tải lại trang.');schemas=await response.json();for(const [id,type] of Object.entries(types).filter(([,type])=>type.group===group))$('type').append(new Option(type.name,id));if(types[query.get('type')]?.group===group)$('type').value=query.get('type');renderSpecific();const session=readSession();actor=session.user;actorUsername=session.username;$('name').value=String(actor.hoTen||actor.fullName||session.username);$('unit').value=String(actor.toBoPhan||actor.tenTo||actor.to||'');$('role').value=String(actor.chucVu||actor.viTriViecLam||'');$('fields').disabled=false;$('askAI').disabled=false;notice('Có thể nhập và xem trước theo tài khoản NVS đã đăng nhập. Lưu/gửi/lịch sử báo cáo mới đang phát triển.');}catch(error){$('fields').disabled=true;$('askAI').disabled=true;$('loginLink').hidden=false;notice(error.message,true);}})();
})();
