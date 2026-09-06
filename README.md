# Cuidar+ Guia Educativo de Prevenção

## Execução local

1. Inicie o servidor:
```bash
node server.js
```

2. Abra no navegador:
- Web: [http://localhost:3000/index.html](http://localhost:3000/index.html)
- App web: [http://localhost:3000/app-mobile.html](http://localhost:3000/app-mobile.html)

## Escopo da ferramenta

- A aplicação funciona como guia educativo de prevenção em saúde.
- Não solicita dados identificáveis de pessoas ou profissionais.
- Campos de identificação pessoal/profissional foram removidos.
- Não há salvamento de rascunho de atendimento.
- Não há persistência de dados de atendimento em banco.
- Geração de documento é local (visualização/cópia/impressão/PDF).
- A vulnerabilidade territorial cobre Pernambuco em dois níveis de precisão:
  - Recife: dados por CEP ou prefixo, derivados das faces de quadra da Prefeitura;
  - demais localidades: indicador municipal derivado do Censo 2022/IBGE.

## Acompanhamento pediátrico

O seletor **Tipo de acompanhamento** abre um fluxo independente de puericultura nas versões web e móvel. Esse fluxo inclui:

- idade cronológica e idade corrigida para prematuros até 2 anos;
- peso, comprimento/estatura, perímetro cefálico e IMC;
- escores-Z e percentis para P/I, E/I, P/E, IMC/I e PC/I, conforme a faixa aplicável;
- padrões OMS 2006 de 0 a 5 anos e referência OMS 2007 de 5 a 19 anos, calculados localmente;
- conversão de 0,7 cm quando a técnica de comprimento/estatura não corresponde à faixa etária;
- velocidade de crescimento quando há uma medida anterior com data;
- marcos do desenvolvimento de RN a 18 meses nos domínios social, comunicação, cognição e motricidade;
- sinais de alerta, fatores para consultas mais frequentes e lembrete do próximo acompanhamento;
- M-CHAT-R/F com 20 itens, algoritmo de risco e registro da Entrevista de Seguimento;
- desenvolvimento dentário, higiene bucal, exposição a telas e uso de andador;
- resumo pediátrico local para cópia, impressão ou PDF.

Os arquivos `data/who-growth-data.js`, `pediatric-core.js` e `pediatrics.js` concentram, respectivamente, as tabelas oficiais, os cálculos puros e a interface. O módulo é educativo: triagem não é diagnóstico e os resultados devem ser integrados à história, ao exame e à trajetória da criança.

Para executar os testes do motor pediátrico:

```bash
node --test tests/pediatric-core.test.js
```

## Base territorial de Pernambuco

O arquivo `data/pe-municipal-territory-db.js` é gerado com dados oficiais das tabelas 6803, 6805 e 6892 do SIDRA/IBGE. O índice municipal é a média aritmética de:

- domicílios ligados à rede geral de água e que a usam como fonte principal;
- domicílios com rede geral, rede pluvial ou fossa ligada à rede;
- domicílios com lixo coletado.

Para reconstruir a base usando o período mais recente publicado nessas tabelas:

```bash
node scripts/update-territorial-data.js
```

O workflow `.github/workflows/update-territorial-data.yml` executa essa verificação mensalmente e registra uma nova versão somente quando o IBGE publicar mudanças. Isso é atualização automática da fonte, não medição territorial em tempo real.

Para CEPs fora da base detalhada do Recife, a API consulta o ViaCEP apenas para obter UF, município e código IBGE. O CEP não é salvo em banco nem registrado em prontuário persistente. Se a consulta falhar, nenhum ponto territorial é acrescentado.

## Privacidade e LGPD

- O documento final reforça que o uso é educativo e sem coleta de identificadores.
- O único armazenamento persistente no navegador é o dicionário de classificação CID/APS (`classificationCatalogV1`), sem vínculo com indivíduos. A consulta de CEP usa apenas memória temporária no servidor.
- A rota de validação ([http://localhost:3000/verify.html](http://localhost:3000/verify.html)) permanece apenas informativa no modo sem persistência.

---

## Firebase (produção)

### 1) Preparar projeto

1. Crie o projeto no Firebase Console.
2. Troque o project id em `.firebaserc`.
3. Instale dependências das functions:
```bash
cd functions
npm install
cd ..
```

### 2) Login e deploy

```bash
firebase login
firebase deploy
```

No modo educativo, os endpoints de documentos/validação/auditoria retornam indisponível para evitar persistência.

### Sem Firebase Hosting (ex.: Netlify)

Pode usar normalmente. Nesse caso:

1. Publique **apenas functions** (se quiser manter respostas de API indisponível):
```bash
firebase deploy --only functions
```

2. O frontend usa a API externa configurada em `/config.js`:
```js
window.CUIDAR_API_BASE = "https://southamerica-east1-cuidarmais-7d01d.cloudfunctions.net/api";
```

3. Publique os arquivos estáticos normalmente no Netlify.

## Avaliação Geriátrica Ampla (AGA)

A opção **AGA** no seletor de acompanhamento abre o novo fluxo nas versões web e móvel. Inclui registros de funcionalidade básica e instrumental, cognição, humor, mobilidade/quedas, nutrição, sentidos, medicamentos, suporte social e plano de cuidado. O resumo completo pode ser copiado, impresso ou salvo como PDF pelo navegador; o preenchimento permanece apenas em memória.

- Katz e Lawton: registros educativos adaptados, com contagem/escore descritivo, sem faixas automáticas de dependência. Não substituem aplicação padronizada.
- GDS-15: pontuação descritiva. GDS e TUG não recebem classificação automática com cortes didáticos ainda não confirmados em fonte MS.
- IVCF-20: registro do **total já obtido no formulário oficial**, com faixas e reavaliação da Caderneta MS 2026, p. 71. A interface não aplica os 20 itens.
- Campos incompletos permanecem como não avaliados; resultados parciais não geram escore total. Achados já informados continuam visíveis.

O plano e a divisão entre Sol, Terra e Luna estão em `docs/aga-plan.md`. `docs/aga-monitoring.md` descreve a checagem semanal preparada para as fontes do Ministério da Saúde. **A rotina remota só passa a executar depois que o workflow estiver publicado na branch padrão e o GitHub Actions tiver as permissões necessárias.** Alterações detectadas abrem revisão; não mudam regras clínicas automaticamente.

```bash
node --test tests/*.test.js
node scripts/check-aga-sources.js
```

### MEEM e MoCA na AGA

As seções cognitivas registram escores por domínio após aplicação externa do formulário autorizado: 11 categorias do MEEM e 7 domínios do MoCA Full, cada instrumento com máximo de 30 pontos. Valores ausentes impedem o total; zero é uma resposta válida. Os resultados entram no resumo local e na cópia/impressão.

No MoCA Full, escore bruto e escore corrigido por escolaridade permanecem separados. A correção exige confirmação da versão e da regra aplicável. MoCA Basic, Blind e outras versões não são calculadas com os domínios do Full.

**As perguntas completas, instruções e estímulos não foram incorporados.** As condições dos titulares exigem autorização para reprodução digital. A interface oferece acesso às fontes oficiais e registro de resultados, sem apresentar esse registro como aplicação do teste. Consulte `docs/cognitive-assessments.md` para referências e limitações.
