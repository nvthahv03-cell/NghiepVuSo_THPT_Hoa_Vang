/**
 * HVA-EDOS — Google Calendar OAuth + Meet (module tách biệt).
 * Đưa file này vào CÙNG dự án Apps Script của Backend EDOS.
 * Không khai báo doGet/doPost mới, không can thiệp chức năng đã PASS.
 * Router doPost cần thêm:
 * if (['googleCalendarStatus','startGoogleCalendarConnect','createMeetingGoogleMeet','getMeetingGoogleMeetStatus'].includes(action))
 *   return hvaMeetRoutePost_(action,payload);
 *
 * Script Properties (CHỈ trên máy chủ): GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET.
 * Google Cloud OAuth Authorized redirect URI:
 * https://script.google.com/macros/d/<SCRIPT_ID>/usercallback
 * OAuth consent phải cho phép tài khoản trường; Calendar API được bật.
 * OAuth scope: https://www.googleapis.com/auth/calendar.events
 * Apps Script scopes: script.external_request, script.scriptapp (và các scope Backend đang dùng).
 *
 * Phần này chỉ hoàn tất sau khi phát hành bản Web App mới có OAuth đã cấp quyền.
 */
const HVA_MEET_GOOGLE = (function(){
'use strict';
const TZ='Asia/Ho_Chi_Minh';
const API='https://www.googleapis.com/calendar/v3/calendars/primary/events';
const SCOPE='https://www.googleapis.com/auth/calendar.events';
const TOKEN='https://oauth2.googleapis.com/token';
const props=()=>PropertiesService.getScriptProperties();
const safe=x=>String(x===undefined||x===null?'':x).trim();
function config(){
 const p=props(),clientId=safe(p.getProperty('GOOGLE_CLIENT_ID')),secret=safe(p.getProperty('GOOGLE_CLIENT_SECRET'));
 if(!clientId||!secret)throw Error('Máy chủ chưa cấu hình tài khoản Google OAuth. Liên hệ quản trị.');
 return {clientId,secret,redirect:'https://script.google.com/macros/d/'+ScriptApp.getScriptId()+'/usercallback'};
}
function hash(x){
 const bytes=Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,String(x));
 return bytes.map(v=>(v<0?v+256:v).toString(16).padStart(2,'0')).join('');
}
function usernameKey(username){return 'HVA_MEET_OAUTH_'+hash(safe(username).toLowerCase()).slice(0,32)}
function readStored(user){try{return JSON.parse(props().getProperty(usernameKey(user))||'{}')}catch(e){return {}}}
function writeStored(user,t){props().setProperty(usernameKey(user),JSON.stringify(t))}
function parseResponse(resp){
 let j={};try{j=JSON.parse(resp.getContentText()||'{}')}catch(e){}
 return {http:resp.getResponseCode(),data:j};
}
function exchange(form){
 const cfg=config();
 const res=parseResponse(UrlFetchApp.fetch(TOKEN,{method:'post',payload:Object.assign({client_id:cfg.clientId,client_secret:cfg.secret},form),muteHttpExceptions:true}));
 if(res.http<200||res.http>=300||!res.data.access_token){
   // Never put sensitive token/code/client_secret into an error message.
   throw Error('Google không cấp được quyền truy cập. Vui lòng kết nối lại tài khoản Google.');
 }
 return res.data;
}
function connected(user){const t=readStored(user);return !!t.refresh_token}
function authorizationUrl(user){
 const c=config();
 const state=ScriptApp.newStateToken().withMethod('hvaMeetGoogleOAuthCallback')
  .withArgument('hvaMeetUser',safe(user)).withTimeout(600).createToken();
 const params={client_id:c.clientId,redirect_uri:c.redirect,response_type:'code',scope:SCOPE,
  access_type:'offline',prompt:'consent',state:state};
 return 'https://accounts.google.com/o/oauth2/v2/auth?'+Object.keys(params).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(params[k])).join('&');
}
function callback(e){
 const p=(e&&e.parameter)||{},user=safe(p.hvaMeetUser);
 let ok=false,message='Không hoàn tất kết nối Google Calendar.';
 try{
  if(p.error)throw Error('Bạn đã từ chối hoặc hủy cấp quyền Google.');
  if(!user||!p.code)throw Error('Thiếu thông tin xác nhận kết nối Google.');
  const c=config();
  const granted=exchange({code:String(p.code),redirect_uri:c.redirect,grant_type:'authorization_code'});
  const previous=readStored(user);
  const refresh=safe(granted.refresh_token||previous.refresh_token);
  if(!refresh)throw Error('Google chưa cấp quyền truy cập dài hạn. Hãy thử kết nối lại.');
  writeStored(user,{refresh_token:refresh,access_token:safe(granted.access_token),
   expires_at:Date.now()+Number(granted.expires_in||3600)*1000-90000,connected_at:Date.now()});
  ok=true;message='Đã kết nối Google Calendar với HVA-EDOS. Bạn có thể quay lại trang Cuộc họp.';
 }catch(err){message=String(err.message||err)}
 const content='<!doctype html><html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
  +'<title>Google Calendar | HVA-EDOS</title></head><body style="background:#eef7fc;font:16px Arial;color:#173b5e;text-align:center;padding:40px 18px">'
  +'<div style="max-width:460px;margin:auto;padding:25px;background:white;border-radius:16px;border:1px solid #d5e7f5">'
  +'<h2>HVA-EDOS · Kết nối Google</h2><p>'+message.replace(/&/g,'&amp;').replace(/</g,'&lt;')+'</p>'
  +'<p style="font-size:13px;color:#607b92">Có thể đóng cửa sổ này và quay lại trang Cuộc họp.</p></div>'
  +'<script>try{if(window.opener)window.opener.postMessage({type:"HVA_MEET_OAUTH",connected:'+String(ok)+'},"https://nvthahv03-cell.github.io")}catch(e){}</script>'
  +'</body></html>';
 return HtmlService.createHtmlOutput(content).setTitle('Kết nối Google Calendar – HVA-EDOS');
}
function accessToken(user){
 let t=readStored(user);if(!t.refresh_token)throw Error('Tài khoản chưa kết nối Google Calendar.');
 if(t.access_token&&Number(t.expires_at)>Date.now())return t.access_token;
 const lock=LockService.getScriptLock();lock.waitLock(12000);
 try{
  t=readStored(user);
  if(t.access_token&&Number(t.expires_at)>Date.now())return t.access_token;
  const res=exchange({refresh_token:t.refresh_token,grant_type:'refresh_token'});
  const updated={refresh_token:res.refresh_token||t.refresh_token,access_token:res.access_token,
    expires_at:Date.now()+Number(res.expires_in||3600)*1000-90000,connected_at:t.connected_at||Date.now()};
  writeStored(user,updated);return updated.access_token;
 }finally{lock.releaseLock()}
}
function calendarFetch(user,url,method,body){
 const token=accessToken(user);
 const opts={method:method||'get',headers:{Authorization:'Bearer '+token},
   contentType:'application/json',muteHttpExceptions:true};
 if(body)opts.payload=JSON.stringify(body);
 const res=parseResponse(UrlFetchApp.fetch(url,opts));
 if(res.http>=400&&res.http!==404&&res.http!==409){
   if(res.http===401||res.http===403)throw Error('Google Calendar từ chối quyền truy cập. Vui lòng kiểm tra quyền tài khoản.');
   throw Error('Google Calendar chưa xử lý được yêu cầu (HTTP '+res.http+').');
 }
 return res;
}
function meetResult(event,expectedId){
 const pts=(event.conferenceData&&event.conferenceData.entryPoints)||[];
 const item=pts.filter(x=>x.entryPointType==='video').map(x=>safe(x.uri))
  .find(x=>/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(x));
 const link=item||safe(event.hangoutLink);
 const meetUrl=/^https:\/\/meet\.google\.com\/[a-z]{3}-[a-z]{4}-[a-z]{3}(?:[/?#].*)?$/i.test(link)?link:'';
 const id=safe(event.id||expectedId);
 const status=safe(event.conferenceData&&event.conferenceData.createRequest&&event.conferenceData.createRequest.status&&event.conferenceData.createRequest.status.statusCode);
 if(meetUrl)return {success:true,eventId:id,meetUrl,calendarUrl:safe(event.htmlLink),message:'Đã tạo liên kết Google Meet.'};
 if(status==='failure')return {success:false,code:'MEET_FAILED',eventId:id,message:'Google không thể cấp phòng họp cho sự kiện đã tạo. Vui lòng kiểm tra trên Calendar.'};
 return {success:false,code:'MEET_PENDING',eventId:id,message:'Đã tạo sự kiện trên Google Calendar. Google Meet đang cấp liên kết; hệ thống sẽ kiểm tra lại.'};
}
function safeEventId(user,key){
 if(!/^[a-zA-Z0-9_-]{12,100}$/.test(safe(key)))throw Error('Mã yêu cầu tạo phòng họp chưa hợp lệ.');
 // Calendar event IDs accept base32hex symbols; hex is a valid subset.
 return 'hva'+hash(safe(user).toLowerCase()+'|'+key).slice(0,48);
}
function validatedEvent(p){
 const title=safe(p.title),date=safe(p.date),start=safe(p.startTime),end=safe(p.endTime),content=safe(p.content);
 if(!title||title.length>250)throw Error('Tiêu đề cuộc họp chưa hợp lệ.');
 if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end))throw Error('Ngày hoặc giờ họp chưa hợp lệ.');
 const a=new Date(date+'T'+start+':00+07:00'),b=new Date(date+'T'+end+':00+07:00');
 if(isNaN(a.getTime())||isNaN(b.getTime())||Utilities.formatDate(a,TZ,'yyyy-MM-dd')!==date||
  b.getTime()<=a.getTime()||b.getTime()-a.getTime()>24*3600000)throw Error('Thời gian kết thúc phải sau khi bắt đầu, trong cùng ngày.');
 return {title,date,start,end,content:content.slice(0,4000)};
}
function readEvent(user,id){
 return calendarFetch(user,API+'/'+encodeURIComponent(id)+'?conferenceDataVersion=1','get');
}
function create(user,p){
 const ev=validatedEvent(p),id=safeEventId(user,p.requestKey);
 let found=readEvent(user,id);if(found.http===200)return meetResult(found.data,id);
 const body={id,summary:ev.title,description:ev.content,
  start:{dateTime:ev.date+'T'+ev.start+':00+07:00',timeZone:TZ},
  end:{dateTime:ev.date+'T'+ev.end+':00+07:00',timeZone:TZ},
  conferenceData:{createRequest:{requestId:Utilities.getUuid(),conferenceSolutionKey:{type:'hangoutsMeet'}}}};
 const created=calendarFetch(user,API+'?conferenceDataVersion=1&sendUpdates=none','post',body);
 if(created.http===409){found=readEvent(user,id);if(found.http===200)return meetResult(found.data,id)}
 if(created.http<200||created.http>=300)throw Error('Google chưa tạo được sự kiện (HTTP '+created.http+').');
 let result=meetResult(created.data,id);
 for(let n=0;n<3&&!result.success&&result.code==='MEET_PENDING';n++){
  Utilities.sleep(850);
  const chk=readEvent(user,id);
  if(chk.http===200)result=meetResult(chk.data,id);
 }
 return result;
}
function check(user,p){
 const id=safeEventId(user,p.requestKey);
 const res=readEvent(user,id);
 if(res.http===404)return {success:false,code:'EVENT_NOT_FOUND',message:'Không tìm thấy sự kiện tương ứng. Có thể thử tạo lại.'};
 return meetResult(res.data,id);
}
return {connected,authorizationUrl,callback,create,check};
})();
/**
 * Tuyến Backend đã xác thực: KHÔNG nhận username do client tự khai báo.
 * Nạp trước fallback "Action POST không hợp lệ" trong doPost hiện hữu.
 */
