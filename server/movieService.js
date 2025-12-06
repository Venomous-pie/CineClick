import axios from 'axios';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// TMDB API Configuration
const TMDB_API_KEY = process.env.TMDB_API_KEY || '63bd6441ae487a623b3ee66ce47679cb';
const TMDB_ACCESS_TOKEN = process.env.TMDB_ACCESS_TOKEN || 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2M2JkNjQ0MWFlNDg3YTYyM2IzZWU2NmNlNDc2NzljYiIsIm5iZiI6MTc2NTA2MDQ1Mi45MjksInN1YiI6IjY5MzRhZjY0NTc1Njg0NmNlOGI3MTFkNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PbLrc2t9bhYUphHZOfA7geI1fhktmu0mv_CBZsGo-e4';
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';
const MOVIES_JSON_PATH = join(__dirname, 'movies.json');

// TMDB Image Sizes:
// Posters: w92, w154, w185, w342, w500, w780, original
// Backdrops: w300, w780, w1280, original
// We use w500 for posters (good balance) and w1280 for backdrops (high quality)

// TMDB API headers
const getTMDBHeaders = () => ({
  'Authorization': `Bearer ${TMDB_ACCESS_TOKEN}`,
  'Accept': 'application/json'
});

// Convert TMDB movie to our format
function convertTMDBMovie(tmdbMovie, details = null) {
  const movie = details || tmdbMovie;
  const releaseDate = movie.release_date || movie.first_air_date;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let release = null;
  if (releaseDate) {
    release = new Date(releaseDate);
  }

  // Determine if movie is now showing (released in last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const isNowShowing = release && release <= today && release >= sixMonthsAgo;

  // Determine if movie is coming soon (release date in future)
  const isComingSoon = release && release > today;

  // Featured movies are high-rated or popular
  const isFeatured = (movie.vote_average >= 7.5) || (movie.popularity > 50);

  // Build image URLs with proper sizes
  // Use w500 for posters (good balance of quality and size)
  // Use w1280 for backdrops (high quality for hero sections)
  const posterUrl = movie.poster_path 
    ? `${TMDB_IMAGE_BASE_URL}/w500${movie.poster_path}`
    : null;
  
  const backdropUrl = movie.backdrop_path
    ? `${TMDB_IMAGE_BASE_URL}/w1280${movie.backdrop_path}`
    : null;

  return {
    id: movie.id.toString(),
    title: movie.title || movie.name,
    poster: posterUrl,
    backdrop: backdropUrl,
    synopsis: movie.overview || 'No synopsis available.',
    duration: movie.runtime || 120, // Default 2 hours if not available
    rating: movie.vote_average ? parseFloat(movie.vote_average.toFixed(1)) : 0,
    genre: movie.genres && Array.isArray(movie.genres)
      ? movie.genres.map(g => g.name)
      : (movie.genre_ids ? [] : ['Drama']), // Will be populated from details
    releaseDate: releaseDate || new Date().toISOString().split('T')[0],
    director: movie.director || 'Unknown',
    cast: movie.cast && Array.isArray(movie.cast)
      ? movie.cast.slice(0, 4).map(actor => actor.name || actor)
      : ['Unknown'],
    imdbId: movie.imdb_id || null,
    year: releaseDate ? releaseDate.split('-')[0] : null,
    runtime: movie.runtime ? `${movie.runtime} min` : null,
    isNowShowing: isNowShowing,
    isComingSoon: isComingSoon,
    isFeatured: isFeatured
  };
}

