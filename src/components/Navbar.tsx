'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link 
              href="/"
              className="flex items-center gap-2 text-2xl font-bold text-orange-500"
            >
              <span className="steam-icon">👨‍🍳</span>
              Pantry Chef
            </Link>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="/"
              className={`nav-link ${
                isActive('/') 
                  ? 'text-orange-500 font-semibold' 
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              Search Recipes
            </Link>
            <Link
              href="/create"
              className={`nav-link ${
                isActive('/create') 
                  ? 'text-orange-500 font-semibold' 
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              Create Recipe
            </Link>
            <Link
              href="/profile"
              className={`nav-link ${
                isActive('/profile') 
                  ? 'text-orange-500 font-semibold' 
                  : 'text-gray-600 hover:text-orange-500'
              }`}
            >
              My Profile
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 