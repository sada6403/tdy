import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import axios from 'axios';

axios.defaults.withCredentials = true;

console.log('Mounting React Application...');
const rootElement = document.getElementById('root');
if (!rootElement) {
    console.error('CRITICAL: Root element not found!');
} else {
    ReactDOM.createRoot(rootElement).render(
        <React.StrictMode>
            <App />
        </React.StrictMode>,
    )
    console.log('Mounting initiated.');
}
