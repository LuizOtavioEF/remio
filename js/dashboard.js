/* ============================================================
   REMIO — Dashboards de BI (dashboard.js)
   ------------------------------------------------------------
   Renderiza o painel de indicadores conforme o papel logado:
   cliente, prestador ou empresa parceira. Gráficos com Chart.js.
   No sistema real, os números viriam de um pipeline de Big Data
   (eventos da plataforma -> data warehouse -> camada de BI).
   ============================================================ */

/* Paleta dos gráficos, alinhada à identidade visual */
const CORES = {
  laranja: '#f97316',
  laranjaClaro: 'rgba(249, 115, 22, .15)',
  ambar: '#f59e0b',
  grafite: '#1f2937',
  verde: '#10b981',
  azul: '#3b82f6',
  cinza: '#9ca3af',
  paleta: ['#f97316', '#f59e0b', '#1f2937', '#10b981', '#3b82f6', '#8b5cf6']
};

/* Configuração global do Chart.js */
function configurarCharts() {
  if (SEM_ANIMACAO) Chart.defaults.animation = false;
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
  Chart.defaults.color = '#6b7280';
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.boxWidth = 8;
}

/* Sem animação quando a página é aberta por captura automatizada
   (headless) ou com ?print na URL — os valores aparecem direto */
const SEM_ANIMACAO = navigator.webdriver || new URLSearchParams(window.location.search).has('print');

/* Contador animado dos KPIs (efeito de subida até o valor) */
function animarContador(el, valorFinal, prefixo = '', sufixo = '') {
  if (SEM_ANIMACAO) {
    el.textContent = `${prefixo}${valorFinal.toLocaleString('pt-BR')}${sufixo}`;
    return;
  }
  const duracao = 1100;
  const inicio = performance.now();
  function passo(agora) {
    const progresso = Math.min((agora - inicio) / duracao, 1);
    const suave = 1 - Math.pow(1 - progresso, 3); // easing cúbico
    const atual = Math.round(valorFinal * suave);
    el.textContent = `${prefixo}${atual.toLocaleString('pt-BR')}${sufixo}`;
    if (progresso < 1) requestAnimationFrame(passo);
  }
  requestAnimationFrame(passo);
}

function kpiHTML(iconeNome, valor, rotulo, prefixo = '', sufixo = '', variacao = '', decimal = false) {
  return `
    <div class="kpi">
      <div class="kpi-icone">${icone(iconeNome)}</div>
      <strong data-valor="${valor}" data-prefixo="${prefixo}" data-sufixo="${sufixo}" ${decimal ? 'data-decimal="1"' : ''}>0</strong>
      <small>${rotulo}${variacao ? `<span class="variacao">${variacao}</span>` : ''}</small>
    </div>`;
}

function graficoCardHTML(id, titulo, iconeNome, largo = false) {
  return `
    <div class="grafico-card ${largo ? 'largo' : ''}">
      <h3>${icone(iconeNome)} ${titulo}</h3>
      <canvas id="${id}"></canvas>
    </div>`;
}

