/* HVA — Bộ công cụ dùng chung cho bản nháp Phân công/Điều phối.
 * Không phát hành, không gọi tuyến ghi dữ liệu Backend.
 * Nguồn nhân sự và AI kế thừa HVA_Personnel/HVA_Assistant_Shared.
 */
(function(root){'use strict';
const $=id=>document.getElementById(id);
const mode=document.body.dataset.opsMode;
if(!['cm','dp'].includes(mode))return;
let groups=[], people=new Map(), chosen=new Map(), leader='', rows=[], draft=null;
const message=txt=>{const n=$('opsNotice');if(n)n.textContent=String(txt)};
const pickId=p=>String(p?.username||p?.maGV||'').trim();
function get(){return {people:[...chosen.keys()],leader,rows:rows.map(r=>({...r}))}}
function set(v){
 const source=v&&typeof v==='object'?v:{};
 chosen=new Map();
 for(const id of Array.isArray(source.people)?source.people:[]){const p=people.get(String(id));if(p)chosen.set(String(id),p)}
 leader=chosen.has(source.leader)?source.leader:'';
 rows=Array.isArray(source.rows)?source.rows.slice(0,60).filter(r=>r&&typeof r==='object').map(r=>({name:String(r.name||'').slice(0,400),owner:String(r.owner||''),due:String(r.due||''),result:String(r.result||'').slice(0,500)})):[];
 render();renderRows();
}
function reset(){set({people:[],leader:'',rows:[]})}
function personSummary(){const names=[...chosen.values()].map(p=>p.hoTen||p.username);return names.length?names.join(', '):'Chưa chọn nhân sự'}
function summary(){
 let line='\n\nNGUỒN NHÂN SỰ VIP\n';
 line+='Người được chọn: '+personSummary();
 line+='\nChủ trì: '+(chosen.get(leader)?.hoTen||'Chưa chọn');
 if(rows.length){line+='\n\nPHÂN CHIA ĐẦU VIỆC';rows.forEach((r,i)=>{line+='\n'+(i+1)+'. '+(r.name||'Chưa ghi đầu việc')+(r.owner?' — '+(people.get(r.owner)?.hoTen||r.owner):'')+(r.due?' — Hạn: '+r.due.replace('T',' '):'')+(r.result?' — Kết quả: '+r.result:'')})}
 return line;
}
function render(){
 const rootEl=$('opsPeople');if(!rootEl)return;rootEl.replaceChildren();
 const q=String($('opsSearch')?.value||'').trim().toLocaleLowerCase('vi');
 for(const g of groups){
  const members=[...new Map((g.members||[]).map(p=>[pickId(p),p]).filter(([k])=>k)).values()];
  const visible=members.filter(p=>(String(g.tenTo||'')+' '+String(p.hoTen||'')+' '+String(p.tenTo||'')+' '+String(p.chucVu||'')).toLocaleLowerCase('vi').includes(q));
  if(!visible.length)continue;
  const details=document.createElement('details');details.className='ops-group';details.open=Boolean(q);
  const head=document.createElement('summary');const name=document.createElement('b');name.textContent=String(g.tenTo||'Nhóm')+' ('+members.length+')';
  const choose=document.createElement('label');choose.onclick=e=>e.stopPropagation();
  const toggle=document.createElement('input');toggle.type='checkbox';
  toggle.checked=members.length>0&&members.every(p=>chosen.has(pickId(p)));
  toggle.indeterminate=!toggle.checked&&members.some(p=>chosen.has(pickId(p)));
  toggle.onchange=()=>{for(const p of members){const id=pickId(p);if(toggle.checked)chosen.set(id,p);else chosen.delete(id)}if(!chosen.has(leader))leader='';render()};
  choose.append(toggle,document.createTextNode(' Cả nhóm'));head.append(name,choose);details.append(head);
  const body=document.createElement('div');body.className='ops-members';
  for(const p of visible){
   const id=pickId(p),label=document.createElement('label');const input=document.createElement('input');input.type='checkbox';input.checked=chosen.has(id);
   input.onchange=()=>{if(input.checked)chosen.set(id,p);else chosen.delete(id);if(!chosen.has(leader))leader='';render()};
   const desc=document.createElement('span');desc.textContent=(p.hoTen||id)+' · '+(p.tenTo||g.tenTo||'');
   label.append(input,desc);body.append(label);
  }
  details.append(body);rootEl.append(details);
 }
 if(!rootEl.children.length)rootEl.textContent=people.size?'Không tìm thấy nhân sự phù hợp.':'Chưa tải nguồn nhân sự VIP.';
 const select=$('opsLeader');if(select){select.replaceChildren();const placeholder=new Option('Chọn người chủ trì từ danh sách đã chọn','');select.add(placeholder);for(const [id,p] of chosen)select.add(new Option(p.hoTen||id,id));select.value=chosen.has(leader)?leader:''}
 $('opsCount').textContent=chosen.size+' nhân sự đã chọn · '+groups.length+' nhóm';
}
async function loadPeople(){
 const build=root.HVAPersonnel?.buildGroups;if(typeof build!=='function'){message('Không tìm thấy nguồn nhân sự VIP dùng chung.');return}
 $('opsReload').disabled=true;message('Đang tải nguồn nhân sự VIP...');
 try{
  groups=await build();people=new Map();
  for(const g of groups)for(const p of g.members||[]){const id=pickId(p);if(id&&!people.has(id))people.set(id,{...p,username:id})}
  const saved=get();set(saved);message('Đã tải '+people.size+' nhân sự; chọn nhóm hoặc cá nhân. Chưa gửi dữ liệu.');
 }catch(e){message('Không tải được nhân sự: '+String(e.message||e))}
 finally{$('opsReload').disabled=false}
}
function renderRows(){
 const rootEl=$('opsRows');rootEl.replaceChildren();
 rows.forEach((row,index)=>{
  const wrap=document.createElement('div');wrap.className='ops-row';
  const fields=[['name','Tên đầu việc','text'],['owner','Người phụ trách','select'],['due','Mốc hoàn thành','datetime-local'],['result','Minh chứng / sản phẩm','text']];
  fields.forEach(([key,label,type])=>{
   const holder=document.createElement('label');holder.className='ops-row-field';const caption=document.createElement('span');caption.textContent=label;
   let input;
   if(type==='select'){input=document.createElement('select');input.add(new Option('Chọn người phụ trách',''));for(const [id,p] of chosen)input.add(new Option(p.hoTen||id,id));input.value=chosen.has(row.owner)?row.owner:''}
   else{input=document.createElement('input');input.type=type;input.value=row[key]||''}
   input.onchange=()=>{rows[index][key]=input.value};holder.append(caption,input);wrap.append(holder);
  });
  const del=document.createElement('button');del.type='button';del.textContent='Xóa đầu việc';del.className='ops-del';del.onclick=()=>{rows.splice(index,1);renderRows()};wrap.append(del);rootEl.append(wrap);
 });
 $('opsRowsCount').textContent=rows.length+' đầu việc';
}
const targetIds=mode==='cm'?['schoolYear','grade','subject','className','periods','teacher','notes']:['title','source','owner','members','deadline','deliverable','priority','details'];
const taskContext=mode==='cm'
 ?'phân công chuyên môn, môn, lớp, giáo viên, số tiết và ghi chú điều kiện'
 :'điều phối công việc, người phụ trách, người phối hợp, sản phẩm và đầu việc';
async function ask(){
 const prompt=$('opsPrompt').value.trim();if(!prompt){message('Hãy nhập yêu cầu trước khi gọi Trợ lý.');return}
 if(!root.HVA_Assistant_Shared?.ask){message('Không có dịch vụ Trợ lý dùng chung.');return}
 const btn=$('opsAsk');btn.disabled=true;$('opsApply').disabled=true;draft=null;message('Trợ lý đang xây dựng dự thảo...');
 try{
  const desc=targetIds.map(id=>({id,options:$(id).tagName==='SELECT'?[...$(id).options].map(o=>o.value):undefined}));
  const request=['Bạn là Trợ lý VIP Pro của Trường THPT Hòa Vang. Hỗ trợ '+taskContext+'.',
  'Chỉ trả một JSON hợp lệ: {"fields":{"id":"giá trị"},"thamMuu":"đề xuất ngắn","subtasks":[{"name":"đầu việc","result":"sản phẩm"}]}.',
  'Các trường được phép: '+JSON.stringify(desc)+'. Không tự bịa tên người, ngày giờ, số tiết hay văn bản; thiếu thì bỏ trống. Không tự chọn nhân sự; không công bố.',
  'Người quản lý phải xác nhận phương án. Yêu cầu: '+prompt].join('\n').slice(0,3900);
  const answer=await root.HVA_Assistant_Shared.ask({question:request,context:'Công việc'});
  const raw=String(answer||'');const a=raw.indexOf('{'),b=raw.lastIndexOf('}');
  if(a<0||b<=a)throw Error('Phản hồi không phải JSON hợp lệ.');
  const parsed=JSON.parse(raw.slice(a,b+1));
  const fields={};for(const id of targetIds){const v=parsed.fields?.[id];if(typeof v!=='string'&&typeof v!=='number')continue;const input=$(id);const val=String(v).slice(0,5000);if(input.tagName==='SELECT'&&![...input.options].some(o=>o.value===val))continue;if(input.type==='date'&&val&&!/^\d{4}-\d\d-\d\d$/.test(val))continue;if(input.type==='datetime-local'&&val&&!/^\d{4}-\d\d-\d\dT\d\d:\d\d$/.test(val))continue;fields[id]=val}
  if(!Object.keys(fields).length&&!parsed.subtasks?.length)throw Error('Chưa có dữ liệu phù hợp để điền.');
  draft={fields,subtasks:Array.isArray(parsed.subtasks)?parsed.subtasks.slice(0,20).filter(x=>x&&typeof x.name==='string').map(x=>({name:x.name.slice(0,400),owner:'',due:'',result:String(x.result||'').slice(0,500)})):[]};
  $('opsAnswer').textContent='THAM MƯU\n'+String(parsed.thamMuu||'Vui lòng đối chiếu dữ liệu trước khi xác nhận.')+'\n\nDỰ THẢO\n'+Object.entries(fields).map(([k,v])=>k+': '+v).join('\n')+'\n\nĐẦU VIỆC ĐỀ XUẤT\n'+draft.subtasks.map((x,i)=>(i+1)+'. '+x.name+' — '+x.result).join('\n');
  $('opsApply').disabled=false;message('Đã có dự thảo. Bấm ĐIỀN FORM nếu đồng ý; chưa gửi.');
 }catch(e){message('Chưa tạo được dự thảo: '+String(e.message||e).slice(0,260))}
 finally{btn.disabled=false}
}
function apply(){
 if(!draft)return;
 for(const [id,value] of Object.entries(draft.fields)){$(id).value=value;$(id).dispatchEvent(new Event('change',{bubbles:true}))}
 if(draft.subtasks.length){rows.push(...draft.subtasks);rows=rows.slice(0,60);renderRows()}
 $('opsAnswer').textContent+='\n\n[Đã điền biểu mẫu, chưa phát hành]';
 message('Đã điền các trường phù hợp. Thầy rà soát nhân sự, số tiết, thời gian trước khi lưu nháp.');
}
function bind(){
 $('opsSearch').oninput=render;
 $('opsLeader').onchange=e=>{leader=e.target.value;if(leader&&people.has(leader)){if(mode==='dp')$('owner').value=people.get(leader).hoTen;else $('teacher').value=people.get(leader).hoTen}};
 $('opsReload').onclick=loadPeople;
 $('opsAddRow').onclick=()=>{rows.push({name:'',owner:'',due:'',result:''});renderRows()};
 $('opsAsk').onclick=ask;$('opsApply').onclick=apply;
 $('opsCopy').onclick=async()=>{try{await navigator.clipboard.writeText($('opsAnswer').textContent);message('Đã sao chép tham mưu.')}catch(e){message('Chưa sao chép được, vui lòng chọn nội dung để sao chép.')}}
 loadPeople();
}
root.HVAOperationsExtra=Object.freeze({get,set,reset,summary,refresh:render});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind);else bind();
})(window);