// Fetch movie images from TMDB using the images endpoint
// Reference: https://developer.themoviedb.org/reference/movie-images
async function fetchMovieImages(movieId) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/${movieId}/images`,
      {
        headers: getTMDBHeaders(),
        params: {
          api_key: TMDB_API_KEY,
          include_image_language: 'en,null' // Include English and language-neutral images
        }
      }
    );

    const images = response.data;
    
    // Get best poster (highest vote_average, or first one if no votes)
    const bestPoster = images.posters && images.posters.length > 0
      ? images.posters.sort((a, b) => {
          // Sort by vote_average first, then by vote_count
          const voteDiff = (b.vote_average || 0) - (a.vote_average || 0);
          if (voteDiff !== 0) return voteDiff;
          return (b.vote_count || 0) - (a.vote_count || 0);
        })[0]
      : null;

    // Get best backdrop (highest vote_average, or first one if no votes)
    const bestBackdrop = images.backdrops && images.backdrops.length > 0
      ? images.backdrops.sort((a, b) => {
          // Sort by vote_average first, then by vote_count
          const voteDiff = (b.vote_average || 0) - (a.vote_average || 0);
          if (voteDiff !== 0) return voteDiff;
          return (b.vote_count || 0) - (a.vote_count || 0);
        })[0]
      : null;

    return {
      poster: bestPoster?.file_path || null,
      backdrop: bestBackdrop?.file_path || null
    };
  } catch (error) {
    // If images endpoint fails, return null to use default images from movie details
    console.warn(`Could not fetch images for movie ID ${movieId}, using defaults:`, error.message);
    return { poster: null, backdrop: null };
  }
}

// Fetch movie details from TMDB
// Uses both the movie details endpoint and images endpoint for best quality images
async function fetchMovieDetails(movieId) {
  try {
    // Fetch movie details and images in parallel
    const [movieResponse, imagesData] = await Promise.all([
      axios.get(
        `${TMDB_BASE_URL}/movie/${movieId}`,
        {
          headers: getTMDBHeaders(),
          params: {
            api_key: TMDB_API_KEY,
            append_to_response: 'credits'
          }
        }
      ),
      fetchMovieImages(movieId) // Fetch best quality images
    ]);

    const movie = movieResponse.data;
    const director = movie.credits?.crew?.find(person => person.job === 'Director');
    const cast = movie.credits?.cast 
      ? movie.credits.cast.slice(0, 4).map(actor => actor.name)
      : [];

    return {
      ...movie,
      director: director?.name || 'Unknown',
      cast: cast.length > 0 ? cast : ['Unknown'],
      // Use best images from images endpoint, fallback to default poster/backdrop
      poster_path: imagesData.poster || movie.poster_path,
      backdrop_path: imagesData.backdrop || movie.backdrop_path
    };
  } catch (error) {
    console.error(`Error fetching movie details for ID ${movieId}:`, error.message);
    return null;
  }
}

// Fetch popular movies from TMDB
async function fetchPopularMovies(page = 1) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/popular`,
      {
        headers: getTMDBHeaders(),
        params: {
          api_key: TMDB_API_KEY,
          page: page,
          language: 'en-US'
        }
      }
    );
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching popular movies:', error.message);
    return [];
  }
}

// Fetch now playing movies from TMDB
async function fetchNowPlayingMovies(page = 1) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/now_playing`,
      {
        headers: getTMDBHeaders(),
        params: {
          api_key: TMDB_API_KEY,
          page: page,
          language: 'en-US'
        }
      }
    );
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching now playing movies:', error.message);
    return [];
  }
}

// Fetch upcoming movies from TMDB
async function fetchUpcomingMovies(page = 1) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/upcoming`,
      {
        headers: getTMDBHeaders(),
        params: {
          api_key: TMDB_API_KEY,
          page: page,
          language: 'en-US'
        }
      }
    );
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching upcoming movies:', error.message);
    return [];
  }
}

// Fetch top rated movies from TMDB
async function fetchTopRatedMovies(page = 1) {
  try {
    const response = await axios.get(
      `${TMDB_BASE_URL}/movie/top_rated`,
      {
        headers: getTMDBHeaders(),
        params: {
          api_key: TMDB_API_KEY,
          page: page,
          language: 'en-US'
        }
      }
    );
    return response.data.results || [];
  } catch (error) {
    console.error('Error fetching top rated movies:', error.message);
    return [];
  }
}

