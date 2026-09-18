# Ficha técnica — Cuidar+

**Projeto:** Cuidar+ — Guia Educativo de Prevenção em Saúde
**Data da análise:** 01/09/2026
**Versão identificada:** projeto sem número de versão formal; base territorial municipal gerada em 30/08/2026
**Repositório analisado:** `prontuario. ubs`
**Idioma da interface:** português do Brasil (`pt-BR`)
**Status funcional:** protótipo funcional/solução educativa, sem persistência de atendimentos

## 1. Resumo executivo

O Cuidar+ é uma aplicação web responsiva, com uma segunda interface otimizada para celular, voltada ao apoio educativo em prevenção na Atenção Primária à Saúde (APS). A ferramenta recebe um perfil clínico mínimo, calcula IMC, índices de Castelli e uma classificação educativa de risco cardiovascular e de AVC, sugere ações preventivas e permite gerar localmente um texto para copiar, imprimir ou salvar como PDF.

O sistema também associa o CEP informado a um indicador territorial de Pernambuco. Para Recife, utiliza uma base local detalhada por CEP ou prefixo de CEP. Para os demais municípios pernambucanos, consulta o ViaCEP para obter município/UF/código IBGE e cruza o resultado com uma base municipal derivada do Censo 2022/IBGE.

O projeto foi deliberadamente configurado para não coletar identificadores pessoais ou profissionais e não salvar dados individuais de atendimento. O único armazenamento persistente previsto no navegador é o dicionário local de classificações CID/APS importado pelo usuário.

> **Importante:** apesar de a interface usar expressões como “prontuário médico” e “receituário”, o comportamento implementado atualmente é de guia educativo e gerador local de texto. Não há prontuário persistente, prescrição eletrônica, autenticação, assinatura digital ou validação online efetiva.

## 2. Objetivo e público-alvo

### Objetivo principal

Apoiar uma avaliação preventiva estruturada, combinando fatores clínicos, hábitos, marcadores de equidade e contexto territorial para orientar a revisão de exames, vacinação, rastreamentos e seguimento na APS.

### Usuários previstos

- profissionais ou estudantes da área da saúde em atividade educativa;
- equipes de APS que necessitem de uma checklist preventiva local;
- usuários que precisem montar uma prévia textual de orientação, sem identificação pessoal.

### Fora do escopo atual

- diagnóstico médico;
- cálculo de um escore cardiovascular validado;
- prescrição de medicamentos;
- substituição de protocolos do Ministério da Saúde, secretarias ou serviços;
- armazenamento de prontuário ou histórico de atendimentos;
- identificação do paciente, profissional ou unidade;
- assinatura, certificação ou validação criptográfica de documentos;
- sincronização entre dispositivos ou usuários.

## 3. Escopo funcional implementado

| Módulo | O que faz | Persistência |
|---|---|---|
| Perfil clínico | Recebe sexo, idade, peso, altura, atividade física, CEP, lipídios e marcadores de equidade | Apenas memória da página |
| Comorbidades | Permite marcar hipertensão, diabetes, tabagismo, doença cardiovascular, histórico familiar e obesidade conhecida | Apenas memória da página |
| IMC | Calcula IMC e classifica em baixo peso, eutrofia, sobrepeso e obesidade graus I–III | Apenas memória da página |
| Risco cardiovascular/AVC | Gera pontuação educativa e três níveis de risco | Apenas memória da página |
| Índices de Castelli | Calcula Castelli I e II quando os três lipídios estão preenchidos | Apenas memória da página |
| Recomendações | Sugere exames, rastreamentos, vacinação, atividade física e seguimentos por regra | Apenas memória da página |
| Classificação CID/APS | Pesquisa 106 itens-base, adiciona 1.101 itens CID-11 extras e permite importar JSON/CSV | Dicionário em `localStorage` |
| Indicador territorial | Resolve CEP e classifica vulnerabilidade territorial em quatro faixas | Cache temporário no servidor; base estática local |
| Documento | Monta texto com perfil, resultados, classificação, exames e observações | Cópia/impressão local |
| Exportação | Copia para a área de transferência, abre impressão e permite “Salvar como PDF” | Arquivo fica sob decisão do usuário |
| Validação | Exibe uma tela informativa de consulta de código | Desativada no modo educativo |

## 4. Fluxo de uso

