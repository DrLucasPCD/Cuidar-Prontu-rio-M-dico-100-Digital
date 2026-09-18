const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const core = require('../cardiovascular-core');
const p = {sex:'feminino',age:50,sbp:160,totalCholesterol:240,hdl:55,bmi:35,egfr:90,diabetes:false,smoking:false,bpTreatment:true,statin:false,priorCvd:false};
test('reproduz exemplo publicado PREVENT com arredondamento a 0,1%',()=>{
 const r=core.calculate(p); assert.equal(r.ok,true);
 for(const [key,value] of Object.entries({total_cvd:5.4,ascvd:3.6,heart_failure:2.5})) assert.equal(Number(r.risks[key].toFixed(1)),value);
 const smoker=core.calculate({...p,smoking:true});
 for(const [key,value] of Object.entries({total_cvd:9.3,ascvd:6.0,heart_failure:4.7})) assert.equal(Number(smoker.risks[key].toFixed(1)),value);
});
test('dados ausentes, prevenção secundária e extrapolação impedem estimativa',()=>{
 for(const patch of [{age:29},{age:80},{sbp:NaN},{diabetes:null},{priorCvd:true},{bmi:40},{sex:'outro'},{hdl:250}]) assert.equal(core.calculate({...p,...patch}).ok,false);
 assert.equal(core.calculate(p,{model:'sdi',sdiDecile:11}).ok,false);
});
test('identidade social e pontos legados não alteram risco base',()=>{
 assert.deepEqual(core.calculate(p),core.calculate({...p,isBlack:true,isPcd:true,territoryPoints:3,physicalActivity:'sedentario',sexualOrientation:'homossexual'}));
});
test('termo social acrescenta risco por função logística, não por soma fixa',()=>{
 const s=core.socialScenarios(p); assert.equal(s.length,3);
 assert.equal(s[0].deltaPp.total_cvd,0);
 assert.ok(s[2].deltaPp.total_cvd>0);
 const odds=x=>x/(100-x);
 const ratio=odds(s[2].risks.total_cvd)/odds(s[0].risks.total_cvd);
 const q=core.socialScenarios({...p,age:60});
 assert.ok(Math.abs(ratio-odds(q[2].risks.total_cvd)/odds(q[0].risks.total_cvd))<1e-12);
 assert.notEqual(s[2].deltaPp.total_cvd,q[2].deltaPp.total_cvd);
});
test('base geográfica tem contagens reproduzíveis, sem inferência por prefixo',()=>{
 const ctx={window:{}}; vm.runInNewContext(fs.readFileSync('data/recife-cep-sectors.js','utf8'),ctx);
 const d=ctx.window.RECIFE_CEP_SECTORS;
 assert.equal(Object.keys(d.entries).length,9050);
 assert.equal(Object.values(d.entries).filter(x=>Object.keys(x).length>1).length,4338);
 assert.equal(Object.values(d.entries).flatMap(Object.values).reduce((a,b)=>a+b,0),643590);
 assert.equal(d.entries['50000000'],undefined);
});
test('interfaces carregam motor antes do app e possuem todos os campos',()=>{
 for(const name of ['index.html','app-mobile.html']) {
  const html=fs.readFileSync(name,'utf8');
  assert.ok(html.indexOf('cardiovascular-core.js')<html.indexOf('./app.js'));
  for(const id of ['sbp','egfr','diabetes','smoking','prior-cvd','bp-treatment','statin','social-scenario']) assert.equal((html.match(new RegExp('id="prevent-'+id+'"','g'))||[]).length,1);
 }
});
