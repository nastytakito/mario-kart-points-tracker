const PIECES = Array.from({ length: 18 }, (_, i) => ({
  left: (i * 37) % 100,
  delay: (i % 6) * 0.15,
  duration: 1.8 + (i % 5) * 0.3,
  color: [
    "var(--brand-red)",
    "var(--brand-blue)",
    "var(--brand-yellow)",
    "var(--brand-green)",
    "var(--brand-purple)",
    "var(--brand-orange)",
  ][i % 6],
  rotate: (i * 53) % 360,
}));

export function Confetti() {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-0 overflow-visible" aria-hidden>
      {PIECES.map((p, i) => (
        <span
          key={i}
          className="absolute top-0 w-2 h-3 rounded-sm"
          style={{
            left: `${p.left}%`,
            backgroundColor: p.color,
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s 1 both`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}
    </div>
  );
}
