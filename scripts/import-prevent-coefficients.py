"""Extract the published S12A/S12D coefficient transcription from preventr's data.
Input is a local R data file. No patient information or network calls.
Scientific source: doi:10.1161/CIRCULATIONAHA.123.067626, supplemental Table S12.
Technical transcription: https://github.com/martingmayer/preventr
Commit: ebe2ac15c38569c3bdaf871c4853b6eeff77b039 (not an AHA implementation).
"""
import hashlib, json, sys, warnings
from pathlib import Path
import rdata
warnings.filterwarnings('ignore', category=UserWarning, module='rdata')
p=Path(sys.argv[1]); raw=p.read_bytes(); data=rdata.read_rda(p)
result={'version':'PREVENT-2023-S12-10y', 'doi':'10.1161/CIRCULATIONAHA.123.067626',
 'source':'Supplemental Table S12A (base), S12D (SDI)',
 'transcription':'preventr; ebe2ac15c38569c3bdaf871c4853b6eeff77b039',
 'inputSha256':hashlib.sha256(raw).hexdigest(), 'models':{}}
for k in ['base_10yr','sdi_10yr']:
 frame=data[k]
 result['models'][k]={'terms':frame.iloc[:,0].tolist(),
  'coefficients':{col:frame[col].tolist() for col in frame.columns[1:]}}
root=Path(__file__).resolve().parents[1]
(root/'data/prevent-coefficients.js').write_text('/* Scientific coefficients; see docs/clinical-models.md for provenance. */\n(function(root) {\n  const data = '+json.dumps(result,ensure_ascii=False,indent=2)+';\n  if (typeof module === "object" && module.exports) module.exports = data;\n  else root.PREVENT_COEFFICIENTS = data;\n})(typeof globalThis !== "undefined" ? globalThis : this);\n')
print('Exported base + SDI, 10 outcomes each, full published precision.')
