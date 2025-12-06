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
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-500/20 mb-6">
            </div>
            <h1 className="font-display text-4xl font-bold text-foreground mb-4">
              Payment Successful!
            </h1>
            <p className="text-muted-foreground text-lg mb-8">
              Your booking has been confirmed. You will receive a confirmation
              email shortly.
            </p>
            <div className="bg-card border border-border rounded-2xl p-6 mb-8">
              <p className="text-sm text-muted-foreground mb-2">Booking Code</p>
              <p className="font-mono text-2xl font-bold text-foreground mb-6">
                {savedBooking?.bookingCode || `CMX-2024-${Math.floor(Math.random() * 10000)}`}
              </p>
              <div className="flex gap-4 justify-center">
                <Button variant="outline" asChild>
                  <a href="/my-tickets">View Tickets</a>
                </Button>
                <Button variant="gold" asChild>
                  <a href="/">Back to Home</a>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    );
  }

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
              Complete Payment
            </h1>
            <p className="text-muted-foreground text-lg">
              Secure payment processing powered by trusted providers
            </p>
          </motion.div>
        </div>
      </section>

      {/* Payment Content */}
      <main className="container mx-auto px-6 py-12 max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Method</CardTitle>
                <CardDescription>
                  Choose your preferred payment method
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-4"
                >
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="gcash" id="gcash" />
                    <Label
                      htmlFor="gcash"
                      className="flex-1 flex items-center gap-3 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-foreground">GCash</p>
                        <p className="text-sm text-muted-foreground">
                          Pay using your GCash wallet
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="paymaya" id="paymaya" />
                    <Label
                      htmlFor="paymaya"
                      className="flex-1 flex items-center gap-3 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-foreground">PayMaya</p>
                        <p className="text-sm text-muted-foreground">
                          Pay using your PayMaya account
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="bank_transfer" id="bank" />
                    <Label
                      htmlFor="bank"
                      className="flex-1 flex items-center gap-3 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          Bank Transfer
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Direct bank transfer
                        </p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2 p-4 border border-border rounded-lg hover:bg-muted/50 cursor-pointer">
                    <RadioGroupItem value="credit_card" id="credit" />
                    <Label
                      htmlFor="credit"
                      className="flex-1 flex items-center gap-3 cursor-pointer"
                    >
                      <div>
                        <p className="font-medium text-foreground">
                          Credit/Debit Card
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Visa, Mastercard, or Amex
                        </p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Details Form */}
            {paymentMethod === "credit_card" && (
              <Card>
                <CardHeader>
                  <CardTitle>Card Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="cardNumber">Card Number</Label>
                    <Input
                      id="cardNumber"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
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
            )}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-4">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-20 h-28 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground mb-1">
                      {movie.title}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {seats.length} seat{seats.length !== 1 ? "s" : ""}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Seats: {seats.map(s => typeof s === 'string' ? s : s.id).join(", ")}
                    </p>
                  </div>
                </div>
                <div className="space-y-2 pt-4 border-t border-border">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-foreground">₱{totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="text-foreground">₱0</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                    <span className="text-foreground">Total</span>
                    <span className="text-foreground">₱{totalPrice}</span>
                  </div>
                </div>
                <Button
                  variant="gold"
                  className="w-full"
                  size="lg"
                  onClick={handlePayment}
                  disabled={isProcessing}
                >
                  {isProcessing ? "Processing..." : `Pay ₱${totalPrice}`}
                </Button>
                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => navigate(-1)}
                >
                  Back
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Secure payment encrypted
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Payment;


