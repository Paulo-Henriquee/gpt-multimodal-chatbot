import OpenAI from 'openai'
import { env } from './env'

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export const MODELS = {
  CHAT: 'gpt-4o-mini',      // 💰 Mais econômico para texto
  VISION: 'gpt-4o-mini',    // 🖼️ Funciona com imagens + mais barato
  WHISPER: 'whisper-1',     // 🎤 Continua igual
} as const
