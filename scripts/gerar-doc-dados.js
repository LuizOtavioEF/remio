/* Gera o DOCX de Engenharia de Dados da plataforma Remio
   (OLTP PostgreSQL + Data Warehouse + ETL Pentaho). */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, Footer, ExternalHyperlink, VerticalAlign,
  TabStopType, LeaderType, PageOrientation
} = require('docx');

const LARANJA = 'EA580C';
const GRAFITE = '1F2937';
const CINZA_BORDA = 'CCCCCC';
const CINZA_CLARO = 'F3F4F6';
const CONTENT_W = 9360;
const DIAG = path.join(__dirname, '..', 'diagramas');

const b = { style: BorderStyle.SINGLE, size: 1, color: CINZA_BORDA };
const cellBorders = { top: b, bottom: b, left: b, right: b };
const txt = (t, o = {}) => new TextRun({ text: t, ...o });

function p(children, opts = {}) {
  return new Paragraph({
    children: Array.isArray(children) ? children : [txt(children, opts.run || {})],
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 276 },
    alignment: opts.align
  });
}
const h1 = t => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [txt(t)], spacing: { before: 320, after: 160 } });
const h2 = t => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [txt(t)], spacing: { before: 240, after: 120 } });
const bullet = c => new Paragraph({ numbering: { reference: 'bullets', level: 0 },
  children: Array.isArray(c) ? c : [txt(c)], spacing: { after: 80, line: 276 } });

function code(lines) {
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: [CONTENT_W],
    rows: [ new TableRow({ children: [ new TableCell({
      borders: cellBorders, width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: '1E1E2E', type: ShadingType.CLEAR },
      margins: { top: 120, bottom: 120, left: 160, right: 160 },
      children: lines.map(l => new Paragraph({
        children: [new TextRun({ text: l || ' ', font: 'Consolas', size: 17, color: 'E8E8E8' })],
        spacing: { after: 0, line: 246 } }))
    }) ] }) ] });
}

function hCell(t, w) {
  return new TableCell({ borders: cellBorders, width: { size: w, type: WidthType.DXA },
    shading: { fill: GRAFITE, type: ShadingType.CLEAR },
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [txt(t, { bold: true, color: 'FFFFFF', size: 18 })] })] });
}
function bCell(t, w, fill, mono) {
  return new TableCell({ borders: cellBorders, width: { size: w, type: WidthType.DXA },
    shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [txt(String(t), { size: 18, font: mono ? 'Consolas' : 'Arial' })] })] });
}
/* table: headers[], rows[][], widths[], monoCols (set de índices monoespaçados) */
function table(headers, rows, widths, monoCols = new Set()) {
  const head = new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, widths[i])) });
  const body = rows.map((r, ri) => new TableRow({
    children: r.map((c, i) => bCell(c, widths[i], ri % 2 ? CINZA_CLARO : undefined, monoCols.has(i))) }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...body] });
}

function imgDims(file) {
  const buf = fs.readFileSync(path.join(DIAG, file));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20);
  return { buf, w, h };
}
/* imagem centralizada, escalada para largura alvo (px) */
function figura(file, larguraAlvo, legenda) {
  const d = imgDims(file);
  const escala = larguraAlvo / d.w;
  const out = [ new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 60 },
    children: [new ImageRun({ type: 'png', data: d.buf,
      transformation: { width: Math.round(d.w * escala), height: Math.round(d.h * escala) },
      altText: { title: legenda, description: legenda, name: file } })] }) ];
  out.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 },
    children: [txt(legenda, { italics: true, size: 17, color: '6B7280' })] }));
  return out;
}

/* dicionário: tabela de colunas (Coluna | Tipo | Descrição) */
function dicionario(titulo, linhas) {
  return [ new Paragraph({ spacing: { before: 60, after: 60 }, children: [txt(titulo, { bold: true, size: 19, color: GRAFITE, font: 'Consolas' })] }),
    table(['Coluna', 'Tipo', 'Descrição'], linhas, [2400, 2200, 4760], new Set([0, 1])) ];
}

