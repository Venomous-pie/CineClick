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
import { motion } from "framer-motion";
import { toast } from "@/hooks/use-toast";

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
          // Fallback to local data
          const allMovies = await getMovies();
          const foundMovie = allMovies.find((m) => m.id === id);
          setMovie(foundMovie || null);
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        // Fallback to local data
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
  const [bookingStep, setBookingStep] = useState<"room" | "showtime" | "seats">("room");
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);

  // Generate mock occupied seats
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
    setBookingStep("showtime");
  };

  const handleShowtimeSelect = (showtime: Showtime) => {
    setSelectedShowtime(showtime);
    setSelectedSeats([]);
    setBookingStep("seats");
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
    
    // Store booking data in sessionStorage to pass to payment page
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

      {/* Hero Section */}
      <div className="relative h-[50vh] min-h-[400px]">
        <img
          src={movie.backdrop || movie.poster}
          alt={movie.title}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 to-transparent" />

        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-24 left-6 flex items-center gap-2 text-foreground hover:text-primary transition-colors"
        >
          <span>← Back</span>
        </button>

        {/* Movie Info */}
        <div className="absolute bottom-0 left-0 right-0 container mx-auto px-6 pb-8">
          <div className="flex gap-8 items-end">
            <motion.img
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              src={movie.poster}
              alt={movie.title}
              className="w-48 h-72 object-cover rounded-xl shadow-2xl hidden md:block"
            />
            <div className="flex-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap gap-2 mb-4"
              >
                {movie.genre.map((g) => (
                  <span key={g} className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-full">
                    {g}
                  </span>
                ))}
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4"
              >
                {movie.title}
              </motion.h1>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex flex-wrap items-center gap-6 mb-4"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-foreground">★ {movie.rating.toFixed(1)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{formatDuration(movie.duration)}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>{new Date(movie.releaseDate).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex gap-3"
              >
                <Button variant="outline" size="sm" className="gap-2">
                  Trailer
                </Button>
                <Button variant="ghost" size="icon">
                  ♥
                </Button>
                <Button variant="ghost" size="icon">
                  ↗
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Booking Steps */}
          <div className="lg:col-span-2 space-y-8">
            {/* Date Selector */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex gap-2 overflow-x-auto pb-4"
            >
              {getDates().map((d) => (
                <button
                  key={d.value}
                  onClick={() => {
                    setSelectedDate(d.value);
                    setSelectedShowtime(null);
                    setSelectedSeats([]);
                  }}
                  className={`flex flex-col items-center px-4 py-3 rounded-xl min-w-[80px] transition-all ${
                    selectedDate === d.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-card border border-border hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs font-medium opacity-70">{d.day}</span>
                  <span className="text-2xl font-bold">{d.date}</span>
                  <span className="text-xs">{d.month}</span>
                </button>
              ))}
            </motion.div>

            {/* Step 1: Room Selection */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">1</span>
                Select Experience
              </h2>
              <RoomSelector
                rooms={viewingRooms}
                selectedRoom={selectedRoom}
                onRoomSelect={handleRoomSelect}
                basePrice={250}
              />
            </motion.section>

            {/* Step 2: Showtime Selection */}
            {selectedRoom && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">2</span>
                  Select Showtime
                </h2>
                <ShowtimeSelector
                  showtimes={showtimes}
                  selectedShowtime={selectedShowtime}
                  onShowtimeSelect={handleShowtimeSelect}
                />
              </motion.section>
            )}

            {/* Step 3: Seat Selection */}
            {selectedShowtime && selectedRoom && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <h2 className="font-display text-2xl font-semibold text-foreground mb-6 flex items-center gap-3">
                  <span className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">3</span>
                  Select Seats
                </h2>
                <div className="bg-card border border-border rounded-2xl p-6">
                  <SeatMap
                    room={selectedRoom}
                    selectedSeats={selectedSeats}
                    onSeatSelect={handleSeatSelect}
                    occupiedSeats={occupiedSeats}
                    maxSeats={10}
                  />
                </div>
              </motion.section>
            )}
          </div>

          {/* Right Column - Summary */}
          <div className="lg:col-span-1">
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

        {/* Movie Synopsis */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-16 max-w-4xl"
        >
          <h2 className="font-display text-2xl font-semibold text-foreground mb-4">Synopsis</h2>
          <p className="text-muted-foreground leading-relaxed">{movie.synopsis}</p>

          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-1">Director</h3>
              <p className="font-medium text-foreground">{movie.director}</p>
            </div>
            <div className="col-span-2 md:col-span-3">
              <h3 className="text-sm text-muted-foreground mb-1">Cast</h3>
              <p className="font-medium text-foreground">{movie.cast.join(", ")}</p>
            </div>
          </div>
        </motion.section>
      </div>

      <Footer />
    </div>
  );
};

export default MovieDetail;
