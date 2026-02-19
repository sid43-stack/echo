import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Sparkles, Heart, ArrowLeft, Mic } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChatMessage } from '@/components/chat/ChatMessage';
import { TypingIndicator } from '@/components/chat/TypingIndicator';
import { EmotionalInsight } from '@/components/chat/EmotionalInsight';
import { CommunitySidePanel } from '@/components/CommunitySidePanel';
import { initialAIMessage, type MockAIResponse } from '@/data/mockResponses';
import { api, ApiError, ApiTimeoutError, ApiNetworkError } from '@/api/client';
import type { ApiChatMessage } from '@/api/types';
import { useToast } from '@/hooks/use-toast';
import type { MoodType } from './onboarding/EmotionalBaseline';

/** Map backend chat message to UI Message */
function apiMessageToMessage(apiMsg: ApiChatMessage): Message {
  const date = apiMsg.createdAt ? new Date(apiMsg.createdAt) : new Date();
  return {
    id: apiMsg.id,
    content: apiMsg.message,
    isUser: apiMsg.role === 'user',
    timestamp: date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

/** Default insight when backend does not provide emotion/drift/suggestion */
function defaultInsightFromReply(reply: string): MockAIResponse {
  return {
    reply,
    emotion: 'calm',
    driftScore: 50,
    suggestion: null,
  };
}

/** Build initial greeting (used when no history or before history loads) */
function getInitialGreeting(userName?: string, initialMood?: MoodType): Message {
  let greetingText = initialAIMessage.reply;
  if (userName) greetingText = `Hi ${userName}. ` + greetingText;
  if (initialMood === 'lonely') {
    greetingText = userName
      ? `Hi ${userName}. I'm glad you reached out. Nights can feel long when you're feeling alone.`
      : "I'm glad you reached out. Nights can feel long when you're feeling alone.";
  } else if (initialMood === 'anxious') {
    greetingText = userName
      ? `Hi ${userName}. It's okay to feel anxious. Let's take this moment together.`
      : "It's okay to feel anxious. Let's take this moment together.";
  } else if (initialMood === 'overwhelmed') {
    greetingText = userName
      ? `Hi ${userName}. I hear you. When everything feels like too much, even small steps matter.`
      : "I hear you. When everything feels like too much, even small steps matter.";
  }
  return {
    id: 'initial',
    content: greetingText,
    isUser: false,
    timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
  };
}

/**
 * Chat Page
 *
 * Connected to backend: POST /chat/send, GET /chat/history.
 * Loading and errors handled via API client; empty/slow responses handled gracefully.
 */

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
}

interface ChatProps {
  userName?: string;
  initialMood?: MoodType;
  onOpenHealthSpace: () => void;
  onEndSession: (startDrift: number, endDrift: number) => void;
  onBack: () => void;
}

export function Chat({ userName, initialMood, onOpenHealthSpace, onEndSession, onBack }: ChatProps) {
  const { toast } = useToast();
  // State for messages (initial greeting so UI never empty before history loads)
  const [messages, setMessages] = useState<Message[]>(() => [getInitialGreeting(userName, initialMood)]);
  const [inputValue, setInputValue] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // State for emotional insights (backend returns reply only; we use defaults for emotion/drift/suggestion)
  const [currentInsight, setCurrentInsight] = useState<MockAIResponse>(initialAIMessage);
  const [initialDrift] = useState(initialAIMessage.driftScore);

  // State for Community nudge (ethical AI)
  const [exchangeCount, setExchangeCount] = useState(0);
  const [hasShownCommunityNudge, setHasShownCommunityNudge] = useState(false);
  const [showCommunitySidePanel, setShowCommunitySidePanel] = useState(false);

  // Voice STT typing state
  const [isTranscribing, setIsTranscribing] = useState(false);

  // Ref for auto-scrolling
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load chat history from backend; if empty or error, show personalized greeting
  useEffect(() => {
    let cancelled = false;
    api.chat
      .history(20)
      .then((historyMessages) => {
        if (cancelled) return;
        setHistoryLoaded(true);
        if (Array.isArray(historyMessages) && historyMessages.length > 0) {
          const uiMessages = historyMessages.map(apiMessageToMessage);
          setMessages(uiMessages);
          const lastAssistant = [...historyMessages].reverse().find((m) => m.role === 'assistant');
          if (lastAssistant) {
            setCurrentInsight(defaultInsightFromReply(lastAssistant.message));
          }
        } else {
          setMessages([getInitialGreeting(userName, initialMood)]);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setHistoryLoaded(true);
        setMessages([getInitialGreeting(userName, initialMood)]);
      });
    return () => {
      cancelled = true;
    };
  }, [userName, initialMood]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAITyping]);

  // Handle sending a message (backend: POST /chat/send)
  const handleSendMessage = async () => {
    if (!inputValue.trim() || isAITyping) return;

    const text = inputValue.trim();
    setInputValue('');
    setIsAITyping(true);

    try {
      const { userMessage: apiUser, assistantMessage: apiAssistant } = await api.chat.send(text);
      const newExchangeCount = exchangeCount + 1;
      setExchangeCount(newExchangeCount);

      const userMsg = apiMessageToMessage(apiUser);
      let assistantContent = apiAssistant.message;
      let nudgeShown = hasShownCommunityNudge;
      if (newExchangeCount === 5 && !hasShownCommunityNudge) {
        assistantContent =
          "I hear you. You know, sometimes it helps to spend time with someone in person. There's a small group activity nearby if you'd like to see it — no pressure at all.";
        nudgeShown = true;
        setHasShownCommunityNudge(true);
      }

      const assistantMsg: Message = {
        id: apiAssistant.id,
        content: assistantContent,
        isUser: false,
        timestamp: apiAssistant.createdAt
          ? new Date(apiAssistant.createdAt).toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          })
          : new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, userMsg, assistantMsg]);
      setCurrentInsight(defaultInsightFromReply(assistantContent));
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : err instanceof ApiTimeoutError
            ? 'Request took too long. Please try again.'
            : err instanceof ApiNetworkError
              ? 'Connection issue. Please check your network.'
              : 'Something went wrong. Please try again.';
      toast({
        title: 'Couldn’t send message',
        description: message,
        variant: 'destructive',
      });
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          content: text,
          isUser: true,
          timestamp: new Date().toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
        },
      ]);
    } finally {
      setIsAITyping(false);
    }
  };

  // Handle Enter key
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Handle voice recording toggle (STT typing mode)
  const handleVoiceToggle = async () => {
    if (isTranscribing) return; // Ignore clicks while processing

    setIsTranscribing(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/voice/start-typing', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Speech capture failed');
      }

      const data = await response.json() as { text: string };

      // Fill chat input with transcribed text
      setInputValue(data.text);

      // Focus input for user to review/edit
      inputRef.current?.focus();
    } catch (err) {
      toast({
        title: 'Voice error',
        description: 'Failed to capture speech',
        variant: 'destructive',
      });
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row bg-background">
      {/* Main chat area */}
      <div className="flex-1 flex flex-col max-w-3xl mx-auto w-full min-h-0">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 bg-background"
        >
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-semibold text-foreground">
                {userName ? `Chat with ${userName}` : 'Night Companion'}
              </h1>
              <p className="text-xs text-muted-foreground">Here with you</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="calm"
              size="sm"
              onClick={onOpenHealthSpace}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span className="hidden sm:inline">Health Space</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEndSession(initialDrift, currentInsight.driftScore)}
            >
              End Session
            </Button>
          </div>
        </motion.header>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto p-4 scrollbar-calm min-h-0">
          <AnimatePresence mode="popLayout">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                content={message.content}
                isUser={message.isUser}
                timestamp={message.timestamp}
              />
            ))}
          </AnimatePresence>

          {/* Typing indicator */}
          <AnimatePresence>
            {isAITyping && <TypingIndicator />}
          </AnimatePresence>

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 border-t border-border/50 shrink-0 bg-background"
        >
          <div className="flex gap-3 items-center">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isTranscribing ? "Listening..." : "Share what's on your mind..."}
              disabled={isAITyping || isTranscribing}
              className="flex-1 h-12 px-4 rounded-xl bg-secondary border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all disabled:opacity-50"
            />
            <Button
              variant={isTranscribing ? "secondary" : "outline"}
              size="icon"
              onClick={handleVoiceToggle}
              disabled={isAITyping || isTranscribing}
              className={`h-12 w-12 shrink-0 ${isTranscribing ? 'animate-pulse' : ''}`}
              title="Voice typing (click to speak)"
            >
              <Mic className="w-5 h-5" />
            </Button>
            <Button
              variant="default"
              size="icon"
              onClick={handleSendMessage}
              disabled={!inputValue.trim() || isAITyping || isTranscribing}
              className="h-12 w-12 shrink-0"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>

          {/* Suggestion based on AI insight */}
          <AnimatePresence>
            {currentInsight.suggestion && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3 flex items-center gap-2"
              >
                <span className="text-xs text-muted-foreground">
                  Would a {currentInsight.suggestion} exercise help?
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="text-primary text-xs p-0 h-auto"
                  onClick={onOpenHealthSpace}
                >
                  Try it →
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Community CTA (appears after nudge) */}
          <AnimatePresence>
            {hasShownCommunityNudge && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-3"
              >
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCommunitySidePanel(true)}
                  className="text-xs"
                >
                  View nearby activities
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Emotional insight panel (sidebar on large screens) */}
      <motion.aside
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
        className="hidden lg:block w-72 p-4 border-l border-border/50"
      >
        <EmotionalInsight
          emotion={currentInsight.emotion}
          driftScore={currentInsight.driftScore}
          suggestion={currentInsight.suggestion}
        />

        {/* Mobile insight preview - shown inline on small screens */}
      </motion.aside>

      {/* Mobile emotional insight - collapsible at bottom */}
      <div className="lg:hidden p-4 border-t border-border/50">
        <details className="group">
          <summary className="flex items-center gap-2 cursor-pointer text-sm text-muted-foreground list-none">
            <Sparkles className="w-4 h-4" />
            <span>View emotional insight</span>
            <span className="ml-auto text-xs opacity-60 group-open:hidden">Tap to expand</span>
          </summary>
          <div className="mt-4">
            <EmotionalInsight
              emotion={currentInsight.emotion}
              driftScore={currentInsight.driftScore}
              suggestion={currentInsight.suggestion}
            />
          </div>
        </details>
      </div>

      {/* Community Side Panel */}
      <CommunitySidePanel
        isOpen={showCommunitySidePanel}
        onClose={() => setShowCommunitySidePanel(false)}
      />
    </div>
  );
}
