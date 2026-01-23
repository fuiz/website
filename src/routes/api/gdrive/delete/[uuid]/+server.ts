import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../../driveUtil';

export const GET: RequestHandler = async ({ params: { uuid }, cookies }) => {
	const drive = getDrive(cookies);
	const file = await getFileIdFromName(drive, uuid);

	if (!file) {
		error(404, 'File not found');
	}

	try {
		await drive.deleteFile(file);
		return new Response(null, { status: 204 });
	} catch (e) {
		error(500, 'Failed to delete file');
	}
};
