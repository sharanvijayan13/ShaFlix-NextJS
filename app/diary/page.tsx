"use client";

import { useState, useMemo, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarRating from "../components/StarRating";
import {
  Calendar,
  Film,
  ChevronLeft,
  ChevronRight,
  Plus,
  Home,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getMovieCredits } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";

interface MovieDetails {
  id: number;
  title: string;
  poster_path: string;
  director?: string;
  release_date?: string;
}

export default function DiaryPage() {
  const { diaryEntries } = useMovieContext();
  const [movieDetails, setMovieDetails] = useState<Map<number, MovieDetails>>(
    new Map()
  );
  const [loadingMovies, setLoadingMovies] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = useMemo(() => [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ], []);

  const stats = useMemo(() => {
    const avgRating =
      diaryEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
        diaryEntries.length || 0;
    const thisMonth = diaryEntries.filter(
      (e) => new Date(e.watchedDate).getMonth() === new Date().getMonth()
    ).length;
    const thisYear = diaryEntries.filter(
      (e) => new Date(e.watchedDate).getFullYear() === new Date().getFullYear()
    ).length;

    return { avgRating, thisMonth, thisYear };
  }, [diaryEntries]);

  // Sort entries by date (most recent first)
  const sortedEntries = useMemo(() => {
    return [...diaryEntries].sort(
      (a, b) =>
        new Date(b.watchedDate).getTime() - new Date(a.watchedDate).getTime()
    );
  }, [diaryEntries]);

  // Fetch movie details for all entries
  useEffect(() => {
    if (diaryEntries.length === 0) {
      setLoadingMovies(false);
      return;
    }

    const fetchMovieDetails = async () => {
      setLoadingMovies(true);

      const newDetails = new Map<number, MovieDetails>();
      const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;

      if (!API_KEY) {
        console.error("TMDB API key is not configured");
        setLoadingMovies(false);
        return;
      }

      for (const entry of diaryEntries) {
        try {
          const movieRes = await fetch(
            `https://api.themoviedb.org/3/movie/${entry.movieId}?api_key=${API_KEY}`
          );

          if (movieRes.ok) {
            const movieData = await movieRes.json();

            let director = undefined;
            try {
              const credits = await getMovieCredits(entry.movieId);
              director = credits.crew?.find(
                (person: { job: string; name: string }) => person.job === "Director"
              )?.name;
            } catch {
              // Ignore credits errors
            }

            newDetails.set(entry.movieId, {
              id: entry.movieId,
              title: movieData.title || `Movie #${entry.movieId}`,
              poster_path: movieData.poster_path || "",
              director,
              release_date: movieData.release_date,
            });
          }
        } catch (error) {
          console.error(`Error fetching movie ${entry.movieId}:`, error);
        }
      }

      setMovieDetails(newDetails);
      setLoadingMovies(false);
    };

    fetchMovieDetails();
  }, [diaryEntries]);

  // Calendar logic
  const entriesByDate = useMemo(() => {
    const map = new Map<string, typeof diaryEntries>();
    diaryEntries.forEach((entry) => {
      const dateKey = new Date(entry.watchedDate).toDateString();
      if (!map.has(dateKey)) {
        map.set(dateKey, []);
      }
      map.get(dateKey)!.push(entry);
    });
    return map;
  }, [diaryEntries]);

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const days = [];
  for (let i = 0; i < startingDayOfWeek; i++) {
    days.push(<div key={`empty-${i}`} className="aspect-square" />);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day);
    const dateKey = date.toDateString();
    const entries = entriesByDate.get(dateKey) || [];
    const hasEntries = entries.length > 0;
    const isToday = date.toDateString() === new Date().toDateString();

    days.push(
      <button
        key={day}
        className={`aspect-square border rounded transition-all duration-200 p-1 md:p-2 ${
          hasEntries
            ? "bg-[#00E054]/10 border-[#00E054] hover:bg-[#00E054]/20 cursor-pointer"
            : isToday
            ? "border-[#40BCF4] bg-[#40BCF4]/5"
            : "border-[#2C3440] hover:border-[#6B7280]"
        }`}
      >
        <div
          className={`text-[10px] md:text-xs font-semibold ${
            isToday ? "text-[#40BCF4]" : hasEntries ? "text-[#00E054]" : "text-[#9CA3AF]"
          }`}
        >
          {day}
        </div>
        {hasEntries && (
          <div className="mt-0.5">
            <div className="text-[8px] md:text-[10px] font-bold text-[#00E054]">
              {entries.length}
            </div>
          </div>
        )}
      </button>
    );
  }

  // Group entries by month/year
  const groupedEntries = useMemo(() => {
    const groups: { [key: string]: typeof sortedEntries } = {};
    sortedEntries.forEach((entry) => {
      const date = new Date(entry.watchedDate);
      const key = `${monthNames[date.getMonth()]} ${date.getFullYear()}`;
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(entry);
    });
    return groups;
  }, [sortedEntries, monthNames]);

  return (
    <div className="min-h-screen bg-[#14181C] text-[#E5E7EB]">
      <div className="max-w-[1100px] mx-auto px-6 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <div className="flex items-center gap-2 md:gap-4">
            <h1 className="text-2xl md:text-4xl font-bold tracking-tight">MY DIARY</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCalendar(true)}
              className="hover:bg-[#1F2428] hover:text-[#00E054] transition-all duration-200 h-8 w-8 md:h-10 md:w-10"
            >
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
            </Button>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <Link href="/watchlist">
              <Button 
                className="bg-[#00E054]/10 hover:bg-[#00E054]/20 text-[#00E054] font-semibold hover:text-[#00E054] transition-all duration-200 h-8 md:h-10 px-2 md:px-4"
              >
                <Plus className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">ADD DIARY ENTRY</span>
              </Button>
            </Link>
            <Link href="/">
              <Button 
                variant="outline"
                className="border-[#2C3440] hover:border-[#00E054] hover:bg-[#00E054]/10 hover:text-[#00E054] transition-all duration-200 h-8 md:h-10 px-2 md:px-4"
              >
                <Home className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">BACK TO HOME</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 md:grid-cols-3 gap-2 md:gap-4 mb-6 md:mb-10">
          <Card className="bg-[#1F2428] border-[#2C3440] p-2 md:p-5">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <p className="text-[9px] md:text-xs text-[#9CA3AF] uppercase tracking-wide font-semibold">Total Films</p>
            </div>
            <p className="text-xl md:text-3xl font-bold">{diaryEntries.length}</p>
          </Card>

          <Card className="bg-[#1F2428] border-[#2C3440] p-2 md:p-5">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <p className="text-[9px] md:text-xs text-[#9CA3AF] uppercase tracking-wide font-semibold">This Month</p>
            </div>
            <p className="text-xl md:text-3xl font-bold">{stats.thisMonth}</p>
          </Card>

          <Card className="bg-[#1F2428] border-[#2C3440] p-2 md:p-5">
            <div className="flex items-center gap-1 md:gap-2 mb-1 md:mb-2">
              <p className="text-[9px] md:text-xs text-[#9CA3AF] uppercase tracking-wide font-semibold">This Year</p>
            </div>
            <p className="text-xl md:text-3xl font-bold">{stats.thisYear}</p>
          </Card>
        </div>

        {/* Diary Entries Timeline */}
        {loadingMovies ? (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-4 border-[#2C3440] border-t-[#00E054] rounded-full animate-spin mb-4"></div>
            <p className="text-sm text-[#9CA3AF]">Loading your diary...</p>
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-[#1F2428] border-2 border-[#2C3440] flex items-center justify-center mb-6">
              <Film className="w-12 h-12 text-[#6B7280]" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Start logging your movie journey.</h2>
            <p className="text-[#9CA3AF] mb-8 text-center max-w-md">
              Keep track of every film you watch with ratings, reviews, and personal notes.
            </p>
            <Link href="/watchlist">
              <Button 
                className="bg-[#00E054] hover:bg-[#00E054]/90 text-[#14181C] font-semibold px-8 py-6 text-base transition-all duration-200"
              >
                <Plus className="w-5 h-5 md:mr-2" />
                <span className="hidden md:inline">ADD YOUR FIRST ENTRY</span>
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {Object.entries(groupedEntries).map(([monthYear, entries]) => (
              <div key={monthYear}>
                <div className="flex items-center gap-4 mb-4 md:mb-6">
                  <div className="h-px bg-[#2C3440] flex-1"></div>
                  <h2 className="text-xs md:text-sm font-bold uppercase tracking-wider text-[#6B7280]">
                    {monthYear}
                  </h2>
                  <div className="h-px bg-[#2C3440] flex-1"></div>
                </div>
                
                <div className="space-y-3 md:space-y-4">
                  {entries.map((entry) => {
                    const movie = movieDetails.get(entry.movieId);
                    const watchedDate = new Date(entry.watchedDate);

                    return (
                      <Card
                        key={entry.id}
                        className="bg-[#1F2428] border-[#2C3440] hover:border-[#00E054] transition-all duration-200 overflow-hidden"
                      >
                        <div className="flex gap-1.5 md:gap-3 p-2 md:p-5">
                          {/* Date Badge */}
                          <div className="flex-shrink-0 text-center bg-[#14181C] border border-[#2C3440] rounded-lg p-1 md:p-3 w-10 md:w-20 h-[60px] md:h-[105px] flex flex-col justify-center">
                            <div className="text-[7px] md:text-[10px] text-[#6B7280] uppercase tracking-wide font-semibold">
                              {monthNames[watchedDate.getMonth()].slice(0, 3)}
                            </div>
                            <div className="text-base md:text-2xl font-bold text-[#E5E7EB] my-0.5 md:my-1">
                              {watchedDate.getDate()}
                            </div>
                            <div className="text-[7px] md:text-[10px] text-[#6B7280]">
                              {watchedDate.getFullYear()}
                            </div>
                          </div>

                          {/* Movie Poster */}
                          <div className="flex-shrink-0">
                            {movie?.poster_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                alt={movie.title}
                                width={40}
                                height={60}
                                className="rounded border border-[#2C3440] object-cover md:w-[70px] md:h-[105px]"
                              />
                            ) : (
                              <div className="w-[40px] h-[60px] md:w-[70px] md:h-[105px] bg-[#14181C] border border-[#2C3440] rounded flex items-center justify-center">
                                <Film className="w-4 h-4 md:w-8 md:h-8 text-[#6B7280]" />
                              </div>
                            )}
                          </div>

                          {/* Movie Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-xs md:text-lg tracking-tight mb-0.5 leading-tight">
                                  {movie?.title || `Movie #${entry.movieId}`}
                                  {movie?.release_date && (
                                    <span className="text-[#6B7280] font-normal ml-1 text-[10px] md:text-sm">
                                      ({new Date(movie.release_date).getFullYear()})
                                    </span>
                                  )}
                                </h3>
                                {movie?.director && (
                                  <p className="text-[10px] md:text-sm text-[#9CA3AF] leading-tight">
                                    Directed by {movie.director}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                                {entry.rewatch && (
                                  <span className="text-[8px] md:text-xs bg-[#40BCF4]/20 text-[#40BCF4] px-1 md:px-2 py-0.5 rounded font-semibold uppercase tracking-wide">
                                    Rewatch
                                  </span>
                                )}
                              </div>
                            </div>

                            {entry.rating && (
                              <div className="mb-1.5 md:mb-3 scale-75 md:scale-100 origin-left">
                                <StarRating
                                  rating={entry.rating}
                                  readonly
                                  size="sm"
                                />
                              </div>
                            )}

                            {entry.review && (
                              <p className="text-[10px] md:text-sm text-[#E5E7EB] leading-snug md:leading-relaxed mb-1.5 md:mb-3 line-clamp-2 md:line-clamp-3">
                                {entry.review}
                              </p>
                            )}

                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-[8px] md:text-xs bg-[#00E054]/10 text-[#00E054] px-1 md:px-2 py-0.5 rounded border border-[#00E054]/30 font-medium"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Calendar Dialog */}
        <Dialog open={showCalendar} onOpenChange={setShowCalendar}>
          <DialogContent className="bg-[#1F2428] border-[#2C3440] text-[#E5E7EB] max-w-[320px] md:max-w-sm p-4 md:p-6">
            {/* Title for accessibility */}
            <DialogTitle className="text-sm md:text-lg font-bold uppercase tracking-tight text-center mb-3 md:mb-4">
              {monthNames[month]} {year}
            </DialogTitle>

            <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-1 md:mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-[10px] md:text-xs font-bold text-[#6B7280] uppercase py-1 md:py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5 md:gap-1 mb-3 md:mb-4">{days}</div>

            {/* Navigation arrows at the bottom */}
            <div className="flex gap-2 items-center justify-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={previousMonth}
                className="h-7 w-7 md:h-9 md:w-9 hover:bg-[#14181C] hover:text-[#00E054] border border-[#2C3440]"
              >
                <ChevronLeft className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={nextMonth}
                className="h-7 w-7 md:h-9 md:w-9 hover:bg-[#14181C] hover:text-[#00E054] border border-[#2C3440]"
              >
                <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
