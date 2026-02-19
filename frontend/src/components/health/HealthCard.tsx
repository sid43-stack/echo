/**
 * Health Card Component
 * Dashboard widget displaying health trends and emotional correlation.
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, TrendingUp, TrendingDown, Minus, Heart, Footprints, Moon, Smile } from 'lucide-react';
import { getHealthHistory, getHealthAnalysis } from '@/services/health.service';
import type { ApiHealthCheckpoint, ApiHealthAnalysis } from '@/api';

export function HealthCard() {
    const [analysis, setAnalysis] = useState<ApiHealthAnalysis | null>(null);
    const [recentCheckpoints, setRecentCheckpoints] = useState<ApiHealthCheckpoint[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchHealthData() {
            try {
                setLoading(true);
                const [analysisData, historyData] = await Promise.all([
                    getHealthAnalysis(),
                    getHealthHistory(10),
                ]);
                setAnalysis(analysisData);
                setRecentCheckpoints(historyData);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load health data');
            } finally {
                setLoading(false);
            }
        }

        fetchHealthData();
    }, []);

    if (loading) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-1/3" />
                    <div className="h-20 bg-muted rounded" />
                </div>
            </div>
        );
    }

    if (error || !analysis) {
        return (
            <div className="bg-card border border-border rounded-xl p-6">
                <p className="text-sm text-muted-foreground">
                    {error || 'No health data available yet'}
                </p>
            </div>
        );
    }

    const getTrendIcon = (isIncreasing: boolean, isNegative: boolean = false) => {
        if (isIncreasing && !isNegative) return <TrendingUp className="w-4 h-4 text-green-500" />;
        if (!isIncreasing && !isNegative) return <TrendingDown className="w-4 h-4 text-amber-500" />;
        if (isIncreasing && isNegative) return <TrendingUp className="w-4 h-4 text-amber-500" />;
        return <TrendingDown className="w-4 h-4 text-green-500" />;
    };

    const getMoodIcon = () => {
        switch (analysis.moodTrend) {
            case 'improving':
                return <TrendingUp className="w-4 h-4 text-green-500" />;
            case 'declining':
                return <TrendingDown className="w-4 h-4 text-amber-500" />;
            case 'stable':
                return <Minus className="w-4 h-4 text-blue-500" />;
            default:
                return <Smile className="w-4 h-4 text-muted-foreground" />;
        }
    };

    const avgSteps = recentCheckpoints
        .filter((c) => c.steps !== null)
        .reduce((sum, c, _, arr) => sum + (c.steps || 0) / arr.length, 0);

    const avgSleep = recentCheckpoints
        .filter((c) => c.sleepHours !== null)
        .reduce((sum, c, _, arr) => sum + (c.sleepHours || 0) / arr.length, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card border border-border rounded-xl p-6 space-y-4"
        >
            <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                <h3 className="font-semibold text-foreground">Health Trends</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Heart Rate */}
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-red-500/10">
                        <Heart className="w-4 h-4 text-red-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-xs text-muted-foreground">Heart Rate</p>
                        <div className="flex items-center gap-1">
                            <p className="text-sm font-medium">{analysis.avgHeartRate} bpm</p>
                            {analysis.abnormalSpikes && getTrendIcon(true, true)}
                        </div>
                    </div>
                </div>

                {/* Steps */}
                {avgSteps > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <Footprints className="w-4 h-4 text-blue-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Steps</p>
                            <div className="flex items-center gap-1">
                                <p className="text-sm font-medium">{Math.round(avgSteps)}</p>
                                {analysis.stepDecline && getTrendIcon(false, true)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Sleep */}
                {avgSleep > 0 && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/10">
                            <Moon className="w-4 h-4 text-purple-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Sleep</p>
                            <div className="flex items-center gap-1">
                                <p className="text-sm font-medium">{avgSleep.toFixed(1)}h</p>
                                {analysis.lowSleep && getTrendIcon(false, true)}
                            </div>
                        </div>
                    </div>
                )}

                {/* Mood */}
                {analysis.moodTrend !== 'unknown' && (
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <Smile className="w-4 h-4 text-green-500" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-muted-foreground">Mood</p>
                            <div className="flex items-center gap-1">
                                <p className="text-sm font-medium capitalize">{analysis.moodTrend}</p>
                                {getMoodIcon()}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Summary */}
            <div className="pt-4 border-t border-border">
                <p className="text-xs text-muted-foreground">{analysis.summary}</p>
            </div>
        </motion.div>
    );
}
