import { motion } from 'framer-motion';
import { ArrowLeft, Sparkles, MessageCircle, Wind, BookOpen } from 'lucide-react';
import type { MoodType } from './onboarding/EmotionalBaseline';

/**
 * Insights Page
 * 
 * A calm, reflective view of the user's emotional journey.
 * Shows emotional summary, activity usage, mood trends, and encouragement.
 * 
 * Uses mocked data for now, but structured for real data integration.
 */

interface InsightsProps {
    onBack: () => void;
    onNavigate?: (action: string) => void;
}

interface NextAction {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
}

// Mock data - will be replaced with real data from context/storage
const mockInsightsData = {
    emotionalSummary: "You've been finding moments of calm this week.",
    activityCounts: {
        chat: 5,
        breathing: 8,
        journal: 3,
    },
    moodTrend: [
        { day: 'Mon', mood: 'calm' as MoodType },
        { day: 'Tue', mood: 'neutral' as MoodType },
        { day: 'Wed', mood: 'anxious' as MoodType },
        { day: 'Thu', mood: 'calm' as MoodType },
        { day: 'Fri', mood: 'neutral' as MoodType },
        { day: 'Sat', mood: 'calm' as MoodType },
        { day: 'Sun', mood: 'calm' as MoodType },
    ],
    encouragement: {
        title: "You're showing up",
        message: "Coming back, even on hard days, is what matters most."
    }
};

// Mood color mapping for visual indicators
const moodColors: Record<MoodType, string> = {
    calm: 'bg-primary',
    neutral: 'bg-accent',
    lonely: 'bg-purple-500',
    anxious: 'bg-amber-500',
    overwhelmed: 'bg-red-500',
};

const moodLabels: Record<MoodType, string> = {
    calm: 'Calm',
    neutral: 'Neutral',
    lonely: 'Lonely',
    anxious: 'Anxious',
    overwhelmed: 'Overwhelmed',
};

/**
 * Suggests next action based on insight data
 * Logic:
 * - If breathing is low, suggest breathing
 * - If journal is low, suggest journaling
 * - If mood trend shows anxiety, suggest breathing
 * - If mood is mostly calm, suggest chat to maintain connection
 * - Default to breathing (always safe)
 */
function suggestNextAction(data: typeof mockInsightsData): NextAction {
    const { activityCounts, moodTrend } = data;

    // Count anxious/overwhelmed days
    const stressfulDays = moodTrend.filter(
        entry => entry.mood === 'anxious' || entry.mood === 'overwhelmed'
    ).length;

    // Check if user has been journaling
    const hasJournaled = activityCounts.journal > 0;

    // Suggestion priority logic

    // 1. If multiple stressful days and low breathing, suggest breathing
    if (stressfulDays >= 2 && activityCounts.breathing < 5) {
        return {
            id: 'breathing',
            title: 'Take a breathing break',
            description: 'A few minutes of calm breathing might help.',
            icon: <Wind className="w-5 h-5" />
        };
    }

    // 2. If no journaling this week, gently suggest it
    if (!hasJournaled) {
        return {
            id: 'journal',
            title: 'Try journaling',
            description: 'Sometimes writing helps process what you\'re feeling.',
            icon: <BookOpen className="w-5 h-5" />
        };
    }

    // 3. If breathing is very low, suggest it
    if (activityCounts.breathing < 3) {
        return {
            id: 'breathing',
            title: 'Take a breathing break',
            description: 'Even a minute can make a difference.',
            icon: <Wind className="w-5 h-5" />
        };
    }

    // 4. If mostly calm, suggest chat to maintain connection
    const calmDays = moodTrend.filter(entry => entry.mood === 'calm').length;
    if (calmDays >= 4) {
        return {
            id: 'chat',
            title: 'Check in with yourself',
            description: 'You\'ve been doing well. Want to talk about it?',
            icon: <MessageCircle className="w-5 h-5" />
        };
    }

    // 5. Default: breathing (always a safe, calming option)
    return {
        id: 'breathing',
        title: 'Take a moment to breathe',
        description: 'A simple way to reset and center yourself.',
        icon: <Wind className="w-5 h-5" />
    };
}

