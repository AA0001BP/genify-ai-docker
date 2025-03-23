'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthContext } from '@/lib/contexts/AuthContext';
import { Brain, User, LogOut, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuthContext();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    const success = await logout();
    if (success) {
      router.push('/login');
      setMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <div className="container flex h-16 items-center justify-between px-4 md:px-6">
        <Link 
          href="/" 
          className="font-bold text-xl flex items-center space-x-2"
        >
          <Brain className="h-6 w-6 text-primary" />
          <span>Genify</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {!loading && (user ? (
            <>
              <Link 
                href="/humanize" 
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === '/humanize' ? 'text-primary' : ''
                }`}
              >
                Humanize
              </Link>
              <Link 
                href="/account" 
                className={`text-sm font-medium hover:text-primary transition-colors ${
                  pathname === '/account' ? 'text-primary' : ''
                }`}
              >
                Account
              </Link>
              <Button
                onClick={handleLogout}
                variant="ghost"
                size="sm"
                className="flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span>Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login" passHref>
                <Button variant="ghost" size="sm" className="font-medium">
                  Log in
                </Button>
              </Link>
              <Link href="/signup" passHref>
                <Button size="sm" className="bg-black text-white hover:bg-black/90 font-medium cta-button">
                  Sign up
                </Button>
              </Link>
            </>
          ))}
        </nav>
        
        {/* Mobile Hamburger Button */}
        <button 
          className="md:hidden flex items-center"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200">
          <nav className="flex flex-col px-4 py-3 space-y-3 bg-white">
            {!loading && (user ? (
              <>
                <Link 
                  href="/humanize" 
                  onClick={closeMobileMenu}
                  className={`px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 ${
                    pathname === '/humanize' ? 'text-primary' : ''
                  }`}
                >
                  Humanize
                </Link>
                <Link 
                  href="/account" 
                  onClick={closeMobileMenu}
                  className={`px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50 ${
                    pathname === '/account' ? 'text-primary' : ''
                  }`}
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-2 py-1.5 rounded-md text-sm font-medium text-left hover:bg-gray-50 w-full"
                >
                  <LogOut className="h-3.5 w-3.5 mr-1" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={closeMobileMenu}
                  className="block px-2 py-1.5 rounded-md text-sm font-medium hover:bg-gray-50"
                >
                  Log in
                </Link>
                <Link 
                  href="/signup" 
                  onClick={closeMobileMenu}
                  className="block px-3 py-2 rounded-md text-center text-sm font-medium bg-black text-white hover:bg-black/90"
                >
                  Sign up
                </Link>
              </>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
} 