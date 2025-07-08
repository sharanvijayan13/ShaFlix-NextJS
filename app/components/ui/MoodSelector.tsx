"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MoodSelectorProps {
  mood: string;
  setMood: (mood: string) => void;
}

export default function MoodSelector({ mood, setMood }: MoodSelectorProps) {
  const moods = [
    "popular",
    "action",
    "comedy",
    "horror",
    "romantic",
    "scifi",
    "animation",
    "drama",
    "crime",
    "mystery",
    "thriller",
  ];

  return (
    <div className="my-4 w-full max-w-xs mx-auto md:mx-0">
      <Select value={mood} onValueChange={setMood}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select mood" />
        </SelectTrigger>
        <SelectContent>
          {moods.map((moodOption) => (
            <SelectItem key={moodOption} value={moodOption}>
              {moodOption.charAt(0).toUpperCase() + moodOption.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
