/* ============================================================
   REMIO — Lógica da aplicação (app.js)
   ------------------------------------------------------------
   Responsável por: cabeçalho/rodapé dinâmicos, papel do usuário
   (cliente/prestador/parceiro via localStorage), busca e filtros,
   perfil, fluxo de orçamento, pedidos e Pagamento Protegido.
   ============================================================ */

/* ---------- Atalhos e utilidades ---------- */
const $ = (sel, raiz = document) => raiz.querySelector(sel);
const $$ = (sel, raiz = document) => [...raiz.querySelectorAll(sel)];

function icone(nome, classe = '') {
  return `<i data-lucide="${nome}" class="${classe}"></i>`;
}

function renderIcones() {
  if (window.lucide) lucide.createIcons();
}

function dinheiro(valor) {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* Toast de confirmação no rodapé da tela */
function toast(mensagem) {
  let el = $('#toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'aviso-toast';
    document.body.appendChild(el);
  }
  el.innerHTML = `${icone('check-circle')} ${mensagem}`;
  renderIcones();
  el.classList.add('visivel');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('visivel'), 3200);
}

/* ---------- Repositório de erros (observabilidade) ----------
   Captura erros de JavaScript em todo o site e os guarda no
   navegador, alimentando a tela de Monitoramento. É a versão
   didática do "repositório de erros" descrito na arquitetura. */
function registrarErro(mensagem, origem) {
  const erros = JSON.parse(localStorage.getItem('remio_erros') || '[]');
  erros.unshift({
    mensagem: String(mensagem).slice(0, 200),
    origem: origem || (location.pathname.split('/').pop() || 'index.html'),
    data: new Date().toLocaleString('pt-BR')
  });
  localStorage.setItem('remio_erros', JSON.stringify(erros.slice(0, 50))); // mantém os 50 mais recentes
}
window.addEventListener('error', e => registrarErro(e.message, e.filename ? e.filename.split('/').pop() : null));
window.addEventListener('unhandledrejection', e => registrarErro('Promise rejeitada: ' + (e.reason?.message || e.reason), null));

/* ---------- Sessão do usuário (papel + nome) ---------- */
const PAPEIS = {
  cliente:   { rotulo: 'Cliente',          icone: 'user' },
  prestador: { rotulo: 'Prestador',        icone: 'briefcase' },
  parceiro:  { rotulo: 'Empresa Parceira', icone: 'store' }
};

function papelAtual()  { return localStorage.getItem('remio_papel'); }
function nomeUsuario() { return localStorage.getItem('remio_nome') || 'Visitante'; }

function entrar(papel, nome) {
  localStorage.setItem('remio_papel', papel);
  localStorage.setItem('remio_nome', nome);
}

function sair() {
  localStorage.removeItem('remio_papel');
  localStorage.removeItem('remio_nome');
  window.location.href = 'index.html';
}

function iniciais(nome) {
  return nome.trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase();
}

/* ---------- Pedidos (persistidos no navegador) ---------- */
function carregarPedidos() {
  const salvos = localStorage.getItem('remio_pedidos');
  if (salvos) return JSON.parse(salvos);
  localStorage.setItem('remio_pedidos', JSON.stringify(PEDIDOS_INICIAIS));
  return [...PEDIDOS_INICIAIS];
}

function salvarPedidos(pedidos) {
  localStorage.setItem('remio_pedidos', JSON.stringify(pedidos));
}

/* ---------- Componentes compartilhados ---------- */
function renderCabecalho() {
  const alvo = $('#cabecalho');
  if (!alvo) return;
  const pagina = document.body.dataset.pagina;
  const papel = papelAtual();

  const links = [
    { id: 'home',       href: 'index.html',     rotulo: 'Início',       icone: 'home' },
    { id: 'busca',      href: 'busca.html',     rotulo: 'Profissionais',icone: 'search' },
    { id: 'parceiros',  href: 'parceiros.html', rotulo: 'Parceiros',    icone: 'store' },
    { id: 'pedidos',    href: 'pedidos.html',   rotulo: 'Pedidos',      icone: 'file-text' },
    { id: 'dashboard',  href: 'dashboard.html', rotulo: 'Painel BI',    icone: 'bar-chart-3' },
    { id: 'insights',   href: 'insights.html',  rotulo: 'Insights IA',  icone: 'sparkles' },
    { id: 'monitoramento', href: 'monitoramento.html', rotulo: 'Monitoramento', icone: 'activity' }
  ];

  const nav = links.map(l =>
    `<a href="${l.href}" class="${l.id === pagina ? 'ativo' : ''}">${icone(l.icone)} ${l.rotulo}</a>`
  ).join('');

  const areaUsuario = papel
    ? `<div class="sino" title="Notificações">${icone('bell')}</div>
       <div class="usuario-chip" onclick="sair()" title="Clique para sair">
         <div class="avatar">${iniciais(nomeUsuario())}</div>
         <div><strong>${nomeUsuario()}</strong><small>${PAPEIS[papel].rotulo}</small></div>
       </div>`
    : `<a href="login.html" class="btn btn-primario btn-pequeno">${icone('log-in')} Entrar</a>`;

  alvo.innerHTML = `
    <header class="cabecalho">
      <div class="container cabecalho-inner">
        <a href="index.html" class="logo">
          <span class="logo-icone">${icone('house')}</span>
          <span class="logo-nome">Rem<span>io</span></span>
        </a>
        <nav class="nav">${nav}</nav>
        <div class="cabecalho-acoes">${areaUsuario}</div>
      </div>
    </header>`;
}

