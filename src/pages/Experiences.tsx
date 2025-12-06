import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { viewingRooms } from "@/data/movies";
import { ViewingRoom } from "@/types/cinema";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Experiences = () => {
  const getRoomIcon = (type: ViewingRoom["type"]) => {
    // lucide-react icon logic removed. Update as needed for alternative icons.
    return null;
  };

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

  const getRoomGradient = (type: ViewingRoom["type"]) => {
    switch (type) {
      case "basic":
        return "from-primary/20 to-primary/5";
      case "3d":
        return "from-tier-3d/20 to-tier-3d/5";
      case "premium":
        return "from-tier-premium/20 to-tier-premium/5";
      case "vip":
        return "from-tier-vip/20 to-tier-vip/5";
      default:
        return "from-primary/20 to-primary/5";
    }
  };

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
              Cinema Experiences
            </h1>
            <p className="text-muted-foreground text-lg">
              Choose the perfect way to experience your favorite movies. From
              standard viewing to luxury VIP lounges, we have something for
              everyone.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Experiences Grid */}
      <main className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {viewingRooms.map((room, index) => {
            const Icon = getRoomIcon(room.type);
            const colorClass = getRoomColor(room.type);
            const gradientClass = getRoomGradient(room.type);

            return (
              <motion.div
                key={room.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${gradientClass} border border-border p-8 group hover:shadow-glow transition-all`}
              >
                {/* Icon */}
                <div
                  className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-background/50 backdrop-blur-sm mb-6 ${colorClass}`}
                >
                </div>

                {/* Title */}
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  {room.name}
                </h2>
                <p className="text-muted-foreground mb-6">{room.description}</p>

                {/* Details */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>{room.capacity} seats</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <span>Premium Audio</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="mb-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">
                    Features:
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {room.amenities.slice(0, 4).map((amenity) => (
                      <div
                        key={amenity}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                                                <span>{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price Info */}
                <div className="flex items-center justify-between pt-6 border-t border-border">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      Starting from
                    </p>
                    <p className={`text-2xl font-bold ${colorClass}`}>
                      ₱{Math.round(250 * room.priceMultiplier)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="gap-2">
                    Learn More
                                      </Button>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Link to="/movies">
                    <Button variant="gold" size="lg" className="gap-2">
                      Book Now
                                          </Button>
                  </Link>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

      {/* Comparison Section */}
      <section className="py-16 bg-gradient-to-br from-card via-background to-card border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="font-display text-3xl font-bold text-foreground text-center mb-12">
              Compare Experiences
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold text-foreground">
                      Feature
                    </th>
                    {viewingRooms.map((room) => (
                      <th
                        key={room.id}
                        className="text-center py-4 px-4 font-semibold text-foreground"
                      >
                        {room.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-muted-foreground">Screen</td>
                    {viewingRooms.map((room) => (
                      <td key={room.id} className="text-center py-4 px-4">
                        {room.type === "premium" ? "Giant" : room.type === "3d" ? "3D" : "Standard"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-muted-foreground">Seating</td>
                    {viewingRooms.map((room) => (
                      <td key={room.id} className="text-center py-4 px-4">
                        {room.type === "vip" || room.type === "premium"
                          ? "Reclining"
                          : "Standard"}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b border-border">
                    <td className="py-4 px-4 text-muted-foreground">Audio</td>
                    {viewingRooms.map((room) => (
                      <td key={room.id} className="text-center py-4 px-4">
                        {room.type === "vip" || room.type === "premium"
                          ? "Dolby Atmos"
                          : "Dolby Surround"}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td className="py-4 px-4 text-muted-foreground">Price</td>
                    {viewingRooms.map((room) => (
                      <td key={room.id} className="text-center py-4 px-4 font-semibold text-foreground">
                        ₱{Math.round(250 * room.priceMultiplier)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Experiences;


