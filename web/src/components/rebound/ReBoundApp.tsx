"use client";

import { useEffect, useState } from "react";
import {
  Home, Calendar, ClipboardCheck, User as UserIcon, ChevronLeft, Check, X,
  AlertTriangle, Play, ExternalLink, Sparkles, Loader2, CheckCircle2,
  Camera, TrendingUp, ArrowUp, ArrowDown,
} from "lucide-react";
import {
  COLORS, TOTAL_STEPS, BODY_AREAS, INJURIES, MECHANISM_TAGS, PAIN_QUALITY,
  AGGRAVATORS, SWELLING_LEVELS, SLEEP_LEVELS, SEV_Q1, SEV_Q2, SEV_Q3,
  SEVERITY, RED_FLAGS, GOALS, AREA_GROUPS, CATEGORIES, CAT_LABELS,
  LIBRARY, HOWTO, computePlan, goalLabel, pickToday,
  type Goal, type Tiers,
} from "@/lib/rebound/data";
import { StickFigure } from "./StickFigure";
import { StampBadge, TierPips, RingProgress, Row, ChipRow, MultiChipRow, QSelect, ScaleRow, type QOption } from "./ui";
import { apiCreateUser, apiFetchUserPlan, apiSubmitCheckIn } from "@/lib/api";
import type { InjuryType, UserPlan } from "@/lib/types";

const BODY_TO_ENUM: Record<string, InjuryType> = {
  knee: "knee",
  ankle: "ankle",
  shoulder: "shoulder",
  back: "lower_back",
  hip: "hip",
};

const STORAGE_KEY = "rebound-state-v1";

interface CheckInData {
  pain: number;
  swelling: string | null;
  mobility: number;
  strength: number;
  sleep: string | null;
  note: string;
}

interface CoachNote {
  day: number;
  dir: "up" | "down";
  text: string;
}

