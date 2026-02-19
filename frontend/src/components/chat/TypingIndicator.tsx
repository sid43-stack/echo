import { motion } from 'framer-motion';

/**
 * TypingIndicator Component
 * 
 * Shows an animated typing indicator when the AI is "thinking".
 * In production, this would be triggered by actual API response timing.
 * Here it's used with a simulated delay for demo purposes.
 */

export function TypingIndicator() {
  const dotVariants = {
    initial: { opacity: 0.4, y: 0 },
    animate: { opacity: 1, y: -4 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex justify-start mb-4"
    >
      <div className="message-ai px-5 py-4 mr-8">
        <div className="flex items-center gap-1.5">
          {[0, 1, 2].map((index) => (
            <motion.span
              key={index}
              variants={dotVariants}
              initial="initial"
              animate="animate"
              transition={{
                duration: 0.5,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: index * 0.15,
              }}
              className="w-2 h-2 rounded-full bg-primary/70"
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
