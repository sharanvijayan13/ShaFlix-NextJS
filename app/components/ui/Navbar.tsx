import Link from "next/link";

export default function Navbar() {
  return (
    <div className="flex text-lg flex-row text-gray-300 justify-end gap-10 mt-7">
      
      <Link href="/" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">
        Discover
      </Link>

      <Link href="/favorites" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">
        Favorites
      </Link> 

      <Link href="/watchlist" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">
        Watchlist
      </Link>

      <Link href="/watched" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">
        Watched
      </Link>
    </div>
  );
}
