/**
 * Mock AI streaming text generator
 * Simulates realistic AI generation timing with ReadableStream
 * No external dependencies - uses native browser APIs
 */

import { BID_TEMPLATES, expandTemplate, type TemplateContext } from './bid-templates'

export type GeneratorConfig = {
  chunkDelayMs: number    // Delay between chunks (default: 80ms)
  initialDelayMs: number  // Delay before first chunk (default: 800ms)
  wordsPerChunk: number   // Words per chunk (default: 5)
}

const DEFAULT_CONFIG: GeneratorConfig = {
  chunkDelayMs: 80,
  initialDelayMs: 800,
  wordsPerChunk: 5,
}

/**
 * Create mock stream with realistic timing delays
 * Returns ReadableStream<string> that progressively emits text chunks
 */
export function createMockStream(
  text: string,
  config: GeneratorConfig = DEFAULT_CONFIG
): ReadableStream<string> {
  const words = text.split(' ')
  const chunks: string[] = []

  // Chunk words into realistic sizes
  for (let i = 0; i < words.length; i += config.wordsPerChunk) {
    const wordSlice = words.slice(i, i + config.wordsPerChunk)
    chunks.push(wordSlice.join(' ') + (i + config.wordsPerChunk < words.length ? ' ' : ''))
  }

  return new ReadableStream<string>({
    async start(controller) {
      // Initial delay (simulates AI "thinking")
      await new Promise(resolve => setTimeout(resolve, config.initialDelayMs))

      // Stream chunks with realistic delays
      for (const chunk of chunks) {
        controller.enqueue(chunk)
        await new Promise(resolve => setTimeout(resolve, config.chunkDelayMs))
      }

      controller.close()
    }
  })
}

/**
 * Generate bid section using template + mock streaming
 * Returns ReadableStream<string> for progressive UI updates
 */
export function generateBidSection(
  sectionId: string,
  answers: Record<string, unknown>,
  tenderTitle: string,
  config: GeneratorConfig = DEFAULT_CONFIG
): ReadableStream<string> {
  // Get template for this section
  const template = BID_TEMPLATES[sectionId]

  if (!template) {
    throw new Error(`Unknown section ID: ${sectionId}`)
  }

  // Expand template with answers and context
  const context: TemplateContext = { tenderTitle }
  const fullText = expandTemplate(template, answers, context)

  // Return mock stream with realistic timing
  return createMockStream(fullText, config)
}
