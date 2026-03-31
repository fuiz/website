// Stub for bun:sqlite when building for Cloudflare Workers.
// The sqlite implementations are only used in non-Cloudflare environments.
throw new Error('bun:sqlite is not available in this environment');
