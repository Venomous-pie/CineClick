const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  backdrop?: string;
  synopsis: string;
  duration: number;
  rating: number;
  genre: string[];
  releaseDate: string;
  director: string;
  cast: string[];
  isNowShowing: boolean;
  isComingSoon: boolean;
  isFeatured?: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  count?: number;
  movies?: T[];
  movie?: T;
  results?: any;
}

class ApiService {
  private async fetch<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      return response.json();
    } catch (error) {
      console.error(`API fetch error for ${endpoint}:`, error);
      throw error;
    }
  }

  async fetchMovies(): Promise<ApiResponse<Movie>> {
    return this.fetch<ApiResponse<Movie>>('/movies/fetch');
  }

  async getAllMovies(): Promise<ApiResponse<Movie>> {
    return this.fetch<ApiResponse<Movie>>('/movies');
  }

  async getMovieById(id: string): Promise<ApiResponse<Movie>> {
    return this.fetch<ApiResponse<Movie>>(`/movies/${id}`);
  }

  async getPopularMovies(): Promise<ApiResponse<Movie>> {
    return this.fetch<ApiResponse<Movie>>('/movies/popular');
  }

  async getNowShowingMovies(): Promise<ApiResponse<Movie>> {
    return this.fetch<ApiResponse<Movie>>('/movies/now-showing');
  }

  async getComingSoonMovies(): Promise<ApiResponse<Movie>> {
    return this.fetch<ApiResponse<Movie>>('/movies/coming-soon');
  }

  async getFeaturedMovies(): Promise<ApiResponse<Movie>> {
    return this.fetch<ApiResponse<Movie>>('/movies/featured');
  }

  async filterMovies(filters: {
    isNowShowing?: boolean;
    isComingSoon?: boolean;
    isFeatured?: boolean;
  }): Promise<ApiResponse<Movie>> {
    const params = new URLSearchParams();
    if (filters.isNowShowing !== undefined) {
      params.append('isNowShowing', filters.isNowShowing.toString());
    }
    if (filters.isComingSoon !== undefined) {
      params.append('isComingSoon', filters.isComingSoon.toString());
    }
    if (filters.isFeatured !== undefined) {
      params.append('isFeatured', filters.isFeatured.toString());
    }
    return this.fetch<ApiResponse<Movie>>(`/movies/filter?${params.toString()}`);
  }
}

export const apiService = new ApiService();

