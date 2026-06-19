/* ============================================================
   REMIO — Backend de IA (server.js)
   ------------------------------------------------------------
   Pequeno servidor que recebe as avaliações dos clientes e usa
   a API da Claude (Anthropic) para devolver uma análise
   estruturada: sentimento, temas recorrentes, pontos fortes,
   pontos de melhoria e sugestões.

   SEGURANÇA: a chave da API (ANTHROPIC_API_KEY) fica apenas
   aqui, no servidor — nunca no site, que é público. Este é o
   mesmo princípio de proteção de segredos descrito no documento
   de Arquitetura, Segurança e Qualidade.
   ============================================================ */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Anthropic from '@anthropic-ai/sdk';

const PORTA = process.env.PORT || 3000;
const MODELO = 'claude-opus-4-8'; // modelo mais capaz da Anthropic

const app = express();
app.use(cors());                 // libera o acesso do site (demonstração)
app.use(express.json({ limit: '1mb' }));

/* Cliente da Anthropic — lê a chave de ANTHROPIC_API_KEY no ambiente */
const client = new Anthropic();

/* ------------------------------------------------------------
   Esquema da resposta (saída estruturada / JSON Schema).
   Garante que a Claude responda sempre no formato esperado.
   ------------------------------------------------------------ */
const ESQUEMA = {
  type: 'object',
  properties: {
    sentimento_geral: { type: 'string', enum: ['positivo', 'neutro', 'negativo'] },
    indice_satisfacao: { type: 'integer', description: 'Índice de 0 a 100' },
    resumo: { type: 'string', description: 'Resumo em 1-2 frases' },
    temas: {
      type: 'array',
      description: 'Temas recorrentes identificados nos comentários',
      items: {
        type: 'object',
        properties: {
          tema: { type: 'string' },
          mencoes: { type: 'integer' },
          sentimento: { type: 'string', enum: ['positivo', 'neutro', 'negativo'] }
        },
        required: ['tema', 'mencoes', 'sentimento'],
        additionalProperties: false
      }
    },
    pontos_fortes: { type: 'array', items: { type: 'string' } },
    pontos_de_melhoria: { type: 'array', items: { type: 'string' } },
    sugestoes: { type: 'array', items: { type: 'string' } }
  },
  required: ['sentimento_geral', 'indice_satisfacao', 'resumo', 'temas',
             'pontos_fortes', 'pontos_de_melhoria', 'sugestoes'],
  additionalProperties: false
};

const SISTEMA = `Você é um analista de experiência do cliente da plataforma Remio,
um marketplace de serviços domésticos. Sua tarefa é analisar avaliações reais de
clientes e extrair, de forma objetiva e em português do Brasil: o sentimento geral,
um índice de satisfação de 0 a 100, os temas recorrentes (com quantas vezes cada um
aparece e o sentimento associado), os pontos fortes, os pontos de melhoria e
sugestões práticas e acionáveis para a plataforma. Seja conciso e baseie-se apenas
no que está nos comentários.`;

/* ------------------------------------------------------------
   Endpoint principal: recebe { avaliacoes: [...], contexto }
   e devolve a análise estruturada.
   ------------------------------------------------------------ */
app.post('/api/analisar', async (req, res) => {
  try {
    const { avaliacoes, contexto } = req.body || {};

    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(401).json({ erro: 'Chave da API não configurada. Crie o arquivo .env com ANTHROPIC_API_KEY (veja o README do backend).' });
    }
    if (!Array.isArray(avaliacoes) || avaliacoes.length === 0) {
      return res.status(400).json({ erro: 'Envie um array "avaliacoes" com ao menos um comentário.' });
    }

    // Monta o texto das avaliações para o prompt
    const lista = avaliacoes
      .map((a, i) => `${i + 1}. (nota ${a.nota ?? '?'}/5) ${a.texto ?? a}`)
      .join('\n');

    const prompt = `Analise as avaliações de clientes a seguir${contexto ? ` sobre ${contexto}` : ''}:\n\n${lista}`;

    const resposta = await client.messages.create({
      model: MODELO,
      max_tokens: 8000,
      thinking: { type: 'adaptive' },          // deixa a Claude raciocinar conforme a necessidade
      output_config: {
        effort: 'medium',
        format: { type: 'json_schema', schema: ESQUEMA }  // resposta sempre no formato definido
      },
      system: SISTEMA,
      messages: [{ role: 'user', content: prompt }]
    });

    // A saída estruturada vem no bloco de texto, como JSON válido
    const blocoTexto = resposta.content.find(b => b.type === 'text');
    const analise = JSON.parse(blocoTexto.text);

    res.json({
      analise,
      meta: {
        modelo: resposta.model,
        avaliacoes_analisadas: avaliacoes.length,
        tokens: resposta.usage
      }
    });
  } catch (err) {
    console.error('Erro ao analisar:', err.message);
    if (err instanceof Anthropic.AuthenticationError) {
      return res.status(401).json({ erro: 'Chave da API inválida ou ausente. Verifique o arquivo .env.' });
    }
    res.status(500).json({ erro: 'Falha ao analisar as avaliações.', detalhe: err.message });
  }
});

/* Verificação de saúde — útil para o health check (observabilidade) */
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', modelo: MODELO, chave_configurada: Boolean(process.env.ANTHROPIC_API_KEY) });
});

app.listen(PORTA, () => {
  console.log(`\n  Remio — Backend de IA rodando em http://localhost:${PORTA}`);
  console.log(`  Modelo: ${MODELO}`);
  console.log(`  Chave da API ${process.env.ANTHROPIC_API_KEY ? 'configurada ✓' : 'NÃO configurada ✗ (crie o arquivo .env)'}\n`);
});
