import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Wind, Brain, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BreathingExercise } from '@/components/health/BreathingExercise';
import { MeditationCard } from '@/components/health/MeditationCard';
import { ExerciseCards } from '@/components/health/ExerciseCards';

/**
 * Health Space Page
 * 
 * A dedicated wellness area with:
 * - Breathing exercises (animated)
 * - Guided meditation
 * - Light movement suggestions
 * 
 * Important: No medical claims - these are general wellness activities.
 */

type TabType = 'breathing' | 'meditation' | 'movement';

interface Tab {
  id: TabType;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'breathing', label: 'Breathing', icon: <Wind className="w-4 h-4" /> },
  { id: 'meditation', label: 'Meditation', icon: <Brain className="w-4 h-4" /> },
  { id: 'movement', label: 'Movement', icon: <Activity className="w-4 h-4" /> },
];

interface HealthSpaceProps {
  onBack: () => void;
  initialTab?: TabType;
}

export function HealthSpace({ onBack, initialTab }: HealthSpaceProps) {
  const [activeTab, setActiveTab] = useState<TabType>(initialTab || 'breathing');

  return (
    <div className="absolute inset-0 flex flex-col bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-4 p-4 border-b border-border/50 shrink-0"
      >
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="font-semibold text-foreground">Health Space</h1>
          <p className="text-xs text-muted-foreground">Gentle activities for your wellbeing</p>
        </div>
      </motion.header>

      {/* Tab navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex gap-2 p-4 border-b border-border/30 shrink-0"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
              transition-all duration-200
              ${activeTab === tab.id
                ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
              }
            `}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </motion.nav>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-lg mx-auto"
          >
            {activeTab === 'breathing' && <BreathingExercise />}
            {activeTab === 'meditation' && <MeditationCard />}
            {activeTab === 'movement' && <ExerciseCards />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer disclaimer */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 text-center border-t border-border/30 shrink-0"
      >
        <p className="text-xs text-muted-foreground/60">
          These activities are for general wellness and relaxation.
          They are not medical treatment.
        </p>
      </motion.footer>
    </div>
  );
}
