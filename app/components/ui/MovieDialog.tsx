"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";

interface MovieDialogProps {
  open: boolean;
  onClose: () => void;
  movie: any;
  credits: any;
}

export default function MovieDialog({ open, onClose, movie, credits }: MovieDialogProps) {
  const director = credits.crew.find((p: any) => p.job === "Director")?.name || "Unknown";
  const castList = credits.cast.slice(0, 5).map((p: any) => p.name).join(", ") || "N/A";

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{movie.title}</DialogTitle>
        </DialogHeader>
        <div className="flex gap-4">
          <Image
            src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            alt={movie.title}
            width={150}
            height={225}
            className="rounded"
          />
          <div className="space-y-2 text-sm">
            <p><strong>Release Year:</strong> {movie.release_date?.split("-")[0] || "N/A"}</p>
            <p><strong>Rating:</strong> {movie.vote_average?.toFixed(1) || "N/A"}</p>
            <p><strong>Director:</strong> {director}</p>
            <p><strong>Cast:</strong> {castList}</p>
            <p><strong>Overview:</strong> {movie.overview || "No synopsis available."}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
