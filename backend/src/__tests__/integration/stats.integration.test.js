import request from 'supertest';
import { writeFile, readFile } from 'fs/promises';
import app from '../../app.js';
import constants from '../../configs/constants.js';
import { meanByKey } from '../../utils/stats.js';


describe('Stats API Integration Tests', () => {
    let originalData;
    const testDataPath = constants.DATA_PATH;

    beforeAll(async () => {
        // Store original data
        originalData = await readFile(testDataPath, 'utf8');

        // Set test data path
        global.DATA_PATH = testDataPath;
    });

    afterAll(async () => {
        // Restore original data
        await writeFile(testDataPath, originalData, 'utf8');
    });


    describe('GET /api/stats', () => {
        it('should return stats for items with data', async () => {
            // Set up test data
            const testData = [
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
            await writeFile(testDataPath, JSON.stringify(testData, null, 2), 'utf8');

            const response = await request(app)
                .get('/api/stats')
                .expect(200);

            expect(response.body).toEqual({
                total: testData.length,
                averagePrice: meanByKey(testData, 'price')
            });
        });

        it('should return stats for empty data array', async () => {
            // Set up empty test data
            await writeFile(testDataPath, JSON.stringify([], null, 2), 'utf8');

            const response = await request(app)
                .get('/api/stats')
                .expect(200);

            expect(response.body).toEqual({
                total: 0,
                averagePrice: 0
            });
        });

        it('should return stats for single item', async () => {
            // Set up single item test data
            const testData = [
                {
                    "id": 1,
                    "name": "Macbook Pro 16 (2025)",
                    "category": "Electronics",
                    "price": 3699
                }
            ];
            await writeFile(testDataPath, JSON.stringify(testData, null, 2), 'utf8');

            const response = await request(app)
                .get('/api/stats')
                .expect(200);

            expect(response.body.total).toBe(testData.length);
            expect(response.body.averagePrice).toBe(meanByKey(testData, 'price'));
        });

        it('should return stats for large dataset', async () => {
            // Set up large test data
            const testData = Array.from({ length: 100 }, (_, index) => ({
                id: index + 1,
                name: `Item ${index + 1}`,
                category: "Electronics",
                price: 1000 + (index * 10) // Prices from 1000 to 1990
            }));
            await writeFile(testDataPath, JSON.stringify(testData, null, 2), 'utf8');

            const response = await request(app)
                .get('/api/stats')
                .expect(200);

            expect(response.body.total).toBe(testData.length);
            expect(response.body.averagePrice).toBe(meanByKey(testData, 'price'));
        });

        it('should handle items with decimal prices', async () => {
            // Set up test data with decimal prices
            const testData = [
                {
                    "id": 1,
                    "name": "Item 1",
                    "category": "Electronics",
                    "price": 1000.50
                },
                {
                    "id": 2,
                    "name": "Item 2",
                    "category": "Electronics",
                    "price": 2000.75
                }
            ];
            await writeFile(testDataPath, JSON.stringify(testData, null, 2), 'utf8');

            const response = await request(app)
                .get('/api/stats')
                .expect(200);

            expect(response.body.total).toBe(testData.length);
            expect(response.body.averagePrice).toBe(meanByKey(testData, 'price'));
        });

        it('should return cached stats on subsequent requests', async () => {
            // Set up test data
            const testData = [
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
                }
            ];
            await writeFile(testDataPath, JSON.stringify(testData, null, 2), 'utf8');

            // First request
            const response1 = await request(app)
                .get('/api/stats')
                .query({ cache: true })
                .expect(200);

            // Second request (should use cache)
            const response2 = await request(app)
                .get('/api/stats')
                .query({ cache: true })
                .expect(200);

            // Both responses should be identical
            expect(response2.body).toEqual(expect.objectContaining(response1.body));
            expect(response2.body).toHaveProperty('cache', true);
            // expect(response1.body.averagePrice).toBe(meanByKey(testData, 'price'));
        });

        it('should handle malformed JSON data gracefully', async () => {
            // Set up malformed JSON data
            await writeFile(testDataPath, 'invalid json data', 'utf8');

            const response = await request(app)
                .get('/api/stats')
                .expect(500);

            expect(response.body.status).toMatch(/error/i);
        });

        it('should handle missing data file', async () => {
            // Temporarily change data path to non-existent file
            const originalDataPath = global.DATA_PATH;
            global.DATA_PATH = '/nonexistent/path/items.json';

            const response = await request(app)
                .get('/api/stats')
                .expect(500);

            expect(response.body.status).toMatch(/error/i);

            // Restore original data path
            global.DATA_PATH = originalDataPath;
        });

        it('should handle concurrent requests', async () => {
            // Set up test data
            const testData = [
                {
                    "id": 1,
                    "name": "Item 1",
                    "category": "Electronics",
                    "price": 1000
                },
                {
                    "id": 2,
                    "name": "Item 2",
                    "category": "Electronics",
                    "price": 2000
                }
            ];
            await writeFile(testDataPath, JSON.stringify(testData, null, 2), 'utf8');

            // Make concurrent requests
            const promises = Array.from({ length: 5 }, () =>
                request(app).get('/api/stats')
            );

            const responses = await Promise.all(promises);

            // All responses should be successful and identical
            responses.forEach(response => {
                expect(response.status).toBe(200);
                expect(response.body.total).toBe(testData.length);
                expect(response.body.averagePrice).toBe(meanByKey(testData, 'price'));
            });
        });

        it('should handle items with zero price', async () => {
            // Set up test data with zero price
            const testData = [
                {
                    "id": 1,
                    "name": "Free Item",
                    "category": "Electronics",
                    "price": 0
                }
            ];
            await writeFile(testDataPath, JSON.stringify(testData, null, 2), 'utf8');

            const response = await request(app)
                .get('/api/stats')
                .expect(200);

            expect(response.body.total).toBe(testData.length);
            expect(response.body.averagePrice).toBe(meanByKey(testData, 'price'));
        });
    });

    describe('Error Handling', () => {
        it('should handle 404 for non-existent routes', async () => {
            const response = await request(app)
                .get('/api/nonexistent')
                .expect(404);

            expect(response.body.status).toMatch(/error/i);
        });

        it('should handle CORS preflight requests', async () => {
            const response = await request(app)
                .options('/api/stats')
                .set('Origin', constants.FRONTEND_URL)
                .expect(204);

            expect(response.headers['access-control-allow-origin']).toBe(constants.FRONTEND_URL);
        });
    });
}); 