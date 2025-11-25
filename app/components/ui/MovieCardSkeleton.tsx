"use client";

export default function MovieCardSkeleton() {
  return (
    <div className="bg-card border shadow-md flex flex-col w-full max-w-[256px] overflow-hidden animate-pulse">
      <div className="w-full aspect-[2/3] bg-gray-800" />
      <div className="p-4 flex flex-col flex-1 min-h-0">
        <div className="min-h-[2.5rem] mb-2 flex items-center justify-center">
          <div className="h-4 bg-gray-800 rounded w-3/4" />
        </div>
        <div className="min-h-[3.75rem] mb-3 space-y-1">
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-full" />
          <div className="h-3 bg-gray-800 rounded w-2/3" />
        </div>
        <div className="min-h-[1.5rem] mb-4 flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-800 rounded-full" />
          <div className="h-3 bg-gray-800 rounded w-8" />
        </div>
        <div className="flex items-center gap-5 mt-auto min-h-[2rem]">
          <div className="w-6 h-6 bg-gray-800 rounded-full" />
          <div className="w-6 h-6 bg-gray-800 rounded-full" />
        </div>
      </div>
    </div>
  );
}