/* ---------- capa ---------- */
const capa = [
  new Paragraph({ spacing: { before: 1700 } }),
  p([txt('REMIO', { bold: true, size: 72, color: LARANJA })], { align: AlignmentType.CENTER, after: 80 }),
  p([txt('Plataforma de Serviços Domésticos', { size: 28, color: GRAFITE })], { align: AlignmentType.CENTER, after: 560 }),
  p([txt('ENGENHARIA DE DADOS', { bold: true, size: 38, color: GRAFITE })], { align: AlignmentType.CENTER, after: 60 }),
  p([txt('Banco transacional, Data Warehouse e ETL', { size: 24, color: '6B7280' })], { align: AlignmentType.CENTER, after: 40 }),
  p([txt('PostgreSQL  ·  Modelo Dimensional  ·  Pentaho Data Integration', { size: 20, color: '6B7280' })], { align: AlignmentType.CENTER, after: 1100 }),
  p([txt('Trabalho de Conclusão de Curso', { size: 24, color: GRAFITE })], { align: AlignmentType.CENTER, after: 80 }),
  p([txt('MBA em Gestão Analítica com BI e Big Data', { size: 24, color: GRAFITE })], { align: AlignmentType.CENTER, after: 80 }),
  p([txt('Universidade de Fortaleza — UNIFOR', { size: 24, color: GRAFITE })], { align: AlignmentType.CENTER, after: 700 }),
  p([txt('Fortaleza — CE, 2026', { size: 22, color: '6B7280' })], { align: AlignmentType.CENTER }),
  new Paragraph({ children: [new PageBreak()] })
];

/* ---------- sumário estático ---------- */
function tocItem(t, pg) {
  return new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 9180, leader: LeaderType.DOT }],
    spacing: { after: 120, line: 276 }, children: [txt(t, { size: 22, color: GRAFITE }), txt('\t' + pg, { size: 22, color: GRAFITE })] });
}

/* Marcadores: indicam onde os diagramas detalhados (DER e estrela)
   serão inseridos em páginas paisagem (mais largas, para legibilidade). */
const MARCADOR_DER = '__DER__';
const MARCADOR_ESTRELA = '__ESTRELA__';

const corpo = [];
corpo.push(p([txt('Sumário', { bold: true, size: 32, color: GRAFITE })], { after: 240 }));
[
  ['1. Visão Geral da Arquitetura de Dados', '3'],
  ['2. Banco de Dados Transacional (OLTP)', '4'],
  ['     2.1. Modelo de Dados (DER)', '4'],
  ['     2.2. Dicionário de Dados', '6'],
  ['3. Data Warehouse (Modelo Dimensional)', '8'],
  ['     3.1. Esquema Estrela', '8'],
  ['     3.2. Dimensões', '10'],
  ['     3.3. Tabelas de Fato', '10'],
  ['4. Processo de ETL no Pentaho (PDI)', '11'],
  ['     4.1. Job Principal de Carga', '11'],
  ['     4.2. Anatomia de uma Transformation', '11'],
  ['     4.3. Transformations e Estratégia de Carga', '12'],
  ['5. Do Dado ao Indicador — Mapeamento para os Dashboards', '13'],
  ['6. Evolução para Big Data', '14']
].forEach(([t, pg]) => corpo.push(tocItem(t, pg)));
corpo.push(new Paragraph({ children: [new PageBreak()] }));

/* ---------- 1. Visão geral ---------- */
corpo.push(h1('1. Visão Geral da Arquitetura de Dados'));
corpo.push(p('A engenharia de dados da plataforma Remio adota a arquitetura clássica de Business Intelligence, separando o ambiente operacional (onde a aplicação grava as transações do dia a dia) do ambiente analítico (otimizado para consultas e indicadores). O fluxo conecta cinco componentes, do site até os dashboards.'));
corpo.push(...figura('1-arquitetura.png', 624, 'Figura 1 — Arquitetura geral de dados: do aplicativo aos dashboards de BI.'));
corpo.push(p('O percurso do dado acontece em quatro etapas:'));
corpo.push(bullet([txt('Captura (OLTP): ', { bold: true }), txt('a aplicação grava cada ação — cadastro, pedido, orçamento, pagamento e avaliação — no banco transacional PostgreSQL, modelado de forma normalizada para garantir integridade.')]));
corpo.push(bullet([txt('Extração e transformação (ETL): ', { bold: true }), txt('o Pentaho Data Integration (PDI) lê os dados do OLTP, aplica limpezas, conversões e o cálculo das chaves substitutas, e os organiza no formato dimensional.')]));
corpo.push(bullet([txt('Armazenamento analítico (DW): ', { bold: true }), txt('o Data Warehouse, também em PostgreSQL, guarda os dados em um modelo estrela (dimensões e fatos), próprio para agregações rápidas.')]));
corpo.push(bullet([txt('Visualização (BI): ', { bold: true }), txt('os três dashboards (cliente, prestador e empresa parceira) consultam o DW e exibem os indicadores.')]));
corpo.push(p([txt('Por que separar OLTP e DW? ', { bold: true }), txt('O banco transacional é otimizado para escritas pequenas e frequentes (muitos pedidos por segundo); o Data Warehouse é otimizado para leituras analíticas pesadas (somar o faturamento de meses). Misturar os dois degradaria tanto a operação quanto a análise — por isso a separação é uma boa prática consagrada em BI.')], { before: 80 }));

