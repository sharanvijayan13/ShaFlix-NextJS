"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Movie, Credits } from "@/app/types";

interface MovieDialogProps {
  open: boolean;
  onClose: () => void;
  movie: Movie;
  credits: Credits | null;
  trailer?: { key: string; site: string; type: string; name: string } | null;
}

export default function MovieDialog({ open, onClose, movie, credits, trailer }: MovieDialogProps) {
  const cast = credits?.cast?.slice(0, 3) || [];
  const director = credits?.crew?.find((c) => c.job === "Director");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[340px] sm:max-w-sm md:max-w-lg max-h-[85vh] overflow-y-auto p-0 bg-gradient-to-br from-[#1a1d29] to-[#14181c] border border-[#2a2e3a] rounded-lg">
        <DialogDescription className="sr-only">
          Movie details including title, release year, rating, and overview.
        </DialogDescription>

        <div className="flex flex-col">
          {/* Trailer Section */}
          {trailer && (
            <div className="w-full aspect-video bg-black rounded-t-lg overflow-hidden">
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${trailer.key}`}
                title={trailer.name}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full"
              />
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4 p-4 md:p-5">
            {/* Poster - smaller on mobile */}
            <div className="flex-shrink-0 mx-auto md:mx-0">
              <Image
                src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                alt={movie.title}
                width={200}
                height={300}
                className="w-[140px] md:w-[180px] h-auto rounded-md shadow-lg border border-[#2a2e3a]"
              />
            </div>

            {/* Details */}
            <div className="flex-1 space-y-3 text-white">
              <DialogTitle className="text-xl md:text-2xl font-bold text-center md:text-left text-white pr-6">
                {movie.title}
              </DialogTitle>

              <div className="space-y-2 text-xs md:text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-medium min-w-[80px] md:min-w-[90px]">Release Year:</span>
                  <span className="text-white">{movie.release_date?.split("-")[0] || "N/A"}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="text-gray-400 font-medium min-w-[80px] md:min-w-[90px]">Rating:</span>
                  <span className="text-white font-semibold">{movie.vote_average?.toFixed(1) || "N/A"}</span>
                </div>

                {director && (
                  <div className="flex items-start gap-2">
                    <span className="text-gray-400 font-medium min-w-[80px] md:min-w-[90px]">Director:</span>
                    <span className="text-white">{director.name}</span>
                  </div>
                )}

                {cast.length > 0 && (
                  <div className="flex gap-2">
                    <span className="text-gray-400 font-medium min-w-[80px] md:min-w-[90px] flex-shrink-0">Cast:</span>
                    <span className="text-white line-clamp-2">{cast.map((actor) => actor.name).join(", ")}</span>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-[#2a2e3a]">
                <h3 className="text-gray-400 font-medium text-xs md:text-sm mb-1.5">Synopsis</h3>
                <p className="text-white text-xs md:text-sm leading-relaxed line-clamp-4 md:line-clamp-none">
                  {movie.overview || "No synopsis available."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
