import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Community } from '../pages/Community';

/**
 * Community Side Panel
 * 
 * Overlay component that slides in from the right to show Community content.
 * Keeps the chat session active in the background.
 * 
 * ETHICAL DESIGN:
 * - Non-intrusive overlay
 * - Easy to close
 * - Doesn't end the chat session
 * - Encourages real human connection
 */

interface CommunitySidePanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CommunitySidePanel({ isOpen, onClose }: CommunitySidePanelProps) {
    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                    />

                    {/* Side Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full md:w-2/3 lg:w-1/2 bg-background shadow-2xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <h2 className="text-xl font-semibold text-foreground">
                                Community Activities
                            </h2>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-full hover:bg-secondary/20 transition-colors"
                            >
                                <X className="w-5 h-5 text-muted-foreground" />
                            </button>
                        </div>

                        {/* Community Content */}
                        <div className="flex-1 overflow-y-auto">
                            <Community onBack={onClose} />
                        </div>

                        {/* Footer Note */}
                        <div className="p-4 border-t border-border bg-secondary/10">
                            <p className="text-xs text-muted-foreground text-center">
                                Your conversation is still active. Close this panel to continue.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
