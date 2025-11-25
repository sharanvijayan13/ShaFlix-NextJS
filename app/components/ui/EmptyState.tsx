"use client";

import { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
}

export default function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  actionHref,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center col-span-full">
      <div className="mb-6 p-6 bg-gray-900 rounded-full">
        <Icon className="w-16 h-16 text-gray-500" />
      </div>
      <h3 className="text-2xl font-semibold mb-2 text-white">{title}</h3>
      <p className="text-gray-400 mb-6 max-w-md">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <Button className="bg-[#1db954] hover:bg-[#1ed760] text-white">
            {actionLabel}
          </Button>
        </Link>
      )}
    </div>
  );
}