function hvaMeetRoutePost_(action,p){
 try{
  const actor=nvsActor_(p||{});
  if(!actor||!actor.username)return hvaJSON_({ok:false,success:false,code:String(p&&p.sessionToken||'').trim()?'SESSION_INVALID':'AUTH_REQUIRED',message:'Phiên HVA hết hạn hoặc chưa đăng nhập. Vui lòng đăng nhập lại.'});
  if(!nvsIsManager_(actor))return hvaJSON_({ok:false,success:false,message:'Tài khoản không có quyền tạo Google Meet.'});
  const username=String(actor.username).trim();
  let result;
  const legacy=typeof HVA_MEET_EXISTING_CALENDAR!=='undefined'
    &&HVA_MEET_EXISTING_CALENDAR.ready();
  if(action==='googleCalendarStatus')result={success:true,connected:legacy
    ? HVA_MEET_EXISTING_CALENDAR.connected(username)
    : HVA_MEET_GOOGLE.connected(username)};
  else if(action==='startGoogleCalendarConnect'){
    if(legacy){
      // Preserve existing OAuth service; do not create a second, competing Google connection.
      const svc=HVA_GOOGLE_CALENDAR_SERVICE;
      if(HVA_MEET_EXISTING_CALENDAR.connected(username))result={success:true,connected:true,message:'Google Calendar đã được kết nối.'};
      else{
        // Only use an OAuth URL exposed by the established service. Never guess its API.
        let prepared=null;
        if(typeof svc.prepareOAuth==='function')prepared=svc.prepareOAuth(username);
        else if(typeof svc.getAuthorizationUrl==='function')prepared=svc.getAuthorizationUrl(username);
        else if(typeof svc.getAuthUrl==='function')prepared=svc.getAuthUrl(username);
        else if(typeof svc.authorizationUrl==='function')prepared=svc.authorizationUrl(username);
        const url=typeof prepared==='string'?prepared:String(prepared&&(prepared.authUrl||prepared.authorizationUrl||prepared.url)||'');
        if(prepared&&prepared.success===false)result={success:false,code:'GOOGLE_CONNECT_FAILED',message:String(prepared.message||'Google Calendar chưa cấp quyền.')};
        else if(/^https:\/\/accounts\.google\.com\//.test(url))result={success:true,authUrl:url};
        else result={success:false,code:'GOOGLE_CONNECT_NOT_CONFIGURED',message:'Google Calendar chưa trả liên kết cấp quyền. Kiểm tra cấu hình OAuth trên máy chủ.'};
      }
    }else result={success:true,authUrl:HVA_MEET_GOOGLE.authorizationUrl(username)};
  }
  else if(action==='createMeetingGoogleMeet')result=legacy
    ? HVA_MEET_EXISTING_CALENDAR.create(username,Object.assign({},p.event||{},{requestKey:p.requestKey}))
    : HVA_MEET_GOOGLE.create(username,Object.assign({},p.event||{},{requestKey:p.requestKey}));
  else if(action==='getMeetingGoogleMeetStatus')result=legacy
    ? HVA_MEET_EXISTING_CALENDAR.check(username,p)
    : HVA_MEET_GOOGLE.check(username,p);
  else result={success:false,message:'Action Google Meet không hỗ trợ.'};
  return hvaJSON_(Object.assign({ok:!!result.success},result));
 }catch(e){return hvaJSON_({ok:false,success:false,message:String(e.message||e)})}
}
/** OAuth callback do ScriptApp.StateTokenBuilder gọi; không cần doGet mới. */
function hvaMeetGoogleOAuthCallback(request){
 return HVA_MEET_GOOGLE.callback(request);
}
/** Kiểm thử không tạo sự kiện, không gọi API: dữ liệu sai phải bị từ chối. */
function TEST_HVA_MEET_NO_SIDE_EFFECT(){
 let err='';try{HVA_MEET_GOOGLE.create('tester',{title:'Kiểm thử',date:'2026-11-04',startTime:'15:00',endTime:'14:00',requestKey:'test-request-123456'})}catch(e){err=String(e.message||e)}
 if(!/kết thúc/.test(err))throw Error('FAIL: validation did not reject invalid end time');
 return 'PASS: invalid time rejected before Calendar/OAuth calls';
}
