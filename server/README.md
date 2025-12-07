# CineMax Backend API

Backend server for fetching movie data from TMDB (The Movie Database) API and storing it in a JSON file.

## Setup

1. Install dependencies:
```bash
cd server
npm install
```

2. Create `.env` file (or use the provided `.env.example`):
```
PORT=3001
TMDB_API_KEY=63bd6441ae487a623b3ee66ce47679cb
TMDB_ACCESS_TOKEN=eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI2M2JkNjQ0MWFlNDg3YTYyM2IzZWU2NmNlNDc2NzljYiIsIm5iZiI6MTc2NTA2MDQ1Mi45MjksInN1YiI6IjY5MzRhZjY0NTc1Njg0NmNlOGI3MTFkNCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.PbLrc2t9bhYUphHZOfA7geI1fhktmu0mv_CBZsGo-e4
NODE_ENV=development
```

3. Start the server:
```bash
npm run dev
```

## API Endpoints

### Health Check
- `GET /api/health` - Check if server is running

### Movies
- `POST /api/movies/fetch` - Fetch movies from TMDB API and store in JSON file
- `GET /api/movies` - Get all movies from JSON file
- `GET /api/movies/:id` - Get movie by ID
- `GET /api/movies/popular` - Get popular movies (rating >= 8.0)
- `GET /api/movies/now-showing` - Get movies currently showing
- `GET /api/movies/coming-soon` - Get upcoming movies
- `GET /api/movies/featured` - Get featured movies
- `GET /api/movies/filter?isNowShowing=true&isComingSoon=false` - Filter movies

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update user profile

## Usage

1. First, fetch movies from TMDB API (this will create `movies.json`):
```bash
curl -X POST http://localhost:3001/api/movies/fetch
```

To append new movies without replacing existing ones:
```bash
curl -X POST http://localhost:3001/api/movies/fetch?append=true
```

2. Then, access the movies from the frontend:
```bash
curl http://localhost:3001/api/movies
```

## Data Storage

The movies are stored in `server/movies.json` file. This file is:
- Created automatically when you fetch movies
- Read by the backend to serve data to the frontend
- Can be manually edited if needed
- Excluded from git (in .gitignore)

## TMDB API

This project uses [The Movie Database (TMDB) API](https://developer.themoviedb.org/reference/getting-started) to fetch movie data. The API provides:
- Popular movies
- Now playing movies
- Upcoming movies
- Top rated movies
- High-quality posters and backdrops
- Detailed movie information including cast and crew

## Rate Limiting

TMDB API allows 40 requests per 10 seconds. The service includes rate limiting (250ms delay between requests) to stay within these limits.
