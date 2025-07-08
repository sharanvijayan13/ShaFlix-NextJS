"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close menu when clicking outside on mobile
  useEffect(() => {
    if (!isMounted) return;
    
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (isMenuOpen && !target.closest('.navbar-container') && !target.closest('.hamburger')) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, isMounted]);

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (!isMounted) return;
    
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMounted]);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const navLinks = [
    { href: "/", label: "Discover" },
    { href: "/favorites", label: "Favorites" },
    { href: "/watchlist", label: "Watchlist" },
    { href: "/watched", label: "Watched" },
  ];

  return (
    <div className="navbar-container relative z-10">
      {/* Desktop Navigation */}
      <div className="hidden md:flex text-lg flex-row text-gray-300 justify-end gap-10 mt-7">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="border-b-2 border-transparent hover:border-[#1db954] hover:text-[#1db954] transition-all duration-300"
          >
            {link.label}
          </Link>
        ))}
      </div>

      {/* Mobile Hamburger Button */}
      <div className="md:hidden mt-1">
        <button
          onClick={toggleMenu}
          className="hamburger p-2 text-gray-300 hover:text-[#1db954] transition-colors duration-300"
          aria-label="Toggle menu"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}
            />
            <span
              className={`block w-6 h-0.5 bg-current transition-all duration-300 ${
                isMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
              }`}
            />
          </div>
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMounted && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 z-[9998] transition-opacity duration-300 md:hidden ${
            isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={closeMenu}
        />
      )}

      {/* Mobile Sidebar */}
      {isMounted && (
        <div
          className={`fixed top-0 left-0 h-full w-64 bg-black border-r border-gray-800 z-[9999] transform transition-transform duration-300 ease-in-out md:hidden ${
            isMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-800">
              <h2 className="text-xl font-bold text-white">Shaflix</h2>
              <button
                onClick={closeMenu}
                className="text-gray-300 hover:text-[#1db954] transition-colors duration-300"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 p-6">
              <ul className="space-y-6">
                {navLinks.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      className="block text-lg text-gray-300 hover:text-[#1db954] hover:border-l-4 border-[#1db954] pl-4 transition-all duration-300 py-2"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}