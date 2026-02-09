import { error } from '@sveltejs/kit';
import { getDrive, getFilesIdFromName } from '../../driveUtil';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params: { hash }, cookies, request }) => {
	const drive = getDrive(cookies);
	const data = await request.text();

	const existingFiles = await getFilesIdFromName(drive, hash);
	if (existingFiles && existingFiles.length > 0) {
		return new Response(null, { status: 200 });
	}

	try {
		await drive.create(
			{
				name: hash,
				mimeType: 'text/plain'
			},
			{
				type: 'text/plain',
				data
			}
		);

		return new Response(null, { status: 201 });
	} catch (err) {
		console.error('Failed to create image', err);
		error(500, 'Failed to create image');
	}
};

// GET - Retrieve an image by hash
export const GET: RequestHandler = async ({ params: { hash }, cookies }) => {
	const drive = getDrive(cookies);
	const files = await getFilesIdFromName(drive, hash);

	if (!files || files.length === 0) {
		error(404, 'Image not found');
	}

	const content = await drive.content(files[0]);

	return new Response(content);
};

// HEAD - Check if an image exists
export const HEAD: RequestHandler = async ({ params: { hash }, cookies }) => {
	const drive = getDrive(cookies);
	const files = await getFilesIdFromName(drive, hash);

	if (!files || files.length === 0) {
		return new Response(null, { status: 404 });
	}

	return new Response(null, { status: 200 });
};
