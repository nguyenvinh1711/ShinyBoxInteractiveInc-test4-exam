test.todo('test file processor');
// import { jest, describe, it, expect, beforeEach, afterEach } from '@jest/globals';
// import { readFile } from 'fs/promises';
// import chokidar from 'chokidar';

// // Mock dependencies
// jest.mock('fs/promises');
// jest.mock('chokidar');
// jest.mock('../stats.js');
// jest.mock('../logger.js');

// // Import the mocked modules
// import { calculateStats } from '../stats.js';
// import logger from '../logger.js';

// // Import the functions to test
// import { fetchDataAsync, watchFile } from '../fileProcessor.js';

// describe('FileProcessor', () => {
//     beforeEach(() => {
//         // Clear all mocks
//         jest.clearAllMocks();

//         // Reset logger mock
//         logger.error = jest.fn();
//         logger.info = jest.fn();
//     });

//     afterEach(() => {
//         jest.restoreAllMocks();
//     });

//     describe('fetchDataAsync', () => {
//         it('should read and parse JSON file successfully', async () => {
//             // Arrange
//             const mockData = [
//                 { id: 1, name: 'Laptop', price: 999 },
//                 { id: 2, name: 'Mouse', price: 29 }
//             ];
//             const mockJsonString = JSON.stringify(mockData);
//             const filePath = '/path/to/data.json';

//             readFile.mockResolvedValue(mockJsonString);

//             // Act
//             const result = await fetchDataAsync(filePath);

//             // Assert
//             expect(readFile).toHaveBeenCalledWith(filePath);
//             expect(result).toEqual(mockData);
//             expect(logger.error).not.toHaveBeenCalled();
//         });

//         it('should handle file read errors', async () => {
//             // Arrange
//             const filePath = '/path/to/nonexistent.json';
//             const readError = new Error('File not found');
//             readFile.mockRejectedValue(readError);

//             // Act & Assert
//             await expect(fetchDataAsync(filePath)).rejects.toThrow('File not found');
//             expect(readFile).toHaveBeenCalledWith(filePath);
//             expect(logger.error).toHaveBeenCalledWith(readError, 'Error reading file');
//         });

//         it('should handle JSON parsing errors', async () => {
//             // Arrange
//             const filePath = '/path/to/invalid.json';
//             const invalidJson = '{ invalid json }';
//             readFile.mockResolvedValue(invalidJson);

//             // Act & Assert
//             await expect(fetchDataAsync(filePath)).rejects.toThrow();
//             expect(readFile).toHaveBeenCalledWith(filePath);
//             expect(logger.error).toHaveBeenCalledWith(
//                 expect.any(SyntaxError),
//                 'Error reading file'
//             );
//         });

//         it('should handle empty file content', async () => {
//             // Arrange
//             const filePath = '/path/to/empty.json';
//             const emptyContent = '';
//             readFile.mockResolvedValue(emptyContent);

//             // Act & Assert
//             await expect(fetchDataAsync(filePath)).rejects.toThrow();
//             expect(readFile).toHaveBeenCalledWith(filePath);
//             expect(logger.error).toHaveBeenCalledWith(
//                 expect.any(SyntaxError),
//                 'Error reading file'
//             );
//         });

//         it('should handle null file content', async () => {
//             // Arrange
//             const filePath = '/path/to/null.json';
//             readFile.mockResolvedValue(null);

//             // Act & Assert
//             await expect(fetchDataAsync(filePath)).rejects.toThrow();
//             expect(readFile).toHaveBeenCalledWith(filePath);
//             expect(logger.error).toHaveBeenCalledWith(
//                 expect.any(TypeError),
//                 'Error reading file'
//             );
//         });

//         it('should handle different data types in JSON', async () => {
//             // Arrange
//             const mockData = {
//                 string: 'test',
//                 number: 123,
//                 boolean: true,
//                 array: [1, 2, 3],
//                 object: { key: 'value' },
//                 null: null
//             };
//             const mockJsonString = JSON.stringify(mockData);
//             const filePath = '/path/to/data.json';

