import { Movie } from "@/types/cinema";
import { MovieCard } from "./MovieCard";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

interface MovieSectionProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  viewAllLink?: string;
  variant?: "default" | "featured" | "compact";
}

export const MovieSection = ({
  title,
  subtitle,
  movies,
  viewAllLink,
  variant = "default",
}: MovieSectionProps) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-12">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-2">
              {title}
            </h2>
            {subtitle && (
              <p className="text-muted-foreground text-lg">{subtitle}</p>
            )}
          </div>
          {viewAllLink && (
            <Link
              to={viewAllLink}
              className="group flex items-center gap-1 text-primary font-medium hover:gap-2 transition-all"
            >
              View All
              <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          )}
        </div>

        {/* Movies Grid */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className={`grid gap-6 ${
            variant === "featured"
              ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              : variant === "compact"
              ? "grid-cols-3 md:grid-cols-5 lg:grid-cols-7"
              : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"
          }`}
        >
          {movies.map((movie) => (
            <motion.div key={movie.id} variants={itemVariants}>
              <MovieCard movie={movie} variant={variant} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};
