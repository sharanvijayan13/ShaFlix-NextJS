"use client";

import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export default function ErrorState({
  title = "Something went wrong",
  message = "We couldn't load the movies. Please try again.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center col-span-full">
      <div className="mb-6 p-6 bg-red-900/20 rounded-full">
        <AlertCircle className="w-16 h-16 text-red-500" />
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{message}</p>
      {onRetry && (
        <Button
          onClick={onRetry}
          className="bg-[#1db954] hover:bg-[#1ed760] text-white"
        >
          Try Again
        </Button>
      )}
    </div>
  );
}
