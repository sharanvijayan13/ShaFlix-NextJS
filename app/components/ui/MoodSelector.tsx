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
    <div className="my-2 px-6 md:px-0">
      <select
        id="mood-select"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        className="bg-gray-900 text-white p-2 rounded w-full max-w-2xs mx-auto md:mx-0 block"
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