"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinks = [
    { href: "/", label: "Discover" },
    { href: "/favorites", label: "Favorites" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/watched", label: "Watched" },
  ];

  return (
    <div className="navbar-container relative z-10">
      {/* Desktop Navigation */}
      <div className="hidden md:flex text-lg flex-row text-gray-300 justify-end gap-10 mt-7">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Navigation via Sheet */}
      <div className="md:hidden mt-1">
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="hamburger text-gray-300 hover:text-[#1db954] hover:bg-transparent focus:bg-transparent active:bg-transparent transition-colors duration-300"
            aria-label="Toggle menu"
          >

              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"
                  }`}
                />
              </div>
            </Button>
          </SheetTrigger>

          <SheetContent
            side="left"
            className="w-64 bg-black border-r border-gray-800 p-0"
          >
            {/* Title and Close */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
              <SheetTitle className="text-xl font-bold text-white">Shaflix</SheetTitle>
              <Button
                variant="ghost"
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-300 hover:text-[#1db954] hover:bg-transparent focus:bg-transparent active:bg-transparent transition-colors duration-300"
              >
                <X className="w-6 h-6" />
              </Button>

            </div>

            {/* Optional Description (Visually Hidden) */}
            <SheetDescription className="sr-only">
              Navigation drawer with links to Discover, Favorites, Watchlist, and Watched.
            </SheetDescription>

            {/* Navigation Links */}
            <nav className="flex-1 px-6 py-4">
              <ul className="space-y-6">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="block text-lg text-gray-300 hover:text-[#1db954] hover:border-l-4 border-[#1db954] pl-4 transition-all duration-300 py-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
