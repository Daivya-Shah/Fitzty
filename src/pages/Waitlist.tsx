import React, { useEffect } from "react";
import Navbar from "@/components/Navbar";
import WaitlistHero from "@/components/WaitlistHero";
import HumanoidSection from "@/components/HumanoidSection";
import SpecsSection from "@/components/SpecsSection";
import ImageShowcaseSection from "@/components/ImageShowcaseSection";
import Features from "@/components/Features";
import WaitlistNewsletter from "@/components/WaitlistNewsletter";

const Waitlist = () => {
  // Initialize intersection observer to detect when elements enter viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("animate-fade-in");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    
    const elements = document.querySelectorAll(".animate-on-scroll");
    elements.forEach((el) => observer.observe(el));
    
    return () => {
      elements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  useEffect(() => {
    // This helps ensure smooth scrolling for the anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href')?.substring(1);
        if (!targetId) return;
        
        const targetElement = document.getElementById(targetId);
        if (!targetElement) return;
        
        // Increased offset to account for mobile nav
        const offset = window.innerWidth < 768 ? 100 : 80;
        
        window.scrollTo({
          top: targetElement.offsetTop - offset,
          behavior: 'smooth'
        });
      });
    });
  }, []);

  return (
    <div className="min-h-screen relative">
      <Navbar />
      <main className="space-y-4 sm:space-y-8"> {/* Reduced space on mobile */}
        <WaitlistHero />
        <HumanoidSection />
        <SpecsSection />
        <ImageShowcaseSection />
        <Features />
        <WaitlistNewsletter />
      </main>
      
      {/* Secret invisible button at bottom right */}
      <button
        onClick={() => window.location.href = '/home'}
        className="fixed bottom-4 right-4 w-8 h-8 bg-transparent border-none cursor-pointer z-50 opacity-0 hover:opacity-20 transition-opacity duration-300"
        aria-label="Secret home button"
        title="Secret home button"
      >
        {/* Invisible clickable area */}
      </button>
      
      {/* <Footer /> */}
    </div>
  );
};

export default Waitlist; 