import { Movie, ViewingRoom, Showtime } from "@/types/cinema";
import { apiService } from "@/services/api";

// Fallback movies data (used if API is unavailable)
export const fallbackMovies: Movie[] = [
  {
    id: "1",
    title: "Dune: Part Two",
    poster: "https://image.tmdb.org/t/p/w500/8b8R8l88Qje9dn9OE8PY05Nxl1X.jpg",
    backdrop: "https://image.tmdb.org/t/p/original/xOMo8BRK7PfcJv9JCnx7s5hj0PX.jpg",
    synopsis: "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family.",
    duration: 166,
    rating: 8.8,
    genre: ["Sci-Fi", "Adventure", "Drama"],
    releaseDate: "2024-03-01",
    director: "Denis Villeneuve",
    cast: ["Timothée Chalamet", "Zendaya", "Rebecca Ferguson", "Josh Brolin"],
    isNowShowing: true,
    isComingSoon: false,
    isFeatured: true,
  },
];

// Cache for API movies
let cachedMovies: Movie[] | null = null;
let lastFetchTime: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Fetch movies from API
async function fetchMoviesFromAPI(): Promise<Movie[]> {
  try {
    const response = await apiService.getAllMovies();
    if (response.success && response.movies && response.movies.length > 0) {
      cachedMovies = response.movies;
      lastFetchTime = Date.now();
      console.log(`Successfully fetched ${response.movies.length} movies from API`);
      return response.movies;
    }
    console.warn('API returned no movies, using fallback');
    return cachedMovies || fallbackMovies;
  } catch (error) {
    console.error('Error fetching movies from API:', error);
    // Return cached data if available, otherwise fallback
    if (cachedMovies && cachedMovies.length > 0) {
      console.log('Using cached movies');
      return cachedMovies;
    }
    console.log('Using fallback movies');
    return fallbackMovies;
  }
}

// Get movies (with caching)
export async function getMovies(): Promise<Movie[]> {
  const now = Date.now();
  if (cachedMovies && (now - lastFetchTime) < CACHE_DURATION) {
    return cachedMovies;
  }
  return fetchMoviesFromAPI();
}

// Export movies as a promise that resolves to the current movies
export const movies: Movie[] = fallbackMovies;

// Helper functions that work with API or fallback
export async function getPopularMovies(): Promise<Movie[]> {
  try {
    const response = await apiService.getPopularMovies();
    if (response.success && response.movies && response.movies.length > 0) {
      return response.movies;
    }
  } catch (error) {
    console.error('Error fetching popular movies:', error);
  }
  const allMovies = await getMovies();
  const popular = allMovies.filter(m => m.isNowShowing && m.rating >= 8);
  // If no popular movies, return movies with rating >= 7 or first 6 movies
  if (popular.length === 0 && allMovies.length > 0) {
    const fallback = allMovies.filter(m => m.rating >= 7);
    return fallback.length > 0 ? fallback : allMovies.slice(0, 6);
  }
  return popular;
}

export async function getNewReleases(): Promise<Movie[]> {
  try {
    const response = await apiService.getNowShowingMovies();
    if (response.success && response.movies && response.movies.length > 0) {
      return response.movies.slice(0, 6);
    }
  } catch (error) {
    console.error('Error fetching new releases:', error);
  }
  const allMovies = await getMovies();
  const nowShowing = allMovies.filter(m => m.isNowShowing);
  // If no now showing, return first 6 movies
  if (nowShowing.length === 0 && allMovies.length > 0) {
    return allMovies.slice(0, 6);
  }
  return nowShowing.slice(0, 6);
}

export async function getComingSoon(): Promise<Movie[]> {
  try {
    const response = await apiService.getComingSoonMovies();
    if (response.success && response.movies && response.movies.length > 0) {
      return response.movies;
    }
  } catch (error) {
    console.error('Error fetching coming soon movies:', error);
  }
  const allMovies = await getMovies();
  const comingSoon = allMovies.filter(m => m.isComingSoon);
  // If no coming soon, return empty array or last few movies
  return comingSoon;
}

export async function getFeaturedMovies(): Promise<Movie[]> {
  try {
    const response = await apiService.getFeaturedMovies();
    if (response.success && response.movies && response.movies.length > 0) {
      return response.movies;
    }
  } catch (error) {
    console.error('Error fetching featured movies:', error);
  }
  const allMovies = await getMovies();
  const featured = allMovies.filter(m => m.isFeatured);
  // If no featured movies, return first 3 movies as featured
  if (featured.length === 0 && allMovies.length > 0) {
    return allMovies.slice(0, 3);
  }
  return featured;
}

// Viewing rooms (unchanged)
export const viewingRooms: ViewingRoom[] = [
  {
    id: "room-1",
    name: "Cinema Hall 1",
    type: "basic",
    capacity: 120,
    rows: 10,
    seatsPerRow: 12,
    priceMultiplier: 1,
    amenities: ["Standard Screen", "Dolby Surround", "Air Conditioned"],
    description: "Our classic cinema experience with crystal-clear visuals and immersive sound.",
  },
  {
    id: "room-2",
    name: "3D Experience",
    type: "3d",
    capacity: 80,
    rows: 8,
    seatsPerRow: 10,
    priceMultiplier: 1.3,
    amenities: ["3D Glasses Included", "RealD 3D", "Dolby Atmos", "Reclining Seats"],
    description: "Step into the action with our state-of-the-art 3D technology and enhanced audio.",
  },
  {
    id: "room-3",
    name: "ULTRAMAX Premium",
    type: "premium",
    capacity: 60,
    rows: 6,
    seatsPerRow: 10,
    priceMultiplier: 1.8,
    amenities: ["Giant Screen", "Dolby Atmos", "Laser Projection", "Premium Recliners", "Extra Legroom"],
    description: "The ultimate viewing experience with our largest screen and premium comfort.",
  },
  {
    id: "room-4",
    name: "VIP Lounge",
    type: "vip",
    capacity: 24,
    rows: 4,
    seatsPerRow: 6,
    priceMultiplier: 2.5,
    amenities: ["Private Lounge", "In-Seat Service", "Complimentary Snacks", "Blankets", "Butler Service", "Exclusive Bar Access"],
    description: "Indulge in luxury with our exclusive VIP experience featuring personalized service.",
  },
];

export const generateShowtimes = (movieId: string, roomId: string, date: string): Showtime[] => {
  const room = viewingRooms.find(r => r.id === roomId);
  const basePrice = 250; // Base price in PHP
  const times = ["10:00", "13:00", "16:00", "19:00", "22:00"];
  
  return times.map((time, index) => ({
    id: `${movieId}-${roomId}-${date}-${index}`,
    movieId,
    roomId,
    startTime: time,
    endTime: calculateEndTime(time, 150), // Average 2.5 hours
    date,
    price: Math.round(basePrice * (room?.priceMultiplier || 1)),
    availableSeats: Math.floor(Math.random() * 50) + 20,
  }));
};

const calculateEndTime = (startTime: string, durationMinutes: number): string => {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + durationMinutes;
  const endHours = Math.floor(totalMinutes / 60) % 24;
  const endMinutes = totalMinutes % 60;
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
};
