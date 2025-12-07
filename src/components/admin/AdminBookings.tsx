import { useState, useEffect } from "react";
import { adminService, AdminBooking } from "@/services/adminService";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Search, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AdminBookingsProps {
  onRefresh?: () => void;
}

const AdminBookings = ({ onRefresh }: AdminBookingsProps) => {
  const [bookings, setBookings] = useState<AdminBooking[]>([]);
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deleteBookingId, setDeleteBookingId] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [bookingsResponse, moviesResponse] = await Promise.all([
        adminService.getBookings(),
        apiService.getAllMovies(),
      ]);

      if (bookingsResponse.success && bookingsResponse.bookings) {
        setBookings(bookingsResponse.bookings);
      }

      if (moviesResponse.success && moviesResponse.movies) {
        setMovies(moviesResponse.movies);
      }
    } catch (error: any) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load bookings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: "pending" | "confirmed" | "cancelled") => {
    try {
      const response = await adminService.updateBookingStatus(bookingId, newStatus);
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking status updated successfully",
        });
        loadData();
        onRefresh?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update booking status",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!deleteBookingId) return;

    try {
      const response = await adminService.deleteBooking(deleteBookingId);
      if (response.success) {
        toast({
          title: "Success",
          description: "Booking deleted successfully",
        });
        setDeleteBookingId(null);
        loadData();
        onRefresh?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete booking",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
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

  const filteredBookings = bookings.filter((booking) => {
    const movie = movies.find((m) => m.id === booking.movieId);
    const matchesSearch =
      booking.bookingCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      movie?.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search bookings..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredBookings.map((booking, index) => {
            const movie = movies.find((m) => m.id === booking.movieId);
            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4 flex-1">
                        {movie && (
                          <img
                            src={movie.poster}
                            alt={movie.title}
                            className="w-20 h-28 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-foreground">
                              {movie?.title || "Unknown Movie"}
                            </h3>
                            <Badge className={getStatusColor(booking.status)}>
                              {booking.status}
                            </Badge>
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <p>
                              <span className="font-medium">Booking Code:</span> {booking.bookingCode}
                            </p>
                            <p>
                              <span className="font-medium">User ID:</span> {booking.userId}
                            </p>
                            <p>
                              <span className="font-medium">Seats:</span>{" "}
                              {Array.isArray(booking.seats)
                                ? booking.seats.map((s) => (typeof s === "string" ? s : s.id)).join(", ")
                                : "N/A"}
                            </p>
                            <p>
                              <span className="font-medium">Total:</span> ₱{booking.totalPrice}
                            </p>
                            {booking.paymentMethod && (
                              <p>
                                <span className="font-medium">Payment:</span> {booking.paymentMethod}
                              </p>
                            )}
                            <p>
                              <span className="font-medium">Date:</span>{" "}
                              {new Date(booking.createdAt).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={booking.status}
                          onValueChange={(value: "pending" | "confirmed" | "cancelled") =>
                            handleStatusChange(booking.id, value)
                          }
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="confirmed">Confirmed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeleteBookingId(booking.id)}
                          className="gap-2"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteBookingId !== null} onOpenChange={() => setDeleteBookingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Booking</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this booking? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminBookings;

