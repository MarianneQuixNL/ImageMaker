

import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { loadConfigurations } from './services/configLoader';
import { SplashScreen } from './components/SplashScreen';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const Root = () => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [status, setStatus] = useState("Initializing system...");
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadConfigurations(setStatus)
            .then(() => setIsLoaded(true))
            .catch(err => {
                console.error("Configuration Load Failed:", err);
                setError("Failed to load application configurations. Please check your connection and reload.");
            });
    }, []);

    if (error) {
        return (
            <div className="fixed inset-0 bg-gray-950 flex flex-col items-center justify-center text-red-400 p-8 text-center font-sans">
                <div className="bg-gray-900 p-8 rounded-2xl border border-red-900/50 shadow-2xl max-w-md">
                    <h1 className="text-2xl font-black mb-4 text-red-500">Startup Error</h1>
                    <p className="text-gray-300 mb-6 leading-relaxed">{error}</p>
                    <button 
                        onClick={() => window.location.reload()} 
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-colors"
                    >
                        Reload Application
                    </button>
                </div>
            </div>
        );
    }

    if (!isLoaded) {
        return <SplashScreen status={status} />;
    }

    return (
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
};

const root = ReactDOM.createRoot(rootElement);
root.render(<Root />);
