"use client";

import { useEffect, useState } from "react";
import Navbar from "./ui/Navbar";
import SearchBar from "./ui/SearchBar";
import MoodSelector from "./ui/MoodSelector";
import MovieCard from "./ui/MovieCard";
import MovieCardSkeleton from "./ui/MovieCardSkeleton";
import ErrorState from "./ui/ErrorState";
import { fetchMovies } from "../lib/api";
import { Movie } from "../types";
import { useSearchParams, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { AuthDialog } from "./AuthDialog";
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
import { LogOut, Eye, BookOpen, List, Edit } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMovieContext } from "../contexts/MovieContext";

function Pagination({
  page,
  totalPages,
  setPage,
}: {
  page: number;
  totalPages: number;
  setPage: (p: number) => void;
}) {
  const maxButtons = 5;
  let start = Math.max(1, page - Math.floor(maxButtons / 2));
  let end = start + maxButtons - 1;
  if (end > totalPages) {
    end = totalPages;
    start = Math.max(1, end - maxButtons + 1);
  }
  const pages = [];
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="flex justify-center items-center gap-2 mt-10 mb-8">
      <button
        className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00E054] to-[#00c248] text-white text-xl rounded-md flex items-center justify-center hover:from-[#00ff66] hover:to-[#00E054] hover:shadow-md hover:shadow-[#00E054]/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:scale-105 active:scale-95"
        onClick={() => setPage(Math.max(1, page - 1))}
        disabled={page === 1}
      >
        ‹
      </button>
      {pages.map((p) => (
        <button
          key={p}
          className={`w-9 h-9 sm:w-10 sm:h-10 text-sm sm:text-base rounded-md flex items-center justify-center font-semibold border transition-all duration-200 transform hover:scale-105 active:scale-95 ${
            p === page
              ? "bg-gradient-to-br from-[#00E054] to-[#00c248] text-white border-[#00E054] shadow-md shadow-[#00E054]/30"
              : "bg-[#1a1d29] text-gray-300 border-[#2a2e3a] hover:border-[#00E054]/60 hover:text-[#00E054]"
          }`}
          onClick={() => setPage(p)}
        >
          {p}
        </button>
      ))}
      <button
        className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-[#00E054] to-[#00c248] text-white text-xl rounded-md flex items-center justify-center hover:from-[#00ff66] hover:to-[#00E054] hover:shadow-md hover:shadow-[#00E054]/30 transition-all duration-200 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:shadow-none transform hover:scale-105 active:scale-95"
        onClick={() => setPage(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
      >
        ›
      </button>
    </div>
  );
}

export default function HomeContent({
  initialMovies = [],
  initialTotalPages = 1,
  initialMood = "popular",
  initialPage = 1,
  initialSearch = "",
}: {
  initialMovies?: Movie[];
  initialTotalPages?: number;
  initialMood?: string;
  initialPage?: number;
  initialSearch?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, signOut } = useAuth();
  const { userProfile, updateProfile } = useMovieContext();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Extract username from email if profile username is empty
  const getDisplayName = () => {
    if (userProfile.username) return userProfile.username;
    if (user?.email) return user.email.split('@')[0];
    return user?.displayName || "User";
  };

  const [editForm, setEditForm] = useState({
    ...userProfile,
    username: getDisplayName()
  });
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(null);

  const [mood, setMood] = useState(initialMood);
  const [movies, setMovies] = useState<Movie[]>(initialMovies);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [search, setSearch] = useState(initialSearch);
  const [error, setError] = useState<string | null>(null);

  // 1. Sync state FROM URL params (e.g., when user clicks Back/Forward or initial load)
  useEffect(() => {
    const moodParam = searchParams.get("mood") || "popular";
    const queryParam = searchParams.get("query") || "";
    const pageParam = parseInt(searchParams.get("page") || "1", 10);

    // Only update state if it doesn't match the current state to avoid loops
    if (mood !== moodParam) setMood(moodParam);
    if (search !== queryParam) setSearch(queryParam);
    if (page !== pageParam) setPage(pageParam);
  }, [searchParams, mood, search, page]);

  // 2. Data fetching effect - depends on core state
  useEffect(() => {
    const getMovies = async () => {
      setLoading(true);
      setError(null);
      // Scroll to top when page changes
      window.scrollTo({ top: 0, behavior: 'smooth' });
      try {
        const { results, total_pages } = await fetchMovies(
          mood.toLowerCase(),
          page,
          search
        );

        setMovies(results);
        setTotalPages(total_pages);
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err.message : "Failed to fetch movies");
      } finally {
        setLoading(false);
      }
    };
    getMovies();
  }, [mood, page, search]);

  // 3. Sync state TO URL params
  useEffect(() => {
    const params = new URLSearchParams();
    if (mood && mood !== "popular") params.set("mood", mood);
    if (search) params.set("query", search);
    if (page > 1) params.set("page", page.toString());

    const newQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    // Only update the URL if it has actually changed to avoid feedback loops
    if (newQueryString !== currentQueryString) {
      router.replace(`/?${newQueryString}`, { scroll: false });
    }
  }, [mood, page, search, router, searchParams]);

  useEffect(() => {
    setPage(1);
  }, [mood, search]);

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setShowEditDialog(false);
    setProfilePicPreview(null);
  };

  const handleProfilePicChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setProfilePicPreview(result);
        setEditForm({ ...editForm, avatarUrl: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const showSearch = search.trim().length > 0;
  const heading = showSearch
    ? `Search results for "${search}"`
    : `Top ${mood} movies`;

  return (
    <div className="flex flex-col p-6 bg-black text-white min-h-screen">
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-3xl font-bold">
          Shaflix
        </h1>

        {/* Hamburger on mobile - same row */}
        <div className="md:hidden">
          <Navbar />
        </div>

        {/* Sign In button or User Avatar at top right - Desktop only */}
        {isFirebaseConfigured && (
          !user ? (
            <Button
              onClick={() => setShowAuthDialog(true)}
              className="hidden md:flex items-center gap-2 bg-gradient-to-r from-[#00E054] to-[#00c248] hover:from-[#00ff66] hover:to-[#00E054] text-white px-6 py-2 rounded-lg font-bold shadow-lg shadow-[#00E054]/30 hover:shadow-xl hover:shadow-[#00E054]/50 transition-all duration-300 transform hover:scale-105 active:scale-95 border-0"
            >
              <span>Sign in</span>
            </Button>
          ) : (
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
                  <DropdownMenuItem onClick={() => setShowEditDialog(true)} className="cursor-pointer">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Profile
                  </DropdownMenuItem>
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
          )
        )}
      </div>

      {/* Desktop Navbar only */}
      <div className="hidden md:block">
        <Navbar />
      </div>

      <div className="mt-6 mb-4 px-4 md:px-0">
        <SearchBar value={search} onChange={setSearch} />
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-center md:items-start px-4 md:px-0">
        <MoodSelector mood={mood} setMood={setMood} />
      </div>

      <h2 className="text-sm md:text-2xl font-bold mt-5 m-4 text-center md:text-left">
        {heading}
      </h2>

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 max-w-8xl w-full py-1 mx-auto">
          {Array.from({ length: 10 }).map((_, i) => (
            <MovieCardSkeleton key={i} />
          ))}
        </div>
      ) : error ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 max-w-8xl w-full py-1 mx-auto">
          <ErrorState
            message={error}
            onRetry={() => {
              setError(null);
              setLoading(true);
              fetchMovies(mood.toLowerCase(), page, search)
                .then(({ results, total_pages }) => {
                  setMovies(results);
                  setTotalPages(total_pages);
                })
                .catch((err) => setError(err instanceof Error ? err.message : "Failed to fetch movies"))
                .finally(() => setLoading(false));
            }}
          />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-5 max-w-8xl w-full py-1 mx-auto">
            {movies.map((movie, index) => (
              <div
                key={movie.id}
                className="animate-fade-in"
                style={{ animationDelay: `${Math.min(index * 30, 600)}ms` }}
              >
                <MovieCard movie={movie} page="discover" />
              </div>
            ))}
          </div>

          <Pagination page={page} totalPages={totalPages} setPage={setPage} />
        </>
      )}

      <AuthDialog open={showAuthDialog} onOpenChange={setShowAuthDialog} />

      {/* Edit Profile Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="bg-[#1F2428] border-[#2C3440] text-[#E5E7EB]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">EDIT PROFILE</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-xs font-semibold mb-3 block uppercase tracking-wide text-[#9CA3AF]">
                Profile Picture
              </label>
              <div className="flex flex-col items-center gap-3">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profilePicPreview || editForm.avatarUrl} />
                    <AvatarFallback className="bg-[#00E054] text-[#14181C] text-3xl">
                      {editForm.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <label
                    htmlFor="profile-pic-upload"
                    className="absolute bottom-0 right-0 h-8 w-8 bg-gradient-to-br from-[#00E054] to-[#00c248] hover:from-[#00ff66] hover:to-[#00E054] rounded-full flex items-center justify-center cursor-pointer transition-all duration-300 border-2 border-[#1F2428] shadow-lg shadow-[#00E054]/50 hover:shadow-xl hover:shadow-[#00E054]/70 transform hover:scale-110 active:scale-95"
                  >
                    <Edit className="w-4 h-4 text-[#14181C]" />
                  </label>
                  <input
                    id="profile-pic-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePicChange}
                    className="hidden"
                  />
                </div>
                <p className="text-xs text-[#6B7280] text-center">
                  Click the icon to upload a photo
                </p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block uppercase tracking-wide text-[#9CA3AF]">
                Display Name
              </label>
              <Input
                placeholder="Your name"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold mb-2 block uppercase tracking-wide text-[#9CA3AF]">
                Bio
              </label>
              <Textarea
                placeholder="Tell us about yourself..."
                value={editForm.bio}
                onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                rows={3}
                className="bg-[#14181C] border-[#2C3440] focus:border-[#00E054] text-[#E5E7EB] resize-none"
              />
            </div>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowEditDialog(false)}
                className="border-[#2C3440] hover:border-[#00E054] hover:bg-[#00E054]/10 hover:text-[#00E054] transition-all duration-300 rounded-lg"
              >
                CANCEL
              </Button>
              <Button
                onClick={handleSaveProfile}
                className="bg-gradient-to-r from-[#00E054] to-[#00c248] hover:from-[#00ff66] hover:to-[#00E054] text-[#14181C] font-semibold shadow-lg shadow-[#00E054]/30 hover:shadow-xl hover:shadow-[#00E054]/50 transition-all duration-300 transform hover:scale-105 active:scale-95 rounded-lg border-0"
              >
                SAVE CHANGES
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}