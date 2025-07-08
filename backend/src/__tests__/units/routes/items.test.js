test.todo('test routes for items');
// import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// import request from 'supertest';
// import express from 'express';

// // Mock all dependencies
// jest.mock('../../../controllers/items.js');
// jest.mock('../../../middleware/requestValidator.js');
// jest.mock('../../../middleware/validateItems.js');
// jest.mock('../../../zod-schemas/items.js');

// // Import the mocked modules
// import itemsController from '../../../controllers/items.js';
// import { validateData } from '../../../middleware/requestValidator.js';
// import { validateExistingItem } from '../../../middleware/validateItems.js';
// import { createItemSchema, queryItemSchema, getItemSchema } from '../../../zod-schemas/items.js';

// // Import the router
// import itemsRouter from '../../../routes/items.js';

// describe('Items Routes', () => {
//     let app;
//     let mockValidateData;
//     let mockValidateExistingItem;

//     beforeEach(() => {
//         // Clear all mocks
//         jest.clearAllMocks();

//         // Setup mock middleware
//         mockValidateData = jest.fn((req, res, next) => next());
//         validateData.mockReturnValue(mockValidateData);

//         mockValidateExistingItem = jest.fn((req, res, next) => next());
//         validateExistingItem.mockImplementation(mockValidateExistingItem);

//         // Setup mock controller methods
//         itemsController.listItems = jest.fn((req, res, next) => {
//             res.json({ message: 'Items listed' });
//         });

//         itemsController.getItemById = jest.fn((req, res, next) => {
//             res.json({ id: req.params.id, message: 'Item found' });
//         });

//         itemsController.createItem = jest.fn((req, res, next) => {
//             res.status(201).json({ message: 'Item created', data: req.body });
//         });

//         // Create Express app for testing
//         app = express();
//         app.use(express.json());
//         app.use('/api/items', itemsRouter);
//     });

//     afterEach(() => {
//         jest.restoreAllMocks();
//     });

//     describe('GET /api/items', () => {
//         it('should call validateData middleware with queryItemSchema and "query"', async () => {
//             // Act
//             await request(app)
//                 .get('/api/items')
//                 .query({ limit: 10, page: 1, q: 'test' });

//             // Assert
//             expect(validateData).toHaveBeenCalledWith(queryItemSchema, 'query');
//             expect(mockValidateData).toHaveBeenCalled();
//         });

//         it('should call itemsController.listItems', async () => {
//             // Act
//             await request(app)
//                 .get('/api/items')
//                 .query({ limit: 10, page: 1 });

//             // Assert
//             expect(itemsController.listItems).toHaveBeenCalled();
//         });

//         it('should handle request with query parameters', async () => {
//             // Arrange
//             const queryParams = { limit: 20, page: 2, q: 'laptop' };

//             // Act
//             const response = await request(app)
//                 .get('/api/items')
//                 .query(queryParams);

//             // Assert
//             expect(response.status).toBe(200);
//             expect(response.body).toEqual({ message: 'Items listed' });
//             expect(itemsController.listItems).toHaveBeenCalledWith(
//                 expect.objectContaining({ query: queryParams }),
//                 expect.any(Object),
//                 expect.any(Function)
//             );
//         });

//         it('should handle request without query parameters', async () => {
//             // Act
//             const response = await request(app)
//                 .get('/api/items');

//             // Assert
//             expect(response.status).toBe(200);
//             expect(response.body).toEqual({ message: 'Items listed' });
//             expect(itemsController.listItems).toHaveBeenCalled();
//         });
//     });

//     describe('GET /api/items/:id', () => {
//         it('should call validateData middleware with getItemSchema and "params"', async () => {
//             // Act
//             await request(app)
//                 .get('/api/items/123');

//             // Assert
//             expect(validateData).toHaveBeenCalledWith(getItemSchema, 'params');
//             expect(mockValidateData).toHaveBeenCalled();
//         });

//         it('should call itemsController.getItemById', async () => {
//             // Act
//             await request(app)
//                 .get('/api/items/123');

//             // Assert
//             expect(itemsController.getItemById).toHaveBeenCalled();
//         });

//         it('should handle request with valid id parameter', async () => {
//             // Arrange
//             const itemId = 123;

//             // Act
//             const response = await request(app)
//                 .get(`/api/items/${itemId}`);

//             // Assert
//             expect(response.status).toBe(200);
//             expect(response.body).toEqual({ id: itemId, message: 'Item found' });
//             expect(itemsController.getItemById).toHaveBeenCalledWith(
//                 expect.objectContaining({ params: { id: itemId } }),
//                 expect.any(Object),
//                 expect.any(Function)
//             );
//         });

//         it('should pass validated params to controller', async () => {
//             // Arrange
//             const mockReq = { params: { id: 456 } };
//             const mockRes = { json: jest.fn() };
//             const mockNext = jest.fn();

