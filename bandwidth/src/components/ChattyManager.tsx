import { useEffect, useState, useRef } from 'react';
import { PixelSprite } from './PixelSprite';
import { MANAGER_CHATTY_16 } from '../data/SpriteLibrary';

interface Props {
  message: string;
  onDismiss: () => void;
}

const TYPEWRITER_SPEED_MS = 28; // ms per character

export function ChattyManager({ message, onDismiss }: Props) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Typewriter tick
  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    intervalRef.current = setInterval(() => {
      i++;
      setDisplayed(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(intervalRef.current!);
        setDone(true);
      }
    }, TYPEWRITER_SPEED_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [message]);

  // Clicking during typewriter skips to full text
  const handleClick = () => {
    if (!done) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      setDisplayed(message);
      setDone(true);
    } else {
      onDismiss();
    }
  };

  return (
    // Backdrop — dim but doesn't block the board (only bottom portion)
    <div className="fixed inset-0 z-40 flex items-end justify-start pointer-events-none">
      {/* The dialogue box itself — bottom-left */}
      <div
        className="pointer-events-auto m-5 animate-slide-up"
        style={{ maxWidth: '380px', width: '100%' }}
      >
        <div
          className="relative border-2 border-zinc-600 bg-zinc-900 rounded-lg overflow-hidden"
          data-testid="chatty-manager-dialogue"
          style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.04)' }}
        >
          {/* Retro scanline stripe */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
            }}
          />

          {/* Header bar */}
          <div className="relative flex items-center gap-0 border-b border-zinc-700 bg-zinc-800">
            <div className="flex gap-1.5 px-3 py-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
              <span className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
            </div>
            <span
              className="flex-1 text-center font-retro text-zinc-500 pr-12 pb-0.5"
              style={{ fontSize: '7px' }}
            >
              alex_chen.exe
            </span>
          </div>

          {/* Body: portrait + text */}
          <div className="relative flex gap-4 px-4 pt-4 pb-3">
            {/* Pixel portrait */}
            <div className="flex-shrink-0 self-end mb-1">
              <PixelSprite
                matrix={MANAGER_CHATTY_16}
                pixelSize={4}
                label="Manager Alex Chen"
              />
            </div>

            {/* Speech area */}
            <div className="flex-1 min-w-0">
              {/* Nametag */}
              <p
                className="font-retro text-zinc-400 mb-2"
                style={{ fontSize: '7px' }}
              >
                Alex Chen · EM
              </p>

              {/* Typewriter text */}
              <div
                className="min-h-[52px] text-sm text-zinc-200 leading-relaxed font-mono"
              >
                {displayed}
                {/* Blinking cursor while typing */}
                {!done && (
                  <span
                    className="inline-block w-2 h-4 bg-zinc-400 ml-0.5 align-middle animate-pulse"
                    style={{ verticalAlign: 'text-bottom' }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Footer action */}
          <div className="relative flex justify-end px-4 pb-3">
            <button
              onClick={handleClick}
              className="font-retro text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer"
              style={{ fontSize: '7px' }}
            >
              {done ? '[ OK ]' : '[ skip ]'}
            </button>
          </div>
        </div>

        {/* Triangle speech pointer */}
        <div
          className="ml-10 w-0 h-0"
          style={{
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderTop: '8px solid #52525b',
          }}
        />
      </div>
    </div>
  );
}
