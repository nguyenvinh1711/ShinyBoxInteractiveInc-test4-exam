import { jest } from '@jest/globals';

// * mock manually for file fileProcessor.js
// export const mockFetchDataAsync = jest.fn();
// const mock = jest.fn().mockImplementation(() => {
//     return { fetchDataAsync: mockFetchDataAsync };
// });


const fetchDataAsync = jest.fn();
export { fetchDataAsync };