import db from './db.js';

// Generate unique booking code
function generateBookingCode() {
  const prefix = 'CMX';
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
  return `${prefix}-${year}-${random}`;
}

// Create a new booking
export function createBooking(userId, bookingData) {
  const {
    movieId,
    showtimeId,
    roomId,
    seats,
    totalPrice,
    paymentMethod,
    status = 'confirmed'
  } = bookingData;

  // Generate unique booking code
  let bookingCode = generateBookingCode();
  let attempts = 0;
  
  // Ensure booking code is unique
  while (attempts < 10) {
    const existing = db.prepare('SELECT id FROM bookings WHERE bookingCode = ?').get(bookingCode);
    if (!existing) break;
    bookingCode = generateBookingCode();
    attempts++;
  }

  // Store seats as JSON string
  const seatsJson = JSON.stringify(seats);

  const result = db.prepare(`
    INSERT INTO bookings (userId, movieId, showtimeId, roomId, seats, totalPrice, status, paymentMethod, bookingCode)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    userId,
    movieId,
    showtimeId,
    roomId,
    seatsJson,
    totalPrice,
    status,
    paymentMethod || null,
    bookingCode
  );

  return getBookingById(result.lastInsertRowid);
}

// Get booking by ID
export function getBookingById(bookingId) {
  const booking = db.prepare('SELECT * FROM bookings WHERE id = ?').get(bookingId);
  if (!booking) return null;

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

// Get all bookings for a user
export function getUserBookings(userId) {
  const bookings = db.prepare('SELECT * FROM bookings WHERE userId = ? ORDER BY createdAt DESC').all(userId);
  
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

// Update booking status
export function updateBookingStatus(bookingId, status) {
  db.prepare(`
    UPDATE bookings 
    SET status = ?, updatedAt = CURRENT_TIMESTAMP 
    WHERE id = ?
  `).run(status, bookingId);

  return getBookingById(bookingId);
}

// Cancel booking
export function cancelBooking(bookingId, userId) {
  const booking = getBookingById(bookingId);
  if (!booking || booking.userId !== userId) {
    throw new Error('Booking not found or unauthorized');
  }

  return updateBookingStatus(bookingId, 'cancelled');
}

