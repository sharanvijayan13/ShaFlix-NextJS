"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import StarRating from "./StarRating";
import { useMovieContext } from "../contexts/MovieContext";
import { Movie } from "../types";
import { toast } from "sonner";

interface ReviewDialogProps {
  movie: Movie;
  trigger?: React.ReactNode;
}

export default function ReviewDialog({ movie, trigger }: ReviewDialogProps) {
  const { getReview, addReview, updateReview } = useMovieContext();
  const existingReview = getReview(movie.id);

  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [reviewText, setReviewText] = useState(existingReview?.text || "");
  const [tags, setTags] = useState<string[]>(existingReview?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [hasSpoilers, setHasSpoilers] = useState(existingReview?.hasSpoilers || false);

  const handleSave = () => {
    if (rating === 0) {
      toast.error("Please add a rating");
      return;
    }

    if (existingReview) {
      updateReview(existingReview.id, {
        rating,
        text: reviewText,
        tags,
        hasSpoilers,
      });
      toast.success("Review updated!");
    } else {
      addReview({
        movieId: movie.id,
        rating,
        text: reviewText,
        tags,
        hasSpoilers,
      });
      toast.success("Review added!");
    }
    setOpen(false);
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || <Button variant="outline">Write Review</Button>}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Review: {movie.title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Your Rating</label>
            <StarRating rating={rating} onRatingChange={setRating} size="lg" />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Review</label>
            <Textarea
              placeholder="Share your thoughts about this movie..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={6}
              className="resize-none"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Tags</label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add a tag (e.g., mind-bending)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                className="flex-1 px-3 py-2 border rounded-md text-sm"
              />
              <Button type="button" size="sm" onClick={addTag}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="gap-1">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="spoilers"
              checked={hasSpoilers}
              onChange={(e) => setHasSpoilers(e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="spoilers" className="text-sm">
              This review contains spoilers
            </label>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {existingReview ? "Update" : "Save"} Review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
