/* HVA–EDOS: tra cứu tổng hợp Quản trị. Chỉ hiển thị kết quả từ Backend đã xác thực. */
(function(){'use strict';
const API='https://script.google.com/macros/s/AKfycbzTRkdqyYYI8LQo9MkiTjEIXkAC7BWK1MroUXPuvKMl9Yu_o9gXFS8QCcyQmq78-ikvvg/exec';
const by=id=>document.getElementById(id);
const state={ready:false,busy:false,mode:'person',person:null,results:null,criteria:null};
const read=k=>{for(const name of ['sessionStorage','localStorage'])try{const s=window[name].getItem(k);if(s)return s}catch(_){ }return ''};
const note=(id,v,err=false)=>{const t=by(id);t.textContent=String(v||'');t.classList.toggle('error',!!err)};
const el=(tag,value,cl)=>{const x=document.createElement(tag);x.textContent=String(value??'');if(cl)x.className=cl;return x};
const topicNames={all:'Tất cả nghiệp vụ',dtht:'Dạy thêm – học thêm',ktnb:'Kiểm tra nội bộ',a22:'Hồ sơ nhóm A',task:'Giao việc'};
function buttons(){
 for(const id of ['modePerson','modeTopic','clear','personQuery','topic','schoolYear','team','keyword','reason'])by(id).disabled=state.busy;
 by('search').disabled=!state.ready||state.busy;
 by('findPeople').disabled=!state.ready||state.busy;
 for(const id of ['exportXlsx','exportCsv','exportPdf'])by(id).disabled=!state.ready||state.busy||!state.results||state.results.truncated||!Array.isArray(state.results.sources)||!state.results.sources.some(x=>x.status==='CONNECTED');
}
async function api(action,props={}){
 const sessionToken=read('hvaSessionToken');if(!sessionToken)throw Error('Phiên EDOS đã hết hạn hoặc chưa đăng nhập.');
 const response=await fetch(API,{method:'POST',headers:{'Content-Type':'text/plain;charset=utf-8'},body:JSON.stringify({action,sessionToken,...props})});
 if(!response.ok)throw Error('Backend trả lỗi kết nối HTTP '+response.status+'.');
 let x;try{x=await response.json()}catch(_){throw Error('Backend chưa hỗ trợ trả JSON hợp lệ.')}
 if(!x||(x.success!==true&&x.ok!==true))throw Error(String(x?.message||'Backend chưa kết nối tuyến tra cứu Quản trị.'));
 return x;
}
function clearResult(message='Tiêu chí tìm kiếm thay đổi. Hãy tra cứu lại trước khi xuất file.'){
 state.results=null;state.criteria=null;
 by('sourceList').replaceChildren();by('resultCount').textContent='Chưa có dữ liệu.';
 by('reportSummary').textContent='Chưa có kết quả tra cứu từ Backend với tiêu chí hiện tại.';
 const tr=document.createElement('tr'),td=el('td','Chưa có kết quả xác thực từ Backend.');td.colSpan=8;tr.append(td);by('rows').replaceChildren(tr);
 note('resultsStatus',message);buttons();
}
function modeTo(mode){
 state.mode=mode;state.person=null;
 by('personPanel').hidden=mode!=='person';
 by('modePerson').setAttribute('aria-pressed',String(mode==='person'));
 by('modeTopic').setAttribute('aria-pressed',String(mode==='topic'));
 by('peopleList').replaceChildren();by('pickedPerson').hidden=true;
 clearResult();
}
function checkCriteria(){
 const mode=state.mode,teacherUsername=mode==='person'?String(state.person?.username||''):'';
 const topic=by('topic').value,schoolYear=by('schoolYear').value.trim(),team=by('team').value.trim(),keyword=by('keyword').value.trim(),reason=by('reason').value.trim();
 if(mode==='person'&&!teacherUsername)throw Error('Hãy tìm và chọn giáo viên trong danh sách nhân sự đã xác thực.');
 if(mode==='topic'&&topic==='all'&&keyword.length<2)throw Error('Chọn lĩnh vực cụ thể hoặc nhập ít nhất hai ký tự từ khóa.');
 if(schoolYear&&!/^\d{4}[-–]\d{4}$/.test(schoolYear))throw Error('Năm học phải có dạng 2026-2027.');
 if(reason.length<8)throw Error('Cần nêu mục đích tra cứu ít nhất 8 ký tự để ghi nhật ký kiểm toán.');
 return {mode,teacherUsername,topic,schoolYear,team,keyword,reason};
}
function pick(p){
 const b=document.createElement('button');b.type='button';b.className='person';
 const name=el('strong',p.name||p.username),detail=el('small',[p.username,p.team,p.role].filter(Boolean).join(' · '));
 b.append(name,detail);
 b.addEventListener('click',()=>{state.person={username:String(p.username||''),name:String(p.name||'')};
  by('pickedPerson').textContent='Đã chọn: '+state.person.name+' ('+state.person.username+')';by('pickedPerson').hidden=false;
  by('peopleList').replaceChildren();note('peopleStatus','Đã xác định tài khoản từ danh sách nhân sự chính thức.');clearResult();
 });
 return b;
}
async function people(){
 const text=by('personQuery').value.trim(),reason=by('reason').value.trim();
 if(text.length<2){note('peopleStatus','Nhập ít nhất hai ký tự để tìm giáo viên.',true);return}
 if(reason.length<8){note('peopleStatus','Vui lòng nhập mục đích tra cứu ít nhất 8 ký tự trước khi tìm người.',true);by('reason').focus();return}
 state.busy=true;buttons();note('peopleStatus','Đang tra cứu nhân sự trên máy chủ...');
 state.person=null;by('pickedPerson').hidden=true;by('peopleList').replaceChildren();clearResult();
 try{
  const data=await api('nvsAdminLookupPeople',{query:text,reason});
  if(!Array.isArray(data.people))throw Error('Chưa có danh sách nhân sự hợp lệ.');
  const a=data.people.slice(0,30);by('peopleList').replaceChildren(...a.map(pick));
  note('peopleStatus',a.length?'Tìm thấy '+a.length+' người. Chọn đúng giáo viên để tra cứu.':'Không có nhân sự phù hợp trong nguồn đã xác thực.');
 }catch(e){note('peopleStatus','Không thể tìm nhân sự: '+e.message,true)}
 finally{state.busy=false;buttons()}
}
function render(data,c){
 const sources=Array.isArray(data.sources)?data.sources:[];
 by('sourceList').replaceChildren();
 for(const item of sources){
  const box=el('div','', 'source');
  box.append(el('strong',item.label||item.topic),el('em',item.status==='CONNECTED'?'ĐÃ ĐỌC NGUỒN':item.status==='NOT_CONNECTED'?'CHƯA KẾT NỐI':'LỖI NGUỒN',item.status==='CONNECTED'?'ok':'no'),el('p',item.reason||''));
  by('sourceList').append(box);
 }
 const rows=Array.isArray(data.records)?data.records:[];
 const body=by('rows');body.replaceChildren();
 if(!rows.length){const tr=document.createElement('tr'),td=el('td','Không tìm thấy hồ sơ phù hợp trong những nguồn đã kết nối. Cần đối chiếu trạng thái từng nguồn.');td.colSpan=8;tr.append(td);body.append(tr);}
 for(const r of rows){
  const tr=document.createElement('tr');
  for(const value of [r.sourceName||r.source,r.recordId,(r.name||r.username||'')+(r.team?' · '+r.team:''),r.schoolYear,r.title,r.status,r.updatedAt,r.detail])tr.append(el('td',value));
  body.append(tr);
 }
 const filterText='Tra cứu '+(c.mode==='person'?'theo giáo viên '+(state.person?.name||c.teacherUsername):'theo nội dung nghiệp vụ')
   +' · '+topicNames[c.topic]+' · Năm học: '+(c.schoolYear||'Tất cả')+' · Tổ: '+(c.team||'Tất cả')
   +' · Từ khóa: '+(c.keyword||'Không hạn định')+' · Mục đích: '+c.reason;
 by('reportSummary').textContent=filterText+' · Tổng kết quả: '+Number(data.totalFound??rows.length)
   +' · Thời điểm Backend: '+String(data.serverTime||'chưa xác định')+'.';
 by('resultCount').textContent='Hiển thị '+rows.length+' / '+Number(data.totalFound??rows.length)+' bản ghi.';
 const incomplete=sources.filter(x=>x.status!=='CONNECTED').map(x=>x.label||x.topic);
 const warnings=incomplete.length?' Các nguồn chưa có dữ liệu hợp lệ: '+incomplete.join(', ')+'.':'';
 note('resultsStatus',data.truncated
  ?'Kết quả vượt giới hạn '+rows.length+' bản ghi; hãy thu hẹp tiêu chí để xuất đầy đủ. Không cho xuất tệp bị cắt.'+warnings
  :'Đã truy xuất '+rows.length+' bản ghi theo quyền tài khoản. Không tìm thấy dữ liệu không đồng nghĩa chưa thực hiện.'+warnings,
  !!data.truncated);
}
async function search(){
 let c;try{c=checkCriteria()}catch(e){note('resultsStatus',e.message,true);return}
 state.busy=true;buttons();clearResult('Đang truy xuất hồ sơ từ Backend...');
 try{
  const result=await api('nvsAdminLookupSearch',c);
  if(!Array.isArray(result.records)||!Array.isArray(result.sources))throw Error('Backend chưa cung cấp kết quả đầy đủ.');
  state.criteria=c;state.results=result;render(result,c);
 }catch(e){clearResult('Tra cứu không thành công: '+e.message);note('resultsStatus','Tra cứu không thành công: '+e.message,true)}
 finally{state.busy=false;buttons()}
}
function exportMeta(data,c){
 let viewer='';try{const u=JSON.parse(read('user')||'{}');viewer=String(u.hoTen||u.username||'')}catch(_){}
 return{mode:c.mode,viewer,teacher:c.teacherUsername||'Toàn trường',
  topic:topicNames[c.topic],schoolYear:c.schoolYear||'Tất cả',team:c.team||'Toàn trường',keyword:c.keyword||'',
  reason:c.reason,totalFound:data.totalFound,truncated:!!data.truncated,exportedAt:new Date().toISOString()};
}
async function output(kind){
 if(!state.results||!state.criteria||state.results.truncated||!state.results.sources?.some(x=>x.status==='CONNECTED')){note('resultsStatus','Chưa có nguồn dữ liệu kết nối hoặc kết quả bị cắt; không thể xuất bảng thiếu căn cứ.',true);return}
 const c={...state.criteria};state.busy=true;buttons();note('resultsStatus','Đang xác minh lại quyền và ghi nhật ký xuất file trên máy chủ...');
 try{
  // Yêu cầu riêng bắt buộc có ghi nhật ký xuất; không sử dụng kết quả cũ để bỏ qua kiểm soát.
  const result=await api('nvsAdminLookupExport',c);
  if(!Array.isArray(result.records)||!Array.isArray(result.sources)||result.truncated)throw Error('Không xác nhận được tập dữ liệu xuất đầy đủ.');
  const x=window.HVA_ADMIN_LOOKUP_EXPORT;if(!x)throw Error('Bộ tạo file Excel/CSV chưa tải đúng.');
  const meta=exportMeta(result,c);
  if(kind==='xlsx')x.xlsx(result.records,meta,result.sources);
  else if(kind==='csv')x.csvFile(result.records,meta,result.sources);
  else {
   state.results=result;render(result,c);
   window.print();
  }
  note('resultsStatus',kind==='pdf'?'Đã gọi hộp thoại in. Chọn “Lưu dưới dạng PDF” để tạo tệp; Backend đã ghi nhật ký yêu cầu xuất.':'Đã yêu cầu tải '+(kind==='xlsx'?'Excel (.xlsx)':'CSV')+' sau khi Backend kiểm tra quyền và ghi nhật ký. Nội dung chỉ gồm dữ liệu đã được phân quyền.',false);
 }catch(e){note('resultsStatus','Chưa xuất file: '+e.message,true)}
 finally{state.busy=false;buttons()}
}
async function probe(){
 try{
  const v=await api('nvsAdminLookupCapabilities');
  if(v.supported!==true||v.version!=='QT-LOOKUP-1'||v.auditRequired!==true)throw Error('Backend chưa xác nhận giao thức tra cứu có nhật ký.');
  state.ready=true;note('serviceStatus','Đã xác nhận tuyến tra cứu Quản trị trên Backend.');
 }catch(e){state.ready=false;note('serviceStatus','Chưa kết nối tuyến tra cứu có thẩm quyền: '+e.message,true)}
 buttons();
}
by('modePerson').addEventListener('click',()=>modeTo('person'));
by('modeTopic').addEventListener('click',()=>modeTo('topic'));
by('findPeople').addEventListener('click',people);
by('search').addEventListener('click',search);
for(const id of ['topic','schoolYear','team','keyword','reason'])by(id).addEventListener('input',()=>clearResult());
by('personQuery').addEventListener('input',()=>{state.person=null;by('pickedPerson').hidden=true;by('peopleList').replaceChildren();clearResult()});
by('clear').addEventListener('click',()=>{for(const id of ['personQuery','schoolYear','team','keyword','reason'])by(id).value='';by('topic').value='all';modeTo('person');note('peopleStatus','Đã xóa điều kiện; chưa truy vấn dữ liệu.')});
by('exportXlsx').addEventListener('click',()=>output('xlsx'));
by('exportCsv').addEventListener('click',()=>output('csv'));
by('exportPdf').addEventListener('click',()=>output('pdf'));
probe();
})();
