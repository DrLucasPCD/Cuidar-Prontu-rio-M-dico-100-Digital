# Ficha técnica atualizada - Cuidar+

**Data da análise:** 13/11/2026
**Código analisado:** revisão Git `910a282`
**Natureza:** aplicação educativa e de pesquisa para apoio à prevenção na Atenção Primária à Saúde (APS).

## 1. Visão geral

O Cuidar+ é uma aplicação web responsiva, com interfaces para computador e celular. Reúne avaliação preventiva de adultos, acompanhamento pediátrico, avaliação geriátrica, escalas de saúde mental e um módulo visual de cuidado. Produz resumos locais para copiar, imprimir ou salvar em PDF.

O sistema não implementa prontuário persistente, prescrição eletrônica, assinatura digital ou validação online efetiva. Não substitui julgamento clínico nem protocolos do serviço. Os módulos de triagem e pesquisa não constituem diagnóstico.

Esta ficha substitui as descrições da ficha de 01/09/2026 que atribuíam pontos arbitrários a fatores sociais, atividade física, Castelli e infraestrutura territorial. Essas regras não descrevem o modelo cardiovascular atual.

## 2. Mudanças incorporadas

- Inclusão de fluxo de puericultura com crescimento, desenvolvimento, M-CHAT-R/F e registro do Denver II.
- Inclusão de Avaliação Geriátrica Ampla (AGA), registros cognitivos MEEM e MoCA e acompanhamento das fontes utilizadas.
- Substituição do escore cardiovascular local pela implementação das equações PREVENT simplificadas de 10 anos e cenários sociais hipotéticos para pesquisa.
- Atualização da associação territorial para correspondência exata por CEP na base agregada do CNEFE/IBGE de Recife.
- Inclusão de módulo visual de cuidado e escalas de saúde mental AQ-10, ASRS-18 e DASS-21.
- Ampliação da suíte de testes automatizados.

## 3. Módulos e funcionalidades

| Módulo | Funcionalidades principais |
|---|---|
| Adulto e prevenção | Perfil clínico, IMC, lipídios, recomendações preventivas, classificação CID/APS e resumo local |
| Cardiovascular | PREVENT de 10 anos, desfechos cardiovasculares, cenário SDI hipotético e avaliação ampliada de pesquisa |
| Pediatria | Antropometria, curvas OMS, idade corrigida, desenvolvimento, Denver II, M-CHAT-R/F e orientações de acompanhamento |
| Geriatria | Funcionalidade, cognição, humor, mobilidade, nutrição, sentidos, medicamentos, suporte social e plano de cuidado |
| Saúde mental | Pontuação de AQ-10, ASRS-18 e DASS-21, com preservação de respostas ausentes |
| Documento | Prévia local, cópia, impressão e PDF pelo diálogo de impressão do navegador |
| Classificação | Consulta ao dicionário CID/APS e importação local de itens em JSON/CSV |

## 4. Avaliação cardiovascular de adultos

O motor implementa as equações simplificadas PREVENT de 10 anos, tabelas S12A e S12D, para pesquisa e apoio educativo. O cálculo base considera idade, sexo da equação publicada, pressão arterial sistólica, colesterol total, HDL, IMC, eTFG, diabetes, tabagismo atual e tratamento anti-hipertensivo e com estatina. O formulário exige resposta explícita sobre doença cardiovascular prévia.

O modelo implementado destina-se à prevenção primária para idades de 30 a 79 anos. Dados obrigatórios ausentes, valores fora dos limites implementados ou doença cardiovascular prévia bloqueiam a estimativa. As saídas abrangem doença cardiovascular total, doença cardiovascular aterosclerótica, insuficiência cardíaca e AVC em dez anos. Esses desfechos se sobrepõem e não devem ser somados.

O seletor de cenários SDI usa categorias hipotéticas da equação publicada e apresenta diferenças em pontos percentuais dentro do mesmo modelo. Não converte CEP brasileiro em SDI nem demonstra efeito causal. Atividade física, razões de Castelli e marcadores sociais são registrados na avaliação ampliada como variáveis candidatas de pesquisa; não recebem pontos arbitrários nem um acréscimo percentual presumido.

As equações têm publicação científica, mas a implementação e sua extensão territorial não possuem validação preditiva local demonstrada. A documentação técnica registra que a conferência independente de todos os coeficientes com o suplemento original continua pendente.

## 5. Território

A base territorial ativa utiliza correspondência exata com CEPs agregados de endereços de domicílios particulares do CNEFE/IBGE 2022 de Recife. O processamento documentado contempla 9.050 CEPs e 643.590 endereços; 4.338 CEPs abrangem mais de um setor. A multiplicidade é apresentada como limitação geográfica.

As antigas médias por prefixo, faixas 85/70/55 e pontuação por infraestrutura foram retiradas do cálculo de risco nas interfaces. A falta de correspondência não significa baixa vulnerabilidade. O CEP não é tratado como medida individual de privação ou convertido automaticamente em contribuição cardiovascular.

## 6. Acompanhamento pediátrico

O fluxo independente nas interfaces web e móvel inclui:

- idade cronológica e idade corrigida para prematuros até dois anos;
- peso, comprimento/estatura, perímetro cefálico e IMC, com escores-Z e percentis conforme a faixa aplicável;
- padrões OMS 2006 de zero a cinco anos e referência OMS 2007 de cinco a 19 anos;
- conversão de 0,7 cm entre técnicas de comprimento e estatura quando aplicável e cálculo de velocidade de crescimento com medida anterior;
- marcos de desenvolvimento, sinais de alerta e lembrete de acompanhamento;
- M-CHAT-R/F, com 20 itens e registro separado do resultado inicial e do seguimento;
- registro de itens e interpretação do Denver II a partir da folha oficial, sem reproduzir seus itens proprietários;
- informações sobre saúde bucal, telas e andador, além de resumo para cópia e impressão.

