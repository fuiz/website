/**
 * OpenAI-compatible API implementation
 * Works with OpenAI, OpenRouter, Ollama, LiteLLM, and any provider
 * that implements the OpenAI chat completions API
 */

import { BaseAI } from './base';

export class OpenAICompatibleAI extends BaseAI {
	private baseUrl: string;
	private apiKey: string | undefined;
	private model: string;

	constructor(baseUrl: string, apiKey: string | undefined, model: string) {
		super();
		this.baseUrl = baseUrl;
		this.apiKey = apiKey;
		this.model = model;
	}

	async generateKeywords(systemPrompt: string, userContent: string): Promise<string | null> {
		const headers: Record<string, string> = {
			'Content-Type': 'application/json'
		};

		if (this.apiKey) {
			headers.Authorization = `Bearer ${this.apiKey}`;
		}

		const response = await fetch(`${this.baseUrl}/chat/completions`, {
			method: 'POST',
			headers,
			body: JSON.stringify({
				model: this.model,
				messages: [
					{ role: 'system', content: systemPrompt },
					{ role: 'user', content: userContent }
				],
				response_format: { type: 'json_object' }
			})
		});

		if (!response.ok) {
			console.error('AI request failed:', response.status, await response.text());
			return null;
		}

		const data = await response.json();
		return data.choices?.[0]?.message?.content || null;
	}
}
