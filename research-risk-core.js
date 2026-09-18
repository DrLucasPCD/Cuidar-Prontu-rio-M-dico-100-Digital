/* Candidate predictors for prospective evaluation. No invented risk coefficients. */
(function(root,factory){
  if(typeof module==='object'&&module.exports) module.exports=factory();
  else root.ResearchRiskCore=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const positive=n=>typeof n==='number'&&Number.isFinite(n)&&n>0;
  function assess(p={}){
    const total=positive(p.totalCholesterol)?p.totalCholesterol:null;
    const hdl=positive(p.hdl)?p.hdl:null;
    const ldl=positive(p.ldl)?p.ldl:null;
    const castelliI=total&&hdl&&hdl<total?total/hdl:null;
    const castelliII=ldl&&hdl&&(!total||ldl<total)?ldl/hdl:null;
    const activity=['regular','insuficiente','sedentario'].includes(p.physicalActivity)?p.physicalActivity:null;
    return {
      version:'cuidar-expanded-research-v1',
      status:'candidate_predictors_not_fitted',
      absoluteRisk:null,
      additionalRiskPp:null,
      activity:{reportedCategory:activity,coefficient:null},
      social:{blackReported:p.isBlack===true?true:null,disabilityReported:p.isPcd===true?true:null,
        sexualOrientation:p.sexualOrientation||null,genderIdentity:p.genderIdentity||null,coefficient:null},
      lipids:{castelliI,castelliII,coefficient:null},
      interpretation:'Variáveis candidatas à avaliação de risco ampliada; efeito incremental não estimado. Ausência de coeficiente não significa ausência de associação.'
    };
  }
  return {assess};
});
