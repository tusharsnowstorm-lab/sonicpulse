import Svg, { Rect } from 'react-native-svg';

// Decorative QR pattern for scaffolding the Tickets screen — includes real
// finder-pattern corners so it reads as a QR code at a glance. Phase 05 of
// the build guide swaps this for a real code encoding /verify/<reference_code>,
// generated the same way the website's TicketCard already does.
const MATRIX = [
  '111111100111001111111',
  '100000100011101000001',
  '101110101011001011101',
  '101110100100101011101',
  '101110100011001011101',
  '100000101110001000001',
  '111111101010101111111',
  '000000000000100000000',
  '000000111111110111100',
  '010110000000111110010',
  '101110110011001110011',
  '100001000010111001010',
  '010010100011100011001',
  '000000000100100101100',
  '111111101100101110111',
  '100000100100110110000',
  '101110100111100001110',
  '101110101111110100100',
  '101110100001011110101',
  '100000101000011000010',
  '111111100010110011010',
];

const CELL = 4;
const PAD = 4;
const SIZE = MATRIX.length * CELL + PAD * 2;

export function QrPlaceholder({ size = 84 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${SIZE} ${SIZE}`}>
      <Rect x={0} y={0} width={SIZE} height={SIZE} fill="#F0F0F8" />
      {MATRIX.flatMap((row, r) =>
        [...row].map((cell, c) =>
          cell === '1' ? (
            <Rect key={`${r}-${c}`} x={PAD + c * CELL} y={PAD + r * CELL} width={CELL} height={CELL} fill="#050508" />
          ) : null
        )
      )}
    </Svg>
  );
}
