const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailNotifications: number;
  smsNotifications: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
  emailNotifications?: boolean;
  smsNotifications?: boolean;
}

class AuthService {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private setToken(token: string): void {
    localStorage.setItem('auth_token', token);
  }

  private removeToken(): void {
    localStorage.removeItem('auth_token');
  }

  private getAuthHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: AuthResponse = await response.json();

    if (result.success && result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    const result: AuthResponse = await response.json();

    if (result.success && result.token) {
      this.setToken(result.token);
    }

    return result;
  }

  async logout(): Promise<void> {
    const token = this.getToken();
    if (token) {
      try {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          headers: this.getAuthHeaders(),
        });
      } catch (error) {
        console.error('Error logging out:', error);
      }
    }
    this.removeToken();
  }

  async getCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) {
      return null;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeToken();
        }
        return null;
      }

      const result = await response.json();
      return result.success ? result.user : null;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    const response = await fetch(`${API_BASE_URL}/auth/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return response.json();
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

export const authService = new AuthService();

