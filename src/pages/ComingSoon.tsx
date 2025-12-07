import { useState, useEffect } from "react";
import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { MovieCard } from "@/components/cinema/MovieCard";
import { getComingSoon } from "@/data/movies";
import { Movie } from "@/types/cinema";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const ComingSoon = () => {
  const [comingSoonMovies, setComingSoonMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const movies = await getComingSoon();
        setComingSoonMovies(movies);
      } catch (error) {
        console.error('Error loading coming soon movies:', error);
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium mb-6">
              Coming Soon
            </div>
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex-1 h-px bg-yellow-500"></div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground whitespace-nowrap">
                Upcoming Releases
              </h1>
              <div className="flex-1 h-px bg-yellow-500"></div>
            </div>
            <p className="text-muted-foreground text-lg">
              Get ready for the most anticipated movies of the year. Be the first
              to experience these blockbusters at CineMax.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Movies Grid */}
      <main className="container mx-auto px-6 py-12">
        {comingSoonMovies.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6"
          >
            {comingSoonMovies.map((movie, index) => (
              <motion.div
                key={movie.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <MovieCard movie={movie} variant="default" />
                <div className="absolute top-4 left-4 z-10">
                  <div className="px-3 py-1 bg-primary/90 backdrop-blur-sm rounded-full text-xs font-semibold text-primary-foreground">
                    {new Date(movie.releaseDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <div className="text-center py-16">
                        <p className="text-muted-foreground text-lg mb-4">
              No upcoming releases at the moment
            </p>
            <Button variant="outline" asChild>
              <a href="/">Browse Now Showing</a>
            </Button>
          </div>
        )}
      </main>

      {/* Notify Me Section */}
      {comingSoonMovies.length > 0 && (
        <section className="py-16 bg-gradient-to-br from-card via-background to-card border-t border-border">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-2xl mx-auto text-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
                              </div>
              <h2 className="font-display text-3xl font-bold text-foreground mb-4">
                Stay Updated
              </h2>
              <p className="text-muted-foreground mb-6">
                Get notified when tickets go on sale for these upcoming releases
              </p>
              <Button variant="gold" size="lg" className="gap-2">
                                Notify Me
              </Button>
            </motion.div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
};

export default ComingSoon;


