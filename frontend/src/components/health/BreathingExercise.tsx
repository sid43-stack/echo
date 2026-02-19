import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * BreathingExercise Component
 * 
 * An animated breathing exercise using the 4-7-8 technique:
 * - Inhale for 4 seconds
 * - Hold for 7 seconds  
 * - Exhale for 8 seconds
 * 
 * Features animated expanding/contracting circle with text cues.
 * Duration: ~2 minutes (6 cycles)
 */

type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const PHASES = {
  inhale: { duration: 4, text: 'Breathe in...', scale: 1.4 },
  hold: { duration: 7, text: 'Hold...', scale: 1.4 },
  exhale: { duration: 8, text: 'Breathe out...', scale: 1 },
  rest: { duration: 1, text: 'And again...', scale: 1 },
};

export function BreathingExercise() {
  const [isRunning, setIsRunning] = useState(false);
  const [phase, setPhase] = useState<BreathPhase>('rest');
  const [cycleCount, setCycleCount] = useState(0);
  const [secondsRemaining, setSecondsRemaining] = useState(0);

  const totalCycles = 6; // About 2 minutes total

  // Reset exercise to initial state
  const resetExercise = useCallback(() => {
    setIsRunning(false);
    setPhase('rest');
    setCycleCount(0);
    setSecondsRemaining(0);
  }, []);

  // Handle phase transitions
  useEffect(() => {
    if (!isRunning) return;

    // If we've completed all cycles, stop
    if (cycleCount >= totalCycles) {
      resetExercise();
      return;
    }

    // Set up the phase sequence
    const phaseSequence: BreathPhase[] = ['inhale', 'hold', 'exhale', 'rest'];
    const currentPhaseIndex = phaseSequence.indexOf(phase);
    const phaseDuration = PHASES[phase].duration * 1000;

    // Set countdown
    setSecondsRemaining(PHASES[phase].duration);

    // Countdown timer
    const countdownInterval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);

    // Phase transition timer
    const phaseTimer = setTimeout(() => {
      if (phase === 'rest') {
        setCycleCount((prev) => prev + 1);
        setPhase('inhale');
      } else {
        const nextPhaseIndex = (currentPhaseIndex + 1) % phaseSequence.length;
        setPhase(phaseSequence[nextPhaseIndex]);
      }
    }, phaseDuration);

    return () => {
      clearTimeout(phaseTimer);
      clearInterval(countdownInterval);
    };
  }, [isRunning, phase, cycleCount, resetExercise]);

  // Start the exercise
  const startExercise = () => {
    setIsRunning(true);
    setPhase('inhale');
    setCycleCount(0);
  };

  const currentPhaseData = PHASES[phase];

  return (
    <div className="flex flex-col items-center justify-center py-8 px-4">
      {/* Breathing circle animation */}
      <div className="relative w-64 h-64 flex items-center justify-center mb-8">
        {/* Outer glow ring */}
        <motion.div
          animate={{
            scale: isRunning ? currentPhaseData.scale : 1,
            opacity: isRunning ? 0.3 : 0.1,
          }}
          transition={{
            duration: PHASES[phase].duration,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
        />

        {/* Main breathing circle */}
        <motion.div
          animate={{
            scale: isRunning ? currentPhaseData.scale : 1,
          }}
          transition={{
            duration: PHASES[phase].duration,
            ease: 'easeInOut',
          }}
          className="w-40 h-40 rounded-full breathing-circle flex items-center justify-center"
        >
          {/* Center content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-center"
            >
              {isRunning ? (
                <>
                  <p className="text-lg font-medium text-foreground">
                    {currentPhaseData.text}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-1">
                    {secondsRemaining}
                  </p>
                </>
              ) : (
                <p className="text-sm text-muted-foreground">Ready when you are</p>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Progress indicator */}
      {isRunning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-6 text-center"
        >
          <p className="text-sm text-muted-foreground">
            Cycle {Math.min(cycleCount + 1, totalCycles)} of {totalCycles}
          </p>
          <div className="flex gap-1.5 mt-2 justify-center">
            {Array.from({ length: totalCycles }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full transition-colors ${
                  i < cycleCount ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Controls */}
      <div className="flex gap-3">
        <Button
          variant="default"
          size="lg"
          onClick={isRunning ? () => setIsRunning(false) : startExercise}
          className="gap-2 px-6"
        >
          {isRunning ? (
            <>
              <Pause className="w-4 h-4" /> Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4" /> Start Breathing
            </>
          )}
        </Button>

        {(isRunning || cycleCount > 0) && (
          <Button variant="outline" size="lg" onClick={resetExercise}>
            <RotateCcw className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Instructions */}
      <div className="mt-8 text-center max-w-xs">
        <p className="text-xs text-muted-foreground leading-relaxed">
          This uses the 4-7-8 breathing technique. Inhale through your nose, 
          hold gently, then exhale slowly through your mouth.
        </p>
      </div>
    </div>
  );
}
