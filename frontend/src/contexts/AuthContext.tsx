import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'vendor' | 'stay_owner' | 'place_owner' | 'place_owner';
  is_approved: boolean;
  is_active: boolean;
  first_name?: string;
  last_name?: string;
}

interface JWTPayload {
  user_id: number | string; // Backend might send string
  username: string;
  email: string;
  role: string;
  is_approved: boolean;
  exp: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<User>; // Return User
  logout: () => void;
  register: (data: RegisterData | FormData) => Promise<{ requiresApproval: boolean; message: string }>;
  refreshAccessToken: () => Promise<void>;
  apiCall: (endpoint: string, options?: RequestInit) => Promise<any>; // New helper
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  role: 'vendor' | 'stay_owner' | 'place_owner';
  first_name?: string;
  last_name?: string;
}

interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
    is_approved: boolean;
    is_active: boolean;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Use same API URL logic as api.ts service
const API_BASE_URL = import.meta.env.DEV 
  ? '/api'  // Vite proxy will forward to localhost:8000
  : 'https://tourism-analytics-backend.onrender.com/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const clearAuth = () => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  };

  const refreshAccessTokenInternal = async (refresh: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (!response.ok) {
        throw new Error('Failed to refresh token');
      }

      const data = await response.json();
      const decoded = jwtDecode<JWTPayload>(data.access);

      setAccessToken(data.access);
      localStorage.setItem('accessToken', data.access);
      
      // Update refresh token if provided
      if (data.refresh) {
        setRefreshToken(data.refresh);
        localStorage.setItem('refreshToken', data.refresh);
      }

      setUser({
        id: typeof decoded.user_id === 'string' ? parseInt(decoded.user_id) : decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role as 'admin' | 'vendor' | 'stay_owner' | 'place_owner',
        is_approved: decoded.is_approved,
        is_active: true,
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
      throw error;
    }
  };

  // Load tokens from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedAccessToken = localStorage.getItem('accessToken');
      const storedRefreshToken = localStorage.getItem('refreshToken');

      if (storedAccessToken && storedRefreshToken) {
        try {
          const decoded = jwtDecode<JWTPayload>(storedAccessToken);
          
          // Check if token is expired
          if (decoded.exp * 1000 < Date.now()) {
            // Token expired, try to refresh
            await refreshAccessTokenInternal(storedRefreshToken);
          } else {
            // Token still valid
            setAccessToken(storedAccessToken);
            setRefreshToken(storedRefreshToken);
            setUser({
              id: typeof decoded.user_id === 'string' ? parseInt(decoded.user_id) : decoded.user_id,
              username: decoded.username,
              email: decoded.email,
              role: decoded.role as 'admin' | 'vendor' | 'stay_owner' | 'place_owner',
              is_approved: decoded.is_approved,
              is_active: true,
            });
          }
        } catch (error) {
          console.error('Invalid token:', error);
          clearAuth();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []); // Empty dependency array is correct here

  const login = async (username: string, password: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.error || JSON.stringify(error) || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      // Store tokens
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      setAccessToken(data.access);
      setRefreshToken(data.refresh);

      let loggedInUser: User;

      // If backend sends user data directly, use it
      if (data.user) {
        loggedInUser = {
          id: data.user.id,
          username: data.user.username,
          email: data.user.email,
          role: data.user.role as 'admin' | 'vendor' | 'stay_owner' | 'place_owner',
          is_approved: data.user.is_approved,
          is_active: data.user.is_active,
        };
      } else {
        // Otherwise try to decode from token
        const decoded = jwtDecode<any>(data.access);
        
        loggedInUser = {
          id: typeof decoded.user_id === 'string' ? parseInt(decoded.user_id) : decoded.user_id,
          username: decoded.username || username,
          email: decoded.email || '',
          role: (decoded.role || 'admin') as 'admin' | 'vendor' | 'stay_owner' | 'place_owner',
          is_approved: decoded.is_approved !== false,
          is_active: true,
        };
      }

      setUser(loggedInUser);
      return loggedInUser; // Return the user object
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
  };

  const register = async (data: RegisterData | FormData): Promise<{ requiresApproval: boolean; message: string }> => {
    try {
      // Determine if we're sending FormData or JSON
      const isFormData = data instanceof FormData;
      
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: isFormData ? {} : { 'Content-Type': 'application/json' },
        body: isFormData ? data : JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        // Extract error messages
        const errors = Object.entries(result)
          .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
          .join('; ');
        throw new Error(errors || 'Registration failed');
      }

      // Check if user needs approval (vendor or stay_owner)
      const role = isFormData ? data.get('role') as string : (data as RegisterData).role;
      const requiresApproval = role === 'vendor' || role === 'stay_owner';
      
      return {
        requiresApproval,
        message: result.message || 'Registration successful',
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const refreshAccessToken = async () => {
    if (refreshToken) {
      await refreshAccessTokenInternal(refreshToken);
    }
  };

  // Helper function for making authenticated API calls
  const apiCall = async (endpoint: string, options: RequestInit = {}, isRetry = false) => {
    // Get the latest token from localStorage (in case state hasn't updated yet)
    const currentToken = localStorage.getItem('accessToken') || accessToken;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(currentToken && { 'Authorization': `Bearer ${currentToken}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401 && !isRetry) {
      // Token expired, try to refresh (only once)
      const currentRefreshToken = localStorage.getItem('refreshToken') || refreshToken;
      if (currentRefreshToken) {
        try {
          await refreshAccessTokenInternal(currentRefreshToken);
          // Retry the request with new token (mark as retry to prevent infinite loop)
          return apiCall(endpoint, options, true);
        } catch (refreshError) {
          console.error('Token refresh failed during apiCall:', refreshError);
          throw new Error('Session expired. Please log in again.');
        }
      }
      throw new Error('Authentication required');
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || error.message || 'Request failed');
    }

    return response.json();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        refreshToken,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        register,
        refreshAccessToken,
        apiCall,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
