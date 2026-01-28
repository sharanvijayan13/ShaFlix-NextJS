"use client";

import Link from "next/link";
import { useState } from "react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { X, User, LogOut } from "lucide-react";
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

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { user, signOut } = useAuth();

  // Define all navigation links
  const allNavLinks = [
    { href: "/", label: "Discover", authRequired: false },
    { href: "/favorites", label: "Favorites", authRequired: true },
    { href: "/watchlist", label: "Watchlist", authRequired: true },
    { href: "/watched", label: "Watched", authRequired: true },
    { href: "/diary", label: "Diary", authRequired: true },
  ];

  // Filter nav links based on authentication status
  // Unauthenticated users only see "Discover"
  const navLinks = user 
    ? allNavLinks 
    : allNavLinks.filter(link => !link.authRequired);

  return (
    <div className="navbar-container relative z-10">
      {/* Desktop Navigation */}
      <div className="hidden md:flex text-lg flex-row text-gray-300 justify-end items-center gap-10 mt-7">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300"
          >
            {link.label}
          </Link>
        ))}
        
        {/* User Menu - Only show if Firebase is configured */}
        {isFirebaseConfigured && (
          user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.photoURL || ""} alt={user.email || ""} />
                    <AvatarFallback className="bg-[#1db954] text-white">
                      {user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user.displayName || "User"}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/lists" className="cursor-pointer">
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
          ) : (
            <Button 
              onClick={() => setShowAuthDialog(true)}
              className="bg-[#1db954] hover:bg-[#1ed760] text-white"
            >
              Sign In
            </Button>
          )
        )}
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden mt-1 flex items-center justify-between">
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
              
              {/* Mobile Auth - Only show if Firebase is configured */}
              {isFirebaseConfigured && (
                <div className="mt-8 px-4">
                  {user ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 pb-4 border-b border-gray-800">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.photoURL || ""} />
                          <AvatarFallback className="bg-[#1db954]">
                            {user.email?.[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {user.displayName || "User"}
                          </p>
                          <p className="text-xs text-gray-400 truncate">{user.email}</p>
                        </div>
                      </div>
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
                  ) : (
                    <Button
                      onClick={() => {
                        setShowAuthDialog(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full bg-[#1db954] hover:bg-[#1ed760]"
                    >
                      Sign In
                    </Button>
                  )}
                </div>
              )}
            </nav>
          </SheetContent>
        </Sheet>
      </div>

      {/* Auth Dialog */}
      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />
    </div>
  );
}
