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
    <div className="my-4 px-4 md:px-0">
      <select
        id="mood-select"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        className="bg-gray-800 text-white p-2 rounded w-full max-w-sm mx-auto md:mx-0 block"
      >
        {moods.map((m) => (
          <option key={m} value={m}>
            {m.charAt(0).toUpperCase() + m.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}
