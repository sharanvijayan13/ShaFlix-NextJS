export default function Navbar() {
    return (
      <div className="flex text-lg flex-row text-gray-300 justify-end gap-10 mt-7">
        <a href="#" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">Discover</a>
        <a href="#" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">Favorites</a>
        <a href="#" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">Watchlist</a>
        <a href="#" className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300">Watched</a>
      </div>
    );
  }
  