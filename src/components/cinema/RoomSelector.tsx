import { ViewingRoom, RoomType } from "@/types/cinema";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface RoomSelectorProps {
  rooms: ViewingRoom[];
  selectedRoom: ViewingRoom | null;
  onRoomSelect: (room: ViewingRoom) => void;
  basePrice: number;
}

const getRoomIcon = (type: RoomType) => {
  // lucide-react icon logic removed. Update as needed for alternative icons.
  return null;
};

const getRoomGradient = (type: RoomType) => {
  switch (type) {
    case "vip":
      return "from-amber-500/20 via-yellow-500/10 to-transparent border-amber-500/50";
    case "premium":
      return "from-purple-500/20 via-violet-500/10 to-transparent border-purple-500/50";
    case "3d":
      return "from-blue-500/20 via-cyan-500/10 to-transparent border-blue-500/50";
    default:
      return "from-muted/50 via-muted/20 to-transparent border-border";
  }
};

export const RoomSelector = ({
  rooms,
  selectedRoom,
  onRoomSelect,
  basePrice,
}: RoomSelectorProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {rooms.map((room, index) => {
        const Icon = getRoomIcon(room.type);
        const isSelected = selectedRoom?.id === room.id;
        const price = Math.round(basePrice * room.priceMultiplier);

        return (
          <motion.button
            key={room.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onRoomSelect(room)}
            className={cn(
              "relative p-6 rounded-xl border-2 text-left transition-all duration-300",
              "bg-gradient-to-br",
              getRoomGradient(room.type),
              isSelected
                ? "border-primary shadow-lg ring-2 ring-primary/20"
                : "hover:border-muted-foreground/50 hover:shadow-md"
            )}
          >
            {/* Selected Indicator */}

            {/* Room Type Badge */}
            <div className={cn(
              "inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4",
              room.type === "vip" && "bg-amber-500/20 text-amber-400",
              room.type === "premium" && "bg-purple-500/20 text-purple-400",
              room.type === "3d" && "bg-blue-500/20 text-blue-400",
              room.type === "basic" && "bg-muted text-muted-foreground"
            )}>
              {room.type.toUpperCase()}
            </div>

            {/* Room Name */}
            <h3 className="font-display text-xl font-semibold text-foreground mb-2">
              {room.name}
            </h3>

            {/* Description */}
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
              {room.description}
            </p>

            {/* Amenities */}
            <div className="flex flex-wrap gap-2 mb-4">
              {room.amenities.slice(0, 3).map((amenity) => (
                <span
                  key={amenity}
                  className="px-2 py-0.5 text-xs bg-background/50 text-muted-foreground rounded-full"
                >
                  {amenity}
                </span>
              ))}
              {room.amenities.length > 3 && (
                <span className="px-2 py-0.5 text-xs bg-background/50 text-muted-foreground rounded-full">
                  +{room.amenities.length - 3} more
                </span>
              )}
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-foreground">₱{price}</span>
              <span className="text-sm text-muted-foreground">per seat</span>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};
