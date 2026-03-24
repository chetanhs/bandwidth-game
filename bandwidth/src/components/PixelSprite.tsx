interface Props {
  matrix: string[][];
  pixelSize: number;
  label?: string;
}

export function PixelSprite({ matrix, pixelSize, label }: Props) {
  const rows = matrix.length;
  const cols = matrix[0]?.length ?? 0;

  return (
    <div
      role="img"
      aria-label={label}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${cols}, ${pixelSize}px)`,
        gridTemplateRows: `repeat(${rows}, ${pixelSize}px)`,
        imageRendering: 'pixelated',
        gap: 0,
      }}
    >
      {matrix.map((row, ri) =>
        row.map((color, ci) => (
          <div
            key={`${ri}-${ci}`}
            style={{
              width: pixelSize,
              height: pixelSize,
              backgroundColor: color || 'transparent',
            }}
          />
        ))
      )}
    </div>
  );
}