1. O usuário abre a versão web ou a versão móvel.
2. Preenche os campos obrigatórios: sexo, idade, peso e altura.
3. Opcionalmente informa atividade física, CEP, colesterol total, HDL, LDL, orientação sexual, identidade de gênero, início da vida sexual, comorbidades e marcadores de equidade.
4. O sistema calcula IMC e, com os dados disponíveis, atualiza o resumo de risco.
5. Ao enviar o formulário, o sistema resolve o território, gera recomendações e marca todas as recomendações como selecionadas.
6. O usuário revisa os itens, desmarca o que não se aplica e pode inserir exames extras.
7. Informa uma classificação CID-11/CIAP-2/APS e observações gerais sem dados identificáveis.
8. O documento é atualizado em tempo real e pode ser copiado, impresso ou salvo pelo navegador como PDF.
9. “Limpar formulário” remove o estado do atendimento da tela e restaura o estado inicial.

## 5. Entradas de dados

### Campos clínicos

| Campo | Tipo | Obrigatório | Validação/interface | Uso |
|---|---|---:|---|---|
| Sexo | seleção | Sim | Feminino, masculino ou outro | Escore e regras de rastreamento |
| Idade | número | Sim | 0–120 anos | Escore e faixas de recomendação |
| Peso | número | Sim | mínimo 1 kg; uma casa decimal | Cálculo do IMC |
| Altura | número | Sim | 0,50–2,50 m; duas casas decimais | Cálculo do IMC |
| Atividade física | seleção | Não | Regular, insuficiente ou sedentário/inativo | Ajuste de risco e aconselhamento |
| CEP | texto | Não | 8 dígitos; máscara `00000-000` | Indicador territorial |
| Colesterol total | número | Não | 1–1000 mg/dL | Castelli I |
| HDL | número | Não | 1–300 mg/dL | Castelli I e II |
| LDL | número | Não | 1–600 mg/dL | Castelli II |
| Orientação sexual | seleção | Não | Opções predefinidas | Marcador de vulnerabilidade social quando informado |
| Identidade de gênero | seleção | Não | Opções predefinidas | Marcador de vulnerabilidade social quando aplicável |
| Início da vida sexual | seleção | Não | Sim, não ou não informado | Regra de rastreamento do colo uterino |
| Classificação | texto com sugestões | Não | CID-11, CIAP-2 ou dicionário local | Referência no documento |
| Observações | texto livre | Não | Aviso explícito contra identificadores | Inclusão no documento local |

### Marcadores binários

- hipertensão arterial (`has`);
- diabetes mellitus (`dm2`);
- tabagismo (`tabagismo`);
- doença cardiovascular (`dcv`);
- histórico familiar relevante de DM2/DCV (`drf`);
- obesidade prévia/conhecida (`obesidade`);
- pessoa negra, preta ou parda;
- pessoa com deficiência (PCD).

## 6. Regras de cálculo

### 6.1 IMC

```text
IMC = peso_kg / (altura_m × altura_m)
```

Classificação implementada:

| Faixa | Classificação |
|---:|---|
| < 18,5 | Baixo peso |
| 18,5 a < 25 | Eutrofia |
| 25 a < 30 | Sobrepeso |
| 30 a < 35 | Obesidade grau I |
| 35 a < 40 | Obesidade grau II |
| ≥ 40 | Obesidade grau III |

### 6.2 Índices de Castelli

Os índices somente são calculados quando colesterol total, HDL e LDL estão preenchidos com valores positivos.

```text
Castelli I  = colesterol total / HDL
Castelli II = LDL / HDL
```

| Índice | Favorável | Intermediário | Alto |
|---|---:|---:|---:|
| Castelli I | < 3,5 | 3,5–5,0 | > 5,0 |
| Castelli II | < 2,5 | 2,5–3,5 | > 3,5 |

Pontuação dos lipídios:

- cada índice favorável soma 0;
- cada índice intermediário soma 1;
- cada índice alto soma 2;
- a soma é limitada a 3 pontos para risco cardiovascular;
- para risco de AVC, a contribuição é limitada a 2 pontos.

### 6.3 Pontuação de risco cardiovascular

O algoritmo soma pontos inteiros e classifica o resultado com limites comuns para a pontuação cardiovascular e de AVC:

