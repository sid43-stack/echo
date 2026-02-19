import { motion } from 'framer-motion';
import React, { forwardRef } from 'react';

interface ChatMessageProps {
  content: string;
  isUser: boolean;
  timestamp?: string;
}

export const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ content, isUser, timestamp }, ref) => {
    return (
      <motion.div
        ref={ref}   // ✅ critical fix
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}
      >
        <div
          className={`
            max-w-[80%] px-4 py-3 
            ${isUser 
              ? 'message-user ml-8' 
              : 'message-ai mr-8'
            }
          `}
        >
          <p className="text-sm sm:text-base leading-relaxed font-medium">
            {content}
          </p>

          {timestamp && (
            <span className="text-xs text-muted-foreground mt-1 block opacity-60">
              {timestamp}
            </span>
          )}
        </div>
      </motion.div>
    );
  }
);

ChatMessage.displayName = 'ChatMessage';
