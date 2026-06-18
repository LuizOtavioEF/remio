-- ============================================================
-- REMIO — Data Warehouse (DW)
-- SGBD: PostgreSQL 14+
-- Modelagem dimensional (esquema estrela / constelação de fatos)
-- ------------------------------------------------------------
-- Estrutura otimizada para análise e BI. É carregada pelo ETL
-- (Pentaho PDI) a partir do banco transacional (OLTP) e
-- alimenta os três dashboards da plataforma:
--   - fato_servico            -> dashboards de cliente e prestador
--   - fato_avaliacao          -> indicadores de avaliação
--   - fato_indicacao_parceiro -> dashboard da empresa parceira
--
-- Convenção: sk_ = surrogate key (chave substituta, gerada no DW);
-- id_ = chave natural (vinda do OLTP).
-- ============================================================

DROP SCHEMA IF EXISTS remio_dw CASCADE;
CREATE SCHEMA remio_dw;
SET search_path TO remio_dw;

-- ============================================================
-- DIMENSÕES
-- ============================================================

-- ------------------------------------------------------------
-- DIM_TEMPO — dimensão de calendário. A chave é no formato
-- numérico AAAAMMDD (ex.: 20260618), padrão em projetos de BI.
-- ------------------------------------------------------------
CREATE TABLE dim_tempo (
    sk_tempo         INTEGER     PRIMARY KEY,   -- AAAAMMDD
    data             DATE        NOT NULL,
    dia              SMALLINT,
    mes              SMALLINT,
    nome_mes         VARCHAR(15),
    ano              SMALLINT,
    trimestre        SMALLINT,
    dia_semana       SMALLINT,
    nome_dia_semana  VARCHAR(15),
    fim_de_semana    BOOLEAN
);
COMMENT ON TABLE dim_tempo IS 'Dimensão calendário; chave AAAAMMDD. Carregada uma vez por intervalo.';

-- ------------------------------------------------------------
-- DIM_CLIENTE — SCD Tipo 2 (mantém histórico de mudanças,
-- por exemplo de cidade).
-- ------------------------------------------------------------
CREATE TABLE dim_cliente (
    sk_cliente     BIGSERIAL    PRIMARY KEY,
    id_cliente     BIGINT       NOT NULL,
    nome           VARCHAR(150),
    cidade         VARCHAR(100),
    uf             CHAR(2),
    data_cadastro  DATE,
    dt_inicio      DATE         NOT NULL,       -- início da validade da versão
    dt_fim         DATE,                        -- fim da validade (NULL = vigente)
    versao         INTEGER      DEFAULT 1,
    corrente       BOOLEAN      DEFAULT TRUE
);
COMMENT ON TABLE dim_cliente IS 'Dimensão cliente com versionamento SCD2.';

-- ------------------------------------------------------------
-- DIM_PRESTADOR — SCD Tipo 2 (acompanha mudança de plano,
-- verificação e faixa de preço ao longo do tempo).
-- ------------------------------------------------------------
CREATE TABLE dim_prestador (
    sk_prestador   BIGSERIAL    PRIMARY KEY,
    id_prestador   BIGINT       NOT NULL,
    nome           VARCHAR(150),
    cidade         VARCHAR(100),
    uf             CHAR(2),
    plano          VARCHAR(10),
    verificado     BOOLEAN,
    faixa_preco    SMALLINT,
    dt_inicio      DATE         NOT NULL,
    dt_fim         DATE,
    versao         INTEGER      DEFAULT 1,
    corrente       BOOLEAN      DEFAULT TRUE
);
COMMENT ON TABLE dim_prestador IS 'Dimensão prestador com versionamento SCD2.';

-- ------------------------------------------------------------
-- DIM_SERVICO — categoria do serviço (SCD Tipo 1).
-- ------------------------------------------------------------
CREATE TABLE dim_servico (
    sk_servico     SERIAL       PRIMARY KEY,
    id_categoria   INT          NOT NULL,
    nome_categoria VARCHAR(80)
);

-- ------------------------------------------------------------
-- DIM_PARCEIRO — empresa parceira (SCD Tipo 1).
-- ------------------------------------------------------------
CREATE TABLE dim_parceiro (
    sk_parceiro    BIGSERIAL    PRIMARY KEY,
    id_parceiro    BIGINT       NOT NULL,
    razao_social   VARCHAR(150),
    segmento       VARCHAR(100),
    cidade         VARCHAR(100),
    uf             CHAR(2)
);

-- ============================================================
-- FATOS
-- ============================================================

