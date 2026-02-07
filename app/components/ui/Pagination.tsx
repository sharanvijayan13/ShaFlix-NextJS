"use client";

import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}

export default function Pagination({ page, totalPages, setPage }: PaginationProps) {
  const getDesktopPages = (): number[] => {
    const maxButtons = 5;
    const start = Math.max(
      1,
      Math.min(page - Math.floor(maxButtons / 2), totalPages - maxButtons + 1)
    );
    const end = Math.min(totalPages, start + maxButtons - 1);

    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      {/* Mobile View */}
      <div className="sm:hidden flex justify-center items-center gap-1.5 mt-8">
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>
        <div className="px-3 py-1.5 bg-card border rounded-md">
          <span className="text-xs font-medium">
            {page} / {totalPages}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:flex justify-center gap-1 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        {getDesktopPages().map((p) => (
          <Button
            key={p}
            variant={p === page ? "default" : "outline"}
            size="icon"
            onClick={() => setPage(p)}
          >
            {p}
          </Button>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </>
  );
}
