import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../../driveUtil';

export const GET: RequestHandler = async ({ params: { hash }, cookies }) => {
	const drive = getDrive(cookies);
	const file = await getFileIdFromName(drive, hash);

	if (!file) {
		error(404, 'Image not found');
	}

	const content = await drive.content(file);

	return new Response(content, {
		headers: {
			'Content-Type': 'text/plain'
		}
	});
};
