"use client";

import { useState, useMemo } from "react";
import { useMovieContext } from "../contexts/MovieContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Film, Star, TrendingUp } from "lucide-react";

export default function DiaryCalendar() {
  const { diaryEntries } = useMovieContext();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

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

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
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
      <div
        key={day}
        className={`aspect-square border rounded-xl p-3 transition-all duration-300 ${
          hasEntries
            ? "bg-gradient-to-br from-[#1db954]/30 to-green-600/30 border-[#1db954] cursor-pointer hover:from-[#1db954]/40 hover:to-green-600/40 hover:scale-105 shadow-lg shadow-[#1db954]/20"
            : isToday
            ? "border-gray-500 bg-gray-800/50"
            : "border-gray-800 hover:border-gray-700 bg-gray-900/30"
        }`}
      >
        <div className={`text-sm font-semibold mb-1 ${isToday ? "text-[#1db954]" : ""}`}>
          {day}
        </div>
        {hasEntries && (
          <div className="mt-1">
            <div className="text-xs text-[#1db954] font-bold flex items-center gap-1">
              <Film className="w-3 h-3" />
              {entries.length}
            </div>
          </div>
        )}
      </div>
    );
  }

  const monthStats = useMemo(() => {
    const monthEntries = diaryEntries.filter(
      e => new Date(e.watchedDate).getMonth() === month && new Date(e.watchedDate).getFullYear() === year
    );
    const avgRating = monthEntries.reduce((sum, e) => sum + (e.rating || 0), 0) / monthEntries.length || 0;
    return { count: monthEntries.length, avgRating };
  }, [diaryEntries, month, year]);

  return (
    <Card className="bg-gray-900 border-gray-800 p-6 rounded-xl">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold text-white">
          {monthNames[month]} {year}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={previousMonth}
            className="hover:bg-[#1db954] hover:text-white hover:border-[#1db954] transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={nextMonth}
            className="hover:bg-[#1db954] hover:text-white hover:border-[#1db954] transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-3 mb-3">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center text-sm font-bold text-[#1db954]">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-3 mb-8">
        {days}
      </div>

      {/* Month Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6 border-t border-gray-800">
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border border-purple-500/30 rounded-xl p-5 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Film className="w-5 h-5 text-purple-400" />
            <p className="text-sm text-gray-400 font-medium">This Month</p>
          </div>
          <p className="text-3xl font-bold text-white">{monthStats.count}</p>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-600/20 to-orange-800/20 border border-yellow-500/30 rounded-xl p-5 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Star className="w-5 h-5 text-yellow-400" />
            <p className="text-sm text-gray-400 font-medium">Avg Rating</p>
          </div>
          <p className="text-3xl font-bold text-white">
            {monthStats.avgRating > 0 ? monthStats.avgRating.toFixed(1) : "—"}
          </p>
        </div>
        
        <div className="bg-gradient-to-br from-green-600/20 to-emerald-800/20 border border-green-500/30 rounded-xl p-5 text-center backdrop-blur-sm">
          <div className="flex items-center justify-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-green-400" />
            <p className="text-sm text-gray-400 font-medium">Total Entries</p>
          </div>
          <p className="text-3xl font-bold text-white">{diaryEntries.length}</p>
        </div>
      </div>
    </Card>
  );
}