| Pontuação | Nível | Faixa textual exibida |
|---:|---|---|
| 0–4 | Baixo | Cardiovascular <10% |
| 5–8 | Moderado | Cardiovascular 10–19% |
| >8 | Alto | Cardiovascular ≥20% |

Para AVC, a mesma divisão de pontuação é usada, mas a faixa textual é `<5%`, `5–9%` e `≥10%`.

#### Componentes cardiovasculares

| Fator | Pontos |
|---|---:|
| Idade 30–39 | +1 |
| Idade 40–49 | +2 |
| Idade 50–59 | +3 |
| Idade ≥60 | +4 |
| Sexo masculino | +1 |
| Hipertensão | +3 |
| Diabetes | +3 |
| Tabagismo | +2 |
| Doença cardiovascular | +2 |
| Histórico familiar relevante | +1 |
| IMC 25–29,9 | +1 |
| IMC ≥30 | +2 |
| Pessoa negra | +1 |
| PCD | +1 |
| Orientação sexual não heterossexual, quando informada | +1 |
| Identidade trans, travesti, não binária ou outra | +1 |
| Vulnerabilidade territorial | 0 a +3 |
| Atividade física | -1, 0, +1 ou +2 |
| Índices de Castelli | 0 a +3 |

#### Componentes de AVC

| Fator | Pontos |
|---|---:|
| Idade 35–44 | +1 |
| Idade 45–54 | +2 |
| Idade 55–64 | +3 |
| Idade ≥65 | +4 |
| Hipertensão | +4 |
| Diabetes | +2 |
| Tabagismo | +2 |
| Doença cardiovascular | +3 |
| IMC ≥30 | +1 |
| Pessoa negra | +1 |
| PCD | +1 |
| Orientação sexual não heterossexual, quando informada | +1 |
| Identidade trans, travesti, não binária ou outra | +1 |
| Vulnerabilidade territorial | 0 a +3 |
| Atividade física | -1, 0, +1 ou +2 |
| Índices de Castelli | 0 a +2 |

Atividade física:

| Situação | Ajuste |
|---|---:|
| Regular, ≥150 min/semana | -1 |
| Insuficiente, <150 min/semana | +1 |
| Sedentário/inativo | +2 |
| Não informado | 0 |

O código força a pontuação final a não ficar abaixo de zero. As faixas percentuais exibidas são aproximações pedagógicas associadas às categorias; não representam probabilidade clínica validada.

### 6.4 Indicador territorial

#### Recife

A base local `data/cep-socioeconomico-db.js` possui 9.363 entradas na versão analisada. O índice de 0 a 100 combina:

| Componente | Peso |
|---|---:|
| Esgoto | 30% |
| Água | 20% |
| Pavimentação | 15% |
| Coleta de lixo | 15% |
| Iluminação | 10% |
| Limpeza urbana | 10% |

O sistema tenta, nesta ordem:

1. correspondência exata por CEP;
2. média aproximada do prefixo de cinco dígitos;
3. consulta externa para resolver o município, quando o CEP não está na base detalhada.

O CEP genérico `50000-000` é explicitamente excluído da aplicação do ajuste territorial.

#### Demais municípios de Pernambuco

O arquivo `data/pe-municipal-territory-db.js` contém 185 municípios e referência de 2022. O índice municipal é a média aritmética de três coberturas do Censo 2022/IBGE:

- domicílios ligados à rede geral de água e que a usam como fonte principal;
- domicílios com rede geral, rede pluvial ou fossa ligada à rede;
- domicílios com lixo coletado.

O script exige que os três indicadores tenham o mesmo período e bloqueia a geração se a cobertura estadual for inferior a 180 localidades.

#### Faixas territoriais

| Índice | Categoria | Pontos adicionados |
|---:|---|---:|
| 85–100 | Baixa vulnerabilidade territorial | 0 |
| 70–84 | Vulnerabilidade territorial moderada-baixa | 1 |
| 55–69 | Vulnerabilidade territorial moderada-alta | 2 |
| 0–54 | Alta vulnerabilidade territorial | 3 |

O indicador é ecológico e territorial. Não estima renda individual, exposição individual, condição clínica nem causalidade biológica.

## 7. Motor de recomendações

As recomendações são regras determinísticas no navegador. O sistema cria até 14 tipos de saída, conforme o perfil:

