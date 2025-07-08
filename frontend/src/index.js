import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './pages/App';
import { Theme, PhoneMockup } from 'react-daisyui';


// ! Mocking is only enabled in development environment
// async function enableMocking() {
//     if (process.env.NODE_ENV !== 'development') {
//         return
//     }

//     const { worker } = await import('./mocks/browser.js')

//     // `worker.start()` returns a Promise that resolves
//     // once the Service Worker is up and ready to intercept requests.
//     return worker.start()
// }

// await enableMocking()

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </React.StrictMode>
)