import OpenAI from 'openai'

if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not defined in environment variables')
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const MODELS = {
  CHAT: 'gpt-4o',
  VISION: 'gpt-4o',
  WHISPER: 'whisper-1',
} as const