Denver II requer folha, manual e capacitação correspondentes. Triagem não é diagnóstico; os achados devem ser interpretados no contexto da criança.

## 7. Avaliação Geriátrica Ampla

A AGA organiza informações de funcionalidade, cognição, humor, mobilidade e quedas, nutrição, sentidos, medicamentos, apoio social e plano de cuidado. Katz e Lawton são registros educativos adaptados, sem classificação automática de dependência. A GDS-15 apresenta pontuação descritiva; GDS e TUG não recebem cortes automáticos não confirmados. O IVCF-20 registra o total obtido no formulário oficial.

MEEM e MoCA Full registram resultados por domínio após aplicação externa dos formulários autorizados. Campos ausentes impedem total completo. No MoCA, o total bruto é separado da correção por escolaridade, condicionada à versão e à regra confirmadas. As perguntas, instruções e estímulos protegidos não foram incorporados.

O monitoramento das fontes da AGA está preparado para verificação semanal; a execução remota depende da publicação do workflow e das permissões necessárias. Alterações detectadas exigem revisão e não modificam regras clínicas automaticamente.

## 8. Saúde mental e módulo visual

O motor de saúde mental calcula AQ-10, ASRS-18 e DASS-21. O AQ-10 exige dez respostas para produzir pontuação; o ASRS separa partes A e B e avalia o corte da parte A; o DASS-21 calcula os domínios depressão, ansiedade e estresse pela soma correspondente multiplicada por dois. Respostas ausentes não são convertidas em zero. Os resultados são instrumentos de triagem, não diagnóstico isolado.

O projeto também incorporou um módulo visual de cuidado. Sua presença deve ser considerada parte da interface atual, com avaliação de acessibilidade e usabilidade antes de implantação assistencial.

## 9. Privacidade e armazenamento

O projeto informa que não solicita identificadores pessoais ou profissionais e não persiste atendimentos. O dicionário de classificação pode ser salvo em `localStorage`; dados de atendimento permanecem na sessão da página. A geração do documento é local, mas arquivos impressos, copiados ou salvos pelo usuário passam a existir fora do controle da aplicação.

As rotas de persistência de documentos, validação e auditoria permanecem desativadas no modo educativo. As regras locais do Firestore e do Realtime Database negam acesso direto. Esses controles não equivalem, por si só, a uma avaliação completa de conformidade com a LGPD ou de segurança da hospedagem.

## 10. Arquitetura e arquivos principais

| Componente | Responsabilidade |
|---|---|
| `index.html`, `app-mobile.html` | Interfaces web e móvel |
| `app.js`, `styles.css`, `styles-mobile.css` | Fluxo principal, documento e apresentação |
| `cardiovascular-core.js`, `research-risk-core.js` | PREVENT e avaliação ampliada de pesquisa |
| `data/prevent-coefficients.js` | Coeficientes e metadados do modelo |
| `data/recife-cep-sectors.js` | Associação territorial agregada por CEP |
| `pediatric-core.js`, `pediatrics.js` | Cálculos e interface pediátrica |
| `data/who-growth-data.js` | Dados de referência de crescimento |
| `aga-core.js`, `cognitive-core.js` | Cálculos geriátricos e registros cognitivos |
| `mental-health-core.js` | Pontuação das escalas de saúde mental |
| `server.js`, `functions/` | Servidor local e funções de API |
| `firebase.json` | Configuração de hospedagem e funções |
| `tests/` | Testes automatizados dos motores e interfaces |

O frontend utiliza HTML, CSS e JavaScript. O backend local usa Node.js; a configuração de funções usa Express e Firebase Cloud Functions. O manifesto web descreve a interface instalável. A exportação para PDF depende da impressão do navegador.

## 11. Execução e verificação

Para iniciar localmente, execute `node server.js` e abra `http://localhost:3000/index.html` ou `http://localhost:3000/app-mobile.html`.

Na análise de 13/11/2026, a suíte `node --test tests/*.test.js` concluiu com **54 testes aprovados e zero falhas**. Os testes cobrem, entre outros pontos, pediatria, AGA, cognição, saúde mental, PREVENT e base territorial. Testes de software não demonstram validade clínica, segurança completa ou desempenho preditivo local.

## 12. Pendências e limites

1. Revisar clinicamente cada módulo e manter suas fontes e versões rastreáveis.
2. Conferir independentemente todos os coeficientes PREVENT e realizar validação preditiva local antes de alegar desempenho na população atendida.
3. Harmonizar indicadores territoriais e geografia antes de estimar qualquer contribuição social individualizada.
4. Verificar acessibilidade, usabilidade, segurança, proteção contra abuso e operação em produção.
5. Antes de guardar atendimentos, definir modelo de dados, autenticação, autorização, auditoria, retenção e proteção de dados sensíveis.
6. Manter explícita a distinção entre triagem educativa, avaliação clínica e diagnóstico.

## 13. Documentação de referência do projeto

- `README.md`: escopo, execução, pediatria, AGA e revisão cardiovascular.
- `docs/ficha-tecnica-cuidar-plus-revisada.md`: metodologia detalhada do PREVENT, território, fontes e plano de validação.
- `docs/cognitive-assessments.md`: registros MEEM/MoCA e restrições de reprodução.
- `docs/aga-monitoring.md`: monitoramento das fontes da AGA.
