"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  TrendingUp,
  Zap,
  Smile,
  CloudRain,
  Ghost,
  Skull,
  Heart,
  Lightbulb,
  Clock,
  Brain,
  Compass,
  Search,
  Flame,
} from "lucide-react";

interface MoodSelectorProps {
  mood: string;
  setMood: (mood: string) => void;
}

export default function MoodSelector({ mood, setMood }: MoodSelectorProps) {
  const moodOptions = [
    { value: "popular", label: "Popular", icon: TrendingUp, color: "text-blue-400" },
    { value: "excited", label: "Excited", icon: Zap, color: "text-yellow-400" },
    { value: "happy", label: "Happy", icon: Smile, color: "text-green-400" },
    { value: "sad", label: "Sad", icon: CloudRain, color: "text-blue-300" },
    { value: "scared", label: "Scared", icon: Ghost, color: "text-purple-400" },
    { value: "disturbing", label: "Disturbing", icon: Skull, color: "text-red-500" },
    { value: "romantic", label: "Romantic", icon: Heart, color: "text-pink-400" },
    { value: "curious", label: "Curious", icon: Lightbulb, color: "text-orange-400" },
    { value: "nostalgic", label: "Nostalgic", icon: Clock, color: "text-amber-400" },
    { value: "thoughtful", label: "Thoughtful", icon: Brain, color: "text-indigo-400" },
    { value: "adventurous", label: "Adventurous", icon: Compass, color: "text-teal-400" },
    { value: "mysterious", label: "Mysterious", icon: Search, color: "text-violet-400" },
    { value: "thrilled", label: "Thrilled", icon: Flame, color: "text-red-400" },
  ];

  const selectedMood = moodOptions.find((m) => m.value === mood);

  return (
    <div className="my-4 w-full max-w-xs mx-auto md:mx-0">
      <Select value={mood} onValueChange={setMood}>
        <SelectTrigger className="w-full h-12 border-2 hover:border-[#1db954] transition-colors">
          <SelectValue placeholder="Select mood">
            {selectedMood && (
              <div className="flex items-center gap-2">
                <selectedMood.icon className={`w-5 h-5 ${selectedMood.color}`} />
                <span className="font-medium">{selectedMood.label}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {moodOptions.map((moodOption) => {
            const Icon = moodOption.icon;
            return (
              <SelectItem
                key={moodOption.value}
                value={moodOption.value}
                className="cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${moodOption.color}`} />
                  <span>{moodOption.label}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
}
