// * This is main request handler for items
import { writeFile } from 'fs/promises';
import { APIError } from '../utils/customErrors.js';
import { fetchDataAsync } from '../utils/fileProcessor.js';
import paginateData from '../utils/paginator.js';

class ItemsController {
	async listItems(req, res, next) {
		try {
			const data = await fetchDataAsync(global.DATA_PATH);
			// * Validated query from middleware
			const { limit, page, q } = req.query;
			const paginatedData = paginateData(data, limit, page, q);
			res.json(paginatedData);
		}
		catch (err) {
			next(err);
		}
	}

	async getItemById(req, res, next) {
		try {
			const data = await fetchDataAsync(global.DATA_PATH);

			// * Validated id from middleware
			const { id } = req.params;
			// check id is a string, then parse it to int
			const itemId = typeof id === 'string' ? parseInt(id) : id;
			const item = data.find(i => i.id === itemId);

			if (!item) {
				throw new APIError('Item not found', 404);
			}
			res.json(item);
		}
		catch (err) {
			next(err);
		}
	}

	async createItem(req, res, next) {
		try {
			// * Validated item from middleware
			const item = req.body;
			// * Validated file data from middleware
			const data = req.data;

			// * New unique id
			item.id = Date.now();

			// * Write to file asynchronously
			if (data && data.length > 0) {
				data.push(item);
			} else {
				data = [item];
			}
			const jsonString = JSON.stringify(data, null, 2);
			await writeFile(global.DATA_PATH, jsonString, 'utf8');

			res.status(201).json(item);
		}
		catch (err) {
			next(err);
		}
	}

	// Add other handlers afterwards
}

export default new ItemsController();   