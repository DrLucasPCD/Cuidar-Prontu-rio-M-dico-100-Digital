"""Aggregate official CNEFE 2022 Recife ZIP without publishing addresses.
Usage: python3 scripts/build-recife-cep-sectors.py input.zip
Source: ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/
Censo_Demografico_2022/Arquivos_CNEFE/CSV/Municipio/26_PE/2611606_RECIFE.zip
Sector codes are retained literally: preliminary 'P' codes are NOT converted
to the final census mesh by stripping their suffix.
"""
import csv, hashlib, io, json, re, sys
from collections import Counter, defaultdict
from pathlib import Path
from zipfile import ZipFile

p=Path(sys.argv[1]); groups=defaultdict(Counter); excluded=Counter(); total=0
with ZipFile(p) as z:
    with z.open('2611606_RECIFE.csv') as f:
        for row in csv.DictReader(io.TextIOWrapper(f,encoding='utf-8-sig'),delimiter=';'):
            total+=1
            if row['COD_MUNICIPIO']!='2611606': raise ValueError('Município incorreto')
            if row['COD_ESPECIE']!='1':
                excluded['nonPrivateDwellings']+=1; continue
            cep=row['CEP']; sector=row['COD_SETOR']
            if not re.fullmatch(r'\d{8}',cep) or cep in ('00000000','50000000'):
                excluded['missingOrGenericCep']+=1; continue
            if not re.fullmatch(r'2611606\d{8}P?',sector):
                raise ValueError('Código setorial inesperado: '+sector)
            groups[cep][sector]+=1
db={
 'version':'cnefe-2022-recife-v1','referenceYear':2022,
 'source':'IBGE - CNEFE do Censo 2022, divulgação de 2024',
 'sourceUrl':'https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/Municipio/26_PE/2611606_RECIFE.zip',
 'inputSha256':hashlib.sha256(p.read_bytes()).hexdigest(),
 'method':'Contagem de endereços de domicílios particulares por CEP e código setorial original. Sem estimativa de renda ou risco clínico. Códigos preliminares não harmonizados com setores definitivos.',
 'quality':{'inputRows':total,'excluded':dict(excluded),'ceps':len(groups),'ambiguousCeps':sum(len(v)>1 for v in groups.values()),'privateDwellingsWithUsableCep':sum(sum(v.values()) for v in groups.values())},
 'entries':{cep:dict(sorted(sectors.items())) for cep,sectors in sorted(groups.items())}}
out=Path(__file__).resolve().parents[1]/'data/recife-cep-sectors.js'
out.write_text('window.RECIFE_CEP_SECTORS = '+json.dumps(db,ensure_ascii=False,separators=(',',':'))+';\n')
print(json.dumps(db['quality'],ensure_ascii=False,indent=2))
