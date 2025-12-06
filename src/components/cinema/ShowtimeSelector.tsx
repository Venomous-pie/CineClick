import { Showtime } from "@/types/cinema";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Clock, Users } from "lucide-react";

interface ShowtimeSelectorProps {
  showtimes: Showtime[];
  selectedShowtime: Showtime | null;
  onShowtimeSelect: (showtime: Showtime) => void;
}

export const ShowtimeSelector = ({
  showtimes,
  selectedShowtime,
  onShowtimeSelect,
}: ShowtimeSelectorProps) => {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getAvailabilityStatus = (seats: number) => {
    if (seats <= 10) return { text: "Almost Full", color: "text-destructive" };
    if (seats <= 30) return { text: "Filling Fast", color: "text-amber-400" };
    return { text: "Available", color: "text-success" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-5 h-5 text-primary" />
        <h3 className="font-display text-lg font-semibold text-foreground">
          Select Showtime
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {showtimes.map((showtime, index) => {
          const isSelected = selectedShowtime?.id === showtime.id;
          const availability = getAvailabilityStatus(showtime.availableSeats);

          return (
            <motion.button
              key={showtime.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              onClick={() => onShowtimeSelect(showtime)}
              disabled={showtime.availableSeats === 0}
              className={cn(
                "relative p-4 rounded-xl border-2 text-center transition-all duration-300",
                isSelected
                  ? "border-primary bg-primary/10 shadow-lg"
                  : "border-border bg-card hover:border-muted-foreground/50 hover:bg-card-elevated",
                showtime.availableSeats === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              {/* Time */}
              <div className="text-xl font-bold text-foreground mb-1">
                {formatTime(showtime.startTime)}
              </div>

              {/* Price */}
              <div className="text-sm text-muted-foreground mb-2">
                ₱{showtime.price}
              </div>

              {/* Availability */}
              <div className="flex items-center justify-center gap-1">
                <Users className="w-3 h-3 text-muted-foreground" />
                <span className={cn("text-xs font-medium", availability.color)}>
                  {showtime.availableSeats} seats
                </span>
              </div>

              {/* Selected Indicator */}
              {isSelected && (
                <motion.div
                  layoutId="showtime-indicator"
                  className="absolute inset-0 rounded-xl border-2 border-primary"
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