function renderRodape() {
  const alvo = $('#rodape');
  if (!alvo) return;
  alvo.innerHTML = `
    <div class="rodape">
      <div class="container rodape-inner">
        <div>
          <div class="logo">${icone('house')} Remio</div>
          <small>Conectando você aos melhores profissionais de serviços domésticos.</small>
        </div>
        <span class="selo-protegido">${icone('shield-check')} Pagamento Protegido Remio</span>
        <small>© 2026 Remio — Protótipo acadêmico · TCC MBA em Gestão Analítica, BI e Big Data — UNIFOR</small>
      </div>
    </div>`;
}

/* Estrelas de avaliação (exibição) */
function estrelasHTML(nota) {
  return `<span class="estrelas">${icone('star')} ${nota.toFixed(1)}</span>`;
}

/* Indicador de faixa de preço ($ a $$$), estilo iFood */
function precoHTML(faixa) {
  const cheio = '$'.repeat(faixa);
  const vazio = '$'.repeat(3 - faixa);
  return `<span class="preco-faixa" title="Faixa de preço">${cheio}<span class="apagado">${vazio}</span></span>`;
}

/* Cartão de profissional usado na busca e na home */
function cartaoProfHTML(p) {
  const cats = p.categorias.map(nomeCategoria).join(' · ');
  return `
    <div class="cartao-prof">
      <div class="avatar"><img src="${p.foto}" alt="${p.nome}" onerror="this.remove()"></div>
      <div class="info">
        <div class="nome-linha">
          <h3>${p.nome}</h3>
          ${p.verificado ? `<span class="selo-verificado" title="Profissional verificado">${icone('badge-check')}</span>` : ''}
          ${p.pro ? '<span class="badge-pro">PRO</span>' : ''}
        </div>
        <div class="cats">${cats}</div>
        <div class="meta">
          ${estrelasHTML(p.nota)}
          <span>(${p.numAvaliacoes} avaliações)</span>
          <span>${icone('clock')} ${p.anosExp}+ anos de exp.</span>
          <span>${icone('map-pin')} ${p.cidade}</span>
          ${precoHTML(p.faixaPreco)}
        </div>
      </div>
      <a href="perfil.html?id=${p.id}" class="btn btn-escuro btn-pequeno">Ver perfil</a>
    </div>`;
}

/* ============================================================
   PÁGINA: HOME
   ============================================================ */
function initHome() {
  // Grade de categorias
  $('#grade-categorias').innerHTML = CATEGORIAS.map(c => `
    <a href="busca.html?cat=${c.id}" class="cartao-categoria">
      <span class="icone-cat">${icone(c.icone)}</span>
      <span>${c.nome}</span>
    </a>`).join('');

  // Profissionais em destaque (4 melhores notas)
  const destaques = [...PROFISSIONAIS].sort((a, b) => b.nota - a.nota).slice(0, 4);
  $('#destaques').innerHTML = destaques.map(cartaoProfHTML).join('');

  // Busca do hero: Enter ou clique levam para a página de busca
  const campo = $('#busca-hero-campo');
  const irParaBusca = () => {
    const q = campo.value.trim();
    window.location.href = q ? `busca.html?q=${encodeURIComponent(q)}` : 'busca.html';
  };
  campo.addEventListener('keydown', e => { if (e.key === 'Enter') irParaBusca(); });
  $('#busca-hero-botao').addEventListener('click', irParaBusca);
}

/* ============================================================
   PÁGINA: BUSCA DE PROFISSIONAIS
   ============================================================ */
function initBusca() {
  const params = new URLSearchParams(window.location.search);
  const estado = {
    texto: params.get('q') || '',
    categoria: params.get('cat') || '',
    cidade: '',
    notaMinima: 0,
    precos: new Set() // faixas selecionadas (1, 2, 3)
  };

  $('#busca-texto').value = estado.texto;

  // Chips de categoria
  $('#filtro-categorias').innerHTML =
    `<button class="chip ${!estado.categoria ? 'ativo' : ''}" data-cat="">Todas</button>` +
    CATEGORIAS.map(c =>
      `<button class="chip ${estado.categoria === c.id ? 'ativo' : ''}" data-cat="${c.id}">${c.nome}</button>`
    ).join('');

  // Select de cidades (a partir dos dados)
  const cidades = [...new Set(PROFISSIONAIS.map(p => p.cidade))].sort();
  $('#filtro-cidade').innerHTML = '<option value="">Todas as cidades</option>' +
    cidades.map(c => `<option>${c}</option>`).join('');

  function aplicar() {
    const termo = estado.texto.toLowerCase();
    const resultado = PROFISSIONAIS.filter(p => {
      const catsNomes = p.categorias.map(nomeCategoria).join(' ').toLowerCase();
      const combinaTexto = !termo || p.nome.toLowerCase().includes(termo) || catsNomes.includes(termo);
      const combinaCat = !estado.categoria || p.categorias.includes(estado.categoria);
      const combinaCidade = !estado.cidade || p.cidade === estado.cidade;
      const combinaNota = p.nota >= estado.notaMinima;
      const combinaPreco = estado.precos.size === 0 || estado.precos.has(p.faixaPreco);
      return combinaTexto && combinaCat && combinaCidade && combinaNota && combinaPreco;
    }).sort((a, b) => b.nota - a.nota);

    $('#contador-resultados').textContent =
      `${resultado.length} ${resultado.length === 1 ? 'profissional encontrado' : 'profissionais encontrados'}`;

    $('#lista-profissionais').innerHTML = resultado.length
      ? resultado.map(cartaoProfHTML).join('')
      : `<div class="vazio">${icone('search-x')}<strong>Nenhum profissional encontrado</strong>Tente ajustar os filtros da busca.</div>`;
    renderIcones();
  }

  // Eventos dos filtros
  $('#busca-texto').addEventListener('input', e => { estado.texto = e.target.value; aplicar(); });

  $('#filtro-categorias').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    estado.categoria = chip.dataset.cat;
    $$('#filtro-categorias .chip').forEach(c => c.classList.toggle('ativo', c === chip));
    aplicar();
  });

  $('#filtro-cidade').addEventListener('change', e => { estado.cidade = e.target.value; aplicar(); });
  $('#filtro-nota').addEventListener('change', e => { estado.notaMinima = Number(e.target.value); aplicar(); });

  $('#filtro-preco').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    const faixa = Number(chip.dataset.preco);
    if (estado.precos.has(faixa)) { estado.precos.delete(faixa); chip.classList.remove('ativo'); }
    else { estado.precos.add(faixa); chip.classList.add('ativo'); }
    aplicar();
  });

  aplicar();
}