/* ---------- 2. OLTP ---------- */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('2. Banco de Dados Transacional (OLTP)'));
corpo.push(p('O banco transacional (sigla OLTP, de Online Transaction Processing) sustenta a operação da plataforma. Foi modelado de forma normalizada — sem redundância — em 11 tabelas que representam usuários, prestadores, parceiros, pedidos, orçamentos, pagamentos, avaliações e indicações.'));

corpo.push(h2('2.1. Modelo de Dados (DER)'));
corpo.push(p('O Diagrama Entidade-Relacionamento (DER) — apresentado na página a seguir, em formato ampliado — mostra as tabelas e seus relacionamentos. A entidade central é o pedido, que conecta o cliente, o prestador, a categoria e o endereço, e do qual derivam o orçamento, o pagamento e a avaliação.'));
corpo.push(MARCADOR_DER);
corpo.push(p('A tabela a seguir resume a finalidade de cada entidade:', { before: 80 }));
corpo.push(table(['Tabela', 'Finalidade'], [
  ['usuario', 'Conta base de qualquer perfil (cliente, prestador ou parceiro).'],
  ['categoria_servico', 'Tipos de serviço doméstico (faxina, elétrica, hidráulica, etc.).'],
  ['prestador', 'Dados profissionais do prestador (plano, verificação, faixa de preço).'],
  ['prestador_categoria', 'Relação N:N entre prestador e as categorias que ele atende.'],
  ['parceiro', 'Empresas parceiras (lojas e fornecedores).'],
  ['endereco', 'Endereços dos usuários (local de execução do serviço).'],
  ['pedido', 'Solicitação de serviço — entidade central da operação.'],
  ['orcamento', 'Propostas de valor enviadas pelos prestadores.'],
  ['pagamento', 'Pagamento Protegido (custódia), com a comissão de 15%.'],
  ['avaliacao', 'Nota e comentário do cliente após o serviço.'],
  ['parceiro_indicacao', 'Indicações geradas para os parceiros.']
], [2400, 6960], new Set([0])));

corpo.push(h2('2.2. Dicionário de Dados'));
corpo.push(p('Detalhamento das colunas das tabelas centrais da operação. O script completo, com todas as 11 tabelas, índices e restrições, está no arquivo 01-oltp-schema.sql do repositório.'));

