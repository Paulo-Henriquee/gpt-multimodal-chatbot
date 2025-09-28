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
3. Configure o banco PostgreSQL com Docker: `docker-compose up -d`
4. Configure as variáveis de ambiente (`.env`)
5. Execute as migrations do banco: `npx prisma migrate dev`
6. Inicie o servidor: `npm run dev`
7. Acesse: `http://localhost:3000`

## ✨ Funcionalidades Implementadas

### 💬 Chat Inteligente
- Conversas em tempo real com streaming
- Histórico persistido no banco de dados
- System prompt personalizado para comportamento da IA

### 🖼️ Análise de Imagem
- Upload de imagens via drag & drop ou botão
- Análise automática com GPT-4o Vision
- Conversão Base64 para máxima compatibilidade

### 🎨 Interface Moderna
- Design responsivo com TailwindCSS
- Componentes Shadcn/UI
- Estados de loading e feedback visual
- Scroll automático e UX otimizada

## 📝 Status do Projeto

- [x] Configuração inicial do projeto
- [x] Configuração do banco de dados (PostgreSQL + Prisma)
- [x] API de chat com streaming em tempo real
- [x] Análise de imagem via Base64 (GPT-4o Vision)
- [x] Interface de chat moderna e responsiva
- [x] Persistência de conversas no banco
- [x] System prompt personalizado
- [ ] Upload e transcrição de áudio (Whisper)
- [ ] Sidebar com histórico de conversas
- [ ] Busca no histórico

## 🔧 Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Database Configuration (Docker Local)
DATABASE_URL="postgresql://chatbot_user:chatbot_password@localhost:5432/chatbot_db?schema=public"

# NextAuth Configuration
NEXTAUTH_SECRET=your_nextauth_secret_here
NEXTAUTH_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

## 🐳 Docker Setup

O projeto inclui configuração Docker para PostgreSQL:

```bash
# Subir o banco de dados
docker-compose up -d

# Verificar se está rodando
docker ps
```

## 🎯 Próximas Implementações

- [ ] Upload e transcrição de áudio com Whisper API
- [ ] Sidebar com histórico de conversas
- [ ] Busca e filtros no histórico
- [ ] Exportação de conversas
- [ ] Temas dark/light
- [ ] Deploy automatizado