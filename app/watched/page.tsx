"use client"

import Navbar from "../components/ui/Navbar";

export default function Home() {

  return (
    <div className="flex flex-col p-13 bg-black text-white h-screen">
      
      <h1 className="text-2xl font-bold mb-5">Shaflix: Mood-Based Movie Recommender</h1>
      <Navbar />
      <h2 className="text-2xl font-bold mt-5 m-4">
        Watched
      </h2>
    </div>
  );
}
