import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../../driveUtil';

// GET - Retrieve an image by hash
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

// HEAD - Check if an image exists
export const HEAD: RequestHandler = async ({ params: { hash }, cookies }) => {
	const drive = getDrive(cookies);
	const file = await getFileIdFromName(drive, hash);

	if (!file) {
		return new Response(null, { status: 404 });
	}

	return new Response(null, { status: 200 });
};
