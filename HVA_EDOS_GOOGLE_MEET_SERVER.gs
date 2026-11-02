/** HVA-EDOS Google Meet server extension; deploy in SAME Apps Script project as EDOS Backend. */
function hvaEDOSCreateMeetingGoogleMeet_(p) {
  const actor=nvsActor_(p||{});
  if(!actor)return nvsResp_({success:false,code:'UNAUTHORIZED',message:'Phiên đăng nhập không hợp lệ hoặc hết hạn.'});
  if(!nvsIsManager_(actor))return nvsResp_({success:false,code:'FORBIDDEN',message:'Tài khoản không có quyền tạo cuộc họp.'});
  const e=p.event||{}, title=String(e.title||'').trim(),date=String(e.date||'').trim(),start=String(e.startTime||'').trim(),end=String(e.endTime||'').trim(),content=String(e.content||'').trim().slice(0,4000);
  if(!title||title.length>250||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(start)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(end))return nvsResp_({success:false,message:'Ngày giờ hoặc tiêu đề chưa hợp lệ.'});
  const begin=new Date(date+'T'+start+':00+07:00'),finish=new Date(date+'T'+end+':00+07:00');
  if(isNaN(+begin)||isNaN(+finish)||Utilities.formatDate(begin,'Asia/Ho_Chi_Minh','yyyy-MM-dd')!==date||Utilities.formatDate(finish,'Asia/Ho_Chi_Minh','yyyy-MM-dd')!==date||finish<=begin)return nvsResp_({success:false,message:'Thời gian họp không hợp lệ.'});
  const lock=LockService.getScriptLock();
  if(!lock.tryLock(10000))return nvsResp_({success:false,code:'BUSY',message:'Máy chủ đang xử lý. Vui lòng kiểm tra lịch trước khi thử lại.'});
  try {
    const key='HVA_EDOS_MEET_'+Utilities.base64EncodeWebSafe(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256,JSON.stringify([actor.username,title,date,start,end,content]))).slice(0,60);
    const cache=CacheService.getScriptCache(),old=cache.get(key);
    if(old){const data=JSON.parse(old);return nvsResp_(Object.assign({success:!!data.meetUrl,code:data.meetUrl?'ALREADY_CREATED':'MEET_PENDING',message:data.meetUrl?'Cuộc họp đã được tạo.':'Sự kiện đã tạo, đang chờ Google cấp link.'},data));}
    const token=ScriptApp.getOAuthToken(),base='https://www.googleapis.com/calendar/v3/calendars/primary/events',entry={
      summary:title,description:content,start:{dateTime:date+'T'+start+':00+07:00',timeZone:'Asia/Ho_Chi_Minh'},end:{dateTime:date+'T'+end+':00+07:00',timeZone:'Asia/Ho_Chi_Minh'},
      conferenceData:{createRequest:{requestId:Utilities.getUuid(),conferenceSolutionKey:{type:'hangoutsMeet'}}}
    };
    const res=UrlFetchApp.fetch(base+'?conferenceDataVersion=1',{method:'post',contentType:'application/json',headers:{Authorization:'Bearer '+token},payload:JSON.stringify(entry),muteHttpExceptions:true});
    if(res.getResponseCode()<200||res.getResponseCode()>299){console.error('Meet HTTP '+res.getResponseCode()+': '+res.getContentText().slice(0,500));return nvsResp_({success:false,code:'GOOGLE_CALENDAR_ERROR',message:'Chưa tạo được sự kiện Google Calendar. Kiểm tra quyền Calendar của tài khoản triển khai (HTTP '+res.getResponseCode()+').'});}
    let created=JSON.parse(res.getContentText()),eventId=String(created.id||'');
    if(!eventId)return nvsResp_({success:false,code:'NO_EVENT_ID',message:'Google chưa trả mã sự kiện. Hãy kiểm tra lịch trước khi tạo lại.'});
    let data={eventId,calendarUrl:String(created.htmlLink||'')};cache.put(key,JSON.stringify(data),600);
    const extract=x=>{const points=x.conferenceData&&x.conferenceData.entryPoints||[],video=points.find(z=>z.entryPointType==='video'&&/^https:\/\/meet\.google\.com\//i.test(z.uri||''));const uri=video?video.uri:String(x.hangoutLink||'');return /^https:\/\/meet\.google\.com\/[a-z0-9-]+$/i.test(uri)?uri:'';};
    let meetUrl=extract(created);
    for(let i=0;i<3&&!meetUrl;i++){Utilities.sleep(750);const check=UrlFetchApp.fetch(base+'/'+encodeURIComponent(eventId),{headers:{Authorization:'Bearer '+token},muteHttpExceptions:true});if(check.getResponseCode()===200)meetUrl=extract(JSON.parse(check.getContentText()));}
    data.meetUrl=meetUrl;cache.put(key,JSON.stringify(data),600);
    return nvsResp_(Object.assign({success:!!meetUrl,code:meetUrl?'CREATED':'MEET_PENDING',message:meetUrl?'Đã tạo Google Meet.':'Sự kiện đã tạo nhưng liên kết chưa sẵn sàng; không tạo lại.'},data));
  }catch(err){console.error('HVA MEET: '+String(err));return nvsResp_({success:false,code:'MEET_ERROR',message:'Chưa hoàn tất. Kiểm tra quyền Calendar và nhật ký Apps Script trước khi tạo lại.'});}
  finally{lock.releaseLock();}
}
function TEST_HVA_EDOS_MEET_MODULE_PRESENT(){if(typeof nvsActor_!=='function'||typeof nvsResp_!=='function')throw Error('Thiếu Backend EDOS');return 'PASS_MODULE_PRESENT';}
