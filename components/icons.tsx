export function LaurelBranch({
  flip = false,
  className = "",
}: {
  flip?: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 40 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      style={flip ? { transform: "scaleX(-1)" } : undefined}
      aria-hidden="true"
    >
      <path d="M20 6 C20 30 20 70 24 104" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      {[14, 26, 38, 50, 62, 74, 86, 96].map((y, i) => (
        <ellipse
          key={y}
          cx={20 + (i % 2 === 0 ? -9 : 9)}
          cy={y}
          rx="7"
          ry="3.4"
          transform={`rotate(${i % 2 === 0 ? -28 : 28} ${20 + (i % 2 === 0 ? -9 : 9)} ${y})`}
          fill="currentColor"
        />
      ))}
    </svg>
  );
}
