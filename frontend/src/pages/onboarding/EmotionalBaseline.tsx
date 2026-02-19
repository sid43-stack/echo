import { motion } from 'framer-motion';
import { Smile, Meh, Heart, Brain, CloudRain } from 'lucide-react';

/**
 * Emotional Baseline Screen
 * 
 * Captures initial mood state before session.
 * This sets emotional context for the experience.
 * 
 * In real app: This would be sent to backend for AI context.
 */

export type MoodType = 'calm' | 'neutral' | 'lonely' | 'anxious' | 'overwhelmed';

interface MoodOption {
  id: MoodType;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const moodOptions: MoodOption[] = [
  { 
    id: 'calm', 
    label: 'Calm', 
    icon: <Smile className="w-6 h-6" />,
    color: 'bg-green-500/20 border-green-500/30 hover:bg-green-500/30'
  },
  { 
    id: 'neutral', 
    label: 'Neutral', 
    icon: <Meh className="w-6 h-6" />,
    color: 'bg-blue-500/20 border-blue-500/30 hover:bg-blue-500/30'
  },
  { 
    id: 'lonely', 
    label: 'Lonely', 
    icon: <Heart className="w-6 h-6" />,
    color: 'bg-purple-500/20 border-purple-500/30 hover:bg-purple-500/30'
  },
  { 
    id: 'anxious', 
    label: 'Anxious', 
    icon: <Brain className="w-6 h-6" />,
    color: 'bg-amber-500/20 border-amber-500/30 hover:bg-amber-500/30'
  },
  { 
    id: 'overwhelmed', 
    label: 'Overwhelmed', 
    icon: <CloudRain className="w-6 h-6" />,
    color: 'bg-red-500/20 border-red-500/30 hover:bg-red-500/30'
  },
];

interface EmotionalBaselineProps {
  onSelectMood: (mood: MoodType) => void;
}

export function EmotionalBaseline({ onSelectMood }: EmotionalBaselineProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6">
      {/* Ambient background */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
      >
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-accent/8 rounded-full blur-3xl" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 w-full max-w-md text-center"
      >
        {/* Question */}
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl md:text-3xl font-semibold text-foreground mb-8"
        >
          How are you feeling right now?
        </motion.h2>

        {/* Mood options */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-3 mb-4"
        >
          {moodOptions.slice(0, 4).map((mood, index) => (
            <motion.button
              key={mood.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 + index * 0.1 }}
              onClick={() => onSelectMood(mood.id)}
              className={`
                flex flex-col items-center justify-center gap-2
                p-5 rounded-2xl border
                transition-all duration-200
                ${mood.color}
              `}
            >
              {mood.icon}
              <span className="text-sm font-medium text-foreground">{mood.label}</span>
            </motion.button>
          ))}
        </motion.div>

        {/* Overwhelmed option - full width */}
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.9 }}
          onClick={() => onSelectMood('overwhelmed')}
          className={`
            w-full flex items-center justify-center gap-3
            p-5 rounded-2xl border
            transition-all duration-200
            ${moodOptions[4].color}
          `}
        >
          {moodOptions[4].icon}
          <span className="text-sm font-medium text-foreground">{moodOptions[4].label}</span>
        </motion.button>

        {/* Reassurance */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.1 }}
          className="mt-8 text-sm text-muted-foreground"
        >
          Whatever you're feeling, it's okay.
        </motion.p>
      </motion.div>
    </div>
  );
}
