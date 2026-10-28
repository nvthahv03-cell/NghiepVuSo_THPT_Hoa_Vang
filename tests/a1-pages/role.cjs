const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict'),path=require('node:path');
const source=fs.readFileSync(path.join(__dirname,'../../index.html'),'utf8'),start=source.indexOf('function roleFold(s)'),end=source.indexOf('function hasSession()',start);assert.ok(start>=0&&end>start);
for(const [chucVu,expected] of [['Giáo viên',false],['Tổ trưởng',false],['Hiệu trưởng',true],['Phó Hiệu trưởng',true]]){const ctx={NVS_localStore:{getItem:()=>JSON.stringify({chucVu})},NVS_sessionStore:{getItem:()=>null}};vm.createContext(ctx);vm.runInContext(source.slice(start,end),ctx);assert.equal(ctx.isBGH(),expected,chucVu);}
console.log('PASS: four BGH role predicate cases; UI check only, not backend authorization.');