- aferição de pressão arterial para idade ≥18;
- rastreamento de DM2 para idade ≥45, sobrepeso com risco de DM2 ou hipertensão;
- perfil lipídico para fator cardiovascular ou idade ≥40;
- reavaliação lipídica quando Castelli I/II estiver intermediário ou alto;
- estratificação de risco de AVC/cardiovascular para fator cardiovascular ou idade ≥35;
- aconselhamento de atividade física quando insuficiente ou sedentário;
- creatinina/eTFG e albuminúria em diabetes ou hipertensão;
- mamografia bilateral a cada dois anos para sexo feminino, 50–69 anos;
- rastreamento de colo uterino para sexo feminino, 25–64 anos, quando início da vida sexual é “sim”;
- confirmação do início da vida sexual quando esse campo não foi informado;
- mensagem de ausência de indicação de rastreamento de colo uterino quando a resposta é “não”;
- verificação de situação vacinal a partir de 25 anos;
- inclusão de exames extras digitados manualmente;
- fallback de “sem recomendações automáticas” caso nenhuma regra seja acionada.

As recomendações são renderizadas como caixas de seleção. Somente os itens selecionados entram no documento final. O texto selecionado é categorizado em exames de sangue, urina, imagem, avaliações clínicas e outros procedimentos.

## 8. Documento gerado

O documento é montado no cliente e contém:

- título Cuidar+ e indicação de orientação preventiva;
- sexo e idade;
- peso, altura e atividade física;
- CEP;
- orientação sexual, identidade de gênero e início da vida sexual;
- IMC e classificação;
- colesterol total, HDL, LDL e índices de Castelli;
- níveis textuais de risco cardiovascular e de AVC;
- comorbidades e fatores marcados;
- fatores de equidade e acesso;
- descrição do território considerado;
- classificação CID-11/CIAP-2/APS;
- exames e prevenções selecionados, agrupados por categoria;
- observações gerais;
- aviso de privacidade e uso educativo;
- data/hora de geração.

Não existe geração de arquivo PDF por biblioteca. A ação “Exportar PDF” abre a impressão do navegador e orienta o usuário a escolher “Salvar como PDF”.

## 9. Dicionário de classificações

O dicionário padrão é composto por:

- 106 itens embutidos no `app.js`;
- 1.101 itens adicionais em `cid11-extra.js`;
- deduplicação por sistema, código e nome normalizados;
- busca exata por código ou nome;
- sugestões por início ou ocorrência parcial, limitadas a seis resultados;
- importação local de JSON ou CSV;
- restauração do dicionário padrão;
- gravação no `localStorage` sob a chave `classificationCatalogV1`.

O importador CSV espera colunas `system,code,name`. A implementação atual separa colunas por vírgula e não implementa um parser completo para CSV com campos entre aspas e vírgulas internas.

## 10. Arquitetura técnica

### Frontend

- HTML5 sem framework;
- CSS3 responsivo;
- JavaScript vanilla em `app.js`;
- `index.html`: interface desktop/web com painel lateral, etapas e diálogo de documento;
- `app-mobile.html`: interface móvel em fluxo vertical;
- `styles.css` e `styles-mobile.css`;
- `manifest.webmanifest` com `display: standalone`, tema teal e ícones Cuidar+;
- sem dependência de framework frontend;
- sem service worker identificado, portanto não há cache offline completo implementado.

### Backend local

- Node.js;
- módulo nativo `http`;
- servidor de arquivos estáticos;
- integração com `functions/territory.js`;
- porta padrão `3000`, alterável por `PORT`;
- resposta JSON para API;
- `Cache-Control: no-store` nos arquivos estáticos.

### Backend de produção

- Firebase Cloud Functions v2;
- Express 4.21.2;
- Node.js 20;
- região `southamerica-east1`;
- CORS habilitado;
- Firebase Hosting configurado para publicar a raiz do projeto;
- rewrite de `/api/**` para a função `api`.

### Integração externa

- ViaCEP: resolve CEP, UF, município, código IBGE e bairro;
- limite de seis segundos para a consulta ViaCEP;
- cache em memória de até 500 CEPs, com TTL de 24 horas;
- IBGE SIDRA: usado no script de atualização da base municipal;
- Prefeitura do Recife: fonte da base detalhada por faces de quadra.

## 11. API disponível

As rotas existem tanto no servidor local quanto na função Express, com o prefixo local `/api` e o prefixo de função `/api` no ambiente hospedado.

