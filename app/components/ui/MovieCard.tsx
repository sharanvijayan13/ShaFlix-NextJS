"use client";

import React, { FC, useState } from "react";
import { useMovieContext } from "@/app/contexts/MovieContext";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Movie, Credits } from "@/app/types";
import { toast } from "sonner";
import MovieDialog from "@/app/components/ui/MovieDialog";
import DiaryDialog from "@/app/components/ui/DiaryDialog";
import {
  Heart,
  Bookmark,
  Eye,
  EyeOff,
  BookOpen,
} from "lucide-react";
import StarRating from "./StarRating";
import { getMovieCredits, getMovieVideos } from "@/app/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useAuthGuard } from "@/app/hooks/useAuthGuard";
import { AuthDialog } from "@/app/components/AuthDialog";
import { useApi } from "@/app/hooks/useApi";

interface MovieCardProps {
  movie: Movie;
  page: "discover" | "favs" | "watchlist" | "watched";
}

const MovieCard: FC<MovieCardProps> = React.memo(({ movie, page }) => {
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToWatched,
    removeFromWatched,
    getDiaryEntry,
  } = useMovieContext();

  // Auth guard hook for protecting actions
  const { guardAction, isAuthenticated, showAuthDialog, setShowAuthDialog } = useAuthGuard();
  
  // API hook for database operations
  const api = useApi();

  const diaryEntry = getDiaryEntry(movie.id);
  const hasDiaryEntry = !!diaryEntry;

  const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
  const titleWithYear = `${movie.title} (${year})`;
  const description = movie.overview || "No description available.";

  const favorite = isFavorite(movie.id);
  const inWatchlist = isInWatchlist(movie.id);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [credits, setCredits] = useState<Credits | null>(null);
  const [trailer, setTrailer] = useState<{ key: string; site: string; type: string; name: string } | null>(null);
  const [diaryDialogOpen, setDiaryDialogOpen] = useState(false);
  const [imageLoading, setImageLoading] = useState(movie.poster_path ? true : false);
  const [imageError, setImageError] = useState(!movie.poster_path);

  const handleOpenDialog = async () => {
    try {
      const [creditsData, videoData] = await Promise.all([
        getMovieCredits(movie.id),
        getMovieVideos(movie.id),
      ]);
      setCredits(creditsData);
      setTrailer(videoData);
      setDialogOpen(true);
    } catch {
      toast.error("Failed to fetch movie details");
    }
  };

  // Wrap all auth-required actions with guardAction
  // These will show toast and block execution if user is not authenticated
  const handleAddToFavorites = guardAction(async () => {
    addToFavorites(movie);
    toast.success("Added to favorites!", { icon: "✅" });
    
    // Save to database
    try {
      await api.toggleFavorite(movie, "add");
    } catch (error) {
      console.error("Failed to sync to database:", error);
    }
  }, "add to favorites");

  const handleRemoveFromFavorites = guardAction(async () => {
    removeFromFavorites(movie.id);
    toast("Removed from favorites", { icon: "❌" });
    
    // Remove from database
    try {
      await api.toggleFavorite(movie, "remove");
    } catch (error) {
      console.error("Failed to sync to database:", error);
    }
  }, "remove from favorites");

  const handleAddToWatchlist = guardAction(async () => {
    addToWatchlist(movie);
    toast.success("Added to watchlist!", { icon: "✅" });
    
    // Save to database
    try {
      await api.toggleWatchlist(movie, "add");
    } catch (error) {
      console.error("Failed to sync to database:", error);
    }
  }, "add to watchlist");

  const handleRemoveFromWatchlist = guardAction(async () => {
    removeFromWatchlist(movie.id);
    toast("Removed from watchlist", { icon: "❌" });
    
    // Remove from database
    try {
      await api.toggleWatchlist(movie, "remove");
    } catch (error) {
      console.error("Failed to sync to database:", error);
    }
  }, "remove from watchlist");

  const handleUnwatch = guardAction(async () => {
    removeFromWatched(movie.id);
    addToWatchlist(movie);
    toast("Moved back to watchlist", { icon: "🔙" });
    
    // Sync to database
    try {
      await api.toggleWatched(movie, "remove");
      await api.toggleWatchlist(movie, "add");
    } catch (error) {
      console.error("Failed to sync to database:", error);
    }
  }, "move to watchlist");

  const handleWatched = guardAction(async () => {
    addToWatched(movie);
    removeFromWatchlist(movie.id);
    toast.success("Marked as watched!", { icon: "✅" });
    
    // Sync to database
    try {
      await api.toggleWatched(movie, "add");
      await api.toggleWatchlist(movie, "remove");
    } catch (error) {
      console.error("Failed to sync to database:", error);
    }
  }, "mark as watched");

  const handleDiaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    guardAction(() => {
      setDiaryDialogOpen(true);
    }, "add diary entry")();
  };

  return (
    <>
      <Card
        className="bg-gradient-to-br from-[#1a1d29] to-[#14181c] border border-[#2a2e3a] shadow-lg flex flex-col w-full overflow-hidden transition-all duration-200 ease-in-out hover:border-[#00E054]/30 cursor-pointer group focus-within:ring-2 focus-within:ring-[#00E054] rounded-lg"
        onClick={handleOpenDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            handleOpenDialog();
          }
        }}
        aria-label={`View details for ${movie.title}`}
      >
        <div className="relative w-full aspect-[2/3] bg-gradient-to-b from-gray-800 to-gray-900 overflow-hidden">
          {/* Minimal hover overlay - just text */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center z-10">
            <p className="text-sm font-medium text-white/0 group-hover:text-white/90 transition-all duration-300">
              Click for details
            </p>
          </div>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-700 border-t-[#00E054] rounded-full animate-spin" />
                <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-b-[#00E054]/50 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }} />
              </div>
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500 bg-gradient-to-br from-gray-800 to-gray-900">
              <div className="relative mb-3">
                <div className="absolute inset-0 bg-[#00E054]/20 blur-xl rounded-full"></div>
                <svg
                  className="w-16 h-16 relative z-10"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <span className="text-sm font-medium">No Image</span>
            </div>
          ) : (
            <Image
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
              alt={movie.title}
              width={500}
              height={750}
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoading ? "opacity-0" : "opacity-100"
              }`}
              onLoad={() => setImageLoading(false)}
              onError={() => {
                setImageLoading(false);
                setImageError(true);
              }}
              loading="lazy"
            />
          )}
        </div>
        <CardContent className="p-3 sm:p-4 flex flex-col flex-1 min-h-0 bg-gradient-to-b from-[#1a1d29] to-[#14181c]">
          <h3 className="text-xs sm:text-sm font-semibold text-center mb-2 leading-snug line-clamp-2 min-h-[2.25rem] sm:min-h-[2.5rem] text-white transition-colors duration-200">
            {titleWithYear}
          </h3>
          <p className="hidden sm:block text-xs text-gray-400 line-clamp-3 mb-3 min-h-[3.5rem] leading-relaxed">
            {description}
          </p>
          <div className="mb-3 min-h-[1.25rem] flex justify-center">
            <StarRating
              rating={typeof movie.vote_average === "number" ? movie.vote_average : 0}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-center gap-3 sm:gap-4 mt-auto min-h-[2rem] pt-3 border-t border-[#2a2e3a]/50">
            <TooltipProvider>
              {page === "discover" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {favorite ? (
                        <Heart
                          className={`w-5 h-5 sm:w-6 sm:h-6 text-red-500 cursor-pointer transform hover:scale-110 transition-all duration-200 ${!isAuthenticated ? 'opacity-50' : ''}`}
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFavorites();
                          }}
                        />
                      ) : (
                        <Heart
                          className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-500 hover:text-red-500 cursor-pointer transform hover:scale-110 transition-all duration-200 ${!isAuthenticated ? 'opacity-50' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites();
                          }}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>{!isAuthenticated ? "Sign in to add favorites" : favorite ? "Remove from favorites" : "Add to favorites"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      {inWatchlist ? (
                        <Bookmark
                          className={`w-5 h-5 sm:w-6 sm:h-6 text-blue-500 cursor-pointer transform hover:scale-110 transition-all duration-200 ${!isAuthenticated ? 'opacity-50' : ''}`}
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWatchlist();
                          }}
                        />
                      ) : (
                        <Bookmark
                          className={`w-5 h-5 sm:w-6 sm:h-6 text-gray-500 hover:text-blue-500 cursor-pointer transform hover:scale-110 transition-all duration-200 ${!isAuthenticated ? 'opacity-50' : ''}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWatchlist();
                          }}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>{!isAuthenticated ? "Sign in to add to watchlist" : inWatchlist ? "Remove from watchlist" : "Add to watchlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {page === "favs" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Heart
                        className="w-5 h-5 sm:w-6 sm:h-6 text-red-500 cursor-pointer transform hover:scale-110 transition-all duration-200"
                        fill="currentColor"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>Remove from favorites</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      {inWatchlist ? (
                        <Bookmark
                          className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 cursor-pointer transform hover:scale-110 transition-all duration-200"
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWatchlist();
                          }}
                        />
                      ) : (
                        <Bookmark
                          className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 hover:text-blue-500 cursor-pointer transform hover:scale-110 transition-all duration-200"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWatchlist();
                          }}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>{inWatchlist ? "Remove from watchlist" : "Add to watchlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {page === "watchlist" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Bookmark
                        className="w-5 h-5 sm:w-6 sm:h-6 text-blue-500 cursor-pointer transform hover:scale-110 transition-all duration-200"
                        fill="currentColor"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWatchlist();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>Remove from watchlist</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Eye
                        className="w-5 h-5 sm:w-6 sm:h-6 text-[#00E054] hover:text-[#00ff66] cursor-pointer transform hover:scale-110 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWatched();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>Mark as watched</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {page === "watched" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <EyeOff
                        className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 hover:text-yellow-300 cursor-pointer transform hover:scale-110 transition-all duration-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnwatch();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>Move to watchlist</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BookOpen
                        className={`w-5 h-5 sm:w-6 sm:h-6 cursor-pointer transform hover:scale-110 transition-all duration-200 ${
                          hasDiaryEntry
                            ? "text-blue-500 fill-blue-500"
                            : "text-gray-500 hover:text-blue-500"
                        }`}
                        onClick={handleDiaryClick}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#2a2e3a] text-white text-xs">
                      <p>{hasDiaryEntry ? "Edit diary entry" : "Add diary entry"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <MovieDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        movie={movie}
        credits={credits}
        trailer={trailer}
      />

      <DiaryDialog
        open={diaryDialogOpen}
        onClose={() => setDiaryDialogOpen(false)}
        movie={movie}
        initialDiaryEntry={diaryEntry}
      />

      {/* Auth Dialog - triggered from auth guard toast action */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </>
  );
});

MovieCard.displayName = "MovieCard";

export default MovieCard;
