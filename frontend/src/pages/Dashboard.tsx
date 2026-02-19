import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Wind, Sparkles, BookOpen, User, Users } from 'lucide-react';
import type { MoodType } from './onboarding/EmotionalBaseline';
import { useAccount } from '../context/AccountContext';
import { Account } from './Account';
import { WellnessCheckIn } from '../components/WellnessCheckIn';
import { DashboardInsights } from '../components/DashboardInsights';

/**
 * Dashboard Page
 * 
 * Main home screen after onboarding.
 * Shows personalized greeting and action cards.
 * 
 * In real app: Would fetch user data from backend.
 */

interface ActionCard {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
}

// Primary action - visually dominant
const primaryAction = {
  id: 'chat',
  icon: <MessageCircle className="w-8 h-8" />,
  title: 'Talk Now',
  description: 'A moment to share what’s on your mind',
  color: 'from-primary/30 to-primary/10'
};

// Secondary actions - equal priority, quieter visually
const secondaryActions: ActionCard[] = [
  {
    id: 'health',
    icon: <Sparkles className="w-5 h-5" />,
    title: 'Health Space',
    description: 'Wellness activities',
    color: 'from-purple-500/15 to-purple-500/5'
  },
  {
    id: 'breathing',
    icon: <Wind className="w-5 h-5" />,
    title: 'Guided Breathing',
    description: 'Calm your mind',
    color: 'from-accent/15 to-accent/5'
  },
  {
    id: 'journal',
    icon: <BookOpen className="w-5 h-5" />,
    title: 'Journal',
    description: 'Reflect on your day',
    color: 'from-amber-500/15 to-amber-500/5'
  },
];

const moodLabels: Record<MoodType, string> = {
  calm: 'You\'re feeling calm',
  neutral: 'You\'re feeling okay',
  lonely: 'Feeling a bit lonely',
  anxious: 'Feeling some anxiety',
  overwhelmed: 'Feeling overwhelmed',
};

interface DashboardProps {
  userName?: string;
  currentMood: MoodType;
  onSelectAction: (actionId: string, fromWellnessCheckIn?: boolean) => void;
  showWellnessCompletion?: boolean;
}

