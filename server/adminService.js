import db from './db.js';
import { getAllMovies, getMovieById } from './movieService.js';
import * as pricingService from './pricingService.js';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const MOVIES_JSON_PATH = join(__dirname, 'movies.json');

// Check if user is admin
export function isAdmin(userId) {
  const user = db.prepare('SELECT role FROM users WHERE id = ?').get(userId);
  return user && user.role === 'admin';
}

// Set user as admin
export function setUserAsAdmin(userId) {
  db.prepare('UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run('admin', userId);
  return getUserById(userId);
}

// Get all users (admin only)
export function getAllUsers() {
  const users = db.prepare(`
    SELECT id, email, firstName, lastName, phone, role, emailNotifications, smsNotifications, createdAt, updatedAt 
    FROM users 
    ORDER BY createdAt DESC
  `).all();
  return users;
}

// Get user by ID
export function getUserById(userId) {
  const user = db.prepare('SELECT id, email, firstName, lastName, phone, role, emailNotifications, smsNotifications, createdAt, updatedAt FROM users WHERE id = ?').get(userId);
  return user || null;
}

// Update user role
export function updateUserRole(userId, role) {
  if (!['user', 'admin'].includes(role)) {
    throw new Error('Invalid role. Must be "user" or "admin"');
  }
  db.prepare('UPDATE users SET role = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?').run(role, userId);
  return getUserById(userId);
}

// Delete user
export function deleteUser(userId) {
  const user = getUserById(userId);
  if (!user) {
    throw new Error('User not found');
  }
  db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  return { success: true, message: 'User deleted successfully' };
}

// Movie CRUD Operations

// Create movie
export function createMovie(movieData) {
  const movies = getAllMovies();
  
  // Check if movie with same ID exists
  if (movies.find(m => m.id === movieData.id)) {
    throw new Error('Movie with this ID already exists');
  }
  
  // Validate required fields
  if (!movieData.title || !movieData.id) {
    throw new Error('Title and ID are required');
  }
  
  const newMovie = {
    id: movieData.id.toString(),
    title: movieData.title,
    poster: movieData.poster || '',
    backdrop: movieData.backdrop || '',
    synopsis: movieData.synopsis || 'No synopsis available.',
    duration: movieData.duration || 120,
    rating: movieData.rating || 0,
    genre: movieData.genre || [],
    releaseDate: movieData.releaseDate || new Date().toISOString().split('T')[0],
    director: movieData.director || 'Unknown',
    cast: movieData.cast || [],
    isNowShowing: movieData.isNowShowing || false,
    isComingSoon: movieData.isComingSoon || false,
    isFeatured: movieData.isFeatured || false,
  };
  
  movies.push(newMovie);
  saveMoviesToJSON(movies);
  
  return newMovie;
}

// Update movie
export function updateMovie(movieId, movieData) {
  const movies = getAllMovies();
  const index = movies.findIndex(m => m.id === movieId.toString());
  
  if (index === -1) {
    throw new Error('Movie not found');
  }
  
  const updatedMovie = {
    ...movies[index],
    ...movieData,
    id: movieId.toString(), // Ensure ID doesn't change
  };
  
  movies[index] = updatedMovie;
  saveMoviesToJSON(movies);
  
  return updatedMovie;
}

// Delete movie
export function deleteMovie(movieId) {
  const movies = getAllMovies();
  const filteredMovies = movies.filter(m => m.id !== movieId.toString());
  
  if (filteredMovies.length === movies.length) {
    throw new Error('Movie not found');
  }
  
  saveMoviesToJSON(filteredMovies);
  
  return { success: true, message: 'Movie deleted successfully' };
}

// Get all bookings (admin only)
export function getAllBookings() {
  const bookings = db.prepare(`
    SELECT * FROM bookings 
    ORDER BY createdAt DESC
  `).all();
  
  return bookings.map(booking => ({
    id: booking.id.toString(),
    userId: booking.userId,
    movieId: booking.movieId,
    showtimeId: booking.showtimeId,
    roomId: booking.roomId,
    seats: JSON.parse(booking.seats),
    totalPrice: booking.totalPrice,
    status: booking.status,
    paymentMethod: booking.paymentMethod,
    bookingCode: booking.bookingCode,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  }));
}

// Update booking status (admin)
export function updateBookingStatusAdmin(bookingId, status) {
  if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
    throw new Error('Invalid status. Must be pending, confirmed, or cancelled');
  }
  
  db.prepare(`
    UPDATE bookings 
    SET status = ?, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(status, bookingId);
  
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  return {
    id: booking.id.toString(),
    userId: booking.userId,
    movieId: booking.movieId,
    showtimeId: booking.showtimeId,
    roomId: booking.roomId,
    seats: JSON.parse(booking.seats),
    totalPrice: booking.totalPrice,
    status: booking.status,
    paymentMethod: booking.paymentMethod,
    bookingCode: booking.bookingCode,
    createdAt: booking.createdAt,
    updatedAt: booking.updatedAt
  };
}

// Delete booking (admin)
export function deleteBooking(bookingId) {
  const booking = db.prepare('SELECT id FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) {
    throw new Error('Booking not found');
  }
  
  db.prepare('DELETE FROM bookings WHERE id = ?').run(bookingId);
  return { success: true, message: 'Booking deleted successfully' };
}

// Helper function to save movies to JSON
function saveMoviesToJSON(movies) {
  try {
    fs.writeFileSync(MOVIES_JSON_PATH, JSON.stringify(movies, null, 2), 'utf8');
  } catch (error) {
    console.error('Error saving movies to JSON:', error);
    throw new Error('Failed to save movies');
  }
}

// Pricing management
export function getPricingConfig() {
  return pricingService.getAllPricing();
}

export function updatePricingConfig(key, value) {
  return pricingService.updatePricing(key, value);
}

export function updateMultiplePricingConfig(pricingData) {
  return pricingService.updateMultiplePricing(pricingData);
}

// Get dashboard statistics
export function getDashboardStats() {
  const totalUsers = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  const totalAdmins = db.prepare('SELECT COUNT(*) as count FROM users WHERE role = ?').get('admin').count;
  const totalBookings = db.prepare('SELECT COUNT(*) as count FROM bookings').get().count;
  const confirmedBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('confirmed').count;
  const pendingBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('pending').count;
  const cancelledBookings = db.prepare('SELECT COUNT(*) as count FROM bookings WHERE status = ?').get('cancelled').count;
  const totalRevenue = db.prepare('SELECT SUM(totalPrice) as total FROM bookings WHERE status = ?').get('confirmed').total || 0;
  const movies = getAllMovies();
  const totalMovies = movies.length;
  const nowShowingMovies = movies.filter(m => m.isNowShowing).length;
  const comingSoonMovies = movies.filter(m => m.isComingSoon).length;
  
  return {
    users: {
      total: totalUsers,
      admins: totalAdmins,
      regular: totalUsers - totalAdmins
    },
    bookings: {
      total: totalBookings,
      confirmed: confirmedBookings,
      pending: pendingBookings,
      cancelled: cancelledBookings
    },
    revenue: {
      total: totalRevenue,
      currency: 'PHP'
    },
    movies: {
      total: totalMovies,
      nowShowing: nowShowingMovies,
      comingSoon: comingSoonMovies
    }
  };
}

