"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { X, User, LogOut, Eye, BookOpen, List, Film, Heart, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/app/contexts/AuthContext";
import { AuthDialog } from "@/app/components/AuthDialog";
import { isFirebaseConfigured } from "@/app/lib/firebase";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useMovieContext } from "@/app/contexts/MovieContext";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, signOut } = useAuth();
  const { userProfile } = useMovieContext();

  // Extract username from email if profile username is empty
  const getDisplayName = () => {
    if (userProfile.username) return userProfile.username;
    if (user?.email) return user.email.split('@')[0];
    return user?.displayName || "User";
  };

  // Main navigation links (shown in desktop navbar only)
  const mainNavLinks = [
    { href: "/", label: "Discover", authRequired: true },
    { href: "/favorites", label: "Favorites", authRequired: true },
    { href: "/watchlist", label: "Watchlist", authRequired: true },
  ];

  // All navigation links for mobile menu with icons
  const mobileNavLinks = [
    { href: "/", label: "Discover", icon: Film, authRequired: true },
    { href: "/favorites", label: "Favorites", icon: Heart, authRequired: true },
    { href: "/watchlist", label: "Watchlist", icon: Bookmark, authRequired: true },
    { href: "/watched", label: "Watched", icon: Eye, authRequired: true },
    { href: "/diary", label: "Diary", icon: BookOpen, authRequired: true },
    { href: "/lists", label: "Lists", icon: List, authRequired: true },
  ];

  // Filter nav links based on authentication status
  const navLinks = user 
    ? mainNavLinks 
    : mainNavLinks.filter(link => !link.authRequired);

  const mobileLinks = user
    ? mobileNavLinks
    : mobileNavLinks.filter(link => !link.authRequired);

  return (
    <div className="navbar-container relative z-10">
      {/* Desktop Navigation */}
      <div className="hidden md:flex text-lg flex-row text-gray-300 items-center justify-end gap-10 mt-7">
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

      {/* Mobile Navigation - Hamburger Menu (only when logged in) */}
      <div className="md:hidden">
        {isFirebaseConfigured && user ? (
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="hamburger text-gray-300 hover:text-[#1db954] hover:bg-transparent focus:bg-transparent active:bg-transparent transition-colors duration-300"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className="block w-6 h-0.5 bg-current -translate-y-1" />
                  <span className="block w-6 h-0.5 bg-current" />
                  <span className="block w-6 h-0.5 bg-current translate-y-1" />
                </div>
              </Button>
            </SheetTrigger>

            <SheetContent
              side="left"
              className="w-64 bg-black border-r border-gray-800 p-0"
            >
              {/* Title */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <SheetTitle className="text-xl font-bold text-white">Shaflix</SheetTitle>
              </div>

              {/* Profile Section */}
              <div className="px-6 py-4 border-b border-gray-800">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-[#00E054]">
                    <AvatarImage src={userProfile.avatarUrl || user.photoURL || ""} />
                    <AvatarFallback className="bg-[#1F2428] text-[#00E054] font-bold text-lg">
                      {getDisplayName()[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">
                      {getDisplayName()}
                    </p>
                    <p className="text-xs text-gray-400 truncate">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Navigation Links with Icons */}
              <nav className="flex-1 px-6 py-4">
                <ul className="space-y-1">
                  {mobileLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link
                          href={link.href}
                          onClick={() => setIsMenuOpen(false)}
                          className="flex items-center gap-3 text-gray-300 hover:text-[#00E054] py-3 px-3 rounded hover:bg-gray-900 transition-all text-base"
                        >
                          <Icon className="h-5 w-5" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                
                {/* Sign Out */}
                <div className="mt-6">
                  <Button
                    onClick={() => {
                      signOut();
                      setIsMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        ) : (
          // Sign In button when logged out
          isFirebaseConfigured && (
            <button
              onClick={() => setShowAuthDialog(true)}
              className="signin-btn"
            >
              Sign In
            </button>
          )
        )}
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
