/* Gera o DOCX de Arquitetura, Segurança e Qualidade da Plataforma Remio. */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType,
  ShadingType, PageBreak, PageNumber, Footer, VerticalAlign, TabStopType, LeaderType
} = require('docx');

const LARANJA = 'EA580C', GRAFITE = '1F2937', CINZA_BORDA = 'CCCCCC', CINZA_CLARO = 'F3F4F6';
const CONTENT_W = 9360;
const DIAG = path.join(__dirname, '..', 'diagramas');
const b = { style: BorderStyle.SINGLE, size: 1, color: CINZA_BORDA };
const cellBorders = { top: b, bottom: b, left: b, right: b };
const txt = (t, o = {}) => new TextRun({ text: t, ...o });

function p(children, opts = {}) {
  return new Paragraph({ children: Array.isArray(children) ? children : [txt(children, opts.run || {})],
    spacing: { after: opts.after ?? 120, before: opts.before ?? 0, line: 276 }, alignment: opts.align });
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
      children: lines.map(l => new Paragraph({ children: [new TextRun({ text: l || ' ', font: 'Consolas', size: 17, color: 'E8E8E8' })], spacing: { after: 0, line: 246 } })) }) ] }) ] });
}
function hCell(t, w) {
  return new TableCell({ borders: cellBorders, width: { size: w, type: WidthType.DXA }, shading: { fill: GRAFITE, type: ShadingType.CLEAR },
    margins: { top: 70, bottom: 70, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [txt(t, { bold: true, color: 'FFFFFF', size: 18 })] })] });
}
function bCell(t, w, fill, mono) {
  return new TableCell({ borders: cellBorders, width: { size: w, type: WidthType.DXA }, shading: fill ? { fill, type: ShadingType.CLEAR } : undefined,
    margins: { top: 60, bottom: 60, left: 110, right: 110 }, verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({ children: [txt(String(t), { size: 18, font: mono ? 'Consolas' : 'Arial' })] })] });
}
function table(headers, rows, widths, monoCols = new Set()) {
  const head = new TableRow({ tableHeader: true, children: headers.map((h, i) => hCell(h, widths[i])) });
  const body = rows.map((r, ri) => new TableRow({ children: r.map((c, i) => bCell(c, widths[i], ri % 2 ? CINZA_CLARO : undefined, monoCols.has(i))) }));
  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: widths, rows: [head, ...body] });
}
function figura(file, larguraAlvo, legenda) {
  const buf = fs.readFileSync(path.join(DIAG, file));
  const w = buf.readUInt32BE(16), h = buf.readUInt32BE(20), esc = larguraAlvo / w;
  return [ new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80, after: 60 },
      children: [new ImageRun({ type: 'png', data: buf, transformation: { width: Math.round(w * esc), height: Math.round(h * esc) },
        altText: { title: legenda, description: legenda, name: file } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [txt(legenda, { italics: true, size: 17, color: '6B7280' })] }) ];
}

/* ---------- capa ---------- */
const capa = [
  new Paragraph({ spacing: { before: 1700 } }),
  p([txt('REMIO', { bold: true, size: 72, color: LARANJA })], { align: AlignmentType.CENTER, after: 80 }),
  p([txt('Plataforma de Serviços Domésticos', { size: 28, color: GRAFITE })], { align: AlignmentType.CENTER, after: 560 }),
  p([txt('ARQUITETURA, SEGURANÇA', { bold: true, size: 36, color: GRAFITE })], { align: AlignmentType.CENTER, after: 10 }),
  p([txt('E QUALIDADE DA PLATAFORMA', { bold: true, size: 36, color: GRAFITE })], { align: AlignmentType.CENTER, after: 60 }),
  p([txt('Observabilidade · Segurança · Resiliência · IA', { size: 22, color: '6B7280' })], { align: AlignmentType.CENTER, after: 1100 }),
  p([txt('Trabalho de Conclusão de Curso', { size: 24, color: GRAFITE })], { align: AlignmentType.CENTER, after: 80 }),
  p([txt('MBA em Gestão Analítica com BI e Big Data', { size: 24, color: GRAFITE })], { align: AlignmentType.CENTER, after: 80 }),
  p([txt('Universidade de Fortaleza — UNIFOR', { size: 24, color: GRAFITE })], { align: AlignmentType.CENTER, after: 700 }),
  p([txt('Fortaleza — CE, 2026', { size: 22, color: '6B7280' })], { align: AlignmentType.CENTER }),
  new Paragraph({ children: [new PageBreak()] })
];

