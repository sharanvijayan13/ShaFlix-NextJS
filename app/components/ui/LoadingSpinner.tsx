"use client";

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="relative w-16 h-16">
        <div className="absolute top-0 left-0 w-full h-full border-4 border-gray-800 rounded-full" />
        <div className="absolute top-0 left-0 w-full h-full border-4 border-[#1db954] border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );
}
