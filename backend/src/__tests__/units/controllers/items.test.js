// test.todo('test items controller');
import { fetchDataAsync } from '../../../utils/fileProcessor.js';
import paginateData from '../../../utils/paginator.js';
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import itemsController from '../../../controllers/items.js';
import { APIError } from '../../../utils/customErrors.js';
import constants from '../../../configs/constants.js';
import { readFile, writeFile } from 'fs/promises';
// jest.unstable_mockModule('../../../utils/paginator.js', async () => ({
//     paginateData: jest.fn()
// }));

// jest.mock('../../../utils/fileProcessor.js');
// jest.mock('../../../utils/paginator.js', () => ({
//     __esModule: true,
//     default: jest.fn()
// }));
// const { fetchDataAsync } = await import('../../../utils/fileProcessor.js');
// console.log("fetchDataAsync", jest.isMockFunction(fetchDataAsync));
// Mock the itemscontroller module
// jest.mock('../../../controllers/items.js', () => {
//     return {
//         listItems: jest.fn().mockResolvedValue(mockData)
//     }
// });

// jest.mock('fs', () => {
//     return {
//         promises: {
//             readFile: jest.fn(),
//             writeFile: jest.fn()
//         }
//     };
// });

// jest.mock('fs/promises');
// import { readFile, writeFile } from 'fs/promises';


