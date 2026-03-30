/**
 * Base AI abstract class
 * Provides a simple interface for text generation with structured output
 */

export abstract class BaseAI {
	abstract generateKeywords(systemPrompt: string, userContent: string): Promise<string | null>;
}