// Fetch and store movies from TMDB API
export async function fetchAndStoreMovies(append = false) {
  console.log('Starting to fetch movies from TMDB API...');
  const results = {
    success: 0,
    failed: 0,
    movies: []
  };

  // Get existing movies if appending
  let existingMovies = [];
  const existingIds = new Set();
  
  if (append && fs.existsSync(MOVIES_JSON_PATH)) {
    try {
      existingMovies = readMoviesFromJSON();
      existingMovies.forEach(m => existingIds.add(m.id));
      console.log(`Found ${existingMovies.length} existing movies. Will add new ones...`);
    } catch (error) {
      console.error('Error reading existing movies:', error.message);
    }
  }

  try {
    // Fetch from multiple endpoints to get variety
    const [popular, nowPlaying, upcoming, topRated] = await Promise.all([
      fetchPopularMovies(1),
      fetchNowPlayingMovies(1),
      fetchUpcomingMovies(1),
      fetchTopRatedMovies(1)
    ]);

    // Combine all movies and remove duplicates
    const allTMDBMovies = [];
    const seenIds = new Set();

    [...popular, ...nowPlaying, ...upcoming, ...topRated].forEach(movie => {
      if (!seenIds.has(movie.id)) {
        seenIds.add(movie.id);
        allTMDBMovies.push(movie);
      }
    });

    console.log(`Fetched ${allTMDBMovies.length} unique movies from TMDB`);

    // Fetch details for each movie (with rate limiting)
    for (let i = 0; i < allTMDBMovies.length; i++) {
      const tmdbMovie = allTMDBMovies[i];
      
      // Skip if already exists
      if (existingIds.has(tmdbMovie.id.toString())) {
        console.log(`Skipping existing movie: ${tmdbMovie.title}`);
        continue;
      }

      try {
        console.log(`Fetching details for: ${tmdbMovie.title} (${i + 1}/${allTMDBMovies.length})...`);
        
        // Fetch full details including credits
        const details = await fetchMovieDetails(tmdbMovie.id);
        
        if (details) {
          const movie = convertTMDBMovie(tmdbMovie, details);
          results.success++;
          results.movies.push(movie);
          console.log(`✓ Fetched: ${movie.title}`);
        } else {
          // Fallback to basic info if details fetch fails
          const movie = convertTMDBMovie(tmdbMovie);
          results.success++;
          results.movies.push(movie);
          console.log(`✓ Fetched (basic): ${movie.title}`);
        }

        // Rate limiting - wait 250ms between requests (TMDB allows 40 requests per 10 seconds)
        if (i < allTMDBMovies.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 250));
        }
      } catch (error) {
        results.failed++;
        console.error(`✗ Failed to fetch: ${tmdbMovie.title}`, error.message);
      }
    }

    // Combine existing and new movies
    if (append && existingMovies.length > 0) {
      results.movies = [...existingMovies, ...results.movies];
    }

    // Save to JSON file
    try {
      fs.writeFileSync(MOVIES_JSON_PATH, JSON.stringify(results.movies, null, 2), 'utf8');
      console.log(`\n✓ Saved ${results.movies.length} movies to ${MOVIES_JSON_PATH}`);
    } catch (error) {
      console.error('Error saving movies to JSON:', error.message);
      throw error;
    }

    console.log(`\nCompleted: ${results.success} successful, ${results.failed} failed`);
    return results;
  } catch (error) {
    console.error('Error fetching movies from TMDB:', error.message);
    throw error;
  }
}

// Read movies from JSON file
function readMoviesFromJSON() {
  try {
    if (!fs.existsSync(MOVIES_JSON_PATH)) {
      console.log('Movies JSON file not found. Please fetch movies first.');
      return [];
    }
    const data = fs.readFileSync(MOVIES_JSON_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading movies from JSON:', error.message);
    return [];
  }
}

// Get all movies from JSON file
export function getAllMovies() {
  return readMoviesFromJSON();
}

// Get movies by filter
export function getMoviesByFilter(filter) {
  const movies = readMoviesFromJSON();
  let filtered = movies;

  if (filter.isNowShowing !== undefined) {
    filtered = filtered.filter(m => m.isNowShowing === filter.isNowShowing);
  }

  if (filter.isComingSoon !== undefined) {
    filtered = filtered.filter(m => m.isComingSoon === filter.isComingSoon);
  }

  if (filter.isFeatured !== undefined) {
    filtered = filtered.filter(m => m.isFeatured === filter.isFeatured);
  }

  return filtered.sort((a, b) => b.rating - a.rating);
}

// Get movie by ID
export function getMovieById(id) {
  const movies = readMoviesFromJSON();
  return movies.find(m => m.id === id) || null;
}
