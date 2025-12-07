import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/cinema/Navbar";
import { Footer } from "@/components/cinema/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { motion } from "framer-motion";
import { viewingRooms } from "@/data/movies";
import { apiService } from "@/services/api";
import { bookingService } from "@/services/bookingService";
import { getMovies } from "@/data/movies";
import { Movie, Seat } from "@/types/cinema";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const movieId = searchParams.get("movieId");
  const [paymentMethod, setPaymentMethod] = useState<string>("gcash");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<{
    movieId: string;
    roomId: string;
    showtimeId: string;
    seats: Seat[];
    date: string;
  } | null>(null);
  const [savedBooking, setSavedBooking] = useState<any>(null);

  // Get booking data from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('pendingBooking');
    if (stored) {
      try {
        const data = JSON.parse(stored);
        setBookingData(data);
      } catch (error) {
        console.error('Error parsing booking data:', error);
      }
    }
  }, []);

  const seats = bookingData?.seats || [];
  const basePrice = 250;
  const room = viewingRooms.find(r => r.id === bookingData?.roomId);
  const roomMultiplier = room?.priceMultiplier || 1.5;
  const totalPrice = seats.reduce((sum, seat) => sum + seat.price, 0) || Math.round(basePrice * roomMultiplier * seats.length);

  useEffect(() => {
    async function loadMovie() {
      if (!movieId) {
        navigate("/");
        return;
      }
      
      try {
        setLoading(true);
        // Try to get from API first
        const response = await apiService.getMovieById(movieId);
        if (response.success && response.movie) {
          setMovie(response.movie);
        } else {
          // Fallback to local data
          const allMovies = await getMovies();
          const foundMovie = allMovies.find((m) => m.id === movieId);
          setMovie(foundMovie || null);
        }
      } catch (error) {
        console.error('Error loading movie:', error);
        // Fallback to local data
        const allMovies = await getMovies();
        const foundMovie = allMovies.find((m) => m.id === movieId);
        setMovie(foundMovie || null);
      } finally {
        setLoading(false);
      }
    }
    
    if (!movieId) {
      navigate("/");
    } else {
      loadMovie();
    }
  }, [movieId, navigate]);

  // Redirect if not authenticated or booking data is missing
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      navigate("/account");
      return;
    }

    if (!authLoading && isAuthenticated && !loading && !bookingData) {
      toast({
        title: "Booking Error",
        description: "Booking information is missing. Please start over.",
        variant: "destructive",
      });
      navigate("/");
    }
  }, [isAuthenticated, authLoading, bookingData, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!movie || !movieId || !bookingData || seats.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            Invalid booking
          </h1>
          <p className="text-muted-foreground mb-4">
            {!movie ? "Movie not found." : "Booking information is missing."}
          </p>
          <Button onClick={() => navigate("/")} variant="outline">
            Go Back Home
          </Button>
        </div>
      </div>
    );
  }

  const handlePayment = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to complete your booking.",
        variant: "destructive",
      });
      navigate("/account");
      return;
    }

    if (!bookingData) {
      toast({
        title: "Booking Error",
        description: "Booking information is missing. Please start over.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    setIsProcessing(true);

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Create booking in database
      const bookingResponse = await bookingService.createBooking({
        movieId: bookingData.movieId,
        showtimeId: bookingData.showtimeId,
        roomId: bookingData.roomId,
        seats: bookingData.seats,
        totalPrice: totalPrice,
        paymentMethod: paymentMethod,
        status: 'confirmed'
      });

      if (bookingResponse.success && bookingResponse.booking) {
        setSavedBooking(bookingResponse.booking);
        setIsComplete(true);
        // Clear pending booking from sessionStorage
        sessionStorage.removeItem('pendingBooking');
        toast({
          title: "Payment Successful",
          description: "Your booking has been confirmed!",
        });
      } else {
        throw new Error(bookingResponse.message || 'Failed to create booking');
      }
    } catch (error: any) {
      console.error('Error processing payment:', error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-6 py-32">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
            {/* Success Visual */}
            <div className="text-center mb-12">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-500/20 mb-6 relative"
              >
                <div className="absolute inset-0 bg-green-500/30 rounded-full animate-ping" />
                <div className="relative w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">✓</span>
                </div>
              </motion.div>
              
              <h1 className="font-display text-5xl md:text-6xl font-bold text-foreground mb-4">
                You're All Set!
              </h1>
              <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
                Your booking is confirmed. Check your email for your tickets and booking details.
              </p>
            </div>

            {/* Booking Code Card - Prominent */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-card to-card/50 border-2 border-primary/20 rounded-3xl p-8 md:p-12 mb-8 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-1 h-8 bg-primary" />
                  <p className="text-sm text-muted-foreground uppercase tracking-wide font-medium">
                    Your Booking Code
                  </p>
                </div>
                <p className="font-mono text-4xl md:text-5xl font-bold text-foreground mb-2 tracking-wider">
                  {savedBooking?.bookingCode || `CMX-2024-${Math.floor(Math.random() * 10000)}`}
                </p>
                <p className="text-muted-foreground text-sm">
                  Save this code or check your email for your tickets
                </p>
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button variant="gold" size="lg" asChild className="flex-1 sm:flex-none">
                <a href="/my-tickets">View My Tickets</a>
              </Button>
              <Button variant="outline" size="lg" asChild className="flex-1 sm:flex-none">
                <a href="/">Back to Home</a>
              </Button>
            </motion.div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section - Minimalist */}
      <section className="pt-32 pb-12 relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="flex-1 h-px border-t-2 border-dashed border-yellow-500"></div>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground whitespace-nowrap">
                  Final Step
                </h1>
                <div className="flex-1 h-px border-t-2 border-dashed border-yellow-500"></div>
              </div>
              <p className="text-muted-foreground">
                Secure checkout • Your tickets await
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Payment Content - Creative Layout */}
      <main className="container mx-auto px-6 pb-20 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Summary - Left Side, Sticky */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24"
            >
              <Card className="border-2 bg-gradient-to-br from-card to-card/50">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <CardTitle className="text-xl">Your Booking</CardTitle>
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Movie Poster - Larger, More Prominent */}
                  <div className="relative">
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-full h-64 object-cover rounded-xl shadow-lg"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent rounded-xl" />
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="font-bold text-lg text-white mb-1 drop-shadow-lg">
                        {movie.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-white/90">
                        <span className="px-2 py-1 bg-white/20 backdrop-blur-sm rounded">
                          {seats.length} seat{seats.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Seats Display - Visual */}
                  <div className="pt-4 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wide">Selected Seats</p>
                    <div className="flex flex-wrap gap-2">
                      {seats.map((seat, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-lg text-sm font-medium text-foreground"
                        >
                          {typeof seat === 'string' ? seat : seat.id}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price Breakdown - Visual */}
                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="text-foreground font-medium">₱{totalPrice}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span className="text-foreground font-medium">₱0</span>
                    </div>
                    <div className="pt-3 border-t-2 border-primary/20">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total</span>
                        <span className="text-2xl font-bold text-primary">₱{totalPrice}</span>
                      </div>
                    </div>
                  </div>

                  {/* Payment Button - Prominent */}
                  <Button
                    variant="gold"
                    className="w-full"
                    size="lg"
                    onClick={handlePayment}
                    disabled={isProcessing}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Processing...
                      </span>
                    ) : (
                      `Complete Payment • ₱${totalPrice}`
                    )}
                  </Button>
                  
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={() => navigate(-1)}
                  >
                    ← Back to Seats
                  </Button>
                  
                  <div className="flex items-center justify-center gap-2 pt-2">
                    <div className="w-1 h-1 bg-green-500 rounded-full" />
                    <p className="text-xs text-muted-foreground">
                      SSL Encrypted • Secure Payment
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Payment Form - Right Side */}
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-6">
            {/* Payment Method Selection - Creative Grid */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground mb-2">Choose Payment Method</h2>
                <p className="text-muted-foreground">Select how you'd like to pay</p>
              </div>
              
              <RadioGroup
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                <label
                  htmlFor="gcash"
                  className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "gcash"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <RadioGroupItem value="gcash" id="gcash" className="absolute top-4 right-4" />
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <span className="text-blue-500 font-bold text-lg">G</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">GCash</p>
                      <p className="text-xs text-muted-foreground">Mobile Wallet</p>
                    </div>
                  </div>
                </label>

                <label
                  htmlFor="paymaya"
                  className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "paymaya"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <RadioGroupItem value="paymaya" id="paymaya" className="absolute top-4 right-4" />
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <span className="text-purple-500 font-bold text-lg">P</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">PayMaya</p>
                      <p className="text-xs text-muted-foreground">Mobile Wallet</p>
                    </div>
                  </div>
                </label>

                <label
                  htmlFor="bank"
                  className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "bank_transfer"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <RadioGroupItem value="bank_transfer" id="bank" className="absolute top-4 right-4" />
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <span className="text-green-500 font-bold text-lg">₱</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Bank Transfer</p>
                      <p className="text-xs text-muted-foreground">Direct Transfer</p>
                    </div>
                  </div>
                </label>

                <label
                  htmlFor="credit"
                  className={`relative flex flex-col p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    paymentMethod === "credit_card"
                      ? "border-primary bg-primary/5 shadow-lg"
                      : "border-border hover:border-primary/50 hover:bg-muted/30"
                  }`}
                >
                  <RadioGroupItem value="credit_card" id="credit" className="absolute top-4 right-4" />
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                      <span className="text-amber-500 font-bold text-lg">💳</span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">Card</p>
                      <p className="text-xs text-muted-foreground">Visa, Mastercard, Amex</p>
                    </div>
                  </div>
                </label>
              </RadioGroup>
            </motion.div>

            {/* Payment Details Form - Only for Credit Card */}
            {paymentMethod === "credit_card" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card className="border-2">
                  <CardHeader>
                    <CardTitle>Card Information</CardTitle>
                    <CardDescription>
                      Enter your card details securely
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input
                        id="cardNumber"
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className="text-lg"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" maxLength={5} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" maxLength={3} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cardName">Cardholder Name</Label>
                      <Input id="cardName" placeholder="John Doe" />
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;