const corpo = [];
corpo.push(p([txt('Sumário', { bold: true, size: 32, color: GRAFITE })], { after: 240 }));
function tocItem(t, pg) {
  return new Paragraph({ tabStops: [{ type: TabStopType.RIGHT, position: 9180, leader: LeaderType.DOT }],
    spacing: { after: 120, line: 276 }, children: [txt(t, { size: 22, color: GRAFITE }), txt('\t' + pg, { size: 22, color: GRAFITE })] });
}
const TOC = [
  ['1. Introdução e Arquitetura-Alvo', '3'],
  ['2. Estilo Arquitetural: Monólito Modular e Microsserviços', '4'],
  ['3. Segurança em Camadas', '6'],
  ['     3.1. Proteção contra SQL Injection', '7'],
  ['4. Observabilidade', '8'],
  ['5. Resiliência do Software', '9'],
  ['6. Gestão de Backups e Recuperação de Desastres', '10'],
  ['7. Qualidade e Verificação Contínua', '11'],
  ['8. Spec-Driven Development e CI/CD', '12'],
  ['9. Repositório de Erros e Correção', '13'],
  ['10. Fluxos de Inteligência Artificial', '14'],
  ['11. Considerações Finais', '15']
];
TOC.forEach(([t, pg]) => corpo.push(tocItem(t, pg)));
corpo.push(new Paragraph({ children: [new PageBreak()] }));

/* 1. Introdução */
corpo.push(h1('1. Introdução e Arquitetura-Alvo'));
corpo.push(p('Este documento descreve a arquitetura-alvo da plataforma Remio sob a ótica de engenharia de software: como o sistema seria estruturado em produção para ser seguro, observável, resiliente e de alta qualidade. Enquanto o protótipo entregue é uma aplicação front-end com dados simulados, esta seção projeta o sistema completo que o sustentaria em escala real, atendendo aos requisitos não funcionais da plataforma.'));
corpo.push(p('A arquitetura adota uma organização em camadas, com responsabilidades bem separadas e duas camadas transversais — observabilidade e segurança — que permeiam todo o sistema.'));
corpo.push(...figura('5-arquitetura-camadas.png', 600, 'Figura 1 — Arquitetura-alvo da plataforma em camadas.'));
corpo.push(p('As camadas se dividem assim:', { before: 60 }));
corpo.push(bullet([txt('Cliente: ', { bold: true }), txt('o site/app que o usuário acessa.')]));
corpo.push(bullet([txt('Borda: ', { bold: true }), txt('CDN para desempenho e WAF (Web Application Firewall) com rate limiting para barrar tráfego malicioso antes que chegue à aplicação.')]));
corpo.push(bullet([txt('Aplicação: ', { bold: true }), txt('um API Gateway que autentica e roteia as requisições para os serviços de negócio (usuários, pedidos, pagamentos, avaliações e BI/IA).')]));
corpo.push(bullet([txt('Dados: ', { bold: true }), txt('o banco transacional (OLTP), o Data Warehouse e um cache (Redis) para acelerar leituras frequentes.')]));
corpo.push(bullet([txt('Transversais: ', { bold: true }), txt('observabilidade e segurança, aplicadas a todas as camadas anteriores.')]));