//             readFile.mockResolvedValue(mockJsonString);

//             // Act
//             const result = await fetchDataAsync(filePath);

//             // Assert
//             expect(result).toEqual(mockData);
//             expect(readFile).toHaveBeenCalledWith(filePath);
//         });
//     });

//     describe('watchFile', () => {
//         let mockWatcher;
//         let mockOn;
//         let mockConsoleLog;

//         beforeEach(() => {
//             // Setup mock watcher
//             mockOn = jest.fn();
//             mockWatcher = {
//                 on: mockOn
//             };
//             chokidar.watch.mockReturnValue(mockWatcher);

//             // Mock console.log
//             mockConsoleLog = jest.spyOn(console, 'log').mockImplementation();
//         });

//         afterEach(() => {
//             mockConsoleLog.mockRestore();
//         });

//         it('should create watcher with correct options', () => {
//             // Arrange
//             const filePath = '/path/to/data.json';

//             // Act
//             const result = watchFile(filePath);

//             // Assert
//             expect(chokidar.watch).toHaveBeenCalledWith(filePath, {
//                 persistent: true,
//                 ignoreInitial: true
//             });
//             expect(result).toBe(mockWatcher);
//             expect(mockConsoleLog).toHaveBeenCalledWith(
//                 `Chokidar is watching for changes in ${filePath}`
//             );
//         });

//         it('should set up change event handler', () => {
//             // Arrange
//             const filePath = '/path/to/data.json';

//             // Act
//             watchFile(filePath);

//             // Assert
//             expect(mockOn).toHaveBeenCalledWith('change', expect.any(Function));
//         });

//         it('should set up error event handler', () => {
//             // Arrange
//             const filePath = '/path/to/data.json';

//             // Act
//             watchFile(filePath);

//             // Assert
//             expect(mockOn).toHaveBeenCalledWith('error', expect.any(Function));
//         });

//         it('should handle file change event successfully', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const mockData = [
//                 { id: 1, name: 'Updated Laptop', price: 1099 },
//                 { id: 2, name: 'Updated Mouse', price: 39 }
//             ];
//             const mockJsonString = JSON.stringify(mockData);

//             readFile.mockResolvedValue(mockJsonString);

//             // Act
//             watchFile(filePath);

//             // Get the change handler
//             const changeHandler = mockOn.mock.calls.find(call => call[0] === 'change')[1];

//             // Simulate file change
//             await changeHandler(filePath);

//             // Assert
//             expect(mockConsoleLog).toHaveBeenCalledWith(`${filePath} was changed. Reloading JSON data...`);
//             expect(readFile).toHaveBeenCalledWith(filePath, 'utf8');
//             expect(calculateStats).toHaveBeenCalledWith(mockData);
//             expect(mockConsoleLog).toHaveBeenCalledWith('stats re-calculated');
//         });

//         it('should handle file change event with read error', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const readError = new Error('File read error');
//             readFile.mockRejectedValue(readError);

//             // Act
//             watchFile(filePath);

//             // Get the change handler
//             const changeHandler = mockOn.mock.calls.find(call => call[0] === 'change')[1];

//             // Simulate file change
//             await changeHandler(filePath);

//             // Assert
//             expect(mockConsoleLog).toHaveBeenCalledWith(`${filePath} was changed. Reloading JSON data...`);
//             expect(readFile).toHaveBeenCalledWith(filePath, 'utf8');
//             expect(logger.error).toHaveBeenCalledWith(readError, 'Error reading or parsing JSON file');
//             expect(calculateStats).not.toHaveBeenCalled();
//         });

//         it('should handle file change event with JSON parsing error', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const invalidJson = '{ invalid json }';
//             readFile.mockResolvedValue(invalidJson);

//             // Act
//             watchFile(filePath);

//             // Get the change handler
//             const changeHandler = mockOn.mock.calls.find(call => call[0] === 'change')[1];

//             // Simulate file change
//             await changeHandler(filePath);

