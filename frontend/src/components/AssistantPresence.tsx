/**
 * Assistant Presence Component
 *
 * Polls GET /assistant/status every 2 seconds.
 * Displays animated status indicator in the navbar.
 *
 * States:
 *   Idle     → gray circle
 *   Listening → pulsing blue
 *   Thinking  → slow fade
 *   Speaking  → waveform bars
 */

import { useState, useEffect } from 'react';
import { api } from '../api';

type AssistantState = 'idle' | 'listening' | 'thinking' | 'speaking';

export function AssistantPresence() {
    const [state, setState] = useState<AssistantState>('idle');

    useEffect(() => {
        let active = true;

        const poll = async () => {
            try {
                const result = await api.assistant.status();
                if (active) setState(result.state);
            } catch {
                if (active) setState('idle');
            }
        };

        poll();
        const interval = setInterval(poll, 2000);

        return () => {
            active = false;
            clearInterval(interval);
        };
    }, []);

    return (
        <div className="flex items-center gap-2" title={`Echo is ${state}`}>
            {state === 'idle' && (
                <span className="relative flex h-3 w-3">
                    <span className="h-3 w-3 rounded-full bg-gray-400/60" />
                </span>
            )}

            {state === 'listening' && (
                <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500" />
                </span>
            )}

            {state === 'thinking' && (
                <span className="relative flex h-3 w-3">
                    <span
                        className="h-3 w-3 rounded-full bg-amber-400"
                        style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                    />
                </span>
            )}

            {state === 'speaking' && (
                <span className="flex items-end gap-[2px] h-3">
                    {[0, 1, 2, 3].map((i) => (
                        <span
                            key={i}
                            className="w-[3px] bg-green-400 rounded-full"
                            style={{
                                animation: 'waveform 0.6s ease-in-out infinite',
                                animationDelay: `${i * 0.1}s`,
                                height: '4px',
                            }}
                        />
                    ))}
                </span>
            )}

            <span className="text-xs text-muted-foreground/60 hidden sm:inline capitalize">
                {state}
            </span>

            <style>{`
        @keyframes waveform {
          0%, 100% { height: 4px; }
          50% { height: 12px; }
        }
      `}</style>
        </div>
    );
}
