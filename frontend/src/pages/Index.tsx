import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { SoftEntry } from './onboarding/SoftEntry';
import { MinimalIdentity } from './onboarding/MinimalIdentity';
import { EmotionalBaseline, type MoodType } from './onboarding/EmotionalBaseline';
import { Dashboard } from './Dashboard';
import { Chat } from './Chat';
import { HealthSpace } from './HealthSpace';
import { Journal } from './Journal';
import { Insights } from './Insights';
import { Summary } from './Summary';
import { Community } from './Community';
import { GuidedBreathing } from './GuidedBreathing';
import { TalkModeSelector } from './TalkModeSelector';
import { VoiceChat } from './VoiceChat';

/**
 * Main App Controller
 * 
 * Manages the progressive onboarding and navigation flow:
 * Soft Entry → Minimal Identity → Emotional Baseline → Dashboard
 * Then: Chat / Health Space / Journal → Summary → (loop back)
 * 
 * State machine approach for clean screen transitions.
 * All screens animate in/out using Framer Motion.
 * 
 * User data stored in frontend state only.
 * In production: This would sync with backend.
 */

type Screen =
  | 'softEntry'
  | 'minimalIdentity'
  | 'emotionalBaseline'
  | 'dashboard'
  | 'talkModeSelect'
  | 'chat'
  | 'voiceChat'
  | 'health'
  | 'journal'
  | 'breathing'
  | 'insights'
  | 'summary'
  | 'community';

interface UserData {
  name: string;
  isStudent: boolean | null;
  currentMood: MoodType;
}

interface SessionData {
  startDrift: number;
  endDrift: number;
}

const Index = () => {
  // Current screen state
  const [currentScreen, setCurrentScreen] = useState<Screen>('softEntry');

  // Wellness check-in completion tracking
  // CALMNESS SAFEGUARD: Simple thank you message, no data or analysis
  const [showWellnessCompletion, setShowWellnessCompletion] = useState(false);
  const [cameFromWellnessCheckIn, setCameFromWellnessCheckIn] = useState(false);

  // User data from onboarding (stored in frontend only)
  const [userData, setUserData] = useState<UserData>({
    name: '',
    isStudent: null,
    currentMood: 'neutral',
  });

  // Session data for summary
  const [sessionData, setSessionData] = useState<SessionData>({
    startDrift: 40,
    endDrift: 40,
  });

  // Onboarding handlers
  const handleSoftEntryContinue = () => {
    setCurrentScreen('minimalIdentity');
  };

  const handleIdentityContinue = (name: string, isStudent: boolean | null) => {
    setUserData(prev => ({ ...prev, name, isStudent }));
    setCurrentScreen('emotionalBaseline');
  };

  const handleIdentitySkip = () => {
    setCurrentScreen('emotionalBaseline');
  };

  const handleMoodSelect = (mood: MoodType) => {
    setUserData(prev => ({ ...prev, currentMood: mood }));
    setCurrentScreen('dashboard');
  };

  // Dashboard action handlers
  const handleDashboardAction = (actionId: string, fromWellnessCheckIn = false) => {
    // Track if user came from wellness check-in
    if (fromWellnessCheckIn && actionId === 'breathing') {
      setCameFromWellnessCheckIn(true);
    }

    switch (actionId) {
      case 'chat':
        // Route to mode selector instead of directly to chat
        setCurrentScreen('talkModeSelect');
        break;
      case 'breathing':
        // Go to health space with breathing tab active
        setCurrentScreen('breathing');
        break;
      case 'health':
        setCurrentScreen('health');
        break;
      case 'journal':
        setCurrentScreen('journal');
        break;
      case 'insights':
        setCurrentScreen('insights');
        break;
      case 'community':
        setCurrentScreen('community');
        break;
    }
  };

  // Mode selection handler
  const handleModeSelect = (mode: 'text' | 'voice') => {
    if (mode === 'text') {
      setCurrentScreen('chat');
    } else {
      setCurrentScreen('voiceChat');
    }
  };

  // Navigation handlers
  const handleOpenHealthSpace = () => {
    setCurrentScreen('health');
  };

  const handleBackToDashboard = () => {
    // CALMNESS SAFEGUARD: Show simple thank you message if returning from wellness check-in
    if (cameFromWellnessCheckIn) {
      setShowWellnessCompletion(true);
      setCameFromWellnessCheckIn(false);

      // Auto-hide completion message after 5 seconds
      setTimeout(() => {
        setShowWellnessCompletion(false);
      }, 5000);
    }

    setCurrentScreen('dashboard');
  };

  const handleEndSession = (startDrift: number, endDrift: number) => {
    setSessionData({ startDrift, endDrift });
    setCurrentScreen('summary');
  };

  const handleStartNewSession = () => {
    // Reset to dashboard (user stays "logged in" for demo)
    setCurrentScreen('dashboard');
  };

  return (
    <div className="h-dvh w-full overflow-hidden bg-background flex flex-col">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentScreen}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 min-h-0 relative overflow-hidden"
        >
          {/* Onboarding Flow */}
          {currentScreen === 'softEntry' && (
            <SoftEntry onContinue={handleSoftEntryContinue} />
          )}

          {currentScreen === 'minimalIdentity' && (
            <MinimalIdentity
              onContinue={handleIdentityContinue}
              onSkip={handleIdentitySkip}
            />
          )}

          {currentScreen === 'emotionalBaseline' && (
            <EmotionalBaseline onSelectMood={handleMoodSelect} />
          )}

          {/* Main App */}
          {currentScreen === 'dashboard' && (
            <Dashboard
              userName={userData.name}
              currentMood={userData.currentMood}
              onSelectAction={handleDashboardAction}
              showWellnessCompletion={showWellnessCompletion}
            />
          )}

          {currentScreen === 'talkModeSelect' && (
            <TalkModeSelector
              onSelectMode={handleModeSelect}
              onBack={handleBackToDashboard}
            />
          )}

          {currentScreen === 'voiceChat' && (
            <VoiceChat
              onBack={handleBackToDashboard}
              onEndSession={() => handleEndSession(0, 0)}
            />
          )}

          {currentScreen === 'chat' && (
            <Chat
              userName={userData.name}
              initialMood={userData.currentMood}
              onOpenHealthSpace={handleOpenHealthSpace}
              onEndSession={handleEndSession}
              onBack={handleBackToDashboard}
            />
          )}

          {currentScreen === 'health' && (
            <HealthSpace
              onBack={handleBackToDashboard}
            />
          )}

          {currentScreen === 'breathing' && (
            <GuidedBreathing onBack={handleBackToDashboard} />
          )}

          {currentScreen === 'journal' && (
            <Journal onBack={handleBackToDashboard} />
          )}

          {currentScreen === 'insights' && (
            <Insights
              onBack={handleBackToDashboard}
              onNavigate={handleDashboardAction}
            />
          )}

          {currentScreen === 'community' && (
            <Community onBack={handleBackToDashboard} />
          )}

          {currentScreen === 'summary' && (
            <Summary
              startDrift={sessionData.startDrift}
              endDrift={sessionData.endDrift}
              onStartNewSession={handleStartNewSession}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default Index;
