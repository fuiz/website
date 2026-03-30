/**
 * Cloudflare Workers AI implementation
 */

import type { Ai } from '@cloudflare/workers-types';
import { BaseAI } from './base';

export class CloudflareAI extends BaseAI {
	private ai: Ai;

	constructor(ai: Ai) {
		super();
		this.ai = ai;
	}

	async generateKeywords(systemPrompt: string, userContent: string): Promise<string | null> {
		const response = await this.ai.run('@cf/openai/gpt-oss-20b', {
			instructions: systemPrompt,
			input: userContent,
			text: {
				format: {
					type: 'json_schema',
					name: 'output',
					schema: {
						type: 'array',
						items: { type: 'string' }
					}
				}
			}
		});

		return response.output_text || null;
	}
}
