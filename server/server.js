import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { 
  fetchAndStoreMovies, 
  getAllMovies, 
  getMoviesByFilter, 
  getMovieById 
} from './movieService.js';
import {
  registerUser,
  loginUser,
  getUserById,
  updateUser,
  verifyToken,
  isTokenBlacklisted,
  blacklistToken
} from './authService.js';
import {
  createBooking,
  getUserBookings,
  getBookingById,
  updateBookingStatus,
  cancelBooking
} from './bookingService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Auth middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access token required'
    });
  }

  // Check if token is blacklisted
  if (isTokenBlacklisted(token)) {
    return res.status(401).json({
      success: false,
      message: 'Token has been invalidated'
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }

  req.userId = decoded.userId;
  next();
};

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Auth endpoints
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await registerUser(email, password, firstName, lastName, phone);
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error registering user'
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const result = await loginUser(email, password);
    res.json({
      success: true,
      message: 'Login successful',
      user: result.user,
      token: result.token
    });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(401).json({
      success: false,
      message: error.message || 'Invalid credentials'
    });
  }
});

app.post('/api/auth/logout', authenticateToken, (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        // Calculate expiration date (7 days from now)
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);
        blacklistToken(token, expiresAt.toISOString());
      }
    }

    res.json({
      success: true,
      message: 'Logout successful'
    });
  } catch (error) {
    console.error('Error logging out:', error);
    res.status(500).json({
      success: false,
      message: 'Error logging out'
    });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  try {
    const user = getUserById(req.userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Error getting user:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting user'
    });
  }
});

app.put('/api/auth/profile', authenticateToken, (req, res) => {
  try {
    const updates = req.body;
    const updatedUser = updateUser(req.userId, updates);
    
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error updating profile'
    });
  }
});

// Booking endpoints
app.post('/api/bookings', authenticateToken, (req, res) => {
  try {
    const {
      movieId,
      showtimeId,
      roomId,
      seats,
      totalPrice,
      paymentMethod,
      status
    } = req.body;

    if (!movieId || !showtimeId || !roomId || !seats || !Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Missing required booking information'
      });
    }

    if (!totalPrice || totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid total price'
      });
    }

    const booking = createBooking(req.userId, {
      movieId,
      showtimeId,
      roomId,
      seats,
      totalPrice,
      paymentMethod,
      status: status || 'confirmed'
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error creating booking'
    });
  }
});

app.get('/api/bookings', authenticateToken, (req, res) => {
  try {
    const bookings = getUserBookings(req.userId);
    res.json({
      success: true,
      bookings
    });
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookings'
    });
  }
});

app.get('/api/bookings/:id', authenticateToken, (req, res) => {
  try {
    const booking = getBookingById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found'
      });
    }

    // Check if booking belongs to user
    if (booking.userId !== req.userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized access to this booking'
      });
    }

    res.json({
      success: true,
      booking
    });
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching booking'
    });
  }
});

app.put('/api/bookings/:id/cancel', authenticateToken, (req, res) => {
  try {
    const booking = cancelBooking(req.params.id, req.userId);
    res.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(400).json({
      success: false,
      message: error.message || 'Error cancelling booking'
    });
  }
});

// Fetch and store movies from TMDB API to JSON file
app.post('/api/movies/fetch', async (req, res) => {
  try {
    const { append } = req.query;
    const shouldAppend = append === 'true' || append === '1';
    console.log(`Fetch request received (append: ${shouldAppend})`);
    const results = await fetchAndStoreMovies(shouldAppend);
    res.json({
      success: true,
      message: shouldAppend 
        ? 'Movies fetched and appended to JSON file successfully' 
        : 'Movies fetched and stored in JSON file successfully',
      results
    });
  } catch (error) {
    console.error('Error fetching movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching movies',
      error: error.message
    });
  }
});

// Get all movies from JSON file
app.get('/api/movies', (req, res) => {
  try {
    const movies = getAllMovies();
    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    console.error('Error getting movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting movies',
      error: error.message
    });
  }
});

// Get movies by filter
app.get('/api/movies/filter', (req, res) => {
  try {
    const { isNowShowing, isComingSoon, isFeatured } = req.query;
    const filter = {};
    
    if (isNowShowing !== undefined) filter.isNowShowing = isNowShowing === 'true';
    if (isComingSoon !== undefined) filter.isComingSoon = isComingSoon === 'true';
    if (isFeatured !== undefined) filter.isFeatured = isFeatured === 'true';

    const movies = getMoviesByFilter(filter);
    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    console.error('Error filtering movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error filtering movies',
      error: error.message
    });
  }
});

// Get popular movies (highly rated)
app.get('/api/movies/popular', (req, res) => {
  try {
    const movies = getAllMovies()
      .filter(m => m.rating >= 8.0)
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 10);
    
    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    console.error('Error getting popular movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting popular movies',
      error: error.message
    });
  }
});

// Get now showing movies
app.get('/api/movies/now-showing', (req, res) => {
  try {
    const movies = getMoviesByFilter({ isNowShowing: true });
    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    console.error('Error getting now showing movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting now showing movies',
      error: error.message
    });
  }
});

// Get coming soon movies
app.get('/api/movies/coming-soon', (req, res) => {
  try {
    const movies = getMoviesByFilter({ isComingSoon: true });
    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    console.error('Error getting coming soon movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting coming soon movies',
      error: error.message
    });
  }
});

// Get featured movies
app.get('/api/movies/featured', (req, res) => {
  try {
    const movies = getMoviesByFilter({ isFeatured: true });
    res.json({
      success: true,
      count: movies.length,
      movies
    });
  } catch (error) {
    console.error('Error getting featured movies:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting featured movies',
      error: error.message
    });
  }
});

// Get movie by ID
app.get('/api/movies/:id', (req, res) => {
  try {
    const movie = getMovieById(req.params.id);
    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found'
      });
    }
    res.json({
      success: true,
      movie
    });
  } catch (error) {
    console.error('Error getting movie:', error);
    res.status(500).json({
      success: false,
      message: 'Error getting movie',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API endpoints available at http://localhost:${PORT}/api`);
  console.log(`📁 Movies will be stored in: server/movies.json`);
});
