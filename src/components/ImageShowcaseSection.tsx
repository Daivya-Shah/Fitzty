
import React from "react";

const ImageShowcaseSection = () => {
  return (
    <section className="w-full pt-0 pb-8 sm:pb-12 bg-white" id="showcase">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-12 animate-on-scroll">
          <h2 className="text-3xl sm:text-4xl font-display font-bold tracking-tight text-gray-900 mb-3 sm:mb-4">
            The Future of Fashion Expression
          </h2>
          <p className="text-base sm:text-lg text-gray-600">
            Fitzty is where Gen Z shares their style, not themselves. Express your unique fashion sense through customizable avatars, digital closets, and moodboards—no posing required.
          </p>
        </div>
        
        <div className="rounded-2xl sm:rounded-3xl overflow-hidden shadow-elegant mx-auto max-w-4xl animate-on-scroll">
          <div className="w-full">
            <img 
              src={require('@/assets/fitzty.jpg')} 
              alt="Fitzty Gen Z fashion community" 
              className="w-full h-auto object-cover"
            />
          </div>
          <div className="bg-white p-4 sm:p-8">
            <h3 className="text-xl sm:text-2xl font-display font-semibold mb-3 sm:mb-4">Next Generation Fashion</h3>
            <p className="text-gray-700 text-sm sm:text-base">
              Fitzty transforms how Gen Z expresses style online. Through customizable avatars, digital closets, and AI-powered recommendations, we create a space where fashion meets technology, and creativity flourishes without social pressure.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ImageShowcaseSection;
