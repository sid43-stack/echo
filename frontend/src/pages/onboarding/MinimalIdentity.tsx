import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAccount } from '../../context/AccountContext';

/**
 * Minimal Identity Screen
 * 
 * Asks only low-risk, optional questions.
 * No email, password, or sensitive data.
 * User can skip entirely.
 * 
 * For returning users with account data, auto-skips to next screen.
 * 
 * Data stored in frontend state only (would be backend in real app).
 */

interface MinimalIdentityProps {
  onContinue: (name: string, isStudent: boolean | null) => void;
  onSkip: () => void;
}

export function MinimalIdentity({ onContinue, onSkip }: MinimalIdentityProps) {
  const { account } = useAccount();
  const [name, setName] = useState('');
  const [isStudent, setIsStudent] = useState<boolean | null>(null);

  // Auto-skip for returning users who already have account data
  useEffect(() => {
    if (account.name) {
      // User already has account data, skip this screen
      onSkip();
    }
  }, [account.name, onSkip]);

  const handleContinue = () => {
    onContinue(name.trim(), isStudent);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Ambient background */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-primary/8 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Question 1: Name */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <label className="block text-lg text-foreground mb-3">
            What should I call you?
          </label>
          <Input
            type="text"
            placeholder="A name or nickname (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-secondary/50 border-border/50 text-foreground placeholder:text-muted-foreground/50 h-12"
          />
        </motion.div>

        {/* Question 2: Student status */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mb-10"
        >
          <label className="block text-lg text-foreground mb-3">
            Are you a student?
          </label>
          <div className="flex gap-3">
            <button
              onClick={() => setIsStudent(true)}
              className={`
                flex-1 py-3 px-6 rounded-xl text-base font-medium
                transition-all duration-200
                ${isStudent === true
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
            >
              Yes
            </button>
            <button
              onClick={() => setIsStudent(false)}
              className={`
                flex-1 py-3 px-6 rounded-xl text-base font-medium
                transition-all duration-200
                ${isStudent === false
                  ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                  : 'bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }
              `}
            >
              No
            </button>
          </div>
        </motion.div>

        {/* Action buttons */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex flex-col gap-3"
        >
          <Button
            variant="hero"
            size="lg"
            onClick={handleContinue}
            className="w-full py-6"
          >
            Continue
          </Button>
          <Button
            variant="ghost"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
