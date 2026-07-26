import { getDrive, getReports } from '../driveUtil';
import type { RequestHandler } from './$types';

// GET - List all report files
export const GET: RequestHandler = async ({ cookies }) => {
	const drive = getDrive(cookies);

	const files = (await getReports(drive)).map((file) => {
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
