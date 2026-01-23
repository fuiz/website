import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive } from '../../driveUtil';
import type { InternalFuiz } from '$lib/storage';

export const POST: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);
	const internalFuiz: InternalFuiz = await request.json();

	const properties = {
		lastEdited: String(internalFuiz.lastEdited ?? Date.now()),
		versionId: String(internalFuiz.versionId ?? 0)
	};

	try {
		await drive.create(
			{
				name: uuid,
				mimeType: 'application/json',
				properties
			},
			{
				type: 'application/json',
				data: JSON.stringify(internalFuiz.config)
			}
		);

		return new Response(null, { status: 201 });
	} catch (e) {
		error(500, 'Failed to create file');
	}
};
