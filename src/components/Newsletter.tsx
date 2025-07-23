import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: "Please enter your email address",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Welcome to the Fitzty waitlist!",
        description: "You'll be among the first to access our fashion social network."
      });
      setEmail("");
      setIsSubmitting(false);
    }, 1000);
  };
  return <section id="join-waitlist" className="bg-white py-0">
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="fitzty-chip">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground mr-2 text-sm font-semibold">👥</span>
              <span>Join the Community</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-display font-bold mb-4 text-left">Join the Fitzty Waitlist</h2>
          <p className="text-xl text-muted-foreground mb-10 text-left">
            Be among the first to express your style without pressure. Get early access to avatar customization, fashion communities, and AI styling.
          </p>
          
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4 items-start md:items-center">
            <div className="relative flex-grow">
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email address" className="w-full px-6 py-4 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground" required />
            </div>
            <button type="submit" disabled={isSubmitting} className="button-primary py-4 px-10 md:ml-4">
              {isSubmitting ? "Joining..." : "Join Waitlist"}
            </button>
          </form>
        </div>
      </div>
    </section>;
};
export default Newsletter;