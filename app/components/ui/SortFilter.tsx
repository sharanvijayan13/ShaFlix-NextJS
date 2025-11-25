"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowUpDown } from "lucide-react";

interface SortFilterProps {
  sortBy: string;
  setSortBy: (sort: string) => void;
}

export default function SortFilter({ sortBy, setSortBy }: SortFilterProps) {
  const sortOptions = [
    { value: "default", label: "Default" },
    { value: "rating-desc", label: "Rating: High to Low" },
    { value: "rating-asc", label: "Rating: Low to High" },
    { value: "title-asc", label: "Title: A to Z" },
    { value: "title-desc", label: "Title: Z to A" },
    { value: "date-desc", label: "Newest First" },
    { value: "date-asc", label: "Oldest First" },
  ];

  return (
    <div className="my-4 w-full max-w-xs mx-auto md:mx-0">
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-full h-12 border-2 hover:border-[#1db954] transition-colors">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-gray-400" />
            <SelectValue placeholder="Sort by" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
