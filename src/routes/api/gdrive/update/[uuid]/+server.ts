import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../../driveUtil';
import type { InternalFuiz } from '$lib/storage';

export const POST: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);
	const internalFuiz: InternalFuiz = await request.json();

	const fileName = `${uuid}.json`;

	const file = await getFileIdFromName(drive, fileName);

	if (!file) {
		error(404, 'File not found');
	}

	const properties = {
		lastEdited: String(internalFuiz.lastEdited ?? Date.now()),
		versionId: String(internalFuiz.versionId ?? 0)
	};

	try {
		await drive.update(
			{
				...file,
				properties
			},
			{
				type: 'application/json',
				data: JSON.stringify(internalFuiz.config)
			}
		);

		return new Response(null, { status: 200 });
	} catch (e) {
		error(500, 'Failed to update file');
	}
};