/* ============================================================
   PÁGINA: PERFIL DO PROFISSIONAL (+ fluxo de orçamento)
   ============================================================ */
function initPerfil() {
  const params = new URLSearchParams(window.location.search);
  const prof = buscarProfissional(params.get('id')) || PROFISSIONAIS[0];

  $('#perfil-conteudo').innerHTML = `
    <div class="perfil-grid">
      <aside class="cartao-lateral">
        <div class="avatar"><img src="${prof.foto}" alt="${prof.nome}" onerror="this.remove()"></div>
        <h2>${prof.nome}
          ${prof.verificado ? `<span class="selo-verificado">${icone('badge-check')}</span>` : ''}
          ${prof.pro ? '<span class="badge-pro">PRO</span>' : ''}
        </h2>
        <div class="cidade">${icone('map-pin')} ${prof.cidade}</div>
        <div class="estatisticas-perfil">
          <div><strong>${prof.nota.toFixed(1)}</strong><small>Avaliação</small></div>
          <div><strong>${prof.numAvaliacoes}</strong><small>Serviços</small></div>
          <div><strong>${simboloPreco(prof.faixaPreco)}</strong><small>Faixa de preço</small></div>
        </div>
        <p style="font-size:.88rem">${prof.bio}</p>
        <button class="btn btn-primario" id="abrir-orcamento">${icone('file-plus-2')} Solicitar orçamento</button>
        <button class="btn btn-claro">${icone('message-circle')} Enviar mensagem</button>
        <div style="margin-top:16px"><span class="selo-protegido">${icone('shield-check')} Pagamento Protegido</span></div>
      </aside>

      <div>
        <div class="bloco">
          <h3>${icone('images')} Trabalhos realizados</h3>
          <div class="galeria">
            ${prof.galeria.map(g => `
              <div class="galeria-tile">${icone(g.icone)}<span>${g.titulo}</span></div>`).join('')}
          </div>
        </div>

        <div class="bloco">
          <h3>${icone('award')} Qualificações</h3>
          <ul class="lista-qualificacoes">
            ${prof.qualificacoes.map(q => `<li>${icone('check-circle')} ${q}</li>`).join('')}
          </ul>
        </div>

        <div class="bloco">
          <h3>${icone('star')} Avaliações (${prof.numAvaliacoes})</h3>
          ${prof.avaliacoes.map(a => `
            <div class="avaliacao-item">
              <div class="avaliacao-topo">
                <div class="avatar">${iniciais(a.cliente)}</div>
                <strong>${a.cliente}</strong>
                ${estrelasHTML(a.nota)}
                <small>${a.data}</small>
              </div>
              <p>${a.texto}</p>
            </div>`).join('')}
        </div>
      </div>
    </div>`;

  /* ----- Fluxo de orçamento em etapas ----- */
  const modal = $('#modal-orcamento');
  let etapa = 1;
  const dadosPedido = {};

  function renderEtapa() {
    $$('#modal-orcamento .etapa-ponto').forEach((p, i) => p.classList.toggle('ativa', i < etapa));
    $$('#modal-orcamento .conteudo-etapa').forEach((c, i) => c.style.display = (i === etapa - 1) ? 'block' : 'none');
    $('#orcamento-voltar').style.visibility = etapa === 1 ? 'hidden' : 'visible';
    $('#orcamento-avancar').innerHTML = etapa === 4
      ? `${icone('send')} Enviar solicitação` : `Avançar ${icone('arrow-right')}`;
    if (etapa === 4) {
      $('#resumo-orcamento').innerHTML = `
        <div class="linha"><span>Profissional</span><strong>${prof.nome}</strong></div>
        <div class="linha"><span>Serviço</span><strong>${dadosPedido.titulo}</strong></div>
        <div class="linha"><span>Data desejada</span><strong>${dadosPedido.data}</strong></div>
        <div class="linha"><span>Endereço</span><strong>${dadosPedido.endereco}</strong></div>`;
    }
    renderIcones();
  }

  // Opções de serviço conforme as categorias do profissional
  $('#orcamento-servico').innerHTML = prof.categorias.map(c =>
    `<option value="${c}">${nomeCategoria(c)}</option>`).join('');

  $('#abrir-orcamento').addEventListener('click', () => {
    etapa = 1;
    modal.classList.add('aberto');
    renderEtapa();
  });

  $('#orcamento-avancar').addEventListener('click', () => {
    // Coleta e valida os dados de cada etapa
    if (etapa === 1) {
      dadosPedido.categoria = $('#orcamento-servico').value;
      dadosPedido.titulo = $('#orcamento-titulo').value.trim() || nomeCategoria(dadosPedido.categoria);
    }
    if (etapa === 2) {
      const data = $('#orcamento-data').value;
      const endereco = $('#orcamento-endereco').value.trim();
      if (!data || !endereco) { toast('Preencha a data e o endereço.'); return; }
      dadosPedido.data = data.split('-').reverse().join('/');
      dadosPedido.endereco = endereco;
    }
    if (etapa === 3) {
      dadosPedido.descricao = $('#orcamento-descricao').value.trim() || 'Sem detalhes adicionais.';
    }
    if (etapa === 4) {
      // Cria o pedido com status "aguardando orçamento"
      const pedidos = carregarPedidos();
      pedidos.unshift({
        id: Date.now(),
        titulo: dadosPedido.titulo,
        profissionalId: prof.id,
        categoria: dadosPedido.categoria,
        status: 'aguardando',
        valor: null,
        data: dadosPedido.data,
        endereco: dadosPedido.endereco,
        descricao: dadosPedido.descricao
      });
      salvarPedidos(pedidos);
      modal.classList.remove('aberto');
      toast('Solicitação enviada! Acompanhe em "Pedidos".');
      return;
    }
    etapa++;
    renderEtapa();
  });

  $('#orcamento-voltar').addEventListener('click', () => { if (etapa > 1) { etapa--; renderEtapa(); } });
  $$('#modal-orcamento .modal-fechar').forEach(b => b.addEventListener('click', () => modal.classList.remove('aberto')));
}

