-- ============================================================
-- REMIO — Banco de Dados Transacional (OLTP)
-- SGBD: PostgreSQL 14+
-- ------------------------------------------------------------
-- Modelo normalizado que sustenta a operação da plataforma:
-- usuários, prestadores, parceiros, pedidos, orçamentos,
-- pagamentos (com o Pagamento Protegido), avaliações e
-- indicações de parceiros.
--
-- Este é o banco que o site grava no dia a dia. Os dados aqui
-- são posteriormente extraídos pelo ETL (Pentaho) para o
-- Data Warehouse, que alimenta os dashboards de BI.
-- ============================================================

DROP SCHEMA IF EXISTS remio_oltp CASCADE;
CREATE SCHEMA remio_oltp;
SET search_path TO remio_oltp;

-- ------------------------------------------------------------
-- USUÁRIO — conta base de qualquer perfil (cliente, prestador
-- ou empresa parceira).
-- ------------------------------------------------------------
CREATE TABLE usuario (
    id              BIGSERIAL    PRIMARY KEY,
    nome            VARCHAR(150) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    senha_hash      VARCHAR(255) NOT NULL,
    telefone        VARCHAR(20),
    tipo            VARCHAR(20)  NOT NULL
                    CHECK (tipo IN ('cliente', 'prestador', 'parceiro')),
    cidade          VARCHAR(100),
    uf              CHAR(2),
    data_cadastro   TIMESTAMP    NOT NULL DEFAULT now(),
    ativo           BOOLEAN      NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE  usuario IS 'Conta base de todos os perfis da plataforma.';
COMMENT ON COLUMN usuario.tipo IS 'Papel do usuário: cliente, prestador ou parceiro.';

-- ------------------------------------------------------------
-- CATEGORIA_SERVICO — tipos de serviço doméstico oferecidos.
-- ------------------------------------------------------------
CREATE TABLE categoria_servico (
    id      SERIAL       PRIMARY KEY,
    nome    VARCHAR(80)  NOT NULL,
    slug    VARCHAR(80)  NOT NULL UNIQUE,
    ativo   BOOLEAN      NOT NULL DEFAULT TRUE
);
COMMENT ON TABLE categoria_servico IS 'Categorias de serviço (faxina, elétrica, hidráulica, etc.).';

-- ------------------------------------------------------------
-- PRESTADOR — dados profissionais (1:1 com usuário do tipo
-- prestador).
-- ------------------------------------------------------------
CREATE TABLE prestador (
    id                  BIGSERIAL    PRIMARY KEY,
    usuario_id          BIGINT       NOT NULL UNIQUE REFERENCES usuario(id),
    bio                 TEXT,
    anos_experiencia    SMALLINT,
    plano               VARCHAR(10)  NOT NULL DEFAULT 'free'
                        CHECK (plano IN ('free', 'pro')),
    verificado          BOOLEAN      NOT NULL DEFAULT FALSE,
    data_verificacao    DATE,
    faixa_preco         SMALLINT     CHECK (faixa_preco BETWEEN 1 AND 3),
    preco_medio         NUMERIC(10,2),
    nota_media          NUMERIC(3,2) DEFAULT 0,
    total_avaliacoes    INTEGER      DEFAULT 0
);
COMMENT ON COLUMN prestador.faixa_preco IS 'Faixa de preço: 1=$ (mais em conta), 2=$$, 3=$$$ (premium).';
COMMENT ON COLUMN prestador.plano IS 'Plano do prestador: free ou pro (destaque).';

-- ------------------------------------------------------------
-- PRESTADOR_CATEGORIA — relação N:N entre prestador e
-- categorias que ele atende.
-- ------------------------------------------------------------
CREATE TABLE prestador_categoria (
    prestador_id   BIGINT NOT NULL REFERENCES prestador(id),
    categoria_id   INT    NOT NULL REFERENCES categoria_servico(id),
    PRIMARY KEY (prestador_id, categoria_id)
);

-- ------------------------------------------------------------
-- PARCEIRO — lojas e fornecedores (1:1 com usuário parceiro).
-- ------------------------------------------------------------
CREATE TABLE parceiro (
    id              BIGSERIAL    PRIMARY KEY,
    usuario_id      BIGINT       NOT NULL UNIQUE REFERENCES usuario(id),
    razao_social    VARCHAR(150) NOT NULL,
    cnpj            VARCHAR(18)  UNIQUE,
    segmento        VARCHAR(100),
    verificado      BOOLEAN      NOT NULL DEFAULT FALSE,
    nota_media      NUMERIC(3,2) DEFAULT 0
);

-- ------------------------------------------------------------
-- ENDERECO — endereços dos usuários (local do serviço).
-- ------------------------------------------------------------
CREATE TABLE endereco (
    id           BIGSERIAL    PRIMARY KEY,
    usuario_id   BIGINT       NOT NULL REFERENCES usuario(id),
    logradouro   VARCHAR(150) NOT NULL,
    numero       VARCHAR(20),
    complemento  VARCHAR(80),
    bairro       VARCHAR(100),
    cidade       VARCHAR(100) NOT NULL,
    uf           CHAR(2)      NOT NULL,
    cep          VARCHAR(9)
);

-- ------------------------------------------------------------
-- PEDIDO — solicitação de serviço feita pelo cliente.
-- É a entidade central da operação.
-- ------------------------------------------------------------
CREATE TABLE pedido (
    id              BIGSERIAL    PRIMARY KEY,
    cliente_id      BIGINT       NOT NULL REFERENCES usuario(id),
    prestador_id    BIGINT       REFERENCES prestador(id),
    categoria_id    INT          NOT NULL REFERENCES categoria_servico(id),
    endereco_id     BIGINT       REFERENCES endereco(id),
    titulo          VARCHAR(150) NOT NULL,
    descricao       TEXT,
    status          VARCHAR(20)  NOT NULL DEFAULT 'aguardando'
                    CHECK (status IN ('aguardando', 'orcamento', 'agendado',
                                      'concluido', 'avaliado', 'cancelado')),
    data_criacao    TIMESTAMP    NOT NULL DEFAULT now(),
    data_agendada   DATE,
    data_conclusao  TIMESTAMP
);
COMMENT ON COLUMN pedido.status IS 'Ciclo de vida: aguardando -> orcamento -> agendado -> concluido -> avaliado.';

-- ------------------------------------------------------------
-- ORCAMENTO — proposta de valor enviada pelo prestador.
-- ------------------------------------------------------------
CREATE TABLE orcamento (
    id            BIGSERIAL    PRIMARY KEY,
    pedido_id     BIGINT       NOT NULL REFERENCES pedido(id),
    prestador_id  BIGINT       NOT NULL REFERENCES prestador(id),
    valor         NUMERIC(10,2) NOT NULL,
    prazo_dias    SMALLINT,
    status        VARCHAR(20)  NOT NULL DEFAULT 'enviado'
                  CHECK (status IN ('enviado', 'aceito', 'recusado')),
    data_envio    TIMESTAMP    NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PAGAMENTO — Pagamento Protegido (custódia / escrow).
-- O valor fica retido e é liberado ao prestador na conclusão.
-- A comissão de 15% da plataforma é registrada aqui.
-- ------------------------------------------------------------
CREATE TABLE pagamento (
    id                   BIGSERIAL    PRIMARY KEY,
    pedido_id            BIGINT       NOT NULL UNIQUE REFERENCES pedido(id),
    valor_total          NUMERIC(10,2) NOT NULL,
    percentual_comissao  NUMERIC(5,2)  NOT NULL DEFAULT 15.00,
    valor_comissao       NUMERIC(10,2) NOT NULL,
    valor_prestador      NUMERIC(10,2) NOT NULL,
    metodo               VARCHAR(20)   CHECK (metodo IN ('pix', 'credito', 'debito')),
    status               VARCHAR(20)   NOT NULL DEFAULT 'retido'
                         CHECK (status IN ('retido', 'liberado', 'reembolsado')),
    data_pagamento       TIMESTAMP     NOT NULL DEFAULT now(),
    data_liberacao       TIMESTAMP
);
COMMENT ON COLUMN pagamento.status IS 'retido (custódia) -> liberado (ao prestador) ou reembolsado (ao cliente).';

-- ------------------------------------------------------------
-- AVALIACAO — nota e comentário do cliente após o serviço.
-- ------------------------------------------------------------
CREATE TABLE avaliacao (
    id            BIGSERIAL    PRIMARY KEY,
    pedido_id     BIGINT       NOT NULL UNIQUE REFERENCES pedido(id),
    cliente_id    BIGINT       NOT NULL REFERENCES usuario(id),
    prestador_id  BIGINT       NOT NULL REFERENCES prestador(id),
    nota          SMALLINT     NOT NULL CHECK (nota BETWEEN 1 AND 5),
    comentario    TEXT,
    data          TIMESTAMP    NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- PARCEIRO_INDICACAO — registro de indicações geradas para
-- os parceiros (alimenta o dashboard da empresa parceira).
-- ------------------------------------------------------------
CREATE TABLE parceiro_indicacao (
    id            BIGSERIAL    PRIMARY KEY,
    parceiro_id   BIGINT       NOT NULL REFERENCES parceiro(id),
    cliente_id    BIGINT       REFERENCES usuario(id),
    segmento      VARCHAR(100),
    gerou_contato BOOLEAN      NOT NULL DEFAULT FALSE,
    gerou_venda   BOOLEAN      NOT NULL DEFAULT FALSE,
    valor_venda   NUMERIC(10,2),
    data          TIMESTAMP    NOT NULL DEFAULT now()
);

-- ------------------------------------------------------------
-- ÍNDICES — otimizam as consultas mais frequentes da operação
-- e a extração incremental do ETL.
-- ------------------------------------------------------------
CREATE INDEX idx_pedido_cliente     ON pedido(cliente_id);
CREATE INDEX idx_pedido_prestador   ON pedido(prestador_id);
CREATE INDEX idx_pedido_status      ON pedido(status);
CREATE INDEX idx_pedido_data        ON pedido(data_criacao);
CREATE INDEX idx_pedido_conclusao   ON pedido(data_conclusao);
CREATE INDEX idx_orcamento_pedido   ON orcamento(pedido_id);
CREATE INDEX idx_avaliacao_prestador ON avaliacao(prestador_id);
CREATE INDEX idx_pagamento_status   ON pagamento(status);
CREATE INDEX idx_indicacao_parceiro ON parceiro_indicacao(parceiro_id);
CREATE INDEX idx_indicacao_data     ON parceiro_indicacao(data);
