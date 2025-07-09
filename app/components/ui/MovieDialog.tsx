"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";

interface MovieDialogProps {
  open: boolean;
  onClose: () => void;
  movie: any;
  credits: any;
}

export default function MovieDialog({ open, onClose, movie }: MovieDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="w-[95vw] max-w-xs sm:max-w-md md:max-w-xl lg:max-w-2xl max-h-[70vh] overflow-y-auto p-2"
      >
        {/* Visually hidden for accessibility */}
        <DialogDescription className="sr-only">
          Movie details including title, release year, rating, and overview.
        </DialogDescription>

        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          {/* Movie Poster */}
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={250}
            height={375}
            className="w-[250px] h-auto rounded mb-4 md:mb-0"
          />

          {/* Info Section */}
          <div className="space-y-2 text-lg w-full">
            <DialogTitle className="text-2xl font-bold underline text-center md:text-left">
              {movie.title}
            </DialogTitle>

            <p className="text-left text-lg">
              <strong>Release Year:</strong> {movie.release_date?.split("-")[0] || "N/A"}
            </p>
            <p className="text-left text-lg">
              <strong>Rating:</strong> {movie.vote_average?.toFixed(1) || "N/A"}
            </p>
            <p className="text-left text-lg mb-[5px]">
              <strong>Overview:</strong> {movie.overview || "No synopsis available."}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