corpo.push(...dicionario('usuario', [
  ['id', 'BIGSERIAL', 'Identificador único (chave primária).'],
  ['nome', 'VARCHAR(150)', 'Nome completo do usuário.'],
  ['email', 'VARCHAR(150)', 'E-mail de login (único).'],
  ['senha_hash', 'VARCHAR(255)', 'Hash da senha (nunca em texto puro).'],
  ['tipo', 'VARCHAR(20)', 'Papel: cliente, prestador ou parceiro.'],
  ['cidade / uf', 'VARCHAR / CHAR(2)', 'Localização do usuário.'],
  ['data_cadastro', 'TIMESTAMP', 'Data e hora de criação da conta.'],
  ['ativo', 'BOOLEAN', 'Indica se a conta está ativa.']
]));
corpo.push(...dicionario('prestador', [
  ['id', 'BIGSERIAL', 'Identificador único.'],
  ['usuario_id', 'BIGINT (FK)', 'Referência ao usuário (1:1).'],
  ['plano', 'VARCHAR(10)', 'free ou pro (destaque na busca).'],
  ['verificado', 'BOOLEAN', 'Selo de profissional verificado.'],
  ['faixa_preco', 'SMALLINT', 'Faixa de preço: 1=$, 2=$$, 3=$$$.'],
  ['preco_medio', 'NUMERIC(10,2)', 'Preço médio praticado.'],
  ['nota_media', 'NUMERIC(3,2)', 'Média das avaliações recebidas.'],
  ['total_avaliacoes', 'INTEGER', 'Quantidade de avaliações.']
]));
corpo.push(...dicionario('pedido', [
  ['id', 'BIGSERIAL', 'Identificador único.'],
  ['cliente_id', 'BIGINT (FK)', 'Cliente que abriu o pedido.'],
  ['prestador_id', 'BIGINT (FK)', 'Prestador que executa (pode ser nulo no início).'],
  ['categoria_id', 'INT (FK)', 'Categoria do serviço.'],
  ['endereco_id', 'BIGINT (FK)', 'Endereço de execução.'],
  ['titulo', 'VARCHAR(150)', 'Título do pedido.'],
  ['status', 'VARCHAR(20)', 'aguardando, orcamento, agendado, concluido, avaliado, cancelado.'],
  ['data_criacao', 'TIMESTAMP', 'Abertura do pedido.'],
  ['data_conclusao', 'TIMESTAMP', 'Conclusão do serviço (usada no ETL incremental).']
]));
corpo.push(...dicionario('pagamento', [
  ['id', 'BIGSERIAL', 'Identificador único.'],
  ['pedido_id', 'BIGINT (FK)', 'Pedido associado (1:1).'],
  ['valor_total', 'NUMERIC(10,2)', 'Valor pago pelo cliente.'],
  ['percentual_comissao', 'NUMERIC(5,2)', 'Percentual da plataforma (padrão 15%).'],
  ['valor_comissao', 'NUMERIC(10,2)', 'Comissão retida pela Remio.'],
  ['valor_prestador', 'NUMERIC(10,2)', 'Valor repassado ao prestador.'],
  ['metodo', 'VARCHAR(20)', 'pix, credito ou debito.'],
  ['status', 'VARCHAR(20)', 'retido (custódia), liberado ou reembolsado.'],
  ['data_liberacao', 'TIMESTAMP', 'Quando o valor foi liberado ao prestador.']
]));
corpo.push(...dicionario('avaliacao', [
  ['id', 'BIGSERIAL', 'Identificador único.'],
  ['pedido_id', 'BIGINT (FK)', 'Pedido avaliado (1:1).'],
  ['cliente_id', 'BIGINT (FK)', 'Cliente que avaliou.'],
  ['prestador_id', 'BIGINT (FK)', 'Prestador avaliado.'],
  ['nota', 'SMALLINT', 'Nota de 1 a 5.'],
  ['comentario', 'TEXT', 'Comentário livre.'],
  ['data', 'TIMESTAMP', 'Data da avaliação.']
]));

/* ---------- 3. DW ---------- */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('3. Data Warehouse (Modelo Dimensional)'));
corpo.push(p('O Data Warehouse (DW) é o ambiente analítico, modelado segundo a técnica dimensional de Ralph Kimball. Em vez de tabelas normalizadas, organiza-se em tabelas de dimensão (o contexto: quem, o quê, quando) e tabelas de fato (as métricas: quanto, quantos), formando um esquema estrela.'));

corpo.push(h2('3.1. Esquema Estrela'));
corpo.push(p('A Remio possui três tabelas de fato que compartilham dimensões comuns — uma configuração chamada constelação de fatos. As cinco dimensões (tempo, cliente, prestador, serviço e parceiro) são reaproveitadas pelos fatos, garantindo consistência analítica. O esquema é apresentado na página a seguir, em formato ampliado.'));
corpo.push(MARCADOR_ESTRELA);
corpo.push(p([txt('Convenção de chaves: ', { bold: true }), txt('cada dimensão tem uma chave substituta (surrogate key, prefixo sk_) gerada no próprio DW, além da chave natural (prefixo id_) herdada do OLTP. As chaves substitutas tornam as junções mais rápidas e permitem o versionamento histórico das dimensões.')], { before: 60 }));

