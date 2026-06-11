# Remio — Protótipo da plataforma

> Material de apoio para a **seção 5.3** do TCC (Estrutura de Código e Interface).
> Protótipo navegável da plataforma Remio — marketplace de serviços domésticos —
> desenvolvido via Vibe Coding para o TCC do MBA em Gestão Analítica com BI e
> Big Data (UNIFOR).

## Como executar

Não precisa instalar nada: **dê dois cliques em `index.html`** e o site abre no
navegador. (Conexão com a internet é necessária apenas para carregar fontes,
ícones e a biblioteca de gráficos.)

Para apresentações, recomenda-se maximizar a janela do navegador (o layout foi
desenhado para desktop, mas também é responsivo).

## Estrutura de arquivos

```
remio/
├── index.html          Home: busca, categorias, destaques, como funciona
├── busca.html          Busca de profissionais com filtros (categoria, cidade,
│                       nota e faixa de preço $ a $$$)
├── perfil.html         Perfil do profissional + solicitação de orçamento em etapas
├── pedidos.html        Meus pedidos + Pagamento Protegido + avaliação
├── parceiros.html      Empresas parceiras (lojas e fornecedores)
├── dashboard.html      Painel de BI (muda conforme o papel logado)
├── login.html          Entrada simulada com seleção de papel
│
├── css/
│   └── estilo.css      Identidade visual completa (cores, componentes, responsivo)
│
├── js/
│   ├── dados.js        "Banco de dados" simulado: profissionais, parceiros,
│   │                   pedidos e indicadores de BI
│   ├── app.js          Lógica da aplicação: navegação, papéis de usuário,
│   │                   filtros, orçamentos, pedidos e pagamento protegido
│   └── dashboard.js    Dashboards de BI com gráficos (Chart.js)
│
└── docs/
    ├── DESIGN.md       Documento de design do protótipo
    ├── PROMPTS.md      Registro da engenharia de prompts (seção 5.2 do TCC)
    └── README.md       Este arquivo (seção 5.3 do TCC)
```

## Conceitos demonstrados

| Funcionalidade | Onde está no código |
|---|---|
| Faixa de preço estilo iFood ($ a $$$) | `dados.js` (campo `faixaPreco`) + função `precoHTML()` em `app.js` + filtro em `initBusca()` |
| Pagamento Protegido (escrow, estilo Uber) | `initPedidos()` em `app.js` — o valor fica "retido" e só é liberado na avaliação; comissão de 15% calculada no modal |
| Ciclo de vida do pedido | Máquina de estados em `app.js`: `aguardando → orcamento → agendado → concluido → avaliado` |
| Papéis de usuário (cliente/prestador/parceiro) | `localStorage` gerenciado em `app.js`; o dashboard se adapta em `dashboard.js` |
| BI / Indicadores | `dashboard.js` — KPIs animados, gráficos de linha/barra/rosca e mapa de calor de horários |
| Sistema de avaliações | Estrelas clicáveis em `pedidos.html` + avaliações exibidas em `perfil.html` |

## Simulações para demonstração ao vivo

Na tela **Pedidos**, os botões "Simular resposta do profissional" e "Simular conclusão
do serviço" permitem demonstrar o ciclo completo de um pedido para a banca sem
precisar de um segundo usuário. O botão "Redefinir demonstração" restaura os pedidos
de exemplo originais.

## O que o sistema real exigiria (limitações do protótipo)

Este protótipo é 100% front-end. Em produção, seriam necessários:

1. **Banco de dados** (ex.: PostgreSQL/Firebase) no lugar de `dados.js`;
2. **API/back-end** para regras de negócio seguras no servidor;
3. **Autenticação real** com verificação de identidade e de antecedentes;
4. **Gateway de pagamento** (ex.: Mercado Pago, Stripe) para o escrow real;
5. **Conformidade com a LGPD** no tratamento de dados pessoais;
6. **Pipeline de Big Data** (eventos → data warehouse → camada de BI) alimentando
   os dashboards em tempo real, no lugar dos indicadores estáticos.

Esses pontos alimentam as seções 4.2 e 6.2 do TCC.
