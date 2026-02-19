import { motion } from 'framer-motion';
import { Moon, Sun, Heart, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getSessionSummary } from '@/data/mockResponses';

/**
 * Session Summary Page
 * 
 * Displayed after a user ends their session.
 * Shows:
 * - Personalized closing message based on session
 * - Mood improvement indicator (simple visual)
 * - Gentle encouragement for real-world connection
 * 
 * MOCKED: The improvement calculation uses drift scores from the session.
 * In production, this would be computed from ML analysis of the conversation.
 */

interface SummaryProps {
  startDrift: number;
  endDrift: number;
  onStartNewSession: () => void;
}

export function Summary({ startDrift, endDrift, onStartNewSession }: SummaryProps) {
  const summaryMessage = getSessionSummary(startDrift, endDrift);
  const improvement = Math.max(0, startDrift - endDrift);
  const improvementPercentage = Math.round((improvement / startDrift) * 100);

  // Determine visual indicator based on improvement
  const getImprovement = () => {
    if (improvement > 15) return { text: 'Calmer', icon: Sun, color: 'text-emotion-calm' };
    if (improvement > 5) return { text: 'Settling', icon: Moon, color: 'text-primary' };
    return { text: 'Present', icon: Heart, color: 'text-emotion-lonely' };
  };

  const improvementData = getImprovement();
  const ImprovementIcon = improvementData.icon;

  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center px-6 relative overflow-hidden bg-background">
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.3 }}
          transition={{ duration: 2 }}
          className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
        />
      </div>
      {/* Background elements - removed, replaced by FlowingGradient */}

      {/* Main content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-md flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col justify-center"
      >
        {/* Mood improvement visual */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-8 inline-flex"
        >
          <div className={`w-24 h-24 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex flex-col items-center justify-center glow`}>
            <ImprovementIcon className={`w-10 h-10 ${improvementData.color}`} />
            <span className={`text-xs font-medium mt-1 ${improvementData.color}`}>
              {improvementData.text}
            </span>
          </div>
        </motion.div>

        {/* Summary message */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="text-2xl sm:text-3xl font-bold text-foreground mb-4 leading-relaxed"
        >
          {summaryMessage}
        </motion.h1>

        {/* Improvement indicator */}
        {improvement > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <span className="text-sm text-primary font-medium">
                ↓ {improvementPercentage}% less drifting
              </span>
            </div>
          </motion.div>
        )}

        {/* Encouragement */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-muted-foreground mb-10 leading-relaxed"
        >
          Remember, reaching out is a sign of strength.
          Consider connecting with someone you trust tomorrow—a friend,
          family member, or counselor.
        </motion.p>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-3 justify-center"
        >
          <Button
            variant="default"
            size="lg"
            onClick={onStartNewSession}
            className="gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Start New Session
          </Button>
        </motion.div>

        {/* Time */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-8 text-sm text-muted-foreground/60"
        >
          Session ended at{' '}
          {new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
          })}
        </motion.p>
      </motion.div>

      {/* Resources note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1 }}
        className="absolute bottom-6 text-center px-4"
      >
        <p className="text-xs text-muted-foreground/40 mb-2">
          If you're struggling, please reach out to a professional.
        </p>
        <p className="text-xs text-muted-foreground/60">
          National Suicide Prevention Lifeline: 988 | Crisis Text Line: Text HOME to 741741
        </p>
      </motion.div>
    </div>
  );
}
