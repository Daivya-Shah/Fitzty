import React, { useState } from "react";
import { Mail, ArrowRight } from "lucide-react";
import useAuth from "@/hooks/useAuth";

const WaitlistNewsletter = () => {
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const response = await fetch('https://unwdysqgbgxwyvhqoatp.supabase.co/functions/v1/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVud2R5c3FnYmd4d3l2aHFvYXRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTMzMDQzNDgsImV4cCI6MjA2ODg4MDM0OH0.En4c6dTwhON23gxoXzw-PMFg6OQcbcXOBACsfaouFRM`,
        },
        body: JSON.stringify({ email }),
      });

      if (response.ok) {
        setSubmitStatus("success");
        setEmail("");
        // Reset success message after 3 seconds
        setTimeout(() => setSubmitStatus("idle"), 3000);
      } else {
        const errorData = await response.json();
        console.error('Waitlist error:', errorData);
        setSubmitStatus("error");
      }
    } catch (error) {
      console.error('Error submitting email:', error);
      setSubmitStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="join-waitlist" className="bg-white py-0">
      <div className="section-container opacity-0 animate-on-scroll">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <div className="fitzty-chip">
              <span className="w-full text-center">Join Waitlist</span>
            </div>
          </div>
          
          <h2 className="text-5xl font-display font-bold mb-4 text-left">Join the Fitzty Waitlist</h2>
          <p className="text-xl text-muted-foreground mb-10 text-left">
            Be the first to know when Fitzty launches. Join our waitlist to get early access.
          </p>
          
          <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-4 max-w-2xl">
            <div className="relative flex-1 min-w-0">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-lg"
                required
                disabled={isSubmitting}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting || !email}
              className="button-primary flex items-center justify-center group w-full sm:w-auto text-center disabled:opacity-50 disabled:cursor-not-allowed py-4 px-8 whitespace-nowrap"
            >
              {isSubmitting ? "Joining..." : "Join Waitlist"}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
          
          {submitStatus === "success" && (
            <div className="text-green-600 text-sm font-medium mt-4">
              🎉 Thanks! You've been added to our waitlist.
            </div>
          )}
          
          {submitStatus === "error" && (
            <div className="text-red-600 text-sm font-medium mt-4">
              ❌ Something went wrong. Please try again.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default WaitlistNewsletter; 