export default function ReBoundApp() {
  const [stage, setStage] = useState("intake");
  const [intakeStep, setIntakeStep] = useState(1);

  const [name, setName] = useState("");
  const [bodyArea, setBodyArea] = useState<string | null>(null);
  const [injury, setInjury] = useState<string | null>(null);
  const [injuryDate, setInjuryDate] = useState("");
  const [mechanism, setMechanism] = useState<string[]>([]);
  const [injuryStory, setInjuryStory] = useState("");
  const [photo, setPhoto] = useState<string | null>(null);
  const [photoAnalyzed, setPhotoAnalyzed] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [severityQ, setSeverityQ] = useState<{ weight: QOption | null; swelling: QOption | null; stability: QOption | null }>({ weight: null, swelling: null, stability: null });
  const [severity, setSeverity] = useState<number | null>(null);
  const [pain, setPain] = useState(4);
  const [painQuality, setPainQuality] = useState<string[]>([]);
  const [aggravators, setAggravators] = useState<string[]>([]);
  const [swellingLevel, setSwellingLevel] = useState<string | null>(null);
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [ackRedFlag, setAckRedFlag] = useState(false);
  const [goal, setGoal] = useState<Goal>({ type: null, detail: "" });
  const [verifySteps, setVerifySteps] = useState([false, false, false, false]);
  const [genError, setGenError] = useState<string | null>(null);

  const [userId, setUserId] = useState<string | null>(null);
  const [serverPlan, setServerPlan] = useState<UserPlan | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const [screen, setScreen] = useState("today");
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [activeExercise, setActiveExercise] = useState<string | null>(null);
  const [currentDay, setCurrentDay] = useState(1);

  const [tiers, setTiers] = useState<Tiers>({ mobility: 1, activation: 1, strength: 1, stability: 1 });
  const [streaks, setStreaks] = useState({ pain: 0, mobility: 0, strength: 0 });
  const [coachNotes, setCoachNotes] = useState<CoachNote[]>([]);
  const [checkIns, setCheckIns] = useState<Record<number, CheckInData>>({});
  const [paceStatus, setPaceStatus] = useState("on-track");
  const [hydrated, setHydrated] = useState(false);

  const [ciPain, setCiPain] = useState(4);
  const [ciSwelling, setCiSwelling] = useState<string | null>(null);
  const [ciMobility, setCiMobility] = useState(3);
  const [ciStrength, setCiStrength] = useState(3);
  const [ciSleep, setCiSleep] = useState<string | null>(null);
  const [ciNote, setCiNote] = useState("");

  // Restore a saved session so a page refresh doesn't restart intake.
  // Must run post-mount (not in useState initializers) so the server render
  // and first client render match; the sync setState cascade is the point.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        setUserId(s.userId ?? null);
        setName(s.name ?? "");
        setBodyArea(s.bodyArea ?? null);
        setInjury(s.injury ?? null);
        setInjuryDate(s.injuryDate ?? "");
        setMechanism(s.mechanism ?? []);
        setInjuryStory(s.injuryStory ?? "");
        setSeverity(s.severity ?? null);
        setPain(s.pain ?? 4);
        setPainQuality(s.painQuality ?? []);
        setAggravators(s.aggravators ?? []);
        setSwellingLevel(s.swellingLevel ?? null);
        setGoal(s.goal ?? { type: null, detail: "" });
        setCurrentDay(s.currentDay ?? 1);
        setTiers(s.tiers ?? { mobility: 1, activation: 1, strength: 1, stability: 1 });
        setStreaks(s.streaks ?? { pain: 0, mobility: 0, strength: 0 });
        setCoachNotes(s.coachNotes ?? []);
        setCheckIns(s.checkIns ?? {});
        setCompleted(s.completed ?? {});
        setPaceStatus(s.paceStatus ?? "on-track");
        if (s.userId && s.bodyArea) setStage("app");
      }
    } catch {
      // corrupted state: start fresh
    }
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  useEffect(() => {
    if (!hydrated || stage !== "app") return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId, name, bodyArea, injury, injuryDate, mechanism, injuryStory,
      severity, pain, painQuality, aggravators, swellingLevel, goal,
      currentDay, tiers, streaks, coachNotes, checkIns, completed, paceStatus,
    }));
  }, [hydrated, stage, userId, name, bodyArea, injury, injuryDate, mechanism, injuryStory, severity, pain, painQuality, aggravators, swellingLevel, goal, currentDay, tiers, streaks, coachNotes, checkIns, completed, paceStatus]);

  useEffect(() => {
    if (!userId) return;
    apiFetchUserPlan(userId).then(setServerPlan).catch(() => setServerPlan(null));
  }, [userId]);

  useEffect(() => {
    if (stage !== "generating") return;
    const t1 = setTimeout(() => setVerifySteps([true, false, false, false]), 450);
    const t2 = setTimeout(() => setVerifySteps([true, true, false, false]), 900);
    const t3 = setTimeout(() => setVerifySteps([true, true, true, false]), 1350);
    const t4 = setTimeout(() => setVerifySteps([true, true, true, true]), 1800);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
  }, [stage]);

  // Enter the app once the animation finishes AND the user is created
  useEffect(() => {
    if (stage !== "generating" || !userId || !verifySteps.every(Boolean)) return;
    const t = setTimeout(() => setStage("app"), 500);
    return () => clearTimeout(t);
  }, [stage, userId, verifySteps]);

  function startGenerate() {
    setGenError(null);
    setVerifySteps([false, false, false, false]);
    setStage("generating");
    apiCreateUser({
      name,
      injuryType: BODY_TO_ENUM[bodyArea ?? ""],
      painLevel: pain,
    })
      .then((u) => setUserId(u.userId))
      .catch((e: Error) => {
        setGenError(e.message);
        setStage("intake");
      });
  }

  const totalWeeks = (SEVERITY.find((s) => s.grade === severity) || {}).weeks || 4;
  const totalDays = totalWeeks * 7;
  const plan = computePlan(totalWeeks);
  const currentWeek = Math.min(totalWeeks, Math.ceil(currentDay / 7));
  const currentPhase = plan.find((p) => currentWeek >= p.startWeek && currentWeek <= p.endWeek) || plan[plan.length - 1];

  function resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    setStage("intake"); setIntakeStep(1);
    setName(""); setUserId(null); setServerPlan(null); setSyncError(null); setGenError(null);
    setBodyArea(null); setInjury(null); setInjuryDate(""); setMechanism([]); setInjuryStory("");
    setPhoto(null); setPhotoAnalyzed(false); setAnalyzing(false);
    setSeverityQ({ weight: null, swelling: null, stability: null }); setSeverity(null);
    setPain(4); setPainQuality([]); setAggravators([]); setSwellingLevel(null);
    setRedFlags([]); setAckRedFlag(false); setGoal({ type: null, detail: "" });
    setScreen("today"); setCompleted({}); setActiveExercise(null); setCurrentDay(1);
    setTiers({ mobility: 1, activation: 1, strength: 1, stability: 1 });
    setStreaks({ pain: 0, mobility: 0, strength: 0 });
    setCoachNotes([]); setCheckIns({}); setPaceStatus("on-track");
    setCiPain(4); setCiSwelling(null); setCiMobility(3); setCiStrength(3); setCiSleep(null); setCiNote("");
  }

  function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setPhoto(reader.result as string); setPhotoAnalyzed(false); };
    reader.readAsDataURL(file);
  }

  function analyzePhoto() {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setPhotoAnalyzed(true); }, 1200);
  }

  // ENGINEER: streak thresholds (3 days) and tier rules are illustrative;
  // the real model should weigh trends jointly, with clinical sign-off.
  function submitCheckIn() {
    const data: CheckInData = { pain: ciPain, swelling: ciSwelling, mobility: ciMobility, strength: ciStrength, sleep: ciSleep, note: ciNote };
    const prev = checkIns[currentDay - 1];
    const notes: CoachNote[] = [];
    const newStreaks = { ...streaks };
    const newTiers = { ...tiers };

    if (prev !== undefined) {
      newStreaks.pain = data.pain >= prev.pain ? newStreaks.pain + 1 : 0;
    }
    newStreaks.mobility = data.mobility >= 4 ? newStreaks.mobility + 1 : 0;
    newStreaks.strength = data.strength >= 4 ? newStreaks.strength + 1 : 0;

    if (newStreaks.pain >= 3) {
      CATEGORIES.forEach((c) => { newTiers[c] = Math.max(1, newTiers[c] - 1); });
      notes.push({ day: currentDay, dir: "down", text: "Pain hasn't eased in 3 days, so we've dialed every track back one level. Bodies heal at different speeds — this is the plan honoring yours." });
      newStreaks.pain = 0;
      setPaceStatus("slowed");
    } else {
      if (newStreaks.mobility >= 3 && newTiers.mobility < 3) {
        newTiers.mobility += 1;
        notes.push({ day: currentDay, dir: "up", text: `3 days of strong mobility scores — your mobility track moved up to level ${newTiers.mobility}. New variants unlock today.` });
        newStreaks.mobility = 0;
      }
      if (newStreaks.strength >= 3) {
        let advanced = false;
        if (newTiers.strength < 3) { newTiers.strength += 1; advanced = true; }
        if (newTiers.stability < 3) { newTiers.stability += 1; advanced = true; }
        if (advanced) {
          notes.push({ day: currentDay, dir: "up", text: `3 days of feeling strong and stable — strength and stability tracks leveled up. Today's work gets harder because you earned it.` });
        }
        newStreaks.strength = 0;
      }
      if (notes.length === 0 && paceStatus === "slowed" && data.pain < (prev ? prev.pain : 11)) {
        setPaceStatus("on-track");
        notes.push({ day: currentDay, dir: "up", text: "Pain is trending down again — back to your regular pace." });
      }
    }

    setStreaks(newStreaks);
    setTiers(newTiers);
    if (notes.length) setCoachNotes((n) => [...notes, ...n].slice(0, 6));
    setCheckIns((prevAll) => ({ ...prevAll, [currentDay]: data }));

    // Record the check-in server-side; RocketRide plan regeneration hangs off this
    if (userId) {
      setSyncError(null);
      apiSubmitCheckIn(userId, { painLevel: ciPain, notes: ciNote || undefined })
        .then(() => apiFetchUserPlan(userId))
        .then(setServerPlan)
        .catch((e: Error) => setSyncError(e.message));
    }

    setCiPain(4); setCiSwelling(null); setCiMobility(3); setCiStrength(3); setCiSleep(null); setCiNote("");
    setScreen("today");
  }

  function renderIntakeHeader() {
    return (
      <div className="mb-5">
        <div className="font-display font-bold text-lg" style={{ color: COLORS.ink }}>REBOUND</div>
        <div className="font-mono text-xs mb-3" style={{ color: COLORS.muted }}>Recovery plans that adapt to you.</div>
        <div className="flex gap-1">
          {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((s) => (
            <div key={s} style={{ flex: 1, height: 4, borderRadius: 2, background: s <= intakeStep ? COLORS.effort : COLORS.border }} />
          ))}
        </div>
        <div className="font-mono text-xs mt-2" style={{ color: COLORS.muted }}>STEP {intakeStep} OF {TOTAL_STEPS}</div>
      </div>
    );
  }

  function renderStepNav({ back, canContinue, onContinue, label = "Continue" }: { back: () => void; canContinue: boolean; onContinue: () => void; label?: string }) {
    return (
      <div className="flex gap-2 mt-4">
        <button className="gt-btn" style={{ border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 14, background: COLORS.card }} onClick={back}>
          <ChevronLeft size={18} color={COLORS.ink} />
        </button>
        <button disabled={!canContinue} className="gt-btn font-medium" style={{ flex: 1, background: canContinue ? COLORS.ink : COLORS.border, color: "#fff", borderRadius: 12, padding: 14, opacity: canContinue ? 1 : 0.6 }} onClick={onContinue}>
          {label}
        </button>
      </div>
    );
  }

  function renderStep1() {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-display font-bold text-xl" style={{ color: COLORS.ink }}>Let&apos;s get started</div>
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Your name</div>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="What should we call you?" className="text-sm font-body" style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10, background: COLORS.card, color: COLORS.ink }} />
        </div>
        <div className="text-sm font-medium" style={{ color: COLORS.ink }}>Where&apos;s the injury?</div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {BODY_AREAS.map((b) => {
            const Icon = b.icon;
            const sel = bodyArea === b.id;
            return (
              <button key={b.id} className="gt-btn flex flex-col items-center justify-center gap-2" style={{ background: sel ? COLORS.effortLight : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 16, padding: 18 }} onClick={() => { setBodyArea(b.id); setInjury(null); }}>
                <Icon size={24} color={sel ? COLORS.effort : COLORS.ink} />
                <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{b.label}</span>
              </button>
            );
          })}
        </div>
        <button disabled={!bodyArea || !name.trim()} className="gt-btn font-medium mt-4" style={{ background: bodyArea && name.trim() ? COLORS.ink : COLORS.border, color: "#fff", borderRadius: 12, padding: 14, opacity: bodyArea && name.trim() ? 1 : 0.6 }} onClick={() => setIntakeStep(2)}>Continue</button>
      </div>
    );
  }

  function renderStep2() {
    const list = INJURIES[bodyArea ?? ""] || [];
    return (
      <div className="flex flex-col gap-2.5">
        <div className="font-display font-bold text-xl" style={{ color: COLORS.ink }}>What&apos;s the injury?</div>
        {list.map((n) => {
          const sel = injury === n;
          return (
            <button key={n} className="gt-btn text-left" style={{ background: sel ? COLORS.effortLight : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 14, padding: 12 }} onClick={() => setInjury(n)}>
              <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{n}</span>
            </button>
          );
        })}
        {renderStepNav({ back: () => setIntakeStep(1), canContinue: !!injury, onContinue: () => setIntakeStep(3) })}
      </div>
    );
  }

  function renderStep3() {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-display font-bold text-xl" style={{ color: COLORS.ink }}>Tell us what happened</div>
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>When did it happen?</div>
          <input type="date" value={injuryDate} onChange={(e) => setInjuryDate(e.target.value)} className="text-sm font-body" style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10, background: COLORS.card, color: COLORS.ink }} />
        </div>
        <MultiChipRow label="How did it happen?" options={MECHANISM_TAGS} values={mechanism} onChange={setMechanism} />
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>In your own words</div>
          <textarea value={injuryStory} onChange={(e) => setInjuryStory(e.target.value)} rows={3} placeholder="What were you doing, what did it feel like, what's changed since..." className="text-sm font-body" style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10, background: COLORS.card, color: COLORS.ink, resize: "none" }} />
        </div>
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Photo (optional)</div>
          {!photo ? (
            <label className="gt-btn flex items-center justify-center gap-2" style={{ border: `1.5px dashed ${COLORS.border}`, borderRadius: 14, padding: 16, cursor: "pointer" }}>
              <Camera size={18} color={COLORS.muted} />
              <span className="text-sm" style={{ color: COLORS.muted }}>Add a photo for your care team</span>
              <input type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoUpload} />
            </label>
          ) : (
            <div className="flex flex-col gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element -- data-URI preview, not an optimizable asset */}
              <img src={photo} alt="Uploaded injury" style={{ width: "100%", borderRadius: 14, border: `1px solid ${COLORS.border}` }} />
              {!photoAnalyzed ? (
                <button className="gt-btn text-sm font-medium" style={{ background: COLORS.ink, color: "#fff", borderRadius: 12, padding: 10 }} onClick={analyzePhoto}>{analyzing ? "Analyzing..." : "Analyze photo"}</button>
              ) : (
                <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12 }}>
                  <div className="text-xs mb-2" style={{ color: COLORS.muted }}>Objective signals — for your care team, not a diagnosis</div>
                  <div className="flex flex-col gap-1.5">
                    <Row label="Swelling" value="Visible, mild–moderate" />
                    <Row label="Bruising" value="Present" />
                    <Row label="Skin integrity" value="Intact" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
        {renderStepNav({ back: () => setIntakeStep(2), canContinue: !!injuryDate, onContinue: () => setIntakeStep(4) })}
      </div>
    );
  }

  function renderStep4() {
    const answered = severityQ.weight && severityQ.swelling && severityQ.stability;
    let suggested: number | null = null;
    if (answered) {
      const pts = severityQ.weight!.points + severityQ.swelling!.points + severityQ.stability!.points;
      suggested = pts <= 4 ? 1 : pts <= 7 ? 2 : 3;
    }
    return (
      <div className="flex flex-col gap-3.5">
        <div className="font-display font-bold text-xl" style={{ color: COLORS.ink }}>How severe does it feel?</div>
        <QSelect label="Can you put weight on it or use it normally?" options={SEV_Q1} value={severityQ.weight} onChange={(o) => setSeverityQ((s) => ({ ...s, weight: o }))} />
        <QSelect label="Is there visible swelling or bruising?" options={SEV_Q2} value={severityQ.swelling} onChange={(o) => setSeverityQ((s) => ({ ...s, swelling: o }))} />
        <QSelect label="Does it feel stable, or like it could give out?" options={SEV_Q3} value={severityQ.stability} onChange={(o) => setSeverityQ((s) => ({ ...s, stability: o }))} />
        <div className="flex flex-col gap-2">
          {SEVERITY.map((s) => {
            const sel = severity === s.grade;
            const isSuggested = suggested === s.grade;
            return (
              <button key={s.grade} className="gt-btn text-left" style={{ background: sel ? COLORS.effortLight : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 14, padding: 12 }} onClick={() => setSeverity(s.grade)}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{s.label}</span>
                  {isSuggested && <span className="font-mono text-xs px-2 py-1" style={{ background: COLORS.verifiedLight, color: COLORS.verified, borderRadius: 999 }}>SUGGESTED</span>}
                </div>
                <div className="text-xs" style={{ color: COLORS.muted }}>{s.desc}</div>
                {s.grade === 3 && <div className="text-xs mt-1" style={{ color: COLORS.alert }}>We recommend getting cleared by a physician before starting.</div>}
              </button>
            );
          })}
        </div>
        {renderStepNav({ back: () => setIntakeStep(3), canContinue: !!severity, onContinue: () => setIntakeStep(5) })}
      </div>
    );
  }

  function renderStep5() {
    const hasFlags = redFlags.length > 0;
    const canContinue = !!swellingLevel && (!hasFlags || ackRedFlag);
    return (
      <div className="flex flex-col gap-3.5">
        <div className="font-display font-bold text-xl" style={{ color: COLORS.ink }}>Pain &amp; symptoms</div>
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Pain right now: {pain}/10</div>
          <input type="range" min="0" max="10" value={pain} onChange={(e) => setPain(Number(e.target.value))} style={{ width: "100%", accentColor: COLORS.effort }} />
        </div>
        <MultiChipRow label="What does the pain feel like?" options={PAIN_QUALITY} values={painQuality} onChange={setPainQuality} />
        <MultiChipRow label="What makes it worse?" options={AGGRAVATORS} values={aggravators} onChange={setAggravators} />
        <ChipRow label="Swelling level" options={SWELLING_LEVELS} value={swellingLevel} onChange={setSwellingLevel} />
        <MultiChipRow label="Any of these right now?" options={RED_FLAGS} values={redFlags} onChange={setRedFlags} />
        {hasFlags && (
          <div style={{ background: COLORS.alertLight, border: `1px solid ${COLORS.alert}`, borderRadius: 12, padding: 12 }}>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={16} color={COLORS.alert} />
              <span className="text-sm font-medium" style={{ color: COLORS.alert }}>Please get evaluated by a doctor first</span>
            </div>
            <div className="text-xs mb-2" style={{ color: COLORS.alert }}>What you&apos;ve flagged can mean something more serious. A home program isn&apos;t a substitute for an in-person check.</div>
            <button className="gt-btn text-xs font-medium" style={{ border: `1px solid ${COLORS.alert}`, borderRadius: 8, padding: "6px 10px", background: "transparent", color: COLORS.alert }} onClick={() => setAckRedFlag(true)}>{ackRedFlag ? "Acknowledged" : "I understand, continue anyway"}</button>
          </div>
        )}
        {renderStepNav({ back: () => setIntakeStep(4), canContinue, onContinue: () => setIntakeStep(6) })}
      </div>
    );
  }

  function renderStep6() {
    return (
      <div className="flex flex-col gap-4">
        <div className="font-display font-bold text-xl" style={{ color: COLORS.ink }}>What&apos;s the goal?</div>
        <div className="text-xs" style={{ color: COLORS.muted }}>Everything in your plan will point back to this.</div>
        <div className="flex flex-col gap-2.5">
          {GOALS.map((g) => {
            const sel = goal.type === g.id;
            return (
              <button key={g.id} className="gt-btn text-left" style={{ background: sel ? COLORS.effortLight : COLORS.card, border: `1.5px solid ${sel ? COLORS.effort : COLORS.border}`, borderRadius: 14, padding: 14 }} onClick={() => setGoal({ type: g.id, detail: "" })}>
                <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{g.label}</span>
              </button>
            );
          })}
        </div>
        {(goal.type === "sport" || goal.type === "lifting") && (
          <input value={goal.detail} onChange={(e) => setGoal((g) => ({ ...g, detail: e.target.value }))} placeholder={goal.type === "sport" ? "Which sport?" : "Target, e.g. 225 lb deadlift"} className="text-sm font-body" style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10, background: COLORS.card, color: COLORS.ink }} />
        )}
        {genError && (
          <div className="text-xs" style={{ background: COLORS.alertLight, border: `1px solid ${COLORS.alert}`, color: COLORS.alert, borderRadius: 12, padding: 12 }}>
            Couldn&apos;t create your profile: {genError}
          </div>
        )}
        {renderStepNav({ back: () => setIntakeStep(5), canContinue: !!goal.type, onContinue: startGenerate, label: "Generate my plan" })}
      </div>
    );
  }

  function renderGenerating() {
    const steps = ["Cross-checking with PT protocols", "Verifying against orthopedic guidelines", "Checking video sources are real and credentialed", "Building your tiered pathway"];
    return (
      <div className="flex flex-col items-center justify-center gap-5 min-h-[70vh]">
        <Sparkles size={28} color={COLORS.effort} />
        <div className="font-display font-bold text-xl text-center" style={{ color: COLORS.ink }}>Building your plan</div>
        <div className="w-full max-w-sm flex flex-col gap-3">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-3">
              {verifySteps[i] ? <CheckCircle2 size={18} color={COLORS.verified} /> : <Loader2 size={18} className="animate-spin" color={COLORS.muted} />}
              <span className="font-mono text-xs" style={{ color: verifySteps[i] ? COLORS.ink : COLORS.muted }}>{s}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  function renderToday() {
    const doneToday = !!checkIns[currentDay];
    if (!doneToday) {
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs" style={{ color: COLORS.muted }}>DAY {currentDay} OF {totalDays}</div>
            <div className="font-display font-bold text-2xl" style={{ color: COLORS.ink }}>Let&apos;s check in first{name ? `, ${name.split(" ")[0]}` : ""}</div>
          </div>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 16 }}>
            <div className="text-sm mb-3" style={{ color: COLORS.ink }}>Your check-in decides today&apos;s plan — whether each track levels up, holds, or eases back. About a minute.</div>
            <button className="gt-btn font-medium w-full" style={{ background: COLORS.ink, color: "#fff", borderRadius: 12, padding: 14 }} onClick={() => setScreen("checkin")}>Start today&apos;s check-in</button>
          </div>
          {coachNotes.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Coach notes</div>
              {coachNotes.slice(0, 2).map((n, i) => (
                <div key={i} className="flex items-start gap-2 mb-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10 }}>
                  {n.dir === "up" ? <ArrowUp size={14} color={COLORS.verified} style={{ flexShrink: 0, marginTop: 2 }} /> : <ArrowDown size={14} color={COLORS.amber} style={{ flexShrink: 0, marginTop: 2 }} />}
                  <div className="text-xs" style={{ color: COLORS.ink }}>{n.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    const { picked: todays, flaggedIds } = pickToday(currentDay, tiers, bodyArea ?? "", aggravators);
    const doneCount = todays.filter((e) => completed[currentDay + ":" + e.id]).length;
    const pct = todays.length ? Math.round((doneCount / todays.length) * 100) : 0;

    return (
      <div className="flex flex-col gap-3.5">
        <div>
          <div className="font-mono text-xs" style={{ color: COLORS.muted }}>DAY {currentDay} OF {totalDays}</div>
          <div className="font-display font-bold text-2xl" style={{ color: COLORS.ink }}>Today&apos;s work</div>
        </div>
        {coachNotes.filter((n) => n.day === currentDay).map((n, i) => (
          <div key={i} className="flex items-start gap-2" style={{ background: n.dir === "up" ? COLORS.verifiedLight : COLORS.amberLight, border: `1px solid ${n.dir === "up" ? COLORS.verified : COLORS.amber}`, borderRadius: 14, padding: 12 }}>
            {n.dir === "up" ? <ArrowUp size={16} color={COLORS.verified} style={{ flexShrink: 0, marginTop: 2 }} /> : <ArrowDown size={16} color={COLORS.amber} style={{ flexShrink: 0, marginTop: 2 }} />}
            <div className="text-xs" style={{ color: n.dir === "up" ? COLORS.verified : COLORS.amber }}>{n.text}</div>
          </div>
        ))}
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
          <div className="flex items-center gap-4 mb-2">
            <RingProgress pct={pct} />
            <div style={{ flex: 1 }}>
              <div className="text-sm font-medium" style={{ color: COLORS.ink }}>{currentPhase.name}</div>
              <div className="text-xs" style={{ color: COLORS.muted }}>{currentPhase.focus}</div>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 mb-2" style={{ borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
            {CATEGORIES.map((c) => (
              <span key={c} className="font-mono text-xs" style={{ display: "inline-flex", alignItems: "center", gap: 5, background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 999, padding: "4px 10px", color: COLORS.ink }}>
                {CAT_LABELS[c]} <TierPips tier={tiers[c]} />
              </span>
            ))}
          </div>
          <div className="text-xs" style={{ color: COLORS.muted }}>
            Why today matters: this phase builds toward <span style={{ color: COLORS.ink, fontWeight: 500 }}>{currentPhase.milestone}</span> — one step toward {goalLabel(goal)}.
          </div>
        </div>
        {flaggedIds.size > 0 && (
          <div className="text-xs" style={{ color: COLORS.muted }}>
            Some variants were held back because you told us what makes it worse — they&apos;ll return as things settle.
          </div>
        )}
        <div className="flex flex-col gap-2.5">
          {todays.map((e) => {
            const done = !!completed[currentDay + ":" + e.id];
            return (
              <div key={e.id} className="flex items-center gap-3 gt-btn" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 12, cursor: "pointer", opacity: done ? 0.6 : 1 }} onClick={() => setActiveExercise(e.id)}>
                <div style={{ width: 52, height: 52, background: COLORS.paper, borderRadius: 12, flexShrink: 0 }}>
                  <StickFigure pose={e.pose} motionType={e.motionType} muscleZone={e.muscleZone} />
                </div>
                <div style={{ flex: 1 }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{e.name}</span>
                    <span className="font-mono" style={{ fontSize: 10, background: COLORS.effortLight, color: COLORS.effort, borderRadius: 4, padding: "1px 5px" }}>L{e.tier}</span>
                  </div>
                  <div className="text-xs font-mono" style={{ color: COLORS.muted }}>{e.dose}</div>
                  <div className="text-xs" style={{ color: COLORS.effort }}>{e.muscle}</div>
                </div>
                <button onClick={(ev) => { ev.stopPropagation(); setCompleted((c) => ({ ...c, [currentDay + ":" + e.id]: !c[currentDay + ":" + e.id] })); }} style={{ width: 28, height: 28, borderRadius: 999, border: `1.5px solid ${done ? COLORS.verified : COLORS.border}`, background: done ? COLORS.verified : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {done && <Check size={16} color="#fff" />}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  function renderCheckIn() {
    const doneToday = checkIns[currentDay];
    if (doneToday) {
      const serverHistory = serverPlan?.progressHistory?.slice(-5) ?? [];
      return (
        <div className="flex flex-col gap-4">
          <div>
            <div className="font-mono text-xs" style={{ color: COLORS.muted }}>DAY {currentDay}</div>
            <div className="font-display font-bold text-2xl" style={{ color: COLORS.ink }}>Check-in complete</div>
          </div>
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Pain" value={`${doneToday.pain} / 10`} />
            <Row label="Swelling" value={doneToday.swelling} />
            <Row label="Mobility felt" value={`${doneToday.mobility} / 5`} />
            <Row label="Strength felt" value={`${doneToday.strength} / 5`} />
            <Row label="Sleep" value={doneToday.sleep} />
          </div>
          <div className="flex items-center gap-2" style={{ background: paceStatus === "slowed" ? COLORS.amberLight : COLORS.verifiedLight, border: `1px solid ${paceStatus === "slowed" ? COLORS.amber : COLORS.verified}`, borderRadius: 12, padding: 12 }}>
            <TrendingUp size={16} color={paceStatus === "slowed" ? COLORS.amber : COLORS.verified} />
            <span className="text-xs" style={{ color: paceStatus === "slowed" ? COLORS.amber : COLORS.verified }}>{paceStatus === "slowed" ? "Pace eased — we're honoring where your body's at." : "On track with your plan's pace."}</span>
          </div>
          {syncError && (
            <div className="text-xs" style={{ background: COLORS.amberLight, border: `1px solid ${COLORS.amber}`, color: COLORS.amber, borderRadius: 12, padding: 10 }}>
              Saved locally, but syncing to the server failed: {syncError}
            </div>
          )}
          {serverHistory.length > 1 && (
            <div>
              <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Pain trend</div>
              <div className="flex flex-col gap-1.5">
                {serverHistory.map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-xs font-mono" style={{ color: COLORS.muted }}>
                    <span>{h.date}</span>
                    <span>Pain {h.pain}/10</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {coachNotes.length > 0 && (
            <div>
              <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Plan adjustments so far</div>
              {coachNotes.map((n, i) => (
                <div key={i} className="flex items-start gap-2 mb-2" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10 }}>
                  {n.dir === "up" ? <ArrowUp size={14} color={COLORS.verified} style={{ flexShrink: 0, marginTop: 2 }} /> : <ArrowDown size={14} color={COLORS.amber} style={{ flexShrink: 0, marginTop: 2 }} />}
                  <div className="text-xs" style={{ color: COLORS.ink }}><span className="font-mono" style={{ color: COLORS.muted }}>Day {n.day} · </span>{n.text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-mono text-xs" style={{ color: COLORS.muted }}>DAY {currentDay}</div>
          <div className="font-display font-bold text-2xl" style={{ color: COLORS.ink }}>Daily check-in</div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Pain today: {ciPain}/10</div>
          <input type="range" min="0" max="10" value={ciPain} onChange={(e) => setCiPain(Number(e.target.value))} style={{ width: "100%", accentColor: COLORS.effort }} />
        </div>
        <ChipRow label="Swelling" options={SWELLING_LEVELS} value={ciSwelling} onChange={setCiSwelling} />
        <ScaleRow label="How did mobility feel today?" leftLabel="Very stiff" rightLabel="Very free" value={ciMobility} onChange={setCiMobility} />
        <ScaleRow label="How did strength & stability feel?" leftLabel="Weak / unstable" rightLabel="Strong & stable" value={ciStrength} onChange={setCiStrength} />
        <ChipRow label="Sleep last night" options={SLEEP_LEVELS} value={ciSleep} onChange={setCiSleep} />
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Anything else worth noting?</div>
          <textarea value={ciNote} onChange={(e) => setCiNote(e.target.value)} rows={3} placeholder="Optional" className="text-sm font-body" style={{ width: "100%", border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 10, background: COLORS.card, color: COLORS.ink, resize: "none" }} />
        </div>
        <button disabled={!ciSwelling || !ciSleep} className="gt-btn font-medium" style={{ background: (ciSwelling && ciSleep) ? COLORS.ink : COLORS.border, color: "#fff", borderRadius: 12, padding: 14, opacity: (ciSwelling && ciSleep) ? 1 : 0.6 }} onClick={submitCheckIn}>Save &amp; unlock today&apos;s plan</button>
      </div>
    );
  }

  function renderPlan() {
    const group = AREA_GROUPS[bodyArea ?? ""] || [bodyArea];
    const families: Record<string, typeof LIBRARY> = {};
    LIBRARY.filter((e) => e.bodyAreas.some((a) => group.includes(a))).forEach((e) => {
      if (!families[e.family]) families[e.family] = [];
      families[e.family].push(e);
    });
    Object.values(families).forEach((list) => list.sort((a, b) => a.tier - b.tier));

    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-mono text-xs" style={{ color: COLORS.muted }}>{totalWeeks}-WEEK PATHWAY</div>
          <div className="font-display font-bold text-2xl" style={{ color: COLORS.ink }}>Your plan</div>
        </div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
          <div className="text-xs mb-1" style={{ color: COLORS.muted }}>YOUR GOAL</div>
          <div className="text-sm font-medium" style={{ color: COLORS.ink }}>{(GOALS.find((g) => g.id === goal.type) || {}).label}{goal.detail ? ` — ${goal.detail}` : ""}</div>
          <div className="text-xs mt-1" style={{ color: COLORS.muted }}>Phases set the story. Levels are earned by your check-ins.</div>
          {serverPlan && (
            <div className="text-xs font-mono mt-2" style={{ color: COLORS.muted, borderTop: `1px solid ${COLORS.border}`, paddingTop: 8 }}>
              Plan record updated {new Date(serverPlan.plan.updatedAt).toLocaleDateString()}
              {serverPlan.plan.sourceNotes ? ` · "${serverPlan.plan.sourceNotes}"` : ""}
            </div>
          )}
        </div>
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Phases</div>
          <div className="flex flex-col gap-2">
            {plan.map((p) => {
              const active = currentWeek >= p.startWeek && currentWeek <= p.endWeek;
              return (
                <div key={p.id} style={{ background: COLORS.card, border: `1px solid ${active ? COLORS.effort : COLORS.border}`, borderRadius: 14, padding: 12 }}>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{p.name}</span>
                    <span className="font-mono text-xs" style={{ color: COLORS.muted }}>Wk {p.startWeek}{p.endWeek > p.startWeek ? `–${p.endWeek}` : ""}</span>
                  </div>
                  <div className="text-xs mt-1" style={{ color: COLORS.muted }}>Milestone: {p.milestone}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>Your movement families</div>
          <div className="text-xs mb-2" style={{ color: COLORS.muted }}>Each family is a ladder. Your check-ins decide when you climb.</div>
          <div className="flex flex-col gap-2">
            {Object.entries(families).map(([fam, list]) => {
              const cat = list[0].category;
              const curTier = tiers[cat];
              return (
                <div key={fam} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12 }}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium" style={{ color: COLORS.ink }}>{fam}</span>
                    <span className="font-mono text-xs" style={{ color: COLORS.muted }}>{CAT_LABELS[cat]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {list.map((e) => {
                      const unlocked = e.tier <= curTier;
                      return (
                        <span key={e.id} className="font-mono text-xs px-2 py-1" style={{ background: unlocked ? COLORS.effortLight : COLORS.paper, border: `1px solid ${unlocked ? COLORS.effort : COLORS.border}`, borderRadius: 8, color: unlocked ? COLORS.effort : COLORS.muted }}>
                          L{e.tier} · {e.name}
                        </span>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  function renderProfile() {
    const sev = SEVERITY.find((s) => s.grade === severity);
    return (
      <div className="flex flex-col gap-4">
        <div>
          <div className="font-mono text-xs" style={{ color: COLORS.muted }}>YOUR PROFILE</div>
          <div className="font-display font-bold text-2xl" style={{ color: COLORS.ink }}>Recovery summary</div>
        </div>
        <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14, display: "flex", flexDirection: "column", gap: 8 }}>
          <Row label="Name" value={name} />
          <Row label="Area" value={(BODY_AREAS.find((b) => b.id === bodyArea) || {}).label} />
          <Row label="Injury" value={injury} />
          <Row label="Date of injury" value={injuryDate} />
          <Row label="Mechanism" value={mechanism.join(", ")} />
          <Row label="Severity" value={sev ? sev.label : ""} />
          <Row label="Goal" value={(GOALS.find((g) => g.id === goal.type) || {}).label} />
          <Row label="Day" value={`${currentDay} of ${totalDays}`} />
          <Row label="Levels" value={CATEGORIES.map((c) => `${CAT_LABELS[c][0]}${tiers[c]}`).join(" · ")} />
          <Row label="User ID" value={userId ? userId.slice(0, 8) : "—"} />
        </div>
        {injuryStory && (
          <div style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 16, padding: 14 }}>
            <div className="text-xs mb-1" style={{ color: COLORS.muted }}>IN YOUR WORDS</div>
            <div className="text-sm" style={{ color: COLORS.ink }}>{injuryStory}</div>
          </div>
        )}
        <button className="gt-btn text-sm font-medium" style={{ background: COLORS.paper, border: `1px solid ${COLORS.border}`, borderRadius: 12, padding: 12, color: COLORS.ink }} onClick={() => setCurrentDay((d) => Math.min(totalDays, d + 1))}>Simulate: advance one day</button>
        <button className="gt-btn text-sm font-medium" style={{ background: "transparent", border: `1px solid ${COLORS.alert}`, borderRadius: 12, padding: 12, color: COLORS.alert }} onClick={resetAll}>Start over</button>
        <div className="text-xs" style={{ color: COLORS.muted, lineHeight: 1.5 }}>ReBound supports your recovery. It doesn&apos;t replace an in-person diagnosis — if something feels wrong, see a doctor or physical therapist.</div>
      </div>
    );
  }

  function renderExerciseSheet() {
    const e = LIBRARY.find((x) => x.id === activeExercise);
    if (!e) return null;
    return (
      <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center" style={{ background: "rgba(20,24,28,0.45)" }} onClick={() => setActiveExercise(null)}>
        <div className="font-body w-full sm:max-w-lg" style={{ background: COLORS.paper, borderRadius: "24px 24px 0 0", maxHeight: "90vh", overflowY: "auto", padding: 20 }} onClick={(ev) => ev.stopPropagation()}>
          <div className="flex items-center justify-between mb-1">
            <div className="font-display font-bold text-xl" style={{ color: COLORS.ink }}>{e.name}</div>
            <button className="gt-btn" onClick={() => setActiveExercise(null)} style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 999, padding: 6 }}>
              <X size={16} color={COLORS.ink} />
            </button>
          </div>
          <div className="font-mono text-xs mb-3" style={{ color: COLORS.muted }}>{e.family} · Level {e.tier} of 3</div>
          <div style={{ width: "100%", height: 150, background: COLORS.card, borderRadius: 16, border: `1px solid ${COLORS.border}`, padding: 10, marginBottom: 10 }}>
            <StickFigure pose={e.pose} motionType={e.motionType} muscleZone={e.muscleZone} />
          </div>
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-xs" style={{ color: COLORS.muted }}>{e.dose}</span>
            <span className="font-mono text-xs px-2 py-1" style={{ background: COLORS.effortLight, color: COLORS.effort, borderRadius: 999 }}>{e.category.toUpperCase()}</span>
          </div>
          <div className="mb-4" style={{ background: COLORS.effortLight, border: `1px solid ${COLORS.effort}`, borderRadius: 14, padding: 12 }}>
            <div className="text-xs mb-1" style={{ color: COLORS.effort }}>FEEL IT HERE</div>
            <div className="text-sm font-medium" style={{ color: COLORS.effort }}>{e.muscle}</div>
            <div className="text-xs mt-1" style={{ color: COLORS.effort }}>{e.feel}</div>
          </div>
          <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>How to do it</div>
          <ul className="text-sm mb-4" style={{ color: COLORS.ink, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 6, listStyle: "disc" }}>
            {(HOWTO[e.id] || []).map((s, i) => (<li key={i}>{s}</li>))}
          </ul>
          <div className="mb-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12 }}>
            <div className="text-xs mb-1" style={{ color: COLORS.muted }}>WHY THIS EXERCISE</div>
            <div className="text-sm" style={{ color: COLORS.ink }}>{e.why}</div>
          </div>
          <div className="mb-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12 }}>
            <div className="text-xs mb-1" style={{ color: COLORS.muted }}>HOW THIS GETS YOU TO YOUR GOAL</div>
            <div className="text-sm" style={{ color: COLORS.ink }}>{e.goalLink}</div>
          </div>
          <div className="mb-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12 }}>
            <div className="flex items-center justify-between mb-2">
              <div style={{ width: 56, height: 40, background: COLORS.ink, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Play size={16} color="#fff" fill="#fff" />
              </div>
              <ExternalLink size={14} color={COLORS.muted} />
            </div>
            <div className="text-sm font-medium" style={{ color: COLORS.ink }}>{e.video.title}</div>
            <div className="text-xs mb-2" style={{ color: COLORS.muted }}>{e.video.channel}</div>
            <StampBadge label="Link verified" />
          </div>
          <div className="mb-3" style={{ background: COLORS.card, border: `1px solid ${COLORS.border}`, borderRadius: 14, padding: 12 }}>
            <div className="text-xs mb-2" style={{ color: COLORS.muted }}>Clinical source</div>
            <div className="text-sm font-medium mb-2" style={{ color: COLORS.ink }}>{e.source}</div>
            <StampBadge label="Source verified" />
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "today", label: "Today", icon: Home },
    { id: "plan", label: "Plan", icon: Calendar },
    { id: "checkin", label: "Check-in", icon: ClipboardCheck },
    { id: "profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="font-body min-h-screen" style={{ background: COLORS.paper, color: COLORS.ink }}>
      {stage === "intake" && (
        <main className="max-w-xl mx-auto px-5 py-8">
          {renderIntakeHeader()}
          {intakeStep === 1 && renderStep1()}
          {intakeStep === 2 && renderStep2()}
          {intakeStep === 3 && renderStep3()}
          {intakeStep === 4 && renderStep4()}
          {intakeStep === 5 && renderStep5()}
          {intakeStep === 6 && renderStep6()}
        </main>
      )}
      {stage === "generating" && (
        <main className="max-w-xl mx-auto px-5">{renderGenerating()}</main>
      )}
      {stage === "app" && (
        <>
          <header className="sticky top-0 z-20" style={{ background: COLORS.card, borderBottom: `1px solid ${COLORS.border}` }}>
            <div className="max-w-2xl mx-auto flex items-center justify-between px-5 h-14">
              <div className="flex items-baseline gap-3">
                <span className="font-display font-bold text-lg" style={{ color: COLORS.ink }}>REBOUND</span>
                <span className="font-mono text-xs hidden md:inline" style={{ color: COLORS.muted }}>Recovery plans that adapt to you.</span>
              </div>
              <nav className="hidden sm:flex gap-1">
                {tabs.map((t) => {
                  const Icon = t.icon;
                  const active = screen === t.id;
                  return (
                    <button key={t.id} className="gt-btn flex items-center gap-1.5 text-xs font-mono" onClick={() => setScreen(t.id)} style={{ color: active ? COLORS.effort : COLORS.muted, background: active ? COLORS.effortLight : "transparent", borderRadius: 999, padding: "8px 14px" }}>
                      <Icon size={15} />{t.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </header>
          <main className="max-w-2xl mx-auto px-5 py-6 pb-24 sm:pb-10">
            {screen === "today" && renderToday()}
            {screen === "plan" && renderPlan()}
            {screen === "checkin" && renderCheckIn()}
            {screen === "profile" && renderProfile()}
          </main>
          <div className="flex sm:hidden fixed left-0 right-0 bottom-0" style={{ background: COLORS.card, borderTop: `1px solid ${COLORS.border}`, height: 64 }}>
            {tabs.map((t) => {
              const Icon = t.icon;
              const active = screen === t.id;
              return (
                <button key={t.id} className="flex-1 flex flex-col items-center justify-center gt-btn" onClick={() => setScreen(t.id)} style={{ color: active ? COLORS.effort : COLORS.muted }}>
                  <Icon size={20} />
                  <span className="text-xs font-mono mt-1">{t.label}</span>
                </button>
              );
            })}
          </div>
          {activeExercise && renderExerciseSheet()}
        </>
      )}
    </div>
  );
}
