import React from "react";

interface PaginationProps {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ page, totalPages, setPage }) => {
  // Compact version for mobile: Prev, 3 page numbers, Next
  const getCompactPages = () => {
    let pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (page === 1) {
      pages = [1, 2, 3];
    } else if (page === totalPages) {
      pages = [totalPages - 2, totalPages - 1, totalPages];
    } else {
      pages = [page - 1, page, page + 1];
    }
    // Clamp pages to valid range
    return pages.filter((p) => p >= 1 && p <= totalPages);
  };

  // Full version for desktop: 10 buttons
  const maxButtons = 10;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <>
      {/* Compact version for mobile */}
      <div className="flex justify-center items-center gap-2 mt-12 mb-10 sm:hidden">
        <button
          className="w-10 h-10 bg-green-600 text-white text-xl rounded-none flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50"
          onClick={() => setPage(Math.max(1, page - 1))}
          disabled={page === 1}
        >
          &lt;
        </button>
        {getCompactPages().map((p) => (
          <button
            key={p}
            className={`w-10 h-10 text-l rounded-none flex items-center justify-center font-semibold border-2 border-green-600 transition ${
              p === page
                ? "bg-white text-green-600 border-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="w-10 h-10 bg-green-600 text-white text-xl rounded-none flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50"
          onClick={() => setPage(Math.min(totalPages, page + 1))}
          disabled={page === totalPages}
        >
          &gt;
        </button>
      </div>
      {/* Full version for desktop */}
      <div className="hidden sm:flex justify-center items-center gap-3 mt-12 mb-10">
        <button
          className="w-10 h-10 bg-green-600 text-white text-xl rounded-none flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50"
          onClick={() => setPage(1)}
          disabled={page === 1}
        >
          «
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={`w-10 h-10 text-l rounded-none flex items-center justify-center font-semibold border-2 border-green-600 transition ${
              p === page
                ? "bg-white text-green-600 border-white"
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
            onClick={() => setPage(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="w-10 h-10 bg-green-600 text-white text-xl rounded-none flex items-center justify-center hover:bg-green-700 transition disabled:opacity-50"
          onClick={() => setPage(totalPages)}
          disabled={page === totalPages}
        >
          »
        </button>
      </div>
    </>
  );
};

export default Pagination; 