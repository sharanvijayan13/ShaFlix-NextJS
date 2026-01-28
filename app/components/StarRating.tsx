"use client";

import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  readonly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({ rating, onRatingChange, readonly = false, size = "md" }: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className="flex gap-1">
      {[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5].map((value) => {
        const isHalf = value % 1 !== 0;
        const starIndex = Math.ceil(value);
        const isFilled = displayRating >= value;
        const isHalfFilled = !isFilled && displayRating >= value - 0.5;

        return (
          <button
            key={value}
            type="button"
            disabled={readonly}
            onClick={() => handleClick(value)}
            onMouseEnter={() => !readonly && setHoverRating(value)}
            onMouseLeave={() => !readonly && setHoverRating(0)}
            className={`relative ${readonly ? "cursor-default" : "cursor-pointer hover:scale-110 transition-transform"}`}
          >
            <Star
              className={`${sizeClasses[size]} ${
                isFilled || isHalfFilled
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-400"
              }`}
            />
            {isHalfFilled && (
              <div className="absolute inset-0 overflow-hidden w-1/2">
                <Star className={`${sizeClasses[size]} fill-yellow-400 text-yellow-400`} />
              </div>
            )}
          </button>
        );
      })}
      <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">
        {rating > 0 ? rating.toFixed(1) : ""}
      </span>
    </div>
  );
}
