/**
 * User Dashboard Page
 *
 * Post-login landing page at /dashboard.
 * Displays dynamic greeting, conversation streak, last interaction time,
 * and a "2-minute check-in" button.
 *
 * Does NOT modify Chat.tsx or VoiceChat.tsx.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Flame, Clock, ChevronRight, Brain, ArrowLeft } from 'lucide-react';
import { useUserState } from '../context/UserStateContext';
import { AssistantPresence } from '../components/AssistantPresence';
import WalletButton from '../blockchain/WalletButton';

function timeAgo(dateStr: string | null): string {
    if (!dateStr) return 'Never';
    const diff = Date.now() - new Date(dateStr).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

export default function UserDashboard() {
    const navigate = useNavigate();
    const { userState, loading } = useUserState();
    const [greeting, setGreeting] = useState('');

    useEffect(() => {
        const hour = new Date().getHours();
        if (hour >= 22 || hour < 5) setGreeting('Good evening');
        else if (hour < 12) setGreeting('Good morning');
        else if (hour < 17) setGreeting('Good afternoon');
        else setGreeting('Good evening');
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-muted-foreground text-sm"
                >
                    Loading your space...
                </motion.div>
            </div>
        );
    }

    const streak = userState?.conversationStreak ?? 0;
    const lastSummary = userState?.lastSummary;
    const lastMood = userState?.lastMood;
    const lastInteraction = userState?.lastInteractionAt ?? null;

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Ambient background */}
            <motion.div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            >
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-accent/6 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
            </motion.div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-8 flex flex-col flex-1 min-h-0 overflow-y-auto w-full">
                {/* Top bar */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-12"
                >
                    <button
                        onClick={() => navigate('/app')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to app
                    </button>
                    <div className="flex items-center gap-3">
                        <WalletButton />
                        <AssistantPresence />
                    </div>
                </motion.div>

                {/* Greeting */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10"
                >
                    <h1 className="text-3xl font-semibold text-foreground mb-2">
                        {greeting}.
                    </h1>
                    {lastSummary ? (
                        <p className="text-muted-foreground text-base leading-relaxed">
                            {lastSummary}
                        </p>
                    ) : (
                        <p className="text-muted-foreground text-base">
                            Welcome to your personal space. Start a conversation to build your story.
                        </p>
                    )}
                </motion.div>

                {/* Stats row */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="grid grid-cols-3 gap-4 mb-10"
                >
                    {/* Streak */}
                    <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Flame className="w-4 h-4 text-orange-400" />
                            <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">Streak</span>
                        </div>
                        <p className="text-2xl font-bold text-foreground">
                            {streak}
                            <span className="text-sm font-normal text-muted-foreground ml-1">
                                {streak === 1 ? 'day' : 'days'}
                            </span>
                        </p>
                    </div>

                    {/* Last Active */}
                    <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-4 h-4 text-blue-400" />
                            <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">Last Active</span>
                        </div>
                        <p className="text-lg font-semibold text-foreground">
                            {timeAgo(lastInteraction)}
                        </p>
                    </div>

                    {/* Mood */}
                    <div className="p-4 rounded-2xl bg-secondary/20 border border-border/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Brain className="w-4 h-4 text-purple-400" />
                            <span className="text-xs text-muted-foreground/70 uppercase tracking-wider">Mood</span>
                        </div>
                        <p className="text-lg font-semibold text-foreground capitalize">
                            {lastMood || '—'}
                        </p>
                    </div>
                </motion.div>

                {/* Check-in CTA */}
                <motion.button
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    onClick={() => navigate('/app')}
                    className="
            w-full py-6 px-8 rounded-3xl text-left mb-6
            bg-gradient-to-br from-primary/25 to-primary/10
            border-2 border-primary/20
            transition-all duration-300
            hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/15
            active:scale-[0.98]
            flex items-center gap-5
          "
                >
                    <div className="p-4 rounded-full bg-primary/15">
                        <MessageCircle className="w-7 h-7 text-primary" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1">
                        <h2 className="text-lg font-semibold text-foreground mb-1">
                            2-Minute Check-in
                        </h2>
                        <p className="text-sm text-muted-foreground">
                            A quick moment to share how you're doing
                        </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                {/* Memory link */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    onClick={() => navigate('/memory')}
                    className="
            w-full py-4 px-6 rounded-2xl text-left
            bg-secondary/10 border border-border/15
            hover:bg-secondary/20 transition-all
            flex items-center gap-4
          "
                >
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-foreground">Your Memory</h3>
                        <p className="text-xs text-muted-foreground/70">View reflections and history</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                </motion.button>
            </div>
        </div>
    );
}
