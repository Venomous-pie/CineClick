import { useState, useEffect } from "react";
import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { Booking } from "@/types/cinema";
import { getMovies } from "@/data/movies";
import { viewingRooms } from "@/data/movies";
import { bookingService } from "@/services/bookingService";
import { useAuth } from "@/contexts/AuthContext";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

const MyTickets = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [movies, setMovies] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        // Load movies for display
        const allMovies = await getMovies();
        setMovies(allMovies);

        // Load bookings if authenticated
        if (isAuthenticated) {
          const response = await bookingService.getUserBookings();
          if (response.success && response.bookings) {
            setBookings(response.bookings);
          }
        }
      } catch (error) {
        console.error('Error loading tickets:', error);
        toast({
          title: "Error",
          description: "Failed to load your tickets. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    if (!authLoading) {
      if (!isAuthenticated) {
        // Redirect to login if not authenticated
        navigate("/account");
      } else {
        loadData();
      }
    }
  }, [isAuthenticated, authLoading, navigate]);

  const getStatusColor = (status: Booking["status"]) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/20 text-green-500";
      case "pending":
        return "bg-yellow-500/20 text-yellow-500";
      case "cancelled":
        return "bg-red-500/20 text-red-500";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const pendingBookings = bookings.filter((b) => b.status === "pending");
  const cancelledBookings = bookings.filter((b) => b.status === "cancelled");

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your tickets...</p>
        </div>
      </div>
    );
  }

  const renderBookingCard = (booking: Booking) => {
    const movie = movies.find((m) => m.id === booking.movieId);
    const room = viewingRooms.find((r) => r.id === booking.roomId);

    if (!movie) return null;

    return (
      <motion.div
        key={booking.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl p-6 hover:shadow-glow transition-all"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Movie Poster */}
          <div className="flex-shrink-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-32 h-48 object-cover rounded-xl"
            />
          </div>

          {/* Booking Details */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {movie.title}
                </h3>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span>{formatDate(booking.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span>{formatTime(booking.createdAt)}</span>
                  </div>
                </div>
              </div>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Room</p>
                <p className="font-medium text-foreground">{room?.name || "N/A"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Seats</p>
                <div className="flex items-center gap-1">
                  <p className="font-medium text-foreground">
                    {booking.seats.map((s) => s.id).join(", ")}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total</p>
                <p className="font-medium text-foreground">₱{booking.totalPrice}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 border-t border-border">
              <div className="flex-1">
                <p className="text-xs text-muted-foreground mb-1">Booking Code</p>
                <p className="font-mono font-semibold text-foreground">
                  {booking.bookingCode}
                </p>
              </div>
              {booking.status === "confirmed" && (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    QR Code
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2">
                    Download
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
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
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/20 mb-6">
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              My Tickets
            </h1>
            <p className="text-muted-foreground text-lg">
              View and manage your movie bookings
            </p>
          </motion.div>
        </div>
      </section>

      {/* Tickets List */}
      <main className="container mx-auto px-6 py-12">
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-4 mb-8">
            <TabsTrigger value="all">All ({bookings.length})</TabsTrigger>
            <TabsTrigger value="confirmed">
              Confirmed ({confirmedBookings.length})
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending ({pendingBookings.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Cancelled ({cancelledBookings.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {bookings.length > 0 ? (
              bookings.map((booking) => renderBookingCard(booking))
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground text-lg mb-4">
                  No bookings found
                </p>
                <Button variant="outline" asChild>
                  <a href="/movies">Browse Movies</a>
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="confirmed" className="space-y-6">
            {confirmedBookings.length > 0 ? (
              confirmedBookings.map((booking) => renderBookingCard(booking))
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No confirmed bookings</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6">
            {pendingBookings.length > 0 ? (
              pendingBookings.map((booking) => renderBookingCard(booking))
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No pending bookings</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-6">
            {cancelledBookings.length > 0 ? (
              cancelledBookings.map((booking) => renderBookingCard(booking))
            ) : (
              <div className="text-center py-16">
                <p className="text-muted-foreground">No cancelled bookings</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>

      <Footer />
    </div>
  );
};

export default MyTickets;


