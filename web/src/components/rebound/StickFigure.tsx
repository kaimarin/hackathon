import { COLORS, POSES } from "@/lib/rebound/data";

export function StickFigure({
  pose,
  motionType = "none",
  muscleZone,
}: {
  pose: string;
  motionType?: string;
  muscleZone?: number[];
}) {
  const p = POSES[pose] || POSES.standing;
  const anim = p.anim ?? { origin: undefined, lineIdx: undefined };
  const movingIdx = motionType === "limb" && anim.lineIdx ? anim.lineIdx : [];
  const staticLines = p.lines.filter((_, i) => !movingIdx.includes(i));
  const movingLines = p.lines.filter((_, i) => movingIdx.includes(i));
  const groupStyle =
    motionType === "bob" ? { animation: "gt-bob 1.8s ease-in-out infinite" } :
    motionType === "sway" ? { animation: "gt-swayx 1.8s ease-in-out infinite" } : {};
  return (
    <svg viewBox="0 0 100 100" style={{ width: "100%", height: "100%" }}>
      {p.ground && <line x1="15" y1="84" x2="90" y2="84" stroke={COLORS.border} strokeWidth="2" />}
      {p.step && <rect x={p.step[0]} y={p.step[1]} width={p.step[2]} height={p.step[3]} fill={COLORS.border} rx="2" />}
      {muscleZone && (
        <ellipse className="gt-anim" cx={muscleZone[0]} cy={muscleZone[1]} rx={muscleZone[2]} ry={muscleZone[2]} fill={COLORS.effort} opacity="0.22" style={{ animation: "gt-pulse 1.8s ease-in-out infinite" }} />
      )}
      <g className="gt-anim" style={{ ...groupStyle, transformBox: "fill-box", transformOrigin: "center" }}>
        {staticLines.map((l, i) => (
          <line key={"s" + i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
        ))}
        {movingLines.length > 0 && anim.origin && (
          <g className="gt-anim" style={{ transformOrigin: `${anim.origin[0]}px ${anim.origin[1]}px`, animation: "gt-limb 1.6s ease-in-out infinite" }}>
            {movingLines.map((l, i) => (
              <line key={"m" + i} x1={l[0]} y1={l[1]} x2={l[2]} y2={l[3]} stroke={COLORS.ink} strokeWidth="4" strokeLinecap="round" />
            ))}
          </g>
        )}
        {p.dashed && <line x1={p.dashed[0]} y1={p.dashed[1]} x2={p.dashed[2]} y2={p.dashed[3]} stroke={COLORS.effort} strokeWidth="2" strokeDasharray="4 3" />}
        <circle cx={p.head[0]} cy={p.head[1]} r="8" fill={COLORS.ink} />
      </g>
    </svg>
  );
}
