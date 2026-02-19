import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../components/ui/button';
import { ArrowLeft, Play, Pause, RotateCcw } from 'lucide-react';

/**
 * Guided Breathing Page
 * 
 * Standalone breathing exercise using the 4-4-6 technique:
 * - Inhale for 4 seconds
 * - Hold for 4 seconds  
 * - Exhale for 6 seconds
 * 
 * Features animated expanding/contracting circle with text cues.
 */

interface BreathPhase {
    name: string;
    duration: number;
    instruction: string;
}

const PHASES: BreathPhase[] = [
    { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly' },
    { name: 'Hold', duration: 4, instruction: 'Hold your breath' },
    { name: 'Exhale', duration: 6, instruction: 'Breathe out gently' },
];

interface GuidedBreathingProps {
    onBack: () => void;
}

export function GuidedBreathing({ onBack }: GuidedBreathingProps) {
    const [isActive, setIsActive] = useState(false);
    const [currentPhase, setCurrentPhase] = useState(0);
    const [timeLeft, setTimeLeft] = useState(PHASES[0].duration);
    const [cycles, setCycles] = useState(0);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive) {
            interval = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        // Move to next phase
                        const nextPhase = (currentPhase + 1) % PHASES.length;
                        setCurrentPhase(nextPhase);
                        if (nextPhase === 0) {
                            setCycles((c) => c + 1);
                        }
                        return PHASES[nextPhase].duration;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isActive, currentPhase]);

    const handleToggle = () => {
        setIsActive(!isActive);
    };

    const handleReset = () => {
        setIsActive(false);
        setCurrentPhase(0);
        setTimeLeft(PHASES[0].duration);
        setCycles(0);
    };

    const phase = PHASES[currentPhase];
    const progress = ((phase.duration - timeLeft) / phase.duration) * 100;

    return (
        <div className="absolute inset-0 flex flex-col bg-background">
            {/* Header */}
            <div className="shrink-0 z-40 backdrop-blur-lg bg-background/80 border-b border-border">
                <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onBack}
                        className="rounded-full"
                    >
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                    <h1 className="text-xl font-serif font-light">Guided Breathing</h1>
                    <div className="w-10" />
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-h-0 overflow-y-auto flex items-center justify-center px-6 py-12">
                <div className="max-w-2xl w-full text-center space-y-12">
                    {/* Breathing Circle */}
                    <div className="relative flex items-center justify-center">
                        {/* Outer glow */}
                        <motion.div
                            animate={{
                                scale: isActive ? [1, 1.4, 1] : 1,
                                opacity: isActive ? [0.3, 0.6, 0.3] : 0.3,
                            }}
                            transition={{
                                duration: phase.duration,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute w-80 h-80 rounded-full bg-primary/20 blur-3xl"
                        />

                        {/* Middle circle */}
                        <motion.div
                            animate={{
                                scale: isActive
                                    ? currentPhase === 0
                                        ? 1.4
                                        : currentPhase === 1
                                            ? 1.4
                                            : 1
                                    : 1,
                            }}
                            transition={{
                                duration: phase.duration,
                                ease: 'easeInOut',
                            }}
                            className="relative w-64 h-64 rounded-full bg-primary/10 flex items-center justify-center"
                        >
                            {/* Inner circle */}
                            <motion.div
                                animate={{
                                    scale: isActive ? [1, 1.1, 1] : 1,
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: 'easeInOut',
                                }}
                                className="w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary/30"
                            >
                                <div className="text-center space-y-2">
                                    <div className="text-6xl font-light text-primary">{timeLeft}</div>
                                    <div className="text-sm text-muted-foreground uppercase tracking-wider">
                                        {phase.name}
                                    </div>
                                </div>
                            </motion.div>
                        </motion.div>
                    </div>

                    {/* Instruction */}
                    <motion.div
                        key={currentPhase}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="space-y-2"
                    >
                        <p className="text-2xl font-serif font-light text-foreground">
                            {phase.instruction}
                        </p>
                        <p className="text-muted-foreground">
                            Cycle {cycles + 1}
                        </p>
                    </motion.div>

                    {/* Controls */}
                    <div className="flex items-center justify-center gap-4">
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={handleReset}
                            className="h-14 w-14 rounded-full"
                        >
                            <RotateCcw className="w-6 h-6" />
                        </Button>
                        <Button
                            onClick={handleToggle}
                            size="lg"
                            className="h-20 w-20 rounded-full hover:scale-110 transition-transform duration-300"
                        >
                            {isActive ? (
                                <Pause className="w-8 h-8" />
                            ) : (
                                <Play className="w-8 h-8 ml-1" />
                            )}
                        </Button>
                    </div>

                    {/* Guidance */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-sm text-muted-foreground max-w-md mx-auto"
                    >
                        Find a comfortable position. Follow the circle as it expands and contracts.
                        Let each breath be natural and easy.
                    </motion.p>
                </div>
            </div>
        </div>
    );
}
