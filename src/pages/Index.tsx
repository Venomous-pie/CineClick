import { useState, useEffect } from "react";
import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { HeroBanner } from "@/components/cinema/HeroBanner";
import { MovieSection } from "@/components/cinema/MovieSection";
import { getPopularMovies, getNewReleases, getComingSoon, getFeaturedMovies, getMovies } from "@/data/movies";
import { Movie } from "@/types/cinema";
import { motion } from "framer-motion";

const Index = () => {
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [popularMovies, setPopularMovies] = useState<Movie[]>([]);
  const [newReleases, setNewReleases] = useState<Movie[]>([]);
  const [comingSoon, setComingSoon] = useState<Movie[]>([]);
  const [allMovies, setAllMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovies() {
      try {
        setLoading(true);
        const [featured, popular, newReleasesData, comingSoonData, all] = await Promise.all([
          getFeaturedMovies(),
          getPopularMovies(),
          getNewReleases(),
          getComingSoon(),
          getMovies()
        ]);
        
        // Ensure we have at least some movies to display
        if (featured.length > 0) {
          setFeaturedMovies(featured);
        } else if (all.length > 0) {
          // Use first 3 movies as featured if no featured movies
          setFeaturedMovies(all.slice(0, 3));
        }
        
        if (popular.length > 0) {
          setPopularMovies(popular);
        } else if (all.length > 0) {
          setPopularMovies(all.slice(0, 6));
        }
        
        if (newReleasesData.length > 0) {
          setNewReleases(newReleasesData);
        } else if (all.length > 0) {
          setNewReleases(all.slice(0, 6));
        }
        
        setComingSoon(comingSoonData);
        setAllMovies(all);
        
        console.log('Movies loaded:', {
          featured: featured.length,
          popular: popular.length,
          newReleases: newReleasesData.length,
          comingSoon: comingSoonData.length,
          all: all.length
        });
      } catch (error) {
        console.error('Error loading movies:', error);
        // Try to load fallback movies
        try {
          const all = await getMovies();
          if (all.length > 0) {
            setFeaturedMovies(all.slice(0, 3));
            setPopularMovies(all.slice(0, 6));
            setNewReleases(all.slice(0, 6));
            setAllMovies(all);
          }
        } catch (fallbackError) {
          console.error('Error loading fallback movies:', fallbackError);
        }
      } finally {
        setLoading(false);
      }
    }
    loadMovies();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Banner */}
      {featuredMovies.length > 0 ? (
        <HeroBanner movies={featuredMovies} />
      ) : (
        <div className="relative h-[85vh] min-h-[600px] overflow-hidden bg-muted flex items-center justify-center">
          <div className="text-center">
            <p className="text-muted-foreground text-lg">Loading featured movies...</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main>
        {/* Quick Category Icons */}
        <section className="py-8 border-b border-border">
          <div className="container mx-auto px-6">
            <div className="flex justify-center gap-8 md:gap-16">
              {/* Lucide-react icon buttons removed. Update with alternative icons or content if needed. */}
            </div>
          </div>
        </section>

        {/* Popular Movies */}
        <MovieSection
          title="Popular Now"
          subtitle="Most watched movies this week"
          movies={popularMovies}
          viewAllLink="/movies"
          variant="featured"
        />

        {/* Divider with Theater Experience Promo */}
        <section className="py-16 bg-gradient-to-br from-card via-background to-card">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-secondary/30 via-card to-primary/10 border border-border p-8 md:p-12"
            >
              <div className="absolute top-0 right-0 w-1/2 h-full opacity-30">
                <div className="absolute top-10 right-10 w-40 h-40 rounded-full bg-primary/20 blur-3xl" />
                <div className="absolute bottom-10 right-32 w-32 h-32 rounded-full bg-accent/20 blur-3xl" />
              </div>

              <div className="relative z-10 max-w-xl">
                <span className="inline-block px-4 py-1.5 bg-primary/20 text-primary rounded-full text-sm font-medium mb-4">
                  Premium Experience
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Elevate Your Movie Night
                </h2>
                <p className="text-muted-foreground text-lg mb-6">
                  From immersive 3D to exclusive VIP lounges, discover the perfect way to experience cinema.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="px-4 py-2 bg-tier-3d/20 text-tier-3d rounded-lg text-sm font-medium">
                    3D Experience
                  </div>
                  <div className="px-4 py-2 bg-tier-premium/20 text-tier-premium rounded-lg text-sm font-medium">
                    ULTRAMAX
                  </div>
                  <div className="px-4 py-2 bg-tier-vip/20 text-tier-vip rounded-lg text-sm font-medium">
                    VIP Lounge
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* New Releases */}
        {!loading && newReleases.length > 0 && (
          <MovieSection
            title="New Releases"
            subtitle="Fresh arrivals at CineMax"
            movies={newReleases}
            viewAllLink="/movies"
          />
        )}

        {/* Coming Soon */}
        {!loading && comingSoon.length > 0 && (
          <MovieSection
            title="Coming Soon"
            subtitle="Get ready for upcoming blockbusters"
            movies={comingSoon}
            viewAllLink="/coming-soon"
          />
        )}

        {/* All Movies */}
        {!loading && (
          <MovieSection
            title="All Movies"
            subtitle="Browse our complete collection"
            movies={allMovies}
            viewAllLink="/movies"
          />
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