//             // Act
//             await request(app)
//                 .get('/api/items/456');

//             // Assert
//             expect(itemsController.getItemById).toHaveBeenCalledWith(
//                 expect.objectContaining({ params: { id: 456 } }),
//                 expect.any(Object),
//                 expect.any(Function)
//             );
//         });
//     });

//     describe('POST /api/items', () => {
//         it('should call validateData middleware with createItemSchema and "body"', async () => {
//             // Act
//             await request(app)
//                 .post('/api/items')
//                 .send({ name: 'Test Item', price: 150, category: 'Electronics' });

//             // Assert
//             expect(validateData).toHaveBeenCalledWith(createItemSchema, 'body');
//             expect(mockValidateData).toHaveBeenCalled();
//         });

//         it('should call validateExistingItem middleware', async () => {
//             // Act
//             await request(app)
//                 .post('/api/items')
//                 .send({ name: 'Test Item', price: 150, category: 'Electronics' });

//             // Assert
//             expect(validateExistingItem).toHaveBeenCalled();
//             expect(mockValidateExistingItem).toHaveBeenCalled();
//         });

//         it('should call itemsController.createItem', async () => {
//             // Act
//             await request(app)
//                 .post('/api/items')
//                 .send({ name: 'Test Item', price: 150, category: 'Electronics' });

//             // Assert
//             expect(itemsController.createItem).toHaveBeenCalled();
//         });

//         it('should handle request with valid item data', async () => {
//             // Arrange
//             const itemData = {
//                 name: 'Laptop Pro',
//                 price: 2499,
//                 category: 'Electronics'
//             };

//             // Act
//             const response = await request(app)
//                 .post('/api/items')
//                 .send(itemData);

//             // Assert
//             expect(response.status).toBe(201);
//             expect(response.body).toEqual({
//                 message: 'Item created',
//                 data: itemData
//             });
//             expect(itemsController.createItem).toHaveBeenCalledWith(
//                 expect.objectContaining({ body: itemData }),
//                 expect.any(Object),
//                 expect.any(Function)
//             );
//         });

//         it('should execute middleware in correct order', async () => {
//             // Arrange
//             const callOrder = [];

//             // Mock middleware to track call order
//             validateData.mockReturnValue((req, res, next) => {
//                 callOrder.push('validateData');
//                 next();
//             });

//             validateExistingItem.mockImplementation((req, res, next) => {
//                 callOrder.push('validateExistingItem');
//                 next();
//             });

//             itemsController.createItem.mockImplementation((req, res, next) => {
//                 callOrder.push('createItem');
//                 res.status(201).json({ message: 'Item created' });
//             });

//             // Act
//             await request(app)
//                 .post('/api/items')
//                 .send({ name: 'Test Item', price: 150, category: 'Electronics' });

//             // Assert
//             expect(callOrder).toEqual(['validateData', 'validateExistingItem', 'createItem']);
//         });
//     });

//     describe('Middleware Integration', () => {
//         it('should handle validation errors from validateData middleware', async () => {
//             // Arrange
//             const validationError = new Error('Validation failed');
//             validateData.mockReturnValue((req, res, next) => {
//                 next(validationError);
//             });

//             // Act
//             const response = await request(app)
//                 .get('/api/items');

//             // Assert
//             expect(response.status).toBe(500); // Express default error status
//         });

//         it('should handle errors from validateExistingItem middleware', async () => {
//             // Arrange
//             const validationError = new Error('Item already exists');
//             validateExistingItem.mockImplementation((req, res, next) => {
//                 next(validationError);
//             });

//             // Act
//             const response = await request(app)
//                 .post('/api/items')
//                 .send({ name: 'Test Item', price: 150, category: 'Electronics' });

//             // Assert
//             expect(response.status).toBe(500); // Express default error status
//         });

//         it('should handle controller errors', async () => {
//             // Arrange
//             const controllerError = new Error('Database error');
//             itemsController.listItems.mockImplementation((req, res, next) => {
//                 next(controllerError);
//             });

//             // Act
//             const response = await request(app)
//                 .get('/api/items');

//             // Assert
//             expect(response.status).toBe(500); // Express default error status
//         });
//     });

//     describe('Route Configuration', () => {
//         it('should have correct route paths', () => {
//             // This test verifies that the routes are properly configured
//             expect(itemsRouter.stack).toBeDefined();
//             expect(itemsRouter.stack.length).toBeGreaterThan(0);
//         });

//         it('should use Router from express', () => {
//             // This test verifies that the router is properly imported and used
//             expect(itemsRouter).toBeDefined();
//             expect(typeof itemsRouter.get).toBe('function');
//             expect(typeof itemsRouter.post).toBe('function');
//         });
//     });
// }); 