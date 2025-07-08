import { jest, describe, it, expect, beforeEach } from '@jest/globals';
import { validateRequest } from '../../../middleware/requestValidator.js';
import { z, ZodError } from 'zod/v4';
import { APIError } from '../../../utils/customErrors.js';

describe('validateRequest Middleware', () => {
    let mockReq;
    let mockRes;
    let mockNext;
    let testSchema;

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks();

        // Setup mock request, response, and next function
        mockReq = {
            body: {},
            query: {},
            params: {}
        };

        // * mockReturnThis() allow to chain methods
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();

        // Create a test schema for validation
        testSchema = z.object({
            name: z.string().min(1),
            age: z.number().min(0).max(120),
            email: z.email().optional()
        });
    });

    describe('Schema Validation', () => {
        it('should throw error when schema is null', () => {
            expect(() => validateRequest(null, 'body')).toThrow('Invalid schema');
        });

        it('should throw error when schema is not an object', () => {
            expect(() => validateRequest('not-an-object', 'body')).toThrow('Invalid schema');
        });

        it('should throw error when schema does not have parse method', () => {
            const invalidSchema = { someProperty: 'value' };
            expect(() => validateRequest(invalidSchema, 'body')).toThrow('Invalid schema');
        });

        it('should not throw error when schema is valid Zod schema', () => {
            expect(() => validateRequest(testSchema, 'body')).not.toThrow();
        });
    });

    describe('Request Field Validation', () => {
        it('should validate and update req.body with valid data', () => {
            // Arrange
            const validData = {
                name: 'John Doe',
                age: 25,
                email: 'john@example.com'
            };
            mockReq.body = validData;

            // Act
            const middleware = validateRequest(testSchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.body).toEqual(validData);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should validate and update req.query with valid data', () => {
            // Arrange
            const querySchema = z.object({
                page: z.number().min(1).default(1),
                limit: z.number().min(1).max(100).default(10),
                search: z.string().optional()
            });

            const validQuery = {
                page: 2,
                limit: 20,
                search: 'test'
            };
            mockReq.query = validQuery;

            // Act
            const middleware = validateRequest(querySchema, 'query');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.query).toEqual(validQuery);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should validate and update req.params with valid data', () => {
            // Arrange
            const paramSchema = z.object({
                id: z.string().min(1)
            });

            const validParams = { id: '123' };
            mockReq.params = validParams;

            // Act
            const middleware = validateRequest(paramSchema, 'params');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.params).toEqual(validParams);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should throw APIError when field is invalid', () => {
            // Arrange
            const simpleSchema = z.object({
                name: z.string().default('default name')
            });

            // Act
            const middleware = validateRequest(simpleSchema, 'invalidField');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.invalidField).toEqual(undefined);
            expect(mockNext).toHaveBeenCalledWith(expect.any(APIError));
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('Error Handling', () => {
        it('should call next with ZodError when validation fails', () => {
            // Arrange
            const invalidData = {
                name: '', // Invalid: empty string
                age: 150, // Invalid: exceeds max
                email: 'invalid-email' // Invalid: not a valid email
            };
            mockReq.body = invalidData;

            // Act
            const middleware = validateRequest(testSchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should call next with ZodError when required field is missing', () => {
            // Arrange
            const incompleteData = {
                age: 25
                // Missing required 'name' field
            };
            mockReq.body = incompleteData;

            // Act
            const middleware = validateRequest(testSchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should call next with ZodError when field type is wrong', () => {
            // Arrange
            const wrongTypeData = {
                name: 'John Doe',
                age: 'not-a-number', // Invalid: should be number
                email: 'john@example.com'
            };
            mockReq.body = wrongTypeData;

            // Act
            const middleware = validateRequest(testSchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockNext).toHaveBeenCalledWith(expect.any(ZodError));
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('Default Values', () => {
        it('should apply default values when fields are missing', () => {
            // Arrange
            const defaultSchema = z.object({
                name: z.string().default('Anonymous'),
                age: z.number().default(18),
                active: z.boolean().default(true)
            });

            const partialData = {
                name: 'John'
                // age and active will use defaults
            };
            mockReq.body = partialData;

            // Act
            const middleware = validateRequest(defaultSchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.body).toEqual({
                name: 'John',
                age: 18,
                active: true
            });
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('Optional Fields', () => {
        it('should handle optional fields correctly', () => {
            // Arrange
            const optionalSchema = z.object({
                name: z.string(),
                email: z.string().email().optional(),
                phone: z.string().optional()
            });

            const dataWithOptional = {
                name: 'John Doe',
                email: 'john@example.com'
                // phone is optional and not provided
            };
            mockReq.body = dataWithOptional;

            // Act
            const middleware = validateRequest(optionalSchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.body).toEqual(dataWithOptional);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle nested object validation', () => {
            // Arrange
            const nestedSchema = z.object({
                user: z.object({
                    name: z.string(),
                    address: z.object({
                        street: z.string(),
                        city: z.string()
                    })
                })
            });

            const nestedData = {
                user: {
                    name: 'John Doe',
                    address: {
                        street: '123 Main St',
                        city: 'New York'
                    }
                }
            };
            mockReq.body = nestedData;

            // Act
            const middleware = validateRequest(nestedSchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.body).toEqual(nestedData);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });

        it('should handle array validation', () => {
            // Arrange
            const arraySchema = z.object({
                items: z.array(z.string()),
                numbers: z.array(z.number())
            });

            const arrayData = {
                items: ['item1', 'item2', 'item3'],
                numbers: [1, 2, 3, 4, 5]
            };
            mockReq.body = arrayData;

            // Act
            const middleware = validateRequest(arraySchema, 'body');
            middleware(mockReq, mockRes, mockNext);

            // Assert
            expect(mockReq.body).toEqual(arrayData);
            expect(mockNext).toHaveBeenCalledWith();
            expect(mockNext).toHaveBeenCalledTimes(1);
        });
    });
}); 