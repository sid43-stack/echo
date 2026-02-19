/**
 * useVoiceAssistant Hook
 * Handles voice recording, processing, and playback for voice chat functionality
 */

import { useState, useRef, useCallback } from 'react';
import axios from 'axios';

interface VoiceResponse {
    userText: string;
    assistantText: string;
    audioUrl: string | null;
}

interface UseVoiceAssistantReturn {
    isRecording: boolean;
    isProcessing: boolean;
    error: string | null;
    startRecording: () => Promise<void>;
    stopRecording: () => Promise<VoiceResponse | null>;
    clearError: () => void;
}

const API_URL = 'http://localhost:3000';

export function useVoiceAssistant(): UseVoiceAssistantReturn {
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
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

    const stopRecording = useCallback(async (): Promise<VoiceResponse | null> => {
        if (!mediaRecorderRef.current || !isRecording) {
            return null;
        }

        return new Promise((resolve) => {
            const mediaRecorder = mediaRecorderRef.current!;

            mediaRecorder.onstop = async () => {
                setIsRecording(false);
                setIsProcessing(true);

                // Create blob from chunks
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });

                // Stop all tracks
                mediaRecorder.stream.getTracks().forEach((track) => track.stop());

                try {
                    // Send to backend
                    const formData = new FormData();
                    formData.append('audio', audioBlob, 'recording.webm');

                    const token = localStorage.getItem('token');
                    const response = await axios.post<VoiceResponse>(
                        `${API_URL}/voice/process`,
                        formData,
                        {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'multipart/form-data',
                            },
                        }
                    );

                    setIsProcessing(false);
                    resolve(response.data);
                } catch (err) {
                    setIsProcessing(false);
                    if (axios.isAxiosError(err)) {
                        const errorMsg = err.response?.data?.error || 'Failed to process voice message';
                        setError(errorMsg);
                    } else {
                        setError('Failed to process voice message');
                    }
                    resolve(null);
                }
            };

            mediaRecorder.stop();
        });
    }, [isRecording]);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        isRecording,
        isProcessing,
        error,
        startRecording,
        stopRecording,
        clearError,
    };
}
