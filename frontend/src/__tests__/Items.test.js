
import React from 'react';
import userEvent from '@testing-library/user-event';
import { renderHook, waitForElementToBeRemoved, cleanup } from '@testing-library/react';
import { render, screen, fireEvent, waitFor, act } from '../test-utils';
import Items from '../pages/Items';
// import { logRoles } from 'react-router-dom';

// Mock the API modules
jest.mock('../apis/items');
jest.mock('../apis/stats');

// Mock react-window components
jest.mock('react-window', () => ({
    FixedSizeList: ({ children, itemCount, itemSize, height, width }) => (
        <div data-testid="virtual-list" style={{ height, width }} key={Math.random()}>
            {Array.from({ length: Math.min(itemCount, 5) }, (_, index) =>
                children({ index, style: { height: itemSize } })
            )}
        </div>
    )
}));

jest.mock('react-virtualized-auto-sizer', () => ({
    __esModule: true,
    default: ({ children }) => children({ width: 300, height: 200 })
}));

// Mock PaginationWindow component
jest.mock('../components/PaginationWindow', () => {
    return function MockPaginationWindow({ items, renderItem, isNextPageLoading, loadNextPage }) {
        return (
            <div data-testid="pagination-window">
                {items.map((item, index) => renderItem(index, item))}
                {isNextPageLoading && <div data-testid="loading-indicator">Loading...</div>}
                <button onClick={loadNextPage} data-testid="load-more">Load More</button>
            </div>
        );
    };
});

// Mock ErrorAlert component
jest.mock('../components/ErrorAlert', () => {
    return function MockErrorAlert({ error }) {
        return <div data-testid="error-alert">{error}</div>;
    };
});

// Mock the useAbortableFetch hook
jest.mock('../hooks/useAbortableFetch', () => {
    return jest.fn();
});

// Mock data for testing
const mockItemsData = {
    pageResults: [
        { id: 1, name: 'Product 1', price: 10.99, category: 'Category 1' },
        { id: 2, name: 'Product 2', price: 20.99, category: 'Category 2' },
        { id: 3, name: 'Product 3', price: 30.99, category: 'Category 3' }
    ],
    page: 1,
    hasNextPage: true
};

const mockEmptyData = {
    pageResults: [],
    page: 1,
    hasNextPage: false
};

const mockLargeDataSet = {
    pageResults: Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `Product ${i + 1}`,
        price: (i + 1) * 10.99,
        category: `Category ${Math.floor(i / 10) + 1}`
    })),
    page: 1,
    hasNextPage: true
};

const mockStatsData = {
    total: 100,
    averagePrice: 25.50
};

const mockZeroStatsData = {
    total: 0,
    averagePrice: 0.00
};

import { fetchItems } from '../apis/items';
import { fetchStats } from '../apis/stats';
import useAbortableFetch from '../hooks/useAbortableFetch';

// Helper function to render Items component with Router
const renderItems = () => {
    render(<Items />);
}

