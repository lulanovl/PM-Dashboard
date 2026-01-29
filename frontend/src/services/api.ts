import axios from 'axios';

const API_URL = 'http://localhost:8000/api/v1'; // Updated to match backend prefix

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid - clear local storage and redirect to login if not already there
            localStorage.removeItem('token');
            if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export const deleteProject = async (id: number) => {
    return api.delete(`/project/${id}`);
};

export const updateProject = async (id: number, data: { name?: string; description?: string }) => {
    return api.put(`/project/${id}/info`, data);
};

export default api;
