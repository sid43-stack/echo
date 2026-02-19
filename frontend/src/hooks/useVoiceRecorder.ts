/**
 * useVoiceRecorder Hook
 * Reusable hook for voice recording using MediaRecorder API
 */

import { useState, useRef, useCallback } from 'react';

interface UseVoiceRecorderReturn {
    isRecording: boolean;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<Blob | null>;
    clearError: () => void;
}

export function useVoiceRecorder(): UseVoiceRecorderReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);

    const startRecording = useCallback(async () => {
        try {
            setError(null);

            // Request microphone permission
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create MediaRecorder
            const mediaRecorder = new MediaRecorder(stream, {
                mimeType: 'audio/webm',
            });

            // Reset chunks
            audioChunksRef.current = [];

            // Collect audio chunks
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current = mediaRecorder;
            mediaRecorder.start();
            setIsRecording(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Microphone access denied';
            setError(errorMessage);
            setIsRecording(false);
        }
    }, []);

    const stopRecording = useCallback(async (): Promise<Blob | null> => {
        if (!mediaRecorderRef.current || !isRecording) {
            return null;
        }

        return new Promise((resolve) => {
            const mediaRecorder = mediaRecorderRef.current!;

            mediaRecorder.onstop = () => {
                setIsRecording(false);

                // Create blob from chunks
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                // Stop all tracks
                mediaRecorder.stream.getTracks().forEach((track) => track.stop());

                resolve(audioBlob);
            };

            mediaRecorder.stop();
        });
    }, [isRecording]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isRecording,
        error,
        startRecording,
        stopRecording,
        clearError,
    };
}
