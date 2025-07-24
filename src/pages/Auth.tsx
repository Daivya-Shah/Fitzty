import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { ArrowRight } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import fitztyLogo from "@/assets/fitzty-logo.jpg";

const Auth = () => {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(() => location.search.includes('signup'));
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [universityEmail, setUniversityEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const validateForm = () => {
    if (!email || !password) {
      setError('Please fill in all required fields');
      return false;
    }
    
    if (isSignUp) {
      if (!username) {
        setError('Username is required');
        return false;
      }
      if (username.length < 3 || username.length > 20) {
        setError('Username must be between 3 and 20 characters');
        return false;
      }
      if (password.length < 6) {
        setError('Password must be at least 6 characters long');
        return false;
      }
    }
    
    return true;
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) return;
    
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up with metadata
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: {
              username,
              university_email: universityEmail || null
            }
          }
        });

        if (error) {
          if (error.message.includes('User already registered')) {
            setError('This email is already registered. Try signing in instead.');
          } else {
            setError(error.message);
          }
        } else if (data.user) {
          setSuccess('Account created successfully! Please check your email to verify your account.');
        }
      } else {
        // Sign in
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            setError('Invalid email or password. Please try again.');
          } else {
            setError(error.message);
          }
        } else if (data.user) {
          navigate('/');
        }
      }
    } catch (err: any) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isUniversityEmail = (email: string) => {
    return email.includes('.edu') || email.includes('.ac.') || email.includes('university');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-aqua-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Chip and Heading */}
        <div className="flex items-center gap-4 mb-6 justify-center">
          <div className="fitzty-chip">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground mr-2 text-sm font-semibold">{isSignUp ? '📝' : '🔑'}</span>
            <span>{isSignUp ? 'Sign Up' : 'Sign In'}</span>
          </div>
        </div>
        <h2 className="text-4xl font-display font-bold mb-2 text-center">{isSignUp ? 'Sign Up for Fitzty' : 'Sign In to Fitzty'}</h2>
        <p className="text-lg text-muted-foreground mb-8 text-center">
          {isSignUp
            ? 'Create your Fitzty account to start expressing your style.'
            : 'Welcome back! Sign in to access your Fitzty account.'}
        </p>
        {/* Auth Form */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg mb-4 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="bg-aqua-50 border border-aqua-200 text-aqua-700 px-4 py-3 rounded-lg mb-4 text-sm">
              {success}
            </div>
          )}
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
                  Username *
                </label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="Choose a unique username"
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-4 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
            {isSignUp && (
              <div>
                <label htmlFor="universityEmail" className="block text-sm font-medium text-foreground mb-1">
                  University Email
                  <span className="text-foreground/60 text-xs ml-1">(optional)</span>
                </label>
                <input
                  id="universityEmail"
                  type="email"
                  value={universityEmail}
                  onChange={(e) => setUniversityEmail(e.target.value)}
                  className="w-full px-6 py-4 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="your.name@university.edu"
                  disabled={loading}
                />
                {universityEmail && isUniversityEmail(universityEmail) && (
                  <p className="text-xs text-aqua-600 mt-1">
                    ✓ University email detected - you can verify later for exclusive features
                  </p>
                )}
              </div>
            )}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password *
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-6 py-4 pr-10 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder={isSignUp ? 'Create a secure password' : 'Enter your password'}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground"
                  disabled={loading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {isSignUp && (
                <p className="text-xs text-foreground/60 mt-1">
                  Must be at least 6 characters long
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loading}
              className="button-primary flex items-center justify-center group w-full text-center"
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Sign Up' : 'Sign In')}
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccess('');
              }}
              className="text-aqua-600 hover:text-aqua-700 font-medium transition-colors"
              disabled={loading}
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </div>
        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-foreground/60">
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;