/* 2. Estilo arquitetural */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('2. Estilo Arquitetural: Monólito Modular e Microsserviços'));
corpo.push(p('Uma decisão central de arquitetura é escolher entre um monólito (aplicação única) e microsserviços (vários serviços independentes). A Remio adota uma estratégia evolutiva, adequada ao estágio do negócio.'));
corpo.push(table(['Abordagem', 'Vantagens', 'Quando usar na Remio'], [
  ['Monólito modular', 'Simples de desenvolver, testar e implantar; menor custo operacional.', 'Fase inicial — poucos usuários, equipe pequena, validação do modelo de negócio.'],
  ['Microsserviços', 'Escala independente por serviço; isolamento de falhas; times autônomos.', 'Fase de crescimento — quando o volume e a equipe justificarem a complexidade.']
], [2400, 4060, 2900]));
corpo.push(p([txt('Decisão adotada: ', { bold: true }), txt('iniciar como um monólito modular — uma aplicação única, porém internamente organizada em módulos bem separados (usuários, pedidos, pagamentos, avaliações), com fronteiras claras. Essa organização permite, no futuro, extrair cada módulo como um microsserviço sem reescrever o sistema. Adotar microsserviços desde o início, numa plataforma em validação, seria over-engineering: traria complexidade de rede, orquestração e monitoramento desproporcional ao porte atual.')], { before: 80 }));
corpo.push(p([txt('Essa decisão dialoga diretamente com o plano de negócios, que projeta uma empresa em formação e crescimento gradual: a arquitetura acompanha a maturidade da operação.')]));

/* 3. Segurança */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('3. Segurança em Camadas'));
corpo.push(p('A segurança da Remio segue o princípio de defesa em profundidade (defense in depth): em vez de uma única barreira, várias camadas de proteção se sobrepõem, de modo que a falha de uma não comprometa todo o sistema.'));
corpo.push(...figura('6-seguranca-camadas.png', 470, 'Figura 2 — Defesa em profundidade: quatro camadas de segurança.'));
corpo.push(p('Cada camada cumpre um papel:', { before: 60 }));
corpo.push(bullet([txt('Rede e borda: ', { bold: true }), txt('todo o tráfego é cifrado por TLS/HTTPS; o WAF filtra ataques conhecidos; o rate limiting impede abuso e ataques de negação de serviço.')]));
corpo.push(bullet([txt('Aplicação: ', { bold: true }), txt('autenticação por login com tokens JWT; autorização por papel (cada perfil só acessa o que lhe compete); e validação rigorosa de toda entrada do usuário.')]));
corpo.push(bullet([txt('Dados: ', { bold: true }), txt('queries parametrizadas contra SQL injection, criptografia dos dados sensíveis e o princípio do menor privilégio (cada serviço usa um usuário de banco com permissões mínimas).')]));
corpo.push(bullet([txt('Monitoramento: ', { bold: true }), txt('trilha de auditoria de todas as ações sensíveis e alertas automáticos diante de comportamentos suspeitos.')]));

corpo.push(h2('3.1. Proteção contra SQL Injection'));
corpo.push(p('O SQL injection é um dos ataques mais comuns: o atacante insere comandos SQL em campos de entrada para manipular a consulta. A defesa definitiva são as queries parametrizadas (prepared statements), nas quais os dados do usuário nunca são interpretados como código. O contraste abaixo ilustra o problema e a solução.'));
corpo.push(p([txt('Código vulnerável ', { bold: true }), txt('(concatenação de texto — nunca faça isto):', {})], { after: 80 }));
corpo.push(code([
  '// A entrada do usuário vira parte do comando SQL:',
  'const sql = "SELECT * FROM usuario WHERE email = \'" + entrada + "\'";',
  '',
  "// Entrada maliciosa:  ' OR '1'='1",
  "// SQL resultante:  ... WHERE email = '' OR '1'='1'",
  '// Resultado: retorna TODOS os usuários (vazamento de dados).'
]));
corpo.push(p([txt('Código seguro ', { bold: true }), txt('(query parametrizada — padrão adotado na Remio):', {})], { before: 100, after: 80 }));
corpo.push(code([
  '// O valor é enviado separado do comando, como parâmetro:',
  'const sql = "SELECT * FROM usuario WHERE email = $1";',
  'await db.query(sql, [entrada]);',
  '',
  '// A entrada nunca é interpretada como SQL — apenas como dado.',
  '// O ataque deixa de funcionar.'
]));
corpo.push(p('Os exemplos de consulta do documento de Engenharia de Dados já seguem esse padrão, usando parâmetros nomeados (por exemplo, :id) em vez de concatenar valores.', { before: 80 }));