| Método | Rota | Comportamento |
|---|---|---|
| GET | `/api/health` | Retorna `{ ok: true, ts }` |
| GET | `/api/territory/cep/:cep` | Valida o CEP e consulta ViaCEP com cache em memória |
| POST | `/api/documents` | Retorna HTTP 410; persistência desativada |
| GET | `/api/verify/:code` | Retorna HTTP 410; validação desativada |
| GET | `/api/audit/:code` | Retorna HTTP 410; auditoria desativada |
| qualquer | rota desconhecida | Retorna HTTP 404 |

As rotas de documentos, verificação e auditoria são placeholders explicitamente desativados, não funcionalidades operacionais.

## 12. Privacidade, LGPD e segurança observável

### Controles implementados

- não há campos de nome, CPF, CNS, telefone, e-mail ou identificação profissional;
- o documento inclui aviso explícito de uso educativo;
- não há escrita em Firestore ou Realtime Database;
- `firestore.rules` nega leitura e escrita para todos os documentos;
- `database.rules.json` nega leitura e escrita para toda a base;
- dados do atendimento ficam apenas no DOM/memória durante a sessão;
- o CEP é usado para consulta e não é salvo em banco nem incluído em prontuário persistente;
- cache do CEP é temporário e limitado em memória do processo;
- o dicionário local não é vinculado a indivíduos;
- a consulta ViaCEP envia apenas o CEP informado ao serviço externo.

### Pontos que exigem atenção antes de produção clínica

- não existe autenticação ou autorização de usuários;
- CORS da Cloud Function está configurado como aberto (`cors: true`);
- não há rate limiting, observabilidade, gestão de sessão ou trilha de auditoria operacional;
- não existe política técnica de retenção para logs do provedor ou do serviço externo;
- os marcadores de orientação sexual, identidade de gênero, raça/cor e deficiência são dados sensíveis no contexto de saúde e exigem governança adicional se o escopo mudar para persistência;
- os cálculos de risco não são um protocolo clínico validado;
- o conteúdo livre de observações pode receber dados identificáveis apesar do aviso na interface;
- validação de documento, hash e auditoria não estão ativos;
- a função externa deve ser protegida contra abuso antes de exposição pública.

## 13. Estrutura de arquivos

| Arquivo | Responsabilidade |
|---|---|
| `index.html` | Interface web principal |
| `app-mobile.html` | Interface móvel |
| `app.js` | Estado, cálculos, recomendações, classificação, CEP e documento |
| `styles.css` | Estilos da interface principal |
| `styles-mobile.css` | Estilos da interface móvel |
| `server.js` | Servidor local e API local |
| `config.js` | Seleção da base de API local/externa |
| `functions/index.js` | Express dentro da Cloud Function |
| `functions/territory.js` | Sanitização, consulta ViaCEP e cache |
| `functions/package.json` | Dependências e scripts do backend |
| `data/cep-socioeconomico-db.js` | Base detalhada de Recife |
| `data/pe-municipal-territory-db.js` | Base municipal de Pernambuco |
| `scripts/update-territorial-data.js` | Atualização da base via IBGE SIDRA |
| `cid11-extra.js` | Itens extras do CID-11 |
| `verify.html` | Tela informativa de validação desativada |
| `manifest.webmanifest` | Metadados de instalação da web app |
| `firestore.rules` | Bloqueio total do Firestore |
| `database.rules.json` | Bloqueio total do Realtime Database |
| `firebase.json` | Configuração de Hosting, Functions e rewrite |
| `README.md` | Execução local, implantação e escopo |

## 14. Execução e implantação

### Local

Pré-requisito: Node.js compatível com as APIs utilizadas; para o backend de produção, o projeto declara Node 20.

```bash
node server.js
```

Interfaces:

- `http://localhost:3000/index.html`;
- `http://localhost:3000/app-mobile.html`;
- `http://localhost:3000/verify.html`.

### Firebase

O `firebase.json` está preparado para:

- Hosting com a raiz do projeto como pasta pública;
- Functions na pasta `functions`;
- rewrite de `/api/**` para a função `api` em `southamerica-east1`.

O projeto analisado não contém `.firebaserc`; portanto, o `project id` precisa ser associado antes do deploy, conforme o próprio README orienta.

### Atualização territorial

```bash
node scripts/update-territorial-data.js
```

