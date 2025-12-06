export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  synopsis: string;
  duration: number; // in minutes
  rating: number; // out of 10
  genre: string[];
  releaseDate: string;
  director: string;
  cast: string[];
  trailerUrl?: string;
  isNowShowing: boolean;
  isComingSoon: boolean;
  isFeatured?: boolean;
}

export type RoomType = 'basic' | '3d' | 'premium' | 'vip';

export interface ViewingRoom {
  id: string;
  name: string;
  type: RoomType;
  capacity: number;
  rows: number;
  seatsPerRow: number;
  priceMultiplier: number;
  amenities: string[];
  description: string;
}

export interface Showtime {
  id: string;
  movieId: string;
  roomId: string;
  startTime: string;
  endTime: string;
  date: string;
  price: number;
  availableSeats: number;
}

export type SeatStatus = 'available' | 'selected' | 'occupied' | 'reserved';

export interface Seat {
  id: string;
  row: string;
  number: number;
  status: SeatStatus;
  type: 'standard' | 'premium' | 'vip' | 'couple' | 'wheelchair';
  price: number;
}

export interface Booking {
  id: string;
  movieId: string;
  showtimeId: string;
  roomId: string;
  seats: Seat[];
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod?: PaymentMethod;
  bookingCode: string;
  qrCode?: string;
  createdAt: string;
  customerEmail?: string;
  customerPhone?: string;
}

export type PaymentMethod = 'gcash' | 'paypal' | 'bank_transfer' | 'paymaya';

export interface PaymentInfo {
  method: PaymentMethod;
  amount: number;
  transactionId?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface BookingState {
  selectedMovie: Movie | null;
  selectedRoom: ViewingRoom | null;
  selectedShowtime: Showtime | null;
  selectedSeats: Seat[];
  step: 'movie' | 'room' | 'showtime' | 'seats' | 'payment' | 'confirmation';
}
