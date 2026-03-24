import { useEffect, useRef, useState } from 'react';
import { PixelSprite } from './PixelSprite';
import { getManagerSprite } from '../data/SpriteLibrary';

interface Props {
  playerMGB: number;
  onStartChess: () => void;
}

const FEEDBACK_TEXTS = [
  "Your recent output has been... concerning. The team has noticed. Leadership has noticed. I've noticed.",
  "I've been looking at your contributions this sprint. I want to be candid. This isn't the trajectory we discussed.",
  "I don't usually do these check-ins mid-sprint. But here we are. The numbers aren't telling a great story.",
];

export function ManagerOneOnOne({ playerMGB, onStartChess }: Props) {
  const managerSprite = getManagerSprite(playerMGB);
  // Stabilise the random pick so re-renders don't restart the typewriter
  const fullTextRef = useRef(FEEDBACK_TEXTS[Math.floor(Math.random() * FEEDBACK_TEXTS.length)]);
  const fullText = fullTextRef.current;

  const [displayedText, setDisplayedText] = useState('');
  const [textDone, setTextDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i++;
      setDisplayedText(fullText.slice(0, i));
      if (i >= fullText.length) {
        clearInterval(id);
        setTextDone(true);
      }
    }, 30);
    return () => clearInterval(id);
  }, [fullText]);

  return (
    <div className="fixed inset-0 z-[80] bg-zinc-950 flex flex-col overflow-hidden">
      {/* Header strip */}
      <div className="flex-shrink-0 px-6 py-3 border-b border-zinc-800 flex items-center gap-3">
        <span className="text-amber-400 text-xs font-mono uppercase tracking-widest">
          ⚠ MANAGER CHECK-IN
        </span>
        <span className="text-zinc-600 text-xs font-mono">— Sprint timer paused</span>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-8 max-w-lg mx-auto w-full">
        {/* Manager sprite */}
        <PixelSprite matrix={managerSprite.matrix} pixelSize={8} label="Manager" />

        {/* Typewriter text */}
        <div className="w-full">
          <p className="font-mono text-zinc-300 text-sm leading-relaxed min-h-[4rem]">
            "{displayedText}
            {!textDone && <span className="animate-pulse text-amber-400">▍</span>}"
          </p>
        </div>

        {/* Stakes panel — slides in after text done */}
        {textDone && (
          <div className="w-full border border-zinc-700 rounded bg-zinc-900 p-4 animate-fade-in-up">
            <p className="font-retro text-zinc-500 uppercase tracking-widest mb-3" style={{ fontSize: '7px' }}>
              STAKES
            </p>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3">
                <span className="font-retro text-green-400" style={{ fontSize: '8px' }}>WIN</span>
                <span className="font-mono text-zinc-300 text-xs">+25 MGB · Manager respects you</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-retro text-red-400" style={{ fontSize: '8px' }}>LOSE / TIME OUT</span>
                <span className="font-mono text-zinc-300 text-xs">−20 MGB · Manager thinks you're dumb</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-retro text-zinc-500" style={{ fontSize: '8px' }}>DRAW</span>
                <span className="font-mono text-zinc-300 text-xs">±0 MGB · An uneasy truce</span>
              </div>
            </div>
          </div>
        )}

        {/* Chess challenge button */}
        <button
          onClick={onStartChess}
          disabled={!textDone}
          className={[
            'w-full font-retro px-6 py-3 rounded border transition-colors',
            textDone
              ? 'border-amber-600 bg-amber-950 text-amber-200 hover:bg-amber-900 hover:border-amber-500 cursor-pointer'
              : 'border-zinc-800 bg-zinc-900 text-zinc-600 cursor-not-allowed',
          ].join(' ')}
          style={{ fontSize: '9px' }}
        >
          ♟ Challenge Manager's Intelligence
        </button>
      </div>
    </div>
  );
}
