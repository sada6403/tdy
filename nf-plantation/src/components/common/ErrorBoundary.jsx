import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-8 text-center font-sans">
                    <h1 className="text-4xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                    <p className="text-lg text-gray-300 mb-8">
                        The application encountered an unexpected error.
                    </p>

                    <div className="bg-black/50 p-6 rounded-xl border border-white/10 text-left max-w-2xl w-full text-sm font-mono overflow-auto max-h-96">
                        <p className="text-red-400 font-bold mb-2">{this.state.error && this.state.error.toString()}</p>
                        <pre className="text-gray-500 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-bold transition-all"
                        >
                            Reload Page
                        </button>
                        <button
                            onClick={() => {
                                localStorage.clear();
                                window.location.reload();
                            }}
                            className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold transition-all border border-white/20"
                        >
                            Clear Cache & Reload
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
