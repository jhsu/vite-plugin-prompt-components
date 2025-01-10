import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { createAnthropic } from '@ai-sdk/anthropic'

import promptComponents from 'vite-plugin-prompt-components'

export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), '') }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY environment variable')
  }

  const client = createAnthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
  const model = client.languageModel('claude-3-5-haiku-latest')

  return defineConfig({
    plugins: [promptComponents({
      model,
    }), react({
      parserConfig(id) {
        if (id.endsWith('.promptx') || id.endsWith('.tsx')) {
          return {
            syntax: 'typescript',
            tsx: true,
          }
        }
      }
    })],
  })
})
