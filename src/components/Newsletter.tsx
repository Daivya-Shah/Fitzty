import React from "react";
import { Link } from "react-router-dom";
// import { toast } from "@/components/ui/use-toast";
const Newsletter = () => {
  return <section id="join-waitlist" className="bg-white py-0">
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="fitzty-chip">
              <span className="w-full text-center">Sign Up</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-display font-bold mb-4 text-left">Sign Up for Fitzty</h2>
          <p className="text-xl text-muted-foreground mb-10 text-left">
            Create your Fitzty account to start expressing your style.
          </p>
          
          <div className="flex justify-start md:justify-start">
            <Link to="/auth?signup" className="button-primary py-4 px-10 text-center">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </section>;
};
export default Newsletter;