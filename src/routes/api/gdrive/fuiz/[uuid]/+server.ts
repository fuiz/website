import { error } from '@sveltejs/kit';
import type { InternalFuiz } from '$lib/storage';
import { getDrive, getFilesIdFromName } from '../../driveUtil';
import type { RequestHandler } from './$types';

// GET - Read a fuiz file
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

// POST - Create a new fuiz file
export const POST: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);

	const existingFiles = await getFilesIdFromName(drive, uuid);
	if (existingFiles && existingFiles.length > 0) {
		error(409, 'File already exists');
	}

	const internalFuiz: InternalFuiz = await request.json();

	const properties = {
		lastEdited: String(internalFuiz.lastEdited ?? Date.now()),
		versionId: String(internalFuiz.versionId ?? 0)
	};

	try {
		await drive.create(
			{
				name: uuid,
				mimeType: 'application/json',
				properties
			},
			{
				type: 'application/json',
				data: JSON.stringify(internalFuiz.config)
			}
		);

		return new Response(null, { status: 201 });
	} catch (err) {
		console.error('Failed to create file', err);
		error(500, 'Failed to create file');
	}
};

// PUT - Update an existing fuiz file
export const PUT: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);
	const internalFuiz: InternalFuiz = await request.json();

	const existingFiles = await getFilesIdFromName(drive, uuid);
	if (!existingFiles || existingFiles.length === 0) {
		error(404, 'File not found');
	}

	const properties = {
		lastEdited: String(internalFuiz.lastEdited ?? Date.now()),
		versionId: String(internalFuiz.versionId ?? 0)
	};

	try {
		await drive.update(
			{
				...existingFiles[0],
				properties
			},
			{
				type: 'application/json',
				data: JSON.stringify(internalFuiz.config)
			}
		);

		return new Response(null, { status: 200 });
	} catch (err) {
		console.error('Failed to update file', err);
		error(500, 'Failed to update file');
	}
};

// DELETE - Delete a fuiz file
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
		console.error('Failed to delete file', err);
		error(500, 'Failed to delete file');
	}
};
