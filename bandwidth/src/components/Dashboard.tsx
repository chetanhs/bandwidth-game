import { useEffect, useState } from 'react';
import { useCycleTimer } from '../hooks/useCycleTimer';
import { useGameStore, HEADPHONE_BLOCKABLE } from '../store';
import { TopNav } from './TopNav';
import { StatsPanel } from './StatsPanel';
import { ActionItemBoard } from './ActionItemBoard';
import { ChaosModal } from './ChaosModal';
import { BurnoutCrashModal } from './BurnoutCrashModal';
import { TutorialOverlay } from './TutorialOverlay';
import { PerksShop } from './PerksShop';
import { CycleSummaryModal } from './CycleSummaryModal';
import { ChattyManager } from './ChattyManager';
import { ConsultModal } from './ConsultModal';
import { InventoryToolbar } from './InventoryToolbar';
import { OnboardingTour, ONBOARDING_STEPS } from './OnboardingTour';
import { AvoidTheManager } from './AvoidTheManager';
import { PmFistFight } from './PmFistFight';
import { ManagerDuel } from './ManagerDuel';
import { ManagerOneOnOne } from './ManagerOneOnOne';
import { ManagerChess } from './ManagerChess';

export function Dashboard() {
  const {
    playerName,
    company,
    level,
    cycleNumber,
    stats,
    actionItems,
    pendingChaos,
    pendingTutorial,
    burnoutCrash,
    shopOpen,
    toolBlockedMessage,
    cycleSummaryOpen,
    cycleSummary,
    chattyManagerMessage,
    consultModalOpen,
    activeTheme,
    unlockedThemes,
    activeAvatar,
    unlockedAvatars,
    pendingPerkDraft,
    directReports,
    dismissChattyManager,
    workOnTask,
    grindTask,
    dismissChaos,
    rushTask,
    escalateTask,
    completeReview,
    useReviewBuddy,
    endCycle,
    startNextCycle,
    resetGame,
    drinkCoffee,
    seniorConsult,
    closeConsultModal,
    freeConsult,
    premiumConsult,
    dismissCrash,
    dismissTutorial,
    openShop,
    closeShop,
    buyPerk,
    buyTool,
    clearToolBlocked,
    buyTheme,
    setTheme,
    buyAvatar,
    setAvatar,
    draftPerk,
    assignJunior,
    unassignJunior,
    juniorTick,
    clearBlocker,
    useHeadphones,
    activePerks,
    activeBuffs,
    activateHeadphones,
    useVacation,
    useOfflineUpdate,
    perkCooldowns,
    playPerk,
    hasSeenTutorial,
    completeTutorial,
    acceptUnplannedMeeting,
    skipUnplannedMeeting,
    resolveMiniGame,
    acceptClientCall,
    triggerFightPM,
    resolveFistFight,
    acceptUnscheduled1on1,
    triggerDuel,
    resolveDuel,
    mgbWarning1on1Active,
    resolveMgrOneOnOne,
  } = useGameStore();

  // Onboarding tour state
  const [tutorialStep, setTutorialStep] = useState(0);
  const showOnboarding = !hasSeenTutorial;

  // Mini-game phase state
  type MiniGamePhase = 'warning' | 'playing' | null;
  const [miniGamePhase, setMiniGamePhase] = useState<MiniGamePhase>(null);

  const handleSkipMeeting = () => {
    skipUnplannedMeeting();
    // 5s suspense delay before anything visible happens
    setTimeout(() => {
      setMiniGamePhase('warning');
      // 3s warning screen before the mini-game mounts
      setTimeout(() => {
        setMiniGamePhase('playing');
      }, 3000);
    }, 5000);
  };

  const handleReturnToDesk = (outcome: 'win' | 'lose') => {
    resolveMiniGame(outcome === 'win' ? 'survived' : 'caught');
    setMiniGamePhase(null);
  };

  // PM Fist Fight state
  const [fightActive, setFightActive] = useState(false);

  const handleFightPM = () => {
    triggerFightPM();
    setFightActive(true);
  };

  const handleFightReturn = (outcome: 'win' | 'lose') => {
    resolveFistFight(outcome === 'win' ? 'victory' : 'defeat');
    setFightActive(false);
  };

  // Manager Duel state
  const [duelActive, setDuelActive] = useState(false);

  // Chess duel state (MGB 1:1 interrupt)
  const [chessActive, setChessActive] = useState(false);

  const handleTriggerDuel = () => {
    triggerDuel();
    setDuelActive(true);
  };

  const handleDuelReturn = (outcome: 'win' | 'lose') => {
    resolveDuel(outcome);
    setDuelActive(false);
  };

  // Compute headphone state for ChaosModal
  const headphonesItem = stats.inventory.find((t) => t.type === 'noise-canceling-headphones');
  const headphoneCharges = headphonesItem?.charges ?? 0;
  const canBlockWithHeadphones = !!pendingChaos
    && !!headphonesItem
    && headphoneCharges > 0
    && HEADPHONE_BLOCKABLE.includes(pendingChaos.type);

  // Compute offline update state for ChaosModal
  const hasOfflineUpdate = stats.inventory.some((t) => t.type === 'offline-update');
  const OFFLINE_BLOCKABLE_EVENTS = ['pm-status-update', 'mandatory-meeting', 'standup'];
  const canBlockWithOfflineUpdate = !!pendingChaos
    && hasOfflineUpdate
    && OFFLINE_BLOCKABLE_EVENTS.includes(pendingChaos.type);

  // Compute playable perk for ChaosModal (Epic 3)
  const PERK_COUNTERS: Partial<Record<string, string>> = {
    'rubber-duck': 'pagerduty',
    'blame-shifter': 'scope-creep',
    '10x-dev': 're-org',
    'caffeine-addict': 'mandatory-meeting',
  };
  const PERK_DISPLAY: Partial<Record<string, string>> = {
    'rubber-duck': 'Rubber Duck',
    'blame-shifter': 'Blame Shifter',
    '10x-dev': '10x Dev',
    'caffeine-addict': 'Caffeine Addict',
  };
  const playablePerk = (() => {
    if (!pendingChaos) return undefined;
    for (const perkId of activePerks) {
      if (perkCooldowns.includes(perkId as never)) continue;
      if (PERK_COUNTERS[perkId] === pendingChaos.type) {
        return { perkId: perkId as never, label: PERK_DISPLAY[perkId] ?? perkId };
      }
    }
    return undefined;
  })();

  const burnoutForcedPTO = stats.burnout >= 80;

  // Cycle timer: pauses when any modal/overlay is active
  const timerActive =
    !pendingChaos && !pendingTutorial && !burnoutCrash && !cycleSummaryOpen && !shopOpen && !consultModalOpen && !showOnboarding && miniGamePhase === null && !fightActive && !duelActive && !mgbWarning1on1Active && !chessActive;
  const cycleTimeLeft = useCycleTimer(timerActive, cycleNumber, endCycle);

  // Auto-advance when all tasks are done and no modal is blocking
  const allDone = actionItems.length > 0 && actionItems.every((a) => a.status === 'done');
  useEffect(() => {
    if (!allDone || pendingChaos || pendingTutorial || burnoutCrash || cycleSummaryOpen) return;
    const timer = setTimeout(() => endCycle(), 1200);
    return () => clearTimeout(timer);
  }, [allDone, pendingChaos, pendingTutorial, burnoutCrash, cycleSummaryOpen, endCycle]);

  // Auto-dismiss tool-blocked toast after 4 seconds
  useEffect(() => {
    if (!toolBlockedMessage) return;
    const timer = setTimeout(() => clearToolBlocked(), 4000);
    return () => clearTimeout(timer);
  }, [toolBlockedMessage, clearToolBlocked]);

  // Spotlight helper: returns classes to "pop" an element above the tutorial overlay
  const spotlit = showOnboarding
    ? ONBOARDING_STEPS[tutorialStep].spotlight
    : 'none';
  const spotlitClass = 'relative z-[60] bg-zinc-900 rounded shadow-[0_0_15px_rgba(255,255,255,0.2)]';

  return (
    <div className="h-screen flex flex-col bg-zinc-900 overflow-hidden">
      {/* TopNav — step 0 spotlight */}
      <div className={spotlit === 'topnav' ? spotlitClass : undefined}>
        <TopNav
          playerName={playerName}
          company={company}
          level={level}
          cycleNumber={cycleNumber}
          levelXP={stats.levelXP}
          cycleTimeLeft={cycleTimeLeft}
          onEndCycle={endCycle}
          onReset={resetGame}
        />
      </div>

      {/* Burnout warning banner */}
      {burnoutForcedPTO && (
        <div className="flex-shrink-0 px-5 py-2 bg-red-950 border-b border-red-900 text-xs text-red-300 font-mono flex items-center gap-2">
          <span>⚠</span>
          <span>BURNOUT CRITICAL — Ending this cycle will trigger Mandatory PTO. You will lose a sprint.</span>
        </div>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* StatsPanel — step 2 spotlight */}
        <div className={spotlit === 'sidebar' ? spotlitClass : undefined}>
          <StatsPanel
            stats={stats}
            level={level}
            onOpenShop={openShop}
          />
        </div>
        {/* ActionItemBoard — step 1 spotlight */}
        <div className={`flex-1 overflow-hidden${spotlit === 'board' ? ` ${spotlitClass}` : ''}`}>
          <ActionItemBoard
            items={actionItems}
            stats={stats}
            level={level}
            directReports={directReports}
            onWork={workOnTask}
            onGrind={grindTask}
            onRush={rushTask}
            onEscalate={escalateTask}
            onCompleteReview={completeReview}
            onUseReviewBuddy={useReviewBuddy}
            onAssignJunior={assignJunior}
            onUnassignJunior={unassignJunior}
            onJuniorTick={juniorTick}
            onClearBlocker={clearBlocker}
          />
        </div>
      </div>

      {/* Chaos modal */}
      {pendingChaos && (
        <ChaosModal
          event={pendingChaos}
          onDismiss={dismissChaos}
          canBlockWithHeadphones={canBlockWithHeadphones}
          headphoneCharges={headphoneCharges}
          onUseHeadphones={useHeadphones}
          canBlockWithOfflineUpdate={canBlockWithOfflineUpdate}
          onUseOfflineUpdate={useOfflineUpdate}
          playablePerk={playablePerk}
          onPlayPerk={playablePerk ? () => playPerk(playablePerk.perkId) : undefined}
          onAcceptUnplannedMeeting={acceptUnplannedMeeting}
          onSkipUnplannedMeeting={handleSkipMeeting}
          onAcceptClientCall={acceptClientCall}
          onFightPM={handleFightPM}
          onAcceptUnscheduled1on1={acceptUnscheduled1on1}
          onTriggerDuel={handleTriggerDuel}
        />
      )}

      {/* Burnout crash modal */}
      {burnoutCrash && (
        <BurnoutCrashModal onDismiss={dismissCrash} />
      )}

      {/* Tutorial overlay */}
      {pendingTutorial && !burnoutCrash && (
        <TutorialOverlay tutorial={pendingTutorial} onDismiss={dismissTutorial} />
      )}

      {/* Perks shop */}
      {shopOpen && (
        <PerksShop
          stats={stats}
          unlockedThemes={unlockedThemes}
          activeTheme={activeTheme}
          unlockedAvatars={unlockedAvatars}
          activeAvatar={activeAvatar}
          onBuyPerk={buyPerk}
          onBuyTool={buyTool}
          onBuyTheme={buyTheme}
          onSetTheme={setTheme}
          onBuyAvatar={buyAvatar}
          onSetAvatar={setAvatar}
          onClose={closeShop}
        />
      )}

      {/* Cycle Summary interstitial */}
      {cycleSummaryOpen && cycleSummary && (
        <CycleSummaryModal
          summary={cycleSummary}
          currentTotalXP={stats.levelXP}
          pendingPerkDraft={pendingPerkDraft}
          onDraftPerk={draftPerk}
          onStartNextCycle={startNextCycle}
        />
      )}

      {/* Chatty Manager dialogue */}
      {chattyManagerMessage && (
        <ChattyManager message={chattyManagerMessage} onDismiss={dismissChattyManager} />
      )}

      {/* Consult Modal */}
      {consultModalOpen && (
        <ConsultModal
          onFree={freeConsult}
          onPremium={premiumConsult}
          onClose={closeConsultModal}
        />
      )}

      {/* Right-side Inventory Toolbar — step 3 spotlight */}
      <InventoryToolbar
        inventory={stats.inventory}
        activeBuffs={activeBuffs}
        onUseTool={(toolType) => {
          if (toolType === 'vacation') useVacation();
          else if (toolType === 'noise-canceling-headphones') activateHeadphones();
        }}
        onDrinkCoffee={drinkCoffee}
        onSeniorConsult={seniorConsult}
        activePerks={activePerks}
        perkCooldowns={perkCooldowns}
        pendingChaosType={pendingChaos?.type ?? null}
        onPlayPerk={playPerk}
        isSpotlit={spotlit === 'toolbar'}
      />

      {/* Mini-game overlay — warning phase */}
      {miniGamePhase === 'warning' && (
        <div className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col items-center justify-center gap-6">
          <div className="text-center max-w-md px-8">
            <p
              className="font-retro text-red-500 uppercase tracking-widest mb-6"
              style={{ fontSize: '8px' }}
            >
              — ALERT —
            </p>
            <p className="font-mono text-zinc-200 text-base leading-relaxed">
              Since you skipped the meeting, the manager is pissed and is now looking for you...
            </p>
          </div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="inline-block w-2 h-2 rounded-full bg-red-600"
                style={{ animation: `pulse 1s ease-in-out ${i * 0.3}s infinite` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Mini-game overlay — playing phase */}
      {miniGamePhase === 'playing' && (
        <div className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col overflow-hidden">
          {/* Header bar */}
          <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
            <span className="font-retro text-red-400 uppercase tracking-widest" style={{ fontSize: '8px' }}>
              MINI-GAME: AVOID THE MANAGER
            </span>
            <span className="font-mono text-zinc-700 text-xs">— Sprint timer paused</span>
          </div>
          {/* Game container */}
          <div className="flex-1 relative overflow-hidden">
            <AvoidTheManager onComplete={handleReturnToDesk} />
          </div>
        </div>
      )}

      {/* PM Fist Fight overlay */}
      {fightActive && (
        <div className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
            <span className="font-retro text-orange-400 uppercase tracking-widest" style={{ fontSize: '8px' }}>
              🥊 PM FIST FIGHT
            </span>
            <span className="font-mono text-zinc-700 text-xs">— Sprint timer paused</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <PmFistFight
              playerBurnout={stats.burnout}
              playerMGB={stats.managerGoodBooks}
              onComplete={handleFightReturn}
            />
          </div>
        </div>
      )}

      {/* Manager Duel overlay */}
      {duelActive && (
        <div className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
            <span className="font-retro text-purple-400 uppercase tracking-widest" style={{ fontSize: '8px' }}>
              🔫 1:1 SHOOTING DUEL
            </span>
            <span className="font-mono text-zinc-700 text-xs">— Sprint timer paused</span>
          </div>
          <div className="flex-1 relative overflow-hidden">
            <ManagerDuel onComplete={handleDuelReturn} />
          </div>
        </div>
      )}

      {/* MGB 1:1 interrupt overlay */}
      {mgbWarning1on1Active && !chessActive && (
        <ManagerOneOnOne
          playerMGB={stats.managerGoodBooks}
          onStartChess={() => setChessActive(true)}
        />
      )}

      {/* Chess duel overlay */}
      {chessActive && (
        <div className="fixed inset-0 z-[90] bg-zinc-950 flex flex-col overflow-hidden">
          <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 font-mono text-xs text-amber-400 uppercase tracking-widest">
            ♟ CHESS DUEL — Prove your intelligence
          </div>
          <div className="flex-1 relative overflow-hidden">
            <ManagerChess onComplete={(outcome) => {
              setChessActive(false);
              resolveMgrOneOnOne(outcome);
            }} />
          </div>
        </div>
      )}

      {/* Onboarding tour overlay */}
      {showOnboarding && (
        <OnboardingTour
          currentStep={tutorialStep}
          onNext={() => setTutorialStep((s) => s + 1)}
          onSkip={completeTutorial}
          onStart={completeTutorial}
        />
      )}

      {/* Tool-blocked toast */}
      {toolBlockedMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-zinc-800 border border-zinc-600 rounded-lg px-4 py-3 text-sm font-mono text-zinc-200 shadow-xl flex items-center gap-2">
          <span>{toolBlockedMessage}</span>
          <button
            onClick={clearToolBlocked}
            className="text-zinc-500 hover:text-zinc-300 ml-1 transition-colors cursor-pointer"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
