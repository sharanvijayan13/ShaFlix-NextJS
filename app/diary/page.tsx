"use client";

import { useState, useMemo, useEffect } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import StarRating from "../components/StarRating";
import {
  Calendar,
  Film,
  Star,
  Clock,
  ChevronLeft,
  ChevronRight,
  Heart,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getMovieCredits } from "../lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
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

  const stats = useMemo(() => {
    const avgRating =
      diaryEntries.reduce((sum, e) => sum + (e.rating || 0), 0) /
        diaryEntries.length || 0;
    const thisMonth = diaryEntries.filter(
      (e) => new Date(e.watchedDate).getMonth() === new Date().getMonth()
    ).length;

    return { avgRating, thisMonth };
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
                (person: any) => person.job === "Director"
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
          } else {
            console.error(`Failed to fetch movie ${entry.movieId}: ${movieRes.status}`);
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

  const monthNames = [
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
  ];

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
        className={`aspect-square border rounded-lg p-2 transition-all duration-200 ${
          hasEntries
            ? "bg-[#1db954]/20 border-[#1db954]/50 hover:bg-[#1db954]/30 cursor-pointer"
            : isToday
            ? "border-gray-600 bg-gray-800/30"
            : "border-gray-800"
        }`}
      >
        <div
          className={`text-xs font-semibold ${isToday ? "text-[#1db954]" : ""}`}
        >
          {day}
        </div>
        {hasEntries && (
          <div className="mt-0.5">
            <div className="text-[10px] font-bold text-[#1db954]">
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
  }, [sortedEntries]);

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Film className="w-8 h-8 text-[#1db954]" />
            <h1 className="text-3xl font-bold">My Diary</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setShowCalendar(true)}
              className="hover:bg-[#1db954] hover:text-white"
            >
              <Calendar className="w-5 h-5" />
            </Button>
          </div>
          <Link href="/">
            <Button
              variant="outline"
              className="hover:bg-[#1db954] hover:text-white hover:border-[#1db954]"
            >
              Back to Home
            </Button>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Film className="w-4 h-4 text-purple-400" />
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <p className="text-2xl font-bold">{diaryEntries.length}</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Star className="w-4 h-4 text-yellow-400" />
              <p className="text-xs text-gray-400">Avg Rating</p>
            </div>
            <p className="text-2xl font-bold">{stats.avgRating.toFixed(1)}</p>
          </Card>

          <Card className="bg-gray-900 border-gray-800 p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-blue-400" />
              <p className="text-xs text-gray-400">This Month</p>
            </div>
            <p className="text-2xl font-bold">{stats.thisMonth}</p>
          </Card>
        </div>

        {/* Diary Entries List */}
        {loadingMovies ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">Loading movies...</p>
          </div>
        ) : sortedEntries.length === 0 ? (
          <div className="text-center py-16">
            <Film className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <p className="text-xl text-gray-400">No diary entries yet</p>
            <p className="text-sm text-gray-500 mt-2">
              Start watching movies and add them to your diary!
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedEntries).map(([monthYear, entries]) => (
              <div key={monthYear}>
                <h2 className="text-xl font-bold mb-4 text-gray-400">
                  {monthYear}
                </h2>
                <div className="space-y-3">
                  {entries.map((entry) => {
                    const movie = movieDetails.get(entry.movieId);
                    const watchedDate = new Date(entry.watchedDate);

                    return (
                      <Card
                        key={entry.id}
                        className="bg-gray-900 border-gray-800 hover:border-[#1db954] transition-all duration-300"
                      >
                        <div className="flex gap-4 p-4">
                          {/* Date Badge */}
                          <div className="flex-shrink-0 text-center bg-gray-800 rounded-lg p-3 w-20">
                            <div className="text-xs text-gray-400 uppercase">
                              {monthNames[watchedDate.getMonth()].slice(0, 3)}
                            </div>
                            <div className="text-3xl font-bold">
                              {watchedDate.getDate()}
                            </div>
                            <div className="text-xs text-gray-400">
                              {watchedDate.getFullYear()}
                            </div>
                          </div>

                          {/* Movie Poster */}
                          <div className="flex-shrink-0">
                            {movie?.poster_path ? (
                              <Image
                                src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`}
                                alt={movie.title}
                                width={60}
                                height={90}
                                className="rounded-lg object-cover"
                              />
                            ) : (
                              <div className="w-15 h-22 bg-gray-700 rounded-lg flex items-center justify-center">
                                <Film className="w-6 h-6 text-gray-500" />
                              </div>
                            )}
                          </div>

                          {/* Movie Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <h3 className="font-bold text-lg">
                                  {movie?.title || `Movie #${entry.movieId}`}
                                </h3>
                                {movie?.director && (
                                  <p className="text-sm text-gray-400">
                                    Directed by {movie.director}
                                  </p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {entry.rewatch && (
                                  <span className="text-xs bg-purple-500/30 text-purple-300 px-2 py-1 rounded-full">
                                    Rewatch
                                  </span>
                                )}
                              </div>
                            </div>

                            {entry.rating && (
                              <div className="mb-2">
                                <StarRating
                                  rating={entry.rating}
                                  readonly
                                  size="sm"
                                />
                              </div>
                            )}

                            {entry.review && (
                              <p className="text-sm text-gray-300 mt-2 line-clamp-2">
                                {entry.review}
                              </p>
                            )}

                            {entry.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {entry.tags.map((tag) => (
                                  <span
                                    key={tag}
                                    className="text-xs bg-[#1db954]/20 text-[#1db954] px-2 py-1 rounded-full"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Release Year */}
                          {movie?.release_date && (
                            <div className="flex-shrink-0 text-gray-400 text-sm">
                              {new Date(movie.release_date).getFullYear()}
                            </div>
                          )}
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
          <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>
                  {monthNames[month]} {year}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={previousMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={nextMonth}
                    className="h-8 w-8 p-0"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                <div
                  key={i}
                  className="text-center text-xs font-bold text-gray-500"
                >
                  {day}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">{days}</div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
