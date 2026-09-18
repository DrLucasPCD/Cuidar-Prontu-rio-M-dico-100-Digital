const test=require('node:test'),assert=require('node:assert/strict');
const {assess}=require('../research-risk-core');
test('Castelli I independe de LDL; razões não produzem porcentagens inventadas',()=>{
 const r=assess({totalCholesterol:240,hdl:60});
 assert.equal(r.lipids.castelliI,4);assert.equal(r.lipids.castelliII,null);
 assert.equal(r.additionalRiskPp,null);assert.equal(r.absoluteRisk,null);
 assert.equal(assess({hdl:60,ldl:120}).lipids.castelliII,2);
});
test('atividade e marcadores são preservados como preditores candidatos',()=>{
 const r=assess({physicalActivity:'insuficiente',isBlack:true,isPcd:true,sexualOrientation:'bissexual',genderIdentity:'nao_binaria'});
 assert.equal(r.activity.reportedCategory,'insuficiente');assert.equal(r.social.blackReported,true);
 assert.equal(r.social.genderIdentity,'nao_binaria');assert.equal(r.social.coefficient,null);
});
test('não transforma falta de informação em ausência de risco ou exposição',()=>{
 const r=assess({isBlack:false,isPcd:false});
 assert.equal(r.social.blackReported,null);assert.equal(r.social.disabilityReported,null);
 assert.equal(r.activity.reportedCategory,null);
 assert.equal(assess({totalCholesterol:100,hdl:110}).lipids.castelliI,null);
});
