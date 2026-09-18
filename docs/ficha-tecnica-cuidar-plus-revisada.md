# Cuidar+ — Ficha técnica revisada

**Versão de pesquisa: 18 de setembro de 2026.** Revisão do módulo cardiovascular e do componente territorial, com ênfase no item 6.4. Documento metodológico e de implementação; não constitui demonstração de validade clínica do aplicativo completo.

## 1. Objetivo e situação científica

O Cuidar+ apoia a organização da avaliação preventiva na atenção primária. Esta revisão substitui a conversão de pontos empíricos em probabilidades cardiovasculares por equações publicadas e explicita a hipótese de contribuição social. A pesquisa ainda não dispõe de base longitudinal com desfechos, conforme informado pelo pesquisador responsável. Portanto, é possível verificar cálculos, consistência de dados e sensibilidade das equações; não é possível medir, neste momento, discriminação, calibração ou benefício clínico em Recife.

**Conclusão:** o módulo implementa equações com desenvolvimento e avaliação publicados. A implementação local foi submetida a testes. O aplicativo e sua futura extensão territorial brasileira não devem ser descritos como clinicamente validados. Os demais módulos, incluindo pediatria, avaliação geriátrica e recomendações preventivas, não receberam validação clínica nesta revisão.

## 2. Alterações efetivamente implementadas

| Aspecto | Versão anterior | Revisão |
| --- | --- | --- |
| Probabilidade cardiovascular | Pontos locais convertidos em faixas percentuais | PREVENT simplificado, horizonte de 10 anos |
| Contribuição territorial | Acréscimo de 0–3 pontos por índice de infraestrutura | Cenários PREVENT+SDI, com diferença em pontos percentuais dentro da mesma equação |
| CEP | Correspondência exata ou média de prefixo postal | Correspondência exata com CNEFE; multiplicidade de códigos setoriais informada |
| Ausência de informação | Poderia resultar em zero ponto | Risco não calculado quando faltam preditores; território desconhecido não significa baixo risco |
| Marcadores sociais individuais | Pontos por raça, deficiência, orientação e identidade | Não alteram a equação cardiovascular |
| Atividade física e Castelli | Pontos positivos ou negativos | Sem acréscimo à equação PREVENT; razões lipídicas descritivas |
| Categorias de risco | Baixo/moderado/alto por cortes locais | Probabilidades contínuas; sem novos cortes terapêuticos arbitrários |

A interface web, a interface móvel e o relatório foram atualizados. A aplicação não converte automaticamente um CEP brasileiro em SDI. Essa conversão permanece pendente de harmonização geográfica, definição do construto e avaliação preditiva. Os cenários sociais são identificados como hipotéticos para pesquisa.

## 3. Escolha do modelo clínico

Selecionou-se PREVENT por disponibilizar equações para prevenção primária que incorporam fatores cardiovasculares, renais e metabólicos e uma extensão com privação social. O estudo original de Khan e colaboradores foi publicado em Circulation; sua documentação distingue modelos básicos e modelos com preditores adicionais [1,2]. A escolha permite investigar contribuição social sem inventar um multiplicador de risco.

Há avaliação brasileira comparando PREVENT e WHO na coorte ELSA-Brasil, com 11.077 participantes e 157 eventos ateroscleróticos em cinco anos. Foram relatadas AUC de 0,76 e 0,75, respectivamente, e razões previsto/observado de 1,21 e 1,57. O estudo não utilizou SDI brasileiro e transformou o horizonte de dez para cinco anos. Assim, sustenta investigação do PREVENT no Brasil, mas não valida automaticamente sua calibração em Recife, todos os seus desfechos ou sua extensão social [3].

A WHO constitui alternativa internacional com modelos regionalizados, inclusive para a América Latina Tropical. Não foi implementada em paralelo nesta revisão, para evitar misturar previsões e classificações de modelos diferentes [4,5].

## 4. População, entradas e saídas

O motor aplica equações simplificadas de dez anos para adultos de 30 a 79 anos, sem doença cardiovascular prévia. Doença cardiovascular prévia, incluindo AVC e insuficiência cardíaca, impede a estimativa de prevenção primária. A interface exige respostas explícitas para diabetes, tabagismo atual, tratamento anti-hipertensivo, estatina e doença cardiovascular prévia; campo vazio não equivale a “não”.

