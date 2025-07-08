// test.todo('test error handler middleware');
import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { notFound, errorHandler, getCookie, errorGlobalHandler } from '../../../middleware/errorHandler.js';
import { APIError } from '../../../utils/customErrors.js';
import { ZodError } from 'zod/v4';
import axios from 'axios';
// import logger from '../../../utils/logger.js';

// Mock dependencies
// jest.mock('axios');
// jest.mock('../../../utils/logger.js', () => ({
//     error: jest.fn()
// }));
// jest.mock('../../../utils/customErrors.js');
// jest.unstable_mockModule('zod/v4', () => ({
//     z: {
//         treeifyError: jest.fn()
//     },
//     ZodError: jest.fn()
// }));

describe('Error Handler Middleware', () => {
    let mockReq, mockRes, mockNext;

    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();

        // Setup mock request, response, and next function
        mockReq = {
            method: 'GET',
            originalUrl: '/api/test',
            headers: {},
            body: {},
            query: {},
            params: {}
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Mock console methods
        jest.spyOn(console, 'error').mockImplementation(() => { });
        jest.spyOn(console, 'log').mockImplementation(() => { });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('test notFound middleware', () => {
        it('should create 404 error and call next', () => {
            // Act
            notFound(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
            const error = mockNext.mock.calls[0][0];
            expect(error.message).toBe('Route Not Found');
            expect(error.statusCode).toBe(404);
        });

        it('should not call response methods', () => {
            // Act
            notFound(mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.status).not.toHaveBeenCalled();
            expect(mockRes.json).not.toHaveBeenCalled();
            expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
        });
    });

    describe('test errorGlobalHandler middleware', () => {
        it('should handle APIError correctly', async () => {
            // Arrange
            const apiError = new APIError('Custom API Error', 400);
            const errorResponse = {
                status: 'API Error',
                message: 'Custom API Error'
            };


            // Act
            errorGlobalHandler(apiError, mockReq, mockRes, mockNext);
            // const logger = await import('../../../utils/logger.js');
            // const loggerSpy = jest.spyOn(logger, 'error').mockImplementation(() => { });
            // const mockLogger = {
            //     error: jest.fn()
            // };

            // Assert

            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(errorResponse);
        });

        it('should handle ZodError correctly', () => {
            // Arrange
            const zodError = new ZodError([
                {
                    code: 'invalid_type',
                    expected: 'string',
                    received: 'number',
                    path: ['name'],
                    message: 'Expected string, received number'
                }
            ]);

            const mockTreeifyError = {
                properties: {
                    name: {
                        errors: ['Expected string, received number']
                    }
                }
            };

            // z.treeifyError = jest.fn().mockReturnValue(mockTreeifyError);

            const expectedResponse = {
                status: 'Validation Error',
                message: '✖ Expected string, received number\n  → at name',
                details: mockTreeifyError.properties
            };

            // Act
            errorGlobalHandler(zodError, mockReq, mockRes, mockNext);

            // Assert
            // expect(z.treeifyError).toHaveBeenCalledWith(zodError);
            // expect(logger.error).toHaveBeenCalledWith({
            //     method: 'GET',
            //     url: '/api/test',
            //     ...expectedResponse
            // }, 'errorGlobalHandler');
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
        });

        it('should handle generic Error correctly', () => {
            // Arrange
            const genericError = new Error('Generic error message');
            const errorResponse = {
                status: 'error',
                message: 'Generic error message'
            };

            // Act
            errorGlobalHandler(genericError, mockReq, mockRes, mockNext);

            // Assert

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(errorResponse);
        });

        it('should handle error without message', () => {
            // Arrange
            const errorWithoutMessage = new Error();
            const errorResponse = {
                status: 'error',
                message: 'Internal Server Error'
            };

            // Act
            errorGlobalHandler(errorWithoutMessage, mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(errorResponse);
        });

        it('should handle error with custom status code', () => {
            // Arrange
            const customError = new Error('Custom error');
            customError.statusCode = 403;
            const errorResponse = {
                status: 'error',
                message: 'Custom error'
            };

            // Act
            errorGlobalHandler(customError, mockReq, mockRes, mockNext);

            // Assert

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith(errorResponse);
        });

        it('should handle non-Error objects', () => {
            // Arrange
            const nonErrorObject = { message: 'Not an error object' };
            const errorResponse = {
                status: 'error',
                message: 'Not an error object'
            };

            // Act
            errorGlobalHandler(nonErrorObject, mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(errorResponse);
        });

        it('should handle null error', () => {
            // Arrange
            const errorResponse = {
                status: 'error',
                message: 'Internal Server Error'
            };

            // Act
            errorGlobalHandler(null, mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith(errorResponse);
        });

        it('should handle complex ZodError with multiple validation issues', async () => {
            // Arrange
            const zodError = new ZodError([
                {
                    code: 'invalid_type',
                    expected: 'string',
                    received: 'number',
                    path: ['name'],
                    message: 'Expected string, received number'
                },
                {
                    code: 'too_small',
                    minimum: 100,
                    type: 'number',
                    inclusive: true,
                    path: ['price'],
                    message: 'Number must be greater than or equal to 100'
                }
            ]);

            const mockTreeifyError = {
                properties: {
                    name: {
                        errors: ['Expected string, received number']
                    },
                    price: {
                        errors: ['Number must be greater than or equal to 100']
                    }
                }
            };

            const expectedResponse = {
                status: 'Validation Error',
                message: '✖ Expected string, received number\n  → at name\n✖ Number must be greater than or equal to 100\n  → at price',
                details: mockTreeifyError.properties
            };

            // Act
            errorGlobalHandler(zodError, mockReq, mockRes, mockNext);

            // Assert
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith(expectedResponse);
        });
    });
}); 