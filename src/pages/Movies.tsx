import { useState, useMemo, useEffect } from "react";
import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { MovieCard } from "@/components/cinema/MovieCard";
import { getMovies } from "@/data/movies";
import { Movie } from "@/types/cinema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

const Movies = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<"all" | "nowShowing" | "comingSoon">("all");

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const allMovies = await getMovies();
        console.log('Loaded movies:', allMovies.length);
        setMovies(allMovies);
      } catch (error) {
        console.error('Error loading movies:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  // Get all unique genres
  const allGenres = useMemo(() => {
    const genres = new Set<string>();
    movies.forEach((movie) => {
      if (movie.genre && Array.isArray(movie.genre)) {
        movie.genre.forEach((g) => genres.add(g));
      }
    });
    return Array.from(genres).sort();
  }, [movies]);

  // Filter movies
  const filteredMovies = useMemo(() => {
    let filtered = movies;
    
    // Apply filter type
    if (filterType === "nowShowing") {
      filtered = movies.filter((movie) => movie.isNowShowing === true);
    } else if (filterType === "comingSoon") {
      filtered = movies.filter((movie) => movie.isComingSoon === true);
    }
    // "all" shows all movies

    if (searchQuery) {
      filtered = filtered.filter(
        (movie) =>
          movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.director.toLowerCase().includes(searchQuery.toLowerCase()) ||
          movie.cast.some((actor) =>
            actor.toLowerCase().includes(searchQuery.toLowerCase())
          )
      );
    }

    if (selectedGenre) {
      filtered = filtered.filter((movie) =>
        movie.genre.includes(selectedGenre)
      );
    }

    return filtered;
  }, [movies, searchQuery, selectedGenre, filterType]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16 bg-gradient-to-br from-card via-background to-card">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Movies
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Discover the latest blockbusters and timeless classics at CineMax
            </p>

            {/* Filter Type Buttons */}
            <div className="flex justify-center gap-3 mb-6">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("all")}
              >
                All Movies
              </Button>
              <Button
                variant={filterType === "nowShowing" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("nowShowing")}
              >
                Now Showing
              </Button>
              <Button
                variant={filterType === "comingSoon" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterType("comingSoon")}
              >
                Coming Soon
              </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-2xl mx-auto mb-6">
              <Input
                type="text"
                placeholder="Search movies, directors, or actors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-4 pr-4 h-12 text-base"
              />
            </div>

            {/* Filter Toggle */}
            <div className="flex justify-center gap-4">
              <Button
                variant={showFilters ? "default" : "outline"}
                onClick={() => setShowFilters(!showFilters)}
                className="gap-2"
              >
                Filters
              </Button>
              {(selectedGenre || searchQuery) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSelectedGenre(null);
                    setSearchQuery("");
                  }}
                  className="gap-2"
                >
                  Clear
                </Button>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters */}
      {showFilters && (
        <motion.section
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="border-b border-border bg-card"
        >
          <div className="container mx-auto px-6 py-6">
            <div className="flex flex-wrap gap-3 justify-center">
              <Button
                variant={selectedGenre === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedGenre(null)}
              >
                All Genres
              </Button>
              {allGenres.map((genre) => (
                <Button
                  key={genre}
                  variant={selectedGenre === genre ? "default" : "outline"}
                  size="sm"
                  onClick={() =>
                    setSelectedGenre(selectedGenre === genre ? null : genre)
                  }
                >
                  {genre}
                </Button>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Movies Grid */}
      <main className="container mx-auto px-6 py-12">
        {loading ? (
          <div className="text-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground text-lg">Loading movies...</p>
          </div>
        ) : filteredMovies.length > 0 ? (
          <>
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {filteredMovies.length} movie
                {filteredMovies.length !== 1 ? "s" : ""}
              </p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
            >
              {filteredMovies.map((movie, index) => (
                <motion.div
                  key={movie.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <MovieCard movie={movie} variant="default" />
                </motion.div>
              ))}
            </motion.div>
          </>
        ) : (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg mb-4">
              {movies.length === 0 
                ? "No movies available. Please check your connection or try again later."
                : "No movies found matching your criteria"}
            </p>
            {(searchQuery || selectedGenre || filterType !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedGenre(null);
                  setFilterType("all");
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Movies;


