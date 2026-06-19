# Remio — Backend de IA (análise de avaliações com a API da Claude)

Este backend recebe as avaliações dos clientes e usa a **API da Claude (Anthropic)**
para gerar uma análise estruturada — sentimento, temas recorrentes, pontos fortes,
pontos de melhoria e sugestões. É o fluxo de IA descrito no documento de Arquitetura.

> **Por que um backend?** A chave da API é um segredo. Se ela ficasse no código do
> site (que é público no GitHub Pages), qualquer pessoa poderia copiá-la e usá-la.
> O backend guarda a chave com segurança e o site apenas conversa com ele — exatamente
> o princípio de proteção de segredos da seção de segurança do TCC.

## Pré-requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- Uma chave de API da Anthropic — crie em https://console.anthropic.com/

## Como rodar (passo a passo)

1. Abra um terminal nesta pasta (`remio/backend`).

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Crie o arquivo de configuração com a sua chave:
   - Copie `.env.example` para `.env`
   - Abra o `.env` e cole a sua chave em `ANTHROPIC_API_KEY=...`

4. Inicie o servidor:
   ```bash
   npm start
   ```
   Você verá: `Remio — Backend de IA rodando em http://localhost:3000`

5. Abra o site (`index.html` ou o site no ar) e vá em **Insights IA**.
   A página vai conversar com este backend e exibir a análise.

## Endpoints

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/analisar` | Recebe `{ avaliacoes: [...], contexto }` e devolve a análise estruturada. |
| `GET` | `/api/health` | Verifica se o servidor está no ar e se a chave está configurada. |

### Exemplo de requisição

```bash
curl -X POST http://localhost:3000/api/analisar \
  -H "Content-Type: application/json" \
  -d '{"avaliacoes":[{"nota":5,"texto":"Serviço excelente, muito pontual!"}],"contexto":"faxina"}'
```

## Tecnologia

- **@anthropic-ai/sdk** — SDK oficial da Anthropic
- **Modelo:** `claude-opus-4-8`
- **Saída estruturada** (`output_config.format` com JSON Schema) — garante que a
  resposta venha sempre no formato esperado, pronta para exibir nos gráficos.
- **Express + CORS** — servidor HTTP simples.

## Observações de segurança

- A chave fica só no `.env`, que está no `.gitignore` (nunca vai para o GitHub).
- O CORS está liberado para facilitar a demonstração acadêmica. Em produção,
  ele seria restrito ao domínio do site.