/* 4. Observabilidade */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('4. Observabilidade'));
corpo.push(p('Observabilidade é a capacidade de entender o que acontece dentro do sistema a partir do que ele emite. Vai além do monitoramento tradicional: permite identificar automaticamente padrões, gargalos e oportunidades de melhoria — exatamente o tipo de análise que o orientador destacou. Apoia-se em três pilares.'));
corpo.push(...figura('7-observabilidade.png', 600, 'Figura 3 — Os três pilares da observabilidade e o fluxo até alertas e IA.'));
corpo.push(table(['Pilar', 'O que registra', 'Pergunta que responde'], [
  ['Logs', 'Eventos e erros, com contexto.', 'O que aconteceu e por quê?'],
  ['Métricas', 'Números ao longo do tempo (latência, throughput, uso de CPU).', 'O sistema está saudável e rápido?'],
  ['Traces', 'O caminho completo de uma requisição entre serviços.', 'Onde está o gargalo?']
], [1700, 4360, 3300]));
corpo.push(p('Os três sinais são coletados por um agente padronizado (OpenTelemetry), armazenados (Prometheus para métricas, Loki para logs) e visualizados em dashboards (Grafana). Sobre essa base atuam os alertas automáticos (por exemplo, "latência acima de 2s" ou "taxa de erro subindo") e uma camada de detecção de anomalias com IA, capaz de apontar padrões e sugerir melhorias sem intervenção manual.', { before: 80 }));

/* 5. Resiliência */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('5. Resiliência do Software'));
corpo.push(p('Resiliência é a capacidade do sistema de continuar funcionando — ou degradar de forma controlada — diante de falhas. Em vez de supor que tudo sempre funciona, projeta-se para a falha. Os principais padrões adotados:'));
corpo.push(table(['Padrão', 'Função'], [
  ['Retry com backoff', 'Repete automaticamente uma operação que falhou de forma transitória, com intervalos crescentes.'],
  ['Circuit breaker', 'Interrompe chamadas a um serviço que está falhando, evitando efeito dominó, e testa a recuperação depois.'],
  ['Timeout', 'Define um tempo máximo de espera, impedindo que uma requisição travada bloqueie recursos.'],
  ['Redundância', 'Múltiplas instâncias de cada serviço e réplicas do banco, sem ponto único de falha.'],
  ['Degradação graciosa', 'Diante de falha parcial, o sistema oferece uma versão reduzida (ex.: dashboard mostra o último dado válido em vez de quebrar).'],
  ['Filas de mensagens', 'Desacoplam serviços; se um está fora do ar, as mensagens aguardam e são processadas depois.']
], [2400, 6960]));
corpo.push(p([txt('Esses padrões são medidos por metas de nível de serviço (SLO — Service Level Objectives), como "99,5% de disponibilidade mensal", que orientam tanto o desenvolvimento quanto os alertas de observabilidade.')], { before: 80 }));

/* 6. Backups */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('6. Gestão de Backups e Recuperação de Desastres'));
corpo.push(p('Os dados são o ativo mais crítico da plataforma. A estratégia de backup combina cópias regulares com a capacidade de restaurar o banco a qualquer ponto no tempo, minimizando perdas.'));
corpo.push(table(['Mecanismo', 'Descrição'], [
  ['Backup completo (pg_dump)', 'Cópia integral do banco PostgreSQL, executada diariamente em horário de baixa demanda.'],
  ['PITR (Point-in-Time Recovery)', 'Arquivamento contínuo dos logs de transação (WAL), permitindo restaurar o banco para qualquer instante — por exemplo, segundos antes de um erro.'],
  ['Retenção em camadas', 'Backups diários por 30 dias, semanais por 3 meses e mensais por 1 ano.'],
  ['Armazenamento externo', 'Cópias replicadas em local geograficamente distinto, protegendo contra desastres físicos.'],
  ['Testes de restauração', 'Restauração periódica em ambiente isolado para garantir que os backups realmente funcionam.']
], [2900, 6460]));
corpo.push(p([txt('Duas métricas guiam a estratégia: o ', {}), txt('RPO', { bold: true }), txt(' (Recovery Point Objective — quanto de dado se aceita perder, alvo de minutos com PITR) e o ', {}), txt('RTO', { bold: true }), txt(' (Recovery Time Objective — em quanto tempo o sistema volta, alvo de poucas horas).')], { before: 80 }));

