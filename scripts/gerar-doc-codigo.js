/* Gera o DOCX de documentação do repositório de código da plataforma Remio. */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, Header, Footer,
  ExternalHyperlink, VerticalAlign, TabStopType, TabStopPosition, LeaderType
} = require('docx');

const LARANJA = 'EA580C';
const GRAFITE = '1F2937';
const CINZA_BORDA = 'CCCCCC';
const CINZA_CLARO = 'F3F4F6';
const LARANJA_CLARO = 'FFEDD5';

// ABNT (NBR 14724): A4, margens 3/3/2/2 cm. Largura útil = 11906 - 1701 - 1134.
const CONTENT_W = 9071;
const RECUO = 709;     // recuo de primeira linha 1,25 cm
const FONTE = 'Arial'; // fonte recomendada pela ABNT
const semPonto = t => t.replace(/^(\d+(?:\.\d+)*)\.\s+/, '$1 '); // número de seção sem ponto final

/* ---------- helpers ---------- */
const b = { style: BorderStyle.SINGLE, size: 1, color: CINZA_BORDA };
const cellBorders = { top: b, bottom: b, left: b, right: b };

function txt(text, opts = {}) { return new TextRun({ text, ...opts }); }

function p(text, opts = {}) {
  const centrado = opts.align === AlignmentType.CENTER;
  return new Paragraph({
    children: Array.isArray(text) ? text : [txt(text, opts.run || {})],
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 360 },
    alignment: opts.align ?? AlignmentType.JUSTIFIED,
    indent: (centrado || opts.semRecuo) ? undefined : { firstLine: RECUO },
    ...opts.paragraph
  });
}

function h1(text) {
  // Seção primária ABNT: começa em nova página.
  return new Paragraph({ heading: HeadingLevel.HEADING_1, children: [txt(semPonto(text).toUpperCase())],
    pageBreakBefore: true, spacing: { before: 0, after: 200, line: 360 } });
}
function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, children: [txt(semPonto(text))],
    spacing: { before: 240, after: 120, line: 360 } });
}

function bullet(text) {
  return new Paragraph({ numbering: { reference: 'bullets', level: 0 },
    children: Array.isArray(text) ? text : [txt(text)], spacing: { after: 80, line: 360 } });
}

function code(lines) {
  // bloco de código monoespaçado com fundo cinza
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [ new TableRow({ children: [ new TableCell({
      borders: cellBorders,
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: '1E1E2E', type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      children: lines.map(l => new Paragraph({
        children: [new TextRun({ text: l || ' ', font: 'Consolas', size: 18, color: 'E8E8E8' })],
        spacing: { after: 0, line: 252 }
      }))
    }) ] }) ]
  });
}

function headerCell(text, w) {
  return new TableCell({
    borders: cellBorders, width: { size: w, type: WidthType.DXA },
    shading: { fill: GRAFITE, type: ShadingType.CLEAR },
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [txt(text, { bold: true, color: 'FFFFFF', size: 20 })] })]
  });
}

function bodyCell(children, w, fill) {
  const kids = Array.isArray(children) ? children : [new Paragraph({ children: [txt(String(children), { size: 20 })] })];
  return new TableCell({
    borders: cellBorders, width: { size: w, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
    verticalAlign: VerticalAlign.CENTER,
    children: kids
  });
}

function table(headers, rows, widths) {
  const soma = widths.reduce((a, x) => a + x, 0);
  const w = widths.map(x => Math.round(x * CONTENT_W / soma)); // normaliza p/ largura útil ABNT
  const headerRow = new TableRow({ tableHeader: true,
    children: headers.map((hd, i) => headerCell(hd, w[i])) });
  const bodyRows = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => {
      const fill = ri % 2 === 1 ? CINZA_CLARO : undefined;
      if (Array.isArray(c)) return bodyCell(c, w[i], fill); // já são parágrafos
      return bodyCell([new Paragraph({ children: [txt(String(c), { size: 20 })] })], w[i], fill);
    })
  }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: w, rows: [headerRow, ...bodyRows] });
}

function legenda(text) {
  return new Paragraph({
    children: [txt(text, { italics: true, size: 18, color: '6B7280' })],
    spacing: { before: 60, after: 200 }, alignment: AlignmentType.CENTER
  });
}

