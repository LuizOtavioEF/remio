/* ============================================================
   REMIO — Banco de dados simulado (dados.js)
   ------------------------------------------------------------
   Em um sistema real, estas informações viriam de um banco de
   dados (ex.: PostgreSQL ou Firebase) por meio de uma API.
   Para o protótipo do TCC, os dados ficam embutidos aqui.
   ============================================================ */

/* ---------- Categorias de serviços domésticos ---------- */
const CATEGORIAS = [
  { id: 'faxina',        nome: 'Faxina',             icone: 'sparkles'  },
  { id: 'eletrica',      nome: 'Elétrica',           icone: 'zap'       },
  { id: 'hidraulica',    nome: 'Hidráulica',         icone: 'droplets'  },
  { id: 'pintura',       nome: 'Pintura',            icone: 'paintbrush'},
  { id: 'pedreiro',      nome: 'Pedreiro',           icone: 'hammer'    },
  { id: 'jardinagem',    nome: 'Jardinagem',         icone: 'leaf'      },
  { id: 'arcondicionado',nome: 'Ar-condicionado',    icone: 'snowflake' },
  { id: 'montagem',      nome: 'Montagem de Móveis', icone: 'wrench'    }
];

/* ---------- Profissionais cadastrados ----------
   faixaPreco: 1 = $ (mais em conta) | 2 = $$ | 3 = $$$ (premium) */
