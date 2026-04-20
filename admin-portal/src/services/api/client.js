import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || '/api',
    withCredentials: true, // Crucial for HttpOnly cookies
    timeout: 30000,
});

apiClient.interceptors.response.use(
    (response) => {
        // Standardize success parsing
        return response.data;
    },
    (error) => {
        // Standardize error handling
        const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
        const code = error.response?.status;
        
        if (code === 401 && window.location.pathname !== '/login') {
            // Unauthenticated - cookie expired or missing
            window.location.href = '/login';
        }

        return Promise.reject({
            message,
            code,
            originalError: error
        });
    }
);

export default apiClient;