describe('Items Page', () => {
    beforeEach(() => {
        // Clear all mocks before each test
        jest.clearAllMocks();

        // Setup default mock implementations
        fetchItems.mockResolvedValue(mockItemsData);
        // console.log("fetchItems", fetchItems.mock.results);
        fetchStats.mockResolvedValue(mockStatsData);

        // Mock useAbortableFetch for stats
        useAbortableFetch.mockReturnValue({
            data: mockStatsData,
            isLoading: false,
            error: null
        });
    });

    afterEach(() => {
        // console.log("afterEach");
        cleanup();
    });

    describe('Initial Rendering', () => {
        it('should render the component with initial state', async () => {
            await act(async () => {
                renderItems();
            });;

            expect(screen.getByText(/This demo app shows products list/)).toBeInTheDocument();
            expect(screen.getByTestId('search-button')).toBeInTheDocument();
            expect(screen.getByRole('textbox')).toBeInTheDocument();


            // display search input
            const searchInput = screen.getByPlaceholderText('Search by name');
            expect(searchInput).toBeInTheDocument();
            expect(searchInput).toHaveValue('');

            // display search icon in button
            const svg = screen.getByTitle('Search icon')
            expect(svg).toBeInTheDocument();

            // display statistics section
            expect(screen.getByText(/Total products/)).toBeInTheDocument();
            expect(screen.getByText(/Average price/)).toBeInTheDocument();
            expect(screen.getByRole('button', { name: 'Load More' })).toBeInTheDocument()
        });
    });

    describe('Search Functionality', () => {
        it('should update search input value when user types', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');
            await user.type(searchInput, 'test search');

            expect(searchInput).toHaveValue('test search');
        });

        it('should trigger search when search button is clicked', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');
            const searchButton = screen.getByTestId('search-button');

            await user.type(searchInput, 'test');
            await user.click(searchButton);

            await waitFor(() => {
                expect(fetchItems).toHaveBeenCalledTimes(2);
                expect(fetchItems).toHaveBeenCalledWith('limit=10&page=1&q=test');
            });
        });

        it('should handle empty search query', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchButton = screen.getByTestId('search-button');
            await user.click(searchButton);

            await waitFor(() => {
                expect(fetchItems).toHaveBeenCalledWith('limit=10&page=1&q=');
            });
        });

        it('should handle search with special characters', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');
            const searchButton = screen.getByTestId('search-button');

            await user.type(searchInput, 'test@#$%');
            await user.click(searchButton);

            // url encoded converts characters into a format that can be transmitted over the Internet.
            const encodedQuery = encodeURIComponent('test@#$%');

            await waitFor(() => {
                expect(fetchItems).toHaveBeenCalledWith(`limit=10&page=1&q=${encodedQuery}`);
            });
        });

        it('should handle very long search queries', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');
            const longQuery = 'a'.repeat(1000);

            await user.type(searchInput, longQuery);

            expect(searchInput).toHaveValue(longQuery);
        });

        it('should handle rapid search button clicks', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchButton = screen.getByTestId('search-button');

            await user.click(searchButton);
            await user.click(searchButton);
            await user.click(searchButton);

            await waitFor(() => {
                expect(fetchItems).toHaveBeenCalled();
            });
        });

        it('should clear search input when user clears it', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');
            await user.type(searchInput, 'test');
            await user.clear(searchInput);

            expect(searchInput).toHaveValue('');
        });
    });

    describe('Data Fetching', () => {
        it('should fetch data with mock data on component mount', async () => {
            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(fetchItems).toHaveBeenCalledWith('limit=10&page=1&q=');
                expect(fetchItems()).resolves.toEqual(mockItemsData);
                expect(useAbortableFetch).toHaveBeenCalled();
                expect(useAbortableFetch().data).toEqual(mockStatsData);
            });
        });

        it('should handle successful data fetch and display items', async () => {
            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 2')).toBeInTheDocument();
                expect(screen.getByText('Product 3')).toBeInTheDocument();
            });
        });

        it('should display item prices correctly', async () => {
            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(screen.getByText('$10.99')).toBeInTheDocument();
                expect(screen.getByText('$20.99')).toBeInTheDocument();
                expect(screen.getByText('$30.99')).toBeInTheDocument();
            });
        });

        it('should handle stats fetch error gracefully', async () => {
            // ! use mockZeroStatsData to avoid the error when using mockRejectedValueOnce
            useAbortableFetch.mockReturnValue({
                data: mockZeroStatsData,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                const totalProducts = screen.getByTestId('total-products');
                const averagePrice = screen.getByTestId('average-price');

                expect(totalProducts).toHaveTextContent('0');
                expect(averagePrice).toHaveTextContent('0.00');
            });
        });

        it('should handle network errors', async () => {
            fetchItems.mockRejectedValueOnce(new Error('Network Error'));

            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(screen.getByTestId('error-alert')).toHaveTextContent('Failed to fetch products data');
            });
        });

        it('should handle empty results array', async () => {
            fetchItems.mockResolvedValueOnce(mockEmptyData);

            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(screen.getByText('No products found')).toBeInTheDocument();
            });
        });

        it('should handle large datasets', async () => {
            fetchItems.mockResolvedValueOnce(mockLargeDataSet);

            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('Product 1000')).toBeInTheDocument();
            });
        });
    });

    describe('Pagination', () => {
        it('should not load next page if hasNextPage is false', async () => {
            fetchItems.mockResolvedValueOnce(mockEmptyData);

            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(fetchItems).toHaveBeenCalledTimes(1);
            });
        });

        it('should render pagination window', async () => {
            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                expect(screen.getByTestId('pagination-window')).toBeInTheDocument();
            });
        });

        it('should render load more button when loadNextPage is called', async () => {
            await act(async () => {
                renderItems();
            });;

            await waitFor(() => {
                const loadMoreButton = screen.getByTestId('load-more');
                expect(loadMoreButton).toBeInTheDocument();
            });
        });
    });

    describe('Item Rendering', () => {
        it('should render item links with correct href', async () => {
            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                const links = screen.getAllByRole('link');
                expect(links[0]).toHaveAttribute('href', '/items/1');
                expect(links[1]).toHaveAttribute('href', '/items/2');
                expect(links[2]).toHaveAttribute('href', '/items/3');
            });
        });

        it('should handle items with missing data', async () => {
            const mockDataWithMissingFields = {
                pageResults: [
                    { id: 1, name: 'Product 1', price: 10.99 },
                    { id: 2, name: 'Product 2' }, // missing price
                    { id: 3, price: 30.99 } // missing name
                ],
                page: 1,
                hasNextPage: true
            };

            fetchItems.mockResolvedValueOnce(mockDataWithMissingFields);

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.getByText('$10.99')).toBeInTheDocument();
                expect(screen.queryByText('Product 2')).not.toBeInTheDocument();
                expect(screen.queryByText('$30.99')).not.toBeInTheDocument();
            });
        });

        it('should handle items with zero prices', async () => {
            const mockDataWithZeroPrice = {
                pageResults: [
                    { id: 1, name: 'Free Product', price: 0 },
                    { id: 2, name: 'Paid Product', price: 10.99 }
                ],
                page: 1,
                hasNextPage: true
            };

            fetchItems.mockResolvedValueOnce(mockDataWithZeroPrice);

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByText('Free Product')).toBeInTheDocument();
                expect(screen.getByText('$0')).toBeInTheDocument();
                expect(screen.getByText('$10.99')).toBeInTheDocument();
            });
        });
    });

    describe('Statistics Display with useAbortableFetch', () => {
        it('should display stats data correctly when useAbortableFetch succeeds', async () => {
            useAbortableFetch.mockReturnValue({
                data: mockStatsData,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByTestId('total-products')).toHaveTextContent('100');
                expect(screen.getByTestId('average-price')).toHaveTextContent('$25.50');
            });
        });

        it('should display loading skeleton when stats are loading', async () => {
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: true,
                error: null
            });

            await act(async () => {
                renderItems();
            });;


            // Should show skeleton for stats loading
            expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument();
            expect(screen.queryByTestId('total-products')).not.toBeInTheDocument();
            expect(screen.queryByTestId('average-price')).not.toBeInTheDocument();
        });

        it('should display error alert when stats fetch fails', async () => {
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: 'Failed to fetch statistics'
            });

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByTestId('error-alert')).toHaveTextContent('Failed to fetch statistics data');
            });
        });


        it('should handle stats data with missing fields', async () => {
            const incompleteStatsData = {
                total: 50
                // missing averagePrice
            };

            useAbortableFetch.mockReturnValue({
                data: incompleteStatsData,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByTestId('total-products')).toHaveTextContent('50');
                expect(screen.getByTestId('average-price')).toHaveTextContent('$NaN');
            });
        });

        it('should handle stats data with very large numbers', async () => {
            const largeStatsData = {
                total: Number.MAX_SAFE_INTEGER,
                averagePrice: Number.MAX_SAFE_INTEGER
            };

            useAbortableFetch.mockReturnValue({
                data: largeStatsData,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByTestId('total-products')).toHaveTextContent(Number.MAX_SAFE_INTEGER.toString());
                expect(screen.getByTestId('average-price')).toHaveTextContent('$' + Number.MAX_SAFE_INTEGER.toFixed(2));
            });
        });

        it('should handle stats data with decimal prices', async () => {
            const decimalStatsData = {
                total: 100,
                averagePrice: 25.6789
            };

            useAbortableFetch.mockReturnValue({
                data: decimalStatsData,
                isLoading: false,
                error: null
            });

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByTestId('total-products')).toHaveTextContent('100');
                expect(screen.getByTestId('average-price')).toHaveTextContent('$25.68');
            });
        });

        it('should call useAbortableFetch with correct URL', async () => {
            await act(async () => {
                renderItems();
            });;


            expect(useAbortableFetch).toHaveBeenCalledWith(expect.stringContaining('/api/stats'));
        });

        it('should handle transition from loading to loaded state', async () => {
            const { rerender } = render(<Items />);

            // Initial loading state
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: true,
                error: null
            });

            rerender(<Items />);
            expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument();

            // Loaded state
            useAbortableFetch.mockReturnValue({
                data: mockStatsData,
                isLoading: false,
                error: null
            });

            rerender(<Items />);

            await waitFor(() => {
                expect(screen.getByTestId('total-products')).toHaveTextContent('100');
                expect(screen.getByTestId('average-price')).toHaveTextContent('$25.50');
            });
        });

        it('should handle transition from loading to error state', async () => {
            const { rerender } = render(<Items />);

            // Initial loading state
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: true,
                error: null
            });

            rerender(<Items />);
            expect(screen.getByTestId('stats-skeleton')).toBeInTheDocument();

            // Error state
            useAbortableFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: 'Network error'
            });

            rerender(<Items />);

            await waitFor(() => {
                expect(screen.getByTestId('error-alert')).toHaveTextContent('Failed to fetch statistics data');
            });
        });
    });

    describe('Loading States', () => {
        it('should handle loading state during data fetch', async () => {
            fetchItems.mockImplementation(() =>
                new Promise(resolve => setTimeout(() => resolve(mockItemsData), 100))
            );

            await act(async () => {
                renderItems();
            });;


            expect(screen.getByText('No products found')).toBeInTheDocument();

            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
            }, { timeout: 200 });
        });
    });


    describe('Concurrent API Calls', () => {
        it('should handle fast API calls with throttling', async () => {
            const user = userEvent.setup();

            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');
            const searchButton = screen.getByTestId('search-button');

            // Simulate rapid consecutive search button clicks
            // The throttling should prevent excessive API calls
            await user.type(searchInput, 'first');
            await user.click(searchButton);

            // Immediately try to search again(should be throttled)
            await user.clear(searchInput);
            await user.type(searchInput, 'second');
            await user.click(searchButton);

            // Try a third search immediately (should be throttled)
            await user.clear(searchInput);
            await user.type(searchInput, 'third');
            await user.click(searchButton);

            // Wait for any pending operations
            await waitFor(() => {
                // Should only have 2 API calls: initial load + first search
                // The second and third searches should be throttled
                expect(fetchItems).toHaveBeenCalledTimes(2);
                // console.log("fetchItems: ", fetchItems.mock.calls);
            });

            // Verify the specific calls that were made
            expect(fetchItems).toHaveBeenNthCalledWith(1, 'limit=10&page=1&q='); // Initial load
            expect(fetchItems).toHaveBeenNthCalledWith(2, 'limit=10&page=1&q=first'); // First search
        });

        it('should allow subsequent searches after throttling period', async () => {
            const user = userEvent.setup();

            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');
            const searchButton = screen.getByTestId('search-button');

            // First search
            await user.type(searchInput, 'initial');
            await user.click(searchButton);

            // Wait for throttling period to pass (1000ms)
            await new Promise(resolve => setTimeout(resolve, 1100));

            // Second search after throttling period
            await user.clear(searchInput);
            await user.type(searchInput, 'delayed');
            await user.click(searchButton);

            await waitFor(() => {
                // Should have 3 calls: initial load + first search + delayed search
                expect(fetchItems).toHaveBeenCalledTimes(3);
            });

            expect(fetchItems).toHaveBeenNthCalledWith(1, 'limit=10&page=1&q='); // Initial load
            expect(fetchItems).toHaveBeenNthCalledWith(2, 'limit=10&page=1&q=initial'); // First search
            expect(fetchItems).toHaveBeenNthCalledWith(3, 'limit=10&page=1&q=delayed'); // Delayed search
        });

        it('should filter out malformed item data', async () => {
            const malformedData = {
                pageResults: [
                    { id: 1, name: 'Product 1', price: 10.99 },
                    { id: 2, name: null, price: 'invalid' }, // ! malformed item data to be filtered out
                    { id: 3, name: 'Product 3', price: 30.99 }
                ],
                page: 1,
                hasNextPage: true
            };

            fetchItems.mockResolvedValueOnce(malformedData);

            await act(async () => {
                renderItems();
            });;


            await waitFor(() => {
                expect(screen.getByText('Product 1')).toBeInTheDocument();
                expect(screen.queryByText(/invalid/i)).toBeNull();
            });
        });

        it('should handle extremely large price value', async () => {
            const largeNumberData = {
                pageResults: [
                    { id: 1, name: 'Product 12', price: Number.MAX_SAFE_INTEGER }
                ],
                page: 1,
                hasNextPage: true
            };

            fetchItems.mockResolvedValueOnce(largeNumberData);

            await act(async () => {
                renderItems();
            });;


            const product1 = screen.getByText('Product 12');
            await waitFor(() => {
                expect(product1).toBeInTheDocument();
            });
        });

    });


    describe('Performance Tests', () => {

        it('should handle rapid state changes', async () => {
            const user = userEvent.setup();
            await act(async () => {
                renderItems();
            });;

            const searchInput = screen.getByPlaceholderText('Search by name');

            for (let i = 0; i < 50; i++) {
                await user.type(searchInput, 'a');
            }

            expect(searchInput).toHaveValue('a'.repeat(50));
        });
    });

    describe('Custom Hook', () => {
        it("should return the initial values for data, error and loading", async () => {
            const { result } = renderHook(() => useAbortableFetch());
            const { data, isLoading, error } = result.current;

            expect(data).toBe(mockStatsData);
            expect(error).toBe(null);
            expect(isLoading).toBe(false);
        });
    });


}); 