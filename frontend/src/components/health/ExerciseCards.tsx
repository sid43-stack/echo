import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

/**
 * ExerciseCards Component
 * 
 * Displays simple movement suggestions for light physical activity.
 * These are gentle, non-medical suggestions for stress relief.
 * 
 * Important: No medical claims - these are general wellness suggestions.
 */

interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: string;
  icon: string;
}

const exercises: Exercise[] = [
  {
    id: 'neck',
    title: 'Neck Release',
    description: 'Gently tilt your head to each side, holding for 15 seconds. Let the weight of your head create a gentle stretch.',
    duration: '1 min',
    icon: '🌙',
  },
  {
    id: 'shoulders',
    title: 'Shoulder Rolls',
    description: 'Roll your shoulders backward in slow circles, 5 times. Then forward 5 times. Release tension with each roll.',
    duration: '1 min',
    icon: '✨',
  },
  {
    id: 'wrists',
    title: 'Wrist Circles',
    description: 'Rotate your wrists slowly in both directions. Great if you\'ve been typing or scrolling.',
    duration: '30 sec',
    icon: '💫',
  },
  {
    id: 'walk',
    title: 'Gentle Walk',
    description: 'Step away from your space for a short walk - even to the window and back. Movement shifts perspective.',
    duration: '2 min',
    icon: '🌿',
  },
  {
    id: 'stretch',
    title: 'Full Body Stretch',
    description: 'Stand up and reach your arms overhead. Take a deep breath, then slowly fold forward, letting your arms hang.',
    duration: '1 min',
    icon: '🌸',
  },
];

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

export function ExerciseCards() {
  return (
    <div className="py-6 px-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground">Light Movement</h3>
      </div>

      <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
        Gentle movements can help release physical tension. 
        Try one or two when you're ready.
      </p>

      {/* Exercise cards grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3"
      >
        {exercises.map((exercise) => (
          <motion.div
            key={exercise.id}
            variants={item}
            whileHover={{ scale: 1.01 }}
            className="glass-card p-4 cursor-default hover:border-primary/30 transition-colors"
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <span className="text-2xl" role="img" aria-hidden="true">
                {exercise.icon}
              </span>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-medium text-foreground">
                    {exercise.title}
                  </h4>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {exercise.duration}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {exercise.description}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground mt-6 text-center opacity-60">
        These are general wellness suggestions, not medical advice.
      </p>
    </div>
  );
}
