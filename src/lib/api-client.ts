/**
 * API Client for Node.js Backend
 * Base URL: http://localhost:3000/api/v1
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

export interface ApiError {
  error?: string;
  message?: string;
  success?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
}

export interface RegisterResponse {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Article types
export interface Article {
  id: string;
  sku: string;
  name: string;
  id_category: string;
  id_supplier: string;
  id_stockroom: string;
  reorder_point?: number | null;
  lead_time?: number | null;
  description?: string | null;
  unit_price: number;
  unit_cost: number;
  stock: number;
  isActive: boolean;
  isDelete: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateArticleData {
  sku: string;
  name: string;
  id_category: string;
  id_supplier: string;
  id_stockroom: string;
  unit_price: number;
  unit_cost: number;
  stock?: number;
  reorder_point?: number;
  lead_time?: number;
  description?: string;
}

export interface UpdateArticleData {
  sku?: string;
  name?: string;
  id_category?: string;
  id_supplier?: string;
  id_stockroom?: string;
  unit_price?: number;
  unit_cost?: number;
  stock?: number;
  reorder_point?: number;
  lead_time?: number;
  description?: string;
  isActive?: boolean;
}

export interface ListArticlesParams {
  page?: number;
  perPage?: number;
  sku?: string;
  name?: string;
  priceGt?: number;
  priceLt?: number;
  priceMin?: number;
  priceMax?: number;
}

export interface PaginationMeta {
  total_results: number;
  total_pages: number;
  current_page: number;
  per_page: number;
}

export interface ListArticlesResponse {
  items: Article[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  code: number;
  success: boolean;
  message: string;
  data: T;
  error: object;
}

// Category types
export interface Category {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ListCategoriesParams {
  page?: number;
  perPage?: number;
  name?: string;
  isActive?: boolean;
}

export interface ListCategoriesResponse {
  items: Category[];
  meta: PaginationMeta;
}

// Supplier types
export interface Supplier {
  id: string;
  name: string;
  nit: string;
  address?: string | null;
  phone?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierData {
  name: string;
  nit: string;
  address?: string;
  phone?: string;
}

export interface ListSuppliersParams {
  page?: number;
  perPage?: number;
  name?: string;
  nit?: string;
  isActive?: boolean;
}

export interface ListSuppliersResponse {
  items: Supplier[];
  meta: PaginationMeta;
}

// Stockroom types
export interface Stockroom {
  id: string;
  name: string;
  address?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStockroomData {
  name: string;
  address?: string;
}

export interface ListStockroomsParams {
  page?: number;
  perPage?: number;
  name?: string;
  isActive?: boolean;
}

export interface ListStockroomsResponse {
  items: Stockroom[];
  meta: PaginationMeta;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    // Load token from localStorage on initialization
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('auth_token');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (token && typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    // Add auth token if available
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const config: RequestInit = {
      ...options,
      headers,
    };

    try {
      const response = await fetch(url, config);
      
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        this.setToken(null);
        // Dispatch custom event for auth context to handle
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('auth:unauthorized'));
        }
        throw new Error('Session expired. Please log in again.');
      }

      const data = await response.json();

      if (!response.ok) {
        const error: ApiError = data;
        throw new Error(error.error || error.message || 'An error occurred');
      }

      return data as T;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Network error occurred');
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await this.request<ApiResponse<LoginResponse>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    
    // Extract data from response
    const loginData = response.data;
    
    // Store token
    if (loginData.token) {
      this.setToken(loginData.token);
    }
    
    return loginData;
  }

  async register(data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    address?: string;
  }): Promise<RegisterResponse> {
    const response = await this.request<ApiResponse<{ user: RegisterResponse }>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data.user;
  }

  async updateUser(data: {
    name?: string;
    phone?: string;
    address?: string;
  }): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>('/auth/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    return response.data;
  }

  async deleteUser(): Promise<{ message: string }> {
    const response = await this.request<ApiResponse<{ message: string }>>('/auth/delete', {
      method: 'DELETE',
    });
    return response.data;
  }

  async getUserByEmail(email: string) {
    const response = await this.request<ApiResponse<{ user: RegisterResponse }>>(`/auth/find?email=${encodeURIComponent(email)}`, {
      method: 'GET',
    });
    return response.data.user;
  }

  // Health check
  async healthCheck(): Promise<{ status: string }> {
    const response = await this.request<ApiResponse<{ status: string }>>('/health', {
      method: 'GET',
    });
    return response.data;
  }

  // Generic request method for future endpoints
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Articles endpoints
  async createArticle(data: CreateArticleData): Promise<ApiResponse<Article>> {
    return this.post<ApiResponse<Article>>('/articles', data);
  }

  async listArticles(params?: ListArticlesParams): Promise<ApiResponse<ListArticlesResponse>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/articles${queryString ? `?${queryString}` : ''}`;
    return this.get<ApiResponse<ListArticlesResponse>>(endpoint);
  }

  async getArticleById(id: string): Promise<ApiResponse<Article>> {
    return this.get<ApiResponse<Article>>(`/articles/${id}`);
  }

  async updateArticle(id: string, data: UpdateArticleData): Promise<ApiResponse<Article>> {
    return this.put<ApiResponse<Article>>(`/articles/${id}`, data);
  }

  async deleteArticle(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.delete<ApiResponse<{ message: string }>>(`/articles/${id}`);
  }

  // Categories endpoints
  async createCategory(data: { name: string; description?: string; isActive?: boolean }): Promise<ApiResponse<Category>> {
    return this.post<ApiResponse<Category>>('/categories', data);
  }

  async listCategories(params?: ListCategoriesParams): Promise<ApiResponse<ListCategoriesResponse>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/categories${queryString ? `?${queryString}` : ''}`;
    return this.get<ApiResponse<ListCategoriesResponse>>(endpoint);
  }

  async getCategoryById(id: string): Promise<ApiResponse<Category>> {
    return this.get<ApiResponse<Category>>(`/categories/${id}`);
  }

  // Suppliers endpoints
  async createSupplier(data: CreateSupplierData): Promise<ApiResponse<Supplier>> {
    return this.post<ApiResponse<Supplier>>('/suppliers', data);
  }

  async listSuppliers(params?: ListSuppliersParams): Promise<ApiResponse<ListSuppliersResponse>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/suppliers${queryString ? `?${queryString}` : ''}`;
    return this.get<ApiResponse<ListSuppliersResponse>>(endpoint);
  }

  async getSupplierById(id: string): Promise<ApiResponse<Supplier>> {
    return this.get<ApiResponse<Supplier>>(`/suppliers/${id}`);
  }

  async updateSupplier(id: string, data: Partial<CreateSupplierData & { isActive?: boolean }>): Promise<ApiResponse<Supplier>> {
    return this.put<ApiResponse<Supplier>>(`/suppliers/${id}`, data);
  }

  // Stockrooms endpoints
  async createStockroom(data: CreateStockroomData): Promise<ApiResponse<Stockroom>> {
    return this.post<ApiResponse<Stockroom>>('/stockroom', data);
  }

  async listStockrooms(params?: ListStockroomsParams): Promise<ApiResponse<ListStockroomsResponse>> {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, String(value));
        }
      });
    }
    const queryString = queryParams.toString();
    const endpoint = `/stockroom${queryString ? `?${queryString}` : ''}`;
    return this.get<ApiResponse<ListStockroomsResponse>>(endpoint);
  }

  async getStockroomById(id: string): Promise<ApiResponse<Stockroom>> {
    return this.get<ApiResponse<Stockroom>>(`/stockroom/${id}`);
  }

  async updateStockroom(id: string, data: Partial<CreateStockroomData & { isActive?: boolean }>): Promise<ApiResponse<Stockroom>> {
    return this.put<ApiResponse<Stockroom>>(`/stockroom/${id}`, data);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

