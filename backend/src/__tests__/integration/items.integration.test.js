// test.todo('Items API Integration Tests');
import request from 'supertest';
import { writeFile, readFile } from 'fs/promises';
import app from '../../app.js';
import constants from '../../configs/constants.js';

describe('Items API Integration Tests', () => {
    let originalData;
    const testDataPath = constants.DATA_PATH;

    beforeAll(async () => {
        // Store original data
        originalData = await readFile(testDataPath, 'utf8');
        // console.log("originalData.length", originalData.length);
        // Set test data path
        global.DATA_PATH = testDataPath;
    });

    afterEach(async () => {
        // Restore original data after each test
        await writeFile(testDataPath, originalData, 'utf8');
    });

    beforeEach(async () => {
        // Reset to clean test data before each test
        const cleanTestData = [
            {
                "id": 1,
                "name": "Macbook Pro 16 (2025)",
                "category": "Electronics",
                "price": 3699
            },
            {
                "id": 2,
                "name": "Iphone 17 Pro Max",
                "category": "Electronics",
                "price": 1299
            },
            {
                "id": 3,
                "name": "Samsung Galaxy S25",
                "category": "Electronics",
                "price": 1199
            }
        ];
        await writeFile(testDataPath, JSON.stringify(cleanTestData, null, 2), 'utf8');
    });

    describe('GET /api/items', () => {
        it('should return all items with default pagination', async () => {
            const { body, } = await request(app)
                .get('/api/items')
                .expect(200);

            expect(body).toHaveProperty('pageResults');
            expect(body).toHaveProperty('totalResults');
            expect(body).toHaveProperty('totalPages');
            expect(body).toHaveProperty('page');
            expect(body).toHaveProperty('limit');
            expect(body).toHaveProperty('hasNextPage');
            expect(body).toHaveProperty('hasPreviousPage');

            expect(body).toEqual(expect.objectContaining({
                page: 1,
                limit: 10,
            }));
        });

        it('should return paginated items with custom limit', async () => {
            const { body, } = await request(app)
                .get('/api/items?limit=2&page=1')
                .expect(200);
            // console.log("bodyreturned", body);

            expect(body.pageResults).toHaveLength(2);
            expect(body).toEqual(expect.objectContaining({
                page: 1,
                totalResults: 3,
                totalPages: 2
            }));
        });

        it('should return second page of items', async () => {
            const { body, } = await request(app)
                .get('/api/items?limit=2&page=2')
                .expect(200);

            expect(body.pageResults).toHaveLength(1);
            expect(body).toEqual(expect.objectContaining({
                page: 2,
                totalResults: 3,
                totalPages: 2
            }));
        });

        it('should filter items by search query', async () => {
            const { body, } = await request(app)
                .get('/api/items?q=Macbook')
                .expect(200);

            expect(body.pageResults).toHaveLength(1);
            expect(body.pageResults[0].name).toContain('Macbook');
        });

        it('should return empty array for non-matching search', async () => {
            const { body, } = await request(app)
                .get('/api/items?q=nonexistent')
                .expect(200);

            expect(body.pageResults).toHaveLength(0);
            expect(body.totalResults).toBe(0);
            expect(body.totalPages).toBe(0);
            expect(body.page).toBe(1);
            expect(body.hasNextPage).toBe(false);
            expect(body.hasPreviousPage).toBe(false);
        });

        it('should handle invalid limit parameter', async () => {
            const { body, } = await request(app)
                .get('/api/items?limit=0')
                .expect(400);

            expect(body.status).toMatch(/error/i);
        });

        it('should handle invalid page parameter', async () => {
            const { body, } = await request(app)
                .get('/api/items?page=0')
                .expect(400);

            expect(body.status).toMatch(/error/i);
        });

        it('should handle limit exceeding maximum', async () => {
            const { body, } = await request(app)
                .get('/api/items?limit=1001')
                .expect(400);

            expect(body.status).toMatch(/error/i);
        });
    });

    describe('GET /api/items/:id', () => {
        it('should return item by valid ID', async () => {
            const { body, } = await request(app)
                .get('/api/items/1')
                .expect(200);

            expect(body).toEqual({
                id: 1,
                name: "Macbook Pro 16 (2025)",
                category: "Electronics",
                price: 3699
            });
        });

        it('should return 404 for non-existent item ID', async () => {
            const { body, } = await request(app)
                .get('/api/items/999')
                .expect(404);

            expect(body.status).toMatch(/error/i);
            expect(body.message).toContain('Item not found');
        });

        it('should handle invalid ID format', async () => {
            const { body, } = await request(app)
                .get('/api/items/invalid')
                .expect(400);

            expect(body.status).toMatch(/error/i);
        });

        it('should handle string ID that can be converted to number', async () => {
            const { body, } = await request(app)
                .get('/api/items/2')
                .expect(200);

            expect(body.id).toBe(2);
        });
    });

    describe('POST /api/items', () => {
        it('should create new item with valid data', async () => {
            const newItem = {
                name: "Test Laptop",
                category: "Electronics",
                price: 1500
            };

            const { body, } = await request(app)
                .post('/api/items')
                .send(newItem)
                .expect(201);

            expect(body).toHaveProperty('id');
            expect(body.name).toBe(newItem.name);
            expect(body.category).toBe(newItem.category);
            expect(body.price).toBe(newItem.price);
            expect(typeof body.id).toBe('number');

            // Verify item was actually saved
            const getResponse = await request(app)
                .get(`/api/items/${body.id}`)
                .expect(200);

            expect(getResponse.body).toEqual(body);
        });

        it('should reject item with price below minimum', async () => {
            const invalidItem = {
                name: "Cheap Item",
                category: "Electronics",
                price: 50
            };

            const { body, } = await request(app)
                .post('/api/items')
                .send(invalidItem)
                .expect(400);

            expect(body.status).toMatch(/error/i);
        });

        it('should reject item with missing required fields', async () => {
            const invalidItem = {
                name: "Incomplete Item",
                price: 1000
                // missing category
            };

            const { body, } = await request(app)
                .post('/api/items')
                .send(invalidItem)
                .expect(400);

            expect(body.status).toMatch(/error/i);
        });

        it('should reject item with invalid price type', async () => {
            const invalidItem = {
                name: "Invalid Price Item",
                category: "Electronics",
                price: "not a number"
            };

            const { body, } = await request(app)
                .post('/api/items')
                .send(invalidItem)
                .expect(400);

            expect(body.status).toMatch(/error/i);
        });

        it('should reject duplicate item name', async () => {
            const duplicateItem = {
                name: "Macbook Pro 16 (2025)", // Already exists
                category: "Electronics",
                price: 2000
            };

            const { body, } = await request(app)
                .post('/api/items')
                .send(duplicateItem)
                .expect(409);

            expect(body.status).toMatch(/error/i);
            expect(body.message).toContain('already exists');
        });

        it('should handle empty request body', async () => {
            const { body, } = await request(app)
                .post('/api/items')
                .send({})
                .expect(400);

            expect(body.status).toBe('Validation Error');
        });

        it('should handle malformed JSON', async () => {
            const { body, } = await request(app)
                .post('/api/items')
                .set('Content-Type', 'application/json')
                .send('{"invalid": json}')
                .expect(400);

            expect(body.message).toContain('Unexpected token');
        });
    });

    describe('Error Handling', () => {
        it('should handle CORS preflight requests', async () => {
            const { headers, } = await request(app)
                .options('/api/items')
                .set('Origin', constants.FRONTEND_URL)
                .expect(204);

            expect(headers['access-control-allow-origin']).toBe(constants.FRONTEND_URL);
        });
    });
}); 