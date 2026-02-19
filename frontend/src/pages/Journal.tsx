
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Sparkles, RefreshCw, PenLine, Tag, Calendar, FolderHeart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";

/**
 * Journal Page
 * 
 * Expanded journaling feature with prompts, mood tagging, and history view.
 * Helps users reflect on their feelings with deeper insights.
 */

const journalPrompts = [
  "What's one thing that made you smile today?",
  "What are you grateful for right now?",
  "If you could tell someone how you feel, what would you say?",
  "What's something you're looking forward to?",
  "What would make tomorrow a little better?",
  "What's something kind you did for yourself today?",
  "What's on your mind right now?",
  "What's one small thing you accomplished today?",
];

const moodTags = [
  { label: "Happy", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  { label: "Calm", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { label: "Anxious", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
  { label: "Sad", color: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30" },
  { label: "Frustrated", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  { label: "Hopeful", color: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30" },
];

interface JournalProps {
  onBack: () => void;
}

export function Journal({ onBack }: JournalProps) {
  const [promptIndex, setPromptIndex] = useState(
    Math.floor(Math.random() * journalPrompts.length)
  );
  const [entry, setEntry] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [selectedMoods, setSelectedMoods] = useState<string[]>([]);
  const [view, setView] = useState<'write' | 'history'>('write');

  const currentPrompt = journalPrompts[promptIndex];

  const handleNewPrompt = () => {
    let newIndex = Math.floor(Math.random() * journalPrompts.length);
    while (newIndex === promptIndex && journalPrompts.length > 1) {
      newIndex = Math.floor(Math.random() * journalPrompts.length);
    }
    setPromptIndex(newIndex);
  };

  const toggleMood = (label: string) => {
    setSelectedMoods(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    );
  };

  const handleSave = () => {
    if (entry.trim()) {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        setEntry('');
        setSelectedMoods([]);
        // Optional: switch to history view or just clear
      }, 2000);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col bg-background text-foreground transition-colors duration-500">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between p-4 border-b border-border/10 bg-background/50 backdrop-blur-md sticky top-0 z-30 shrink-0"
      >
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-primary/10 hover:text-primary">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2">
            <h1 className="font-semibold text-lg tracking-tight">Journal</h1>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant={view === 'write' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('write')}
          >
            <PenLine className="w-4 h-4 mr-2" /> Write
          </Button>
          <Button
            variant={view === 'history' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setView('history')}
          >
            <FolderHeart className="w-4 h-4 mr-2" /> History
          </Button>
        </div>
      </motion.header>

      {/* Content */}
      <div className="flex-1 w-full max-w-2xl mx-auto p-4 md:p-6 min-h-0 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'write' ? (
            <motion.div
              key="write"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-6"
            >
              {/* Prompt Card */}
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-500"></div>
                <div className="relative p-6 rounded-2xl bg-card border border-border/50 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-xs font-medium text-cyan-400 uppercase tracking-wider">
                      <Sparkles className="w-3 h-3" />
                      Daily Reflection
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleNewPrompt}
                      className="h-8 text-xs text-muted-foreground hover:text-foreground"
                    >
                      <RefreshCw className="w-3 h-3 mr-2" />
                      New Prompt
                    </Button>
                  </div>
                  <h2 className="text-xl md:text-2xl font-serif text-foreground/90 leading-relaxed">
                    {currentPrompt}
                  </h2>
                </div>
              </div>

              {/* Editor Area */}
              <div className="space-y-4">
                <div className="relative">
                  <textarea
                    value={entry}
                    onChange={(e) => setEntry(e.target.value)}
                    placeholder="Pour your heart out..."
                    className="
                      w-full min-h-[300px] p-6 rounded-2xl
                      bg-card/50 border border-border/50
                      text-lg leading-relaxed text-foreground
                      placeholder:text-muted-foreground/30
                      resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/30
                      transition-all shadow-inner
                    "
                  />
                  <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                    {entry.length} chars
                  </div>
                </div>

                {/* Mood Tags */}
                <div className="flex flex-wrap gap-2">
                  <div className="flex items-center gap-2 mr-2 text-sm text-muted-foreground">
                    <Tag className="w-4 h-4" />
                    <span>Feeling:</span>
                  </div>
                  {moodTags.map(tag => (
                    <button
                      key={tag.label}
                      onClick={() => toggleMood(tag.label)}
                      className={`
                        px-3 py-1 rounded-full text-xs font-medium border transition-all
                        ${selectedMoods.includes(tag.label)
                          ? tag.color
                          : "bg-muted/30 text-muted-foreground border-transparent hover:bg-muted/50"}
                      `}
                    >
                      {tag.label}
                    </button>
                  ))}
                </div>

                {/* Save Action */}
                <div className="pt-4 flex justify-end">
                  <Button
                    onClick={handleSave}
                    disabled={!entry.trim() || isSaved}
                    className="w-full sm:w-auto min-w-[150px]"
                    size="lg"
                    variant={isSaved ? 'outline' : 'default'}
                  >
                    {isSaved ? (
                      <span className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                        Saved
                      </span>
                    ) : 'Save Entry'}
                  </Button>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="history"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center py-20"
            >
              <div className="w-20 h-20 bg-muted/30 rounded-full flex items-center justify-center mx-auto mb-6">
                <FolderHeart className="w-10 h-10 text-muted-foreground/50" />
              </div>
              <h3 className="text-xl font-medium text-foreground mb-2">Your Journal History</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Once you start saving entries, they will appear here nicely organized by date.
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
