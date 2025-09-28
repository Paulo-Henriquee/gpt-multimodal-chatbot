import OpenAI from 'openai'
import { env } from './env'

export const openai = new OpenAI({
  apiKey: env.OPENAI_API_KEY,
})

export const MODELS = {
  CHAT: 'gpt-4o',
  VISION: 'gpt-4o',
  WHISPER: 'whisper-1',
} as const
