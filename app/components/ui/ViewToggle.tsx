"use client";

import { LayoutGrid, LayoutList } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ViewToggleProps {
  view: "grid" | "compact";
  setView: (view: "grid" | "compact") => void;
}

export default function ViewToggle({ view, setView }: ViewToggleProps) {
  return (
    <div className="flex gap-2 my-4">
      <Button
        variant={view === "grid" ? "default" : "outline"}
        size="icon"
        onClick={() => setView("grid")}
        className={view === "grid" ? "bg-[#1db954] hover:bg-[#1ed760]" : ""}
        aria-label="Grid view"
      >
        <LayoutGrid className="h-5 w-5" />
      </Button>
      <Button
        variant={view === "compact" ? "default" : "outline"}
        size="icon"
        onClick={() => setView("compact")}
        className={view === "compact" ? "bg-[#1db954] hover:bg-[#1ed760]" : ""}
        aria-label="Compact view"
      >
        <LayoutList className="h-5 w-5" />
      </Button>
    </div>
  );
}
