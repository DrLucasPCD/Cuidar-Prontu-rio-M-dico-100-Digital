# Monitoramento das fontes da AGA

O repositório inclui uma rotina preparada para verificar semanalmente fontes públicas oficiais do Ministério da Saúde relacionadas à avaliação multidimensional da pessoa idosa (AGA), à Caderneta Brasileira da Pessoa Idosa e ao IVCF-20. O catálogo inclui páginas de índice/landing pages para descobrir futuras edições e documentos novos, além dos PDFs atualmente publicados.

Execute localmente com Node 20:

```bash
node scripts/check-aga-sources.js
```

O resultado fica em [`data/aga-source-status.json`](../data/aga-source-status.json). Cada fonte registra URL final, data da última consulta, status HTTP, tamanho, tipo de conteúdo e hash SHA-256 da resposta. `baseline_registrada` significa que o primeiro conteúdo foi observado; `inalterado` significa que o hash coincide; `indisponivel` significa que a consulta falhou; `revisao_clinica_pendente` significa que o hash mudou e requer leitura humana.

O hash identifica mudança no arquivo ou resposta. Ele não demonstra que um critério, ponto de corte ou recomendação clínica foi atualizado. O monitor nunca edita cortes automaticamente. Uma mudança abre PR pelo workflow [`check-aga-sources.yml`](../.github/workflows/check-aga-sources.yml), para revisão clínica e documental antes de qualquer alteração no motor.

Fontes monitoradas incluem a [Caderneta Brasileira da Pessoa Idosa](https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-pessoa-idosa/view), o [anexo PDF ligado à landing do gov.br](https://www.gov.br/saude/pt-br/composicao/saps/publicacoes/cadernetas-e-cartoes/caderneta-brasileira-da-pessoa-idosa/@@download/file), o [PDF da Caderneta na BVS/MS](https://bvsms.saude.gov.br/bvs/publicacoes/caderneta_brasileira_pessoa_idosaimp.pdf), as [Ações para a pessoa idosa](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/acoes/acoes-para-a-pessoa-idosa), a [Nota Informativa nº 2/2025 sobre o IVCF-20](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/notas-tecnicas-e-informativas/nota-informativa-no-2-2025-copid-dgci-saps-ms), a [documentação e-SUS APS](https://sisaps.saude.gov.br/sistemas/esusaps/docs/versoes/versao_5_3/) e o [índice de notas técnicas da Saúde da Pessoa Idosa](https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/s/saude-da-pessoa-idosa/notas-tecnicas-e-informativas).

## Ativação e leitura do estado

O workflow precisa estar publicado na branch padrão do repositório, com Actions habilitado e permissão para criar pull requests. A entrega local prepara essa rotina; não ativa agendamento remoto nem publica o aplicativo. O horário preparado é segunda-feira às 08:23 UTC (05:23 em Recife).

A cada execução, o resultado completo é preservado como artefato do Actions antes de descartar diferenças apenas de relógio. A data exibida no aplicativo é a consulta incluída na versão publicada, podendo ser anterior à última execução do Actions. Depois de oito dias, a interface sinaliza a data como desatualizada. A aprovação do PR de status, sozinha, não altera o motor clínico.

O monitor reduz mudanças de navegação usando o conteúdo principal do HTML e remove scripts, estilos e comentários antes do hash. PDFs usam bytes e assinatura `%PDF-`. A primeira consulta registra uma baseline; ela não certifica revisão clínica. Falhas de acesso preservam revisões pendentes anteriores. Para concluir uma revisão, documente a análise no PR e ajuste `clinicalReviewPending` somente depois de conferir o documento correspondente.

Na coleta inicial desta implementação, o PDF de 2026 no gov.br respondeu; dois endereços BVS ficaram indisponíveis. Essas falhas constam no JSON e na interface, sem serem tratadas como ausência de atualização.