corpo.push(h2('3.2. Dimensões'));
corpo.push(table(['Dimensão', 'Conteúdo', 'Tipo SCD'], [
  ['dim_tempo', 'Calendário com chave AAAAMMDD; dia, mês, ano, trimestre, dia da semana.', 'Carga única'],
  ['dim_cliente', 'Dados do cliente (nome, cidade) com histórico de mudanças.', 'SCD Tipo 2'],
  ['dim_prestador', 'Dados do prestador (plano, verificação, faixa de preço) com histórico.', 'SCD Tipo 2'],
  ['dim_servico', 'Categoria do serviço.', 'SCD Tipo 1'],
  ['dim_parceiro', 'Empresa parceira (razão social, segmento, cidade).', 'SCD Tipo 1']
], [2200, 5360, 1800], new Set([0])));
corpo.push(p([txt('SCD (Slowly Changing Dimension): ', { bold: true }), txt('estratégia para lidar com mudanças nos dados de uma dimensão. No Tipo 1, o valor é simplesmente sobrescrito; no Tipo 2, cria-se uma nova versão da linha (com datas de início e fim e um indicador de versão corrente), preservando o histórico — essencial, por exemplo, para saber qual era o plano do prestador na época de cada serviço.')], { before: 80 }));

corpo.push(h2('3.3. Tabelas de Fato'));
corpo.push(table(['Fato', 'Grão (1 linha por...)', 'Principais medidas'], [
  ['fato_servico', 'serviço concluído (pedido)', 'valor_servico, valor_comissao, valor_prestador, qtd, nota'],
  ['fato_avaliacao', 'avaliação registrada', 'nota, qtd_avaliacao'],
  ['fato_indicacao_parceiro', 'indicação de parceiro', 'qtd_indicacao, qtd_contato, qtd_venda, valor_venda']
], [2600, 3000, 3760], new Set([0])));
corpo.push(...dicionario('fato_servico (principal)', [
  ['sk_fato_servico', 'BIGSERIAL', 'Chave primária do fato.'],
  ['sk_tempo', 'INTEGER (FK)', 'Quando o serviço foi concluído.'],
  ['sk_cliente', 'BIGINT (FK)', 'Quem contratou.'],
  ['sk_prestador', 'BIGINT (FK)', 'Quem executou.'],
  ['sk_servico', 'INTEGER (FK)', 'Categoria do serviço.'],
  ['id_pedido', 'BIGINT', 'Chave degenerada (rastreio ao pedido de origem).'],
  ['valor_servico', 'NUMERIC(10,2)', 'Valor total do serviço.'],
  ['valor_comissao', 'NUMERIC(10,2)', 'Comissão da plataforma.'],
  ['valor_prestador', 'NUMERIC(10,2)', 'Valor recebido pelo prestador.'],
  ['nota_avaliacao', 'SMALLINT', 'Nota recebida (se avaliado).']
]));

/* ---------- 4. ETL ---------- */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('4. Processo de ETL no Pentaho (PDI)'));
corpo.push(p('O ETL (Extract, Transform, Load) é o processo que move e adapta os dados do OLTP para o DW. Foi projetado no Pentaho Data Integration (PDI, também conhecido como Kettle), que organiza o trabalho em dois tipos de artefato: transformations (.ktr), que manipulam os dados linha a linha, e jobs (.kjb), que orquestram a ordem de execução das transformations.'));

corpo.push(h2('4.1. Job Principal de Carga'));
corpo.push(p('O job job_carga_dw.kjb coordena toda a carga. A ordem respeita a dependência referencial: primeiro carregam-se as dimensões, depois os fatos — pois os fatos precisam das chaves substitutas (sk_) já existentes nas dimensões para fazer seus lookups.'));
corpo.push(...figura('4a-etl-job.png', 624, 'Figura 4 — Job principal: carga das dimensões seguida da carga dos fatos.'));

corpo.push(h2('4.2. Anatomia de uma Transformation'));
corpo.push(p('Cada transformation é uma sequência de steps (passos) ligados por hops (setas) por onde fluem as linhas. O exemplo abaixo detalha a tr_fato_servico, que carrega a tabela de fato principal.'));
corpo.push(...figura('4b-etl-trans.png', 624, 'Figura 5 — Steps da transformation tr_fato_servico, do OLTP ao fato.'));
corpo.push(p('Os steps dessa transformation:', { before: 60 }));
corpo.push(table(['Step (PDI)', 'Função'], [
  ['Table Input', 'Lê do OLTP os pedidos concluídos, unindo pedido, pagamento e avaliacao via SQL.'],
  ['Lookup dim_tempo', 'Converte a data de conclusão na chave sk_tempo (formato AAAAMMDD).'],
  ['Lookup dim_cliente', 'Busca a sk_cliente vigente a partir do id natural do cliente.'],
  ['Lookup dim_prestador', 'Busca a sk_prestador vigente a partir do id natural do prestador.'],
  ['Lookup dim_servico', 'Busca a sk_servico a partir da categoria.'],
  ['Select Values', 'Seleciona e ordena as colunas finais (chaves + medidas).'],
  ['Table Output', 'Insere as linhas resultantes na tabela fato_servico do DW.']
], [2600, 6760], new Set([0])));

