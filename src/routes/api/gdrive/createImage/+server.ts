import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../driveUtil';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const drive = getDrive(cookies);
	const data = await request.text();

	let hash: string;
	try {
		const parsed = JSON.parse(data);
		if (parsed.Image?.HashReference?.hash) {
			hash = parsed.Image.HashReference.hash;
		} else {
			error(400, 'Invalid image data');
		}
	} catch {
		error(400, 'Invalid JSON');
	}

	const existingFile = await getFileIdFromName(drive, hash);
	if (existingFile) {
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
	} catch {
		error(500, 'Failed to create image');
	}
};
