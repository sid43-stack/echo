import { motion } from 'framer-motion';
import { Heart, Gauge, Clock, Sparkles } from 'lucide-react';

/**
 * EmotionalInsight Component
 * 
 * Displays AI-detected emotional insights in a non-intrusive panel.
 * Shows: detected emotion, drift level, current time.
 * 
 * In production:
 * - Emotion would come from sentiment analysis ML model
 * - Drift score would be computed from conversation patterns
 * - Could include historical trends
 */

interface EmotionalInsightProps {
  emotion: string;
  driftScore: number;
  suggestion: string | null;
}

export function EmotionalInsight({ emotion, driftScore, suggestion }: EmotionalInsightProps) {
  // Get current time formatted for late-night display
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  // Map drift score to readable level
  const getDriftLevel = (score: number) => {
    if (score < 40) return { level: 'Low', color: 'text-emotion-calm' };
    if (score < 70) return { level: 'Medium', color: 'text-accent' };
    return { level: 'High', color: 'text-emotion-lonely' };
  };

  const drift = getDriftLevel(driftScore);

  // Capitalize emotion for display
  const displayEmotion = emotion.charAt(0).toUpperCase() + emotion.slice(1);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-card p-4 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Sparkles className="w-3 h-3" />
        <span>AI-detected emotional insight</span>
      </div>

      {/* Emotion */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-emotion-lonely/20 flex items-center justify-center">
          <Heart className="w-5 h-5 text-emotion-lonely" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Feeling</p>
          <p className="font-semibold text-foreground">{displayEmotion}</p>
        </div>
      </div>

      {/* Drift Level */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Gauge className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Drift Level</p>
          <p className={`font-semibold ${drift.color}`}>{drift.level}</p>
        </div>
      </div>

      {/* Time */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
          <Clock className="w-5 h-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current Time</p>
          <p className="font-semibold text-foreground">{currentTime}</p>
        </div>
      </div>

      {/* Suggestion indicator */}
      {suggestion && (
        <div className="pt-2 border-t border-border/50">
          <p className="text-xs text-muted-foreground">
            Suggested: <span className="text-primary capitalize">{suggestion}</span>
          </p>
        </div>
      )}
    </motion.div>
  );
}
