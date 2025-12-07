import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMovies, viewingRooms, generateShowtimes } from "@/data/movies";
import { Movie, ViewingRoom, Showtime, Seat } from "@/types/cinema";
import { apiService } from "@/services/api";
import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { RoomSelector } from "@/components/cinema/RoomSelector";
import { ShowtimeSelector } from "@/components/cinema/ShowtimeSelector";
import { SeatMap } from "@/components/cinema/SeatMap";
import { BookingSummary } from "@/components/cinema/BookingSummary";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";
import { Calendar, Clock, Star, Users, Film, ArrowLeft, Play, Share2, Heart } from "lucide-react";

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadMovie() {
      if (!id) return;
      try {
        setLoading(true);
        const response = await apiService.getMovieById(id);
        if (response.success && response.movie) {
          setMovie(response.movie);
        } else {
          const allMovies = await getMovies();
          const foundMovie = allMovies.find((m) => m.id === id);
          setMovie(foundMovie || null);
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        const allMovies = await getMovies();
        const foundMovie = allMovies.find((m) => m.id === id);
        setMovie(foundMovie || null);
      } finally {
        setLoading(false);
      }
    }
    loadMovie();
  }, [id]);

  const [selectedRoom, setSelectedRoom] = useState<ViewingRoom | null>(null);
  const [selectedShowtime, setSelectedShowtime] = useState<Showtime | null>(null);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  const occupiedSeats = useMemo(() => {
    const occupied: string[] = [];
    const rows = "ABCDEFGHIJ".split("");
    for (let i = 0; i < 15; i++) {
      const row = rows[Math.floor(Math.random() * rows.length)];
      const seat = Math.floor(Math.random() * 12) + 1;
      occupied.push(`${row}${seat}`);
    }
    return [...new Set(occupied)];
  }, [selectedShowtime]);

  const showtimes = useMemo(() => {
    if (!selectedRoom) return [];
    return generateShowtimes(movie?.id || "", selectedRoom.id, selectedDate);
  }, [movie?.id, selectedRoom, selectedDate]);

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const handleRoomSelect = (room: ViewingRoom) => {
    setSelectedRoom(room);
    setSelectedShowtime(null);
    setSelectedSeats([]);
  };

  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.find((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }
      return [...prev, seat];
    });
  };

  const handleRemoveSeat = (seat: Seat) => {
    setSelectedSeats((prev) => prev.filter((s) => s.id !== seat.id));
  };

  const handleClearSeats = () => {
    setSelectedSeats([]);
  };

  const handleProceedToPayment = () => {
    if (!selectedRoom || !selectedShowtime || selectedSeats.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please select a room, showtime, and seats before proceeding.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Proceeding to Payment",
      description: "You'll be redirected to the payment gateway...",
    });
    
    const bookingData = {
      movieId: movie?.id,
      roomId: selectedRoom.id,
      showtimeId: selectedShowtime.id,
      seats: selectedSeats,
      date: selectedDate,
    };
    sessionStorage.setItem('pendingBooking', JSON.stringify(bookingData));
    
    navigate(`/payment?movieId=${movie?.id}`);
  };

  const getDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push({
        value: date.toISOString().split("T")[0],
        day: date.toLocaleDateString("en-US", { weekday: "short" }),
        date: date.getDate(),
        month: date.toLocaleDateString("en-US", { month: "short" }),
      });
    }
    return dates;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading movie details...</p>
        </div>
      </div>
    );
  }

  if (!movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Movie not found</h1>
          <Button onClick={() => navigate("/")} variant="outline">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section with Backdrop */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={movie.backdrop || movie.poster}
            alt={movie.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        </div>

        {/* Content Overlay */}
        <div className="relative h-full flex items-end">
          <div className="container mx-auto px-6 pb-12">
            <div className="flex items-start gap-6">
              {/* Poster */}
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden md:block flex-shrink-0"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="w-56 h-80 object-cover rounded-2xl shadow-2xl border-4 border-background"
                />
              </motion.div>

              {/* Movie Info */}
              <div className="flex-1 min-w-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate(-1)}
                  className="mb-6 -ml-2"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>

                <div className="flex flex-wrap gap-2 mb-4">
                  {movie.genre.slice(0, 3).map((g) => (
                    <Badge key={g} variant="secondary" className="text-xs">
                      {g}
                    </Badge>
                  ))}
                </div>

                <h1 className="font-display text-4xl md:text-6xl font-bold text-foreground mb-4 leading-tight">
                  {movie.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 mb-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="font-semibold">{movie.rating.toFixed(1)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{formatDuration(movie.duration)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    <span>{new Date(movie.releaseDate).getFullYear()}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button variant="gold" size="lg" className="gap-2">
                    <Play className="w-4 h-4" />
                    Watch Trailer
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Heart className="w-4 h-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Share2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Side - Booking Flow */}
          <div className="lg:col-span-8 space-y-10">
            {/* Synopsis Section */}
            <section>
              <h2 className="text-xl font-semibold mb-3 text-foreground">About</h2>
              <p className="text-muted-foreground leading-relaxed text-lg">{movie.synopsis}</p>
              
              <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-6 pt-6 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Film className="w-4 h-4" />
                    Director
                  </p>
                  <p className="font-medium text-foreground">{movie.director}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1 flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Cast
                  </p>
                  <p className="font-medium text-foreground line-clamp-2">{movie.cast.join(", ")}</p>
                </div>
              </div>
            </section>

            <Separator />

            {/* Date Selection */}
            <section>
              <h2 className="text-xl font-semibold mb-4 text-foreground">Choose Date</h2>
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {getDates().map((d) => (
                  <button
                    key={d.value}
                    onClick={() => {
                      setSelectedDate(d.value);
                      setSelectedShowtime(null);
                      setSelectedSeats([]);
                    }}
                    className={`flex flex-col items-center px-5 py-3 rounded-lg min-w-[90px] transition-all shrink-0 ${
                      selectedDate === d.value
                        ? "bg-primary text-primary-foreground shadow-lg scale-105"
                        : "bg-muted hover:bg-muted/80 border border-border"
                    }`}
                  >
                    <span className="text-xs font-medium opacity-80">{d.day}</span>
                    <span className="text-xl font-bold my-1">{d.date}</span>
                    <span className="text-xs">{d.month}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Room Selection */}
            <section>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-1 h-8 bg-primary rounded-full"></div>
                <h2 className="text-xl font-semibold text-foreground">Select Experience</h2>
              </div>
              <RoomSelector
                rooms={viewingRooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
                basePrice={250}
              />
            </section>

            {/* Showtime Selection */}
            {selectedRoom && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-foreground">Select Time</h2>
                </div>
                <ShowtimeSelector
                  showtimes={showtimes}
                  selectedShowtime={selectedShowtime}
                  onShowtimeSelect={handleShowtimeSelect}
                />
              </section>
            )}

            {/* Seat Selection */}
            {selectedShowtime && selectedRoom && (
              <section>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-primary rounded-full"></div>
                  <h2 className="text-xl font-semibold text-foreground">Choose Your Seats</h2>
                </div>
                <div className="bg-card border border-border rounded-xl p-6">
                  <SeatMap
                    room={selectedRoom}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    occupiedSeats={occupiedSeats}
                    maxSeats={10}
                  />
                </div>
              </section>
            )}
          </div>

          {/* Right Side - Booking Summary (Sticky) */}
          <div className="lg:col-span-4">
            <div className="sticky top-24">
              <BookingSummary
                movie={movie}
                room={selectedRoom}
                showtime={selectedShowtime}
                seats={selectedSeats}
                onRemoveSeat={handleRemoveSeat}
                onProceed={handleProceedToPayment}
                onClear={handleClearSeats}
              />
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default MovieDetail;