const PROFISSIONAIS = [
  {
    id: 1, nome: 'Maria das Graças Silva', foto: 'https://i.pravatar.cc/150?img=47',
    categorias: ['faxina'], cidade: 'Fortaleza, CE', nota: 4.9, numAvaliacoes: 132,
    anosExp: 8, faixaPreco: 1, precoMedio: 140, verificado: true, pro: true,
    bio: 'Especialista em limpeza residencial e pós-obra. Atendimento pontual, produtos próprios e atenção aos detalhes.',
    qualificacoes: ['Curso de Limpeza Profissional — SENAC', 'Certificado de Limpeza Pós-Obra', '8 anos de experiência'],
    galeria: [
      { titulo: 'Faxina pós-obra', icone: 'sparkles' },
      { titulo: 'Limpeza de apartamento', icone: 'home' },
      { titulo: 'Higienização de estofados', icone: 'armchair' }
    ],
    avaliacoes: [
      { cliente: 'Renata M.', nota: 5, texto: 'Impecável! Deixou o apartamento brilhando após a reforma.', data: '02/06/2026' },
      { cliente: 'Paulo H.', nota: 5, texto: 'Muito pontual e caprichosa. Já é a terceira vez que contrato.', data: '18/05/2026' },
      { cliente: 'Carla S.', nota: 4, texto: 'Ótimo serviço, recomendo.', data: '30/04/2026' }
    ]
  },
  {
    id: 2, nome: 'Carlos Eduardo Lima', foto: 'https://i.pravatar.cc/150?img=12',
    categorias: ['eletrica'], cidade: 'Fortaleza, CE', nota: 4.8, numAvaliacoes: 98,
    anosExp: 12, faixaPreco: 2, precoMedio: 220, verificado: true, pro: true,
    bio: 'Eletricista com formação técnica. Instalações, reparos, quadros de distribuição e laudos elétricos residenciais.',
    qualificacoes: ['Técnico em Eletrotécnica — IFCE', 'NR-10 atualizada', '12 anos de experiência'],
    galeria: [
      { titulo: 'Troca de quadro elétrico', icone: 'zap' },
      { titulo: 'Instalação de chuveiro', icone: 'shower-head' },
      { titulo: 'Iluminação de sala', icone: 'lamp' }
    ],
    avaliacoes: [
      { cliente: 'José A.', nota: 5, texto: 'Resolveu um problema que outros dois eletricistas não acharam.', data: '05/06/2026' },
      { cliente: 'Mariana F.', nota: 5, texto: 'Trabalho limpo e organizado. Explicou tudo o que fez.', data: '22/05/2026' },
      { cliente: 'Tiago R.', nota: 4, texto: 'Bom serviço, chegou no horário.', data: '10/05/2026' }
    ]
  },
  {
    id: 3, nome: 'Francisco Assis Pereira', foto: 'https://i.pravatar.cc/150?img=53',
    categorias: ['pedreiro', 'pintura'], cidade: 'Caucaia, CE', nota: 4.7, numAvaliacoes: 75,
    anosExp: 15, faixaPreco: 1, precoMedio: 180, verificado: true, pro: false,
    bio: 'Pedreiro e pintor com 15 anos de obra. Reformas, assentamento de piso, reboco, alvenaria e pintura interna e externa.',
    qualificacoes: ['Curso de Assentamento Cerâmico — SENAI', '15 anos de experiência em reformas'],
    galeria: [
      { titulo: 'Reforma de banheiro', icone: 'bath' },
      { titulo: 'Assentamento de porcelanato', icone: 'grid-3x3' },
      { titulo: 'Pintura externa', icone: 'paintbrush' }
    ],
    avaliacoes: [
      { cliente: 'Davi L.', nota: 5, texto: 'Reformou meu banheiro inteiro, ficou excelente e dentro do prazo.', data: '28/05/2026' },
      { cliente: 'Aline C.', nota: 4, texto: 'Bom acabamento e preço justo.', data: '14/05/2026' }
    ]
  },
  {
    id: 4, nome: 'Antônia Rodrigues', foto: 'https://i.pravatar.cc/150?img=44',
    categorias: ['faxina', 'jardinagem'], cidade: 'Fortaleza, CE', nota: 4.6, numAvaliacoes: 54,
    anosExp: 6, faixaPreco: 1, precoMedio: 120, verificado: true, pro: false,
    bio: 'Diarista e jardineira. Cuido da sua casa por dentro e por fora, com carinho e dedicação.',
    qualificacoes: ['Curso de Jardinagem Básica', '6 anos de experiência'],
    galeria: [
      { titulo: 'Limpeza semanal', icone: 'sparkles' },
      { titulo: 'Manutenção de jardim', icone: 'leaf' }
    ],
    avaliacoes: [
      { cliente: 'Beatriz N.', nota: 5, texto: 'Cuida do meu jardim há 1 ano, sempre perfeito.', data: '01/06/2026' },
      { cliente: 'Rodrigo P.', nota: 4, texto: 'Serviço bom e preço acessível.', data: '12/05/2026' }
    ]
  },
  {
    id: 5, nome: 'João Batista Sousa', foto: 'https://i.pravatar.cc/150?img=60',
    categorias: ['hidraulica'], cidade: 'Fortaleza, CE', nota: 4.9, numAvaliacoes: 143,
    anosExp: 20, faixaPreco: 2, precoMedio: 250, verificado: true, pro: true,
    bio: 'Encanador profissional. Caça-vazamentos com equipamento eletrônico, desentupimento e instalações hidráulicas completas.',
    qualificacoes: ['Curso de Instalações Hidráulicas — SENAI', 'Equipamento de detecção eletrônica de vazamentos', '20 anos de experiência'],
    galeria: [
      { titulo: 'Caça-vazamento', icone: 'search' },
      { titulo: 'Troca de tubulação', icone: 'droplets' },
      { titulo: 'Instalação de caixa d’água', icone: 'container' }
    ],
    avaliacoes: [
      { cliente: 'Fernando G.', nota: 5, texto: 'Achou o vazamento sem quebrar nada. Equipamento de primeira.', data: '06/06/2026' },
      { cliente: 'Lúcia M.', nota: 5, texto: 'Profissional experiente, resolveu rápido.', data: '25/05/2026' },
      { cliente: 'André V.', nota: 5, texto: 'O melhor encanador que já contratei.', data: '11/05/2026' }
    ]
  },
  {
    id: 6, nome: 'Rafael Monteiro', foto: 'https://i.pravatar.cc/150?img=14',
    categorias: ['arcondicionado'], cidade: 'Fortaleza, CE', nota: 4.8, numAvaliacoes: 87,
    anosExp: 9, faixaPreco: 3, precoMedio: 380, verificado: true, pro: true,
    bio: 'Técnico em refrigeração. Instalação, manutenção preventiva e higienização de ar-condicionado split e multi-split.',
    qualificacoes: ['Técnico em Refrigeração — SENAI', 'Credenciado pelas principais marcas', '9 anos de experiência'],
    galeria: [
      { titulo: 'Instalação de split', icone: 'snowflake' },
      { titulo: 'Higienização completa', icone: 'wind' },
      { titulo: 'Manutenção preventiva', icone: 'settings' }
    ],
    avaliacoes: [
      { cliente: 'Patrícia O.', nota: 5, texto: 'Instalação perfeita, sem sujeira e com garantia.', data: '04/06/2026' },
      { cliente: 'Gustavo T.', nota: 4, texto: 'Excelente técnico, valor um pouco acima da média mas vale.', data: '20/05/2026' }
    ]
  },
  {
    id: 7, nome: 'Sandra Regina Alves', foto: 'https://i.pravatar.cc/150?img=32',
    categorias: ['pintura'], cidade: 'Maracanaú, CE', nota: 4.5, numAvaliacoes: 39,
    anosExp: 7, faixaPreco: 1, precoMedio: 160, verificado: true, pro: false,
    bio: 'Pintora residencial. Pintura interna, texturas, grafiato e pequenos reparos de massa corrida.',
    qualificacoes: ['Curso de Pintura Decorativa', '7 anos de experiência'],
    galeria: [
      { titulo: 'Pintura de quarto infantil', icone: 'baby' },
      { titulo: 'Grafiato em fachada', icone: 'paintbrush' }
    ],
    avaliacoes: [
      { cliente: 'Camila B.', nota: 5, texto: 'Adorei o resultado do quarto do meu filho!', data: '29/05/2026' },
      { cliente: 'Sérgio K.', nota: 4, texto: 'Trabalho bem feito.', data: '15/05/2026' }
    ]
  },
  {
    id: 8, nome: 'Pedro Henrique Costa', foto: 'https://i.pravatar.cc/150?img=68',
    categorias: ['montagem'], cidade: 'Fortaleza, CE', nota: 4.7, numAvaliacoes: 66,
    anosExp: 5, faixaPreco: 1, precoMedio: 110, verificado: true, pro: false,
    bio: 'Montador de móveis. Guarda-roupas, cozinhas planejadas, camas e móveis de escritório. Atendo no mesmo dia.',
    qualificacoes: ['Montador credenciado de grandes lojas', '5 anos de experiência'],
    galeria: [
      { titulo: 'Cozinha planejada', icone: 'chef-hat' },
      { titulo: 'Guarda-roupa 6 portas', icone: 'door-closed' },
      { titulo: 'Home office', icone: 'monitor' }
    ],
    avaliacoes: [
      { cliente: 'Vanessa R.', nota: 5, texto: 'Montou o guarda-roupa em 2 horas, super rápido.', data: '03/06/2026' },
      { cliente: 'Igor S.', nota: 4, texto: 'Bom custo-benefício.', data: '21/05/2026' }
    ]
  },
  {
    id: 9, nome: 'Luciana Ferreira', foto: 'https://i.pravatar.cc/150?img=24',
    categorias: ['faxina'], cidade: 'Eusébio, CE', nota: 5.0, numAvaliacoes: 28,
    anosExp: 4, faixaPreco: 2, precoMedio: 190, verificado: true, pro: false,
    bio: 'Limpeza premium para casas de alto padrão e condomínios. Equipe própria e produtos hipoalergênicos.',
    qualificacoes: ['Equipe com 3 profissionais', 'Produtos hipoalergênicos certificados'],
    galeria: [
      { titulo: 'Limpeza de casa de praia', icone: 'umbrella' },
      { titulo: 'Faxina de condomínio', icone: 'building-2' }
    ],
    avaliacoes: [
      { cliente: 'Helena D.', nota: 5, texto: 'Serviço de altíssimo nível, equipe educada e eficiente.', data: '07/06/2026' },
      { cliente: 'Marcos A.', nota: 5, texto: 'Perfeito do início ao fim.', data: '26/05/2026' }
    ]
  },
  {
    id: 10, nome: 'Marcos Vinícius Teles', foto: 'https://i.pravatar.cc/150?img=59',
    categorias: ['eletrica', 'arcondicionado'], cidade: 'Fortaleza, CE', nota: 4.6, numAvaliacoes: 52,
    anosExp: 11, faixaPreco: 2, precoMedio: 240, verificado: false, pro: false,
    bio: 'Eletricista e técnico em climatização. Atendo emergências elétricas e instalação de ar-condicionado.',
    qualificacoes: ['NR-10', 'Curso de Climatização Residencial', '11 anos de experiência'],
    galeria: [
      { titulo: 'Reparo emergencial', icone: 'zap' },
      { titulo: 'Instalação de ar split', icone: 'snowflake' }
    ],
    avaliacoes: [
      { cliente: 'Roberta L.', nota: 5, texto: 'Atendeu no domingo à noite, salvou a gente!', data: '31/05/2026' },
      { cliente: 'Caio M.', nota: 4, texto: 'Rápido e eficiente.', data: '17/05/2026' }
    ]
  },
  {
    id: 11, nome: 'José Ribamar Santos', foto: 'https://i.pravatar.cc/150?img=51',
    categorias: ['pedreiro', 'hidraulica'], cidade: 'Caucaia, CE', nota: 4.8, numAvaliacoes: 110,
    anosExp: 18, faixaPreco: 2, precoMedio: 270, verificado: true, pro: true,
    bio: 'Mestre de obras. Reformas completas, ampliações, muros, calçadas e instalações hidráulicas em geral.',
    qualificacoes: ['Mestre de obras com ART', '18 anos de experiência', 'Equipe própria'],
    galeria: [
      { titulo: 'Ampliação de cozinha', icone: 'expand' },
      { titulo: 'Construção de muro', icone: 'brick-wall' },
      { titulo: 'Calçada nova', icone: 'footprints' }
    ],
    avaliacoes: [
      { cliente: 'Eduardo F.', nota: 5, texto: 'Fez a ampliação da minha casa. Trabalho sério e honesto.', data: '08/06/2026' },
      { cliente: 'Simone V.', nota: 5, texto: 'Equipe organizada, obra entregue no prazo.', data: '23/05/2026' }
    ]
  },
  {
    id: 12, nome: 'Fernanda Lopes', foto: 'https://i.pravatar.cc/150?img=26',
    categorias: ['jardinagem'], cidade: 'Fortaleza, CE', nota: 4.9, numAvaliacoes: 45,
    anosExp: 6, faixaPreco: 3, precoMedio: 320, verificado: true, pro: false,
    bio: 'Paisagista e jardineira. Projetos de paisagismo, jardins verticais, hortas residenciais e manutenção mensal.',
    qualificacoes: ['Graduação em Agronomia — UFC', 'Especialização em Paisagismo'],
    galeria: [
      { titulo: 'Jardim vertical', icone: 'sprout' },
      { titulo: 'Projeto de paisagismo', icone: 'trees' },
      { titulo: 'Horta residencial', icone: 'carrot' }
    ],
    avaliacoes: [
      { cliente: 'Larissa Q.', nota: 5, texto: 'Transformou minha varanda em um jardim lindo!', data: '05/06/2026' },
      { cliente: 'Otávio B.', nota: 5, texto: 'Projeto incrível, vale cada centavo.', data: '19/05/2026' }
    ]
  }
];

