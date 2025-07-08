
import React from 'react';
import userEvent from '@testing-library/user-event';
import { render, screen, waitFor, act } from '../test-utils';
import ItemDetail from '../pages/ItemDetail';
import { useParams, useNavigate } from 'react-router-dom';

// Mock react-router-dom hooks
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useParams: jest.fn(),
    useNavigate: jest.fn()
}));

// Mock the useAbortableFetch hook
jest.mock('../hooks/useAbortableFetch', () => {
    // return jest.fn();
    return {
        __esModule: true,
        ...jest.requireActual('../hooks/useAbortableFetch'),
        default: jest.fn()
    }
});

// Mock react-error-boundary
jest.mock('react-error-boundary', () => ({
    useErrorBoundary: jest.fn()
}));

// Mock components
jest.mock('../components/Spinner', () => {
    return function MockSpinner() {
        return <div data-testid="spinner">Loading...</div>;
    };
});

jest.mock('../components/ui/ArrowGoBackFill', () => ({
    ArrowGoBackFill: () => <span data-testid="arrow-icon">←</span>
}));


// Mock environment variable
// process.env.REACT_APP_API_URL = 'http://localhost:3001';

// // Mock environment variable
// const originalEnv = process.env;
// beforeAll(() => {
//     process.env.REACT_APP_API_URL = 'http://localhost:3001';
// });

// afterAll(() => {
//     process.env = originalEnv;
// });

// Import the mocked hook
import useAbortableFetch, { useAbortableFetch as useAbortableFetchOriginal } from '../hooks/useAbortableFetch';
import * as useAbortableFetchModule from '../hooks/useAbortableFetch';
import { useErrorBoundary } from 'react-error-boundary';

// Mock data for testing
const mockItemData = {
    id: 1,
    name: 'Test Product',
    price: 29.99,
    category: 'Electronics'
};

const mockItemDataWithMissingPrice = {
    id: 2,
    name: 'Incomplete Product'
    // missing price and category
};

const mockItemDataWithMissingName = {
    id: 3,
    price: 29.99,
    category: 'Electronics'
    // missing name
};

const mockItemDataWithMissingBoth = {
    id: 4,
    category: 'Electronics'
    // missing name and price
};

const mockEmptyItemData = {};

const mockItemWithMissingFields = {
    id: 2,
    name: 'Test Product'
    // missing category and price
};

const mockItemWithZeroPrice = {
    id: 3,
    name: 'Free Product',
    category: 'Freebies',
    price: 0
};

const mockItemWithDecimalPrice = {
    id: 4,
    name: 'Budget Product',
    category: 'Budget',
    price: 99.50
};

const mockItemWithVeryLongName = {
    id: 5,
    name: 'A'.repeat(1000),
    category: 'Long Names',
    price: 100.00
};

const mockItemWithSpecialCharacters = {
    id: 6,
    name: 'Product with @#$% symbols',
    category: 'Special & Characters',
    price: 150.75
};

// Helper function to render ItemDetail component with Router
const renderItemDetail = () => {
    render(
        <ItemDetail />
    );
};

