import { useEffect, useState, useCallback } from 'react';

// ─── Chess Engine ────────────────────────────────────────────────────────────

type PieceType = 'K' | 'Q' | 'R' | 'B' | 'N' | 'P';
type Color = 'white' | 'black';
interface Piece { type: PieceType; color: Color; }
type Square = Piece | null;
type Board = Square[][];
type Pos = [number, number]; // [row, col]; row 0 = rank 8 (black back rank)

function getInitialBoard(): Board {
  const B = (t: PieceType): Piece => ({ type: t, color: 'black' });
  const W = (t: PieceType): Piece => ({ type: t, color: 'white' });
  const _ = null;
  return [
    [B('R'), B('N'), B('B'), B('Q'), B('K'), B('B'), B('N'), B('R')],
    [B('P'), B('P'), B('P'), B('P'), B('P'), B('P'), B('P'), B('P')],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [_, _, _, _, _, _, _, _],
    [W('P'), W('P'), W('P'), W('P'), W('P'), W('P'), W('P'), W('P')],
    [W('R'), W('N'), W('B'), W('Q'), W('K'), W('B'), W('N'), W('R')],
  ];
}

function inBounds(r: number, c: number): boolean {
  return r >= 0 && r < 8 && c >= 0 && c < 8;
}

function findKing(board: Board, color: Color): Pos {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p && p.type === 'K' && p.color === color) return [r, c];
    }
  }
  throw new Error(`King not found for ${color}`);
}

function getRawMoves(board: Board, [r, c]: Pos): Pos[] {
  const piece = board[r][c];
  if (!piece) return [];
  const { type, color } = piece;
  const opp = color === 'white' ? 'black' : 'white';
  const moves: Pos[] = [];

  const slide = (drs: number[], dcs: number[]) => {
    for (let i = 0; i < drs.length; i++) {
      let nr = r + drs[i], nc = c + dcs[i];
      while (inBounds(nr, nc)) {
        const sq = board[nr][nc];
        if (sq) {
          if (sq.color === opp) moves.push([nr, nc]);
          break;
        }
        moves.push([nr, nc]);
        nr += drs[i]; nc += dcs[i];
      }
    }
  };

  if (type === 'R') slide([-1, 1, 0, 0], [0, 0, -1, 1]);
  if (type === 'B') slide([-1, -1, 1, 1], [-1, 1, -1, 1]);
  if (type === 'Q') {
    slide([-1, 1, 0, 0], [0, 0, -1, 1]);
    slide([-1, -1, 1, 1], [-1, 1, -1, 1]);
  }
  if (type === 'K') {
    for (const dr of [-1, 0, 1]) for (const dc of [-1, 0, 1]) {
      if (dr === 0 && dc === 0) continue;
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
  }
  if (type === 'N') {
    for (const [dr, dc] of [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]] as Pos[]) {
      const nr = r + dr, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color !== color) moves.push([nr, nc]);
    }
  }
  if (type === 'P') {
    const dir = color === 'white' ? -1 : 1;
    const startRow = color === 'white' ? 6 : 1;
    if (inBounds(r + dir, c) && !board[r + dir][c]) {
      moves.push([r + dir, c]);
      if (r === startRow && !board[r + dir * 2][c]) moves.push([r + dir * 2, c]);
    }
    for (const dc of [-1, 1]) {
      const nr = r + dir, nc = c + dc;
      if (inBounds(nr, nc) && board[nr][nc]?.color === opp) moves.push([nr, nc]);
    }
  }
  return moves;
}

function applyMove(board: Board, from: Pos, to: Pos): Board {
  const newBoard: Board = board.map(row => [...row]);
  const piece = newBoard[from[0]][from[1]]!;
  newBoard[to[0]][to[1]] = piece;
  newBoard[from[0]][from[1]] = null;
  // Auto-queen pawns
  if (piece.type === 'P') {
    if (piece.color === 'white' && to[0] === 0) newBoard[to[0]][to[1]] = { type: 'Q', color: 'white' };
    if (piece.color === 'black' && to[0] === 7) newBoard[to[0]][to[1]] = { type: 'Q', color: 'black' };
  }
  return newBoard;
}

function isAttacked(board: Board, [r, c]: Pos, byColor: Color): boolean {
  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const p = board[row][col];
      if (!p || p.color !== byColor) continue;
      const raw = getRawMoves(board, [row, col]);
      if (raw.some(([mr, mc]) => mr === r && mc === c)) return true;
    }
  }
  return false;
}

function isInCheck(board: Board, color: Color): boolean {
  const kingPos = findKing(board, color);
  const opp = color === 'white' ? 'black' : 'white';
  return isAttacked(board, kingPos, opp);
}