/* ---------- Empresas parceiras (lojas e fornecedores) ---------- */
const PARCEIROS = [
  {
    id: 1, nome: 'Casa do Construtor Aldeota', segmentos: ['Materiais de Construção', 'Ferramentas'],
    cidade: 'Fortaleza, CE', nota: 4.8, verificado: true, icone: 'store',
    descricao: 'Tudo para sua obra: cimento, areia, ferragens e aluguel de ferramentas profissionais.'
  },
  {
    id: 2, nome: 'Eletro Fortal', segmentos: ['Material Elétrico'],
    cidade: 'Fortaleza, CE', nota: 4.7, verificado: true, icone: 'plug',
    descricao: 'Fios, disjuntores, luminárias e automação residencial com entrega rápida.'
  },
  {
    id: 3, nome: 'HidroNorte', segmentos: ['Materiais Hidráulicos'],
    cidade: 'Caucaia, CE', nota: 4.6, verificado: true, icone: 'droplets',
    descricao: 'Tubos, conexões, caixas d’água e bombas. Atacado e varejo.'
  },
  {
    id: 4, nome: 'Tintas & Cia', segmentos: ['Tintas e Acabamentos'],
    cidade: 'Fortaleza, CE', nota: 4.9, verificado: true, icone: 'palette',
    descricao: 'As melhores marcas de tintas com consultoria de cores gratuita.'
  },
  {
    id: 5, nome: 'Jardim Verde Paisagismo', segmentos: ['Jardinagem'],
    cidade: 'Eusébio, CE', nota: 4.8, verificado: true, icone: 'leaf',
    descricao: 'Mudas, substratos, vasos e tudo para seu jardim ficar mais bonito.'
  },
  {
    id: 6, nome: 'ClimaFrio Refrigeração', segmentos: ['Climatização'],
    cidade: 'Maracanaú, CE', nota: 4.5, verificado: false, icone: 'snowflake',
    descricao: 'Distribuidora de ar-condicionado e peças de refrigeração.'
  }
];

