/**
 * Health Alert Banner
 * Soft warning banner displayed when abnormal health patterns are detected.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface HealthAlertBannerProps {
    onDismiss?: () => void;
}

export function HealthAlertBanner({ onDismiss }: HealthAlertBannerProps) {
    const [isDismissed, setIsDismissed] = useState(false);

    const handleDismiss = () => {
        setIsDismissed(true);
        onDismiss?.();
    };

    return (
        <AnimatePresence>
            {!isDismissed && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4 mb-4"
                >
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-sm font-medium text-amber-700 dark:text-amber-300">
                                Health pattern notice
                            </h3>
                            <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                                I've noticed some changes in your health metrics. This doesn't mean anything is
                                wrong—just that your body might need extra care right now. Consider rest, hydration,
                                or gentle movement if it feels right.
                            </p>
                        </div>
                        <button
                            onClick={handleDismiss}
                            className="text-amber-500 hover:text-amber-600 transition-colors"
                            aria-label="Dismiss"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
