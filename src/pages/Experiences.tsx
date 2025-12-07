import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { viewingRooms } from "@/data/movies";
import { ViewingRoom } from "@/types/cinema";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Experiences = () => {
  const getRoomColor = (type: ViewingRoom["type"]) => {
    switch (type) {
      case "basic":
        return "text-primary";
      case "3d":
        return "text-tier-3d";
      case "premium":
        return "text-tier-premium";
      case "vip":
        return "text-tier-vip";
      default:
        return "text-primary";
    }
  };

  const getRoomBgColor = (type: ViewingRoom["type"]) => {
    switch (type) {
      case "basic":
        return "bg-primary/10 border-primary/20";
      case "3d":
        return "bg-tier-3d/10 border-tier-3d/20";
      case "premium":
        return "bg-tier-premium/10 border-tier-premium/20";
      case "vip":
        return "bg-tier-vip/10 border-tier-vip/20";
      default:
        return "bg-primary/10 border-primary/20";
    }
  };

  const getRoomAccent = (type: ViewingRoom["type"]) => {
    switch (type) {
      case "basic":
        return "bg-primary";
      case "3d":
        return "bg-tier-3d";
      case "premium":
        return "bg-tier-premium";
      case "vip":
        return "bg-tier-vip";
      default:
        return "bg-primary";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-32 pb-16">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="flex items-center justify-center gap-4 mb-4">
              <div className="flex-1 h-px bg-yellow-500"></div>
              <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground whitespace-nowrap">
                Cinema Experiences
              </h1>
              <div className="flex-1 h-px bg-yellow-500"></div>
            </div>
            <p className="text-muted-foreground text-lg">
              Choose the perfect way to experience your favorite movies
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experiences - 4 Cards Grid */}
      <main className="container mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {viewingRooms.map((room, index) => {
            const colorClass = getRoomColor(room.type);
            const bgClass = getRoomBgColor(room.type);
            const accentClass = getRoomAccent(room.type);

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${bgClass} border-2 rounded-2xl p-6 hover:shadow-lg transition-all group`}
              >
                <div className={`w-full h-1 ${accentClass} mb-4 rounded-full`} />
                
                <h2 className={`font-display text-2xl font-bold ${colorClass} mb-3`}>
                  {room.name}
                </h2>
                
                <p className="text-muted-foreground mb-4 text-sm">
                  {room.description}
                </p>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{room.capacity} seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{room.type === "vip" || room.type === "premium" ? "Reclining" : "Standard"} Seats</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xs font-semibold text-foreground mb-2 uppercase tracking-wide">
                    Features
                  </h3>
                  <div className="space-y-1">
                    {room.amenities.slice(0, 3).map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className={`w-1.5 h-1.5 rounded-full ${accentClass}`} />
                        <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-border">
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-1">
                      Starting from
                    </p>
                    <p className={`text-2xl font-bold ${colorClass}`}>
                      ₱{Math.round(250 * room.priceMultiplier)}
                    </p>
                  </div>
                  <Link to="/movies">
                    <Button variant="gold" className="w-full" size="sm">
                      Book Now
                    </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Experiences;