/* 7. Qualidade */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('7. Qualidade e Verificação Contínua'));
corpo.push(p('Para responder à preocupação levantada pelo orientador — "como saber se o site está ficando lento ou se os painéis estão com dados errados?" — a plataforma adota rotinas automáticas de verificação em três frentes.'));
corpo.push(h2('Saúde do sistema (o site está lento?)'));
corpo.push(bullet([txt('Health checks: ', { bold: true }), txt('cada serviço expõe um endpoint de saúde verificado continuamente; se não responder, dispara alerta e aciona a redundância.')]));
corpo.push(bullet([txt('Monitoramento sintético: ', { bold: true }), txt('robôs simulam a jornada do usuário (buscar profissional, abrir orçamento) em intervalos regulares e medem o tempo de resposta, detectando lentidão antes do usuário real.')]));
corpo.push(h2('Qualidade dos dados (os painéis estão certos?)'));
corpo.push(p('Painéis errados quase sempre nascem de dados ruins na carga. Por isso, o ETL ganha etapas de validação de qualidade de dados (data quality) antes de publicar no Data Warehouse:'));
corpo.push(bullet('Verificação de completude: nenhuma chave estrangeira órfã, nenhum campo obrigatório nulo.'));
corpo.push(bullet('Verificação de consistência: somatórios conferem (ex.: valor_comissao + valor_prestador = valor_total).'));
corpo.push(bullet('Verificação de volume: a carga do dia está dentro da faixa esperada (uma queda brusca indica falha na extração).'));
corpo.push(bullet('Em caso de falha, a carga é interrompida e um alerta é emitido — o painel nunca exibe dado inválido.'));
corpo.push(h2('Testes automatizados'));
corpo.push(p('Testes unitários, de integração e de ponta a ponta rodam a cada alteração de código (ver seção 8), garantindo que novas funcionalidades não quebrem as existentes.'));

/* 8. Spec-driven + CI/CD */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('8. Spec-Driven Development e CI/CD'));
corpo.push(p('O desenvolvimento da Remio seguiu a abordagem Spec-Driven Development (desenvolvimento guiado por especificação): antes de escrever código, define-se uma especificação clara do que será construído. Este próprio projeto foi conduzido assim — cada parte partiu de um documento de design (DESIGN.md) validado antes da implementação.'));
corpo.push(...figura('8-cicd-spec.png', 624, 'Figura 4 — Ciclo do spec-driven development integrado ao CI/CD.'));
corpo.push(p('O ciclo completo funciona como um fluxo contínuo:', { before: 60 }));
corpo.push(bullet([txt('Especificação → Plano → Código: ', { bold: true }), txt('a ideia é detalhada, decomposta em tarefas e então implementada.')]));
corpo.push(bullet([txt('Testes → Build → Deploy (CI/CD): ', { bold: true }), txt('a cada alteração, uma esteira automatizada roda os testes, monta a aplicação (Integração Contínua) e a publica (Entrega Contínua), reduzindo erro humano.')]));
corpo.push(bullet([txt('Monitoramento → Melhoria: ', { bold: true }), txt('a observabilidade em produção gera aprendizados que retroalimentam novas especificações, fechando o ciclo.')]));
corpo.push(p([txt('Benefício para o TCC: ', { bold: true }), txt('os documentos de design e os registros de prompts já produzidos são a evidência concreta de que o projeto adotou essa metodologia, e não um desenvolvimento improvisado.')], { before: 80 }));

/* 9. Repositório de erros */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('9. Repositório de Erros e Correção'));
corpo.push(p('Um repositório de erros centraliza, registra e prioriza as falhas que ocorrem em produção, transformando-as em correções. Em vez de depender de o usuário relatar um problema, o próprio sistema captura e cataloga cada erro.'));
corpo.push(table(['Etapa', 'O que acontece'], [
  ['Captura', 'Toda exceção (no front-end e no back-end) é interceptada e enviada a uma ferramenta de rastreamento (ex.: Sentry).'],
  ['Agrupamento', 'Erros idênticos são agrupados, com contagem de ocorrências, usuários afetados e contexto (navegador, rota, versão).'],
  ['Priorização', 'Os erros são ordenados por impacto (frequência × severidade), guiando o time sobre o que corrigir primeiro.'],
  ['Correção e verificação', 'A correção entra pelo fluxo de CI/CD; o erro é marcado como resolvido e o sistema confirma se parou de ocorrer.']
], [2200, 7160]));
corpo.push(p([txt('No protótipo, esse conceito será demonstrado de forma simplificada: uma tela que captura erros de JavaScript do navegador e os exibe em uma lista — uma versão didática do repositório de erros.')], { before: 80 }));