/* ---------- capa ---------- */
function capa() {
  return [
    new Paragraph({ spacing: { before: 1800, after: 0 } }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [txt('REMIO', { bold: true, size: 72, color: LARANJA })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [txt('Plataforma de Serviços Domésticos', { size: 28, color: GRAFITE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
      children: [txt('DOCUMENTAÇÃO DO REPOSITÓRIO DE CÓDIGO', { bold: true, size: 36, color: GRAFITE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 },
      children: [txt('Protótipo do site — desenvolvimento e estrutura técnica', { size: 24, color: '6B7280' })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [txt('Trabalho de Conclusão de Curso', { size: 24, color: GRAFITE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
      children: [txt('MBA em Gestão Analítica com BI e Big Data', { size: 24, color: GRAFITE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
      children: [txt('Universidade de Fortaleza — UNIFOR', { size: 24, color: GRAFITE })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [txt('Repositório: ', { size: 22, color: '6B7280' }),
        new ExternalHyperlink({ link: 'https://github.com/LuizOtavioEF/remio',
          children: [txt('github.com/LuizOtavioEF/remio', { style: 'Hyperlink', size: 22 })] })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
      children: [txt('Site no ar: ', { size: 22, color: '6B7280' }),
        new ExternalHyperlink({ link: 'https://luizotavioef.github.io/remio/',
          children: [txt('luizotavioef.github.io/remio', { style: 'Hyperlink', size: 22 })] })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 },
      children: [txt('Fortaleza — CE, 2026', { size: 22, color: '6B7280' })] }),
    new Paragraph({ children: [new PageBreak()] })
  ];
}

/* ---------- corpo ---------- */
const corpo = [];

corpo.push(new Paragraph({ children: [txt('SUMÁRIO', { bold: true, size: 24, color: GRAFITE })],
  alignment: AlignmentType.CENTER, spacing: { after: 360 } }));

function tocItem(titulo, pagina) {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_W, leader: LeaderType.DOT }],
    spacing: { after: 120, line: 360 },
    children: [ txt(titulo.replace(/^(\s*\d+(?:\.\d+)*)\./, '$1'), { size: 24, color: GRAFITE }), txt('\t' + pagina, { size: 24, color: GRAFITE }) ]
  });
}

[
  ['1. Visão Geral do Repositório', '3'],
  ['2. Tecnologias Utilizadas', '4'],
  ['3. Estrutura de Arquivos', '5'],
  ['4. Descrição dos Arquivos', '6'],
  ['5. Arquitetura e Funcionamento', '8'],
  ['6. Funcionalidades-Chave e Localização no Código', '9'],
  ['7. Modelo de Dados Simulado', '10'],
  ['8. Painéis de Business Intelligence (BI)', '11'],
  ['9. Como Executar o Projeto', '12'],
  ['10. Versionamento e Publicação', '13'],
  ['11. Limitações e Evolução para um Sistema Real', '14']
].forEach(([t, pg]) => corpo.push(tocItem(t, pg)));
// (a quebra para a 1ª seção vem do pageBreakBefore do h1)

// 1. Visão geral
corpo.push(h1('1. Visão Geral do Repositório'));
corpo.push(p('Este documento descreve a estrutura técnica do repositório de código da plataforma Remio, um protótipo de marketplace que conecta clientes a prestadores de serviços domésticos. O projeto foi desenvolvido como parte do Trabalho de Conclusão de Curso do MBA em Gestão Analítica com BI e Big Data, tendo como base o plano de negócios da empresa Smart Serviços e inspiração visual na plataforma Romi.'));
corpo.push(p('O repositório reúne sete páginas navegáveis, três painéis de Business Intelligence (BI) e uma base de dados simulada, totalizando aproximadamente 2.700 linhas de código distribuídas em arquivos HTML, CSS e JavaScript. Todo o protótipo funciona no navegador, sem necessidade de servidor ou instalação, o que facilita a demonstração e a avaliação acadêmica.'));
corpo.push(p([
  txt('O código-fonte está publicado em repositório público no GitHub e o site encontra-se hospedado gratuitamente via GitHub Pages, acessível por qualquer dispositivo com acesso à internet.', {})
]));

// 2. Tecnologias
corpo.push(h1('2. Tecnologias Utilizadas'));
corpo.push(p('A escolha das tecnologias priorizou a simplicidade, a legibilidade do código para fins de documentação acadêmica e a ausência de dependências complexas. A tabela a seguir resume a pilha tecnológica adotada.'));
corpo.push(table(
  ['Tecnologia', 'Função no projeto'],
  [
    ['HTML5', 'Estruturação das sete páginas da plataforma.'],
    ['CSS3', 'Identidade visual completa: cores, tipografia, componentes, animações e layout responsivo (arquivo único estilo.css).'],
    ['JavaScript (puro / Vanilla)', 'Toda a lógica da aplicação: navegação, papéis de usuário, filtros de busca, fluxo de orçamento, pedidos e pagamento protegido.'],
    ['Chart.js (via CDN)', 'Biblioteca gratuita de gráficos utilizada nos painéis de BI (linhas, barras e rosca).'],
    ['Lucide Icons (via CDN)', 'Biblioteca de ícones vetoriais usada em toda a interface.'],
    ['Google Fonts — Plus Jakarta Sans', 'Tipografia moderna da identidade visual.'],
    ['localStorage (navegador)', 'Persistência local da sessão do usuário e dos pedidos, simulando o papel de um banco de dados.'],
    ['Git e GitHub', 'Versionamento do código e hospedagem do repositório e do site (GitHub Pages).']
  ],
  [3000, 6360]
));
corpo.push(p('Optou-se por JavaScript puro, sem frameworks como React ou Vue, de modo que o código possa ser lido e citado diretamente no corpo do TCC, sem etapas de compilação ou ferramentas adicionais.', { after: 160 }));

// 3. Estrutura de arquivos
corpo.push(h1('3. Estrutura de Arquivos'));
corpo.push(p('O repositório está organizado de forma plana e intuitiva, separando páginas (raiz), estilos (css/), lógica e dados (js/), documentação (docs/) e capturas de tela (prints/).'));
corpo.push(code([
  'remio/',
  '├── index.html          Home: busca, categorias, destaques, como funciona',
  '├── busca.html          Busca de profissionais com filtros',
  '├── perfil.html         Perfil do profissional + solicitação de orçamento',
  '├── pedidos.html        Meus pedidos + Pagamento Protegido + avaliação',
  '├── parceiros.html      Empresas parceiras (lojas e fornecedores)',
  '├── dashboard.html      Painel de BI (adapta-se ao papel logado)',
  '├── login.html          Entrada simulada com seleção de papel',
  '│',
  '├── css/',
  '│   └── estilo.css      Identidade visual completa (631 linhas)',
  '│',
  '├── js/',
  '│   ├── dados.js        Banco de dados simulado (338 linhas)',
  '│   ├── app.js          Lógica da aplicação (682 linhas)',
  '│   └── dashboard.js    Dashboards de BI com Chart.js (307 linhas)',
  '│',
  '├── docs/               Documentação do TCC (DESIGN, PROMPTS, README)',
  '└── prints/             Capturas de tela das páginas'
]));

// 4. Descrição dos arquivos
corpo.push(h1('4. Descrição dos Arquivos'));
corpo.push(h2('4.1. Páginas HTML'));
corpo.push(p('Cada página HTML é enxuta e delega toda a lógica e a montagem de conteúdo dinâmico aos arquivos JavaScript. Um mesmo cabeçalho e rodapé são injetados por código em todas as páginas, garantindo consistência.'));
corpo.push(table(
  ['Arquivo', 'Linhas', 'Descrição'],
  [
    ['index.html', '120', 'Página inicial: busca principal, categorias de serviços, profissionais em destaque e seção "como funciona".'],
    ['busca.html', '63', 'Listagem de profissionais com filtros por categoria, cidade, nota e faixa de preço.'],
    ['perfil.html', '85', 'Perfil detalhado do profissional e modal de solicitação de orçamento em quatro etapas.'],
    ['pedidos.html', '93', 'Acompanhamento de pedidos, modal de Pagamento Protegido e modal de avaliação.'],
    ['parceiros.html', '44', 'Catálogo de empresas parceiras com busca e filtro por segmento.'],
    ['dashboard.html', '25', 'Contêiner do painel de BI, preenchido conforme o papel do usuário.'],
    ['login.html', '60', 'Tela de entrada com seleção de papel (cliente, prestador ou empresa parceira).']
  ],
  [2200, 900, 6260]
));

corpo.push(h2('4.2. Folha de Estilo (css/estilo.css)'));
corpo.push(p('Concentra toda a identidade visual em um único arquivo, organizado por seções comentadas. Define as variáveis de cor da marca (laranja como cor primária, grafite para textos e âmbar nos destaques), os componentes reutilizáveis (cabeçalho, cartões, botões, modais, painéis de BI) e as regras de responsividade para telas menores.'));

corpo.push(h2('4.3. Lógica e Dados (js/)'));
corpo.push(table(
  ['Arquivo', 'Responsabilidade'],
  [
    [[new Paragraph({ children: [txt('dados.js', { bold: true, font: 'Consolas', size: 19 })] })],
     'Base de dados simulada do protótipo. Contém as categorias de serviço, os profissionais cadastrados (com nota, faixa de preço, galeria e avaliações), as empresas parceiras, os pedidos iniciais e os indicadores de BI. Em um sistema real, estes dados viriam de um banco de dados via API.'],
    [[new Paragraph({ children: [txt('app.js', { bold: true, font: 'Consolas', size: 19 })] })],
     'Núcleo da aplicação. Monta o cabeçalho e o rodapé, gerencia o papel do usuário (via localStorage), executa a busca e os filtros, controla o fluxo de orçamento em etapas, o ciclo de vida dos pedidos e o Pagamento Protegido.'],
    [[new Paragraph({ children: [txt('dashboard.js', { bold: true, font: 'Consolas', size: 19 })] })],
     'Monta os três painéis de BI conforme o papel logado, renderizando indicadores (KPIs) e gráficos com a biblioteca Chart.js, além do mapa de calor de horários de pico do prestador.']
  ],
  [2400, 6960]
));

// 5. Arquitetura e funcionamento
corpo.push(h1('5. Arquitetura e Funcionamento'));
corpo.push(p('A aplicação segue um padrão simples e coeso: as páginas HTML declaram a estrutura e marcam-se com um atributo data-pagina; ao carregar, o arquivo app.js identifica a página atual e executa a função de inicialização correspondente, que busca os dados em dados.js e injeta o conteúdo dinâmico na tela.'));
corpo.push(p([txt('Identificação da página e inicialização (trecho de app.js):', { bold: true })], { after: 80 }));
corpo.push(code([
  "const pagina = document.body.dataset.pagina;",
  "if (pagina === 'home')      initHome();",
  "if (pagina === 'busca')     initBusca();",
  "if (pagina === 'perfil')    initPerfil();",
  "if (pagina === 'pedidos')   initPedidos();",
  "if (pagina === 'parceiros') initParceiros();",
  "if (pagina === 'login')     initLogin();"
]));
corpo.push(p('Os papéis de usuário (cliente, prestador e empresa parceira) são guardados no localStorage do navegador. Isso permite que o mesmo conjunto de páginas se comporte de maneira diferente conforme quem está logado — em especial o painel de BI, que exibe indicadores distintos para cada perfil.', { before: 120 }));

// 6. Funcionalidades-chave
corpo.push(h1('6. Funcionalidades-Chave e Localização no Código'));
corpo.push(p('A tabela a seguir relaciona cada funcionalidade central do protótipo ao ponto do código onde está implementada, facilitando a consulta e a citação no TCC.'));
corpo.push(table(
  ['Funcionalidade', 'Onde está implementada'],
  [
    ['Faixa de preço ($, $$, $$$) — estilo iFood', 'Campo faixaPreco em dados.js; função precoHTML() e filtro em initBusca(), em app.js.'],
    ['Pagamento Protegido (custódia / escrow) — estilo Uber', 'Função initPedidos() em app.js: o valor fica retido e só é liberado na avaliação; a comissão de 15% é calculada no modal de pagamento.'],
    ['Ciclo de vida do pedido', 'Máquina de estados em app.js: aguardando → orçamento → agendado → concluído → avaliado.'],
    ['Papéis de usuário', 'localStorage gerenciado em app.js; o painel adapta-se em dashboard.js.'],
    ['Indicadores de BI', 'dashboard.js: KPIs animados, gráficos de linha, barra e rosca, e mapa de calor.'],
    ['Sistema de avaliações', 'Estrelas clicáveis em pedidos.html; avaliações exibidas em perfil.html.'],
    ['Solicitação de orçamento em etapas', 'Função initPerfil() em app.js: formulário de quatro etapas com resumo final.']
  ],
  [3400, 5960]
));

// 7. Modelo de dados
corpo.push(h1('7. Modelo de Dados Simulado'));
corpo.push(p('O arquivo dados.js cumpre o papel que, em produção, caberia a um banco de dados. Os dados estão organizados em coleções, descritas a seguir.'));
corpo.push(bullet([txt('CATEGORIAS', { bold: true, font: 'Consolas', size: 19 }), txt(' — os oito tipos de serviço doméstico (faxina, elétrica, hidráulica, pintura, pedreiro, jardinagem, ar-condicionado e montagem de móveis).')]));
corpo.push(bullet([txt('PROFISSIONAIS', { bold: true, font: 'Consolas', size: 19 }), txt(' — doze prestadores com nome, foto, categorias, cidade, nota, número de avaliações, anos de experiência, faixa de preço, preço médio, selo de verificado, biografia, qualificações, galeria de trabalhos e avaliações recebidas.')]));
corpo.push(bullet([txt('PARCEIROS', { bold: true, font: 'Consolas', size: 19 }), txt(' — seis lojas e fornecedores com segmentos, cidade, nota e selo de verificado.')]));
corpo.push(bullet([txt('PEDIDOS_INICIAIS', { bold: true, font: 'Consolas', size: 19 }), txt(' — pedidos de exemplo já em diferentes status, para demonstrar o ciclo completo.')]));
corpo.push(bullet([txt('BI', { bold: true, font: 'Consolas', size: 19 }), txt(' — os indicadores que alimentam os três painéis (cliente, prestador e empresa parceira).')]));
corpo.push(p([txt('Exemplo da estrutura de um profissional (trecho de dados.js):', { bold: true })], { before: 120, after: 80 }));
corpo.push(code([
  '{',
  "  id: 1, nome: 'Maria das Graças Silva',",
  "  categorias: ['faxina'], cidade: 'Fortaleza, CE',",
  '  nota: 4.9, numAvaliacoes: 132, anosExp: 8,',
  '  faixaPreco: 1, precoMedio: 140,',
  '  verificado: true, pro: true,',
  "  bio: 'Especialista em limpeza residencial...',",
  '  qualificacoes: [ ... ], galeria: [ ... ],',
  '  avaliacoes: [ ... ]',
  '}'
]));

// 8. Dashboards de BI
corpo.push(h1('8. Painéis de Business Intelligence (BI)'));
corpo.push(p('Os painéis de BI constituem o diferencial do protótipo em relação ao tema do MBA. Cada papel de usuário acessa um conjunto próprio de indicadores, construídos sobre os dados simulados.'));
corpo.push(table(
  ['Painel', 'Indicadores apresentados'],
  [
    ['Cliente', 'Total investido em serviços, número de contratações, nota média atribuída, economia estimada, gastos por mês e contratações por categoria.'],
    ['Prestador', 'Faturamento mensal, serviços concluídos, nota média, taxa de conversão de orçamentos, demanda por tipo de serviço, comparativo de preço com a média da categoria e mapa de calor de horários de pico.'],
    ['Empresa Parceira', 'Indicações recebidas, contatos gerados, taxa de conversão, avaliação da loja, contatos por mês, interesse por segmento e funil de indicação até venda.']
  ],
  [2400, 6960]
));
corpo.push(p('No protótipo, esses números são estáticos. Em um sistema real, seriam calculados por um pipeline de Big Data, que captura eventos da plataforma, os consolida em um data warehouse e os disponibiliza a uma camada de BI em tempo real.', { before: 120 }));

// 9. Como executar
corpo.push(h1('9. Como Executar o Projeto'));
corpo.push(p('O protótipo não exige instalação. Há duas formas de acesso:'));
corpo.push(bullet([txt('Acesso on-line: ', { bold: true }), new ExternalHyperlink({ link: 'https://luizotavioef.github.io/remio/', children: [txt('luizotavioef.github.io/remio', { style: 'Hyperlink' })] }), txt(' — basta abrir o endereço no navegador.')]));
corpo.push(bullet([txt('Acesso local: ', { bold: true }), txt('baixar o repositório e abrir o arquivo index.html com um duplo clique. É necessária conexão com a internet apenas para carregar as fontes, os ícones e a biblioteca de gráficos.')]));
corpo.push(p([txt('Atalhos para demonstração: ', { bold: true }), txt('é possível entrar diretamente em um painel adicionando o papel à URL, por exemplo dashboard.html?papel=prestador, sem passar pela tela de login.')], { before: 120 }));

// 10. Versionamento
corpo.push(h1('10. Versionamento e Publicação'));
corpo.push(p('O código é versionado com Git e hospedado no GitHub. A publicação do site é feita automaticamente pelo GitHub Pages a partir da branch principal do repositório. Qualquer alteração enviada ao repositório (commit e push) é refletida no site no ar.'));
corpo.push(table(
  ['Recurso', 'Endereço'],
  [
    [[new Paragraph({ children: [txt('Repositório de código', { size: 20 })] })],
     [new Paragraph({ children: [new ExternalHyperlink({ link: 'https://github.com/LuizOtavioEF/remio', children: [txt('github.com/LuizOtavioEF/remio', { style: 'Hyperlink', size: 20 })] })] })]],
    [[new Paragraph({ children: [txt('Site publicado', { size: 20 })] })],
     [new Paragraph({ children: [new ExternalHyperlink({ link: 'https://luizotavioef.github.io/remio/', children: [txt('luizotavioef.github.io/remio', { style: 'Hyperlink', size: 20 })] })] })]]
  ],
  [3000, 6360]
));

// 11. Limitações
corpo.push(h1('11. Limitações e Evolução para um Sistema Real'));
corpo.push(p('Por se tratar de um protótipo acadêmico de front-end, o projeto possui limitações conhecidas. A relação a seguir indica o que seria necessário para transformá-lo em um produto de produção — material que também subsidia as seções de arquitetura e de limitações do TCC.'));
corpo.push(bullet('Banco de dados real (por exemplo, PostgreSQL ou Firebase) substituindo o arquivo dados.js.'));
corpo.push(bullet('Back-end e API para processar as regras de negócio de forma segura no servidor.'));
corpo.push(bullet('Autenticação real, com verificação de identidade e de antecedentes dos profissionais.'));
corpo.push(bullet('Gateway de pagamento (por exemplo, Mercado Pago ou Stripe) para operar a custódia de valores de fato.'));
corpo.push(bullet('Conformidade com a Lei Geral de Proteção de Dados (LGPD) no tratamento de dados pessoais.'));
corpo.push(bullet('Pipeline de Big Data (eventos → data warehouse → camada de BI) alimentando os painéis em tempo real.'));

/* ---------- documento ---------- */
const doc = new Document({
  creator: 'Equipe Remio — TCC UNIFOR',
  title: 'Documentação do Repositório de Código — Remio',
  styles: {
    default: { document: { run: { font: FONTE, size: 24, color: GRAFITE } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 28, bold: true, font: FONTE, color: LARANJA },
        paragraph: { spacing: { before: 320, after: 200, line: 360 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 24, bold: true, font: FONTE, color: LARANJA },
        paragraph: { spacing: { before: 240, after: 120, line: 360 }, outlineLevel: 1 } }
    ]
  },
  numbering: { config: [
    { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
      alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] }
  ] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 },
      margin: { top: 1701, right: 1134, bottom: 1134, left: 1701 } } },
    headers: { default: new Header({ children: [ new Paragraph({
      alignment: AlignmentType.RIGHT,
      children: [ new TextRun({ children: [PageNumber.CURRENT], size: 20, color: GRAFITE }) ] }) ] }) },
    children: [...capa(), ...corpo]
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, '..', 'docs', 'Remio - Documentacao do Repositorio de Codigo.docx');
  fs.writeFileSync(out, buf);
  console.log('OK:', out);
});
