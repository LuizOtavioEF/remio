/* Gera o DOCX com os prints das principais páginas do site Remio. */
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, AlignmentType,
  HeadingLevel, BorderStyle, PageBreak, PageNumber, Footer, ExternalHyperlink,
  TableOfContents
} = require('docx');

const LARANJA = 'EA580C';
const GRAFITE = '1F2937';
const PRINTS = path.join(__dirname, '..', 'prints');

const txt = (text, opts = {}) => new TextRun({ text, ...opts });

/* dimensões reais dos PNG e escala para caber na página (máx 624 x 760 px) */
function dims(file) {
  const b = fs.readFileSync(path.join(PRINTS, file));
  const w = b.readUInt32BE(16), h = b.readUInt32BE(20);
  const escala = Math.min(624 / w, 760 / h);
  return { data: b, width: Math.round(w * escala), height: Math.round(h * escala) };
}

/* uma figura por página: legenda (heading) + imagem + descrição */
function figura(n, file, titulo, descricao, primeira = false) {
  const d = dims(file);
  const blocos = [];
  if (!primeira) blocos.push(new Paragraph({ children: [new PageBreak()] }));
  blocos.push(new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [txt(`Figura ${n} — ${titulo}`)],
    spacing: { before: 0, after: 160 }
  }));
  blocos.push(new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { after: 120 },
    children: [new ImageRun({
      type: 'png', data: d.data,
      transformation: { width: d.width, height: d.height },
      altText: { title: titulo, description: descricao, name: `figura-${n}` }
    })]
  }));
  blocos.push(new Paragraph({
    alignment: AlignmentType.JUSTIFIED,
    spacing: { after: 0, line: 276 },
    children: [txt(descricao, { size: 20, color: '4B5563' })]
  }));
  return blocos;
}

/* ---------- capa ---------- */
const capa = [
  new Paragraph({ spacing: { before: 1800 } }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
    children: [txt('REMIO', { bold: true, size: 72, color: LARANJA })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [txt('Plataforma de Serviços Domésticos', { size: 28, color: GRAFITE })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 120 },
    children: [txt('PROTÓTIPO DO SITE — PRINCIPAIS TELAS', { bold: true, size: 36, color: GRAFITE })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 1200 },
    children: [txt('Capturas de tela das páginas desenvolvidas', { size: 24, color: '6B7280' })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
    children: [txt('Trabalho de Conclusão de Curso', { size: 24, color: GRAFITE })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 80 },
    children: [txt('MBA em Gestão Analítica com BI e Big Data', { size: 24, color: GRAFITE })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 600 },
    children: [txt('Universidade de Fortaleza — UNIFOR', { size: 24, color: GRAFITE })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 60 },
    children: [txt('Acesse o site: ', { size: 22, color: '6B7280' }),
      new ExternalHyperlink({ link: 'https://luizotavioef.github.io/remio/',
        children: [txt('luizotavioef.github.io/remio', { style: 'Hyperlink', size: 22 })] })] }),
  new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 800 },
    children: [txt('Fortaleza — CE, 2026', { size: 22, color: '6B7280' })] }),
  new Paragraph({ children: [new PageBreak()] })
];

/* ---------- introdução ---------- */
const intro = [
  new Paragraph({ heading: HeadingLevel.HEADING_1, children: [txt('Apresentação')],
    spacing: { after: 160 } }),
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 276 },
    children: [txt('Este documento reúne as capturas de tela das principais páginas do protótipo da plataforma Remio, um marketplace que conecta clientes a prestadores de serviços domésticos. As imagens demonstram a interface desenvolvida, a identidade visual adotada (laranja como cor principal, transmitindo o universo de serviços e construção) e as funcionalidades implementadas, incluindo os três painéis de Business Intelligence (BI).')] }),
  new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { after: 120, line: 276 },
    children: [txt('As telas a seguir foram capturadas diretamente do site em funcionamento, demonstrando a jornada completa do usuário — da busca por profissionais até o pagamento protegido e a análise de indicadores.')] }),
  new Paragraph({ children: [new PageBreak()] })
];