| Variável | Unidade ou codificação | Controle de implementação |
| --- | --- | --- |
| Idade | Anos | 30–79 |
| Sexo da equação publicada | Feminino/masculino | Sem imputação pela identidade de gênero |
| Pressão arterial sistólica | mmHg | 90–200 |
| Colesterol total / HDL | mg/dL | 130–320 / 20–100; HDL menor que total |
| IMC | kg/m² | 18,5 a menor que 40 |
| eTFG | mL/min/1,73 m² | 15–140; informar valor clínico disponível |
| Diabetes e tabagismo atual | Sim/não | Ausência de resposta bloqueia cálculo |
| Anti-hipertensivo e estatina | Sim/não | Ausência de resposta bloqueia cálculo |

Esses limites são controles conservadores de aplicabilidade do software, não critérios diagnósticos. Não há truncamento silencioso de valores extremos. A adequação das equações em populações não representadas deve ser estudada. A eTFG não é calculada a partir de creatinina nesta implementação.

As saídas são probabilidades de DCV total, doença cardiovascular aterosclerótica (ASCVD), insuficiência cardíaca e AVC em dez anos. São desfechos sobrepostos: **não devem ser somados entre si**. O app não deriva automaticamente indicação terapêutica dessas probabilidades.

## 5. Equações e rastreabilidade

Implementaram-se as tabelas suplementares S12A e S12D do PREVENT simplificado [1]. A probabilidade é obtida por transformação logística do preditor linear: p = 1 / (1 + exp(−η)), com η = intercepto + soma dos produtos entre coeficientes e preditores transformados. O resultado exibido é 100 × p. Incluem-se centralizações, termos segmentados e interações especificados pelo modelo; a função não se resume a somar fatores de risco brutos.

Os coeficientes são mantidos em arquivo separado, com metadados e origem. Limitação de rastreabilidade: a transcrição numérica utilizada foi obtida do repositório técnico preventr, commit ebe2ac15c38569c3bdaf871c4853b6eeff77b039, e confrontada com exemplos do artigo. Não se trata de código oficial licenciado da AHA. Uma conferência independente de todas as células com o suplemento original é uma etapa pendente antes de afirmar equivalência completa. A bibliografia científica abaixo usa publicações originais e páginas institucionais; o repositório técnico é identificado separadamente no apêndice.

O modelo base e o modelo com SDI têm conjuntos próprios de coeficientes. Comparar diretamente um com o outro não isola o efeito do termo social. Por isso, a análise social compara categorias **dentro do modelo com SDI**, mantendo os demais dados constantes.

## 6. Componente territorial

### 6.1. Unidade geográfica e papel do CEP

CEP é uma chave postal para localizar um território; não é, isoladamente, uma medida de privação. A revisão importou o arquivo oficial do CNEFE/IBGE 2022 de Recife, selecionou endereços de domicílios particulares e agregou contagens por CEP e código setorial original [6]. Não foram publicados endereços individuais nem coordenadas na base servida pelo app.

A base agregada contém 643.590 endereços de domicílios particulares e 9.050 CEPs. Desses CEPs, 4.338 (47,93%) apresentam mais de um código setorial. Esse percentual descreve CEPs, não pessoas nem domicílios. Códigos preliminares com sufixo “P” foram preservados; remover o sufixo não constitui harmonização válida com uma malha definitiva.

### 6.2. Fontes e indicadores candidatos

| Método | Construção e escala | Utilidade e limite para Recife |
| --- | --- | --- |
| IBP | Privação de pequenas áreas baseada no Censo 2010; três domínios padronizados | Referência brasileira prioritária; exige geografia compatível e atenção à defasagem temporal |
| GeoSES | Índice socioeconômico construído por análise de componentes principais | Alternativa multidimensional; não reproduzir como média simples de sete dimensões |
| SDI | Índice dos EUA com variáveis socioeconômicas; utilizado no PREVENT | Tem coeficiente preditivo publicado; não corresponde automaticamente ao IBP |
| ADI | Privação por pequenas áreas nos EUA | Demonstra importância da unidade espacial; não autoriza transferência direta para CEP brasileiro |
| Índice de infraestrutura anterior | Pesos locais para seis serviços urbanos | Sem coeficientes clínicos estimados; retirado do cálculo de risco |