export function Dashboard({ userName, currentMood, onSelectAction, showWellnessCompletion }: DashboardProps) {
  const { account } = useAccount();
  const [isAccountOpen, setIsAccountOpen] = useState(false);

  // Wellness check-in state
  // CALMNESS SAFEGUARD: Max one check-in per day
  const [showWellnessCheckIn, setShowWellnessCheckIn] = useState(false);
  const [hasShownWellnessCheckInToday, setHasShownWellnessCheckInToday] = useState(false);

  // Mock trigger logic - simulates smartwatch signal
  // In production: This would be triggered by actual smartwatch data
  useEffect(() => {
    // CALMNESS SAFEGUARD: Only trigger if not shown today
    if (hasShownWellnessCheckInToday) return;

    // Simulate a wellness signal after 10 seconds on dashboard
    // Represents: unexpected physiological change while resting
    const timer = setTimeout(() => {
      // Double-check before showing (in case state changed during timeout)
      if (!hasShownWellnessCheckInToday) {
        setShowWellnessCheckIn(true);
        setHasShownWellnessCheckInToday(true);
      }
    }, 10000); // 10 seconds for demo purposes

    return () => clearTimeout(timer);
  }, [hasShownWellnessCheckInToday]);

  // Handle wellness check-in actions
  const handleTakeBreath = () => {
    // CALMNESS SAFEGUARD: Immediately navigate, no explanation or data shown
    setShowWellnessCheckIn(false);
    onSelectAction('breathing', true); // Pass flag to track wellness check-in flow
  };

  const handleDismissCheckIn = () => {
    // CALMNESS SAFEGUARD: Dismiss immediately, no follow-up, no logging
    setShowWellnessCheckIn(false);
  };

  const handleTalkNow = () => {
    // Navigate to chat when user clicks "Talk Now"
    setShowWellnessCheckIn(false);
    onSelectAction('chat');
  };

  const currentHour = new Date().getHours();
  const greeting = currentHour >= 22 || currentHour < 5
    ? 'Good evening'
    : currentHour < 12
      ? 'Good morning'
      : currentHour < 17
        ? 'Good afternoon'
        : 'Good evening';

  // Use account name if set, otherwise use userName prop
  const displayName = account.name || userName;

  // Get initials for avatar
  const getInitials = () => {
    if (!displayName) return null;
    const parts = displayName.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  return (
    <div className="absolute inset-0 flex flex-col p-6">
      {/* Ambient background */}
      <motion.div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/6 rounded-full blur-3xl" />
      </motion.div>

      <div className="relative z-10 max-w-4xl mx-auto w-full flex flex-col flex-1 min-h-0 overflow-y-auto no-scrollbar">
        {/* Account Avatar Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="absolute top-0 right-0"
        >
          <button
            onClick={() => setIsAccountOpen(true)}
            className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-all hover:scale-105 active:scale-95"
            aria-label="Account"
          >
            {getInitials() ? (
              <span className="text-sm font-medium text-primary">
                {getInitials()}
              </span>
            ) : (
              <User className="w-5 h-5 text-primary" />
            )}
          </button>
        </motion.div>

        {/* LAYER 1: Emotional Context (passive, no buttons) */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-12 mt-8"
        >
          <h1 className="text-2xl md:text-3xl font-semibold text-foreground">
            {displayName ? `Hi, ${displayName}.` : `${greeting}.`}
          </h1>
          <p className="text-muted-foreground mt-2">
            {moodLabels[currentMood]}
          </p>
        </motion.header>

        {/* Wellness Check-In Completion Message */}
        {/* CALMNESS SAFEGUARD: Simple thank you, no data or analysis */}
        {showWellnessCompletion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mb-6 p-4 rounded-xl bg-primary/10 border border-primary/20"
          >
            <p className="text-sm text-foreground text-center">
              Thanks for taking a moment for yourself.
            </p>
          </motion.div>
        )}

        {/* LAYER 1.5: Dashboard Insights (visual data, charts) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="mb-10"
        >
          <DashboardInsights />
        </motion.div>

        {/* LAYER 2: Primary Action (MOST PROMINENT) */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={() => onSelectAction(primaryAction.id)}
          className={`
            relative py-10 px-8 rounded-3xl text-center mb-8
            bg-gradient-to-br ${primaryAction.color}
            border-2 border-primary/20
            transition-all duration-300
            hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/20
            active:scale-[0.98]
          `}
        >
          <div className="flex flex-col items-center">
            <div className="mb-5 p-5 rounded-full bg-primary/10">
              <MessageCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>
            <h2 className="text-2xl font-semibold text-foreground mb-2">
              {primaryAction.title}
            </h2>
            <p className="text-base text-muted-foreground">
              {primaryAction.description}
            </p>
          </div>
        </motion.button>

        {/* LAYER 3: Secondary Actions (equal priority, visually quieter) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-3 gap-4 mb-8"
        >
          {secondaryActions.map((card, index) => (
            <motion.button
              key={card.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
              onClick={() => onSelectAction(card.id)}
              className={`
                relative py-6 px-4 rounded-2xl text-center
                bg-gradient-to-br ${card.color}
                border border-border/20
                transition-all duration-300
                hover:scale-[1.02] hover:shadow-md hover:shadow-primary/5
                active:scale-[0.98]
              `}
            >
              <div className="flex flex-col items-center">
                <div className="mb-4 p-3 rounded-full bg-background/30">
                  <div className="w-6 h-6 text-foreground/80 flex items-center justify-center">
                    {card.icon}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-foreground mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground/70">
                  {card.description}
                </p>
              </div>
            </motion.button>
          ))}
        </motion.div>

        {/* Community Card */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          onClick={() => onSelectAction('community')}
          className="
            relative py-6 px-6 rounded-2xl text-left mb-8 w-full
            bg-gradient-to-br from-blue-500/15 to-blue-500/5
            border border-border/20
            transition-all duration-300
            hover:scale-[1.01] hover:shadow-md hover:shadow-primary/5
            active:scale-[0.99]
            flex items-center gap-4
          "
        >
          <div className="p-3 rounded-full bg-background/30">
            <Users className="w-6 h-6 text-foreground/80" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-medium text-foreground mb-1">Community</h3>
            <p className="text-sm text-muted-foreground/70">Connect with others and discover local events</p>
          </div>
        </motion.button>

        {/* LAYER 3.75: Wellness Check-In (gentle, optional interruption) */}
        {/* CALMNESS SAFEGUARD: Non-blocking, appears below actions, not at top */}
        {showWellnessCheckIn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mb-6"
          >
            <WellnessCheckIn
              onTakeBreath={handleTakeBreath}
              onDismiss={handleDismissCheckIn}
              onTalkNow={handleTalkNow}
            />
          </motion.div>
        )}

        {/* LAYER 4: Background Awareness (read-only, low priority) */}
        {/* Today's Wellness - Passive, non-clickable, calm awareness */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mb-6 p-5 rounded-2xl bg-secondary/20 border border-border/20"
        >
          {/* Title - calm, non-medical */}
          <h3 className="text-xs font-medium text-muted-foreground/60 mb-4 uppercase tracking-wider">
            From your device today
          </h3>

          {/* Wellness items - text only, no numbers or charts */}
          <div className="space-y-3">
            {/* Sleep duration - descriptive text, not hours */}
            <div className="flex items-start gap-3">
              <div className="w-1 h-1 rounded-full bg-primary/40 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-foreground/80">
                  Resting well
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Sleep quality
                </p>
              </div>
            </div>

            {/* Body state - calm descriptive text */}
            <div className="flex items-start gap-3">
              <div className="w-1 h-1 rounded-full bg-accent/40 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-foreground/80">
                  Steady and calm
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Body state
                </p>
              </div>
            </div>

            {/* Activity balance - general observation */}
            <div className="flex items-start gap-3">
              <div className="w-1 h-1 rounded-full bg-purple-500/40 mt-2" />
              <div className="flex-1">
                <p className="text-sm text-foreground/80">
                  Activity balanced
                </p>
                <p className="text-xs text-muted-foreground/60">
                  Movement today
                </p>
              </div>
            </div>
          </div>

          {/* View insights link - subtle, not prominent */}
          <button
            onClick={() => onSelectAction('insights')}
            className="w-full mt-4 py-2 text-xs text-primary/60 hover:text-primary/80 transition-colors text-center"
          >
            View insights →
          </button>

          {/* Subtle footer note */}
          <p className="text-xs text-muted-foreground/40 mt-2 text-center">
            General observations, not medical data
          </p>
        </motion.div>

        {/* Gentle reminder */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="text-center text-sm text-muted-foreground/60 mb-6"
        >
          You're not alone in how you feel.
        </motion.p>
      </div>

      {/* Account Panel */}
      <Account isOpen={isAccountOpen} onClose={() => setIsAccountOpen(false)} />
    </div>
  );
}
