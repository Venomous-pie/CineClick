const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Booking {
  id: string;
  movieId: string;
  showtimeId: string;
  roomId: string;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    status: string;
    type: string;
    price: number;
  }>;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod?: string;
  bookingCode: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateBookingData {
  movieId: string;
  showtimeId: string;
  roomId: string;
  seats: Array<{
    id: string;
    row: string;
    number: number;
    status: string;
    type: string;
    price: number;
  }>;
  totalPrice: number;
  paymentMethod?: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
}

export interface BookingResponse {
  success: boolean;
  message?: string;
  booking?: Booking;
  bookings?: Booking[];
}

class BookingService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  async createBooking(data: CreateBookingData): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });

    return response.json();
  }

  async getUserBookings(): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  async getBookingById(bookingId: string): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }

  async cancelBooking(bookingId: string): Promise<BookingResponse> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/cancel`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
    });

    return response.json();
  }
}

export const bookingService = new BookingService();