/* ---------- Pedidos iniciais do cliente (semente) ----------
   status possíveis: aguardando | orcamento | agendado | concluido | avaliado */
const PEDIDOS_INICIAIS = [
  {
    id: 1, titulo: 'Faxina completa pós-obra', profissionalId: 1,
    categoria: 'faxina', status: 'orcamento', valor: 180,
    data: '15/06/2026', endereco: 'Av. Beira Mar, 1500 — Meireles',
    descricao: 'Apartamento de 90m² recém-reformado, precisa de limpeza pesada.'
  },
  {
    id: 2, titulo: 'Instalação de chuveiro elétrico', profissionalId: 2,
    categoria: 'eletrica', status: 'agendado', valor: 150,
    data: '12/06/2026', endereco: 'Rua Padre Valdevino, 800 — Aldeota',
    descricao: 'Trocar chuveiro antigo por modelo eletrônico 7500W.'
  },
  {
    id: 3, titulo: 'Pintura da sala e corredor', profissionalId: 7,
    categoria: 'pintura', status: 'concluido', valor: 850,
    data: '02/06/2026', endereco: 'Rua Coronel Jucá, 250 — Dionísio Torres',
    descricao: 'Pintura de sala 30m² e corredor, cor fendi, com massa corrida.'
  },
  {
    id: 4, titulo: 'Montagem de guarda-roupa 6 portas', profissionalId: 8,
    categoria: 'montagem', status: 'avaliado', valor: 120, notaDada: 5,
    data: '20/05/2026', endereco: 'Av. Washington Soares, 3000 — Edson Queiroz',
    descricao: 'Guarda-roupa novo, na caixa, com espelho.'
  },
  {
    id: 5, titulo: 'Reparo de vazamento na cozinha', profissionalId: 5,
    categoria: 'hidraulica', status: 'aguardando', valor: null,
    data: '09/06/2026', endereco: 'Rua Vicente Leite, 1200 — Aldeota',
    descricao: 'Vazamento embaixo da pia, possivelmente no sifão ou na tubulação.'
  }
];

