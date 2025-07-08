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

  const getMobilePages = (): number[] => {
    if (totalPages <= 3) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page === 1) return [1, 2, 3];
    if (page === totalPages) return [totalPages - 2, totalPages - 1, totalPages];
    return [page - 1, page, page + 1];
  };

  const getDesktopPages = (): number[] => {
    const maxButtons = 10;
    let start = Math.max(1, page - Math.floor(maxButtons / 2));
    let end = start + maxButtons - 1;
    if (end > totalPages) {
      end = totalPages;
      start = Math.max(1, end - maxButtons + 1);
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  return (
    <>
      {/* Mobile View - 5 Buttons: Prev, 3 page nums, Next */}
      <div className="sm:hidden flex justify-center gap-1 mt-8">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        {getMobilePages().map((p) => (
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
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Desktop View - 10 Buttons with First/Last */}
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
