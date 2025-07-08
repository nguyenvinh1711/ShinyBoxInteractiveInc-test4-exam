import React from 'react';
import { Routes, Route, Link, Outlet } from 'react-router-dom';
import Items from './Items';
import ItemDetail from './ItemDetail';
import { DataProvider } from '../state/DataContext';

import { ErrorBoundary } from 'react-error-boundary';
import ErrorFallback from '../components/ErrorFallback';
import { Theme, PhoneMockup, BottomNavigation } from 'react-daisyui'

import '../styles/index.css';

import ProductIcon from '../assets/ProductIcon.png';
import TestIcon from '../assets/TestIcon.png';
import ExamIcon from '../assets/ExamIcon.png';


function App() {
    return (
        <DataProvider>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<Items />} />
                    <Route path="items/:id" element={<ItemDetail />} />
                </Route>
            </Routes>
        </DataProvider>
    );
}

// * This component acts as the layout for the home route and its subroutes
function MainLayout() {
    return (
        <Theme dataTheme="dark">
            <PhoneMockup className="mt-20 text-center">
                <ErrorBoundary FallbackComponent={ErrorFallback}>
                    <div className="flex flex-col items-center justify-start w-full h-full p-5 relative" >
                        <BottomNavigation className="absolute">
                            <BottomNavigation.Item className="btn-ghost">
                                <a href="https://github.com/ShinyBoxInteractiveInc/test4" target="_blank">
                                    <img src={TestIcon} alt="ShinyBox" className="h-10" color="success" />
                                </a>
                            </BottomNavigation.Item>
                            <BottomNavigation.Item active>
                                <Link to="/">
                                    <img src={ProductIcon} alt="Products" className="h-10" color="success" />
                                </Link>
                            </BottomNavigation.Item>
                            <BottomNavigation.Item className="btn-ghost">
                                <a href="https://github.com/nguyenvinh1711/ShinyBoxInteractiveInc-test4-exam" target="_blank">
                                    <img src={ExamIcon} alt="GitHub" className="h-10" />
                                </a>
                            </BottomNavigation.Item>
                        </BottomNavigation>

                        {/* Outlet renders the matched child routes */}
                        <Outlet />
                    </div>
                </ErrorBoundary>
            </PhoneMockup>
        </Theme>
    );
}

export default App;