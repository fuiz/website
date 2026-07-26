import { error } from '@sveltejs/kit';
import type { InternalReport, ReportBody } from '$lib/storage';
import { getDrive, getFilesIdFromName, REPORT_MIME_TYPE } from '../../driveUtil';
import type { RequestHandler } from './$types';

/** Metadata rides in Drive file properties, so only the body goes in the file itself. */
function toBody(report: InternalReport): ReportBody {
	const { uniqueId: _uniqueId, versionId: _versionId, lastEdited: _lastEdited, ...body } = report;
	return body;
}

function toProperties(report: InternalReport) {
	return {
		lastEdited: String(report.lastEdited ?? Date.now()),
		versionId: String(report.versionId ?? 0)
	};
}

// GET - Read a report file
export const GET: RequestHandler = async ({ params: { uuid }, cookies }) => {
	const drive = getDrive(cookies);
	const files = await getFilesIdFromName(drive, uuid);

	if (!files || files.length === 0) {
		error(404, 'File not found');
	}

	const content = await drive.content(files[0]);

	return new Response(content, {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

// POST - Create a new report file
export const POST: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);

	const existingFiles = await getFilesIdFromName(drive, uuid);
	if (existingFiles && existingFiles.length > 0) {
		error(409, 'File already exists');
	}

	const report: InternalReport = await request.json();

	try {
		await drive.create(
			{
				name: uuid,
				mimeType: REPORT_MIME_TYPE,
				properties: toProperties(report)
			},
			{
				type: 'application/json',
				data: JSON.stringify(toBody(report))
			}
		);

		return new Response(null, { status: 201 });
	} catch (err) {
		console.error('Failed to create report', err);
		error(500, 'Failed to create report');
	}
};

// PUT - Update an existing report file
export const PUT: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);
	const report: InternalReport = await request.json();

	const existingFiles = await getFilesIdFromName(drive, uuid);
	if (!existingFiles || existingFiles.length === 0) {
		error(404, 'File not found');
	}

	try {
		await drive.update(
			{
				...existingFiles[0],
				properties: toProperties(report)
			},
			{
				type: 'application/json',
				data: JSON.stringify(toBody(report))
			}
		);

		return new Response(null, { status: 200 });
	} catch (err) {
		console.error('Failed to update report', err);
		error(500, 'Failed to update report');
	}
};

// DELETE - Delete a report file
export const DELETE: RequestHandler = async ({ params: { uuid }, cookies }) => {
	const drive = getDrive(cookies);
	const files = await getFilesIdFromName(drive, uuid);

	if (!files || files.length === 0) {
		error(404, 'File not found');
	}

	try {
		for (const file of files) {
			await drive.deleteFile(file);
		}
		return new Response(null, { status: 204 });
	} catch (err) {
		console.error('Failed to delete report', err);
		error(500, 'Failed to delete report');
	}
};
