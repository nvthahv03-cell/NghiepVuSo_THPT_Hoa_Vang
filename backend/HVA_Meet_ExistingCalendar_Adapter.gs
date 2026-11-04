/**
 * HVA-EDOS — Adapts Google Meet to existing HVA_GOOGLE_CALENDAR_SERVICE.
 * KHÔNG sửa HVA_GOOGLE_CALENDAR_SERVICE.createEvent().
 * Works only if existing service has status(username), CALENDAR_API and calendarFetch_(username,url,options).
 * Actor authorization belongs to hvaMeetRoutePost_ (sessionToken).
 */
const HVA_MEET_EXISTING_CALENDAR = (function(){
'use strict';
const TZ='Asia/Ho_Chi_Minh';
function service(){
 if(typeof HVA_GOOGLE_CALENDAR_SERVICE==='undefined'||!HVA_GOOGLE_CALENDAR_SERVICE)return null;
 const s=HVA_GOOGLE_CALENDAR_SERVICE;
 return typeof s.status==='function'&&typeof s.calendarFetch_==='function'&&typeof s.CALENDAR_API==='string'?s:null;
}
function ready(){return !!service()}
function connected(username){
 const s=service();if(!s)return false;
 const x=s.status(username);return !!(x&&x.connected)
}
function digest(value){
 return Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(value),Utilities.Charset.UTF_8)
  .map(x=>(x+256).toString(16).slice(-2)).join('');
}
function eventId(username,key){
 if(!/^[a-zA-Z0-9_-]{12,100}$/.test(String(key||'')))throw Error('Mã yêu cầu tạo phòng họp không hợp lệ.');
 return 'hva'+digest(String(username).toLowerCase()+'|'+key).slice(0,48);
}
function validate(p){
 const title=String(p.title||'').trim(),date=String(p.date||'').trim(),start=String(p.startTime||'').trim(),end=String(p.endTime||'').trim();
 if(!title||title.length>250)throw Error('Vui lòng nhập tiêu đề cuộc họp hợp lệ.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end))throw Error('Ngày và giờ họp chưa hợp lệ.');
 const a=new Date(date+'T'+start+':00+07:00'),b=new Date(date+'T'+end+':00+07:00');
 if(!isFinite(a.getTime())||!isFinite(b.getTime())||Utilities.formatDate(a,TZ,'yyyy-MM-dd')!==date||b<=a)
  throw Error('Thời gian kết thúc phải sau thời gian bắt đầu, trong cùng ngày.');
 return {title,date,start,end,content:String(p.content||'').trim().slice(0,4000)};
}
function extract(e,id){
 e=e||{};
 const parts=e.conferenceData&&e.conferenceData.entryPoints||[];
 const video=parts.filter(x=>x.entryPointType==='video').map(x=>String(x.uri||''))
  .find(x=>/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(x));
 const url=video||String(e.hangoutLink||'');
 const meetUrl=/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(url)?url:'';
 const status=String(e.conferenceData&&e.conferenceData.createRequest&&e.conferenceData.createRequest.status&&e.conferenceData.createRequest.status.statusCode||'');
 const eventId=String(e.id||id||'');
 if(meetUrl)return {success:true,eventId,meetUrl,calendarUrl:String(e.htmlLink||''),message:'Đã cấp liên kết Google Meet.'};
 if(status==='failure')return {success:false,eventId,code:'MEET_FAILED',message:'Google chưa tạo được phòng Meet. Kiểm tra sự kiện trên Calendar.'};
 return {success:false,eventId,code:'MEET_PENDING',message:'Google Calendar đã có sự kiện; đang chờ cấp link Meet.'};
}
function fetchById(s,u,id){
 try{return s.calendarFetch_(u,s.CALENDAR_API+'/calendars/primary/events/'+encodeURIComponent(id),{method:'get'});}
 catch(e){
  if(/\b404\b|not found|không tìm thấy/i.test(String(e&&e.message||e)))return null;
  throw e;
 }
}
function create(username,p){
 const s=service();if(!s)throw Error('Máy chủ chưa có dịch vụ Google Calendar hiện hành.');
 // Validate BEFORE calling Calendar or checking OAuth.
 const t=validate(p);
 if(!connected(username))return {success:false,code:'GOOGLE_NOT_CONNECTED',message:'Tài khoản HVA chưa kết nối Google Calendar.'};
 const id=eventId(username,p.requestKey),old=fetchById(s,username,id);
 if(old)return extract(old,id);
 const body={
  id,summary:t.title,description:t.content,
  start:{dateTime:t.date+'T'+t.start+':00+07:00',timeZone:TZ},
  end:{dateTime:t.date+'T'+t.end+':00+07:00',timeZone:TZ},
  conferenceData:{createRequest:{requestId:Utilities.getUuid(),conferenceSolutionKey:{type:'hangoutsMeet'}}}
 };
 let created;
 try{
  created=s.calendarFetch_(username,s.CALENDAR_API+'/calendars/primary/events?conferenceDataVersion=1',{
   method:'post',contentType:'application/json',payload:JSON.stringify(body)
  });
 }catch(e){
  // If network failed AFTER creation, check deterministic ID before suggesting retry.
  const check=fetchById(s,username,id);
  if(check)return extract(check,id);
  throw e;
 }
 let result=extract(created,id);
 for(let i=0;i<3&&result.code==='MEET_PENDING';i++){
  Utilities.sleep(800);
  const checked=fetchById(s,username,id);
  if(checked)result=extract(checked,id);
 }
 return result;
}
function check(username,p){
 const s=service();if(!s)throw Error('Google Calendar chưa được cấu hình.');
 if(!connected(username))return {success:false,code:'GOOGLE_NOT_CONNECTED',message:'Tài khoản cần kết nối Google Calendar.'};
 const id=eventId(username,p.requestKey),ev=fetchById(s,username,id);
 return ev?extract(ev,id):{success:false,code:'EVENT_NOT_FOUND',message:'Chưa tìm thấy sự kiện trong Google Calendar.'};
}
return {ready,connected,create,check};
})();
