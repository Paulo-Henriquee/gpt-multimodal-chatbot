// Garantir que as variáveis de ambiente sejam carregadas
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config()

// Validar variáveis obrigatórias
const requiredEnvVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  DATABASE_URL: process.env.DATABASE_URL,
} as const

// Verificar se todas as variáveis estão definidas
for (const [key, value] of Object.entries(requiredEnvVars)) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
}

export const env = {
  OPENAI_API_KEY: requiredEnvVars.OPENAI_API_KEY,
  DATABASE_URL: requiredEnvVars.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const