describe('ItemDetail Page', () => {
    const mockNavigate = jest.fn();
    const mockShowBoundary = jest.fn();

    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup default mock implementations
        useParams.mockReturnValue({ id: 1 });
        useNavigate.mockReturnValue(mockNavigate);
        useErrorBoundary.mockReturnValue({ showBoundary: mockShowBoundary });

        // Mock useAbortableFetch with default success response
        useAbortableFetch.mockReturnValue({
            data: mockItemData,
            isLoading: false,
            error: null
        });
    });

    describe('Initial Rendering', () => {
        it('should render the component with item data', async () => {
            await act(async () => {
                renderItemDetail();
            });

            // item data
            expect(screen.getByText('Test Product')).toBeInTheDocument();
            expect(screen.getByText(/Electronics/i)).toBeInTheDocument();
            expect(screen.getByText('Price: $29.99')).toBeInTheDocument();

            // back button and arrow icon
            expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
            expect(screen.getByTestId('arrow-icon')).toBeInTheDocument();

            // logo image
            const logoImage = screen.getByAltText('ShinyBoxLogo');
            expect(logoImage).toBeInTheDocument();
            expect(logoImage).toHaveAttribute('src', 'ShinyBoxLogo.png');
        });
    });

    describe('Data Fetching', () => {
        it('should call useAbortableFetch with correct URL', async () => {
            await act(async () => {
                renderItemDetail();
            });

            expect(useAbortableFetch).toHaveBeenCalledWith(expect.stringContaining('/api/items/1'));
        });

        it('should handle different item IDs', async () => {
            useParams.mockReturnValue({ id: '123' });

            await act(async () => {
                renderItemDetail();
            });

            expect(useAbortableFetch).toHaveBeenCalledWith(expect.stringContaining('/api/items/123'));
        });

        it('should handle items with error', async () => {
            useAbortableFetch.mockReturnValue({
                data: mockItemData,
                isLoading: false,
                error: new Error('Invalid item data')
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(mockShowBoundary).toHaveBeenCalledWith(new Error('Invalid item data'));
        });

        it('should handle items with missing both name and price', async () => {
            useAbortableFetch.mockReturnValue({
                data: mockItemDataWithMissingBoth,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(screen.getByText('Invalid item data')).toBeInTheDocument();
        });

        it('should handle empty item data', async () => {
            useAbortableFetch.mockReturnValue({
                data: mockEmptyItemData,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(screen.getByText('Invalid item data')).toBeInTheDocument();
        });

        it('should handle items with zero price with 2 decimal places', async () => {
            const zeroPriceItem = { ...mockItemData, price: 0 };
            useAbortableFetch.mockReturnValue({
                data: zeroPriceItem,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(screen.getByText('Price: $0.00')).toBeInTheDocument();
        });


        it('should handle extremely large price values with 2 decimal places', async () => {
            const largePriceItem = { ...mockItemData, price: Number.MAX_SAFE_INTEGER };
            useAbortableFetch.mockReturnValue({
                data: largePriceItem,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(screen.getByText(`Price: $${Number.MAX_SAFE_INTEGER.toFixed(2)}`)).toBeInTheDocument();
        });

        it('should throw error when no URL is provided in useAbortableFetchOriginal', async () => {
            expect(() => useAbortableFetchOriginal()).toThrow('URL is required');
        });
    });


    describe('Loading States', () => {
        it('should show spinner when data is loading', async () => {
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: true,
                error: null
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(screen.getByTestId('spinner')).toBeInTheDocument();
            expect(screen.queryByText('Test Product')).not.toBeInTheDocument();
        });

        it('should transition from loading to loaded state', async () => {

            // Initial loading state
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: true,
                error: null
            });

            const { rerender } = render(<ItemDetail />);

            rerender(<ItemDetail />);
            expect(screen.getByTestId('spinner')).toBeInTheDocument();

            // Loaded state
            useAbortableFetch.mockReturnValue({
                data: mockItemData,
                isLoading: false,
                error: null
            });

            rerender(<ItemDetail />);

            await waitFor(() => {
                expect(screen.getByText('Test Product')).toBeInTheDocument();
                expect(screen.queryByTestId('spinner')).not.toBeInTheDocument();
            });
        });
    });

    describe('Error Handling', () => {
        it('should call showBoundary when there is an fetching error', async () => {
            const mockError = new Error('Network Error or other fetching error');
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: mockError
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(mockShowBoundary).toHaveBeenCalledWith(mockError);
        });
    });


    describe('Navigation', () => {
        it('should navigate to home page when back button is clicked', async () => {
            const user = userEvent.setup();

            await act(async () => {
                renderItemDetail();
            });

            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);

            expect(mockNavigate).toHaveBeenCalledWith('/');
        });

        it('should handle multiple back button clicks', async () => {
            const user = userEvent.setup();

            await act(async () => {
                renderItemDetail();
            });

            const backButton = screen.getByRole('button', { name: /back/i });
            await user.click(backButton);
            await user.click(backButton);

            expect(mockNavigate).toHaveBeenCalledTimes(2);
            expect(mockNavigate).toHaveBeenCalledWith('/');
        });
    });

    describe('Item Display', () => {
        it('should display item name as card title', async () => {
            await act(async () => {
                renderItemDetail();
            });

            const title = screen.getByText('Test Product');
            expect(title).toBeInTheDocument();
            expect(title).toHaveClass('text-white', 'self-center');
        });

        it('should display category with correct styling', async () => {
            await act(async () => {
                renderItemDetail();
            });

            const category = screen.getByText(/Electronics/i);
            expect(category).toBeInTheDocument();
            expect(category).toHaveClass('text-blue-500');
        });

        it('should display price with correct styling', async () => {
            await act(async () => {
                renderItemDetail();
            });

            const price = screen.getByText('Price: $29.99');
            expect(price).toBeInTheDocument();
            expect(price).toHaveClass('text-yellow-500');
        });

        it('should handle very long item names', async () => {
            const longNameItem = { ...mockItemData, name: 'A'.repeat(1000) };
            useAbortableFetch.mockReturnValue({
                data: longNameItem,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(screen.getByText('A'.repeat(1000))).toBeInTheDocument();
        });

        it('should handle items with special characters in name', async () => {
            const specialCharItem = { ...mockItemData, name: 'Product @#$%^&*()' };
            useAbortableFetch.mockReturnValue({
                data: specialCharItem,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItemDetail();
            });

            expect(screen.getByText('Product @#$%^&*()')).toBeInTheDocument();
        });
    });

    describe('Card Layout', () => {
        it('should render card with correct styling', async () => {
            await act(async () => {
                renderItemDetail();
            });

            const card = screen.getByLabelText('Card'); // Card renders as article
            expect(card).toHaveClass('max-h-[80%]', 'bg-gray-800', 'p-5', 'my-5');
        });

        it('should render card body with correct styling', async () => {
            await act(async () => {
                renderItemDetail();
            });

            const cardBody = screen.getByText('Test Product').closest('[class*="card-body"]');
            expect(cardBody).toHaveClass('p-3');
        });

        it('should render card actions with correct styling', async () => {
            await act(async () => {
                renderItemDetail();
            });

            const backButton = screen.getByRole('button', { name: /back/i });
            const cardActions = backButton.closest('[class*="card-actions"]');
            expect(cardActions).toHaveClass('justify-center');
        });
    });
}); 