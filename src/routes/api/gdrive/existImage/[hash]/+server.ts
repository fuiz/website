import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../../driveUtil';

export const GET: RequestHandler = async ({ params: { hash }, cookies }) => {
	const drive = getDrive(cookies);
	const file = await getFileIdFromName(drive, hash);

	return new Response(JSON.stringify(!!file), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
