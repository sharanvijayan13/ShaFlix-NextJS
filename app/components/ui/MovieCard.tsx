import { FC } from "react";
import { useMovieContext } from "@/app/contexts/MovieContext";
import { HeartIcon as HeartIconOutline, BookmarkIcon as BookmarkIconOutline, StarIcon, BookOpenIcon } from "@heroicons/react/24/outline";
import { HeartIcon as HeartIconSolid, BookmarkIcon as BookmarkIconSolid, EyeIcon as EyeIconSolid, EyeSlashIcon as EyeSlashIconSolid } from "@heroicons/react/24/solid";
import { Movie } from "../../types";
import Image from "next/image";
import toast from 'react-hot-toast';

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
  const rating = typeof movie.vote_average === 'number' ? movie.vote_average.toFixed(1) : "N/A";

  const favorite = isFavorite(movie.id);
  const inWatchlist = isInWatchlist(movie.id);

  const handleAddToFavorites = () => {
    addToFavorites(movie);
    toast.success("Added to favorites!");
  };
  const handleRemoveFromFavorites = () => {
    removeFromFavorites(movie.id);
    toast("Removed from favorites", { icon: "❌" });
  };
  const handleAddToWatchlist = () => {
    addToWatchlist(movie);
    toast.success("Added to watchlist!");
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
    toast.success("Marked as watched!");
  };

  return (
    <div className="bg-[#18181c] rounded-xl shadow-lg flex flex-col w-65 min-h-[530px] overflow-hidden border border-[#23232a]">
      <Image 
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        width={500}
        height={750}
        className="w-full h-96 object-cover"
        priority
      />
      <div className="flex flex-col flex-1 px-5 py-4">
        <h3 className="text-[13px] font-extrabold text-white text-center mb-2 leading-tight">
          {titleWithYear}
        </h3>
        <p className="text-sm text-white text-left mb-4 line-clamp-3">
          {description}
        </p>
        <div className="flex items-center gap-2 mb-4">
          <StarIcon className="w-5 h-5 text-yellow-400" />
          <span className="text-base text-white font-semibold">{rating}</span>
        </div>
        <div className="flex items-center gap-6 mt-auto pb-1">

          {page === "discover" && (
            <>
              {favorite ? (
                <HeartIconSolid className="w-6 h-6 text-red-500 cursor-pointer" onClick={handleRemoveFromFavorites} />
              ) : (
                <HeartIconOutline className="w-6 h-6 text-white hover:text-red-500 cursor-pointer" onClick={handleAddToFavorites} />
              )}
              {inWatchlist ? (
                <BookmarkIconSolid className="w-6 h-6" style={{ color: '#0974e5' }} onClick={handleRemoveFromWatchlist} />
              ) : (
                <BookmarkIconOutline className="w-6 h-6 text-white hover:text-[#0974e5] cursor-pointer" onClick={handleAddToWatchlist} />
              )}
            </>
          )}

          {page === "favs" && (
            <>
              <HeartIconSolid className="w-6 h-6 text-red-500 cursor-pointer" onClick={handleRemoveFromFavorites} />
              {inWatchlist ? (
                <BookmarkIconSolid className="w-6 h-6" style={{ color: '#0974e5' }} onClick={handleRemoveFromWatchlist} />
              ) : (
                <BookmarkIconOutline className="w-6 h-6 text-white hover:text-[#0974e5] cursor-pointer" onClick={handleAddToWatchlist} />
              )}
            </>
          )}

          {page === "watchlist" && (
            <>
              <BookmarkIconSolid className="w-6 h-6" style={{ color: '#0974e5' }} onClick={handleRemoveFromWatchlist} />
              <EyeIconSolid className="w-6 h-6 text-green-500 hover:text-green-700 cursor-pointer" onClick={handleWatched} />
            </>
          )}

          {page === "watched" && (
            <>
              <EyeSlashIconSolid className="w-6 h-6 text-yellow-400 hover:text-yellow-600 cursor-pointer" onClick={handleUnwatch} />
              <BookOpenIcon className="w-6 h-6 text-blue-400 hover:text-blue-600 cursor-pointer" />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