/* ---------- figuras ---------- */
const figuras = [
  ...figura(1, '01-home.png', 'Página inicial (Home)',
    'Tela de entrada da plataforma. Apresenta a busca principal por serviços, os atalhos para as categorias mais procuradas, o banner de publicação de pedidos, a grade completa de serviços domésticos, os profissionais em destaque e a seção "como funciona", que explica a jornada em três passos.', true),
  ...figura(2, '02-busca.png', 'Busca de profissionais',
    'Listagem de profissionais disponíveis com painel de filtros. O usuário pode refinar a busca por categoria, cidade, nota mínima e faixa de preço ($, $$ ou $$$), recurso inspirado em aplicativos como o iFood. Cada cartão exibe o selo de verificado, o badge PRO, a avaliação e a localização do profissional.'),
  ...figura(3, '03-perfil.png', 'Perfil do profissional',
    'Página detalhada do prestador de serviço, com biografia, estatísticas, galeria de trabalhos realizados, qualificações e avaliações de clientes anteriores. A partir desta tela, o usuário inicia a solicitação de orçamento e visualiza o selo de Pagamento Protegido.'),
  ...figura(4, '04-pedidos.png', 'Meus pedidos',
    'Acompanhamento dos pedidos do cliente, organizados por status: aguardando orçamento, orçamento recebido, agendado, concluído e avaliado. É nesta tela que ocorre o fluxo de Pagamento Protegido, no qual o valor fica retido pela plataforma até a confirmação da conclusão do serviço.'),
  ...figura(5, '05-parceiros.png', 'Empresas parceiras',
    'Catálogo de lojas e fornecedores parceiros, com busca e filtro por segmento (materiais de construção, ferramentas, tintas, elétrica, entre outros). Cada parceiro exibe o selo de verificado, a avaliação e os segmentos atendidos.'),
  ...figura(6, '06-login.png', 'Entrada e seleção de papel',
    'Tela de acesso à plataforma. O usuário escolhe como deseja utilizar o sistema — cliente, prestador ou empresa parceira — e a interface, em especial o painel de BI, adapta-se ao papel selecionado.'),
  ...figura(7, '07-dashboard-cliente.png', 'Painel de BI — Cliente',
    'Dashboard do cliente, com indicadores do seu uso da plataforma: total investido em serviços, número de contratações, nota média atribuída e economia estimada, além de gráficos de gastos por mês e de contratações por categoria.'),
  ...figura(8, '08-dashboard-prestador.png', 'Painel de BI — Prestador',
    'Dashboard do prestador, voltado à gestão do seu desempenho: faturamento mensal, serviços concluídos, nota média e taxa de conversão de orçamentos. Inclui o comparativo entre o preço do profissional e a média da categoria e um mapa de calor com os horários de pico da demanda.'),
  ...figura(9, '09-dashboard-parceiro.png', 'Painel de BI — Empresa Parceira',
    'Dashboard da empresa parceira, com os resultados da loja dentro do ecossistema Remio: indicações recebidas, contatos gerados, taxa de conversão e avaliação, além do funil que acompanha a jornada da indicação até a venda estimada.')
];

/* ---------- documento ---------- */
const doc = new Document({
  creator: 'Equipe Remio — TCC UNIFOR',
  title: 'Prototipo do Site — Principais Telas — Remio',
  styles: {
    default: { document: { run: { font: 'Arial', size: 22, color: GRAFITE } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { size: 26, bold: true, font: 'Arial', color: LARANJA },
        paragraph: { spacing: { before: 0, after: 160 }, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: LARANJA, space: 4 } } } }
    ]
  },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 },
      margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } },
    footers: { default: new Footer({ children: [ new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [txt('Remio — Protótipo do Site  |  ', { size: 16, color: '9CA3AF' }),
        txt('Página ', { size: 16, color: '9CA3AF' }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: '9CA3AF' })] }) ] }) },
    children: [...capa, ...intro, ...figuras]
  }]
});

Packer.toBuffer(doc).then(buf => {
  const out = path.join(__dirname, '..', 'docs', 'Remio - Prints das Principais Telas.docx');
  fs.writeFileSync(out, buf);
  console.log('OK:', out);
});
