/**
 * useSpeechRecognition Hook
 * Wraps the Web Speech API for continuous browser-based speech recognition.
 *
 * - Sends only final transcripts to POST /voice/input
 * - Exposes start/stop for external turn-taking control
 * - Auto-restarts on unexpected end unless manually stopped
 */

import { getApiBaseUrl } from '../api/config';
import { useState, useRef, useCallback, useEffect } from 'react';

// ---- Web Speech API types (not in lib.dom by default) ----
interface SpeechRecognitionEvent extends Event {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message?: string;
}

interface SpeechRecognitionInstance extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: ((ev: SpeechRecognitionEvent) => void) | null;
    onerror: ((ev: SpeechRecognitionErrorEvent) => void) | null;
    onend: (() => void) | null;
    onstart: (() => void) | null;
}

type SpeechRecognitionCtor = new () => SpeechRecognitionInstance;

function getSpeechRecognitionCtor(): SpeechRecognitionCtor | null {
    const w = window as unknown as Record<string, unknown>;
    return (w.SpeechRecognition ?? w.webkitSpeechRecognition) as SpeechRecognitionCtor | null;
}

// -----------------------------------------------------------

const API_URL = getApiBaseUrl();


export interface UseSpeechRecognitionReturn {
    /** Whether the recogniser is currently running */
    isListening: boolean;
    /** Current interim transcript (for UI display) */
    transcript: string;
    /** Start listening */
    start: () => void;
    /** Stop listening (manual) */
    stop: () => void;
    /** Whether the browser supports the Web Speech API */
    isSupported: boolean;
}

export function useSpeechRecognition(): UseSpeechRecognitionReturn {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');

    const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
    /** When false, onend should NOT auto-restart */
    const activeRef = useRef(false);
    const lastFinalRef = useRef<string | null>(null);

    const Ctor = getSpeechRecognitionCtor();
    const isSupported = Ctor !== null;

    // ---- Send final transcript to backend ----
    const sendTranscript = useCallback(async (text: string) => {
        if (!text.trim()) return;
        try {
            const token = localStorage.getItem('token');
            await fetch(`${API_URL}/voice/input`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ text }),
            });
        } catch (err) {
            console.error('Failed to send transcript:', err);
        }
    }, []);

    // ---- Build recognition instance once ----
    useEffect(() => {
        if (!Ctor) return;

        const recognition = new Ctor();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US';

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            let interim = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];

                if (result.isFinal) {
                    const finalText = result[0].transcript.trim();

                    // ⭐ CRITICAL FIX: prevent duplicate sends
                    if (finalText && finalText !== lastFinalRef.current) {
                        lastFinalRef.current = finalText;
                        sendTranscript(finalText);
                        setTranscript('');
                    }

                } else {
                    interim += result[0].transcript;
                }
            }

            if (interim) setTranscript(interim);
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            // 'aborted' fires when we call stop() — not a real error
            if (event.error === 'aborted') return;
            console.error('SpeechRecognition error:', event.error);
        };

        recognition.onend = () => {
            setIsListening(false);
            // Auto-restart only if still active (user didn't navigate away)
            if (activeRef.current) {
                try {
                    recognition.start();
                } catch {
                    // already started — ignore
                }
            }
        };

        recognition.onstart = () => {
            setIsListening(true);
        };

        recognitionRef.current = recognition;

        return () => {
            activeRef.current = false;
            try { recognition.abort(); } catch { /* noop */ }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ---- Public controls ----
    const start = useCallback(() => {
        if (!recognitionRef.current) return;
        activeRef.current = true;
        lastFinalRef.current = null;
        try {
            recognitionRef.current.start();
        } catch {
            // already running — ignore
        }
    }, []);

    const stop = useCallback(() => {
        if (!recognitionRef.current) return;
        activeRef.current = false;
        setTranscript('');
        try {
            recognitionRef.current.stop();
        } catch {
            // already stopped — ignore
        }
    }, []);

    return { isListening, transcript, start, stop, isSupported };
}
