# Remio — Engenharia de Prompts e Vibe Coding

> Material de apoio para a **seção 5.2** do TCC (Engenharia de Prompts e Vibe Coding).
> Registro de como as regras de negócio foram traduzidas em instruções de linguagem
> natural para a IA generativa (Claude, da Anthropic) durante o desenvolvimento do protótipo.

## Metodologia

O desenvolvimento seguiu o paradigma de **Vibe Coding**: em vez de escrever código
manualmente, o arquiteto do projeto conduziu um diálogo com um agente de IA
(Claude Code), fornecendo contexto de negócio, referências visuais e refinamentos
iterativos. A IA gerou e organizou o código, enquanto as decisões de produto
permaneceram com a equipe.

O processo ocorreu em 5 etapas, cada uma com seus prompts estratégicos:

---

## Etapa 1 — Fornecimento de contexto de negócio

**Prompt utilizado (resumo):**

> "Estou elaborando o TCC da minha pós em análise de dados e big data. O tema é criar
> uma plataforma para prestadores de serviços e clientes se conectarem, com foco em
> serviços domésticos. Ela foi baseada em um trabalho de conclusão de curso de um
> colega de equipe [plano de negócios Smart Serviços em PDF anexado], junto com o que
> já foi feito do TCC [estrutura do trabalho em PDF] e o site que pretendo usar como
> inspiração [romi-app.com]. Minha parte é a criação do site e o compartilhamento do
> código usado na sua elaboração."

**Técnica aplicada:** *grounding* — anexar os documentos do projeto (PDFs) para que a
IA extraísse as regras de negócio (comissão de 15%, perfis verificados, sistema de
avaliações, serviços domésticos mais demandados na pesquisa de mercado) em vez de
inventá-las.

---

## Etapa 2 — Definição de escopo por perguntas e respostas

A IA conduziu perguntas estruturadas e a equipe decidiu:

| Decisão | Resposta da equipe |
|---|---|
| Escopo | Protótipo navegável completo (10 telas) |
| Persistência | Dados simulados, sem banco real — documentar o que o sistema real exigiria |
| Dashboards de BI | Sim, para os três papéis: cliente, prestador e empresa parceira |

**Técnica aplicada:** *refinamento iterativo* — decisões tomadas uma a uma, em diálogo,
antes de qualquer linha de código.

---

## Etapa 3 — Direcionamento visual com referência

**Prompt utilizado (resumo):**

> "[Capturas de tela do site de referência anexadas] Pode adaptar com base no trabalho.
> Para estilo visual quero algo mais moderno, achei o fundo muito básico, e não achei
> painéis com gráficos, acho interessante para alguns indicadores."

**Refinamento posterior:**

> "Substitui o azul petróleo por um amarelo, dá mais um ar de construção, ou laranja.
> E coloca um indicador de preços, tipo tem no iFood ($, $$, $$$), para que os clientes
> tenham mais opções de escolha de filtro. E talvez o pagamento através da plataforma
> tipo Uber, que garanta algo caso o serviço não dê certo."

**Técnica aplicada:** *referência visual + crítica dirigida* — em vez de descrever o
design do zero, mostrou-se um exemplo concreto e apontou-se o que mudar (cor, fundo,
gráficos), além de citar padrões de mercado conhecidos (iFood, Uber) como atalho de
comunicação de requisitos complexos (faixa de preço e pagamento em custódia/escrow).

---

## Etapa 4 — Geração do código

Com o design aprovado e registrado em documento (DESIGN.md), a IA gerou a estrutura
completa: banco de dados simulado (`dados.js`), identidade visual (`estilo.css`),
lógica de negócio (`app.js`), dashboards (`dashboard.js`) e as 7 páginas HTML.

As regras de negócio do Capítulo 4 do TCC foram traduzidas em código, por exemplo:

- **Comissão de 15%** (modelo de monetização) → cálculo exibido no modal de
  Pagamento Protegido: `const comissao = ped.valor * 0.15`
- **Jornada do usuário** (solicitação → orçamento → pagamento → conclusão → avaliação)
  → máquina de estados dos pedidos: `aguardando → orcamento → agendado → concluido → avaliado`
- **Verificação de antecedentes** (proposta de valor) → selo "verificado" nos perfis
- **Arquitetura de BI** → dashboards com KPIs e gráficos por papel de usuário

---

## Etapa 5 — Verificação automatizada

A própria IA testou o protótipo em um navegador controlado: navegou pelas 7 páginas,
executou o fluxo completo de um pedido (criação, orçamento, pagamento protegido,
conclusão e avaliação 5 estrelas), validou os três dashboards e confirmou a ausência
de erros no console do navegador — só então o código foi considerado entregue.

---

## Stack de IA utilizado (material para a seção 5.1)

| Ferramenta | Papel no projeto |
|---|---|
| **Claude (Anthropic) / Claude Code** | Agente de IA generativa que conduziu o levantamento de requisitos, gerou e testou todo o código |
| **Chart.js** | Biblioteca de gráficos dos dashboards de BI (escolhida pela IA por ser gratuita e não exigir instalação) |
| **Lucide Icons** | Biblioteca de ícones vetoriais |
| **Google Fonts (Plus Jakarta Sans)** | Tipografia da identidade visual |

**Justificativa da escolha:** o Claude Code permite o fluxo completo de vibe coding em
um único ambiente — leitura dos documentos do projeto (PDFs), diálogo de requisitos,
geração de arquivos diretamente no computador e teste do resultado em navegador,
documentando cada etapa.