/* ---------- Dados de BI (indicadores simulados) ----------
   Estes números alimentam os dashboards. No sistema real seriam
   calculados por um pipeline de Big Data (eventos -> data warehouse -> BI). */
const MESES = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun'];

const BI = {
  cliente: {
    kpis: { totalGasto: 2840, pedidosRealizados: 14, notaMediaDada: 4.7, economiaEstimativa: 430 },
    gastosMensais: [380, 520, 410, 615, 480, 435],
    porCategoria: { 'Faxina': 6, 'Elétrica': 3, 'Pintura': 2, 'Hidráulica': 2, 'Montagem': 1 }
  },
  prestador: {
    kpis: { faturamentoMes: 4350, servicosConcluidos: 23, notaMedia: 4.8, taxaConversao: 68 },
    faturamentoMensal: [2800, 3150, 3600, 3300, 3980, 4350],
    demandaPorServico: { 'Faxina residencial': 11, 'Faxina pós-obra': 6, 'Limpeza de estofados': 4, 'Limpeza de condomínio': 2 },
    // Matriz de horários de pico: dias (Seg-Dom) x períodos (Manhã, Tarde, Noite)
    // valores de 0 a 10 (intensidade da demanda)
    horariosPico: {
      dias: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
      periodos: ['Manhã', 'Tarde', 'Noite'],
      valores: [
        [8, 5, 1],   // Seg
        [6, 4, 1],   // Ter
        [7, 5, 2],   // Qua
        [6, 6, 2],   // Qui
        [9, 7, 3],   // Sex
        [10, 8, 4],  // Sáb
        [3, 2, 1]    // Dom
      ]
    },
    precoComparativo: { seuPreco: 140, mediaCategoria: 165 }
  },
  parceiro: {
    kpis: { indicacoesMes: 86, contatosGerados: 54, taxaContato: 63, notaMedia: 4.8 },
    contatosMensais: [28, 35, 41, 38, 49, 54],
    porSegmento: { 'Materiais de Construção': 22, 'Ferramentas': 14, 'Tintas': 10, 'Elétrica': 8 }
  }
};

/* ---------- Funções auxiliares de consulta ---------- */
function buscarProfissional(id) {
  return PROFISSIONAIS.find(p => p.id === Number(id));
}

function nomeCategoria(id) {
  const cat = CATEGORIAS.find(c => c.id === id);
  return cat ? cat.nome : id;
}

/* Converte a faixa de preço numérica (1-3) em símbolos $ */
function simboloPreco(faixa) {
  return '$'.repeat(faixa);
}
