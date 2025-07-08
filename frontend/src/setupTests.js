// throw new Error('test')
// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';


// ! Mock Service Worker is not working
// import { server } from './mocks/server.js'

// beforeAll(() => {
//     // Start the interception.
//     server.listen()
// })

// afterEach(() => {
//     // Remove any handlers you may have added
//     // in individual tests (runtime handlers).
//     server.resetHandlers()
// })

// afterAll(() => {
//     // Disable request interception and clean up.
//     server.close()
// })

// Mock react-error-boundary for tests
jest.mock('react-error-boundary', () => ({
    useErrorBoundary: jest.fn(() => ({
        showBoundary: jest.fn()
    })),
    ErrorBoundary: ({ children, fallback }) => {
        if (fallback) {
            return fallback;
        }
        return children;
    }
}));

// Mock react-router-dom for tests
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => jest.fn(),
    useParams: () => ({ id: '1' }),
    Link: ({ children, to }) => <a href={to}>{children}</a>
}));

// Mock react-window components
jest.mock('react-window', () => ({
    FixedSizeList: ({ children, itemCount, itemSize, height, width }) => (
        <div data-testid="virtual-list" style={{ height, width }}>
            {Array.from({ length: itemCount }, (_, index) =>
                children({ index, style: { height: itemSize } })
            )}
        </div>
    )
}));

jest.mock('react-virtualized-auto-sizer', () => ({
    __esModule: true,
    default: ({ children }) => children({ width: 800, height: 600 })
}));

// Global fetch mock
// global.fetch = jest.fn(() =>
//     Promise.resolve({
//         ok: true, // Simulate a successful response
//         json: () => Promise.resolve({ data: 'test data' }),
//     })
// );

// console.log('check fetch func mocked', fetch('https://fakestoreapi.com/products'));

// Suppress console errors in tests
// const originalError = console.error;
// beforeAll(() => {
//     console.error = (...args) => {
//         // console.log('console.error', args);
//         if (
//             typeof args[0] === 'string' &&
//             args[0].includes('Warning: ReactDOM.render is no longer supported')
//         ) {
//             return;
//         }
//         originalError.call(console, ...args);
//     };
// });

// afterAll(() => {
//     console.error = originalError;
// });