/* ============ DASHBOARD DO CLIENTE ============ */
function dashCliente() {
  const d = BI.cliente;
  return {
    titulo: 'Meu painel',
    subtitulo: 'Acompanhe seus gastos, contratações e avaliações na Remio.',
    kpis: `
      ${kpiHTML('wallet', d.kpis.totalGasto, 'Total investido em serviços (6 meses)', 'R$ ')}
      ${kpiHTML('clipboard-list', d.kpis.pedidosRealizados, 'Serviços contratados', '', '', '+3 este mês')}
      ${kpiHTML('star', d.kpis.notaMediaDada * 10, 'Nota média que você dá', '', '', '', true)}
      ${kpiHTML('piggy-bank', d.kpis.economiaEstimativa, 'Economia com a faixa de preço $', 'R$ ')}`,
    graficos: `
      ${graficoCardHTML('g1', 'Gastos por mês (R$)', 'trending-up')}
      ${graficoCardHTML('g2', 'Contratações por categoria', 'chart-pie')}`,
    montar() {
      new Chart($('#g1'), {
        type: 'line',
        data: {
          labels: MESES,
          datasets: [{
            label: 'Gastos (R$)',
            data: d.gastosMensais,
            borderColor: CORES.laranja,
            backgroundColor: CORES.laranjaClaro,
            fill: true, tension: .4,
            pointBackgroundColor: CORES.laranja, pointRadius: 5
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });

      new Chart($('#g2'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(d.porCategoria),
          datasets: [{ data: Object.values(d.porCategoria), backgroundColor: CORES.paleta, borderWidth: 0 }]
        },
        options: { cutout: '62%', plugins: { legend: { position: 'right' } } }
      });
    }
  };
}

/* ============ DASHBOARD DO PRESTADOR ============ */
function dashPrestador() {
  const d = BI.prestador;
  return {
    titulo: 'Painel do prestador',
    subtitulo: 'Indicadores do seu desempenho na plataforma — faturamento, demanda e posicionamento de preço.',
    kpis: `
      ${kpiHTML('wallet', d.kpis.faturamentoMes, 'Faturamento em junho', 'R$ ', '', '+9,3%')}
      ${kpiHTML('check-circle', d.kpis.servicosConcluidos, 'Serviços concluídos no mês')}
      ${kpiHTML('star', d.kpis.notaMedia * 10, 'Nota média dos clientes', '', '', '', true)}
      ${kpiHTML('percent', d.kpis.taxaConversao, 'Orçamentos que viram contratos', '', '%')}`,
    graficos: `
      ${graficoCardHTML('g1', 'Evolução do faturamento (R$)', 'trending-up', true)}
      ${graficoCardHTML('g2', 'Demanda por tipo de serviço', 'chart-bar')}
      ${graficoCardHTML('g3', 'Seu preço vs. média da categoria (R$)', 'scale')}
      <div class="grafico-card largo">
        <h3>${icone('clock')} Horários de pico da demanda</h3>
        <div class="heatmap" id="heatmap"></div>
      </div>`,
    montar() {
      new Chart($('#g1'), {
        type: 'line',
        data: {
          labels: MESES,
          datasets: [{
            label: 'Faturamento (R$)',
            data: d.faturamentoMensal,
            borderColor: CORES.laranja,
            backgroundColor: CORES.laranjaClaro,
            fill: true, tension: .4,
            pointBackgroundColor: CORES.laranja, pointRadius: 5
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });

      new Chart($('#g2'), {
        type: 'bar',
        data: {
          labels: Object.keys(d.demandaPorServico),
          datasets: [{
            label: 'Pedidos',
            data: Object.values(d.demandaPorServico),
            backgroundColor: [CORES.laranja, CORES.ambar, CORES.grafite, CORES.cinza],
            borderRadius: 10
          }]
        },
        options: { indexAxis: 'y', plugins: { legend: { display: false } } }
      });

      // Posicionamento de preço: insight para o prestador se ajustar ao mercado
      new Chart($('#g3'), {
        type: 'bar',
        data: {
          labels: ['Seu preço médio', 'Média da categoria'],
          datasets: [{
            data: [d.precoComparativo.seuPreco, d.precoComparativo.mediaCategoria],
            backgroundColor: [CORES.verde, CORES.cinza],
            borderRadius: 10, barThickness: 56
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });

      // Mapa de calor: dias da semana x períodos do dia
      const hm = d.horariosPico;
      let html = '<div class="hm-rotulo"></div>' +
        hm.dias.map(dia => `<div class="hm-rotulo">${dia}</div>`).join('');
      hm.periodos.forEach((periodo, linha) => {
        html += `<div class="hm-rotulo">${periodo}</div>`;
        hm.dias.forEach((_, coluna) => {
          const valor = hm.valores[coluna][linha];
          const alfa = .08 + (valor / 10) * .85;
          html += `<div class="hm-celula" style="background:rgba(249,115,22,${alfa.toFixed(2)})"
                     title="${hm.dias[coluna]} ${periodo}: intensidade ${valor}/10">${valor}</div>`;
        });
      });
      $('#heatmap').innerHTML = html;
    }
  };
}

/* ============ DASHBOARD DA EMPRESA PARCEIRA ============ */
function dashParceiro() {
  const d = BI.parceiro;
  return {
    titulo: 'Painel da empresa parceira',
    subtitulo: 'Resultados da sua loja dentro do ecossistema Remio — indicações, contatos e desempenho.',
    kpis: `
      ${kpiHTML('megaphone', d.kpis.indicacoesMes, 'Indicações recebidas no mês', '', '', '+12%')}
      ${kpiHTML('users', d.kpis.contatosGerados, 'Contatos de clientes gerados')}
      ${kpiHTML('percent', d.kpis.taxaContato, 'Indicações que viram contato', '', '%')}
      ${kpiHTML('star', d.kpis.notaMedia * 10, 'Avaliação média da loja', '', '', '', true)}`,
    graficos: `
      ${graficoCardHTML('g1', 'Contatos gerados por mês', 'trending-up', true)}
      ${graficoCardHTML('g2', 'Interesse por segmento', 'chart-pie')}
      ${graficoCardHTML('g3', 'Funil do mês: indicação → contato → venda', 'filter')}`,
    montar() {
      new Chart($('#g1'), {
        type: 'bar',
        data: {
          labels: MESES,
          datasets: [{
            label: 'Contatos',
            data: d.contatosMensais,
            backgroundColor: CORES.laranja,
            borderRadius: 10
          }]
        },
        options: { plugins: { legend: { display: false } } }
      });

      new Chart($('#g2'), {
        type: 'doughnut',
        data: {
          labels: Object.keys(d.porSegmento),
          datasets: [{ data: Object.values(d.porSegmento), backgroundColor: CORES.paleta, borderWidth: 0 }]
        },
        options: { cutout: '62%', plugins: { legend: { position: 'right' } } }
      });

      new Chart($('#g3'), {
        type: 'bar',
        data: {
          labels: ['Indicações', 'Contatos', 'Vendas estimadas'],
          datasets: [{
            data: [d.kpis.indicacoesMes, d.kpis.contatosGerados, 31],
            backgroundColor: [CORES.laranja, CORES.ambar, CORES.verde],
            borderRadius: 10
          }]
        },
        options: { indexAxis: 'y', plugins: { legend: { display: false } } }
      });
    }
  };
}

/* ============ MONTAGEM DA PÁGINA ============ */
document.addEventListener('DOMContentLoaded', () => {
  const alvo = $('#dash-conteudo');
  const papel = papelAtual();

  // Sem login: convida o usuário a entrar para ver o painel
  if (!papel) {
    alvo.innerHTML = `
      <div class="vazio" style="padding:110px 20px">
        ${icone('lock')}
        <strong>Faça login para ver seu painel de indicadores</strong>
        Escolha um perfil (cliente, prestador ou empresa parceira) para explorar o BI da Remio.
        <div style="margin-top:22px">
          <a href="login.html" class="btn btn-primario">${icone('log-in')} Entrar na plataforma</a>
        </div>
      </div>`;
    renderIcones();
    return;
  }

  configurarCharts();

  const paineis = { cliente: dashCliente, prestador: dashPrestador, parceiro: dashParceiro };
  const painel = paineis[papel]();

  alvo.innerHTML = `
    <div class="dash-cabecalho">
      <span class="papel-tag">${icone(PAPEIS[papel].icone)} ${PAPEIS[papel].rotulo}</span>
      <h1>${painel.titulo}</h1>
      <p>${painel.subtitulo}</p>
    </div>
    <div class="grade-kpis">${painel.kpis}</div>
    <div class="grade-graficos">${painel.graficos}</div>`;

  renderIcones();
  painel.montar();

  // Anima os contadores dos KPIs
  $$('.kpi strong').forEach(el => {
    const bruto = Number(el.dataset.valor);
    const decimal = el.dataset.decimal === '1';
    if (decimal && SEM_ANIMACAO) {
      el.textContent = (bruto / 10).toFixed(1).replace('.', ',');
    } else if (decimal) {
      // Valores com casa decimal (ex.: nota 4.7) são animados em décimos
      const duracao = 1100, inicio = performance.now();
      function passo(agora) {
        const p = Math.min((agora - inicio) / duracao, 1);
        const suave = 1 - Math.pow(1 - p, 3);
        el.textContent = ((bruto * suave) / 10).toFixed(1).replace('.', ',');
        if (p < 1) requestAnimationFrame(passo);
      }
      requestAnimationFrame(passo);
    } else {
      animarContador(el, bruto, el.dataset.prefixo, el.dataset.sufixo);
    }
  });
});
