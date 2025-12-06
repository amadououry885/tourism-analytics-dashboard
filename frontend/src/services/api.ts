import axios, { AxiosInstance, InternalAxiosRequestConfig, AxiosError } from 'axios';

// Use production URL directly to avoid Vercel build-time environment variable issues
const API_BASE_URL = 'https://tourism-analytics-backend.onrender.com/api';

// Set axios defaults globally so ALL axios calls use the correct base URL
axios.defaults.baseURL = API_BASE_URL;

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add JWT token to every request
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor - handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If 401 and we haven't retried yet, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem('accessToken', access);

        // Retry original request with new token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${access}`;
        }
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh failed - clear auth and redirect to login
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// API helper functions
export const authAPI = {
  login: (username: string, password: string) =>
    api.post('/auth/login/', { username, password }),
  
  register: (data: {
    username: string;
    email: string;
    password: string;
    password2: string;
    role: string;
    first_name?: string;
    last_name?: string;
  }) => api.post('/auth/register/', data),
  
  logout: () => api.post('/auth/logout/'),
  
  refreshToken: (refresh: string) =>
    api.post('/auth/token/refresh/', { refresh }),
  
  getCurrentUser: () => api.get('/auth/user/'),
};

export const adminAPI = {
  getPendingUsers: () => api.get('/auth/admin/users/pending/'),
  
  approveUser: (userId: number) =>
    api.post(`/auth/admin/users/${userId}/approve/`),
  
  rejectUser: (userId: number) =>
    api.post(`/auth/admin/users/${userId}/reject/`),
  
  getAllUsers: () => api.get('/auth/admin/users/'),
};

export const vendorAPI = {
  getMyVendors: () => api.get('/vendors/'),
  
  createVendor: (data: {
    name: string;
    city: string;
    cuisines: string[];
    is_active?: boolean;
  }) => api.post('/vendors/', data),
  
  updateVendor: (id: number, data: Partial<{
    name: string;
    city: string;
    cuisines: string[];
    is_active: boolean;
  }>) => api.put(`/vendors/${id}/`, data),
  
  deleteVendor: (id: number) => api.delete(`/vendors/${id}/`),
  
  getVendor: (id: number) => api.get(`/vendors/${id}/`),
};

export const stayAPI = {
  getMyStays: () => api.get('/stays/'),
  
  createStay: (data: {
    name: string;
    type: string;
    district: string;
    priceNight: string;
    rating?: number;
    amenities?: string[];
    is_active?: boolean;
  }) => api.post('/stays/', data),
  
  updateStay: (id: number, data: Partial<{
    name: string;
    type: string;
    district: string;
    priceNight: string;
    rating: number;
    amenities: string[];
    is_active: boolean;
  }>) => api.put(`/stays/${id}/`, data),
  
  deleteStay: (id: number) => api.delete(`/stays/${id}/`),
  
  getStay: (id: number) => api.get(`/stays/${id}/`),
};

export const placeAPI = {
  getAllPlaces: () => api.get('/analytics/places/'),
  
  createPlace: (data: {
    name: string;
    city: string;
    category: string;
    is_active?: boolean;
  }) => api.post('/analytics/places/', data),
  
  updatePlace: (id: number, data: Partial<{
    name: string;
    city: string;
    category: string;
    is_active: boolean;
  }>) => api.put(`/analytics/places/${id}/`, data),
  
  deletePlace: (id: number) => api.delete(`/analytics/places/${id}/`),
};

export const eventAPI = {
  getAllEvents: () => api.get('/events/'),
  
  createEvent: (data: {
    name: string;
    date: string;
    city: string;
    category?: string;
    is_active?: boolean;
  }) => api.post('/events/', data),
  
  updateEvent: (id: number, data: Partial<{
    name: string;
    date: string;
    city: string;
    category: string;
    is_active: boolean;
  }>) => api.put(`/events/${id}/`, data),
  
  deleteEvent: (id: number) => api.delete(`/events/${id}/`),
};

export const transportAPI = {
  getAllRoutes: () => api.get('/transport/api/routes/'),
  
  createRoute: (data: {
    origin: string;
    destination: string;
    mode: string;
    distance_km?: number;
    duration_minutes?: number;
    is_active?: boolean;
  }) => api.post('/transport/api/routes/', data),
  
  updateRoute: (id: number, data: Partial<{
    origin: string;
    destination: string;
    mode: string;
    distance_km: number;
    duration_minutes: number;
    is_active: boolean;
  }>) => api.put(`/transport/api/routes/${id}/`, data),
  
  deleteRoute: (id: number) => api.delete(`/transport/api/routes/${id}/`),
};

// Public analytics API (no auth required)
export const analyticsAPI = {
  getTopDestinations: () => api.get('/analytics/destinations/top/'),
  getRevenueStats: () => api.get('/analytics/revenue/'),
  getAttendanceStats: () => api.get('/analytics/attendance/'),
  getTransportStats: () => api.get('/transport/analytics/stats/'),
};

export default api;
