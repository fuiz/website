import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../../driveUtil';

export const GET: RequestHandler = async ({ params: { uuid }, cookies }) => {
	const drive = getDrive(cookies);
	const file = await getFileIdFromName(drive, uuid);

	if (!file) {
		error(404, 'File not found');
	}

	const content = await drive.content(file);

	return new Response(content, {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
