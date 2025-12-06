import { useState, useMemo } from "react";
import { Seat, SeatStatus, ViewingRoom } from "@/types/cinema";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface SeatMapProps {
  room: ViewingRoom;
  selectedSeats: Seat[];
  onSeatSelect: (seat: Seat) => void;
  occupiedSeats?: string[];
  maxSeats?: number;
}

export const SeatMap = ({
  room,
  selectedSeats,
  onSeatSelect,
  occupiedSeats = [],
  maxSeats = 10,
}: SeatMapProps) => {
  const seats = useMemo(() => {
    const seatMap: Seat[][] = [];
    const rowLabels = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
    
    for (let row = 0; row < room.rows; row++) {
      const rowSeats: Seat[] = [];
      const rowLabel = rowLabels[row];
      
      for (let seatNum = 1; seatNum <= room.seatsPerRow; seatNum++) {
        const seatId = `${rowLabel}${seatNum}`;
        const isOccupied = occupiedSeats.includes(seatId);
        const isSelected = selectedSeats.some((s) => s.id === seatId);
        
        // Determine seat type based on position and room type
        let seatType: Seat["type"] = "standard";
        let seatPrice = 250;
        
        if (room.type === "vip") {
          seatType = "vip";
          seatPrice = 625;
        } else if (room.type === "premium") {
          if (row < 2) {
            seatType = "premium";
            seatPrice = 450;
          } else {
            seatPrice = 400;
          }
        } else if (room.type === "3d") {
          seatPrice = 325;
        }
        
        // Make middle seats slightly premium in basic rooms
        if (room.type === "basic" && row >= 3 && row <= 5 && seatNum >= 4 && seatNum <= 9) {
          seatType = "premium";
          seatPrice = 300;
        }
        
        rowSeats.push({
          id: seatId,
          row: rowLabel,
          number: seatNum,
          status: isOccupied ? "occupied" : isSelected ? "selected" : "available",
          type: seatType,
          price: seatPrice,
        });
      }
      seatMap.push(rowSeats);
    }
    return seatMap;
  }, [room, selectedSeats, occupiedSeats]);

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === "occupied") return;
    if (seat.status === "available" && selectedSeats.length >= maxSeats) return;
    onSeatSelect(seat);
  };

  const getSeatStyles = (seat: Seat) => {
    const baseStyles = "w-7 h-7 md:w-8 md:h-8 rounded-t-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-xs font-medium";
    
    if (seat.status === "occupied") {
      return cn(baseStyles, "bg-seat-occupied cursor-not-allowed opacity-50");
    }
    
    if (seat.status === "selected") {
      return cn(baseStyles, "bg-seat-selected text-primary-foreground shadow-lg scale-110");
    }
    
    // Available seats by type
    switch (seat.type) {
      case "vip":
        return cn(baseStyles, "bg-seat-vip/30 border border-seat-vip hover:bg-seat-vip hover:scale-105");
      case "premium":
        return cn(baseStyles, "bg-seat-premium/30 border border-seat-premium hover:bg-seat-premium hover:scale-105");
      default:
        return cn(baseStyles, "bg-seat-available hover:bg-muted-foreground/50 hover:scale-105");
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Screen */}
      <div className="relative mb-12">
        <div className="h-3 bg-gradient-screen rounded-b-[100%] screen-glow" />
        <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-sm text-muted-foreground font-medium tracking-widest">
          SCREEN
        </div>
      </div>

      {/* Seats Grid */}
      <div className="flex flex-col gap-2 items-center px-4">
        {seats.map((row, rowIndex) => (
          <motion.div
            key={rowIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: rowIndex * 0.05 }}
            className="flex items-center gap-2"
          >
            {/* Row Label */}
            <span className="w-6 text-center text-sm font-medium text-muted-foreground">
              {row[0]?.row}
            </span>
            
            {/* Left Aisle */}
            <div className="flex gap-1">
              {row.slice(0, Math.floor(room.seatsPerRow / 3)).map((seat) => (
                <motion.button
                  key={seat.id}
                  whileHover={seat.status !== "occupied" ? { scale: 1.1 } : {}}
                  whileTap={seat.status !== "occupied" ? { scale: 0.95 } : {}}
                  onClick={() => handleSeatClick(seat)}
                  className={getSeatStyles(seat)}
                  title={`${seat.id} - ₱${seat.price}`}
                >
                  {seat.number}
                </motion.button>
              ))}
            </div>
            
            {/* Gap for aisle */}
            <div className="w-4" />
            
            {/* Center Section */}
            <div className="flex gap-1">
              {row.slice(Math.floor(room.seatsPerRow / 3), Math.floor(room.seatsPerRow * 2 / 3)).map((seat) => (
                <motion.button
                  key={seat.id}
                  whileHover={seat.status !== "occupied" ? { scale: 1.1 } : {}}
                  whileTap={seat.status !== "occupied" ? { scale: 0.95 } : {}}
                  onClick={() => handleSeatClick(seat)}
                  className={getSeatStyles(seat)}
                  title={`${seat.id} - ₱${seat.price}`}
                >
                  {seat.number}
                </motion.button>
              ))}
            </div>
            
            {/* Gap for aisle */}
            <div className="w-4" />
            
            {/* Right Section */}
            <div className="flex gap-1">
              {row.slice(Math.floor(room.seatsPerRow * 2 / 3)).map((seat) => (
                <motion.button
                  key={seat.id}
                  whileHover={seat.status !== "occupied" ? { scale: 1.1 } : {}}
                  whileTap={seat.status !== "occupied" ? { scale: 0.95 } : {}}
                  onClick={() => handleSeatClick(seat)}
                  className={getSeatStyles(seat)}
                  title={`${seat.id} - ₱${seat.price}`}
                >
                  {seat.number}
                </motion.button>
              ))}
            </div>
            
            {/* Row Label (right) */}
            <span className="w-6 text-center text-sm font-medium text-muted-foreground">
              {row[0]?.row}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-6 mt-10 px-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-seat-available" />
          <span className="text-sm text-muted-foreground">Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-seat-selected" />
          <span className="text-sm text-muted-foreground">Selected</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-t-lg bg-seat-occupied opacity-50" />
          <span className="text-sm text-muted-foreground">Occupied</span>
        </div>
        {room.type !== "basic" && (
          <>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-t-lg bg-seat-premium/30 border border-seat-premium" />
              <span className="text-sm text-muted-foreground">Premium</span>
            </div>
          </>
        )}
        {room.type === "vip" && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-t-lg bg-seat-vip/30 border border-seat-vip" />
            <span className="text-sm text-muted-foreground">VIP</span>
          </div>
        )}
      </div>
    </div>
  );
};
