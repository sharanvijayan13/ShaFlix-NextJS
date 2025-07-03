interface MoodSelectorProps {
  mood: string;
  setMood: (mood: string) => void;
}

export default function MoodSelector({ mood, setMood }: MoodSelectorProps) {
  return (
    <div className="flex items-center p-4 md:p-8 gap-8 relative">
      <select
        id="mood-select"
        value={mood}
        onChange={(e) => setMood(e.target.value)}
        className="p-3 text-sm w-full max-w-[300px] bg-[#2a2a2a] text-[#f1f1f1] border border-[#333] rounded-md outline-none mb-5"
      >
        <option value="Popular">Popular</option>
        <option value="Happy">Happy</option>
        <option value="Sad">Sad</option>
        <option value="Excited">Excited</option>
        <option value="Romantic">Romantic</option>
        <option value="Thrilling">Thrilling</option>
        <option value="Funny">Funny</option>
        <option value="Action">Action</option>
        <option value="Drama">Drama</option>
        <option value="Fantasy">Fantasy</option>
        <option value="Scary">Scary</option>
      </select>
    </div>
  );
}
