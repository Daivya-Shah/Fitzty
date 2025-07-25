import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  placeholder?: string;
  showStrength?: boolean;
  label: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({ 
  value, 
  onChange, 
  disabled, 
  placeholder, 
  showStrength = false,
  label 
}) => {
  const [showPassword, setShowPassword] = useState(false);

  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    score = Object.values(checks).filter(Boolean).length;
    
    return { score, checks };
  };

  const getStrengthColor = (score: number) => {
    if (score <= 2) return 'bg-destructive';
    if (score === 3) return 'bg-yellow-500';
    if (score === 4) return 'bg-orange-500';
    return 'bg-green-500';
  };

  const getStrengthText = (score: number) => {
    if (score <= 2) return 'Weak';
    if (score === 3) return 'Fair';
    if (score === 4) return 'Good';
    return 'Strong';
  };

  const { score, checks } = getPasswordStrength(value);

  return (
    <div>
      <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
        {label} *
      </label>
      <div className="relative">
        <input
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-6 py-4 pr-10 rounded-full border border-border focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
          placeholder={placeholder}
          disabled={disabled}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-foreground/60 hover:text-foreground"
          disabled={disabled}
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      
      {showStrength && value.length > 0 && (
        <div className="mt-2">
          <div className="flex items-center gap-2 mb-1">
            <div className="flex-1 bg-muted rounded-full h-2">
              <div 
                className={`h-full rounded-full transition-all duration-300 ${getStrengthColor(score)}`}
                style={{ width: `${(score / 5) * 100}%` }}
              />
            </div>
            <span className={`text-xs font-medium ${
              score <= 2 ? 'text-destructive' : 
              score === 3 ? 'text-yellow-600' : 
              score === 4 ? 'text-orange-600' : 
              'text-green-600'
            }`}>
              {getStrengthText(score)}
            </span>
          </div>
          
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex flex-wrap gap-2">
              <span className={checks.length ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ 8+ characters
              </span>
              <span className={checks.lowercase ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ lowercase
              </span>
              <span className={checks.uppercase ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ uppercase
              </span>
              <span className={checks.numbers ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ numbers
              </span>
              <span className={checks.special ? 'text-green-600' : 'text-muted-foreground'}>
                ✓ special chars
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordInput;