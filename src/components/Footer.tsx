
import React from "react";

const Footer = () => {
  return (
    <footer className="w-full bg-white border-t border-gray-200 py-6 mt-12">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Logo and copyright */}
        <div className="flex items-center gap-3">
          <img src="/logo.svg" alt="Fitzty Logo" className="h-7 w-auto" />
          <span className="text-gray-500 text-sm">© {new Date().getFullYear()} Fitzty. All rights reserved.</span>
        </div>
        {/* Navigation links */}
        <nav className="flex gap-6 text-sm">
          <a href="#" className="text-gray-600 hover:text-primary transition-colors">Home</a>
          <a href="#features" className="text-gray-600 hover:text-primary transition-colors">Features</a>
          <a href="#newsletter" className="text-gray-600 hover:text-primary transition-colors">Newsletter</a>
        </nav>
        {/* Social icons */}
        <div className="flex gap-4">
          <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" aria-label="Twitter" className="text-gray-500 hover:text-primary transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M22 4.01c-.77.35-1.6.59-2.47.7A4.13 4.13 0 0021.4 2.3a8.2 8.2 0 01-2.6 1A4.1 4.1 0 0012 7.03c0 .32.04.64.1.94C8.28 7.8 5.1 6.13 2.98 3.7c-.35.6-.55 1.3-.55 2.05 0 1.42.72 2.67 1.82 3.4-.67-.02-1.3-.2-1.85-.5v.05c0 1.98 1.41 3.63 3.28 4-.34.1-.7.16-1.07.16-.26 0-.5-.02-.74-.07.5 1.56 1.97 2.7 3.7 2.73A8.23 8.23 0 012 19.54c-.6 0-1.18-.04-1.75-.12A11.6 11.6 0 006.29 21c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.3 8.3 0 0022 4.01z"/></svg>
          </a>
          <a href="https://instagram.com/" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-gray-500 hover:text-primary transition-colors">
            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><rect width="18" height="18" x="3" y="3" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1.5"/></svg>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
