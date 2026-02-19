/**
 * Memory Page
 *
 * Read-only page at /memory.
 * Shows lastSummary, lastMood, and the last 5 conversation reflections.
 *
 * Does NOT modify any existing pages.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Brain, Heart, Sparkles } from 'lucide-react';
import { useUserState } from '../context/UserStateContext';
import { api } from '../api';
import type { ConversationReflection } from '../api/client';
import { AssistantPresence } from '../components/AssistantPresence';
import VerifiedRecords from '../blockchain/VerifiedRecords';
import WalletButton from '../blockchain/WalletButton';

function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

export default function Memory() {
    const navigate = useNavigate();
    const { userState } = useUserState();
    const [reflections, setReflections] = useState<ConversationReflection[]>([]);
    const [loadingReflections, setLoadingReflections] = useState(true);

    useEffect(() => {
        let active = true;
        (async () => {
            try {
                const data = await api.userState.reflections();
                if (active) setReflections(data);
            } catch {
                // silently fail — read-only page
            } finally {
                if (active) setLoadingReflections(false);
            }
        })();
        return () => { active = false; };
    }, []);

    return (
        <div className="min-h-screen bg-background relative overflow-hidden">
            {/* Ambient background */}
            <motion.div
                className="absolute inset-0 overflow-hidden pointer-events-none"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            >
                <div className="absolute top-0 left-0 w-80 h-80 bg-purple-500/8 rounded-full blur-3xl" />
                <div className="absolute bottom-1/3 right-0 w-96 h-96 bg-primary/6 rounded-full blur-3xl" />
            </motion.div>

            <div className="relative z-10 max-w-2xl mx-auto px-6 py-8">
                {/* Top bar */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between mb-10"
                >
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Dashboard
                    </button>
                    <AssistantPresence />
                </motion.div>

                {/* Title */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mb-10"
                >
                    <div className="flex items-center gap-3 mb-2">
                        <Brain className="w-6 h-6 text-purple-400" />
                        <h1 className="text-2xl font-semibold text-foreground">Your Memory</h1>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        A quiet space for your reflections and emotional history.
                    </p>
                </motion.div>

                {/* Current State Card */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 rounded-2xl bg-secondary/20 border border-border/20 mb-8"
                >
                    <h2 className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-4">
                        Current Snapshot
                    </h2>

                    <div className="space-y-4">
                        {/* Last Summary */}
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground/60 mb-1">Last Summary</p>
                                <p className="text-sm text-foreground leading-relaxed">
                                    {userState?.lastSummary || 'No summary yet — start a conversation to build your story.'}
                                </p>
                            </div>
                        </div>

                        {/* Last Mood */}
                        <div className="flex items-start gap-3">
                            <Heart className="w-4 h-4 text-pink-400 mt-0.5 shrink-0" />
                            <div>
                                <p className="text-xs text-muted-foreground/60 mb-1">Last Mood</p>
                                <p className="text-sm text-foreground capitalize">
                                    {userState?.lastMood || '—'}
                                </p>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Reflections */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider mb-4">
                        Conversation Reflections
                    </h2>

                    {loadingReflections ? (
                        <div className="text-sm text-muted-foreground/50 py-8 text-center">
                            Loading reflections...
                        </div>
                    ) : reflections.length === 0 ? (
                        <div className="p-6 rounded-2xl bg-secondary/10 border border-border/15 text-center">
                            <p className="text-sm text-muted-foreground/60">
                                No reflections yet. They'll appear here after conversations are reflected upon.
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {reflections.map((ref, index) => (
                                <motion.div
                                    key={ref.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 + index * 0.08 }}
                                    className="p-5 rounded-2xl bg-secondary/15 border border-border/15"
                                >
                                    <p className="text-sm text-foreground leading-relaxed mb-3">
                                        {ref.reflection}
                                    </p>
                                    <p className="text-xs text-muted-foreground/50">
                                        {formatDate(ref.createdAt)}
                                    </p>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </motion.div>

                {/* Blockchain Verified Records */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mt-10"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div />
                        <WalletButton />
                    </div>
                    <VerifiedRecords />
                </motion.div>
            </div>
        </div>
    );
}
