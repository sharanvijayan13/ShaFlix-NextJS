"use client"

import { useState } from "react";
import Navbar from "./components/ui/Navbar";
import SearchBar from "./components/ui/SearchBar";
import MoodSelector from "./components/ui/MoodSelector";

export default function Home() {
  const [mood, setMood] = useState("Popular");

  return (
    <div className="flex flex-col p-13 bg-black text-white h-screen">
      
      <h1 className="text-2xl font-bold mb-5">Shaflix: Mood-Based Movie Recommender</h1>
      
      <Navbar />
      <SearchBar />
      <MoodSelector mood={mood} setMood={setMood} />

      <h2 className="text-xl font-semibold mt-5">
        Top {mood} Movies
      </h2>
      
      {/* Movie Grid Goes Here */}

    </div>
  );
}
