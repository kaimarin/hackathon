import { BadgeCheck } from "lucide-react";
import { COLORS } from "@/lib/rebound/data";

export function StampBadge({ label = "Source verified" }: { label?: string }) {
  return (
    <span className="font-mono text-xs" style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 8px", border: `1.5px solid ${COLORS.verified}`, color: COLORS.verified, borderRadius: 4, transform: "rotate(-2deg)", background: COLORS.verifiedLight }}>
      <BadgeCheck size={13} /> {label}
    </span>
  );
}

export function TierPips({ tier }: { tier: number }) {
  return (
    <span style={{ display: "inline-flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3].map((n) => (
        <span key={n} style={{ width: 6, height: 6, borderRadius: 999, background: n <= tier ? COLORS.effort : COLORS.border }} />
      ))}
    </span>
  );
}

export function RingProgress({ pct }: { pct: number }) {
  const r = 22;
  const c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width="56" height="56" viewBox="0 0 56 56">
      <circle cx="28" cy="28" r={r} stroke={COLORS.border} strokeWidth="5" fill="none" />
      <circle cx="28" cy="28" r={r} stroke={COLORS.effort} strokeWidth="5" fill="none" strokeDasharray={c} strokeDashoffset={offset} strokeLinecap="round" transform="rotate(-90 28 28)" />
      <text x="28" y="32" textAnchor="middle" fontSize="12" fontFamily="IBM Plex Mono, monospace" fill={COLORS.ink}>{pct}%</text>
    </svg>
  );
}

export function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-xs font-mono" style={{ color: COLORS.muted }}>{label}</span>
      <span className="text-sm font-medium" style={{ color: COLORS.ink, textAlign: "right" }}>{value || "—"}</span>
    </div>
  );
}

export function ChipRow({ label, options, value, onChange }: { label: string; options: string[]; value: string | null; onChange: (v: string) => void }) {
  return (
    <div>
      <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => {
          const sel = value === o;
          return (
            <button key={o} className="gt-btn text-xs font-mono" style={{ background: sel ? COLORS.effortLight : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 999, padding: "8px 14px", color: COLORS.ink }} onClick={() => onChange(o)}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

export function MultiChipRow({ label, options, values, onChange }: { label: string; options: string[]; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => {
          const sel = values.includes(o);
          return (
            <button key={o} className="gt-btn text-xs font-mono" style={{ background: sel ? COLORS.effortLight : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 999, padding: "8px 14px", color: COLORS.ink }} onClick={() => onChange(sel ? values.filter((v) => v !== o) : [...values, o])}>{o}</button>
          );
        })}
      </div>
    </div>
  );
}

export interface QOption {
  id: string;
  label: string;
  points: number;
}

export function QSelect({ label, options, value, onChange }: { label: string; options: QOption[]; value: QOption | null; onChange: (o: QOption) => void }) {
  return (
    <div>
      <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>{label}</div>
      <div className="flex gap-2 flex-wrap">
        {options.map((o) => {
          const sel = value && value.id === o.id;
          return (
            <button key={o.id} className="gt-btn text-xs font-mono" style={{ background: sel ? COLORS.effortLight : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 999, padding: "8px 14px", color: COLORS.ink }} onClick={() => onChange(o)}>{o.label}</button>
          );
        })}
      </div>
    </div>
  );
}

export function ScaleRow({ label, leftLabel, rightLabel, value, onChange }: { label: string; leftLabel: string; rightLabel: string; value: number; onChange: (n: number) => void }) {
  return (
    <div>
      <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>{label}</div>
      <div className="flex gap-2 mb-1">
        {[1, 2, 3, 4, 5].map((n) => {
          const sel = value === n;
          return (
            <button key={n} className="gt-btn" style={{ flex: 1, background: sel ? COLORS.effort : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 10, padding: "10px 0", color: sel ? "#fff" : COLORS.ink, fontWeight: 500 }} onClick={() => onChange(n)}>{n}</button>
          );
        })}
      </div>
      <div className="flex items-center justify-between text-xs" style={{ color: COLORS.muted }}>
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  );
}
