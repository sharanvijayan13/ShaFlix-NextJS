"use client";

import { Star } from "lucide-react";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  showNumber?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  rating,
  maxRating = 10,
  showNumber = true,
  size = "md",
}: StarRatingProps) {
  const stars = 5;
  const filledStars = Math.round((rating / maxRating) * stars);

  const sizeClasses = {
    sm: "w-3 h-3",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizeClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {Array.from({ length: stars }).map((_, i) => (
          <Star
            key={i}
            className={`${sizeClasses[size]} ${
              i < filledStars
                ? "text-yellow-400 fill-yellow-400"
                : "text-gray-600 fill-gray-600"
            }`}
          />
        ))}
      </div>
      {showNumber && (
        <span className={`${textSizeClasses[size]} font-medium text-gray-300`}>
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
