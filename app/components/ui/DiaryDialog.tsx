"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Movie, DiaryEntry } from "@/app/types";
import { toast } from "sonner";
import { useMovieContext } from "@/app/contexts/MovieContext";

interface DiaryDialogProps {
  open: boolean;
  onClose: () => void;
  movie: Movie;
  initialDiaryEntry?: DiaryEntry;
}

export default function DiaryDialog({
  open,
  onClose,
  movie,
  initialDiaryEntry,
}: DiaryDialogProps) {
  const { addDiaryEntry, updateDiaryEntry } = useMovieContext();
  const [diaryEntry, setDiaryEntry] = useState(initialDiaryEntry?.review || "");

  useEffect(() => {
    setDiaryEntry(initialDiaryEntry?.review || "");
  }, [initialDiaryEntry, open]);

  const handleSave = () => {
    if (initialDiaryEntry) {
      // Update existing entry
      updateDiaryEntry(initialDiaryEntry.id, {
        review: diaryEntry,
      });
    } else {
      // Create new entry
      addDiaryEntry({
        movieId: movie.id,
        watchedDate: new Date().toISOString(),
        review: diaryEntry,
        tags: [],
        rewatch: false,
      });
    }
    toast.success("Entry saved!", { icon: "📒" });
    onClose();
  };

  const handleClose = () => {
    setDiaryEntry(initialDiaryEntry?.review || "");
    onClose();
  };

  let lastEntryDate = "";
  if (initialDiaryEntry?.watchedDate && initialDiaryEntry.review) {
    const d = new Date(initialDiaryEntry.watchedDate);
    lastEntryDate = d.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white text-black border-gray-300">
        <DialogHeader>
        <DialogTitle className="text-xl font-bold text-[#1DB954] text-center underline pt-1.5 md:pt-2.5">
            Diary of {movie.title}
          </DialogTitle>
          <DialogDescription className="text-center text-gray-600">
            {lastEntryDate ? (
              <>Last entry: <span className="font-semibold">{lastEntryDate}</span></>
            ) : null}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">          
          <textarea
            value={diaryEntry}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDiaryEntry(e.target.value)}
            placeholder="Write your thoughts..."
            className="min-h-[200px] bg-white border-gray-400 text-black placeholder-gray-500 resize-none w-full p-3 rounded-md border"
          />
          <div className="flex justify-end gap-2 pb-1.5">
            <Button
              variant="outline"
              onClick={handleClose}
              className="border-gray-600 text-gray-500 hover:bg-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-green-600 hover:bg-green-700"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 