"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useMovieContext } from "@/app/contexts/MovieContext";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Search, X, Loader2, GripVertical } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Movie } from "@/app/types";
import { fetchMovies } from "@/app/lib/api";
import Image from "next/image";

export default function ListDetailPage() {
  const params = useParams();
  const router = useRouter();
  const listId = params.id as string;
  
  const { customLists, addMovieToList, removeMovieFromList, reorderListMovies } = useMovieContext();
  const [list, setList] = useState(customLists.find(l => l.id === listId));
  const [movies, setMovies] = useState<Movie[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingMovies, setLoadingMovies] = useState(true);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  // Update list when context changes
  useEffect(() => {
    const updatedList = customLists.find(l => l.id === listId);
    setList(updatedList);
  }, [customLists, listId]);

  // Fetch movie details for the list
  useEffect(() => {
    const fetchListMovies = async () => {
      if (!list || list.movieIds.length === 0) {
        setLoadingMovies(false);
        return;
      }

      try {
        const moviePromises = list.movieIds.map(async (id) => {
          const response = await fetch(
            `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
          );
          return response.json();
        });

        const fetchedMovies = await Promise.all(moviePromises);
        setMovies(fetchedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
        toast.error("Failed to load movies");
      } finally {
        setLoadingMovies(false);
      }
    };

    fetchListMovies();
  }, [list]);

  // Search movies
  useEffect(() => {
    const searchMovies = async () => {
      if (searchQuery.trim().length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        const { results } = await fetchMovies("popular", 1, searchQuery);
        setSearchResults(results);
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setSearching(false);
      }
    };

    const debounce = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleAddMovie = (movie: Movie) => {
    if (list?.movieIds.includes(movie.id)) {
      toast.error("Movie already in list");
      return;
    }

    addMovieToList(listId, movie.id);
    toast.success(`Added ${movie.title} to list`);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMovie = (movieId: number) => {
    removeMovieFromList(listId, movieId);
    toast.success("Movie removed from list");
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newMovies = [...movies];
    const draggedMovie = newMovies[draggedIndex];
    newMovies.splice(draggedIndex, 1);
    newMovies.splice(index, 0, draggedMovie);

    setMovies(newMovies);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    if (draggedIndex !== null && list) {
      const newMovieIds = movies.map(m => m.id);
      reorderListMovies(listId, newMovieIds);
      toast.success("List reordered");
    }
    setDraggedIndex(null);
  };

  if (!list) {
    return (
      <div className="min-h-screen bg-[#14181C] text-[#E5E7EB] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">List not found</h1>
          <Link href="/lists">
            <Button className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C]">
              Back to Lists
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#14181C] text-[#E5E7EB]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/lists">
            <Button 
              variant="ghost" 
              className="mb-4 text-[#9CA3AF] hover:text-[#00E054] hover:bg-transparent p-0"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </Link>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-4xl font-bold tracking-tight mb-2">{list.name}</h1>
              {list.description && (
                <p className="text-[#9CA3AF] text-lg mb-4">{list.description}</p>
              )}
              <p className="text-[#6B7280] text-sm uppercase tracking-wide">
                {list.movieIds.length} {list.movieIds.length === 1 ? 'FILM' : 'FILMS'}
              </p>
            </div>

            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">ADD MOVIES</span>
            </Button>
          </div>
        </div>

        {/* Movies Grid */}
        {loadingMovies ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-[#00E054]" />
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#9CA3AF] mb-6">No movies in this list yet.</p>
            <Button 
              onClick={() => setShowAddDialog(true)}
              className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">ADD YOUR FIRST MOVIE</span>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
            {movies.map((movie, index) => (
              <div 
                key={movie.id} 
                className="group relative cursor-move"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
              >
                {/* Drag handle */}
                <div className="absolute top-2 left-2 z-10 bg-black/70 rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <GripVertical className="w-4 h-4 text-white" />
                </div>

                {/* Remove button - just cross icon */}
                <button
                  onClick={() => handleRemoveMovie(movie.id)}
                  className="absolute top-2 right-2 z-10 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg hover:scale-110 transition-transform"
                >
                  <X className="w-5 h-5 stroke-[2]" />
                </button>

                <div className="relative aspect-[2/3] overflow-hidden bg-[#1F2428] border border-[#2C3440] group-hover:border-[#00E054] transition-colors">
                  {movie.poster_path ? (
                    <Image
                      src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                      alt={movie.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[#6B7280]">
                      No Poster
                    </div>
                  )}
                </div>
                
                <h3 className="mt-2 text-sm font-medium line-clamp-2">{movie.title}</h3>
                <p className="text-xs text-[#6B7280]">
                  {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Add Movies Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent className="bg-[#1F2428] border-[#2C3440] text-[#E5E7EB] max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">ADD MOVIES TO LIST</DialogTitle>
            </DialogHeader>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                <Input
                  placeholder="Search for movies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB] pl-10"
                />
              </div>

              {/* Search Results */}
              <div className="flex-1 overflow-y-auto space-y-2">
                {searching ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-[#00E054]" />
                  </div>
                ) : searchResults.length > 0 ? (
                  searchResults.map((movie) => (
                    <div
                      key={movie.id}
                      className="flex items-center gap-3 p-3 bg-[#14181C] rounded-lg border border-[#2C3440] hover:border-[#00E054] transition-colors"
                    >
                      {movie.poster_path ? (
                        <Image
                          src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                          alt={movie.title}
                          width={50}
                          height={75}
                          className="rounded"
                        />
                      ) : (
                        <div className="w-[50px] h-[75px] bg-[#2C3440] rounded flex items-center justify-center text-xs text-[#6B7280]">
                          No Image
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold line-clamp-1">{movie.title}</h4>
                        <p className="text-sm text-[#6B7280]">
                          {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </p>
                      </div>

                      <Button
                        onClick={() => handleAddMovie(movie)}
                        disabled={list.movieIds.includes(movie.id)}
                        className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                        size="sm"
                      >
                        {list.movieIds.includes(movie.id) ? "Added" : "Add"}
                      </Button>
                    </div>
                  ))
                ) : searchQuery.trim().length >= 2 ? (
                  <p className="text-center text-[#6B7280] py-8">No movies found</p>
                ) : (
                  <p className="text-center text-[#6B7280] py-8">
                    Start typing to search for movies
                  </p>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
