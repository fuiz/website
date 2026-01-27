import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDrive, getFileIdFromName } from '../../driveUtil';
import type { InternalFuiz } from '$lib/storage';

// GET - Read a fuiz file
export const GET: RequestHandler = async ({ params: { uuid }, cookies }) => {
	const drive = getDrive(cookies);
	const file = await getFileIdFromName(drive, uuid);

	if (!file) {
		error(404, 'File not found');
	}

	const content = await drive.content(file);

	return new Response(content, {
		headers: {
			'Content-Type': 'application/json'
		}
	});
};

// POST - Create a new fuiz file
export const POST: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);
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
	} catch {
		error(500, 'Failed to create file');
	}
};

// PUT - Update an existing fuiz file
export const PUT: RequestHandler = async ({ params: { uuid }, cookies, request }) => {
	const drive = getDrive(cookies);
	const internalFuiz: InternalFuiz = await request.json();

	const fileName = `${uuid}.json`;

	const file = await getFileIdFromName(drive, fileName);

	if (!file) {
		error(404, 'File not found');
	}

	const properties = {
		lastEdited: String(internalFuiz.lastEdited ?? Date.now()),
		versionId: String(internalFuiz.versionId ?? 0)
	};

	try {
		await drive.update(
			{
				...file,
				properties
			},
			{
				type: 'application/json',
				data: JSON.stringify(internalFuiz.config)
			}
		);

		return new Response(null, { status: 200 });
	} catch {
		error(500, 'Failed to update file');
	}
};

// DELETE - Delete a fuiz file
export const DELETE: RequestHandler = async ({ params: { uuid }, cookies }) => {
	const drive = getDrive(cookies);
	const file = await getFileIdFromName(drive, uuid);

	if (!file) {
		error(404, 'File not found');
	}

	try {
		await drive.deleteFile(file);
		return new Response(null, { status: 204 });
	} catch {
		error(500, 'Failed to delete file');
	}
};
