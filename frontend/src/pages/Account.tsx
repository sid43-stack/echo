import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Heart, Shield } from 'lucide-react';
import { useState } from 'react';
import { useAccount } from '../context/AccountContext';
import { SUPPORT_STYLES, PRONOUN_OPTIONS, type SupportStyle } from '../types/account';

/**
 * Account Component
 * 
 * Slide-in panel for optional user personalization.
 * No authentication - just preferences and basic info.
 */

interface AccountProps {
    isOpen: boolean;
    onClose: () => void;
}

export function Account({ isOpen, onClose }: AccountProps) {
    const { account, updateAccount, clearAccount } = useAccount();
    const [showClearConfirm, setShowClearConfirm] = useState(false);

    const handleClearData = () => {
        clearAccount();
        setShowClearConfirm(false);
        onClose();
    };

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

                    {/* Slide-in Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-background border-l border-border shadow-2xl z-50 overflow-y-auto"
                    >
                        <div className="p-6">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-2xl font-semibold text-foreground">Account</h2>
                                <button
                                    onClick={onClose}
                                    className="p-2 rounded-full hover:bg-secondary/50 transition-colors"
                                    aria-label="Close"
                                >
                                    <X className="w-5 h-5 text-muted-foreground" />
                                </button>
                            </div>

                            {/* SECTION 1: Basic Info */}
                            <section className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <User className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-medium text-foreground">Basic Info</h3>
                                </div>

                                <div className="space-y-4">
                                    {/* Name Input */}
                                    <div>
                                        <label htmlFor="name" className="block text-sm text-muted-foreground mb-2">
                                            Name or nickname (optional)
                                        </label>
                                        <input
                                            id="name"
                                            type="text"
                                            value={account.name || ''}
                                            onChange={(e) => updateAccount({ name: e.target.value })}
                                            placeholder="How should we address you?"
                                            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        />
                                    </div>

                                    {/* Pronouns Dropdown */}
                                    <div>
                                        <label htmlFor="pronouns" className="block text-sm text-muted-foreground mb-2">
                                            Pronouns (optional)
                                        </label>
                                        <select
                                            id="pronouns"
                                            value={account.pronouns || ''}
                                            onChange={(e) => updateAccount({ pronouns: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                                        >
                                            {PRONOUN_OPTIONS.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </section>

                            {/* SECTION 2: Preferences */}
                            <section className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Heart className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-medium text-foreground">Support Preferences</h3>
                                </div>

                                <div className="space-y-3">
                                    {(Object.keys(SUPPORT_STYLES) as SupportStyle[]).map((style) => {
                                        const styleInfo = SUPPORT_STYLES[style];
                                        const isSelected = account.supportStyle === style;

                                        return (
                                            <button
                                                key={style}
                                                onClick={() => updateAccount({ supportStyle: style })}
                                                className={`
                          w-full p-4 rounded-xl text-left transition-all
                          ${isSelected
                                                        ? 'bg-primary/20 border-2 border-primary/40'
                                                        : 'bg-secondary/30 border border-border/30 hover:bg-secondary/50'
                                                    }
                        `}
                                            >
                                                <div className="font-medium text-foreground mb-1">
                                                    {styleInfo.label}
                                                </div>
                                                <div className="text-xs text-muted-foreground">
                                                    {styleInfo.description}
                                                </div>
                                            </button>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* SECTION 3: Data Transparency */}
                            <section className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="w-5 h-5 text-primary" />
                                    <h3 className="text-lg font-medium text-foreground">Your Data</h3>
                                </div>

                                <div className="p-4 rounded-xl bg-secondary/20 border border-border/20 mb-4">
                                    <p className="text-sm text-muted-foreground mb-3">
                                        All data is stored locally on your device. Nothing is sent to any server.
                                    </p>

                                    <div className="text-xs text-muted-foreground/70 space-y-1">
                                        <div>• Name: {account.name || 'Not set'}</div>
                                        <div>• Pronouns: {account.pronouns || 'Not set'}</div>
                                        <div>• Support style: {account.supportStyle ? SUPPORT_STYLES[account.supportStyle].label : 'Not set'}</div>
                                    </div>
                                </div>

                                {/* Clear Data Button */}
                                {!showClearConfirm ? (
                                    <button
                                        onClick={() => setShowClearConfirm(true)}
                                        className="w-full px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-all text-sm font-medium"
                                    >
                                        Clear all data
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <p className="text-sm text-muted-foreground text-center mb-2">
                                            Are you sure? This cannot be undone.
                                        </p>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => setShowClearConfirm(false)}
                                                className="flex-1 px-4 py-3 rounded-xl bg-secondary/30 border border-border/30 text-foreground hover:bg-secondary/50 transition-all text-sm font-medium"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleClearData}
                                                className="flex-1 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-500/30 transition-all text-sm font-medium"
                                            >
                                                Yes, clear
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Gentle reminder */}
                            <p className="text-center text-xs text-muted-foreground/60 mt-8">
                                Your privacy matters. This is your space.
                            </p>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
