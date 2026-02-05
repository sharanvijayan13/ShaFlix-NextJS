"use client"

import Navbar from "../components/ui/Navbar";
import MovieCard from "../components/ui/MovieCard";
import EmptyState from "../components/ui/EmptyState";
import { useMovieContext } from "../contexts/MovieContext";
import { Bookmark, LogOut, Eye, BookOpen, List } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { isFirebaseConfigured } from "../lib/firebase";
import Link from "next/link";
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
  const { watchlist, userProfile } = useMovieContext();
  const { user, signOut } = useAuth();

  // Extract username from email if profile username is empty
  const getDisplayName = () => {
    if (userProfile.username) return userProfile.username;
    if (user?.email) return user.email.split('@')[0];
    return user?.displayName || "User";
  };

  return (
    <div className="flex flex-col p-4 md:p-6 bg-black text-white min-h-screen">
      <div className="flex items-center justify-between mb-5 relative">
        <h1 className="text-2xl md:text-3xl font-bold">Shaflix</h1>
        
        {/* Hamburger menu on mobile - same line as title */}
        <div className="md:hidden">
          <Navbar />
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
      
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar />
      </div>
      <h2 className="text-xl md:text-2xl font-bold mt-5 m-4">
        Watchlist
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 max-w-8xl w-full py-1 mx-auto">
        {watchlist.length === 0 ? (
          <EmptyState
            icon={Bookmark}
            title="Your watchlist is empty"
            description="Add movies you want to watch later by clicking the bookmark icon on any movie card."
            actionLabel="Browse Movies"
            actionHref="/"
          />
        ) : (
          watchlist.map((movie) => (
            <MovieCard key={movie.id} movie={movie} page="watchlist" />
          ))
        )}
      </div>
    </div>
  );
}