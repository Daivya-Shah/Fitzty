
import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Menu, X, Settings } from "lucide-react";
import fitztyProfile from "@/assets/fitzty-hero.jpg";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import useAuth from "@/hooks/useAuth";
import { useLocation } from "react-router-dom";

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const isHome = location.pathname === "/home";
  const isWaitlist = location.pathname === "/";
  const isAuth = location.pathname.startsWith("/auth");
  const isProfile = location.pathname.startsWith("/profile");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : '';
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    if (isMenuOpen) {
      setIsMenuOpen(false);
      document.body.style.overflow = '';
    }
  };

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 py-2 sm:py-3 md:py-4 bg-white border-b border-gray-200 transition-all duration-300"
    >
      <div className="container flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <a 
          href="#" 
          className="flex items-center space-x-2"
          onClick={(e) => {
            e.preventDefault();
            if (isProfile) {
              window.location.href = "/home";
            } else {
            scrollToTop();
            }
          }}
          aria-label="Fitzty"
        >
          <span className="text-2xl font-bold bg-fitzty-gradient bg-clip-text text-transparent">
            Fitzty
          </span>
        </a>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8 items-center">
          {isProfile ? (
            <a 
              href="/feeds" 
              className="nav-link"
            >Feed</a>
          ) : (
            <a 
              href={isHome ? "/home" : "/"} 
              className="nav-link"
              {...((isHome || isWaitlist) ? { onClick: e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } } : {})}
            >Home</a>
          )}
          {/* Hide all other buttons on auth page */}
          {!isAuth && (
            (isHome || isWaitlist) ? (
              <a href="#features" className="nav-link">Features</a>
            ) : (
          <a href="/explore" className="nav-link">Explore</a>
            )
          )}
        </nav>

        {/* Mobile menu button - increased touch target */}
        <button 
          className="md:hidden text-gray-700 p-3 focus:outline-none" 
          onClick={toggleMenu}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Navigation - improved for better touch experience */}
      <div className={cn(
        "fixed inset-0 z-40 bg-white flex flex-col pt-16 px-6 md:hidden transition-all duration-300 ease-in-out",
        isMenuOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full pointer-events-none"
      )}>
        <nav className="flex flex-col space-y-8 items-center mt-8">
          {isProfile ? (
            <a 
              href="/feeds" 
              className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
            >Feed</a>
          ) : (
            <a 
              href={isHome ? "/home" : "/"} 
              className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100"
              {...((isHome || isWaitlist) ? { onClick: e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); } } : {})}
            >Home</a>
          )}
          {/* Hide all other buttons on auth page */}
          {!isAuth && (
            (isHome || isWaitlist) ? (
              <a href="#features" className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100">Features</a>
            ) : (
          <a href="/explore" className="text-xl font-medium py-3 px-6 w-full text-center rounded-lg hover:bg-gray-100">Explore</a>
            )
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