O workflow mensal `.github/workflows/update-territorial-data.yml` consulta o período mais recente das tabelas IBGE 6803, 6805 e 6892, calcula a base e somente cria commit quando o fingerprint SHA-256 muda. Isso atualiza a fonte periodicamente; não constitui monitoramento territorial em tempo real.

## 15. Verificações realizadas nesta análise

- sintaxe verificada com sucesso em `app.js`, `server.js`, `functions/index.js`, `functions/territory.js` e `scripts/update-territorial-data.js`;
- servidor local iniciado com sucesso na porta 3000;
- `index.html` retornou HTTP 200;
- `/api/health` retornou `ok: true`;
- CEP incompleto retornou HTTP 400;
- base municipal carregada com 185 localidades;
- base detalhada de Recife carregada com 9.363 entradas;
- dicionário CID-11 extra carregado com 1.101 itens;
- não foram encontrados testes automatizados no inventário analisado;
- não foi identificado service worker;
- não foi executado teste completo de navegador, acessibilidade, carga ou segurança ofensiva.

## 16. Riscos e limitações do produto

### Risco clínico

O maior risco é a interpretação indevida das categorias como diagnóstico ou probabilidade validada. A própria interface informa que o modelo é educativo, mas essa mensagem deve permanecer visível em qualquer distribuição e documento exportado.

### Risco de dados sensíveis

Embora não haja persistência intencional, o navegador, o provedor de hospedagem, o serviço ViaCEP e logs de infraestrutura podem ter políticas próprias. Caso o projeto passe a guardar atendimentos, será necessário redesenhar consentimento, minimização, controle de acesso, criptografia, retenção, anonimização, auditoria e resposta a incidentes.

### Risco territorial

O índice é uma aproximação ecológica. A resolução por prefixo e município reduz a precisão e o resultado pode não representar a residência real, a exposição individual ou as barreiras efetivamente vivenciadas.

### Risco operacional

O funcionamento do CEP fora da base local depende do ViaCEP. Em caso de indisponibilidade, o sistema não aplica ajuste territorial. A exportação depende do diálogo de impressão do navegador.

## 17. Recomendações técnicas para a próxima versão

1. Renomear a proposta e a interface para reforçar “guia educativo” e evitar expectativa de prontuário clínico real.
2. Adicionar testes unitários para IMC, Castelli, faixas de risco, regras territoriais e motor de recomendações.
3. Adicionar testes de integração para todas as rotas da API e cenários de falha do ViaCEP.
4. Criar um arquivo formal de versão, changelog e definição de ambiente.
5. Incluir `.firebaserc` ou documentar claramente o comando de associação do projeto Firebase.
6. Restringir CORS, adicionar rate limiting, logs estruturados sem conteúdo clínico e monitoramento de erros.
7. Adicionar cabeçalhos de segurança, política de conteúdo e revisão de exposição dos arquivos estáticos.
8. Implementar um parser CSV compatível com campos entre aspas ou limitar/documentar o formato aceito.
9. Fazer auditoria clínica independente das regras e trocar as faixas aproximadas por protocolos validados, se o uso deixar de ser apenas educativo.
10. Avaliar service worker e estratégia de cache caso seja necessário suporte offline real.
11. Definir estratégia de acessibilidade com teste de teclado, leitor de tela, contraste e mensagens de erro.
12. Manter as bases territoriais com data, fingerprint, fonte e metodologia exibidos ao usuário.
13. Separar claramente “documento de orientação” de “receita” e retirar terminologia de prescrição até que exista fluxo regulado.
14. Se houver persistência futura, criar autenticação, perfis de acesso, consentimento e modelo de dados mínimo antes de habilitar `/documents`, `/verify` ou `/audit`.

## 18. Conclusão

O projeto já entrega um fluxo funcional de apoio à prevenção em saúde, com interface web e móvel, cálculo local, recomendações condicionais, dicionário classificatório extensível e contextualização territorial específica para Pernambuco. A arquitetura é simples de executar e possui uma camada de backend preparada para consulta de CEP e eventual evolução em Firebase.

O produto, no estado atual, deve ser tratado como protótipo ou ferramenta educativa sem persistência. Para ser utilizado como prontuário clínico ou sistema de produção em saúde, ainda seriam necessários validação clínica, testes automatizados, governança de dados sensíveis, autenticação, autorização, auditoria, segurança de infraestrutura e definição regulatória/operacional.