export function Insights({ onBack, onNavigate }: InsightsProps) {
    const { emotionalSummary, activityCounts, moodTrend, encouragement } = mockInsightsData;

    // Get suggested next action based on insight data
    const suggestedAction = suggestNextAction(mockInsightsData);

    return (
        <div className="absolute inset-0 flex flex-col p-6">
            {/* Ambient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
            </div>
            {/* Ambient background - removed, replaced by GridScan */}

            <div className="relative z-10 max-w-md mx-auto w-full flex-1 min-h-0 overflow-y-auto no-scrollbar">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="mb-8 mt-4"
                >
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back</span>
                    </button>

                    <h1 className="text-2xl md:text-3xl font-semibold text-foreground mb-2">
                        Your Insights
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        A gentle look at your journey
                    </p>
                </motion.div>

                {/* Emotional Summary */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20"
                >
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <p className="text-lg text-foreground leading-relaxed">
                            {emotionalSummary}
                        </p>
                    </div>
                </motion.div>

                {/* Activity Usage */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <h2 className="text-sm font-medium text-muted-foreground mb-4">
                        What you've been doing
                    </h2>

                    <div className="grid grid-cols-3 gap-3">
                        {/* Chat */}
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/20 text-center">
                            <MessageCircle className="w-5 h-5 text-foreground/70 mx-auto mb-2" />
                            <div className="text-2xl font-semibold text-foreground mb-1">
                                {activityCounts.chat}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Conversations
                            </div>
                        </div>

                        {/* Breathing */}
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/20 text-center">
                            <Wind className="w-5 h-5 text-foreground/70 mx-auto mb-2" />
                            <div className="text-2xl font-semibold text-foreground mb-1">
                                {activityCounts.breathing}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Breathing
                            </div>
                        </div>

                        {/* Journal */}
                        <div className="p-4 rounded-xl bg-secondary/30 border border-border/20 text-center">
                            <BookOpen className="w-5 h-5 text-foreground/70 mx-auto mb-2" />
                            <div className="text-2xl font-semibold text-foreground mb-1">
                                {activityCounts.journal}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Journal entries
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* 7-Day Mood Trend */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="mb-8"
                >
                    <h2 className="text-sm font-medium text-muted-foreground mb-4">
                        Your week at a glance
                    </h2>

                    <div className="p-5 rounded-xl bg-secondary/20 border border-border/20">
                        <div className="flex justify-between items-end gap-2">
                            {moodTrend.map((entry, index) => (
                                <div key={index} className="flex-1 flex flex-col items-center gap-2">
                                    {/* Mood indicator pill */}
                                    <div className="relative group">
                                        <div
                                            className={`w-3 h-8 rounded-full ${moodColors[entry.mood]} transition-all hover:h-10`}
                                            title={moodLabels[entry.mood]}
                                        />
                                        {/* Tooltip on hover */}
                                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                                            <div className="bg-foreground text-background text-xs px-2 py-1 rounded whitespace-nowrap">
                                                {moodLabels[entry.mood]}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Day label */}
                                    <div className="text-xs text-muted-foreground">
                                        {entry.day}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Legend */}
                        <div className="mt-4 pt-4 border-t border-border/20 flex flex-wrap gap-3 justify-center">
                            {Object.entries(moodColors).slice(0, 3).map(([mood, color]) => (
                                <div key={mood} className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${color}`} />
                                    <span className="text-xs text-muted-foreground">
                                        {moodLabels[mood as MoodType]}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Encouragement Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-8 p-6 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/20"
                >
                    <h3 className="text-base font-medium text-foreground mb-2">
                        {encouragement.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        {encouragement.message}
                    </p>
                </motion.div>

                {/* Suggested Next Action - Soft CTA */}
                {onNavigate && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.6 }}
                        onClick={() => onNavigate(suggestedAction.id)}
                        className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/10 border border-border/30 hover:border-border/50 transition-all text-left group"
                    >
                        <div className="flex items-start gap-4">
                            <div className="mt-1 text-foreground/60 group-hover:text-primary transition-colors">
                                {suggestedAction.icon}
                            </div>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground/60 mb-1">
                                    If you'd like
                                </p>
                                <h3 className="text-base font-medium text-foreground mb-1 group-hover:text-primary transition-colors">
                                    {suggestedAction.title}
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    {suggestedAction.description}
                                </p>
                            </div>
                            <div className="text-xs text-primary/40 group-hover:text-primary/70 transition-colors mt-1">
                                →
                            </div>
                        </div>
                    </motion.button>
                )}

                {/* Gentle footer note */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-center text-xs text-muted-foreground/60 mb-6"
                >
                    These insights are just for you — a gentle reminder of your journey.
                </motion.p>
            </div>
        </div>
    );
}
