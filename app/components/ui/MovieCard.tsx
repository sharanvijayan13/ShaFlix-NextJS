import { FC } from "react";
import { useMovieContext } from "@/app/contexts/MovieContext";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Movie } from "@/app/types";
import { toast } from "sonner";
import {
  Heart,
  Bookmark,
  Star,
  Eye,
  EyeOff,
  BookOpen
} from "lucide-react";

interface MovieCardProps {
  movie: Movie;
  page: "discover" | "favs" | "watchlist" | "watched";
}

const MovieCard: FC<MovieCardProps> = ({ movie, page }) => {
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    addToWatchlist,
    removeFromWatchlist,
    isInWatchlist,
    addToWatched,
    removeFromWatched,
  } = useMovieContext();

  const year = movie.release_date ? movie.release_date.split("-")[0] : "N/A";
  const titleWithYear = `${movie.title} (${year})`;
  const description = movie.overview || "No description available.";
  const rating = typeof movie.vote_average === "number" ? movie.vote_average.toFixed(1) : "N/A";

  const favorite = isFavorite(movie.id);
  const inWatchlist = isInWatchlist(movie.id);

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

  return (
    <Card className="bg-card border shadow-md flex flex-col min-h-[530px] w-64 overflow-hidden transition-all duration-300 ease-in-out hover:shadow-lg hover:scale-[1.03]">
      <Image
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        width={500}
        height={750}
        className="w-full h-96 object-cover"
        priority
      />
      <CardContent className="p-4 flex flex-col flex-1">
        <h3 className="text-sm font-semibold text-center mb-2 leading-tight">
          {titleWithYear}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">{description}</p>
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
          <span className="text-sm font-medium">{rating}</span>
        </div>
        <div className="flex items-center gap-5 mt-auto">

          {page === "discover" && (
            <>
              {favorite ? (
                <Heart className="w-6 h-6 text-red-500 cursor-pointer" fill="currentColor" onClick={handleRemoveFromFavorites} />
              ) : (
                <Heart className="w-6 h-6 hover:text-red-500 cursor-pointer" onClick={handleAddToFavorites} />
              )}
              {inWatchlist ? (
                <Bookmark className="w-6 h-6 text-blue-500 cursor-pointer" fill="currentColor" onClick={handleRemoveFromWatchlist} />
              ) : (
                <Bookmark className="w-6 h-6 hover:text-blue-500 cursor-pointer" onClick={handleAddToWatchlist} />
              )}
            </>
          )}

          {page === "favs" && (
            <>
              <Heart className="w-6 h-6 text-red-500 cursor-pointer" fill="currentColor" onClick={handleRemoveFromFavorites} />
              {inWatchlist ? (
              <Bookmark className="w-6 h-6 text-blue-500 cursor-pointer" fill="currentColor" onClick={handleRemoveFromWatchlist} />
              ) : (
                <Bookmark className="w-6 h-6 hover:text-blue-500 cursor-pointer" onClick={handleAddToWatchlist} />
              )}
            </>
          )}

          {page === "watchlist" && (
            <>
              <Bookmark className="w-6 h-6 text-blue-500 cursor-pointer" fill="currentColor" onClick={handleRemoveFromWatchlist} />
              <Eye className="w-6 h-6 text-green-500 hover:text-green-600 cursor-pointer" onClick={handleWatched} />
            </>
          )}

          {page === "watched" && (
            <>
              <EyeOff className="w-6 h-6 text-yellow-400 hover:text-yellow-500 cursor-pointer" onClick={handleUnwatch} />
              <BookOpen className="w-6 h-6 text-blue-400 hover:text-blue-600 cursor-pointer" />
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default MovieCard;
