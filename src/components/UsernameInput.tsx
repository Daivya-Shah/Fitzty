import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Check, X, Loader2 } from 'lucide-react';

interface UsernameInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const UsernameInput: React.FC<UsernameInputProps> = ({ value, onChange, disabled }) => {
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [checkTimeout, setCheckTimeout] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!value || value.length < 3) {
      setIsAvailable(null);
      return;
    }

    // Clear previous timeout
    if (checkTimeout) {
      clearTimeout(checkTimeout);
    }

    // Set new timeout to debounce API calls
    const timeout = setTimeout(async () => {
      setIsChecking(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', value)
          .single();

        if (error && error.code === 'PGRST116') {
          // No rows found - username is available
          setIsAvailable(true);
        } else if (data) {
          // Username found - not available
          setIsAvailable(false);
        }
      } catch (err) {
        console.error('Error checking username:', err);
      } finally {
        setIsChecking(false);
      }
    }, 500);

    setCheckTimeout(timeout);

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [value]);

  const getStatusIcon = () => {
    if (isChecking) {
      return <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />;
    }
    if (isAvailable === true) {
      return <Check className="w-4 h-4 text-green-600" />;
    }
    if (isAvailable === false) {
      return <X className="w-4 h-4 text-destructive" />;
    }
    return null;
  };

  const getStatusText = () => {
    if (value.length < 3) {
      return <span className="text-xs text-muted-foreground">Username must be at least 3 characters</span>;
    }
    if (isChecking) {
      return <span className="text-xs text-muted-foreground">Checking availability...</span>;
    }
    if (isAvailable === true) {
      return <span className="text-xs text-green-600">✓ Username is available</span>;
    }
    if (isAvailable === false) {
      return <span className="text-xs text-destructive">✗ Username is already taken</span>;
    }
    return null;
  };

  return (
    <div>
      <label htmlFor="username" className="block text-sm font-medium text-foreground mb-1">
        Username *
      </label>
      <div className="relative">
        <input
          id="username"
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-6 py-4 pr-10 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          placeholder="Choose a unique username"
          disabled={disabled}
        />
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          {getStatusIcon()}
        </div>
      </div>
      {getStatusText()}
    </div>
  );
};

export default UsernameInput;