/* 10. IA */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('10. Fluxos de Inteligência Artificial'));
corpo.push(p('A Inteligência Artificial amplia o valor da plataforma em várias frentes. Os principais casos de uso previstos para a Remio:'));
corpo.push(table(['Caso de uso', 'Benefício'], [
  ['Análise das avaliações', 'Classifica o sentimento e extrai temas recorrentes dos comentários, revelando padrões de melhoria.'],
  ['Detecção de fraude', 'Identifica transações suspeitas no Pagamento Protegido em tempo real.'],
  ['Previsão de demanda', 'Antecipa picos por categoria e região, orientando a captação de prestadores.'],
  ['Matching inteligente', 'Recomenda ao cliente os prestadores com maior chance de atender bem ao pedido.'],
  ['Detecção de anomalias', 'Apoia a observabilidade, sinalizando comportamentos fora do padrão.']
], [2700, 6660]));
corpo.push(p('O primeiro caso — análise das avaliações — foi efetivamente implementado neste trabalho, usando a API da Claude (Anthropic). O fluxo recebe os comentários dos clientes e devolve uma análise estruturada (sentimento, temas e sugestões de melhoria), conectando-se à observabilidade como uma fonte automática de insights.'));
corpo.push(...figura('9-fluxo-ia.png', 624, 'Figura 5 — Fluxo de IA: das avaliações à análise estruturada pela API da Claude.'));
corpo.push(p([txt('Boa prática de segurança no fluxo de IA: ', { bold: true }), txt('a chave da API nunca fica no código do site (que é público). A chamada à Claude passa por um backend, que guarda a chave com segurança — o mesmo princípio de menor privilégio e proteção de segredos descrito na seção de segurança. Os detalhes da implementação constam na documentação técnica do repositório.')], { before: 80 }));

/* 11. Considerações finais */
corpo.push(new Paragraph({ children: [new PageBreak()] }));
corpo.push(h1('11. Considerações Finais'));
corpo.push(p('Este documento elevou a Remio de um protótipo funcional para uma plataforma pensada de ponta a ponta sob critérios profissionais de engenharia: arquitetura em camadas com evolução planejada de monólito a microsserviços, segurança em profundidade, observabilidade nos três pilares, resiliência a falhas, gestão de backups, verificação contínua de saúde e de qualidade de dados, metodologia spec-driven com CI/CD, rastreamento de erros e uso aplicado de Inteligência Artificial.'));
corpo.push(p('Em conjunto, esses elementos demonstram maturidade arquitetural e respondem diretamente às melhorias sugeridas pelo orientador, fortalecendo a fundamentação técnica do trabalho. O protótipo permanece como prova de conceito da experiência do usuário e da camada de BI, enquanto esta arquitetura define o caminho para a operação real e escalável da plataforma.'));

/* documento */
const doc = new Document({
  creator: 'Equipe Remio — TCC UNIFOR', title: 'Arquitetura, Segurança e Qualidade — Remio',
  styles: { default: { document: { run: { font: 'Arial', size: 22, color: GRAFITE } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 30, bold: true, font: 'Arial', color: LARANJA },
        paragraph: { spacing: { before: 320, after: 160 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LARANJA, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 25, bold: true, font: 'Arial', color: GRAFITE }, paragraph: { spacing: { before: 220, after: 100 }, outlineLevel: 1 } }
    ] },
  numbering: { config: [ { reference: 'bullets', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 540, hanging: 260 } } } }] } ] },
  sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [ new Paragraph({ alignment: AlignmentType.CENTER,
      children: [txt('Remio — Arquitetura, Segurança e Qualidade  |  ', { size: 16, color: '9CA3AF' }), txt('Página ', { size: 16, color: '9CA3AF' }), new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '9CA3AF' })] }) ] }) },
    children: [...capa, ...corpo] }]
});
Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, '..', 'docs', 'Remio - Arquitetura, Seguranca e Qualidade.docx');
  fs.writeFileSync(out, buf);
  console.log('OK:', out);
});
