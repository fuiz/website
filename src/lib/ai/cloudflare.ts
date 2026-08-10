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

		// `output_text` is declared on the response type but the binding never
		// fills it in, so read the reply out of `output` instead. The model
		// reasons before it answers, which is why the message is not simply the
		// first item, and a refusal sits in the same content list as the text.
		const message = response.output?.find((item) => item.type === 'message');
		const answer = message?.content.find((content) => content.type === 'output_text');

		return answer?.text || null;
	}
}
