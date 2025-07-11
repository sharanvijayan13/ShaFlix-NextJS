"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MoodSelectorProps {
  mood: string;
  setMood: (mood: string) => void;
}

export default function MoodSelector({ mood, setMood }: MoodSelectorProps) {
  const moodOptions = [
    { value: "popular", label: "Popular" },
    { value: "excited", label: "Excited" },
    { value: "happy", label: "Happy" },
    { value: "sad", label: "Sad" },
    { value: "scared", label: "Scared" },
    { value: "disturbing", label: "Disturbing" },
    { value: "romantic", label: "Romantic" },
    { value: "curious", label: "Curious" },
    { value: "nostalgic", label: "Nostalgic" },
    { value: "thoughtful", label: "Thoughtful" },
    { value: "adventurous", label: "Adventurous" },
    { value: "mysterious", label: "Mysterious" },
    { value: "thrilled", label: "Thrilled" },
  ];

  return (
    <div className="my-4 w-full max-w-xs mx-auto md:mx-0">
      <Select value={mood} onValueChange={setMood}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select mood" />
        </SelectTrigger>
        <SelectContent>
          {moodOptions.map((moodOption) => (
            <SelectItem key={moodOption.value} value={moodOption.value}>
              {moodOption.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