//             // Assert
//             expect(mockConsoleLog).toHaveBeenCalledWith(`${filePath} was changed. Reloading JSON data...`);
//             expect(readFile).toHaveBeenCalledWith(filePath, 'utf8');
//             expect(logger.error).toHaveBeenCalledWith(
//                 expect.any(SyntaxError),
//                 'Error reading or parsing JSON file'
//             );
//             expect(calculateStats).not.toHaveBeenCalled();
//         });

//         it('should handle watcher error event', () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const watcherError = new Error('Watcher error');

//             // Act
//             watchFile(filePath);

//             // Get the error handler
//             const errorHandler = mockOn.mock.calls.find(call => call[0] === 'error')[1];

//             // Simulate watcher error
//             errorHandler(watcherError);

//             // Assert
//             expect(logger.error).toHaveBeenCalledWith(watcherError, 'Watcher error');
//         });

//         it('should call calculateStats with parsed data on successful change', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const mockData = [
//                 { id: 1, name: 'Product 1', price: 100 },
//                 { id: 2, name: 'Product 2', price: 200 }
//             ];
//             const mockJsonString = JSON.stringify(mockData);

//             readFile.mockResolvedValue(mockJsonString);

//             // Act
//             watchFile(filePath);

//             // Get the change handler
//             const changeHandler = mockOn.mock.calls.find(call => call[0] === 'change')[1];

//             // Simulate file change
//             await changeHandler(filePath);

//             // Assert
//             expect(calculateStats).toHaveBeenCalledWith(mockData);
//         });

//         it('should not call calculateStats when file read fails', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             readFile.mockRejectedValue(new Error('Read failed'));

//             // Act
//             watchFile(filePath);

//             // Get the change handler
//             const changeHandler = mockOn.mock.calls.find(call => call[0] === 'change')[1];

//             // Simulate file change
//             await changeHandler(filePath);

//             // Assert
//             expect(calculateStats).not.toHaveBeenCalled();
//         });

//         it('should handle multiple file changes', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const mockData1 = [{ id: 1, name: 'First', price: 100 }];
//             const mockData2 = [{ id: 2, name: 'Second', price: 200 }];

//             readFile
//                 .mockResolvedValueOnce(JSON.stringify(mockData1))
//                 .mockResolvedValueOnce(JSON.stringify(mockData2));

//             // Act
//             watchFile(filePath);

//             // Get the change handler
//             const changeHandler = mockOn.mock.calls.find(call => call[0] === 'change')[1];

//             // Simulate multiple file changes
//             await changeHandler(filePath);
//             await changeHandler(filePath);

//             // Assert
//             expect(calculateStats).toHaveBeenCalledTimes(2);
//             expect(calculateStats).toHaveBeenNthCalledWith(1, mockData1);
//             expect(calculateStats).toHaveBeenNthCalledWith(2, mockData2);
//         });
//     });

//     describe('Integration Tests', () => {
//         it('should handle both functions working together', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const mockData = [{ id: 1, name: 'Test', price: 100 }];
//             const mockJsonString = JSON.stringify(mockData);

//             readFile.mockResolvedValue(mockJsonString);

//             // Act - Test fetchDataAsync
//             const readResult = await fetchDataAsync(filePath);

//             // Act - Test watchFile
//             const watcher = watchFile(filePath);

//             // Assert
//             expect(readResult).toEqual(mockData);
//             expect(watcher).toBeDefined();
//             expect(readFile).toHaveBeenCalledTimes(1);
//         });

//         it('should handle errors in both functions gracefully', async () => {
//             // Arrange
//             const filePath = '/path/to/data.json';
//             const readError = new Error('Read error');
//             readFile.mockRejectedValue(readError);

//             // Act & Assert - Test fetchDataAsync error
//             await expect(fetchDataAsync(filePath)).rejects.toThrow('Read error');

//             // Act - Test watchFile still works
//             const watcher = watchFile(filePath);
//             expect(watcher).toBeDefined();
//         });
//     });
// }); 