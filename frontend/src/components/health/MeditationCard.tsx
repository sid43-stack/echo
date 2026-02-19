import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * MeditationCard Component
 * 
 * Provides a short guided meditation experience with:
 * - Progressive text guidance
 * - Optional ambient sound toggle (placeholder - would need audio file)
 * - Calm, focused interface
 * 
 * In production:
 * - Would include actual audio files
 * - Could offer multiple meditation types
 * - Would track completion for analytics
 */

const meditationSteps = [
  { time: 0, text: "Find a comfortable position. Close your eyes if you'd like." },
  { time: 6, text: "Take a deep breath in... and slowly let it out." },
  { time: 14, text: "Notice the quiet of this moment. You are safe here." },
  { time: 22, text: "Let your shoulders drop. Release any tension in your jaw." },
  { time: 30, text: "With each breath, you're becoming more relaxed." },
  { time: 38, text: "There's nothing you need to do right now. Just be." },
  { time: 46, text: "Feel the weight of your body. You are grounded." },
  { time: 54, text: "Breathe naturally. Let thoughts pass like clouds." },
  { time: 62, text: "You are not your worries. You are the sky behind them." },
  { time: 70, text: "When you're ready, gently open your eyes." },
  { time: 78, text: "Take this calm with you. You did well." },
];

export function MeditationCard() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(false);

  // Timer effect
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        
        // Check if we need to advance to next step
        const nextStepIndex = meditationSteps.findIndex(
          (step, i) => i > currentStep && step.time <= next
        );
        
        if (nextStepIndex !== -1) {
          setCurrentStep(nextStepIndex);
        }

        // End meditation after last step + some buffer
        if (next >= 90) {
          setIsPlaying(false);
          return 0;
        }

        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, currentStep]);

  const resetMeditation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setElapsed(0);
  };

  const togglePlay = () => {
    if (!isPlaying) {
      setIsPlaying(true);
      if (elapsed === 0) setCurrentStep(0);
    } else {
      setIsPlaying(false);
    }
  };

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Meditation visual */}
      <div className="relative w-48 h-48 flex items-center justify-center mb-8">
        {/* Ambient glow */}
        <motion.div
          animate={{
            opacity: isPlaying ? [0.3, 0.5, 0.3] : 0.2,
            scale: isPlaying ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-gradient-radial from-primary/30 to-transparent blur-2xl"
        />

        {/* Center orb */}
        <motion.div
          animate={{
            scale: isPlaying ? [1, 1.05, 1] : 1,
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/40 to-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-sm"
        >
          <span className="text-2xl font-bold text-foreground">
            {formatTime(elapsed)}
          </span>
        </motion.div>
      </div>

      {/* Current guidance text */}
      <div className="h-24 flex items-center justify-center mb-6 px-4">
        <AnimatePresence mode="wait">
          <motion.p
            key={currentStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            className="text-center text-lg font-medium text-foreground leading-relaxed max-w-sm"
          >
            {isPlaying || elapsed > 0
              ? meditationSteps[currentStep].text
              : 'A moment of stillness awaits you.'}
          </motion.p>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="default"
          size="lg"
          onClick={togglePlay}
          className="gap-2 px-6"
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : elapsed > 0 ? (
            <>
              <Play className="w-4 h-4" /> Resume
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Begin
            </>
          )}
        </Button>

        {/* Sound toggle - placeholder for future audio */}
        <Button
          variant="outline"
          size="lg"
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="w-12"
          title={soundEnabled ? 'Mute ambient sound' : 'Enable ambient sound'}
        >
          {soundEnabled ? (
            <Volume2 className="w-4 h-4" />
          ) : (
            <VolumeX className="w-4 h-4" />
          )}
        </Button>
      </div>

      {elapsed > 0 && !isPlaying && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetMeditation}
          className="mt-4 text-muted-foreground"
        >
          Start over
        </Button>
      )}

      {/* Note about sound */}
      {soundEnabled && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 text-xs text-muted-foreground"
        >
          {/* MOCK: In production, this would play ambient audio */}
          Ambient sounds would play here in the full app
        </motion.p>
      )}
    </div>
  );
}
