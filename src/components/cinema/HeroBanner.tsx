import { useState, useEffect } from "react";
import { Movie } from "@/types/cinema";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import heroCinema from "@/assets/hero-cinema.jpg";
import { Play } from "lucide-react";

interface HeroBannerProps {
  movies: Movie[];
}

export const HeroBanner = ({ movies }: HeroBannerProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Guard against empty movies array
  if (!movies || movies.length === 0) {
    return (
      <div className="relative h-[85vh] min-h-[600px] overflow-hidden bg-muted flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground text-lg">Loading featured movies...</p>
        </div>
      </div>
    );
  }

  const currentMovie = movies[currentIndex];

  useEffect(() => {
    if (movies.length === 0) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [movies.length]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  return (
    <div className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <img
            src={currentMovie.backdrop || heroCinema}
            alt={currentMovie.title}
            className="h-full w-full object-cover"
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />

      {/* Content */}
      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentMovie.id}
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl"
            >
              {/* Now Showing Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/20 border border-primary/30 rounded-full mb-6"
              >
                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                <span className="text-sm font-medium text-primary">Now Showing</span>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="font-display text-5xl md:text-7xl font-bold text-foreground mb-4 leading-tight"
              >
                {currentMovie.title}
              </motion.h1>

              {/* Meta Info */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-wrap items-center gap-4 mb-6"
              >
                <div className="flex items-center gap-1.5 text-primary">
                  <span className="font-semibold text-lg">★ {currentMovie.rating.toFixed(1)}</span>
                </div>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <span>{formatDuration(currentMovie.duration)}</span>
                </div>
                <span className="w-1.5 h-1.5 bg-muted-foreground rounded-full" />
                <div className="flex gap-2">
                  {currentMovie.genre.slice(0, 3).map((g) => (
                    <span key={g} className="px-3 py-1 text-sm bg-muted/50 text-muted-foreground rounded-full">
                      {g}
                    </span>
                  ))}
                </div>
              </motion.div>

              {/* Synopsis */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-lg text-muted-foreground mb-8 line-clamp-3 leading-relaxed"
              >
                {currentMovie.synopsis}
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <Link to={`/movie/${currentMovie.id}`}>
                  <Button variant="gold" size="xl">
                    Book Tickets Now
                  </Button>
                </Link>
                <Button variant="outline" size="xl" className="gap-2">
                  <Play className="w-5 h-5" />
                  Watch Trailer
                </Button>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation Arrows */}
      <div className="absolute bottom-1/2 left-4 translate-y-1/2">
        <button
          onClick={goToPrevious}
          className="p-3 rounded-full bg-background/30 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/50 hover:border-primary/50 transition-all"
        >
          ‹
        </button>
      </div>
      <div className="absolute bottom-1/2 right-4 translate-y-1/2">
        <button
          onClick={goToNext}
          className="p-3 rounded-full bg-background/30 backdrop-blur-sm border border-border/50 text-foreground hover:bg-background/50 hover:border-primary/50 transition-all"
        >
          ›
        </button>
      </div>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "w-8 bg-primary"
                : "w-2 bg-muted-foreground/50 hover:bg-muted-foreground"
            }`}
          />
        ))}
      </div>

      {/* Movie Cards - Show only 3 cards that rotate with banner */}
      {movies.length > 0 && (
        <div className="absolute bottom-8 right-8 hidden lg:flex gap-4">
          {(() => {
            // Get 3 movies: previous, current, next (or fewer if not enough movies)
            const getVisibleMovies = () => {
              const visible = [];
              const maxCards = Math.min(3, movies.length);
              
              if (movies.length === 1) {
                // Only one movie - show it centered
                visible.push({ movie: movies[0], index: 0, isCurrent: true });
              } else if (movies.length === 2) {
                // Two movies - show both
                for (let i = 0; i < 2; i++) {
                  const index = (currentIndex + i - 1 + movies.length) % movies.length;
                  visible.push({ movie: movies[index], index, isCurrent: index === currentIndex });
                }
              } else {
                // Three or more movies - show previous, current, next
                for (let i = -1; i <= 1; i++) {
                  const index = (currentIndex + i + movies.length) % movies.length;
                  visible.push({ movie: movies[index], index, isCurrent: i === 0 });
                }
              }
              return visible;
            };
            
            return getVisibleMovies().map(({ movie, index, isCurrent }) => (
              <motion.button
                key={`${movie.id}-${index}`}
                onClick={() => setCurrentIndex(index)}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, x: isCurrent ? 0 : (index < currentIndex ? -20 : 20) }}
                animate={{ 
                  opacity: isCurrent ? 1 : 0.5,
                  x: 0,
                  scale: isCurrent ? 1 : 0.9
                }}
                transition={{ duration: 0.3 }}
                className={`relative rounded-xl overflow-hidden transition-all duration-300 ${
                  isCurrent
                    ? "w-32 h-48 ring-2 ring-primary ring-offset-2 ring-offset-background shadow-lg z-10"
                    : "w-24 h-36 hover:opacity-80 cursor-pointer"
                }`}
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="h-full w-full object-cover"
                />
                {isCurrent && (
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent">
                    <div className="absolute bottom-2 left-2 right-2">
                      <p className="text-xs font-semibold text-foreground line-clamp-2">{movie.title}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-primary font-medium">★ {movie.rating.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </motion.button>
            ));
          })()}
        </div>
      )}
    </div>
  );
};
