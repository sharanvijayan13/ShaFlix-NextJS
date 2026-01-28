"use client";

import { useMovieContext } from "../contexts/MovieContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit, Film, Heart, List, BookOpen } from "lucide-react";
import { useState } from "react";
import Image from "next/image";

export default function ProfilePage() {
  const { userProfile, updateProfile, favorites, diaryEntries, customLists, watched } = useMovieContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState(userProfile);

  const handleSave = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        {/* Profile Header */}
        <Card className="bg-gray-800/50 border-gray-700 p-8 mb-6">
          <div className="flex items-start gap-6">
            <Avatar className="w-32 h-32">
              <AvatarImage src={userProfile.avatarUrl} />
              <AvatarFallback className="text-4xl bg-gradient-to-br from-purple-500 to-pink-500">
                {userProfile.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md"
                    placeholder="Username"
                  />
                  <input
                    type="text"
                    value={editForm.handle}
                    onChange={(e) => setEditForm({ ...editForm, handle: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md"
                    placeholder="@handle"
                  />
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md resize-none"
                    placeholder="Bio"
                    rows={3}
                  />
                  <input
                    type="text"
                    value={editForm.avatarUrl}
                    onChange={(e) => setEditForm({ ...editForm, avatarUrl: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-700 rounded-md"
                    placeholder="Avatar URL"
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleSave}>Save</Button>
                    <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{userProfile.username}</h1>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                  </div>
                  <p className="text-gray-400 mb-3">{userProfile.handle}</p>
                  <p className="text-gray-300 mb-4">{userProfile.bio}</p>
                </>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-6">
                <StatCard icon={<Film />} label="Watched" value={userProfile.stats.moviesWatched} />
                <StatCard icon={<BookOpen />} label="Diary" value={userProfile.stats.diaryEntries} />
                <StatCard icon={<Heart />} label="Favorites" value={userProfile.stats.favorites} />
                <StatCard icon={<List />} label="Lists" value={userProfile.stats.lists} />
                <StatCard icon={<Film />} label="Hours" value={Math.round(userProfile.stats.hoursWatched)} />
              </div>
            </div>
          </div>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="watched" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/50">
            <TabsTrigger value="watched">Watched</TabsTrigger>
            <TabsTrigger value="favorites">Favorites</TabsTrigger>
            <TabsTrigger value="diary">Diary</TabsTrigger>
            <TabsTrigger value="lists">Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="watched" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {watched.map((movie) => (
                <MoviePoster key={movie.id} movie={movie} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {favorites.map((movie) => (
                <MoviePoster key={movie.id} movie={movie} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="diary" className="mt-6">
            <div className="space-y-4">
              {diaryEntries.map((entry) => (
                <Card key={entry.id} className="bg-gray-800/50 border-gray-700 p-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">Movie ID: {entry.movieId}</p>
                      <p className="text-sm text-gray-400">{new Date(entry.watchedDate).toLocaleDateString()}</p>
                      {entry.rating && <p className="text-yellow-400">★ {entry.rating}</p>}
                      {entry.review && <p className="mt-2 text-gray-300">{entry.review}</p>}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="lists" className="mt-6">
            <div className="grid gap-4">
              {customLists.map((list) => (
                <Card key={list.id} className="bg-gray-800/50 border-gray-700 p-4">
                  <h3 className="text-xl font-bold mb-2">{list.name}</h3>
                  <p className="text-gray-400 mb-2">{list.description}</p>
                  <p className="text-sm text-gray-500">{list.movieIds.length} movies</p>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-gray-700/30 rounded-lg p-3 text-center">
      <div className="flex justify-center mb-1 text-purple-400">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-gray-400">{label}</p>
    </div>
  );
}

function MoviePoster({ movie }: { movie: { id: number; title: string; poster_path: string } }) {
  return (
    <div className="relative group cursor-pointer">
      <Image
        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
        alt={movie.title}
        width={500}
        height={750}
        className="w-full rounded-lg shadow-lg group-hover:scale-105 transition-transform"
      />
      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
        <p className="text-white text-center px-2 font-semibold">{movie.title}</p>
      </div>
    </div>
  );
}
