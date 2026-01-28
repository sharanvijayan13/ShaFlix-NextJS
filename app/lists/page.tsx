"use client";

import { useState, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Lock, Globe, Film, Search, X, Loader2, Home } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Movie } from "../types";
import { fetchMovies } from "../lib/api";
import Image from "next/image";

export default function ListsPage() {
  const { customLists, createList, updateList, deleteList } = useMovieContext();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingList, setEditingList] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isPublic: true,
    movieIds: [] as number[],
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Movie[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMovies, setSelectedMovies] = useState<Movie[]>([]);
  const [listPosters, setListPosters] = useState<Record<string, string[]>>({});

  // Fetch poster images for each list
  useEffect(() => {
    const fetchListPosters = async () => {
      const postersMap: Record<string, string[]> = {};
      
      for (const list of customLists) {
        if (list.movieIds.length > 0) {
          try {
            const posterPromises = list.movieIds.slice(0, 3).map(async (id) => {
              const response = await fetch(
                `https://api.themoviedb.org/3/movie/${id}?api_key=${process.env.NEXT_PUBLIC_TMDB_API_KEY}`
              );
              const data = await response.json();
              return data.poster_path ? `https://image.tmdb.org/t/p/w185${data.poster_path}` : null;
            });
            
            const posters = await Promise.all(posterPromises);
            postersMap[list.id] = posters.filter(p => p !== null) as string[];
          } catch (error) {
            console.error(`Error fetching posters for list ${list.id}:`, error);
          }
        }
      }
      
      setListPosters(postersMap);
    };

    if (customLists.length > 0) {
      fetchListPosters();
    }
  }, [customLists]);

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

  const handleCreate = () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    createList({
      name: formData.name,
      description: formData.description,
      movieIds: formData.movieIds,
      isPublic: formData.isPublic,
    });

    toast.success("List created!");
    setFormData({ name: "", description: "", isPublic: true, movieIds: [] });
    setSelectedMovies([]);
    setSearchQuery("");
    setShowCreateDialog(false);
  };

  const handleUpdate = () => {
    if (!editingList) return;

    updateList(editingList, {
      name: formData.name,
      description: formData.description,
      isPublic: formData.isPublic,
      movieIds: formData.movieIds,
    });

    toast.success("List updated!");
    setEditingList(null);
    setFormData({ name: "", description: "", isPublic: true, movieIds: [] });
    setSelectedMovies([]);
    setSearchQuery("");
  };

  const handleDelete = (listId: string) => {
    if (confirm("Are you sure you want to delete this list?")) {
      deleteList(listId);
      toast.success("List deleted");
    }
  };

  const openEditDialog = (listId: string) => {
    const list = customLists.find(l => l.id === listId);
    if (list) {
      setFormData({
        name: list.name,
        description: list.description,
        isPublic: list.isPublic,
        movieIds: list.movieIds,
      });
      setEditingList(listId);
    }
  };

  const handleAddMovie = (movie: Movie) => {
    if (formData.movieIds.includes(movie.id)) {
      toast.error("Movie already added");
      return;
    }

    setFormData({ ...formData, movieIds: [...formData.movieIds, movie.id] });
    setSelectedMovies([...selectedMovies, movie]);
    setSearchQuery("");
    setSearchResults([]);
  };

  const handleRemoveMovie = (movieId: number) => {
    setFormData({ ...formData, movieIds: formData.movieIds.filter(id => id !== movieId) });
    setSelectedMovies(selectedMovies.filter(m => m.id !== movieId));
  };

  return (
    <div className="min-h-screen bg-[#14181C] text-[#E5E7EB]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight mb-2">MY LISTS</h1>
            <p className="text-[#9CA3AF]">
              {customLists.length} {customLists.length === 1 ? 'list' : 'lists'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold transition-all duration-200"
            >
              <Plus className="w-4 h-4 md:mr-2" />
              <span className="hidden md:inline">CREATE NEW LIST</span>
            </Button>
            <Link href="/">
              <Button 
                variant="outline"
                className="border-[#2C3440] hover:border-[#00E054] hover:bg-[#00E054]/10 hover:text-[#00E054] transition-all duration-200"
              >
                <Home className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">BACK TO HOME</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Empty State */}
        {customLists.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-[#1F2428] border-2 border-[#2C3440] flex items-center justify-center mb-6">
              <Film className="w-12 h-12 text-[#6B7280]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">You haven't created any lists yet.</h2>
            <p className="text-[#9CA3AF] mb-8 text-center max-w-md">
              Lists are a great way to organize and share your favorite films.
            </p>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold px-8 py-6 text-base transition-all duration-200"
            >
              <Plus className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">CREATE YOUR FIRST LIST</span>
            </Button>
          </div>
        ) : (
          /* Lists Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {customLists.map((list) => (
              <Card 
                key={list.id} 
                className="bg-[#1F2428] border-[#2C3440] hover:border-[#00E054] transition-all duration-200 overflow-hidden group"
              >
                {/* Movie Posters Preview */}
                <div className="aspect-[16/9] bg-[#14181C] border-b border-[#2C3440] flex items-center justify-center relative overflow-hidden">
                  {list.movieIds.length > 0 && listPosters[list.id]?.length > 0 ? (
                    <div className="grid grid-cols-3 gap-1 w-full h-full p-2">
                      {listPosters[list.id].slice(0, 3).map((posterUrl, idx) => (
                        <div 
                          key={idx}
                          className="bg-[#2C3440] rounded overflow-hidden relative"
                        >
                          <Image
                            src={posterUrl}
                            alt={`Movie ${idx + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <Film className="w-16 h-16 text-[#6B7280]" />
                  )}
                  
                  {/* Hover Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEditDialog(list.id)}
                      className="bg-[#1F2428] hover:bg-[#2C3440] text-[#E5E7EB]"
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(list.id)}
                      className="bg-[#1F2428] hover:bg-[#EF4444] text-[#E5E7EB] hover:text-white"
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>

                {/* List Info */}
                <div className="p-5">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold tracking-tight line-clamp-1 flex-1">
                      {list.name}
                    </h3>
                    {list.isPublic ? (
                      <Globe className="w-4 h-4 text-[#00E054] flex-shrink-0 ml-2" />
                    ) : (
                      <Lock className="w-4 h-4 text-[#6B7280] flex-shrink-0 ml-2" />
                    )}
                  </div>

                  {list.description && (
                    <p className="text-sm text-[#9CA3AF] mb-4 line-clamp-2">
                      {list.description}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-[#6B7280] uppercase tracking-wide mb-4">
                    <span>{list.movieIds.length} FILMS</span>
                    <span>{new Date(list.updatedAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                  </div>

                  <Link href={`/lists/${list.id}`}>
                    <Button 
                      variant="outline" 
                      className="w-full border-[#2C3440] hover:border-[#00E054] hover:bg-[#00E054]/10 hover:text-[#00E054] transition-all duration-200"
                    >
                      VIEW LIST
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Create/Edit Dialog */}
        <Dialog
          open={showCreateDialog || editingList !== null}
          onOpenChange={(open) => {
            if (!open) {
              setShowCreateDialog(false);
              setEditingList(null);
              setFormData({ name: "", description: "", isPublic: true, movieIds: [] });
              setSelectedMovies([]);
              setSearchQuery("");
            }
          }}
        >
          <DialogContent className="bg-[#1F2428] border-[#2C3440] text-[#E5E7EB] max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">
                {editingList ? "EDIT LIST" : "CREATE NEW LIST"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-5 mt-4 flex-1 overflow-y-auto pr-2">
              <div>
                <label className="text-xs font-semibold mb-2 block uppercase tracking-wide text-[#9CA3AF]">
                  List Name
                </label>
                <Input
                  placeholder="e.g., My Favorite Thrillers"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB] h-12"
                />
              </div>

              <div>
                <label className="text-xs font-semibold mb-2 block uppercase tracking-wide text-[#9CA3AF]">
                  Description (Optional)
                </label>
                <Textarea
                  placeholder="What makes this list special?"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB] resize-none"
                />
              </div>

              {/* Add Movies Section */}
              <div>
                <label className="text-xs font-semibold mb-2 block uppercase tracking-wide text-[#9CA3AF]">
                  Add Movies
                </label>
                
                {/* Search Input */}
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6B7280]" />
                  <Input
                    placeholder="Search for movies to add..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB] pl-11 h-12"
                  />
                </div>

                {/* Search Results */}
                {searchQuery.trim().length >= 2 && (
                  <div className="mb-3 max-h-[200px] overflow-y-auto space-y-2 bg-[#14181C] rounded-lg border border-[#2C3440] p-2">
                    {searching ? (
                      <div className="flex justify-center py-4">
                        <Loader2 className="w-5 h-5 animate-spin text-[#00E054]" />
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.slice(0, 5).map((movie) => (
                        <div
                          key={movie.id}
                          className="flex items-center gap-3 p-2 bg-[#1F2428] rounded border border-[#2C3440] hover:border-[#00E054] transition-colors"
                        >
                          {movie.poster_path ? (
                            <Image
                              src={`https://image.tmdb.org/t/p/w92${movie.poster_path}`}
                              alt={movie.title}
                              width={40}
                              height={60}
                              className="rounded flex-shrink-0"
                            />
                          ) : (
                            <div className="w-[40px] h-[60px] bg-[#2C3440] rounded flex items-center justify-center text-xs text-[#6B7280] flex-shrink-0">
                              <Film className="w-4 h-4" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-sm line-clamp-1">{movie.title}</h4>
                            <p className="text-xs text-[#6B7280]">
                              {movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                            </p>
                          </div>

                          <Button
                            onClick={() => handleAddMovie(movie)}
                            disabled={formData.movieIds.includes(movie.id)}
                            className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold disabled:opacity-50 disabled:cursor-not-allowed h-8 text-xs flex-shrink-0"
                            size="sm"
                          >
                            {formData.movieIds.includes(movie.id) ? "Added" : "Add"}
                          </Button>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-[#6B7280] text-sm py-4">No movies found</p>
                    )}
                  </div>
                )}

                {/* Selected Movies */}
                {selectedMovies.length > 0 && (
                  <div>
                    <p className="text-xs text-[#9CA3AF] mb-2 uppercase tracking-wide">
                      Selected Movies ({selectedMovies.length})
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {selectedMovies.map((movie) => (
                        <div key={movie.id} className="relative group">
                          <div className="aspect-[2/3] rounded overflow-hidden bg-[#2C3440] border border-[#2C3440]">
                            {movie.poster_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w185${movie.poster_path}`}
                                alt={movie.title}
                                width={185}
                                height={278}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Film className="w-8 h-8 text-[#6B7280]" />
                              </div>
                            )}
                            
                            {/* Remove button */}
                            <button
                              onClick={() => handleRemoveMovie(movie.id)}
                              className="absolute top-1 right-1 bg-[#EF4444] hover:bg-[#DC2626] text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs mt-1 line-clamp-1">{movie.title}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Public checkbox - moved to last */}
              <div className="flex items-center gap-3 p-4 bg-[#14181C] rounded-lg border border-[#2C3440]">
                <input
                  type="checkbox"
                  id="public"
                  checked={formData.isPublic}
                  onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                  className="w-5 h-5 accent-[#00E054] flex-shrink-0"
                />
                <label htmlFor="public" className="text-sm flex-1 cursor-pointer">
                  <span className="font-semibold block">Make this list public</span>
                  <p className="text-xs text-[#9CA3AF] mt-0.5">
                    Public lists can be viewed by anyone
                  </p>
                </label>
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t border-[#2C3440] mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateDialog(false);
                  setEditingList(null);
                  setFormData({ name: "", description: "", isPublic: true, movieIds: [] });
                  setSelectedMovies([]);
                  setSearchQuery("");
                }}
                className="border-[#2C3440] hover:border-[#6B7280] hover:bg-transparent"
              >
                CANCEL
              </Button>
              <Button 
                onClick={editingList ? handleUpdate : handleCreate}
                className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold"
              >
                {editingList ? "UPDATE" : "CREATE"} LIST
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