-- ------------------------------------------------------------
-- FATO_SERVICO — grão: um serviço concluído (um pedido).
-- Métricas de faturamento, comissão e demanda. Base dos
-- dashboards de cliente (gastos) e prestador (faturamento).
-- ------------------------------------------------------------
CREATE TABLE fato_servico (
    sk_fato_servico  BIGSERIAL    PRIMARY KEY,
    sk_tempo         INTEGER      NOT NULL REFERENCES dim_tempo(sk_tempo),
    sk_cliente       BIGINT       NOT NULL REFERENCES dim_cliente(sk_cliente),
    sk_prestador     BIGINT       NOT NULL REFERENCES dim_prestador(sk_prestador),
    sk_servico       INTEGER      NOT NULL REFERENCES dim_servico(sk_servico),
    id_pedido        BIGINT       NOT NULL,     -- dimensão degenerada (rastreio)
    valor_servico    NUMERIC(10,2),
    valor_comissao   NUMERIC(10,2),
    valor_prestador  NUMERIC(10,2),
    qtd_servicos     INTEGER      DEFAULT 1,
    nota_avaliacao   SMALLINT
);
COMMENT ON TABLE fato_servico IS 'Fato de serviços concluídos: faturamento, comissão e demanda.';

-- ------------------------------------------------------------
-- FATO_AVALIACAO — grão: uma avaliação. Permite análise de
-- satisfação por prestador, serviço e período.
-- ------------------------------------------------------------
CREATE TABLE fato_avaliacao (
    sk_fato_avaliacao BIGSERIAL   PRIMARY KEY,
    sk_tempo          INTEGER     NOT NULL REFERENCES dim_tempo(sk_tempo),
    sk_prestador      BIGINT      NOT NULL REFERENCES dim_prestador(sk_prestador),
    sk_cliente        BIGINT      NOT NULL REFERENCES dim_cliente(sk_cliente),
    sk_servico        INTEGER     REFERENCES dim_servico(sk_servico),
    id_avaliacao      BIGINT      NOT NULL,
    nota              SMALLINT,
    qtd_avaliacao     INTEGER     DEFAULT 1
);
COMMENT ON TABLE fato_avaliacao IS 'Fato de avaliações: notas atribuídas pelos clientes.';

-- ------------------------------------------------------------
-- FATO_INDICACAO_PARCEIRO — grão: uma indicação. Base do
-- dashboard da empresa parceira (funil indicação->contato->venda).
-- ------------------------------------------------------------
CREATE TABLE fato_indicacao_parceiro (
    sk_fato_indicacao BIGSERIAL   PRIMARY KEY,
    sk_tempo          INTEGER     NOT NULL REFERENCES dim_tempo(sk_tempo),
    sk_parceiro       BIGINT      NOT NULL REFERENCES dim_parceiro(sk_parceiro),
    id_indicacao      BIGINT      NOT NULL,
    qtd_indicacao     INTEGER     DEFAULT 1,
    qtd_contato       INTEGER     DEFAULT 0,
    qtd_venda         INTEGER     DEFAULT 0,
    valor_venda       NUMERIC(10,2)
);
COMMENT ON TABLE fato_indicacao_parceiro IS 'Fato de indicações de parceiros: funil de indicação a venda.';

-- ------------------------------------------------------------
-- ÍNDICES nas chaves estrangeiras dos fatos (aceleram os JOINs
-- com as dimensões nas consultas analíticas).
-- ------------------------------------------------------------
CREATE INDEX idx_fserv_tempo     ON fato_servico(sk_tempo);
CREATE INDEX idx_fserv_prestador ON fato_servico(sk_prestador);
CREATE INDEX idx_fserv_cliente   ON fato_servico(sk_cliente);
CREATE INDEX idx_fserv_servico   ON fato_servico(sk_servico);
CREATE INDEX idx_faval_prestador ON fato_avaliacao(sk_prestador);
CREATE INDEX idx_findic_parceiro ON fato_indicacao_parceiro(sk_parceiro);

-- ============================================================
-- EXEMPLOS DE CONSULTAS ANALÍTICAS QUE ALIMENTAM OS DASHBOARDS
-- ============================================================

-- Faturamento mensal do prestador (dashboard do prestador):
-- SELECT t.ano, t.mes, t.nome_mes,
--        SUM(f.valor_prestador) AS faturamento
-- FROM   fato_servico f
-- JOIN   dim_tempo     t ON t.sk_tempo = f.sk_tempo
-- JOIN   dim_prestador p ON p.sk_prestador = f.sk_prestador
-- WHERE  p.id_prestador = :id AND p.corrente = TRUE
-- GROUP  BY t.ano, t.mes, t.nome_mes
-- ORDER  BY t.ano, t.mes;

-- Gastos por categoria do cliente (dashboard do cliente):
-- SELECT s.nome_categoria, SUM(f.valor_servico) AS gasto
-- FROM   fato_servico f
-- JOIN   dim_servico  s ON s.sk_servico = f.sk_servico
-- JOIN   dim_cliente  c ON c.sk_cliente = f.sk_cliente
-- WHERE  c.id_cliente = :id AND c.corrente = TRUE
-- GROUP  BY s.nome_categoria
-- ORDER  BY gasto DESC;

-- Funil do parceiro (dashboard da empresa parceira):
-- SELECT SUM(qtd_indicacao) AS indicacoes,
--        SUM(qtd_contato)   AS contatos,
--        SUM(qtd_venda)     AS vendas
-- FROM   fato_indicacao_parceiro f
-- JOIN   dim_parceiro p ON p.sk_parceiro = f.sk_parceiro
-- WHERE  p.id_parceiro = :id;