O IBP é escolhido como candidato a exposição territorial da futura pesquisa por sua elaboração para o Brasil e disponibilidade de documentação e dados institucionais [7–9]. GeoSES é uma alternativa para análise de robustez, não uma variável adicional a somar simultaneamente sem avaliar redundância [10].

### 6.3. Pesos e categorias do indicador de privação

A proposta metodológica é reproduzir o IBP original antes de criar uma adaptação. Seus componentes são renda baixa, analfabetismo e condições domiciliares. O domínio domiciliar combina inadequação de água, esgotamento, coleta de resíduos e ausência de banheiro/sanitário. Os três domínios são padronizados e combinados com igual participação; isso **não equivale a dar o mesmo peso a cada uma das seis variáveis brutas**. Deve-se conservar denominadores, população de referência, parâmetros de padronização e definição de renda do manual [7–9].

A documentação disponibiliza classificações relativas em quantis. Quintis ou decis de privação não representam probabilidades clínicas nem justificam “mais um ponto de risco”. Uma classificação de pesquisa pode usar Q1 a Q5, do menos ao mais privado, conservando os cortes e a população de referência publicados. Não se devem recalcular quantis apenas com os participantes atendidos: isso altera o significado territorial e prejudica comparações.

Os cortes anteriores 85/70/55 e os pesos esgoto 30%, água 20%, pavimentação 15%, lixo 15%, iluminação 10% e limpeza 10% não foram mantidos. A existência de uma fonte oficial para os dados não valida pesos ou cortes inventados pelo aplicativo.

### 6.4. Como o território pode acrescentar risco com base científica

No PREVENT+SDI, o componente social entra no preditor linear por indicadores das categorias de decis 4–6 e 7–10, comparadas aos decis 1–3. Existe ainda tratamento específico para SDI ausente. Os coeficientes são próprios de cada equação e sexo. A contribuição ao risco absoluto é calculada como Δ = 100 × [logística(η + βsocial) − logística(η)], em pontos percentuais, mantendo o mesmo modelo e o perfil clínico [1,2,11].

**Implementado:** seletor de cenários SDI 1–3, 4–6 e 7–10, com cálculo do risco e da diferença contra a referência. Isso permite estudar quantitativamente um acréscimo social com coeficientes publicados, sem apresentar o cenário como classificação observada de um morador do Recife.

**Não implementado como risco individual validado:** substituir o SDI pelo decil do IBP ou acrescentar uma porcentagem fixa pelo CEP. Igual posição ordinal em dois índices não demonstra equivalência de construtos, magnitude de associação ou calibração. Essa substituição seria um novo modelo transportado e precisaria de desenvolvimento/validação próprios.

Exemplo de verificação: mulher de 50 anos, colesterol total 240 mg/dL, HDL 55 mg/dL, PAS 160 mmHg em tratamento, IMC 35, eTFG 90, sem diabetes, tabagismo, estatina ou DCV prévia. O PREVENT base produz DCV total 5,4%, ASCVD 3,6% e insuficiência cardíaca 2,5%, reproduzindo o exemplo publicado. Na equação com SDI, o cenário de referência produz DCV total 4,61%, e o cenário 7–10 produz 5,80%: diferença de aproximadamente +1,19 ponto percentual. Essa simulação não representa efeito causal nem observação de paciente da pesquisa.

A literatura oferece modelos que integram área de residência por coeficientes estimados: PREVENT usa SDI; QRISK3 utiliza Townsend vinculado à área postal no Reino Unido [1,12]. O ADI e o IBP são índices territoriais, não calculadoras cardiovasculares independentes [7,9,13]. Artigo em periódico reconhecido é relevante, mas a qualidade metodológica, a avaliação externa e a compatibilidade com a população-alvo são os critérios decisivos.

### 6.5. Adaptações necessárias para Recife

1. Definir previamente o IBP como exposição principal e conservar sua versão, unidade espacial e documentação.
2. Harmonizar endereços ou coordenadas do CNEFE com a malha territorial correspondente ao índice. Não juntar códigos de censos diferentes apenas por igualdade textual ou remoção de sufixos.
3. Para CEP multissetorial, identificar o setor do endereço ou apresentar incerteza. Pesos por contagem de endereços não devem ser descritos como pesos populacionais.
4. Distinguir atualização temporal de mudança metodológica: usar dados de 2022 exige conferir conceitos, denominadores, renda e comparabilidade; não basta substituir números de 2010.
5. Registrar cobertura, perdas, ambiguidade e qualidade geográfica. Fora da cobertura, manter território desconhecido, sem redução artificial do risco.
6. Estimar ou recalibrar a contribuição territorial com desfechos locais. Conservar o modelo publicado como comparador e evitar duplicação de informações socioeconômicas correlacionadas.

