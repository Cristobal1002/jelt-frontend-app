import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { apiClient, LoginResponse, SessionUserPayload } from "@/lib/api-client";

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

function sessionPayloadToUser(u: SessionUserPayload): User {
  return {
    id: String(u.id),
    name: (u.name ?? "").trim(),
    email: u.email,
    phone: u.phone,
    address: u.address,
    isActive: u.isActive ?? true,
    createdAt: u.createdAt ?? "",
    updatedAt: u.updatedAt ?? "",
  };
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

function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    apiClient.setToken(null);
    localStorage.removeItem("auth_token");
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function bootstrapSession() {
      const storedToken = localStorage.getItem("auth_token");
      if (!storedToken) {
        if (!cancelled) setLoading(false);
        return;
      }

      apiClient.setToken(storedToken);
      if (!cancelled) setToken(storedToken);

      try {
        const { user: raw } = await apiClient.validateToken();
        if (cancelled) return;
        setUser(sessionPayloadToUser(raw));
      } catch {
        if (!cancelled) {
          logout();
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    bootstrapSession();

    const handleUnauthorized = () => {
      logout();
    };

    window.addEventListener("auth:unauthorized", handleUnauthorized);
    return () => {
      cancelled = true;
      window.removeEventListener("auth:unauthorized", handleUnauthorized);
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

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export { AuthProvider, useAuth };
