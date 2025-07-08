import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import App from '../pages/App';
import { render } from '../test-utils';

// Mock the child components
jest.mock('../pages/Items', () => {
    return function MockItems() {
        return <div data-testid="items-page">Items Page</div>;
    };
});

jest.mock('../pages/ItemDetail', () => {
    return function MockItemDetail() {
        return <div data-testid="item-detail-page">Item Detail Page</div>;
    };
});

jest.mock('../state/DataContext', () => ({
    DataProvider: ({ children }) => <div data-testid="data-provider">{children}</div>
}));

jest.mock('../components/ErrorFallback', () => {
    return function MockErrorFallback() {
        return <div data-testid="error-fallback">Error Fallback</div>;
    };
});

// Mock react-daisyui components
jest.mock('react-daisyui', () => ({
    Theme: ({ children, dataTheme }) => (
        <div data-testid="theme" data-theme={dataTheme}>
            {children}
        </div>
    ),
    PhoneMockup: ({ children, className }) => (
        <div data-testid="phone-mockup" className={className}>
            {children}
        </div>
    ),
    BottomNavigation: Object.assign(
        ({ children, className }) => (
            <div data-testid="bottom-navigation" className={className}>
                {children}
            </div>
        ),
        {
            Item: ({ children, className, active }) => (
                <div data-testid="bottom-navigation-item" className={className} data-active={active}>
                    {children}
                </div>
            )
        }
    )
}));

// Mock the image assets
jest.mock('../assets/ProductIcon.png', () => 'ProductIcon.png');
jest.mock('../assets/TestIcon.png', () => 'TestIcon.png');
jest.mock('../assets/ExamIcon.png', () => 'ExamIcon.png');

// Mock the CSS import
jest.mock('../styles/index.css', () => ({}));

// Helper function to render App component with Router
const renderApp = () => {
    render(<App />);
};

describe('App Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should integrate all required components', () => {
        renderApp();

        // Check that all major components are present
        expect(screen.getByTestId('theme')).toBeInTheDocument();
        expect(screen.getByTestId('phone-mockup')).toBeInTheDocument();
        expect(screen.getByTestId('data-provider')).toBeInTheDocument();
        expect(screen.getByTestId('bottom-navigation')).toBeInTheDocument();
        expect(screen.getByTestId('items-page')).toBeInTheDocument();
        expect(screen.queryByTestId('item-detail-page')).not.toBeInTheDocument(); // Item Detail page is not rendered as default route
        expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument(); // Error fallback is not rendered by default
    });

    it('should render bottom navigation with correct structure and items', () => {
        renderApp();

        const bottomNav = screen.getByTestId('bottom-navigation');
        expect(bottomNav).toBeInTheDocument();
        expect(bottomNav).toHaveClass('absolute');

        // Check for all three navigation items
        const navItems = screen.getAllByTestId('bottom-navigation-item');
        expect(navItems).toHaveLength(3);


        // Check navigation item classes
        expect(navItems[0]).toHaveClass('btn-ghost'); // ShinyBox
        expect(navItems[1]).toHaveAttribute('data-active', 'true');    // Products
        expect(navItems[2]).toHaveClass('btn-ghost'); // GitHub
    });

    it('should render navigation links with correct attributes and icons', () => {
        renderApp();

        // GitHub link
        const githubLink = screen.getByRole('link', { name: /shinybox/i });
        expect(githubLink).toHaveAttribute('href', 'https://github.com/ShinyBoxInteractiveInc/test4');
        expect(githubLink).toHaveAttribute('target', '_blank');

        // Home link
        const homeLink = screen.getByRole('link', { name: /products/i });
        expect(homeLink).toHaveAttribute('href', '/');

        // Exam link
        const examLink = screen.getByRole('link', { name: /github/i });
        expect(examLink).toHaveAttribute('href', 'https://github.com/nguyenvinh1711/ShinyBoxInteractiveInc-test4-exam');
        expect(examLink).toHaveAttribute('target', '_blank');

        // Check all icons have correct class
        const icons = screen.getAllByRole('img');
        expect(icons).toHaveLength(3);
        icons.forEach(icon => {
            expect(icon).toHaveClass('h-10');
        });
    });


    it('should handle when clicking on the products link and render the items page', () => {
        renderApp();
        // check click products link    
        const productsLink = screen.getByRole('link', { name: /products/i });
        fireEvent.click(productsLink);

        // Check that the correct page is rendered
        expect(screen.getByTestId('items-page')).toBeInTheDocument();
        expect(screen.queryByTestId('item-detail-page')).not.toBeInTheDocument(); // Item Detail page is not rendered as default route
        expect(screen.queryByTestId('error-fallback')).not.toBeInTheDocument(); // Error fallback is not rendered by default
    });
});