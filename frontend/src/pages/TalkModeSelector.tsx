import { motion } from 'framer-motion';
import { MessageCircle, Mic, ArrowLeft } from 'lucide-react';

/**
 * Talk Mode Selector
 * 
 * Appears when user clicks "Talk Now" on dashboard.
 * Allows user to choose between Text or Voice conversation mode.
 * 
 * ETHICAL DESIGN:
 * - Both options have equal visual weight
 * - No urgency language
 * - Calm, minimal design
 * - Clear that both are supportive, not replacements for human connection
 */

interface TalkModeSelectorProps {
    onSelectMode: (mode: 'text' | 'voice') => void;
    onBack: () => void;
}

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
        opacity: 1,
        y: 0,
        transition: { duration: 0.4, ease: 'easeOut' },
    },
};

export function TalkModeSelector({ onSelectMode, onBack }: TalkModeSelectorProps) {
    return (
        <div className="absolute inset-0 flex flex-col p-6 bg-background">
            {/* Back Button */}
            <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                onClick={onBack}
                className="shrink-0 self-start mb-8 p-2 rounded-full hover:bg-secondary/20 transition-colors"
            >
                <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </motion.button>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center min-h-0 overflow-y-auto">
                <motion.div
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                    className="max-w-2xl w-full space-y-12"
                >
                    {/* Heading */}
                    <motion.div variants={itemVariants} className="text-center space-y-3">
                        <h1 className="text-3xl font-serif font-light text-foreground">
                            How would you like to talk?
                        </h1>
                        <p className="text-muted-foreground">
                            Choose the way that feels most comfortable
                        </p>
                    </motion.div>

                    {/* Mode Options */}
                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Text Mode */}
                        <motion.button
                            variants={itemVariants}
                            onClick={() => onSelectMode('text')}
                            className="group relative p-10 rounded-3xl text-center border-2 border-border/50 hover:border-primary/50 bg-gradient-to-br from-primary/5 to-transparent transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex flex-col items-center space-y-6">
                                <div className="p-6 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                                    <MessageCircle className="w-10 h-10 text-primary" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                                        Text
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Gentle, guided chat
                                    </p>
                                </div>
                            </div>
                        </motion.button>

                        {/* Voice Mode */}
                        <motion.button
                            variants={itemVariants}
                            onClick={() => onSelectMode('voice')}
                            className="group relative p-10 rounded-3xl text-center border-2 border-border/50 hover:border-accent/50 bg-gradient-to-br from-accent/5 to-transparent transition-all duration-300 hover:shadow-lg"
                        >
                            <div className="flex flex-col items-center space-y-6">
                                <div className="p-6 rounded-full bg-accent/10 group-hover:bg-accent/20 transition-colors">
                                    <Mic className="w-10 h-10 text-accent" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h2 className="text-2xl font-semibold text-foreground mb-2">
                                        Voice
                                    </h2>
                                    <p className="text-sm text-muted-foreground">
                                        Hands-free conversation
                                    </p>
                                </div>
                            </div>
                        </motion.button>
                    </div>

                    {/* Subtle Note */}
                    <motion.p
                        variants={itemVariants}
                        className="text-center text-xs text-muted-foreground/60"
                    >
                        This is a supportive space, not a replacement for human connection
                    </motion.p>
                </motion.div>
            </div>
        </div>
    );
}
