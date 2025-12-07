import { useState, useEffect } from "react";
import { adminService } from "@/services/adminService";
import { apiService } from "@/services/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/hooks/use-toast";
import { Movie } from "@/types/cinema";
import { motion } from "framer-motion";
import { Trash2, Edit, Plus, Search } from "lucide-react";

interface AdminMoviesProps {
  onRefresh?: () => void;
}

const AdminMovies = ({ onRefresh }: AdminMoviesProps) => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [formData, setFormData] = useState({
    id: "",
    title: "",
    poster: "",
    backdrop: "",
    synopsis: "",
    duration: 120,
    rating: 0,
    genre: [] as string[],
    releaseDate: "",
    director: "",
    cast: [] as string[],
    isNowShowing: false,
    isComingSoon: false,
    isFeatured: false,
  });

  useEffect(() => {
    loadMovies();
  }, []);

  const loadMovies = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllMovies();
      if (response.success && response.movies) {
        setMovies(response.movies);
      }
    } catch (error: any) {
      console.error("Error loading movies:", error);
      toast({
        title: "Error",
        description: "Failed to load movies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingMovie(null);
    setFormData({
      id: Date.now().toString(),
      title: "",
      poster: "",
      backdrop: "",
      synopsis: "",
      duration: 120,
      rating: 0,
      genre: [],
      releaseDate: new Date().toISOString().split("T")[0],
      director: "",
      cast: [],
      isNowShowing: false,
      isComingSoon: false,
      isFeatured: false,
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (movie: Movie) => {
    setEditingMovie(movie);
    setFormData({
      id: movie.id,
      title: movie.title,
      poster: movie.poster,
      backdrop: movie.backdrop || "",
      synopsis: movie.synopsis,
      duration: movie.duration,
      rating: movie.rating,
      genre: movie.genre,
      releaseDate: movie.releaseDate,
      director: movie.director,
      cast: movie.cast,
      isNowShowing: movie.isNowShowing,
      isComingSoon: movie.isComingSoon,
      isFeatured: movie.isFeatured || false,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this movie?")) return;

    try {
      const response = await adminService.deleteMovie(id);
      if (response.success) {
        toast({
          title: "Success",
          description: "Movie deleted successfully",
        });
        loadMovies();
        onRefresh?.();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete movie",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingMovie) {
        const response = await adminService.updateMovie(formData.id, formData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Movie updated successfully",
          });
          setIsDialogOpen(false);
          loadMovies();
          onRefresh?.();
        }
      } else {
        const response = await adminService.createMovie(formData);
        if (response.success) {
          toast({
            title: "Success",
            description: "Movie created successfully",
          });
          setIsDialogOpen(false);
          loadMovies();
          onRefresh?.();
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save movie",
        variant: "destructive",
      });
    }
  };

  const filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex-1 max-w-sm">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Button onClick={handleCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Movie
        </Button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading movies...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMovies.map((movie, index) => (
            <motion.div
              key={movie.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-full h-64 object-cover rounded-t-lg"
                  />
                  <div className="absolute top-2 right-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => handleEdit(movie)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(movie.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="line-clamp-1">{movie.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="text-muted-foreground line-clamp-2">{movie.synopsis}</p>
                    <div className="flex items-center gap-4">
                      <span>⭐ {movie.rating}</span>
                      <span>{movie.duration} min</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {movie.genre.slice(0, 3).map((g) => (
                        <span
                          key={g}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMovie ? "Edit Movie" : "Create New Movie"}</DialogTitle>
            <DialogDescription>
              {editingMovie ? "Update movie information" : "Add a new movie to the system"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="id">Movie ID</Label>
                <Input
                  id="id"
                  value={formData.id}
                  onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="poster">Poster URL</Label>
              <Input
                id="poster"
                value={formData.poster}
                onChange={(e) => setFormData({ ...formData, poster: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backdrop">Backdrop URL</Label>
              <Input
                id="backdrop"
                value={formData.backdrop}
                onChange={(e) => setFormData({ ...formData, backdrop: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="synopsis">Synopsis</Label>
              <Textarea
                id="synopsis"
                value={formData.synopsis}
                onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Rating</Label>
                <Input
                  id="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="releaseDate">Release Date</Label>
                <Input
                  id="releaseDate"
                  type="date"
                  value={formData.releaseDate}
                  onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="director">Director</Label>
              <Input
                id="director"
                value={formData.director}
                onChange={(e) => setFormData({ ...formData, director: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="genre">Genre (comma-separated)</Label>
              <Input
                id="genre"
                value={formData.genre.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    genre: e.target.value.split(",").map((g) => g.trim()).filter(Boolean),
                  })
                }
                placeholder="Action, Drama, Comedy"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cast">Cast (comma-separated)</Label>
              <Input
                id="cast"
                value={formData.cast.join(", ")}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    cast: e.target.value.split(",").map((c) => c.trim()).filter(Boolean),
                  })
                }
                placeholder="Actor 1, Actor 2, Actor 3"
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isNowShowing">Now Showing</Label>
                <Switch
                  id="isNowShowing"
                  checked={formData.isNowShowing}
                  onCheckedChange={(checked) => setFormData({ ...formData, isNowShowing: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isComingSoon">Coming Soon</Label>
                <Switch
                  id="isComingSoon"
                  checked={formData.isComingSoon}
                  onCheckedChange={(checked) => setFormData({ ...formData, isComingSoon: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="isFeatured">Featured</Label>
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData({ ...formData, isFeatured: checked })}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">{editingMovie ? "Update" : "Create"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminMovies;

