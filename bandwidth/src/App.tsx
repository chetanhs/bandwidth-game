import { useState } from 'react';
import { useGameStore } from './store';
import { StartScreen } from './components/StartScreen';
import { OfferLetterScreen } from './components/OfferLetterScreen';
import { Dashboard } from './components/Dashboard';
import { PerformanceReview } from './components/PerformanceReview';
import { WinScreen, GameOverScreen } from './components/EndScreen';
import { JobBoard } from './components/JobBoard';
import { AlumniNetworkScreen } from './components/AlumniNetworkScreen';
import { ArcadeMode } from './components/ArcadeMode';

function App() {
  const { screen, stats, level, advanceFromReview, resetGame, playerName } = useGameStore();
  const tasksCompletedThisLevel = useGameStore(s => s.tasksCompletedThisLevel);
  const totalTaskCostThisLevel = useGameStore(s => s.totalTaskCostThisLevel);
  const [showArcade, setShowArcade] = useState(false);

  if (showArcade) {
    return <ArcadeMode onExit={() => setShowArcade(false)} />;
  }

  switch (screen) {
    case 'start':
      return <StartScreen onOpenArcade={() => setShowArcade(true)} />;

    case 'offer-letter':
      return <OfferLetterScreen />;

    case 'dashboard':
      return <Dashboard />;

    case 'performance-review':
      return (
        <PerformanceReview
          stats={stats}
          level={level}
          onResult={advanceFromReview}
          tasksCompletedThisLevel={tasksCompletedThisLevel}
          totalTaskCostThisLevel={totalTaskCostThisLevel}
        />
      );

    case 'job-board':
      return <JobBoard />;

    case 'alumni-network':
      return <AlumniNetworkScreen />;

    case 'win':
      return <WinScreen playerName={playerName} onReset={resetGame} />;

    case 'game-over':
      return <GameOverScreen playerName={playerName} onReset={resetGame} />;

    default:
      return <StartScreen onOpenArcade={() => setShowArcade(true)} />;
  }
}

export default App;
