# Remio — Documento de Design do Protótipo

**Data:** 10/06/2026
**Contexto:** Protótipo navegável para o TCC do MBA em Gestão Analítica com BI e Big Data (UNIFOR). Baseado no plano de negócios "Smart Serviços" (2023) e inspirado visualmente na plataforma Romi (romi-app.com), com identidade própria.

---

## 1. Objetivo

Demonstrar a plataforma **Remio** — marketplace que conecta clientes a prestadores de serviços domésticos — como protótipo front-end completo e navegável, com dados simulados, servindo de base para os Capítulos 4 (Arquitetura da Solução) e 5 (Desenvolvimento e Prototipagem) do TCC.

## 2. Decisões de escopo

| Decisão | Escolha | Justificativa |
|---|---|---|
| Tipo de entrega | Protótipo navegável completo (10 telas) | Rende prints para o cap. 5.4 e demonstra a "fricção zero" |
| Dados | 100% simulados (arquivo `dados.js`) | Sem custo/complexidade de servidor; no TCC, documenta-se o que o sistema real exigiria (banco de dados, autenticação, gateway de pagamento, LGPD) |
| Stack | HTML + CSS + JavaScript puros, Chart.js via CDN | Abre no navegador sem instalar nada; código legível e fácil de citar no TCC |
| Dashboards de BI | Sim — 3 perspectivas (cliente, prestador, empresa parceira) | Conecta o protótipo ao tema do MBA (cap. 4.2) |

## 3. Identidade visual

- **Cor primária:** laranja vibrante (ar de construção/serviços), com grafite escuro para textos e navegação
- **Acentos:** âmbar/amarelo em selos e gráficos; verde para confirmações
- **Fundo:** gradientes suaves e formas decorativas desfocadas (estilo aurora) — evita o fundo branco "básico"
- **Cards:** cantos bem arredondados, sombras suaves, glassmorphism leve nos painéis de BI
- **Tipografia:** Plus Jakarta Sans (Google Fonts)
- **Microinterações:** hover com elevação, transições suaves, contadores animados nos indicadores

## 4. Telas

### Jornada do cliente
1. **Home** — hero com busca + chips de categorias (Faxina, Elétrica, Hidráulica, Pintura, Pedreiro, Jardinagem, Ar-condicionado, Montagem de Móveis), banner CTA, grade de serviços, profissionais em destaque, "como funciona"
2. **Busca de profissionais** — filtros: categoria, cidade, nota e **faixa de preço ($ / $$ / $$$, estilo iFood)**; selo verificado e badge PRO
3. **Perfil do profissional** — galeria de trabalhos, avaliações com comentários, qualificações, faixa de preço, botão "Solicitar orçamento"
4. **Solicitar orçamento** — formulário em etapas (serviço → data/local → descrição → confirmação)
5. **Meus pedidos** — status: aguardando orçamento, orçamento recebido, agendado, concluído, avaliado; inclui etapa de **Pagamento Protegido**
6. **Parceiros** — cards de lojas/fornecedores com selo verificado e tags de segmento

### Acesso
7. **Login/Cadastro simulado** — usuário escolhe o papel (Cliente, Prestador ou Empresa Parceira); o site se adapta ao papel (localStorage)

### Dashboards de BI
8. **Dashboard do Cliente** — gastos por mês, contratações por categoria, avaliações dadas
9. **Dashboard do Prestador** — faturamento mensal, demanda por serviço, nota média, conversão de orçamentos, horários de pico, **posicionamento de preço vs. média da categoria**
10. **Dashboard da Empresa Parceira** — indicações recebidas, contatos gerados, desempenho por segmento

## 5. Funcionalidades-chave

- **Indicador de faixa de preço ($ a $$$):** calculado dos preços simulados de cada profissional; aparece nos cards e é filtro na busca
- **Pagamento Protegido Remio (escrow simulado):** cliente paga pela plataforma; valor fica retido e é liberado ao prestador na confirmação da conclusão; reembolso garantido em caso de problema. Comissão de 15% (herdada do plano Smart Serviços) descontada nessa etapa
- **Sistema de avaliações:** notas + comentários pós-serviço
- **Papéis dinâmicos:** a navegação e o dashboard mudam conforme o papel logado

## 6. Estrutura de arquivos

```
remio/
├── index.html          (Home)
├── busca.html          (Busca de profissionais)
├── perfil.html         (Perfil do profissional)
├── pedidos.html        (Meus pedidos + pagamento protegido)
├── parceiros.html      (Empresas parceiras)
├── dashboard.html      (BI — adapta-se ao papel logado)
├── login.html          (Entrada/seleção de papel)
├── css/estilo.css      (Identidade visual completa)
├── js/dados.js         (Banco de dados simulado)
├── js/app.js           (Lógica compartilhada: papel, navegação, filtros)
├── js/dashboard.js     (Gráficos Chart.js)
└── docs/
    ├── DESIGN.md       (este documento)
    ├── PROMPTS.md      (registro de prompts — cap. 5.2 do TCC)
    └── README.md       (estrutura do código — cap. 5.3 do TCC)
```

## 7. O que o sistema real exigiria (material para o cap. 6.2 do TCC)

- Banco de dados (ex.: PostgreSQL ou Firebase) no lugar de `dados.js`
- Autenticação real com verificação de identidade e antecedentes
- Gateway de pagamento (ex.: Mercado Pago, Stripe) para o escrow real
- Conformidade com LGPD no tratamento dos dados de usuários
- Infraestrutura de Big Data (pipeline de eventos → data warehouse → BI) alimentando os dashboards em tempo real
