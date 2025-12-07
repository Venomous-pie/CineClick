const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface DashboardStats {
  users: {
    total: number;
    admins: number;
    regular: number;
  };
  bookings: {
    total: number;
    confirmed: number;
    pending: number;
    cancelled: number;
  };
  revenue: {
    total: number;
    currency: string;
  };
  movies: {
    total: number;
    nowShowing: number;
    comingSoon: number;
  };
}

export interface AdminUser {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string;
  emailNotifications: number;
  smsNotifications: number;
  createdAt: string;
  updatedAt?: string;
}

export interface AdminBooking {
  id: string;
  userId: number;
  movieId: string;
  showtimeId: string;
  roomId: string;
  seats: any[];
  totalPrice: number;
  status: string;
  paymentMethod?: string;
  bookingCode: string;
  createdAt: string;
  updatedAt?: string;
}

class AdminService {
  private getToken(): string | null {
    return localStorage.getItem('auth_token');
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

  // Dashboard
  async getStats(): Promise<{ success: boolean; stats?: DashboardStats; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/stats`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch stats');
    }

    return response.json();
  }

  // User Management
  async getUsers(): Promise<{ success: boolean; users?: AdminUser[]; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch users');
    }

    return response.json();
  }

  async getUser(id: number): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch user');
    }

    return response.json();
  }

  async updateUserRole(id: number, role: 'user' | 'admin'): Promise<{ success: boolean; user?: AdminUser; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}/role`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ role }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update user role');
    }

    return response.json();
  }

  async deleteUser(id: number): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/users/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete user');
    }

    return response.json();
  }

  // Movie Management
  async createMovie(movieData: any): Promise<{ success: boolean; movie?: any; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/movies`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(movieData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create movie');
    }

    return response.json();
  }

  async updateMovie(id: string, movieData: any): Promise<{ success: boolean; movie?: any; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(movieData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update movie');
    }

    return response.json();
  }

  async deleteMovie(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/movies/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete movie');
    }

    return response.json();
  }

  // Booking Management
  async getBookings(): Promise<{ success: boolean; bookings?: AdminBooking[]; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch bookings');
    }

    return response.json();
  }

  async updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Promise<{ success: boolean; booking?: AdminBooking; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}/status`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update booking status');
    }

    return response.json();
  }

  async deleteBooking(id: string): Promise<{ success: boolean; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/bookings/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete booking');
    }

    return response.json();
  }

  // Pricing Management
  async getPricing(): Promise<{ success: boolean; pricing?: any; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/pricing`, {
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch pricing');
    }

    return response.json();
  }

  async updatePricing(pricingData: Record<string, number>): Promise<{ success: boolean; results?: any; errors?: string[]; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/pricing`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ pricing: pricingData }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update pricing');
    }

    return response.json();
  }

  async updateSinglePricing(key: string, value: number): Promise<{ success: boolean; key?: string; value?: number; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/admin/pricing/${key}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ value }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update pricing');
    }

    return response.json();
  }
}

export const adminService = new AdminService();