describe('ItemsController', () => {
    let mockReq, mockRes, mockNext, mockData;
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
        mockData = cleanTestData;
    });

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock request, response, and next function
        mockReq = {
            query: {},
            params: {},
            body: {},
            data: []
        };

        mockRes = {
            // shorthand for mock implementation method
            json: jest.fn(),
            status: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        /*
         * ! Jest mock ESM doesn't work for some reason
        jest.unstable_mockModule('../../../utils/paginator.js', async () => {
            // const originalModule = import('../../../utils/paginator.js');
            // console.log("originalModule", originalModule);

            //Mock the default export and named export 'foo'
            return {
                __esModule: true,
                // ...originalModule,
                default: jest.fn(),
                paginateData: jest.fn()
            };
        });*/

    });

    afterEach(() => {
        jest.restoreAllMocks();
    });


    describe('listItems', () => {
        it('should return paginated items successfully', async () => {
            // Arrange
            const mockPaginatedResult = {
                page: 1,
                hasNextPage: true,
                hasPreviousPage: false
            };

            // const { paginateData } = await import('../../../utils/paginator.js');
            // const paginateDataMock = jest.spyOn(paginator, 'paginateData');
            // console.log("paginateData", paginateData);

            mockReq.query = { limit: 1, page: 1 };

            // Act
            await itemsController.listItems(mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.json.mock.calls[0][0]).toMatchObject(mockPaginatedResult);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle search query correctly', async () => {
            // Arrange
            const expectedResult = [{ "category": "Electronics", "id": 1, "name": "Macbook Pro 16 (2025)", "price": 3699 }];
            mockReq.query = { q: 'Macbook Pro 16' };

            // Act      
            await itemsController.listItems(mockReq, mockRes, mockNext);
            // console.log("mockRes.json", mockRes.json.mock.results[0].value);

            // Assert
            expect(mockRes.json.mock.calls[0][0].totalPageResults).toEqual(1);
            expect(mockNext).not.toHaveBeenCalled();
        });

        // it('should handle pagination parameters correctly', async () => {
        //     // Arrange

        //     const mockPaginatedResult = {
        //         pageResults: [{ id: 2, name: 'Iphone 17 Pro Max', category: 'Electronics', price: 1299 }],
        //         totalResults: 2,
        //         totalPages: 2,
        //         page: 2,
        //         hasNextPage: false,
        //         hasPreviousPage: true,
        //     };

        //     mockReq.query = { limit: 1, page: 1 };

        //     // Act
        //     await itemsController.listItems(mockReq, mockRes, mockNext);
        //     console.log("mockRes.json", mockRes.json);
        //     // Assert
        //     expect(mockRes.json).toHaveBeenCalled()

        //     expect(mockRes.json).toMatchObject({
        //         "id": 1,
        //         "name": "Macbook Pro 16 (2025)",
        //         "category": "Electronics",
        //         "price": 3699
        //     });
        //     // expect(mockRes.json).toHaveBeenCalledWith(mockPaginatedResult);
        // });

        it('should handle empty data results', async () => {
            // Arrange
            const mockPaginatedResult = {
                totalPageResults: 0,
                pageResults: [],
                totalResults: 0,
                totalPages: 0,
                page: 1,
                limit: 10,
                hasNextPage: false,
                hasPreviousPage: false
            };

            mockReq.query = { limit: 10, page: 1, q: 'somerandomstring' };

            // Act
            await itemsController.listItems(mockReq, mockRes, mockNext);


            // Assert
            // write expect mockreq 
            // expect(paginateData).toHaveBeenCalledWith(mockData, 10, 1, 'notfound');
            expect(mockRes.json).toHaveBeenCalledWith(mockPaginatedResult);
            expect(mockRes.json.mock.calls[0][0]).toEqual(mockPaginatedResult);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });

    describe('getItemById', () => {
        it('should return item by id successfully', async () => {
            // Arrange
            mockReq.params = { id: 1 };

            // Act
            await itemsController.getItemById(mockReq, mockRes, mockNext);

            // Assert

            expect(mockRes.json).toHaveBeenCalledWith(mockData[0]);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return item by string id successfully', async () => {
            // Arrange
            mockReq.params = { id: '1' };

            // Act
            await itemsController.getItemById(mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.json).toHaveBeenCalledWith(mockData[0]);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should return 404 when item not found', async () => {
            // Arrange
            mockReq.params = { id: 999999 };

            // Act
            await itemsController.getItemById(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
            expect(mockNext.mock.calls[0][0].message).toBe('Item not found');
            expect(mockNext.mock.calls[0][0].statusCode).toBe(404);
            expect(mockRes.json).not.toHaveBeenCalled();
        });


    });

    describe('createItem', () => {
        it('should create item successfully', async () => {
            // Arrange
            const newItem = {
                name: 'New Laptop',
                category: 'Electronics',
                price: 1999
            };

            mockReq.body = newItem;
            mockReq.data = mockData;

            // Mock Date.now to return a predictable timestamp
            const mockTimestamp = 1234567890;
            jest.spyOn(Date, 'now').mockReturnValue(mockTimestamp);

            // Act
            await itemsController.createItem(mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(201);
            expect(mockRes.json).toHaveBeenCalledWith({
                ...newItem,
                id: mockTimestamp
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should handle file write errors', async () => {
            // Arrange  
            const newItem = { name: 'New Laptop', category: 'Electronics', price: 1999 };
            const writeError = new Error('Write failed');

            mockReq.body = newItem;
            mockReq.data = mockData;

            // Mock JSON.stringify to throw an error
            const stringifySpy = jest.spyOn(JSON, 'stringify');
            stringifySpy.mockImplementation(() => {
                throw writeError;
            });

            // Act
            await itemsController.createItem(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(writeError);
            expect(mockRes.json).not.toHaveBeenCalled();
        });

        it('should handle missing req.data', async () => {
            // Arrange
            const newItem = { name: 'New Laptop', category: 'Electronics', price: 1999 };
            mockReq.body = newItem;
            mockReq.data = undefined;

            // Act
            await itemsController.createItem(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });

        it('should handle null req.data', async () => {
            // Arrange
            const newItem = { name: 'New Laptop', category: 'Electronics', price: 1999 };
            mockReq.body = newItem;
            mockReq.data = null;

            // Act
            await itemsController.createItem(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });


        it('should handle non-array types of req.data in createItem', async () => {
            // Arrange
            mockReq.body = { name: 'Test', category: 'Test', price: 100 };
            mockReq.data = 'not an array';

            // Act
            await itemsController.createItem(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });
}); 