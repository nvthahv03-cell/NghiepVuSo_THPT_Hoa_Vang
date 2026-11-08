/** EDOS architecture lock – static checks only. node tests/verify-edos-data-registry-v1.cjs */
function verify(registry){
const c=[],check=(name,ok)=>c.push({name,pass:!!ok});const a=registry,d=a.edosWorkbooks||[],n=a.nq52||{},entities=a.canonicalOwnership||[];
check('Architecture is not reported as deployed',a.status==='DESIGN_LOCK_ONLY__NOT_DEPLOYED');
check('Exactly one official EDOS API gateway',a.gateway.singleProductionWebApp===true);
check('Gateway has one GET and POST entrypoint',JSON.stringify(a.gateway.publicEntrypoints)===JSON.stringify(['doGet','doPost']));
check('Backend grouped into modules',a.gateway.modules.length>=8);
check('Storage IDs use Script Properties',a.gateway.configSource==='ScriptProperties');
check('Three EDOS data workbooks',d.length===3);
check('EDOS workbook keys unique',new Set(d.map(x=>x.key)).size===d.length);
check('EDOS workbook keys are DH NV QT',['EDOS_DH','EDOS_NV','EDOS_QT'].every(k=>d.some(x=>x.key===k)));
check('All EDOS workbooks have independent config keys',new Set(d.map(x=>x.property)).size===3);
check('Each workbook has tab map',d.every(x=>Array.isArray(x.tabs)&&x.tabs.length>=5));
check('Existing workbook tabs not falsely marked deployed',d.every(x=>x.existingSource&&x.tabs.every(t=>/PLANNED|VERIFY|NOT_DEPLOYED/.test(t.state))));
check('NQ52 is a distinct workbook',n.workbookBoundary==='SEPARATE_FROM_EDOS_QT');
check('NQ52 not included inside three EDOS workbooks',!d.some(x=>x.key==='NQ52'));
check('NQ52 has separate service via adapter',n.appBoundary.includes('INDEPENDENT_NQ52_SERVICE'));
check('NQ52 auto-scoring forbidden',n.noAutomaticScoringOrClassification===true);
check('NQ52 keeps own audit',n.tabs.includes('NQ52_AuditLog'));
check('Personnel master exists as distinct reference',a.personnelMaster.owner==='PERSONNEL_MASTER');
check('Personnel has no parallel write',a.personnelMaster.writePolicy==='SINGLE_OWNER_ONLY');
check('Personnel sheet name discrepancy awaiting verification',a.personnelMaster.tab.includes('VERIFY_ACTUAL_NAME'));
check('Unique business entity ownership',new Set(entities.map(x=>x.entity)).size===entities.length);
check('All data owners are valid',entities.every(x=>new Set(['PERSONNEL_MASTER','EDOS_DH','EDOS_NV','EDOS_QT','NQ52']).has(x.owner)));
check('Tasks do not have dual writes',entities.find(x=>x.entity==='task')?.allowDualWrite===false);
check('Task migration conflict explicitly documented',entities.find(x=>x.entity==='task')?.migration.includes('RECONCILE'));
check('DTHT belongs to NVS storage',entities.find(x=>x.entity==='dthtReport')?.owner==='EDOS_NV');
check('Homeroom belongs to NVS storage',entities.find(x=>x.entity==='homeroomReport')?.owner==='EDOS_NV');
check('Permissions belong to administration',entities.find(x=>x.entity==='permission')?.owner==='EDOS_QT');
check('Search index is metadata-only',entities.find(x=>x.entity==='searchIndexMetadata')?.notFullCopiedRecords===true);
check('Assessment owned only by NQ52',entities.find(x=>x.entity==='nq52Assessment')?.owner==='NQ52');
check('Legacy duplicate functions acknowledged',a.legacyConflicts.includes('DUPLICATE_TOPLEVEL_CONFIG_PERSONNELSERVICE_COMMONDB_ETC'));
check('Both login variants audited before merge',a.legacyConflicts.includes('TWO_LOGIN_SERVICE_VARIANTS'));
check('A22 and QT lookup routing are pending',a.legacyConflicts.includes('A22_AND_ADMIN_LOOKUP_ACTIONS_NOT_IN_UPLOADED_ROUTERS'));
check('Has backup gate',a.acceptanceGates.includes('BACKUP_GAS_AND_SHEETS'));
check('Has schema and mapping gate',a.acceptanceGates.includes('INVENTORY_ACTIONS_AND_CLIENT_PAYLOADS'));
check('Has one-session permission gate',a.acceptanceGates.includes('CONFIRM_PERMISSIONS_SESSIONS'));
check('Has rollback gate',a.acceptanceGates.includes('ATOMIC_CUTOVER_WITH_ROLLBACK'));
check('NQ52 has separate approval',a.acceptanceGates.includes('NQ52_SEPARATE_APPROVAL'));
const raw=JSON.stringify(a);
check('No full spreadsheet IDs or API keys committed',!/(?:AIza[A-Za-z0-9_-]{20,}|sk-[A-Za-z0-9_-]{24,}|(?:1[A-Za-z0-9_-]{39,}))/i.test(raw));
const pass=c.every(x=>x.pass);return{pass,passed:c.filter(x=>x.pass).length,total:c.length,failed:c.filter(x=>!x.pass)};
}
module.exports={verify};
if(require.main===module){const fs=require('node:fs'),path=require('node:path');const file=path.join(__dirname,'..','contracts','EDOS_DATA_REGISTRY_V1.json');const out=verify(JSON.parse(fs.readFileSync(file,'utf8')));console.log(JSON.stringify(out,null,2));process.exitCode=out.pass?0:1}
