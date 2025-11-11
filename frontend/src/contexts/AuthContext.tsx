import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'vendor' | 'stay_owner';
  is_approved: boolean;
  is_active: boolean;
  first_name?: string;
  last_name?: string;
}

interface JWTPayload {
  user_id: number;
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
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<{ requiresApproval: boolean; message: string }>;
  refreshAccessToken: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  password2: string;
  role: 'vendor' | 'stay_owner';
  first_name?: string;
  last_name?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_BASE_URL = 'http://localhost:8000/api';

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tokens from localStorage on mount
  useEffect(() => {
    const storedAccessToken = localStorage.getItem('accessToken');
    const storedRefreshToken = localStorage.getItem('refreshToken');

    if (storedAccessToken && storedRefreshToken) {
      try {
        const decoded = jwtDecode<JWTPayload>(storedAccessToken);
        
        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
          // Token expired, try to refresh
          refreshAccessTokenInternal(storedRefreshToken);
        } else {
          // Token still valid
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser({
            id: decoded.user_id,
            username: decoded.username,
            email: decoded.email,
            role: decoded.role as 'admin' | 'vendor' | 'stay_owner',
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
  }, []);

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

      setUser({
        id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role as 'admin' | 'vendor' | 'stay_owner',
        is_approved: decoded.is_approved,
        is_active: true,
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearAuth();
    }
  };

  const login = async (username: string, password: string) => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Login failed');
      }

      const data = await response.json();
      const decoded = jwtDecode<JWTPayload>(data.access);

      // Store tokens
      localStorage.setItem('accessToken', data.access);
      localStorage.setItem('refreshToken', data.refresh);
      setAccessToken(data.access);
      setRefreshToken(data.refresh);

      // Set user from decoded token
      setUser({
        id: decoded.user_id,
        username: decoded.username,
        email: decoded.email,
        role: decoded.role as 'admin' | 'vendor' | 'stay_owner',
        is_approved: decoded.is_approved,
        is_active: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const logout = () => {
    clearAuth();
  };

  const register = async (data: RegisterData): Promise<{ requiresApproval: boolean; message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
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
      const requiresApproval = data.role === 'vendor' || data.role === 'stay_owner';
      
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
