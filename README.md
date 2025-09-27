# 🤖 GPT Multimodal Chatbot

Um agente estilo ChatGPT com chat em tempo real, upload de áudio (transcrição), upload de imagem (análise) e histórico persistido em banco de dados.

## 🛠️ Tecnologias

### Frontend
- **Next.js** (TypeScript) - Framework fullstack moderno
- **TailwindCSS** - Estilização rápida e responsiva
- **Shadcn/UI** - Componentes de interface prontos
- **React Query** - Controle de requests/streaming

### Backend
- **LangChain.js** - Orquestração das chains, memória e tools
- **OpenAI SDK** - Acesso aos modelos GPT, Whisper e Vision
- **Node.js/Express** - API Routes do Next.js
- **Zod** - Validação de schemas

### IA / Modelos
- **GPT-4o** - Chat e raciocínio multimodal
- **Whisper API** - Transcrição de áudio
- **GPT-4o Vision** - Análise de imagens

### Banco de Dados
- **Postgres** - Persistência das conversas e mídia
- **Prisma ORM** - Schema, migrations e queries

## ⚡ Fluxo

```
Usuário → (Texto/Áudio/Imagem) → Frontend → API (Next.js) → LangChain Chain → OpenAI (GPT/Whisper/Vision) → Resposta em streaming → Persistência no Postgres (via Prisma)
```

## 🚀 Como executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente (`.env.local`)
4. Execute as migrations do banco: `npx prisma migrate dev`
5. Inicie o servidor: `npm run dev`

## 📝 Status do Projeto

- [x] Configuração inicial do projeto
- [ ] Configuração do banco de dados
- [ ] API de chat com streaming
- [ ] Upload e transcrição de áudio
- [ ] Upload e análise de imagem
- [ ] Interface de chat em tempo real
- [ ] Histórico de conversas

## 🔧 Variáveis de Ambiente

```env
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_postgres_connection_string
NEXTAUTH_SECRET=your_nextauth_secret
```