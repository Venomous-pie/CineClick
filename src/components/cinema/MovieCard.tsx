import { Movie } from "@/types/cinema";
import { Button } from "@/components/ui/button";
import { Star, Clock, Play } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface MovieCardProps {
  movie: Movie;
  variant?: "default" | "featured" | "compact";
}

export const MovieCard = ({ movie, variant = "default" }: MovieCardProps) => {
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (variant === "compact") {
    return (
      <motion.div
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.3 }}
        className="group relative overflow-hidden rounded-lg bg-card shadow-card cursor-pointer"
      >
        <Link to={`/movie/${movie.id}`}>
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
            <h3 className="font-display text-sm font-semibold text-foreground line-clamp-1">{movie.title}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <Star className="w-3 h-3 text-primary fill-primary" />
              <span>{movie.rating.toFixed(1)}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  if (variant === "featured") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="group relative overflow-hidden rounded-xl bg-card shadow-card"
      >
        <Link to={`/movie/${movie.id}`}>
          <div className="aspect-[2/3] overflow-hidden">
            <img
              src={movie.poster}
              alt={movie.title}
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-center gap-2 mb-2">
              {movie.genre.slice(0, 2).map((g) => (
                <span key={g} className="px-2 py-0.5 text-xs bg-primary/20 text-primary rounded-full">
                  {g}
                </span>
              ))}
            </div>
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">{movie.title}</h3>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="text-foreground font-medium">{movie.rating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{formatDuration(movie.duration)}</span>
              </div>
            </div>
          </div>
          {/* Hover Overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/60 backdrop-blur-sm">
            <Button variant="gold" size="lg">
              Book Tickets
            </Button>
          </div>
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -8 }}
      transition={{ duration: 0.3 }}
      className="group relative overflow-hidden rounded-xl bg-card shadow-card"
    >
      <Link to={`/movie/${movie.id}`}>
        <div className="aspect-[2/3] overflow-hidden">
          <img
            src={movie.poster}
            alt={movie.title}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-background/80 backdrop-blur-sm rounded-full">
          <Star className="w-3.5 h-3.5 text-primary fill-primary" />
          <span className="text-xs font-semibold text-foreground">{movie.rating.toFixed(1)}</span>
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-display text-lg font-semibold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
            {movie.title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {movie.genre.slice(0, 2).map((g) => (
              <span key={g} className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-full">
                {g}
              </span>
            ))}
          </div>
          <div className="flex items-center gap-3 mt-3 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{formatDuration(movie.duration)}</span>
            </div>
          </div>
        </div>

        {/* Hover Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-background/60 backdrop-blur-sm">
          <Button variant="gold" size="lg">
            Book Tickets
          </Button>
        </div>
      </Link>
    </motion.div>
  );
};
