import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiClient, LoginResponse } from "@/lib/api-client";

interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  logout: () => void;
  updateUser: (data: {
    name?: string;
    phone?: string;
    address?: string;
  }) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem('auth_token');
  }, []);

  useEffect(() => {
    // Check if user is already authenticated
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      apiClient.setToken(storedToken);
      setToken(storedToken);
      // Try to get user info from token (you might want to add a /auth/me endpoint)
      // For now, we'll just set the token and let the app handle it
    }
    setLoading(false);

    // Listen for unauthorized events (token expired)
    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => {
      window.removeEventListener('auth:unauthorized', handleUnauthorized);
    };
  }, [logout]);

  const login = async (email: string, password: string) => {
    try {
      const response: LoginResponse = await apiClient.login(email, password);
      setUser(response.user);
      setToken(response.token);
      apiClient.setToken(response.token);
    } catch (error) {
      throw error;
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      await apiClient.register(data);
      // After registration, automatically log in
      await login(data.email, data.password);
    } catch (error) {
      throw error;
    }
  };

  const updateUser = async (data: {
    name?: string;
    phone?: string;
    address?: string;
  }) => {
    try {
      await apiClient.updateUser(data);
      // Update local user state if name was updated
      if (data.name && user) {
        setUser({ ...user, name: data.name });
      }
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        updateUser,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

