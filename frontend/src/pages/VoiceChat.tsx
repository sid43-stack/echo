import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Mic } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSpeechRecognition } from '@/hooks/useSpeechRecognition';

type VoiceState = 'listening' | 'thinking' | 'speaking';

interface VoiceChatProps {
    onBack: () => void;
    onEndSession?: () => void;
}

export function VoiceChat({ onBack, onEndSession }: VoiceChatProps) {
    const { toast } = useToast();

    const [voiceState, setVoiceState] = useState<VoiceState>('listening');
    const [currentReply, setCurrentReply] = useState<string>('');

    const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const lastSpokenRef = useRef<string | null>(null);
    const isSpeakingRef = useRef(false);
    const isPollingRef = useRef(false);

    const { transcript, start, stop, isSupported } = useSpeechRecognition();
    const [activated, setActivated] = useState(false);
    const prevStateRef = useRef<VoiceState | null>(null);

    // preload voices (Chrome/Edge bug fix)
    useEffect(() => {
        const loadVoices = () => window.speechSynthesis.getVoices();
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
    }, []);

    // unsupported browser
    useEffect(() => {
        if (!isSupported) {
            toast({
                title: 'Speech Recognition Unavailable',
                description: 'Use Chrome or Edge.',
                variant: 'destructive',
            });
        }
    }, [isSupported, toast]);

    const activateVoice = async () => {
        if (!isSupported) return;
        await start();
        setActivated(true);
    };

    // turn taking
    useEffect(() => {
        if (!activated) return;

        const prev = prevStateRef.current;
        prevStateRef.current = voiceState;

        if (voiceState === 'listening' && prev !== 'listening' && !isSpeakingRef.current) {
            start();
        } else if (voiceState !== 'listening' && prev === 'listening') {
            stop();
        }
    }, [voiceState, activated]);

    // ---- POLLING ----
    useEffect(() => {

        const pollVoiceState = async () => {

            if (isSpeakingRef.current) return;
            if (isPollingRef.current) return;

            isPollingRef.current = true;

            try {
                const token = localStorage.getItem("token");
                if (!token) return;

                const response = await fetch('http://localhost:3000/voice/state', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!response.ok) return;

                const data = await response.json();

                if (data.state && data.state !== 'speaking') {
                    setVoiceState(data.state);
                }

                if (data.state === 'thinking') {
                    lastSpokenRef.current = null;
                }

                if (data.replyText && lastSpokenRef.current !== data.replyText) {

                    lastSpokenRef.current = data.replyText;
                    setCurrentReply(data.replyText);

                    isSpeakingRef.current = true;
                    stop();

                    window.speechSynthesis.cancel();

                    const utterance = new SpeechSynthesisUtterance(data.replyText);
                    utterance.lang = 'en-US';

                    utterance.onstart = () => {
                        setVoiceState('speaking');
                    };

                    utterance.onend = async () => {
                        try {
                            const token = localStorage.getItem("token");

                            await fetch('http://localhost:3000/voice/finish-speaking', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    Authorization: `Bearer ${token}`,
                                },
                            });

                        } catch {}

                        isSpeakingRef.current = false;
                        setVoiceState('listening');
                    };

                    utterance.onerror = () => {
                        isSpeakingRef.current = false;
                        setVoiceState('listening');
                    };

                    window.speechSynthesis.speak(utterance);
                }

            } finally {
                isPollingRef.current = false;
            }
        };

        pollingIntervalRef.current = setInterval(pollVoiceState, 1200);

        return () => {
            if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
            window.speechSynthesis.cancel();
        };

    }, []);

    const handleBack = () => {
        stop();
        window.speechSynthesis.cancel();
        onBack();
    };

    const handleEndSession = () => {
        stop();
        window.speechSynthesis.cancel();
        onEndSession?.();
    };

    const getStateText = () => {
        if (!activated) return 'Tap the mic to start';
        if (voiceState === 'listening') return 'Listening...';
        if (voiceState === 'thinking') return 'Echo is thinking...';
        return 'Echo is speaking...';
    };

    const getStateColor = () => {
        if (voiceState === 'listening') return 'text-accent';
        if (voiceState === 'thinking') return 'text-primary';
        return 'text-blue-500';
    };

    return (
        <div className="min-h-screen flex flex-col p-6 bg-background">
            <div className="flex items-center justify-between mb-8">

                <motion.button onClick={handleBack} className="p-2 rounded-full hover:bg-secondary/20">
                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                </motion.button>

                <div className="text-sm text-muted-foreground">Voice Assistant</div>

                {onEndSession && (
                    <button onClick={handleEndSession} className="px-4 py-2 text-sm text-muted-foreground">
                        End Session
                    </button>
                )}
            </div>

            <div className="flex-1 flex flex-col items-center justify-center space-y-12">

                <motion.div
                    onClick={activateVoice}
                    className={`relative w-32 h-32 rounded-full cursor-pointer flex items-center justify-center
                    ${voiceState === 'listening'
                        ? 'bg-accent/20 border-2 border-accent/40'
                        : voiceState === 'thinking'
                            ? 'bg-primary/20 border-2 border-primary/40'
                            : 'bg-blue-500/20 border-2 border-blue-500/40'}`}
                >
                    <Mic className={`w-12 h-12 ${getStateColor()}`} strokeWidth={1.5} />
                </motion.div>

                <p className={`text-lg font-medium ${getStateColor()}`}>
                    {getStateText()}
                </p>

                {transcript && activated && voiceState === 'listening' && (
                    <div className="text-sm text-muted-foreground italic">
                        {transcript}
                    </div>
                )}

                {currentReply && voiceState === 'speaking' && (
                    <div className="text-sm text-muted-foreground">
                        "{currentReply}"
                    </div>
                )}
            </div>
        </div>
    );
}
