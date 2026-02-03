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
  Star,
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
  const rating =
    typeof movie.vote_average === "number"
      ? movie.vote_average.toFixed(1)
      : "N/A";

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
        className="bg-gradient-to-br from-[#1a1d29] to-[#14181c] border-[#2a2e3a] shadow-xl flex flex-col w-full overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:shadow-[#00E054]/30 hover:scale-[1.05] hover:border-[#00E054]/50 cursor-pointer group focus-within:ring-2 focus-within:ring-[#00E054] rounded-xl"
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
          {/* Hover Overlay with gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center z-10">
            <div className="text-white text-center px-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <p className="text-sm font-bold mb-3 text-[#00E054]">Click for details</p>
              <div className="flex gap-3 justify-center">
                <div className="w-10 h-10 bg-[#00E054]/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#00E054]/50 hover:bg-[#00E054]/40 transition-all">
                  <Star className="w-5 h-5 text-[#00E054]" fill="#00E054" />
                </div>
                <div className="w-10 h-10 bg-[#00E054]/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-[#00E054]/50">
                  <span className="text-sm font-bold text-[#00E054]">{rating}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Shine effect on hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
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
              className={`w-full h-full object-cover transition-all duration-500 ${
                imageLoading ? "opacity-0 scale-110" : "opacity-100 scale-100 group-hover:scale-110"
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
        <CardContent className="p-2 sm:p-4 flex flex-col flex-1 min-h-0 bg-gradient-to-b from-[#1a1d29] to-[#14181c]">
          <h3 className="text-xs sm:text-sm font-bold text-center mb-1 sm:mb-2 leading-tight line-clamp-2 min-h-[2rem] sm:min-h-[2.5rem] text-white group-hover:text-[#00E054] transition-colors duration-300">
            {titleWithYear}
          </h3>
          <p className="hidden sm:block text-sm text-gray-400 line-clamp-3 mb-3 min-h-[3.75rem] leading-relaxed">
            {description}
          </p>
          <div className="mb-2 sm:mb-4 min-h-[1.5rem] flex justify-center">
            <StarRating
              rating={typeof movie.vote_average === "number" ? movie.vote_average : 0}
              size="sm"
            />
          </div>

          <div className="flex items-center justify-center gap-2 sm:gap-4 mt-auto min-h-[2rem] pt-2 border-t border-[#2a2e3a]">
            <TooltipProvider>
              {page === "discover" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {favorite ? (
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-red-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                          <Heart
                            className={`relative w-5 h-5 sm:w-6 sm:h-6 text-red-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300 ${!isAuthenticated ? 'opacity-50' : ''}`}
                            fill="currentColor"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromFavorites();
                            }}
                          />
                        </div>
                      ) : (
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-red-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                          <Heart
                            className={`relative w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-red-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300 ${!isAuthenticated ? 'opacity-50' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToFavorites();
                            }}
                          />
                        </div>
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
                      <p>{!isAuthenticated ? "Sign in to add favorites" : favorite ? "Remove from favorites" : "Add to favorites"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      {inWatchlist ? (
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                          <Bookmark
                            className={`relative w-5 h-5 sm:w-6 sm:h-6 text-blue-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300 ${!isAuthenticated ? 'opacity-50' : ''}`}
                            fill="currentColor"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWatchlist();
                            }}
                          />
                        </div>
                      ) : (
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                          <Bookmark
                            className={`relative w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-blue-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300 ${!isAuthenticated ? 'opacity-50' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToWatchlist();
                            }}
                          />
                        </div>
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
                      <p>{!isAuthenticated ? "Sign in to add to watchlist" : inWatchlist ? "Remove from watchlist" : "Add to watchlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {page === "favs" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-red-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                        <Heart
                          className="relative w-5 h-5 sm:w-6 sm:h-6 text-red-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300"
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFavorites();
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
                      <p>Remove from favorites</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      {inWatchlist ? (
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                          <Bookmark
                            className="relative w-5 h-5 sm:w-6 sm:h-6 text-blue-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300"
                            fill="currentColor"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoveFromWatchlist();
                            }}
                          />
                        </div>
                      ) : (
                        <div className="relative group/icon">
                          <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                          <Bookmark
                            className="relative w-5 h-5 sm:w-6 sm:h-6 text-gray-400 hover:text-blue-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddToWatchlist();
                            }}
                          />
                        </div>
                      )}
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
                      <p>{inWatchlist ? "Remove from watchlist" : "Add to watchlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {page === "watchlist" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                        <Bookmark
                          className="relative w-5 h-5 sm:w-6 sm:h-6 text-blue-500 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300"
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWatchlist();
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
                      <p>Remove from watchlist</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-[#00E054]/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                        <Eye
                          className="relative w-5 h-5 sm:w-6 sm:h-6 text-[#00E054] hover:text-[#00ff66] cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleWatched();
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
                      <p>Mark as watched</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {page === "watched" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-yellow-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                        <EyeOff
                          className="relative w-5 h-5 sm:w-6 sm:h-6 text-yellow-400 hover:text-yellow-300 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleUnwatch();
                          }}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
                      <p>Move to watchlist</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="relative group/icon">
                        <div className="absolute inset-0 bg-blue-500/30 blur-md rounded-full opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                        <BookOpen
                          className={`relative w-5 h-5 sm:w-6 sm:h-6 cursor-pointer transform group-hover/icon:scale-125 transition-all duration-300 ${
                            hasDiaryEntry
                              ? "text-blue-500 fill-blue-500"
                              : "text-gray-400 hover:text-blue-500"
                          }`}
                          onClick={handleDiaryClick}
                        />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent className="bg-[#1a1d29] border-[#00E054]/50 text-white">
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