corpo.push(h2('4.3. Transformations e Estratégia de Carga'));
corpo.push(table(['Transformation', 'Origem (OLTP)', 'Destino (DW)', 'Carga'], [
  ['tr_dim_tempo', 'Geração por intervalo', 'dim_tempo', 'Única'],
  ['tr_dim_cliente', 'usuario (cliente)', 'dim_cliente', 'SCD2'],
  ['tr_dim_prestador', 'prestador + usuario', 'dim_prestador', 'SCD2'],
  ['tr_dim_servico', 'categoria_servico', 'dim_servico', 'SCD1'],
  ['tr_dim_parceiro', 'parceiro + usuario', 'dim_parceiro', 'SCD1'],
  ['tr_fato_servico', 'pedido + pagamento + avaliacao', 'fato_servico', 'Incremental'],
  ['tr_fato_avaliacao', 'avaliacao', 'fato_avaliacao', 'Incremental'],
  ['tr_fato_indicacao', 'parceiro_indicacao', 'fato_indicacao_parceiro', 'Incremental']
], [2500, 3100, 2360, 1400], new Set([0])));
corpo.push(p([txt('Carga incremental: ', { bold: true }), txt('para não reprocessar toda a base a cada execução, os fatos são carregados apenas com os registros novos desde a última carga. Guarda-se a data/hora da última execução bem-sucedida em uma tabela de controle; a Table Input filtra por data_conclusao maior que esse marco. Isso torna a carga rápida e adequada a uma execução diária ou de hora em hora.')], { before: 80 }));
corpo.push(p([txt('Dimensões SCD2 no Pentaho: ', { bold: true }), txt('o step nativo Dimension Lookup/Update do PDI cuida automaticamente do versionamento — ele detecta mudanças, encerra a versão anterior (preenchendo dt_fim e marcando corrente = false) e cria a nova versão vigente, sem necessidade de código manual.')]));

/* ---------- 5. Mapeamento ---------- */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('5. Do Dado ao Indicador — Mapeamento para os Dashboards'));
corpo.push(p('A tabela a seguir fecha o ciclo, mostrando como cada indicador exibido nos dashboards do protótipo é obtido a partir do Data Warehouse. Isso evidencia que a modelagem foi desenhada de trás para frente: a partir das perguntas de negócio que os painéis respondem.'));
corpo.push(table(['Dashboard / Indicador', 'Fato', 'Dimensões', 'Cálculo'], [
  ['Cliente — Gastos por mês', 'fato_servico', 'dim_tempo, dim_cliente', 'SUM(valor_servico)'],
  ['Cliente — Contratações por categoria', 'fato_servico', 'dim_servico, dim_cliente', 'COUNT(*)'],
  ['Prestador — Faturamento mensal', 'fato_servico', 'dim_tempo, dim_prestador', 'SUM(valor_prestador)'],
  ['Prestador — Demanda por serviço', 'fato_servico', 'dim_servico, dim_prestador', 'COUNT(*)'],
  ['Prestador — Nota média', 'fato_avaliacao', 'dim_prestador', 'AVG(nota)'],
  ['Prestador — Preço vs. média', 'fato_servico', 'dim_servico, dim_prestador', 'AVG(valor_servico)'],
  ['Parceiro — Funil indicação→venda', 'fato_indicacao_parceiro', 'dim_tempo, dim_parceiro', 'SUM(qtd_indicacao/contato/venda)']
], [3100, 2400, 2300, 1560], new Set([1])));
corpo.push(p('Um exemplo concreto da consulta que alimenta o faturamento mensal do prestador:', { before: 80 }));
corpo.push(code([
  'SELECT t.ano, t.mes, t.nome_mes,',
  '       SUM(f.valor_prestador) AS faturamento',
  'FROM   fato_servico  f',
  'JOIN   dim_tempo     t ON t.sk_tempo     = f.sk_tempo',
  'JOIN   dim_prestador p ON p.sk_prestador = f.sk_prestador',
  'WHERE  p.id_prestador = :id AND p.corrente = TRUE',
  'GROUP  BY t.ano, t.mes, t.nome_mes',
  'ORDER  BY t.ano, t.mes;'
]));