/* ============================================================
   PÁGINA: MEUS PEDIDOS (+ Pagamento Protegido + Avaliação)
   ============================================================ */
const STATUS_INFO = {
  aguardando: { rotulo: 'Aguardando orçamento', classe: 'status-aguardando', icone: 'hourglass' },
  orcamento:  { rotulo: 'Orçamento recebido',   classe: 'status-orcamento',  icone: 'file-text' },
  agendado:   { rotulo: 'Agendado · Pagamento retido', classe: 'status-agendado', icone: 'calendar-check' },
  concluido:  { rotulo: 'Serviço concluído',    classe: 'status-concluido',  icone: 'check-circle' },
  avaliado:   { rotulo: 'Concluído e avaliado', classe: 'status-avaliado',   icone: 'star' }
};

function initPedidos() {
  let pedidoAtivo = null; // pedido em interação nos modais

  function render() {
    const pedidos = carregarPedidos();
    $('#total-pedidos').textContent = `${pedidos.length} pedidos`;

    if (!pedidos.length) {
      $('#lista-pedidos').innerHTML = `
        <div class="vazio">${icone('clipboard-list')}
          <strong>Nenhum pedido ainda</strong>Busque um profissional e solicite seu primeiro orçamento.
        </div>`;
      renderIcones();
      return;
    }

    $('#lista-pedidos').innerHTML = pedidos.map(ped => {
      const prof = buscarProfissional(ped.profissionalId);
      const st = STATUS_INFO[ped.status];

      // Ações disponíveis conforme o status do pedido
      let acoes = '';
      if (ped.status === 'aguardando') {
        acoes = `<button class="btn btn-claro btn-pequeno" data-acao="simular-orcamento" data-id="${ped.id}">
                   ${icone('refresh-cw')} Simular resposta do profissional</button>`;
      }
      if (ped.status === 'orcamento') {
        acoes = `<button class="btn btn-primario btn-pequeno" data-acao="pagar" data-id="${ped.id}">
                   ${icone('shield-check')} Pagar com Pagamento Protegido · ${dinheiro(ped.valor)}</button>`;
      }
      if (ped.status === 'agendado') {
        acoes = `<span class="selo-protegido">${icone('lock')} ${dinheiro(ped.valor)} retidos até a conclusão</span>
                 <button class="btn btn-claro btn-pequeno" data-acao="simular-conclusao" data-id="${ped.id}">
                   ${icone('refresh-cw')} Simular conclusão do serviço</button>`;
      }
      if (ped.status === 'concluido') {
        acoes = `<button class="btn btn-verde btn-pequeno" data-acao="avaliar" data-id="${ped.id}">
                   ${icone('star')} Confirmar conclusão e avaliar</button>`;
      }
      if (ped.status === 'avaliado') {
        acoes = `<span class="selo-protegido">${icone('check-circle')} Pagamento liberado ao profissional</span>
                 ${ped.notaDada ? `<span class="estrelas">${icone('star')} Sua nota: ${ped.notaDada}.0</span>` : ''}`;
      }

      return `
        <div class="cartao-pedido">
          <div class="pedido-topo">
            <h3>${ped.titulo}</h3>
            <span class="status ${st.classe}">${icone(st.icone)} ${st.rotulo}</span>
          </div>
          <div class="pedido-detalhes">
            <span>${icone('user')} ${prof ? prof.nome : 'Profissional'}</span>
            <span>${icone('tag')} ${nomeCategoria(ped.categoria)}</span>
            <span>${icone('calendar')} ${ped.data}</span>
            <span>${icone('map-pin')} ${ped.endereco}</span>
            ${ped.valor ? `<span>${icone('wallet')} ${dinheiro(ped.valor)}</span>` : ''}
          </div>
          <p style="font-size:.88rem">${ped.descricao}</p>
          <div class="pedido-acoes">${acoes}</div>
        </div>`;
    }).join('');
    renderIcones();
  }

  /* Delegação de eventos das ações dos pedidos */
  $('#lista-pedidos').addEventListener('click', e => {
    const botao = e.target.closest('[data-acao]');
    if (!botao) return;
    const pedidos = carregarPedidos();
    const ped = pedidos.find(p => p.id === Number(botao.dataset.id));
    if (!ped) return;
    const prof = buscarProfissional(ped.profissionalId);

    // Demonstração: o profissional responde com o orçamento (preço médio dele)
    if (botao.dataset.acao === 'simular-orcamento') {
      ped.valor = prof ? prof.precoMedio : 150;
      ped.status = 'orcamento';
      salvarPedidos(pedidos);
      toast(`${prof.nome.split(' ')[0]} enviou um orçamento de ${dinheiro(ped.valor)}.`);
      render();
    }

    // Abre o modal do Pagamento Protegido
    if (botao.dataset.acao === 'pagar') {
      pedidoAtivo = ped;
      const comissao = ped.valor * 0.15; // comissão de 15% da plataforma
      $('#resumo-pagamento').innerHTML = `
        <div class="linha"><span>Serviço</span><strong>${ped.titulo}</strong></div>
        <div class="linha"><span>Profissional</span><strong>${prof.nome}</strong></div>
        <div class="linha"><span>Valor do serviço</span><strong>${dinheiro(ped.valor)}</strong></div>
        <div class="linha"><span>Proteção Remio</span><strong style="color:var(--verde)">Incluída</strong></div>
        <div class="linha total"><span>Total a pagar</span><span>${dinheiro(ped.valor)}</span></div>
        <div class="linha" style="font-size:.78rem;color:var(--texto-suave)">
          <span>O profissional recebe ${dinheiro(ped.valor - comissao)} (comissão da plataforma: 15%)</span>
        </div>`;
      $('#modal-pagamento').classList.add('aberto');
      renderIcones();
    }

    // Demonstração: o serviço foi realizado
    if (botao.dataset.acao === 'simular-conclusao') {
      ped.status = 'concluido';
      salvarPedidos(pedidos);
      toast('O profissional marcou o serviço como concluído.');
      render();
    }

    // Abre o modal de avaliação (que também libera o pagamento)
    if (botao.dataset.acao === 'avaliar') {
      pedidoAtivo = ped;
      notaSelecionada = 0;
      $$('#estrelas-avaliacao button').forEach(b => b.classList.remove('marcada'));
      $('#avaliacao-comentario').value = '';
      $('#modal-avaliacao').classList.add('aberto');
    }
  });

  /* ----- Modal: Pagamento Protegido ----- */
  $('#confirmar-pagamento').addEventListener('click', () => {
    const pedidos = carregarPedidos();
    const ped = pedidos.find(p => p.id === pedidoAtivo.id);
    ped.status = 'agendado';
    salvarPedidos(pedidos);
    $('#modal-pagamento').classList.remove('aberto');
    toast('Pagamento confirmado! O valor fica retido até a conclusão do serviço.');
    render();
  });

  /* ----- Modal: Avaliação (estrelas clicáveis) ----- */
  let notaSelecionada = 0;
  $('#estrelas-avaliacao').addEventListener('click', e => {
    const botao = e.target.closest('button');
    if (!botao) return;
    notaSelecionada = Number(botao.dataset.nota);
    $$('#estrelas-avaliacao button').forEach(b =>
      b.classList.toggle('marcada', Number(b.dataset.nota) <= notaSelecionada));
  });

  $('#enviar-avaliacao').addEventListener('click', () => {
    if (!notaSelecionada) { toast('Selecione uma nota de 1 a 5 estrelas.'); return; }
    const pedidos = carregarPedidos();
    const ped = pedidos.find(p => p.id === pedidoAtivo.id);
    ped.status = 'avaliado';
    ped.notaDada = notaSelecionada;
    salvarPedidos(pedidos);
    $('#modal-avaliacao').classList.remove('aberto');
    toast('Avaliação enviada e pagamento liberado ao profissional. Obrigado!');
    render();
  });

  /* Fechar modais */
  $$('.modal-fechar').forEach(b =>
    b.addEventListener('click', () => b.closest('.modal-fundo').classList.remove('aberto')));

  /* Botão de redefinir a demonstração */
  $('#redefinir-demo').addEventListener('click', () => {
    localStorage.removeItem('remio_pedidos');
    toast('Demonstração redefinida com os pedidos originais.');
    render();
  });

  render();
}

