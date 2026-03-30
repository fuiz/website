/**
 * AI factory
 * Creates appropriate AI instance based on AI_PROVIDER environment variable
 */

import type { Ai } from '@cloudflare/workers-types';
import { env } from '$env/dynamic/private';
import type { BaseAI } from './base';

export type AIProvider = 'cloudflare' | 'openai';

/**
 * Create an AI instance based on environment configuration
 *
 * Environment variables:
 *   AI_PROVIDER: 'cloudflare' | 'openai' (defaults to 'cloudflare' if AI binding exists, otherwise 'openai')
 *   OPENAI_API_KEY: API key for OpenAI-compatible provider (optional, e.g. Ollama doesn't need one)
 *   OPENAI_BASE_URL: Base URL for OpenAI-compatible provider (e.g. 'https://api.openai.com/v1', 'http://ollama:11434/v1')
 *   AI_MODEL: Model name (defaults to 'gpt-4o-mini')
 *
 * @param aiBinding - Cloudflare AI binding (optional)
 */
export async function createAI(aiBinding?: Ai): Promise<BaseAI | undefined> {
	const provider = (env.AI_PROVIDER as AIProvider) || (aiBinding ? 'cloudflare' : 'openai');

	switch (provider) {
		case 'cloudflare': {
			if (!aiBinding) {
				console.error('AI_PROVIDER is cloudflare but no AI binding found');
				return undefined;
			}
			const { CloudflareAI } = await import('./cloudflare');
			return new CloudflareAI(aiBinding);
		}
		case 'openai': {
			const baseUrl = env.OPENAI_BASE_URL;
			if (!baseUrl) {
				console.error('AI_PROVIDER is openai but OPENAI_BASE_URL is not set');
				return undefined;
			}
			const apiKey = env.OPENAI_API_KEY;
			const model = env.AI_MODEL || 'gpt-4o-mini';
			const { OpenAICompatibleAI } = await import('./openai');
			return new OpenAICompatibleAI(baseUrl, apiKey, model);
		}
		default:
			console.error(`Unknown AI_PROVIDER: ${provider}`);
			return undefined;
	}
}
