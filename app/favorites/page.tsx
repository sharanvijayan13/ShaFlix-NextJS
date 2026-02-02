"use client"

import MovieCard from "../components/ui/MovieCard";
import EmptyState from "../components/ui/EmptyState";
import { useMovieContext } from "../contexts/MovieContext";
import { Heart, LogOut, Eye, BookOpen, List, Film, Bookmark } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "../lib/firebase";
import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Home() {
  const { favorites, userProfile } = useMovieContext();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Extract username from email if profile username is empty
  const getDisplayName = () => {
    if (userProfile.username) return userProfile.username;
    if (user?.email) return user.email.split('@')[0];
    return user?.displayName || "User";
  };

  return (
    <div className="flex flex-col p-4 md:p-6 bg-black text-white min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-2xl md:text-3xl font-bold">Shaflix</h1>
        
        {/* Hamburger menu on mobile - inline */}
        <div className="md:hidden flex items-center">
          <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-gray-300 hover:text-[#1db954] hover:bg-transparent p-0 h-auto"
                aria-label="Toggle menu"
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "rotate-45 translate-y-1" : "-translate-y-1"}`} />
                  <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "opacity-0" : "opacity-100"}`} />
                  <span className={`block w-6 h-0.5 bg-current transition-all duration-300 ${isMenuOpen ? "-rotate-45 -translate-y-1" : "translate-y-1"}`} />
                </div>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 bg-black border-r border-gray-800 p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
                <SheetTitle className="text-xl font-bold text-white">Shaflix</SheetTitle>
              </div>
              {isFirebaseConfigured && user && (
                <div className="px-6 py-4 border-b border-gray-800">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12 border-2 border-[#00E054]">
                      <AvatarImage src={userProfile.avatarUrl || user.photoURL || ""} />
                      <AvatarFallback className="bg-[#1F2428] text-[#00E054] font-bold text-lg">
                        {getDisplayName()[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{getDisplayName()}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                    </div>
                  </div>
                </div>
              )}
              <nav className="flex-1 px-6 py-4">
                <ul className="space-y-1">
                  {[
                    { href: "/", label: "Discover", icon: Film },
                    { href: "/favorites", label: "Favorites", icon: Heart },
                    { href: "/watchlist", label: "Watchlist", icon: Bookmark },
                    { href: "/watched", label: "Watched", icon: Eye },
                    { href: "/diary", label: "Diary", icon: BookOpen },
                    { href: "/lists", label: "Lists", icon: List },
                  ].map((link) => {
                    const Icon = link.icon;
                    return (
                      <li key={link.href}>
                        <Link href={link.href} onClick={() => setIsMenuOpen(false)} className="flex items-center gap-3 text-gray-300 hover:text-[#00E054] py-3 px-3 rounded hover:bg-gray-900 transition-all text-base">
                          <Icon className="h-5 w-5" />
                          <span>{link.label}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
                {isFirebaseConfigured && user && (
                  <div className="mt-6">
                    <Button onClick={() => { signOut(); setIsMenuOpen(false); }} variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-600 hover:text-white">
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
        
        {/* User Avatar at top right - Desktop only */}
        {isFirebaseConfigured && user && (
          <div className="hidden md:flex items-center gap-4">
            <span className="text-[#9CA3AF] text-base font-medium">
              Hi, {getDisplayName()}!
            </span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-11 w-11 rounded-full p-0 hover:bg-transparent group">
                  <div className="relative">
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 rounded-full bg-[#00E054] opacity-0 group-hover:opacity-30 blur-md transition-all duration-500"></div>
                    
                    {/* Avatar with border */}
                    <Avatar className="relative h-11 w-11 border-[3px] border-[#2C3440] group-hover:border-[#00E054] group-hover:scale-105 transition-all duration-300 cursor-pointer shadow-lg">
                      <AvatarImage src={userProfile.avatarUrl || user.photoURL || ""} alt={user.email || ""} className="object-cover" />
                      <AvatarFallback className="bg-[#1F2428] text-[#00E054] font-bold text-lg border-2 border-[#00E054]">
                        {getDisplayName()[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {/* Small accent dot with pulse animation for mobile */}
                    <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 bg-[#00E054] rounded-full border-[2.5px] border-black group-hover:scale-110 transition-transform duration-300">
                      <div className="absolute inset-0 rounded-full bg-[#00E054] animate-ping opacity-75"></div>
                    </div>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{getDisplayName()}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/watched" className="cursor-pointer">
                    <Eye className="mr-2 h-4 w-4" />
                    Watched
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/diary" className="cursor-pointer">
                    <BookOpen className="mr-2 h-4 w-4" />
                    Diary
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/lists" className="cursor-pointer">
                    <List className="mr-2 h-4 w-4" />
                    Lists
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />                
                <DropdownMenuItem onClick={signOut} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
      
      {/* Desktop Navigation Links */}
      <div className="hidden md:flex text-lg flex-row text-gray-300 items-center justify-end gap-10 mt-7">
        <Link href="/" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">
          Discover
        </Link>
        <Link href="/favorites" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">
          Favorites
        </Link>
        <Link href="/watchlist" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">
          Watchlist
        </Link>
      </div>
      
      <h2 className="text-xl md:text-2xl font-bold mt-5 m-4">
        Favorites
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-6 max-w-8xl w-full py-1 mx-auto">
        {favorites.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="No favorites yet"
            description="Start adding movies to your favorites by clicking the heart icon on any movie card."
            actionLabel="Discover Movies"
            actionHref="/"
          />
        ) : (
          favorites.map((movie) => (
            <MovieCard key={movie.id} movie={movie} page="favs" />
          ))
        )}
      </div>
    </div>
  );
}
