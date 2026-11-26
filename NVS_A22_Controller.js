/* HVA–EDOS / A22: giao diện nghiệp vụ – chưa có tuyến gửi Backend xác thực. */
(function(){'use strict';
const D=window.HVA_A22_DEFS||{};
const names=Object.keys(D);
const ids=['code','schoolYear','owner','team','date','subject','title','content','result','evidence'];
const by=id=>document.getElementById(id);
let canSubmit=false,clientRequestId=null,submittedId="";
let a21VerifiedActor=null;
// A21 signing is staged until the server advertises support specifically for A.2.1.
let a21Image='',a21ImageGeneration=0;
const a21Method=()=>document.querySelector('input[name="a21SigningMethod"]:checked')?.value||'PAPER';
function a21SyncSign(){const active=by('code')?.value==='A.2.1';by('a21SignMethod').hidden=!active;by('a21ElectronicFields').hidden=!active||a21Method()!=='ELECTRONIC';by('a21PreviewSend').hidden=!active;by('a21PreviewSend').disabled=true;by('a21PaperSignature').hidden=true;if(active){by('a21SignerStatus').textContent='Chưa kết nối xác thực chữ ký.';by('a21VerifyCccd').disabled=true;by('a21ConfirmSign').disabled=true;by('a21Cccd').disabled=true;by('send').disabled=true;}}
function a21ClearImage(){a21ImageGeneration++;a21Image='';by('a21SignatureFile').value='';by('a21SignaturePreview').textContent='Chưa chọn ảnh chữ ký';by('a21PaperImage').hidden=true;by('a21PaperImage').removeAttribute('src');}
function a21PreviewSignature(){const mode=a21Method();by('a21PaperSignature').hidden=false;by('a21PaperName').textContent=by('owner').value;const p=new Intl.DateTimeFormat('vi-VN',{timeZone:'Asia/Ho_Chi_Minh',day:'2-digit',month:'2-digit',year:'numeric'}).formatToParts(new Date());const v=k=>p.find(x=>x.type===k).value;by('a21PaperDate').textContent='Cẩm Lệ, ngày '+v('day')+' tháng '+v('month')+' năm '+v('year');by('a21PaperGuide').textContent=mode==='PAPER'?'(Ký và ghi rõ họ tên)':'(Chưa xác thực và ký điện tử)';by('a21PaperImage').hidden=true;by('a21PaperImage').removeAttribute('src');by('a21PreviewSend').disabled=true;by('a21PreviewSend').title='Chưa kết nối tuyến ký A.2.1';by('a21PreviewSend').textContent='Xác nhận & gửi · Chưa kết nối';}

function a21ApplyActor(){if(by('code')?.value!=='A.2.1')return;const a=a21VerifiedActor;const name=a?clean(a.name||a.hoTen):'',team=a?clean(a.team||a.toBoPhan):'',role=a?clean(a.role||a.chucVu):'';by('owner').value=name;by('team').value=team;by('owner').readOnly=true;by('team').readOnly=true;by('a22OwnerCell').hidden=true;by('a22TeamCell').hidden=true;by('a22UserName').textContent=name||'Chưa xác thực tài khoản';by('a22UserTeam').textContent=team?'| '+team:'';by('a22UserRole').textContent=role?'| '+role:'';}
window.addEventListener('hva:a21-verified-actor',e=>{a21VerifiedActor=e.detail?.username?e.detail:null;if(by('code')?.value==='A.2.1'){a21ApplyActor();a22RefreshPresentation();}});
if(!names.length||!by('form')||!by('specialFields')){console.error('Thiếu cấu hình biểu mẫu A22');return;}
const storeRead=key=>{for(const kind of ['localStorage','sessionStorage'])try{const v=window[kind].getItem(key);if(v)return v;}catch(_){}return ''};
const sessionExpiryValid=raw=>{
 const num=Number(raw);
 if(Number.isFinite(num)&&num>0)return (num<1e12?num*1000:num)>Date.now();
 const parsed=Date.parse(String(raw||''));
 return Number.isFinite(parsed)&&parsed>Date.now();
};
const validSession=()=>['localStorage','sessionStorage'].some(kind=>{
 try{const st=window[kind];return !!st.getItem('hvaSessionToken')&&sessionExpiryValid(st.getItem('hvaSessionExpiresAt'))}catch(_){return false}
});
function currentUser(){
 if(!validSession())return {};
 for(const kind of ['localStorage','sessionStorage'])try{
   const raw=window[kind].getItem('user');
   if(!raw)continue;
   const u=JSON.parse(raw);
   if(u&&typeof u==='object'&&!Array.isArray(u)&&(u.hoTen||u.fullName||u.name||u.tenDangNhap||u.username))return u;
 }catch(_){}
 return {};
}
function namePart(){const u=currentUser();return String(u.username||u.tenDangNhap||u.maNhanVien||'').replace(/[^a-z0-9_.-]/gi,'').slice(0,55)}
function storageKey(){return 'HVA_A22_SESSION_'+namePart()+'_'+by('code').value}
function notice(text,ok=false){const n=by('feedback');n.textContent=text;n.style.color=ok?'#087e56':'#a22532'}
function clean(t){return String(t==null?'':t).replace(/\r/g,'').trim()}
function a22SetConnection(status,message){
 const box=by('a22Connection'),label=by('a22ConnectionText');
 if(!box||!label)return;
 box.dataset.status=status;label.textContent=message;
}
function a22RefreshPresentation(){
 const code=by('code').value,plan=code==='A.1.3-KH',a21=code==='A.2.1',a1=/^A[.]1[.](?:3|4)(?:-|$)/.test(code),def=D[code];
 const official=a22OfficialTemplateUrl(code),templateButton=by('a22TemplateDownload');
 if(templateButton){
  const downloadable=plan||!!official;
  templateButton.disabled=a21||!downloadable;
  templateButton.hidden=a21;
  templateButton.dataset.templateStatus=downloadable?'ready':'pending';
  templateButton.title=plan?'Tải mẫu kế hoạch Word – dự thảo chờ duyệt':official?'Mở mẫu trên Google Drive':'Chưa có mẫu được xác nhận';
  const strong=templateButton.querySelector('strong'),small=templateButton.querySelector('small');
  if(strong)strong.textContent='Tải mẫu';
  if(small)small.textContent=plan?'Mẫu Word chỉnh sửa được · Dự thảo':official?'Mở mẫu do nhà trường cung cấp':'Đang cập nhật mẫu';
 }
 const landing=by('a22LandingTitle');if(landing&&def)landing.textContent=code+' · '+def.title;
 const intro=document.querySelector('.hva-a-landing-intro');
 if(intro&&a1)intro.textContent='Tải mẫu, hoàn thiện hồ sơ và lưu trên Google Drive. Sau đó chọn “Nộp hồ sơ”, dán liên kết và gửi đến BGH/TTCM.';
 if(intro&&a21)intro.textContent='Giáo viên được phân công nộp liên kết bộ hồ sơ đợt kiểm tra gồm ma trận, đặc tả, đề, đáp án/hướng dẫn chấm hoặc tiêu chí đánh giá phù hợp. Không tải đề mật lên liên kết công khai.';
 const note=document.querySelector('.hva-a-landing-note');
 if(note&&a1)note.textContent=plan?'Mẫu Word hiện là bản dự thảo để nhà trường duyệt. Hồ sơ chỉ được ghi nhận khi EDOS cấp mã tiếp nhận.':'Nộp liên kết tài liệu đã hoàn thiện và chia sẻ đúng quyền. Hệ thống chỉ xác nhận nộp khi có mã hồ sơ.';
 if(note&&a21)note.textContent='Nguồn đề do Sở cung cấp: không yêu cầu giáo viên nộp lại. Việc tiếp nhận đề của Sở thực hiện theo quy trình bảo mật và Điều hành. Với đề của trường/tổ, hồ sơ chỉ được ghi nhận sau khi EDOS trả mã tiếp nhận.';
 const quick=by('a22QuickTools');if(quick)quick.hidden=true;
 const evidence=by('evidence'),evidenceLabel=document.querySelector('label[for="evidence"]');
 if(evidenceLabel)evidenceLabel.textContent=a1?'Liên kết hồ sơ đã hoàn thiện trên Google Drive / Docs *':'Liên kết hồ sơ đã hoàn thiện trên Google Drive / Docs *';
 if(evidence){evidence.required=true;evidence.placeholder='https://drive.google.com/...';}
 const openLabel=by('a22OpenSubmission');
 if(openLabel){const strong=openLabel.querySelector('strong'),small=openLabel.querySelector('small');
  if(strong)strong.textContent=a21?'II. Nộp hồ sơ':'Nộp hồ sơ';
  if(small)small.textContent='Dán liên kết · Xem trước · Gửi';
 }
 const btn=by('send'),planBtn=by('a22PlanSend');
 if(btn){btn.classList.remove('hidden');if(!btn.disabled)btn.textContent='Xác nhận nộp liên kết hồ sơ';}
 if(planBtn)planBtn.disabled=true;
 if(a21){
  const source=by('a22_nguonDe'),state=by('a22A21Policy');
  const isDepartment=source?.value==='Sở GD&ĐT';
  if(state){state.hidden=false;state.textContent=isDepartment?'Đề do Sở GD&ĐT cung cấp: giáo viên không nộp lại đề tại A2.1. Nhà trường tổ chức tiếp nhận và bảo quản đề theo chỉ đạo của Sở.':'Chỉ nộp hồ sơ được giao qua liên kết Google Drive/Docs đã giới hạn quyền xem. Không bật chế độ “Bất kỳ ai có liên kết”.';}
  const btn=by('send');if(btn){btn.disabled=true; // A21 signed submission must not fall through to the unsigned A22 route.
  by('a21PreviewSend').disabled=true;btn.title=isDepartment?'Đề của Sở được quản lý tại Điều hành, không nộp tại A2.1':'Chỉ gửi khi Backend A22 xác nhận tuyến tiếp nhận';}
 }else if(by('a22A21Policy'))by('a22A21Policy').hidden=true;
}
function a22OpenSubmission(){
 const editor=by('a22SubmissionEditor');if(!editor)return;
 editor.classList.remove('hidden');
 const evidence=by('evidence');
 // Đặt ô liên kết lên đầu thông tin chung, không bắt GV tìm trong biểu mẫu dài.
 const grid=evidence?.closest('.cols'),wrap=evidence?.closest('.hva-a-link-field');
 if(grid&&wrap){
  if(document.body.classList.contains('hva-a1-mode'))grid.append(wrap);
  else if(grid.firstElementChild!==wrap)grid.prepend(wrap);
 }
 editor.scrollIntoView({behavior:'smooth',block:'start'});
 if(evidence&&!document.body.classList.contains('hva-a1-mode'))window.setTimeout(()=>evidence.focus({preventScroll:true}),250);
}
/* Các liên kết mẫu chính thức do Nhà trường cung cấp và duyệt.
 * Chưa có liên kết thì KHÔNG tạo tệp thay thế. Chỉ cấu hình URL được xác minh.
 * Khi thầy cung cấp liên kết Drive, bổ sung tại bảng này theo mã nghiệp vụ.
 */
const HVA_APPROVED_TEMPLATE_URLS=Object.freeze({
 // 'A.1.3-KH': 'https://drive.google.com/file/d/.../view',
 // 'A.1.3-BC': 'https://docs.google.com/document/d/.../edit',
 // 'A.1.4':    'https://drive.google.com/file/d/.../view'
});
function a22OfficialTemplateUrl(code){
 const value=HVA_APPROVED_TEMPLATE_URLS[code];
 if(typeof value!=='string')return '';
 try{
  const u=new URL(value);
  const host=u.hostname.toLowerCase();
  if(u.protocol!=='https:'||!['drive.google.com','docs.google.com'].includes(host)||u.username||u.password)return '';
  return u.href;
 }catch(_){return ''}
}
function a22DownloadHSGPlanDraft(){
 const word='<!doctype html><html><head><meta charset="utf-8"><style>body{font-family:"Times New Roman";font-size:13pt;line-height:1.4;margin:2cm}h1{text-align:center;font-size:16pt}h2{font-size:13pt;margin-top:18pt}p{margin:6pt 0}table{border-collapse:collapse;width:100%}th,td{border:1px solid #333;padding:7px;text-align:left}th{font-weight:bold;background:#eee}.center{text-align:center}</style></head><body>'+
 '<p class="center"><b>SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG</b><br><b>TRƯỜNG THPT HÒA VANG</b></p>'+
 '<p class="center"><b>MẪU DỰ THẢO – CHỜ NHÀ TRƯỜNG PHÊ DUYỆT</b></p>'+
 '<h1>KẾ HOẠCH BỒI DƯỠNG HỌC SINH GIỎI</h1>'+
 '<p class="center">Năm học: .................</p>'+
 '<p><b>Môn:</b> .................... &nbsp; <b>Đội tuyển:</b> .................... &nbsp; <b>Giáo viên phụ trách:</b> ....................</p>'+
 '<h2>I. CĂN CỨ XÂY DỰNG KẾ HOẠCH</h2><p>Văn bản chỉ đạo, kế hoạch giáo dục nhà trường, phân công chuyên môn, kết quả khảo sát năng lực học sinh…</p>'+
 '<h2>II. ĐẶC ĐIỂM TÌNH HÌNH</h2><p>Số lượng học sinh, năng lực đầu vào, thuận lợi, khó khăn và điều kiện tổ chức.</p>'+
 '<h2>III. MỤC TIÊU VÀ YÊU CẦU</h2><p>Mục tiêu kiến thức, năng lực, phẩm chất; mục tiêu và chỉ tiêu dự kiến theo kế hoạch nhà trường.</p>'+
 '<h2>IV. NỘI DUNG, TIẾN ĐỘ VÀ TỔ CHỨC BỒI DƯỠNG</h2>'+
 '<table><tr><th>STT</th><th>Chủ đề/chuyên đề</th><th>Yêu cầu cần đạt</th><th>Số tiết</th><th>Thời gian</th><th>Giáo viên</th><th>Minh chứng/đánh giá</th></tr>'+
 '<tr><td>1</td><td>...</td><td>...</td><td>...</td><td>...</td><td>...</td><td>...</td></tr>'+
 '<tr><td>2</td><td>...</td><td>...</td><td>...</td><td>...</td><td>...</td><td>...</td></tr></table>'+
 '<h2>V. PHƯƠNG PHÁP VÀ KIỂM TRA, ĐÁNH GIÁ</h2><p>Tổ chức chuyên đề; bài tập luyện tập; kiểm tra định kỳ; điều chỉnh kế hoạch theo tiến độ và năng lực học sinh.</p>'+
 '<h2>VI. PHÂN CÔNG VÀ TỔ CHỨC THỰC HIỆN</h2><p>Trách nhiệm giáo viên, tổ chuyên môn, phối hợp với nhà trường và học sinh.</p>'+
 '<h2>VII. KIẾN NGHỊ, ĐỀ XUẤT</h2><p>.....................................................................................</p>'+
 '<table style="margin-top:25px;border:0"><tr><td style="border:0;text-align:center;width:50%"><b>TỔ TRƯỞNG CHUYÊN MÔN</b><br>(Ký, ghi rõ họ tên)</td><td style="border:0;text-align:center"><b>NGƯỜI LẬP KẾ HOẠCH</b><br>(Ký, ghi rõ họ tên)</td></tr></table>'+
 '</body></html>';
 const blob=new Blob(['\\uFEFF'+word],{type:'application/msword;charset=utf-8'});
 const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='A1_3_KH_Boi_duong_HSG_MAU_DU_THAO.doc';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
 notice('Đã tải mẫu kế hoạch Word (dự thảo). Sau khi hoàn thiện, lưu lên Drive và chọn “Nộp hồ sơ” để gửi liên kết.',true);
}
function a22OpenOfficialTemplate(){
 const code=by('code').value;
 if(code==='A.1.3-KH'){a22DownloadHSGPlanDraft();return;}
 const url=a22OfficialTemplateUrl(code);
 if(!url){notice('Chưa có mẫu được nhà trường xác nhận cho '+code+'.',false);return;}
 const link=document.createElement('a');link.href=url;link.target='_blank';link.rel='noopener noreferrer';link.referrerPolicy='no-referrer';
 document.body.append(link);link.click();link.remove();
 notice('Đã mở mẫu. Sau khi hoàn thiện, lưu vào Drive và chọn Nộp hồ sơ.',true);
}
function safeUrl(value){if(!value)return true;try{const u=new URL(value);return u.protocol==='https:'&&!!u.hostname&&!u.username&&!u.password}catch(_){return false}}
function validDrive(value){if(!value)return true;try{const u=new URL(value);return safeUrl(value)&&['drive.google.com','docs.google.com'].includes(u.hostname)}catch(_){return false}}
function a1ToVN(value){
 const s=String(value||''),p=s.split('-');
 return p.length===3&&p[0].length===4?p[2]+'/'+p[1]+'/'+p[0]:s;
}
function a1ToISO(value){
 const s=String(value||'').trim(),p=s.split('/');
 if(p.length!==3)return '';
 const d=Number(p[0]),m=Number(p[1]),y=Number(p[2]);
 if(p[0].length!==2||p[1].length!==2||p[2].length!==4||y<1900||y>2100)return '';
 const v=new Date(Date.UTC(y,m-1,d));
 if(v.getUTCFullYear()!==y||v.getUTCMonth()!==m-1||v.getUTCDate()!==d)return '';
 return p[2]+'-'+p[1]+'-'+p[0];
}
function a1CalendarControl(input){
 const original=input.value;
 const host=document.createElement('div');host.className='hva-a-date-control';
 const picker=document.createElement('input');picker.type='date';picker.className='hva-a-native-date';
 picker.tabIndex=-1;picker.setAttribute('aria-label','Mở lịch chọn ngày');
 input.type='text';input.classList.add('hva-a-date-display');input.placeholder='dd/mm/yyyy';
 input.inputMode='numeric';input.maxLength=10;input.value=a1ToVN(original);
 picker.value=original;
 picker.addEventListener('change',()=>{input.value=a1ToVN(picker.value);
  input.setCustomValidity('');input.dispatchEvent(new Event('input',{bubbles:true}));});
 input.addEventListener('input',()=>{input.setCustomValidity('');picker.value=a1ToISO(input.value);});
 host.append(input,picker);return host;
}
function a1BaseDate(enabled){
 const field=by('date');if(!field)return;
 const wrapped=field.classList.contains('hva-a-date-display');
 if(enabled&&!wrapped){
  const parent=field.parentElement,next=field.nextSibling,control=a1CalendarControl(field);
  parent.insertBefore(control,next);
 }
 if(!enabled&&wrapped){
  const iso=a1ToISO(field.value),host=field.parentElement;
  field.classList.remove('hva-a-date-display');field.type='date';
  field.removeAttribute('maxlength');field.removeAttribute('inputmode');field.removeAttribute('placeholder');
  host.replaceWith(field);field.value=iso;
 }
}
function a1Read(el){
 const raw=clean(el?.value);
 return el?.classList.contains('hva-a-date-display')?a1ToISO(raw):raw;
}
function a1ValidateDates(){
 if(!document.body.classList.contains('hva-a1-mode')&&!baseIsA21())return true;
 let good=true;
 for(const input of document.querySelectorAll('#form .hva-a-date-display')){
  const raw=input.value.trim();input.setCustomValidity(raw&&!a1ToISO(raw)?'Ngày không hợp lệ. Nhập theo dạng dd/mm/yyyy.':'');
  if(!input.checkValidity()){if(good){input.reportValidity();input.focus()}good=false;}
 }
 return good;
}
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
 if(document.body.classList.contains('hva-a1-mode')||by('code').value==='A.2.1'){
  const hints={monBD:'Ví dụ: Toán, Ngữ văn, Tiếng Anh…',thoiGianBD:'Ví dụ: từ tháng 9/2026 đến tháng 3/2027…',mucTieuBD:'Nêu mục tiêu và yêu cầu cần đạt của đội tuyển…',noiDungBD:'Liệt kê chuyên đề, số buổi và tiến độ thực hiện…',phanCongBD:'Nêu giáo viên phụ trách và cách phối hợp…',tenDoiTuyen:'Ví dụ: Đội tuyển HSG Toán 12 cấp thành phố…',monThi:'Ghi môn thi và cấp thi…',ketQuaBD:'Nêu kết quả thực hiện, sản phẩm và số liệu minh chứng…',khoKhanBD:'Ghi khó khăn, kiến nghị hoặc hỗ trợ cần thiết…'};
  if(spec.type==='textarea'||spec.type==='text')input.placeholder=hints[spec.key]||('Nhập '+spec.label.toLowerCase()+'…');
  if(spec.type==='date'){wrap.append(label,a1CalendarControl(input));return wrap;}
 }
 wrap.append(label,input);return wrap;
}
function setCode(code,keepTitle=false){
 if(!Object.prototype.hasOwnProperty.call(D,code))return false;
 by('code').value=code;const def=D[code];
 const a1=/^A[.]1[.](?:3|4)(?:-|$)/.test(code);
 const a21=code==='A.2.1';
 document.body.classList.toggle('hva-a21-standard',a21);
 a21SyncSign();
 document.body.classList.toggle('hva-a1-mode',a1);
 for(const id of ['a22A1Top','a22UserBar'])if(by(id))by(id).hidden=!(a1||(a21&&id==='a22UserBar'));
 a1BaseDate(a1||a21);
 if(by('a22CodeCell'))by('a22CodeCell').hidden=a1||a21;
 if(by('owner'))by('owner').required=!a1;
 if(by('team'))by('team').required=!a1;
 if(by('a22OwnerCell'))by('a22OwnerCell').hidden=a1;
 if(by('a22TeamCell'))by('a22TeamCell').hidden=a1;
 if(by('a22HeaderTitle'))by('a22HeaderTitle').textContent=def.title;
 if(by('a22HeaderCode'))by('a22HeaderCode').textContent=code+' · '+(code.startsWith('A.1.')?'BÁO CÁO CHUYÊN MÔN':code.startsWith('A.2.')?'KIỂM TRA – ĐÁNH GIÁ':code.startsWith('A.3.')?'HỒ SƠ DẠY HỌC':code.startsWith('A.4.')?'SẢN PHẨM CHUYÊN MÔN':code.startsWith('A.5.')?'ĐƠN – ĐỀ NGHỊ':'THIẾT BỊ – ĐỒ DÙNG DẠY HỌC');
 if(by('a22A1SelectedTitle'))by('a22A1SelectedTitle').textContent=def.title;
 if(by('a22A1SelectedPurpose'))by('a22A1SelectedPurpose').textContent=def.purpose;
 if(by('a22PreviewTitle'))by('a22PreviewTitle').textContent=a1?'Bản xem trước – '+def.title:'Bản xem trước hồ sơ';
 by('owner').readOnly=a21;by('team').readOnly=a21;
 if(a1){
  const user=currentUser();
  if(by('owner'))by('owner').value=clean(user.hoTen||user.fullName||user.name);
  if(by('team'))by('team').value=clean(user.toBoPhan||user.tenTo||user.to);
  if(by('a22UserName'))by('a22UserName').textContent=clean(user.hoTen||user.fullName||user.name)||'Chưa xác định';
  if(by('a22UserTeam'))by('a22UserTeam').textContent=clean(user.toBoPhan||user.tenTo||user.to)||'Chưa xác định';
  if(by('a22UserRole'))by('a22UserRole').textContent=clean(user.chucVu||user.viTriViecLam||user.role)||'Chưa xác định';
 }
 if(a21)a21ApplyActor();
 by('heading').textContent=code+' – '+def.title;
 by('specialTitle').textContent='Thông tin nghiệp vụ '+code;
 by('specialHint').textContent=def.purpose;
 const holder=by('specialFields');holder.replaceChildren(...def.fields.map(makeField));
 if(!keepTitle||!by('title').value.trim())by('title').value=def.title;
 by('previewPanel').classList.add('hidden');
 const more=by('a22MoreFields');if(more)more.open=code==='A.2.1';
 if(more){const label=more.querySelector('summary');if(label)label.firstChild.textContent=code==='A.2.1'?'02 · Thông tin hồ sơ đợt kiểm tra ':'Thông tin nghiệp vụ chi tiết ';}
 for(const spec of def.fields){const field=by('a22_'+spec.key);if(field)field.required=!!spec.required&&code==='A.2.1';}
 a22RefreshPresentation();
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
 if(baseIsA21())a21ApplyActor();
 const base=Object.fromEntries(ids.map(id=>[id,a1Read(by(id))]));
 const extras=Object.fromEntries(D[base.code].fields.map(spec=>[spec.key,a1Read(by('a22_'+spec.key))]));
 return {base,extras};
}
function baseIsA21(){return by('code').value==='A.2.1'}
function validate(){
 if(baseIsA21()){a21ApplyActor();if(!a21VerifiedActor||!by('owner').value||!by('team').value){notice('Chưa truy xuất được thông tin người lập từ phiên EDOS. Vui lòng kiểm tra kết nối lịch kiểm tra hoặc đăng nhập lại.');return false;}}
 // Khi chỉ nộp liên kết: trường chi tiết trong phần thu gọn là thông tin bổ sung,
 // không ép giáo viên nhập lại toàn bộ nội dung đã có trong tài liệu.
 const more=by('a22MoreFields');
 for(const spec of D[by('code').value].fields){
  const field=by('a22_'+spec.key);
  if(field)field.required=!!spec.required&&(baseIsA21()||!!more?.open);
 }
 if(!a1ValidateDates())return false;
 if(!by('form').reportValidity())return false;
 const {base,extras}=collect();
 if(base.code==='A.2.1'&&extras.nguonDe==='Sở GD&ĐT'){notice('Đề do Sở cung cấp không nộp lại tại A2.1. Nhà trường tiếp nhận theo quy trình Điều hành.');return false;}
 if(!validDrive(base.evidence)){notice('Minh chứng chung chỉ nhận liên kết Google Drive/Docs HTTPS.');by('evidence').focus();return false}
 if(!base.evidence){notice('Vui lòng dán đường liên kết hồ sơ đã hoàn thiện trên Google Drive trước khi gửi.');by('evidence').focus();return false}
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
 const lines=['SỞ GIÁO DỤC VÀ ĐÀO TẠO ĐÀ NẴNG','TRƯỜNG THPT HÒA VANG','','BẢN DỰ THẢO — CHƯA KÝ — CHƯA GỬI','',base.code+' – '+def.title,'','Người lập: '+base.owner,'Tổ / bộ phận: '+base.team,'Năm học: '+base.schoolYear,'Ngày lập: '+(document.body.classList.contains('hva-a1-mode')?a1ToVN(base.date):base.date),'Môn / lớp / đối tượng / địa điểm: '+(base.subject||'—'),'',
 'I. THÔNG TIN NGHIỆP VỤ'];
 for(const spec of def.fields)lines.push(spec.label+': '+(spec.type==='date'&&document.body.classList.contains('hva-a1-mode')?a1ToVN(extras[spec.key]):extras[spec.key]||'—'));
 lines.push('','II. NỘI DUNG / CĂN CỨ','Tiêu đề: '+base.title,base.content||'—',
 '','III. KẾT QUẢ / KIẾN NGHỊ',base.result||'—',
 '','IV. MINH CHỨNG BỔ SUNG',base.evidence||'—',
 '','NGƯỜI LẬP HỒ SƠ','(Chưa ký)');
 return lines;
}
function preview(){
 if(!validate())return false;
 by('preview').textContent=linesFor(collect()).join('\n');
 if(baseIsA21())a21PreviewSignature();
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
 for(const id of ids)if(id!=='code'){
  const el=by(id),raw=String(base[id]??'');
  el.value=(el.classList.contains('hva-a-date-display')?a1ToVN(raw):raw).slice(0,el.maxLength>0?el.maxLength:12000);
 }
 for(const spec of D[base.code].fields){
   const el=by('a22_'+spec.key);const value=String(raw.schema==='HVA-A22-DRAFT-2'?(raw.extras?.[spec.key]??''):'');
   if(spec.type==='select'&&!spec.options.includes(value))el.value='';
   else el.value=(el.classList.contains('hva-a-date-display')?a1ToVN(value):value).slice(0,8000);
 }
 if(baseIsA21())a21ApplyActor();
 by('previewPanel').classList.add('hidden');
 return raw.schema==='HVA-DRAFT-1';
}
by('a22TemplateDownload')?.addEventListener('click',a22OpenOfficialTemplate);
by('a22OpenSubmission')?.addEventListener('click',a22OpenSubmission);
by('a22DownloadPlan')?.addEventListener('click',a22OpenOfficialTemplate);
by('a22PlanSend')?.addEventListener('click',()=>{
 if(by('code').value!=='A.1.3-KH')return;
 if(by('send').disabled){notice('Chưa có tuyến nhận kế hoạch được xác thực. Hãy lưu bản nháp để nộp sau.');return}
 by('send').click();
});
by('form').addEventListener('submit',e=>{e.preventDefault();preview()});
for(const el of document.querySelectorAll('input[name="a21SigningMethod"]'))el.addEventListener('change',()=>{a21ClearImage();a21SyncSign();by('previewPanel').classList.add('hidden');});
by('a21SignatureFile').addEventListener('change',e=>{const f=e.target.files?.[0],g=++a21ImageGeneration;a21Image='';by('a21SignaturePreview').textContent='Chưa chọn ảnh chữ ký';if(!f)return;if(!['image/png','image/jpeg','image/webp'].includes(f.type)||f.size>1048576){e.target.value='';by('a21SignerStatus').textContent='Chọn ảnh PNG, JPEG hoặc WebP tối đa 1 MB.';return;}const reader=new FileReader();reader.onload=()=>{if(g!==a21ImageGeneration||a21Method()!=='ELECTRONIC'||!baseIsA21())return;a21Image=String(reader.result||'');const img=document.createElement('img');img.alt='Ảnh chữ ký chưa xác thực';img.src=a21Image;by('a21SignaturePreview').replaceChildren(img);by('a21SignerStatus').textContent='Chưa kết nối xác thực chữ ký.';};reader.onerror=()=>{if(g===a21ImageGeneration)by('a21SignerStatus').textContent='Không đọc được ảnh chữ ký.';};reader.readAsDataURL(f);});
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
function returnA1Menu(){
 by('a22SubmissionEditor')?.classList.add('hidden');
 by('previewPanel')?.classList.add('hidden');
 by('a22TemplateLanding')?.scrollIntoView({behavior:'smooth',block:'start'});
}
by('a22BackToLanding')?.addEventListener('click',returnA1Menu);
by('a22PreviewBackToLanding')?.addEventListener('click',returnA1Menu);
select.addEventListener('change',()=>{setCode(select.value);notice('Đã chuyển mẫu. Hãy kiểm tra lại thông tin trước khi xuất.')});
by('send').disabled=true;
/* Tuyến tiếp nhận dùng chung chỉ mở khi Backend đã triển khai action A22 và trả chứng nhận hỗ trợ. */
const A22_BACKEND_URL='https://script.google.com/macros/s/AKfycbzZBemNxnkqhIT2iz0CdtdFJqhlOu8LgZMzmnNjMxSGZRrz-ULuvEZb7MbKoufelWNY/exec';

const token=()=>{
 for(const kind of ['localStorage','sessionStorage'])try{
  const st=window[kind],t=st.getItem('hvaSessionToken');
  if(t&&sessionExpiryValid(st.getItem('hvaSessionExpiresAt')))return t;
 }catch(_){}
 return '';
};
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
 if(!token()){a22SetConnection('offline','Chưa đăng nhập EDOS · Có thể soạn và lưu nháp');notice('Chưa có phiên EDOS; có thể chuẩn bị và tải bản nháp, chưa thể gửi hồ sơ.');return}
 try{
  const r=await a22API('nvsA22Capabilities');
  if(r.supported!==true||r.version!=='A22-1'||!r.bghCount||!r.ccCount)throw Error('Backend chưa xác nhận tuyến tiếp nhận đủ BGH và TTCM.');
  canSubmit=true;
  a22SetConnection('ready','Đã xác thực nơi nhận BGH / TTCM · Có thể nộp hồ sơ');
  by('send').disabled=false;
  a22RefreshPresentation();
  by('send').title='Chỉ báo đã tiếp nhận khi Backend trả mã hồ sơ';
  notice('Tuyến tiếp nhận A22 đã xác thực. Hãy kiểm tra và xem trước hồ sơ trước khi nộp.',true);
 }catch(err){
  canSubmit=false;a22SetConnection('offline','Chưa kết nối tuyến nộp · Vẫn có thể xem trước và lưu nháp');by('send').disabled=true;
  a22RefreshPresentation();
  by('send').title='Chưa có tuyến Backend A22 được xác thực';
  notice('Chưa thể nộp hồ sơ: '+err.message+' Có thể lưu nháp và xuất JSON.');
 }
}
by('form').addEventListener('input',()=>{clientRequestId=null;submittedId='';by('previewPanel').classList.add('hidden');by('send').disabled=!canSubmit;a22RefreshPresentation();});
by('a22MoreFields')?.addEventListener('toggle',()=>{
 const more=by('a22MoreFields');for(const spec of D[by('code').value].fields){const el=by('a22_'+spec.key);if(el)el.required=!!spec.required&&(baseIsA21()||more.open);}
});
select.addEventListener('change',()=>{clientRequestId=null;submittedId='';by('send').disabled=!canSubmit;a22RefreshPresentation();});
by('file').addEventListener('change',()=>{clientRequestId=null;submittedId=''});
by('restoreSession').addEventListener('click',()=>{clientRequestId=null;submittedId=''});
by('send').addEventListener('click',async()=>{
 if(baseIsA21()){notice('Chưa kết nối tuyến ký A.2.1. Hồ sơ chưa gửi.');return;}
 if(!canSubmit){notice('Chưa có Backend A22 đã xác thực; hồ sơ chưa được gửi.');return}
 if(submittedId){notice('Hồ sơ đã có mã tiếp nhận: '+submittedId+'. Hãy chỉnh sửa nội dung trước khi tạo lần nộp mới.',true);return}
 if(!validate())return;
 const confirmedCode=by('code').value,confirmedData=JSON.stringify(collect());
 if(confirmedCode==='A.2.1'){if(!await window.hvaA21Dialog('Xác nhận nộp hồ sơ','Thầy/Cô xác nhận nộp hồ sơ đợt kiểm tra đến BGH và đồng nhận TTCM?','Xác nhận gửi'))return;}
 else if(!window.confirm('Xác nhận nộp hồ sơ '+confirmedCode+' vào hộp tiếp nhận BGH và đồng nhận TTCM?'))return;
 if(by('send').disabled||confirmedCode!==by('code').value||confirmedData!==JSON.stringify(collect()))return;
 const btn=by('send');btn.disabled=true;btn.textContent='Đang kiểm tra tiếp nhận...';
 if(by('a22PlanSend'))by('a22PlanSend').disabled=true;
 try{
  if(!clientRequestId)clientRequestId=newRequestId();
  const data=collect();
  const r=await a22API('nvsA22Submit',{document:{clientRequestId,form:data.base,extras:data.extras}});
  if(!r.recordId||!r.bghCount||!r.ccCount)throw Error('Backend chưa cấp đủ mã tiếp nhận và người nhận.');
  notice('ĐÃ TIẾP NHẬN hồ sơ số '+r.recordId+' · BGH: '+r.bghCount+' · TTCM: '+r.ccCount+'. Trạng thái: '+r.status+'. '+(r.notificationStatus==='NOT_CONFIGURED'?'Thông báo tự động chưa được cấu hình.':'') ,true);
  by('preview').textContent=linesFor(data).map(x=>x==='BẢN DỰ THẢO — CHƯA KÝ — CHƯA GỬI'?'ĐÃ TIẾP NHẬN — CHỜ PHÊ DUYỆT — CHƯA KÝ SỐ':x).join('\n')+'\n\nMÃ TIẾP NHẬN: '+r.recordId+'\nTRẠNG THÁI: '+r.status;
  by('previewPanel').classList.remove('hidden');by('previewPanel').scrollIntoView({behavior:'smooth'});
  submittedId=r.recordId;
  if(confirmedCode==='A.2.1')await window.hvaA21Dialog('Gửi hồ sơ thành công','Mã tiếp nhận: '+r.recordId+'\nTrạng thái: '+r.status,'Đóng',true);
 }catch(err){notice('CHƯA XÁC NHẬN NỘP HỒ SƠ: '+err.message+' Nếu mạng gián đoạn, hãy thử lại mà không sửa nội dung để tránh gửi trùng.')}
 finally{btn.disabled=!canSubmit||!!submittedId;btn.textContent=submittedId?'Đã tiếp nhận hồ sơ · '+submittedId:canSubmit?(by('code').value==='A.1.3-KH'?'Gửi liên kết kế hoạch đến BGH / TTCM':'Nộp hồ sơ đến BGH / TTCM'):'Gửi hồ sơ · Chờ kết nối';a22RefreshPresentation()}
});
probeBackend();

})();