## 7. Verificação realizada e resultados

| Dimensão | Verificação executada | Resultado e limite |
| --- | --- | --- |
| Equações | Exemplos publicados com e sem tabagismo | Reproduzidos após arredondamento a uma casa decimal |
| Entradas | Ausência de dados, limites, DCV prévia, HDL incoerente | Cálculo bloqueado nos casos testados |
| Independência | Marcadores sociais e pontos legados | Não alteram o modelo base |
| Termo social | Comparação de odds entre cenários e perfis | Razão consistente; acréscimo absoluto varia com o perfil |
| Geografia | Contagem e soma da base CNEFE agregada | 9.050 CEPs; 4.338 multissetoriais; 643.590 endereços |
| Regressão do software | Suíte automatizada do projeto | 47 testes aprovados na execução desta revisão |
| Validade preditiva em Recife | Exigiria eventos e seguimento | Não realizada: base ainda inexistente |

Testes de software não medem desempenho clínico. As verificações geográficas confirmam consistência interna do processamento, não comprovam acurácia de todos os endereços no território. Não foram estimados AUC, calibração ou intervalos de confiança locais; números simulados não substituem eventos observados.

## 8. Plano de validação científica prospectiva

Propõe-se coorte de adultos elegíveis atendidos na APS do Recife, com protocolo e plano de análise definidos antes de observar os resultados. Desfecho primário candidato: primeiro evento ASCVD, com definição compatível com o modelo e adjudicação documentada. AVC e insuficiência cardíaca podem ser desfechos secundários, com definições próprias. O horizonte de dez anos deve ser respeitado; seguimento menor exige análise apropriada, e não divisão linear da probabilidade.

O registro mínimo compreende identificador pseudonimizado, data basal, variáveis clínicas do modelo e suas unidades, tratamentos, versão dos coeficientes, probabilidade prevista, fonte e versão territorial, qualidade do vínculo geográfico, datas e tipos de eventos, último contato e óbito por outras causas. CEP e identidade de gênero não devem ser usados para imputar variáveis clínicas ausentes.

O tamanho amostral deve ser determinado pela precisão desejada para calibração e discriminação, incidência esperada, censura e número de parâmetros da eventual extensão. Ainda não há informações locais suficientes para fornecer um número defensável. Não se recomenda uma regra fixa de participantes por variável como única justificativa.

Na avaliação, estimar discriminação apropriada ao tempo, calibração global e por faixas de risco, inclinação de calibração, erro de predição/Brier e utilidade clínica em limiares previamente justificados. Incorporar censura e risco competitivo de óbito conforme o estimando. Obter intervalos de confiança e considerar dependência por território/unidade de saúde. Examinar desempenho por sexo, idade e privação sem tratar subgrupos pequenos como conclusivos.

Comparar o PREVENT original, uma eventual recalibração local e a extensão territorial. Se coeficientes forem estimados usando a coorte, essa etapa é desenvolvimento, não validação externa. Usar reamostragem para otimismo e reservar avaliação temporal/geográfica independente. Não selecionar pesos ou pontos de corte pelo melhor resultado aparente na mesma amostra. Relatar segundo TRIPOD+AI, aplicável também a modelos de regressão [14].

## 9. Reprodutibilidade e pendências

