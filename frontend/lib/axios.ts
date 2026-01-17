import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// DEBUG: Proveri konfiguraciju
console.log('🔧 Axios Configuration:', {
    API_URL,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL
});

export const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor sa debug logom
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('🚀 Axios Request:', {
            method: config.method?.toUpperCase(),
            url: config.url,
            fullURL: `${config.baseURL}${config.url}`,
            data: config.data,
            withCredentials: config.withCredentials,
            headers: config.headers
        });
        return config;
    },
    (error) => {
        console.error('❌ Request Error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor sa debug logom
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('✅ Axios Response:', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url,
            data: response.data,
            headers: response.headers
        });
        return response;
    },
    (error) => {
        console.error('❌ Axios Response Error:', {
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
            message: error.message,
            fullError: error
        });
        
        // Ako je 401, preusmeri na login
        if (error.response?.status === 401) {
            const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
            console.log('⚠️ Got 401, current path:', currentPath);
            
            if (!currentPath.includes('/login') && !currentPath.includes('/register')) {
                console.log('🔄 Redirecting to /login...');
                if (typeof window !== 'undefined') {
                    window.location.href = '/login';
                }
            } else {
                console.log('ℹ️ Already on login/register page, not redirecting');
            }
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;