function getLegalMoves(board: Board, from: Pos): Pos[] {
  const piece = board[from[0]][from[1]];
  if (!piece) return [];
  const raw = getRawMoves(board, from);
  return raw.filter(to => {
    const next = applyMove(board, from, to);
    return !isInCheck(next, piece.color);
  });
}

function getAllLegalMoves(board: Board, color: Color): { from: Pos; to: Pos }[] {
  const result: { from: Pos; to: Pos }[] = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]?.color !== color) continue;
      const moves = getLegalMoves(board, [r, c]);
      for (const to of moves) result.push({ from: [r, c], to });
    }
  }
  return result;
}

function isCheckmate(board: Board, color: Color): boolean {
  return isInCheck(board, color) && getAllLegalMoves(board, color).length === 0;
}

function isStalemate(board: Board, color: Color): boolean {
  return !isInCheck(board, color) && getAllLegalMoves(board, color).length === 0;
}

// ─── Piece rendering ────────────────────────────────────────────────────────

const PIECE_UNICODE: Record<Color, Record<PieceType, string>> = {
  white: { K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙' },
  black: { K: '♚', Q: '♛', R: '♜', B: '♝', N: '♞', P: '♟' },
};

// ─── React Component ─────────────────────────────────────────────────────────

type GamePhase = 'playing' | 'win' | 'lose' | 'draw';

interface Props {
  onComplete: (outcome: 'win' | 'lose' | 'draw') => void;
}

export function ManagerChess({ onComplete }: Props) {
  const [board, setBoard] = useState<Board>(() => getInitialBoard());
  const [turn, setTurn] = useState<Color>('white');
  const [selected, setSelected] = useState<Pos | null>(null);
  const [legalMoves, setLegalMoves] = useState<Pos[]>([]);
  const [lastMove, setLastMove] = useState<{ from: Pos; to: Pos } | null>(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [phase, setPhase] = useState<GamePhase>('playing');

  // Debug hook for Playwright E2E tests
  useEffect(() => {
    type DebugFn = (outcome: 'win' | 'lose' | 'draw') => void;
    (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__ =
      (outcome) => setPhase(outcome);
    return () => {
      delete (window as Window & { __DEBUG_RESOLVE_CHESS__?: DebugFn }).__DEBUG_RESOLVE_CHESS__;
    };
  }, []);

  // Timer — runs on player's turn only
  useEffect(() => {
    if (phase !== 'playing' || turn !== 'white') return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { setPhase('lose'); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase, turn]);

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  // Manager AI move
  const makeManagerMove = useCallback((currentBoard: Board) => {
    const moves = getAllLegalMoves(currentBoard, 'black');
    if (moves.length === 0) {
      setPhase(isInCheck(currentBoard, 'black') ? 'win' : 'draw');
      return;
    }
    const { from, to } = moves[Math.floor(Math.random() * moves.length)];
    const nextBoard = applyMove(currentBoard, from, to);
    setBoard(nextBoard);
    setLastMove({ from, to });
    if (isCheckmate(nextBoard, 'white')) { setPhase('lose'); return; }
    if (isStalemate(nextBoard, 'white')) { setPhase('draw'); return; }
    setTurn('white');
  }, []);

  const handleSquareClick = (r: number, c: number) => {
    if (phase !== 'playing' || turn !== 'white') return;
    const piece = board[r][c];

    if (selected) {
      const isLegal = legalMoves.some(([lr, lc]) => lr === r && lc === c);
      if (isLegal) {
        const nextBoard = applyMove(board, selected, [r, c]);
        setBoard(nextBoard);
        setLastMove({ from: selected, to: [r, c] });
        setSelected(null);
        setLegalMoves([]);
        if (isCheckmate(nextBoard, 'black')) { setPhase('win'); return; }
        if (isStalemate(nextBoard, 'black')) { setPhase('draw'); return; }
        setTurn('black');
        setTimeout(() => makeManagerMove(nextBoard), 500);
        return;
      }
      if (piece?.color === 'white') {
        const moves = getLegalMoves(board, [r, c]);
        setSelected([r, c]);
        setLegalMoves(moves);
        return;
      }
      setSelected(null);
      setLegalMoves([]);
      return;
    }

    if (piece?.color === 'white') {
      const moves = getLegalMoves(board, [r, c]);
      setSelected([r, c]);
      setLegalMoves(moves);
    }
  };

  const isSelectedSq = (r: number, c: number) => selected?.[0] === r && selected?.[1] === c;
  const isLegalTarget = (r: number, c: number) => legalMoves.some(([lr, lc]) => lr === r && lc === c);
  const isLastMoveSq = (r: number, c: number) =>
    (lastMove?.from[0] === r && lastMove?.from[1] === c) ||
    (lastMove?.to[0] === r && lastMove?.to[1] === c);

  const squareBg = (r: number, c: number) => {
    if (isSelectedSq(r, c)) return 'bg-blue-700';
    if (isLegalTarget(r, c)) return 'bg-blue-500/40';
    if (isLastMoveSq(r, c)) return 'bg-amber-600/30';
    return (r + c) % 2 === 0 ? 'bg-zinc-700' : 'bg-zinc-800';
  };

  return (
    <div className="flex flex-col items-center justify-center h-full gap-6 select-none px-4">
      {/* Victory overlay */}
      {phase === 'win' && (
        <div className="absolute inset-0 z-10 bg-green-950/95 flex flex-col items-center justify-center gap-6">
          <p className="font-retro text-green-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>— CHECKMATE —</p>
          <p className="font-mono text-green-200 text-lg font-bold">Manager sulks back to Jira.</p>
          <p className="font-mono text-green-400 text-sm">+25 Manager's Good Books</p>
          <button onClick={() => onComplete('win')} className="font-retro px-6 py-3 rounded border border-green-600 bg-green-900 text-green-200 hover:bg-green-800 transition-colors cursor-pointer" style={{ fontSize: '9px' }}>[ Return to Desk ]</button>
        </div>
      )}
      {/* Defeat overlay */}
      {phase === 'lose' && (
        <div className="absolute inset-0 z-10 bg-red-950/95 flex flex-col items-center justify-center gap-6">
          <p className="font-retro text-red-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>— {timeLeft === 0 ? 'TIME OUT' : 'CHECKMATE'} —</p>
          <p className="font-mono text-red-200 text-lg font-bold">Manager CC's your skip-level.</p>
          <p className="font-mono text-red-400 text-sm">−20 Manager's Good Books</p>
          <button onClick={() => onComplete('lose')} className="font-retro px-6 py-3 rounded border border-red-600 bg-red-900 text-red-200 hover:bg-red-800 transition-colors cursor-pointer" style={{ fontSize: '9px' }}>[ Return to Desk ]</button>
        </div>
      )}
      {/* Draw overlay */}
      {phase === 'draw' && (
        <div className="absolute inset-0 z-10 bg-zinc-900/95 flex flex-col items-center justify-center gap-6">
          <p className="font-retro text-zinc-400 uppercase tracking-widest" style={{ fontSize: '9px' }}>— STALEMATE —</p>
          <p className="font-mono text-zinc-200 text-lg font-bold">An uneasy truce.</p>
          <p className="font-mono text-zinc-400 text-sm">±0 Manager's Good Books</p>
          <button onClick={() => onComplete('draw')} className="font-retro px-6 py-3 rounded border border-zinc-600 bg-zinc-800 text-zinc-200 hover:bg-zinc-700 transition-colors cursor-pointer" style={{ fontSize: '9px' }}>[ Return to Desk ]</button>
        </div>
      )}

      {/* Timer */}
      <div className="flex items-center gap-4">
        <span className="font-retro text-zinc-500 uppercase tracking-widest" style={{ fontSize: '7px' }}>TIME</span>
        <span className={`font-mono text-2xl tabular-nums font-bold ${timeLeft < 60 ? 'text-red-400' : 'text-zinc-200'}`}>
          {formatTime(timeLeft)}
        </span>
        <span className="font-retro text-zinc-600 uppercase tracking-widest" style={{ fontSize: '7px' }}>
          {turn === 'white' ? '▶ YOUR TURN' : '⏳ MANAGER THINKING'}
        </span>
      </div>

      {/* Board */}
      <div className="relative border border-zinc-700">
        <div
          className="grid"
          style={{ gridTemplateColumns: 'repeat(8, 1fr)', width: 'min(400px, 90vw)', height: 'min(400px, 90vw)' }}
        >
          {Array.from({ length: 8 }, (_, r) =>
            Array.from({ length: 8 }, (_, c) => {
              const piece = board[r][c];
              return (
                <div
                  key={`${r}-${c}`}
                  className={`flex items-center justify-center cursor-pointer relative ${squareBg(r, c)}`}
                  onClick={() => handleSquareClick(r, c)}
                >
                  {isLegalTarget(r, c) && !piece && (
                    <div className="w-3 h-3 rounded-full bg-blue-400/60" />
                  )}
                  {piece && (
                    <span
                      className={`leading-none select-none ${piece.color === 'white' ? 'text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]' : 'text-zinc-900 drop-shadow-[0_1px_1px_rgba(255,255,255,0.2)]'}`}
                      style={{ fontSize: 'min(2.5rem, 10vw)' }}
                    >
                      {PIECE_UNICODE[piece.color][piece.type]}
                    </span>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Label */}
      <p className="font-mono text-zinc-700 text-xs">White (You) ↑ · Black (Manager) ↓</p>
    </div>
  );
}
