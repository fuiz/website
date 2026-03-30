import type {
	Ai,
	D1Database,
	KVNamespace,
	R2Bucket,
	Rpc,
	Service
} from '@cloudflare/workers-types';
import type { BaseAI } from '$lib/ai/base';
import type { BaseBlobStorage } from '$lib/blob/base';
import type { BaseDatabase } from '$lib/db/base';
import type { BaseKVStore } from '$lib/kv/base';

type CountersObject = {
	[key: string]: number;
};

type CounterService = {
	getAllCounts(): Promise<CountersObject>;
};

export type CloudflareWorkerEntrypoint<T> = {
	[Rpc.__WORKER_ENTRYPOINT_BRAND]: never; // To satisfy the Cloudflare type system.
} & T;

type CounterWorker = Service<CloudflareWorkerEntrypoint<CounterService>>;

// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace svelteHTML {
		interface HTMLAttributes {
			interestfor?: string;
		}
	}
	namespace App {
		// interface Error {}
		// interface PageData {}
		interface Locals {
			ai?: BaseAI;
			blobStorage?: BaseBlobStorage;
			database?: BaseDatabase;
			shareStore?: BaseKVStore;
			publishJobsStore?: BaseKVStore;
		}
		interface Platform {
			env?: {
				BUCKET?: R2Bucket;
				PUBLISH_JOBS?: KVNamespace;
				DATABASE?: D1Database;
				MAP?: KVNamespace;
				AI?: Ai;
				COUNTER?: CounterWorker;
			};
		}
	}
}
