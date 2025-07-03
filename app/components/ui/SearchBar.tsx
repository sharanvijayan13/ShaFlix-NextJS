export default function SearchBar() {
    return (
      <div className="relative w-full max-w-[410px] m-5 ml-auto mr-0 flex justify-end">
        <input
          type="text"
          placeholder="Search for movies..."
          className="px-4 pr-5 py-3 text-sm w-full bg-[#2a2a2a] text-[#f1f1f1] border border-[#333] rounded-md outline-none placeholder:text-[#888] hover:border-[#1db954] hover:border-3 transition-all"
        />
      </div>
    );
  }
  