/* ============================================================
   PÁGINA: PARCEIROS
   ============================================================ */
function initParceiros() {
  const estado = { texto: '', segmento: '' };
  const segmentos = [...new Set(PARCEIROS.flatMap(p => p.segmentos))].sort();

  $('#filtro-segmentos').innerHTML =
    `<button class="chip ativo" data-seg="">Todos</button>` +
    segmentos.map(s => `<button class="chip" data-seg="${s}">${s}</button>`).join('');

  function aplicar() {
    const termo = estado.texto.toLowerCase();
    const resultado = PARCEIROS.filter(p => {
      const combinaTexto = !termo || p.nome.toLowerCase().includes(termo) ||
        p.segmentos.join(' ').toLowerCase().includes(termo) || p.cidade.toLowerCase().includes(termo);
      const combinaSeg = !estado.segmento || p.segmentos.includes(estado.segmento);
      return combinaTexto && combinaSeg;
    });

    const verificados = resultado.filter(p => p.verificado).length;
    $('#contador-verificados').innerHTML = `${icone('badge-check')} Verificados <b>${verificados}</b>`;

    $('#lista-parceiros').innerHTML = resultado.length
      ? resultado.map(p => `
        <div class="cartao-parceiro">
          <div class="topo">
            <span class="icone-loja">${icone(p.icone)}</span>
            <div>
              <h3>${p.nome} ${p.verificado ? `<span class="selo-verificado">${icone('badge-check')}</span>` : ''}</h3>
              <div class="meta" style="font-size:.82rem;color:var(--texto-suave)">
                ${estrelasHTML(p.nota)} · ${icone('map-pin')} ${p.cidade}
              </div>
            </div>
          </div>
          <p class="descricao">${p.descricao}</p>
          <div class="tags">${p.segmentos.map(s => `<span class="tag">${s}</span>`).join('')}</div>
          <button class="btn btn-escuro" onclick="toast('Mensagem enviada para ${p.nome}!')">Contatar</button>
        </div>`).join('')
      : `<div class="vazio" style="grid-column: 1/-1">${icone('store')}<strong>Nenhum parceiro encontrado</strong></div>`;
    renderIcones();
  }

  $('#busca-parceiro').addEventListener('input', e => { estado.texto = e.target.value; aplicar(); });
  $('#filtro-segmentos').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    estado.segmento = chip.dataset.seg;
    $$('#filtro-segmentos .chip').forEach(c => c.classList.toggle('ativo', c === chip));
    aplicar();
  });

  aplicar();
}