Arquivos centrais: cardiovascular-core.js, data/prevent-coefficients.js, data/recife-cep-sectors.js, scripts/import-prevent-coefficients.py e scripts/build-recife-cep-sectors.py. O processamento registra hash do arquivo de entrada. O teste pode ser repetido com “node --test tests/*.test.js”. A alteração foi realizada no projeto local; não constitui publicação em produção.

Permanecem pendentes: conferência independente integral dos coeficientes com o suplemento, harmonização IBP–geografia, obtenção de coorte com seguimento, eventual recalibração e avaliação externa da contribuição territorial. Essas etapas não foram substituídas por classificações arbitrárias. O formulário atual auxilia a avaliação, mas não implementa banco longitudinal de pesquisa.

## 10. Referências científicas e fontes institucionais

1. Khan SS et al. Development and Validation of the American Heart Association PREVENT Equations. Circulation. 2024;149:430–449. DOI: 10.1161/CIRCULATIONAHA.123.067626. Texto e suplemento: https://pmc.ncbi.nlm.nih.gov/articles/PMC10910659/

2. American Heart Association. About the PREVENT Calculator. https://professional.heart.org/en/guidelines-and-statements/about-prevent-calculator

3. Cardiovascular risk stratification without recalibration: A comparative study of the PREVENT and WHO risk scores in a multiethnic Brazilian cohort. American Journal of Preventive Cardiology. 2026;25:101392. DOI: 10.1016/j.ajpc.2025.101392. https://pmc.ncbi.nlm.nih.gov/articles/PMC12849047/

4. WHO CVD Risk Chart Working Group. World Health Organization cardiovascular disease risk charts: revised models to estimate risk in 21 global regions. Lancet Global Health. 2019;7:e1332–e1345. DOI: 10.1016/S2214-109X(19)30318-3.

5. World Health Organization. Cardiovascular risk charts: Tropical Latin America. https://www.who.int/docs/default-source/cardiovascular-diseases/tropical-latin-america.pdf

6. IBGE. CNEFE, Censo Demográfico 2022. Arquivo municipal de Recife, código 2611606. https://ftp.ibge.gov.br/Cadastro_Nacional_de_Enderecos_para_Fins_Estatisticos/Censo_Demografico_2022/Arquivos_CNEFE/CSV/Municipio/26_PE/2611606_RECIFE.zip

7. Fiocruz/Cidacs. Índice Brasileiro de Privação: metodologia. https://cidacs.bahia.fiocruz.br/ibp/indice/

8. Allik M et al. Small-area Deprivation Measure for Brazil: Data Documentation. University of Glasgow; 2020. DOI: 10.5525/gla.researchdata.980. https://researchdata.gla.ac.uk/980/

9. Allik M et al. Developing a small-area deprivation measure for Brazil. International Journal of Population Data Science. 2025;10(3):2974, conforme metadados da página editorial. DOI: 10.23889/ijpds.v10i3.2974. https://ijpds.org/article/view/2974

10. Barrozo LV et al. GeoSES: A socioeconomic index for health and social research in Brazil. PLOS ONE. 2020;15:e0232074. DOI: 10.1371/journal.pone.0232074.

11. Butler DC et al. Measures of social deprivation that predict health care access and need within a rational area of primary care service delivery. Health Services Research. 2013;48:539–559. DOI: 10.1111/j.1475-6773.2012.01449.x. https://pubmed.ncbi.nlm.nih.gov/22816561/

12. Hippisley-Cox J, Coupland C, Brindle P. Development and validation of QRISK3 risk prediction algorithms to estimate future risk of cardiovascular disease: prospective cohort study. BMJ. 2017;357:j2099. DOI: 10.1136/bmj.j2099.

13. University of Wisconsin School of Medicine and Public Health. Neighborhood Atlas: Area Deprivation Index. https://www.neighborhoodatlas.medicine.wisc.edu/

14. Collins GS et al. TRIPOD+AI statement: updated guidance for reporting clinical prediction models that use regression or machine learning methods. BMJ. 2024;385:e078378. DOI: 10.1136/bmj-2023-078378.

Fontes consultadas durante a revisão de setembro de 2026. As referências sustentam os métodos citados; não devem ser interpretadas como endosso dos autores ao Cuidar+.

## Apêndice — proveniência técnica

A transcrição de coeficientes utiliza preventr, de Martin G. Mayer, repositório https://github.com/martingmayer/preventr, commit ebe2ac15c38569c3bdaf871c4853b6eeff77b039. Essa fonte técnica não é órgão oficial nem substitui a publicação original; sua utilização é declarada para permitir auditoria. A limitação da conferência integral está registrada nas seções 5 e 9.

A base geográfica foi gerada a partir do arquivo oficial IBGE, SHA-256 db8987a56019df7aaa4a2793b4fc31c8b2a439ede5a6bea3661e069d208e75c6. Foram lidas 737.511 linhas e excluídos 93.921 endereços de outras espécies. O resultado descreve endereços, não participantes da pesquisa. A privação não foi calculada a partir desse arquivo.
