import 'unplugin-icons/types/svelte';
import type {
	Ai,
	D1Database,
	KVNamespace,
	R2Bucket,
	Service,
	Rpc
} from '@cloudflare/workers-types';

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
	namespace App {
		// interface Error {}
		// interface PageData {}
		interface Platform {
			env: {
				BUCKET: R2Bucket;
				PUBLISH_JOBS: KVNamespace;
				DATABASE: D1Database;
				MAP: KVNamespace;
				AI: Ai;
				COUNTER: CounterWorker;
			};
		}
	}
}

export {};