/* ============================================================
   PÁGINA: LOGIN / SELEÇÃO DE PAPEL
   ============================================================ */
function initLogin() {
  let papelEscolhido = 'cliente';
  $$('.opcao-papel').forEach(op => {
    op.addEventListener('click', () => {
      papelEscolhido = op.dataset.papel;
      $$('.opcao-papel').forEach(o => o.classList.toggle('selecionada', o === op));
    });
  });

  $('#botao-entrar').addEventListener('click', () => {
    const nome = $('#campo-nome').value.trim();
    if (!nome) { toast('Digite seu nome para entrar.'); return; }
    entrar(papelEscolhido, nome);
    window.location.href = 'dashboard.html';
  });

  $('#campo-nome').addEventListener('keydown', e => {
    if (e.key === 'Enter') $('#botao-entrar').click();
  });
}

/* ============================================================
   PÁGINA: INSIGHTS DE IA (análise de avaliações com a Claude)
   ------------------------------------------------------------
   Conversa com o backend (remio/backend), que chama a API da
   Claude com a chave guardada com segurança no servidor.
   ============================================================ */
const BACKEND_PADRAO = 'http://localhost:3000';
function urlBackend() { return localStorage.getItem('remio_backend') || BACKEND_PADRAO; }

function initInsights() {
  // Chips de categoria para escolher quais avaliações analisar
  $('#filtro-insights').innerHTML =
    `<button class="chip ativo" data-cat="">Todas</button>` +
    CATEGORIAS.map(c => `<button class="chip" data-cat="${c.id}">${c.nome}</button>`).join('');

  let categoria = '';
  $('#filtro-insights').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (!chip) return;
    categoria = chip.dataset.cat;
    $$('#filtro-insights .chip').forEach(c => c.classList.toggle('ativo', c === chip));
  });

  // Campo para configurar a URL do backend (padrão localhost:3000)
  $('#backend-url').value = urlBackend();
  $('#backend-url').addEventListener('change', e => {
    localStorage.setItem('remio_backend', e.target.value.trim() || BACKEND_PADRAO);
  });

  // Reúne as avaliações dos profissionais (filtradas por categoria, se houver)
  function coletarAvaliacoes() {
    const profs = categoria ? PROFISSIONAIS.filter(p => p.categorias.includes(categoria)) : PROFISSIONAIS;
    const avaliacoes = [];
    profs.forEach(p => (p.avaliacoes || []).forEach(a => avaliacoes.push({ nota: a.nota, texto: a.texto })));
    return avaliacoes;
  }

  // Análise de exemplo — usada no modo demonstração (?demo na URL),
  // que mostra o resultado sem precisar do backend rodando.
  const ANALISE_EXEMPLO = {
    sentimento_geral: 'positivo', indice_satisfacao: 88,
    resumo: 'Os clientes elogiam fortemente a pontualidade e a qualidade do serviço, com algumas menções pontuais a preço e comunicação.',
    temas: [
      { tema: 'Pontualidade', mencoes: 7, sentimento: 'positivo' },
      { tema: 'Qualidade do serviço', mencoes: 9, sentimento: 'positivo' },
      { tema: 'Preço', mencoes: 3, sentimento: 'neutro' },
      { tema: 'Comunicação prévia', mencoes: 2, sentimento: 'negativo' }
    ],
    pontos_fortes: ['Profissionais pontuais e educados', 'Serviço caprichado e detalhista', 'Bom custo-benefício percebido'],
    pontos_de_melhoria: ['Melhorar a comunicação antes do atendimento', 'Padronizar a qualidade entre prestadores'],
    sugestoes: ['Enviar lembrete automático 1h antes do serviço', 'Criar checklist de qualidade pós-serviço', 'Oferecer pacote recorrente com desconto']
  };
  const ehDemo = new URLSearchParams(location.search).has('demo');

  $('#botao-analisar').addEventListener('click', async () => {
    const avaliacoes = coletarAvaliacoes();
    if (!avaliacoes.length) { toast('Nenhuma avaliação para analisar nesta categoria.'); return; }

    const resultado = $('#resultado-insights');
    resultado.innerHTML = `<div class="vazio" style="padding:50px">${icone('loader')}
      <strong>Analisando ${avaliacoes.length} avaliações com a IA...</strong>
      A Claude está lendo os comentários e identificando padrões.</div>`;
    renderIcones();

    // Modo demonstração: mostra um resultado de exemplo (sem backend)
    if (ehDemo) {
      setTimeout(() => renderAnalise(ANALISE_EXEMPLO, {
        modelo: 'claude-opus-4-8', avaliacoes_analisadas: avaliacoes.length, tokens: { output_tokens: 412 }
      }), 600);
      return;
    }

    try {
      const resp = await fetch(`${urlBackend()}/api/analisar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avaliacoes, contexto: categoria ? nomeCategoria(categoria) : 'serviços domésticos' })
      });
      if (!resp.ok) {
        const erro = await resp.json().catch(() => ({}));
        throw new Error(erro.erro || `Erro ${resp.status}`);
      }
      const { analise, meta } = await resp.json();
      renderAnalise(analise, meta);
    } catch (err) {
      const offline = err.message.includes('Failed to fetch') || err.message.includes('fetch');
      resultado.innerHTML = `<div class="vazio" style="padding:50px">${icone('plug-zap')}
        <strong>${offline ? 'Backend de IA não encontrado' : 'Não foi possível analisar'}</strong>
        ${offline
          ? 'Inicie o backend local (pasta <code>remio/backend</code>): <code>npm install</code> e <code>npm start</code>. Veja o README dessa pasta.'
          : err.message}</div>`;
      renderIcones();
    }
  });

  // No modo demonstração, já dispara a análise de exemplo ao abrir a página
  if (ehDemo) $('#botao-analisar').click();

  function renderAnalise(a, meta) {
    const cor = { positivo: 'var(--verde)', neutro: 'var(--ambar)', negativo: 'var(--vermelho)' }[a.sentimento_geral];
    const lista = (titulo, itens, ic) => `
      <div class="bloco">
        <h3>${icone(ic)} ${titulo}</h3>
        <ul class="lista-qualificacoes">
          ${itens.map(t => `<li>${icone('dot')} ${t}</li>`).join('')}
        </ul>
      </div>`;

    $('#resultado-insights').innerHTML = `
      <div class="grade-kpis" style="margin-bottom:20px">
        <div class="kpi"><div class="kpi-icone">${icone('smile')}</div>
          <strong style="text-transform:capitalize;color:${cor}">${a.sentimento_geral}</strong>
          <small>Sentimento geral</small></div>
        <div class="kpi"><div class="kpi-icone">${icone('gauge')}</div>
          <strong>${a.indice_satisfacao}<span style="font-size:1rem">/100</span></strong>
          <small>Índice de satisfação</small></div>
        <div class="kpi"><div class="kpi-icone">${icone('messages-square')}</div>
          <strong>${meta.avaliacoes_analisadas}</strong>
          <small>Avaliações analisadas</small></div>
        <div class="kpi"><div class="kpi-icone">${icone('sparkles')}</div>
          <strong style="font-size:1rem">${meta.modelo}</strong>
          <small>Modelo de IA</small></div>
      </div>

      <div class="bloco" style="border-left:4px solid ${cor}">
        <h3>${icone('file-text')} Resumo da IA</h3>
        <p>${a.resumo}</p>
      </div>

      <div class="bloco">
        <h3>${icone('tags')} Temas recorrentes</h3>
        <div class="chips" style="margin-top:0">
          ${a.temas.map(t => {
            const c = { positivo: 'var(--verde-claro)', neutro: '#fef3c7', negativo: '#fee2e2' }[t.sentimento];
            return `<span class="chip" style="cursor:default;background:${c}">${t.tema} · ${t.mencoes}×</span>`;
          }).join('')}
        </div>
      </div>

      ${lista('Pontos fortes', a.pontos_fortes, 'thumbs-up')}
      ${lista('Pontos de melhoria', a.pontos_de_melhoria, 'wrench')}
      ${lista('Sugestões para a plataforma', a.sugestoes, 'lightbulb')}

      <p style="text-align:center;font-size:.8rem;color:var(--texto-suave);margin-top:10px">
        Análise gerada por IA (API da Claude) · ${meta.tokens?.output_tokens ?? '–'} tokens de saída
      </p>`;
    renderIcones();
  }
}

/* ============================================================
   PÁGINA: MONITORAMENTO (observabilidade + repositório de erros)
   ------------------------------------------------------------
   Materializa, com dados simulados, os conceitos do documento
   de Arquitetura: saúde do sistema, health checks, qualidade
   de dados (ETL) e o repositório de erros (estes reais).
   ============================================================ */
function initMonitoramento() {
  // Modo demonstração: semeia um erro de exemplo se o repositório estiver vazio
  if (new URLSearchParams(location.search).has('demo') && !localStorage.getItem('remio_erros')) {
    registrarErro("Cannot read properties of undefined (reading 'nota')", 'perfil.html');
  }
  const horas = Array.from({ length: 12 }, (_, i) => `${String((i * 2)).padStart(2, '0')}h`);
  const latencia = [165, 158, 150, 172, 180, 240, 210, 195, 205, 230, 188, 175];
  const requisicoes = [320, 210, 140, 180, 520, 880, 1020, 940, 870, 1100, 760, 540];

  // KPIs de saúde do sistema
  $('#mon-kpis').innerHTML = `
    <div class="kpi"><div class="kpi-icone">${icone('activity')}</div><strong>99,95<span style="font-size:1rem">%</span></strong><small>Disponibilidade (30 dias)</small></div>
    <div class="kpi"><div class="kpi-icone">${icone('timer')}</div><strong>185<span style="font-size:1rem">ms</span></strong><small>Latência média</small></div>
    <div class="kpi"><div class="kpi-icone">${icone('alert-triangle')}</div><strong>0,3<span style="font-size:1rem">%</span></strong><small>Taxa de erro</small></div>
    <div class="kpi"><div class="kpi-icone">${icone('gauge')}</div><strong>1,1<span style="font-size:1rem">k/min</span></strong><small>Requisições</small></div>`;

  // Health checks dos serviços
  const servicos = [
    { nome: 'API Gateway', status: 'ok' }, { nome: 'Serviço de Pedidos', status: 'ok' },
    { nome: 'Serviço de Pagamentos', status: 'ok' }, { nome: 'Banco OLTP (PostgreSQL)', status: 'ok' },
    { nome: 'Data Warehouse', status: 'ok' }, { nome: 'Backend de IA (Claude)', status: 'degradado' }
  ];
  $('#mon-servicos').innerHTML = servicos.map(s => `
    <li>${icone(s.status === 'ok' ? 'check-circle' : 'alert-circle')}
      <span style="flex:1">${s.nome}</span>
      <span style="font-weight:700;color:${s.status === 'ok' ? 'var(--verde)' : 'var(--ambar)'}">
        ${s.status === 'ok' ? 'Operacional' : 'Degradado'}</span></li>`).join('');

  // Qualidade de dados (última carga do ETL) — resolve "painéis errados"
  const checks = [
    { nome: 'Completude (sem campos obrigatórios nulos)', ok: true },
    { nome: 'Integridade referencial (sem chaves órfãs)', ok: true },
    { nome: 'Consistência (comissão + prestador = total)', ok: true },
    { nome: 'Volume da carga dentro do esperado', ok: true }
  ];
  $('#mon-qualidade').innerHTML = checks.map(c => `
    <li>${icone(c.ok ? 'check-circle' : 'x-circle')}
      <span style="flex:1">${c.nome}</span>
      <span style="font-weight:700;color:var(--verde)">${c.ok ? 'OK' : 'Falhou'}</span></li>`).join('');

  // Gráficos (Chart.js)
  if (window.Chart) {
    Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";
    new Chart($('#mon-latencia'), {
      type: 'line',
      data: { labels: horas, datasets: [{ label: 'Latência (ms)', data: latencia,
        borderColor: '#f97316', backgroundColor: 'rgba(249,115,22,.15)', fill: true, tension: .4, pointRadius: 3 }] },
      options: { plugins: { legend: { display: false } } }
    });
    new Chart($('#mon-requisicoes'), {
      type: 'bar',
      data: { labels: horas, datasets: [{ label: 'Requisições', data: requisicoes, backgroundColor: '#1f2937', borderRadius: 6 }] },
      options: { plugins: { legend: { display: false } } }
    });
  }

  // Repositório de erros (reais, capturados em todo o site)
  function renderErros() {
    const erros = JSON.parse(localStorage.getItem('remio_erros') || '[]');
    if (!erros.length) {
      $('#mon-erros').innerHTML = `<div class="vazio" style="padding:30px">${icone('shield-check')}
        <strong>Nenhum erro registrado</strong>Os erros de JavaScript do site aparecem aqui automaticamente.</div>`;
    } else {
      $('#mon-erros').innerHTML = `
        <table style="width:100%; border-collapse:collapse; font-size:.85rem">
          <thead><tr style="text-align:left; color:var(--texto-suave)">
            <th style="padding:8px">Quando</th><th style="padding:8px">Página</th><th style="padding:8px">Mensagem</th></tr></thead>
          <tbody>${erros.map(e => `<tr style="border-top:1px solid var(--borda)">
            <td style="padding:8px; white-space:nowrap">${e.data}</td>
            <td style="padding:8px"><code>${e.origem}</code></td>
            <td style="padding:8px; color:var(--vermelho)">${e.mensagem}</td></tr>`).join('')}</tbody>
        </table>`;
    }
    renderIcones();
  }
  $('#mon-gerar-erro').addEventListener('click', () => {
    try { null.metodoInexistente(); } catch (err) { registrarErro(err.message, 'monitoramento.html'); }
    toast('Erro de teste capturado pelo repositório.');
    renderErros();
  });
  $('#mon-limpar-erros').addEventListener('click', () => {
    localStorage.removeItem('remio_erros'); toast('Repositório de erros limpo.'); renderErros();
  });
  renderErros();
}

/* ============================================================
   INICIALIZAÇÃO — identifica a página e monta os componentes
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Atalho para demonstrações: ?papel=cliente|prestador|parceiro na URL
  // faz login automático (ex.: dashboard.html?papel=prestador)
  const parametros = new URLSearchParams(window.location.search);
  const papelParam = parametros.get('papel');
  if (papelParam && PAPEIS[papelParam]) {
    entrar(papelParam, parametros.get('nome') || 'Luiz Otávio');
  }

  renderCabecalho();
  renderRodape();

  const pagina = document.body.dataset.pagina;
  if (pagina === 'home') initHome();
  if (pagina === 'busca') initBusca();
  if (pagina === 'perfil') initPerfil();
  if (pagina === 'pedidos') initPedidos();
  if (pagina === 'parceiros') initParceiros();
  if (pagina === 'login') initLogin();
  if (pagina === 'insights') initInsights();
  if (pagina === 'monitoramento') initMonitoramento();
  // A página "dashboard" é inicializada pelo dashboard.js

  renderIcones();
});
