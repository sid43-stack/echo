import { motion, AnimatePresence } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from './ui/button';

/**
 * Wellness Check-In Card
 * 
 * A gentle, optional interruption triggered by simulated smartwatch signals.
 * Appears on the dashboard when an unexpected physiological change is detected
 * while the user is resting.
 * 
 * CALMNESS SAFEGUARDS:
 * - No urgency or alarms
 * - No medical language or numbers
 * - User always has control (can dismiss)
 * - Max one check-in per day
 * - Non-blocking, subtle visual design
 * - No repeated alerts after dismissal
 */

interface WellnessCheckInProps {
    onTakeBreath: () => void;
    onDismiss: () => void;
    onTalkNow?: () => void;
}

export function WellnessCheckIn({ onTakeBreath, onDismiss, onTalkNow }: WellnessCheckInProps) {
    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="fixed top-20 right-6 z-50 w-80 p-5 rounded-2xl bg-background border-2 border-primary/20 shadow-2xl shadow-primary/10"
            >
                {/* Icon */}
                <div className="flex items-start gap-3 mb-4">
                    <div className="p-2 rounded-full bg-primary/10">
                        <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1">
                        {/* Title */}
                        <h3 className="text-base font-medium text-foreground mb-1">
                            Your body seems tense
                        </h3>
                        {/* Subtitle */}
                        <p className="text-sm text-muted-foreground">
                            Want to pause for a moment?
                        </p>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2">
                    {/* Talk Now - Primary */}
                    <Button
                        onClick={onTalkNow || onDismiss}
                        size="sm"
                        className="flex-1 bg-primary hover:bg-primary/90"
                    >
                        Talk Now
                    </Button>

                    {/* Breathe - Secondary */}
                    <Button
                        onClick={onTakeBreath}
                        size="sm"
                        variant="outline"
                        className="flex-1"
                    >
                        Breathe
                    </Button>

                    {/* Dismiss - Tertiary */}
                    <Button
                        onClick={onDismiss}
                        size="sm"
                        variant="ghost"
                        className="flex-1"
                    >
                        Dismiss
                    </Button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
