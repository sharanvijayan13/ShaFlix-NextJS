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
    saveDiaryEntry,
    getDiaryEntry,
    hasDiaryEntry,
  } = useMovieContext();

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
  const [trailer, setTrailer] = useState<any>(null);
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

  const handleAddToFavorites = () => {
    addToFavorites(movie);
    toast.success("Added to favorites!", { icon: "✅" });
  };
  const handleRemoveFromFavorites = () => {
    removeFromFavorites(movie.id);
    toast("Removed from favorites", { icon: "❌" });
  };
  const handleAddToWatchlist = () => {
    addToWatchlist(movie);
    toast.success("Added to watchlist!", { icon: "✅" });
  };
  const handleRemoveFromWatchlist = () => {
    removeFromWatchlist(movie.id);
    toast("Removed from watchlist", { icon: "❌" });
  };
  const handleUnwatch = () => {
    removeFromWatched(movie.id);
    addToWatchlist(movie);
    toast("Moved back to watchlist", { icon: "🔙" });
  };
  const handleWatched = () => {
    addToWatched(movie);
    removeFromWatchlist(movie.id);
    toast.success("Marked as watched!", { icon: "✅" });
  };

  const handleDiaryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDiaryDialogOpen(true);
  };

  return (
    <>
      <Card
        className="bg-card border shadow-md flex flex-col w-full max-w-[256px] overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:shadow-[#1db954]/20 hover:scale-[1.03] cursor-pointer group focus-within:ring-2 focus-within:ring-[#1db954]"
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
        <div className="relative w-full aspect-[2/3] bg-gray-800">
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10">
            <div className="text-white text-center px-4">
              <p className="text-sm font-semibold mb-2">Click for details</p>
              <div className="flex gap-3 justify-center">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold">{rating}</span>
                </div>
              </div>
            </div>
          </div>
          {imageLoading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 border-4 border-gray-700 border-t-[#1db954] rounded-full animate-spin" />
            </div>
          )}
          {imageError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-500">
              <svg
                className="w-16 h-16 mb-2"
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
              <span className="text-sm">No Image</span>
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
        <CardContent className="p-4 flex flex-col flex-1 min-h-0">
          <h3 className="text-sm font-semibold text-center mb-2 leading-tight line-clamp-2 min-h-[2.5rem]">
            {titleWithYear}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-3 mb-3 min-h-[3.75rem]">
            {description}
          </p>
          <div className="mb-4 min-h-[1.5rem]">
            <StarRating
              rating={typeof movie.vote_average === "number" ? movie.vote_average : 0}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-5 mt-auto min-h-[2rem]">
            <TooltipProvider>
              {page === "discover" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {favorite ? (
                        <Heart
                          className="w-6 h-6 text-red-500 cursor-pointer"
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromFavorites();
                          }}
                        />
                      ) : (
                        <Heart
                          className="w-6 h-6 hover:text-red-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToFavorites();
                          }}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{favorite ? "Remove from favorites" : "Add to favorites"}</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      {inWatchlist ? (
                        <Bookmark
                          className="w-6 h-6 text-blue-500 cursor-pointer"
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWatchlist();
                          }}
                        />
                      ) : (
                        <Bookmark
                          className="w-6 h-6 hover:text-blue-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWatchlist();
                          }}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{inWatchlist ? "Remove from watchlist" : "Add to watchlist"}</p>
                    </TooltipContent>
                  </Tooltip>
                </>
              )}

              {page === "favs" && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Heart
                        className="w-6 h-6 text-red-500 cursor-pointer"
                        fill="currentColor"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromFavorites();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove from favorites</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      {inWatchlist ? (
                        <Bookmark
                          className="w-6 h-6 text-blue-500 cursor-pointer"
                          fill="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveFromWatchlist();
                          }}
                        />
                      ) : (
                        <Bookmark
                          className="w-6 h-6 hover:text-blue-500 cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddToWatchlist();
                          }}
                        />
                      )}
                    </TooltipTrigger>
                    <TooltipContent>
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
                        className="w-6 h-6 text-blue-500 cursor-pointer"
                        fill="currentColor"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromWatchlist();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Remove from watchlist</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Eye
                        className="w-6 h-6 text-green-500 hover:text-green-600 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleWatched();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
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
                        className="w-6 h-6 text-yellow-400 hover:text-yellow-500 cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnwatch();
                        }}
                      />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Move to watchlist</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <BookOpen
                        className={`w-6 h-6 cursor-pointer ${
                          hasDiaryEntry(movie.id)
                            ? "text-blue-500 fill-blue-500"
                            : "text-blue-400 hover:text-blue-600"
                        }`}
                        onClick={handleDiaryClick}
                      />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      {hasDiaryEntry(movie.id) ? (
                        <div>
                          <p className="font-semibold mb-1">Diary Entry:</p>
                          <p className="text-xs line-clamp-3">
                            {getDiaryEntry(movie.id)?.text}
                          </p>
                        </div>
                      ) : (
                        <p>Add diary entry</p>
                      )}
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
        initialDiaryEntry={getDiaryEntry(movie.id)}
        onSave={saveDiaryEntry}
      />
    </>
  );
});

MovieCard.displayName = "MovieCard";

export default MovieCard;
