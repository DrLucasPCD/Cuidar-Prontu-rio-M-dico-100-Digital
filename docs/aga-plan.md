# Plano de execução da AGA

## Objetivo

Acrescentar Avaliação Geriátrica Ampla ao seletor de acompanhamento das versões web e móvel, usando os dois PDFs fornecidos como referência educacional e fontes do Ministério da Saúde para conferir critérios. Preservar o processamento local e a ausência de persistência de atendimentos.

## Divisão de trabalho

1. **GPT 5.6 Sol:** leitura dos PDFs, conferência dos critérios oficiais, motor de avaliação e testes de cálculos, limites e respostas incompletas.
2. **GPT 5.6 Terra:** interface da AGA, navegação entre acompanhamentos, campos por domínio e resumo para copiar/imprimir.
3. **GPT 5.6 Luna:** catálogo de fontes oficiais, checagem de alterações e workflow periódico, com documentação operacional.
4. **Coordenação:** revisão da integração, verificação web/móvel, regressão pediátrica e documentação de entrega.

## Regras de implementação

- Campos não respondidos continuam como não avaliados; não equivalem a ausência de risco.
- Resultados de instrumentos são rastreios e registros de avaliação, com identificação da referência utilizada.
- Não adotar automaticamente pontos de corte conflitantes ou não confirmados.
- Monitorar tanto documentos quanto páginas oficiais que possam anunciar novas edições.
- Registrar data da consulta, falhas e alterações detectadas. Uma alteração de conteúdo exige revisão; não comprova mudança clínica.
- A rotina de monitoramento não altera automaticamente pontuações ou condutas.

## Verificação da entrega

- Testes do motor AGA e do monitor, além da regressão do motor pediátrico.
- Navegação adulto → AGA → pediatria → adulto em ambas as páginas.
- Avaliação vazia, preenchimento parcial, resultados e geração do resumo.
- Exibição das fontes e do estado real da última checagem, inclusive falhas.
- Layout móvel sem transbordamento e ausência de erros de JavaScript.

## Ativação operacional

A inclusão do workflow no código prepara as verificações recorrentes. A execução remota depende de publicar o código na branch padrão do repositório e habilitar as permissões necessárias no GitHub Actions. A entrega local não equivale a deploy nem à ativação dessa rotina no GitHub.


## Resultado da execução

A implementação inicial foi delegada aos três modelos solicitados. A coordenação concluiu a revisão após os limites de uso interromperem agentes. Foram aprovados 26 testes automatizados e verificações no navegador das duas versões: navegação entre os três fluxos, campos incompletos, cópia, impressão, bloqueio de valores inválidos, limpeza e largura móvel.

O IVCF-20 recebe o total de uma aplicação externa do formulário oficial, com interpretação MS 2026; não simula a aplicação dos vinte itens. Katz/Lawton são registros adaptados descritivos. GDS/TUG não usam cortes automáticos ainda não confirmados pelo MS. O monitor inicial consultou seis fontes com sucesso e registrou falha em dois endereços BVS.

## Ampliação cognitiva — MEEM e MoCA

Solicitação: incluir os formulários completos, com execução por GPT 5.6 Sol, Terra e Luna.

- Sol: motor de registro de resultados por domínios, completude e pontuação.
- Terra: seções de avaliação na AGA, resumo, exportação e limpeza.
- Luna: revisão de fontes, condições de reprodução e testes de integração.
- Coordenação: integração final e testes web/móvel.

A reprodução integral de perguntas/estímulos depende da versão autorizada para incorporação digital. Enquanto essa versão não é fornecida, a implementação registra resultados de aplicação externa, com referências aos instrumentos oficiais. A presença de um PDF em site público não equivale a autorização de reprodução do instrumento.
