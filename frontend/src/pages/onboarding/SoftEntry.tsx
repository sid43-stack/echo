import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

/**
 * Soft Entry Screen
 * 
 * First screen of progressive onboarding.
 * Creates a calm, non-threatening entry point.
 * No registration required - builds trust first.
 */

interface SoftEntryProps {
  onContinue: () => void;
}

export function SoftEntry({ onContinue }: SoftEntryProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Ambient background glow */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="relative z-10 text-center max-w-md"
      >
        {/* Main heading */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-3xl md:text-4xl font-semibold text-foreground mb-4"
        >
          Let's get you comfortable.
        </motion.h1>

        {/* Subtext - builds trust */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="text-muted-foreground text-lg mb-12"
        >
          You don't need to sign up.
          <br />
          Just take a moment for yourself.
        </motion.p>

        {/* Continue button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 1.2 }}
        >
          <Button
            variant="hero"
            size="lg"
            onClick={onContinue}
            className="px-10 py-6 text-lg"
          >
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