/* ---------- 6. Big Data ---------- */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('6. Evolução para Big Data'));
corpo.push(p('A arquitetura apresentada atende plenamente a operação inicial da Remio. À medida que o volume de dados crescer — milhões de pedidos, eventos de navegação, geolocalização e mensagens — alguns componentes podem evoluir para um ecossistema de Big Data, mantendo o mesmo princípio de separar operação e análise:'));
corpo.push(bullet([txt('Ingestão de eventos em tempo real: ', { bold: true }), txt('uma camada de streaming (por exemplo, Apache Kafka) capturaria eventos do aplicativo de forma contínua, complementando a carga em lote do Pentaho.')]));
corpo.push(bullet([txt('Data Lake: ', { bold: true }), txt('dados brutos e semiestruturados (logs, cliques, avaliações em texto) seriam armazenados em um data lake (por exemplo, em formato Parquet sobre armazenamento de objetos) antes do tratamento.')]));
corpo.push(bullet([txt('Processamento distribuído: ', { bold: true }), txt('transformações sobre grandes volumes poderiam usar Apache Spark, preservando a lógica dimensional já definida.')]));
corpo.push(bullet([txt('Analytics avançado: ', { bold: true }), txt('com a base histórica consolidada, tornam-se viáveis modelos preditivos — previsão de demanda por região, recomendação de prestadores e detecção de fraude no Pagamento Protegido.')]));
corpo.push(p([txt('Em todos os cenários, o modelo dimensional documentado aqui permanece como a camada de consumo analítico — a fonte única e confiável que alimenta os dashboards e as decisões de negócio da plataforma.')], { before: 80 }));

/* ---------- montagem das seções (retrato + paisagem) ----------
   Os diagramas detalhados (DER e estrela) vão em páginas paisagem,
   onde cabem maiores e ficam legíveis. */
function dividir(arr, marcador) {
  const i = arr.indexOf(marcador);
  return [arr.slice(0, i), arr.slice(i + 1)];
}
const [seg1, restoA] = dividir(corpo, MARCADOR_DER);
const [seg2, seg3] = dividir(restoA, MARCADOR_ESTRELA);

const figDER = figura('2-der-oltp.png', 860, 'Figura 2 — Diagrama Entidade-Relacionamento do banco transacional (OLTP).');
const figEstrela = figura('3-estrela-dw.png', 860, 'Figura 3 — Esquema estrela do Data Warehouse (constelação de fatos).');

const rodape = () => new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER,
  children: [txt('Remio — Engenharia de Dados  |  ', { size: 16, color: '9CA3AF' }),
    txt('Página ', { size: 16, color: '9CA3AF' }),
    new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '9CA3AF' })] }) ] });

const margem = { top: 1440, right: 1440, bottom: 1440, left: 1440 };
const secaoRetrato = (filhos) => ({
  properties: { page: { size: { width: 12240, height: 15840 }, margin: margem } },
  footers: { default: rodape() }, children: filhos
});
const secaoPaisagem = (filhos) => ({
  properties: { page: { size: { width: 12240, height: 15840, orientation: PageOrientation.LANDSCAPE }, margin: margem } },
  footers: { default: rodape() }, children: filhos
});

const secoes = [
  secaoRetrato([...capa, ...seg1]),
  secaoPaisagem(figDER),
  secaoRetrato(seg2),
  secaoPaisagem(figEstrela),
  secaoRetrato(seg3)
];

/* ---------- documento ---------- */
const doc = new Document({
  creator: 'Equipe Remio — TCC UNIFOR',
  title: 'Engenharia de Dados — Remio',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22, color: GRAFITE } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Arial', color: LARANJA },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LARANJA, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 25, bold: true, font: 'Arial', color: GRAFITE },
        paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } }
    ]
  },
  numbering: { config: [ { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•',
    alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] } ] },
  sections: secoes
});

Packer.toBuffer(doc).then(buf => {
  const nome = process.env.OUT_NAME || 'Remio - Engenharia de Dados.docx';
  const out = path.join(__dirname, '..', 'docs', nome);
  fs.writeFileSync(out, buf);
  console.log('OK:', out);
});
