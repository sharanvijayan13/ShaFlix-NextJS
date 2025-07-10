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
}

export default function MovieDialog({ open, onClose, movie, credits }: MovieDialogProps) {
  const cast = credits?.cast?.slice(0, 3) || [];
  const director = credits?.crew?.find((c) => c.job === "Director");

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-md sm:max-w-lg md:max-w-[500px] lg:max-w-2xl xl:max-w-3xl max-h-[85vh] overflow-y-auto p-4">
        <DialogDescription className="sr-only">
          Movie details including title, release year, rating, and overview.
        </DialogDescription>

        <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={250}
            height={375}
            className="w-[250px] h-auto mb-4 md:mb-0"
          />

          <div className="space-y-2 text-xl w-full">
            <DialogTitle className="text-2xl font-bold underline text-center md:text-left">
              {movie.title}
            </DialogTitle>

            <p><strong>Release Year:</strong> {movie.release_date?.split("-")[0] || "N/A"}</p>
            <p><strong>Rating:</strong> {movie.vote_average?.toFixed(1) || "N/A"}</p>
            {director && (
              <p>
                <strong>Director:</strong> {director.name}
              </p>
            )}

            {cast.length > 0 && (
              <p>
                <strong>Cast:</strong>{" "}
                {cast.map((actor) => actor.name).join(", ")}
              </p>
            )}

            <p><strong>Synposis:</strong> {movie.overview || "No synopsis available."}</p>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
