import { Movie, ViewingRoom, Showtime, Seat } from "@/types/cinema";
import { Button } from "@/components/ui/button";
import { X, Ticket, Clock, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BookingSummaryProps {
  movie: Movie | null;
  room: ViewingRoom | null;
  showtime: Showtime | null;
  seats: Seat[];
  onRemoveSeat: (seat: Seat) => void;
  onProceed: () => void;
  onClear: () => void;
}

export const BookingSummary = ({
  movie,
  room,
  showtime,
  seats,
  onRemoveSeat,
  onProceed,
  onClear,
}: BookingSummaryProps) => {
  const subtotal = seats.reduce((sum, seat) => sum + seat.price, 0);
  const serviceFee = seats.length > 0 ? 50 : 0;
  const total = subtotal + serviceFee;

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-card border border-border rounded-2xl p-6 sticky top-24"
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-display text-xl font-semibold text-foreground">
          Booking Summary
        </h3>
        {seats.length > 0 && (
          <button
            onClick={onClear}
            className="text-sm text-muted-foreground hover:text-destructive transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {movie ? (
        <>
          {/* Movie Info */}
          <div className="flex gap-4 mb-6">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-20 h-28 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h4 className="font-display font-semibold text-foreground line-clamp-2">
                {movie.title}
              </h4>
              {room && (
                <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{room.name}</span>
                </div>
              )}
              {showtime && (
                <div className="flex items-center gap-1 mt-1 text-sm text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{formatTime(showtime.startTime)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Selected Seats */}
          {seats.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                Selected Seats ({seats.length})
              </h4>
              <div className="space-y-2">
                <AnimatePresence>
                  {seats.map((seat) => (
                    <motion.div
                      key={seat.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Ticket className="w-4 h-4 text-primary" />
                        <span className="font-medium text-foreground">
                          Seat {seat.id}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-background text-muted-foreground capitalize">
                          {seat.type}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-foreground">₱{seat.price}</span>
                        <button
                          onClick={() => onRemoveSeat(seat)}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          )}

          {/* Price Breakdown */}
          {seats.length > 0 && (
            <div className="border-t border-border pt-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">₱{subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Service Fee</span>
                <span className="text-foreground">₱{serviceFee}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold border-t border-border pt-3">
                <span className="text-foreground">Total</span>
                <span className="text-primary">₱{total.toLocaleString()}</span>
              </div>
            </div>
          )}

          {/* Proceed Button */}
          <Button
            variant="gold"
            size="lg"
            className="w-full"
            disabled={seats.length === 0}
            onClick={onProceed}
          >
            {seats.length === 0
              ? "Select Seats to Continue"
              : `Proceed to Payment - ₱${total.toLocaleString()}`}
          </Button>
        </>
      ) : (
        <div className="text-center py-8">
          <Ticket className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Select a movie to start booking</p>
        </div>
      )}
    </motion.div>
  );
};
