import { getCreations, getDrive } from '../driveUtil';
import type { RequestHandler } from './$types';

// GET - List all fuiz files
export const GET: RequestHandler = async ({ cookies }) => {
	const drive = getDrive(cookies);

	const files = await getCreations(drive, (file) => {
		const properties = file.properties;
		return {
			uniqueId: file.name,
			lastEdited: Number(properties.lastEdited),
			versionId: Number(properties.versionId)
		};
	});

	return new Response(JSON.stringify(files), {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};
