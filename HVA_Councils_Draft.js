/* HVA–EDOS | Hồ sơ quản trị 2.3–2.4. Giao diện chưa kết nối Backend. */
(function(){'use strict';
const $=id=>document.getElementById(id), cfg=window.HVA_COUNCIL_CONFIG;
if(!cfg)return;
const state={records:[],selected:new Map(),groups:[],people:new Map(),lastAI:null,serial:0};
const put=(s)=>{$('message').textContent=String(s)};
const uid=p=>String(p.username||p.maGV||'').trim();
function value(){const v={};for(const f of cfg.fields){let n=$(f.id);v[f.id]=n?(n.type==='checkbox'?n.checked:n.value.trim()):''}return v}
function check(v){
 for(const f of cfg.fields)if(f.required&&!String(v[f.id]||'').trim())throw Error('Vui lòng nhập '+f.label+'.');
 const start=v.startDate||v.meetingDate||'',end=v.endDate||'';
 if(start&&end&&end<start)throw Error('Ngày kết thúc phải từ ngày bắt đầu trở đi.');
 if(v.deadline&&v.startDate&&v.deadline<v.startDate)throw Error('Hạn theo dõi không trước ngày bắt đầu.');
 return v;
}
function toText(v){
 let t=cfg.title.toUpperCase()+'\n\n';
 for(const f of cfg.fields)if(v[f.id]!==''&&v[f.id]!=null)t+=f.label+': '+(typeof v[f.id]==='boolean'?(v[f.id]?'Có':'Không'):v[f.id])+'\n';
 const who=[...state.selected.values()].map(x=>x.hoTen||x.username);
 t+='\nTHÀNH PHẦN DỰ KIẾN\n'+(who.join('; ')||'Chưa lựa chọn')+'\n';
 t+='\nLƯU Ý: Chỉ là dự thảo giao diện, chưa phải quyết định/kết luận/văn bản chính thức.';
 return t;
}
function snapshot(){return {fields:value(),members:[...state.selected.keys()],stage:$('stage').value,notes:$('workNote').value.trim(),savedAt:new Date().toISOString()}}
function renderRows(){
 const root=$('draftList');root.replaceChildren();
 if(!state.records.length)root.textContent='Chưa có bản nháp trong phiên làm việc.';
 state.records.forEach((r,i)=>{
  const item=document.createElement('div');item.className='draft-row';
  const title=document.createElement('span');title.textContent=(i+1)+'. '+(r.fields.title||r.fields.caseCode||r.fields.period||cfg.title)+' · '+r.savedAt.replace('T',' ').slice(0,16);
  const open=document.createElement('button');open.type='button';open.textContent='MỞ';open.onclick=()=>{
   for(const f of cfg.fields){const x=$(f.id);if(x)x.value=String(r.fields[f.id]||'')}
   $('stage').value=r.stage;$('workNote').value=r.notes;
   state.selected=new Map(r.members.map(id=>[id,state.people.get(id)]).filter(([,p])=>p));renderPeople();preview();put('Đã mở bản nháp từ phiên hiện tại; chưa lưu lên máy chủ.');
  };
  const del=document.createElement('button');del.type='button';del.textContent='XÓA';del.onclick=()=>{state.records.splice(i,1);renderRows();put('Đã xóa bản nháp khỏi bộ nhớ phiên này.')};
  item.append(title,open,del);root.append(item);
 });
}
function renderPeople(){
 const box=$('roster');box.replaceChildren();
 const q=$('personSearch').value.trim().toLocaleLowerCase('vi');
 for(const g of state.groups){
  const members=[...new Map((g.members||[]).map(p=>[uid(p),p]).filter(([id])=>id)).values()];
  const visible=members.filter(p=>(String(g.tenTo||'')+' '+String(p.hoTen||'')+' '+String(p.tenTo||'')).toLocaleLowerCase('vi').includes(q));
  if(!visible.length)continue;
  const details=document.createElement('details');details.className='group';details.open=!!q;
  const summary=document.createElement('summary');const label=document.createElement('span');label.textContent=String(g.tenTo||'Nhóm')+' ('+members.length+')';
  const tick=document.createElement('label');tick.className='pick-group';tick.onclick=e=>e.stopPropagation();const all=document.createElement('input');all.type='checkbox';
  all.checked=members.every(p=>state.selected.has(uid(p)));
  all.indeterminate=!all.checked&&members.some(p=>state.selected.has(uid(p)));
  all.onchange=()=>{for(const p of members){const id=uid(p);if(all.checked)state.selected.set(id,p);else state.selected.delete(id)}renderPeople()};
  tick.append(all,document.createTextNode('Chọn cả nhóm'));summary.append(label,tick);details.append(summary);
  const list=document.createElement('div');list.className='group-members';
  for(const p of visible){const id=uid(p),line=document.createElement('label'),input=document.createElement('input');input.type='checkbox';input.checked=state.selected.has(id);input.onchange=()=>{if(input.checked)state.selected.set(id,p);else state.selected.delete(id);renderPeople()};line.append(input,document.createTextNode(' '+String(p.hoTen||id)+' · '+String(p.tenTo||g.tenTo||'')));list.append(line)}
  details.append(list);box.append(details);
 }
 if(!box.children.length)box.textContent=state.people.size?'Không tìm thấy nhân sự.':'Chưa nạp nguồn nhân sự HVA.';
 $('peopleCount').textContent=state.selected.size+' người được chọn';
}
async function loadPeople(){
 if(typeof window.HVAPersonnel?.buildGroups!=='function'){put('Chưa tải được HVA_Personnel.js.');return}
 $('loadPeople').disabled=true;
 try{
  state.groups=await window.HVAPersonnel.buildGroups();state.people.clear();
  for(const g of state.groups)for(const p of g.members||[]){const id=uid(p);if(id&&!state.people.has(id))state.people.set(id,{...p,username:id})}
  renderPeople();put('Đã tải '+state.people.size+' nhân sự từ '+state.groups.length+' nhóm; dữ liệu chỉ để chọn trong giao diện.');
 }catch(e){put('Không tải được nhân sự: '+e.message)}
 finally{$('loadPeople').disabled=false}
}
function preview(){try{const v=value();$('preview').textContent=toText(v)+'\n\nGIAI ĐOẠN: '+$('stage').value+'\nGHI CHÚ TRIỂN KHAI: '+$('workNote').value.trim();put('Đã tạo bản xem trước, chưa phát hành.')}catch(e){put(e.message)}}
function save(){
 try{
  const v=check(value());
  if(cfg.id==='discipline'&&!$('safeCheck').checked)throw Error('Xác nhận không nhập dữ liệu cá nhân nhạy cảm vào bản nháp trình duyệt.');
  state.records.unshift(snapshot());state.records=state.records.slice(0,30);renderRows();preview();
  put('Đã lưu bản nháp trong bộ nhớ tạm của trang. Đóng hoặc tải lại trang sẽ mất; chưa gửi máy chủ.');
 }catch(e){put(e.message)}
}
function reset(){if(!confirm('Xóa dữ liệu đang nhập trên màn hình?'))return;for(const f of cfg.fields){let n=$(f.id);if(n)n.value=''}$('stage').selectedIndex=0;$('workNote').value='';$('safeCheck').checked=false;state.selected.clear();renderPeople();$('preview').textContent='Chưa có bản xem trước.';put('Đã dọn dữ liệu trên form, các bản nháp trong phiên vẫn còn.')}
async function ai(){
 const q=$('aiPrompt').value.trim();
 if(!q){put('Vui lòng nhập câu hỏi tham mưu.');return}
 if(!window.HVA_Assistant_Shared?.ask){put('Chưa nạp được dịch vụ AI dùng chung.');return}
 if(cfg.id==='discipline'&&!$('safeCheck').checked){put('Chỉ sử dụng AI với tình huống đã ẩn danh và đánh dấu xác nhận an toàn.');return}
 const button=$('askAI');button.disabled=true;$('applyAI').disabled=true;state.lastAI=null;put('Trợ lý đang chuẩn bị đề xuất...');
 try{
  const allowed=cfg.fields.map(f=>({id:f.id,label:f.label,type:f.type,options:f.options||[]}));const question=[
  'Bạn là trợ lý tham mưu nghiệp vụ nhà trường, chủ đề '+cfg.title+'.',
  'Chỉ đề xuất quy trình và cách chuẩn bị hồ sơ, không kết luận vi phạm, không quyết định kỷ luật/thi đua, không tự bịa quy định pháp luật hay thẩm quyền.',
  'Không xử lý thông tin nhận diện cá nhân, hồ sơ nhạy cảm. Nếu tình huống có người thật thì yêu cầu ẩn danh. Với Ban Thanh tra nhân dân tôn trọng cơ chế giám sát độc lập.',
  'Chỉ trả JSON hợp lệ {"fields":{"fieldId":"giá trị"},"thamMuu":"nội dung tham mưu"}. Trường cho phép: '+JSON.stringify(allowed)+'. Không tự chọn nhân sự, không tự gán ngày hoặc số quyết định. Không phát hành.',
  'Yêu cầu: '+q].join('\n').slice(0,3850);
  const answer=await window.HVA_Assistant_Shared.ask({question,context:'Công việc'});
  const raw=String(answer||'');const a=raw.indexOf('{'),b=raw.lastIndexOf('}');if(a<0||b<=a)throw Error('Phản hồi chưa đúng định dạng.');
  const parsed=JSON.parse(raw.slice(a,b+1)),fields={};
  for(const f of cfg.fields){
   const val=parsed.fields?.[f.id];if(typeof val!=='string'&&typeof val!=='number')continue;const text=String(val).slice(0,3000);
   if(f.type==='select'&&!f.options.includes(text))continue;
   if(f.type==='date'&&text&&!/^\d{4}-\d\d-\d\d$/.test(text))continue;
   fields[f.id]=text;
  }
  state.lastAI=fields;
  $('aiAnswer').textContent='THAM MƯU (CHỈ ĐỂ THAM KHẢO)\n'+String(parsed.thamMuu||'Không có tham mưu.').slice(0,5000)+'\n\nCÁC TRƯỜNG ĐỀ XUẤT\n'+Object.entries(fields).map(([k,v])=>k+': '+v).join('\n');
  $('applyAI').disabled=!Object.keys(fields).length;put('Đã nhận dự thảo tham mưu. Kiểm tra trước khi ĐIỀN FORM. Không tự ghi dữ liệu.');
 }catch(e){put('Không tạo được đề xuất: '+String(e.message||e).slice(0,200))}
 finally{button.disabled=false}
}
function applyAI(){if(!state.lastAI)return;for(const [id,val]of Object.entries(state.lastAI))if($(id))$(id).value=val;preview();put('Đã điền các ô hợp lệ; người dùng cần kiểm tra trước khi sử dụng.')}
async function copy(){
 try{await navigator.clipboard.writeText($('preview').textContent);put('Đã sao chép bản xem trước.')}catch(_){put('Không sao chép được; có thể chọn văn bản để sao chép thủ công.')}
}
function init(){
 $('loadPeople').onclick=loadPeople;$('personSearch').oninput=renderPeople;
 $('previewBtn').onclick=preview;$('saveBtn').onclick=save;$('resetBtn').onclick=reset;
 $('copyBtn').onclick=copy;$('askAI').onclick=ai;$('applyAI').onclick=applyAI;
 $('clearPeople').onclick=()=>{state.selected.clear();renderPeople()};
 $('safeCheckLabel').hidden=cfg.id!=='discipline';
 $('aiPrompt').placeholder=cfg.aiHint;
 $('stage').replaceChildren(...cfg.stages.map(s=>new Option(s,s)));
 renderRows();renderPeople();loadPeople();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();