import { Bone, Footprints, Activity, HeartPulse, Dumbbell } from "lucide-react";

export interface LibraryExercise {
  id: string;
  name: string;
  family: string;
  tier: number;
  category: string;
  bodyAreas: string[];
  avoid: string[];
  dose: string;
  pose: string;
  motionType: string;
  muscleZone: number[];
  muscle: string;
  why: string;
  feel: string;
  goalLink: string;
  source: string;
  video: { title: string; channel: string };
}

export interface Pose {
  ground: boolean;
  head: number[];
  lines: number[][];
  anim?: { origin: number[]; lineIdx?: number[] };
  dashed?: number[];
  step?: number[];
}

export interface Goal {
  type: string | null;
  detail: string;
}

export type Tiers = Record<string, number>;

export const COLORS = {
  ink: "#14181C",
  paper: "#EFF2EC",
  card: "#FFFFFF",
  verified: "#1F7A5C",
  verifiedLight: "#E3F0EA",
  effort: "#2A5FD9",
  effortLight: "#E7ECFB",
  alert: "#C4392B",
  alertLight: "#FBEAE8",
  amber: "#9A6A0B",
  amberLight: "#FAF0DA",
  muted: "#6B756F",
  border: "#DEE3DA",
};

export const TOTAL_STEPS = 6;

export const BODY_AREAS = [
  { id: "knee", label: "Knee", icon: Bone },
  { id: "ankle", label: "Ankle", icon: Footprints },
  { id: "shoulder", label: "Shoulder", icon: Activity },
  { id: "back", label: "Lower back", icon: HeartPulse },
  { id: "hip", label: "Hip", icon: Dumbbell },
];

export const INJURIES: Record<string, string[]> = {
  knee: ["ACL sprain", "PCL sprain", "Meniscus tear", "MCL sprain", "LCL sprain", "Patellar tendinitis", "Patellofemoral pain", "IT band syndrome", "Not sure / other"],
  ankle: ["Lateral ankle sprain", "High ankle sprain", "Achilles tendinitis", "Achilles rupture", "Stress fracture", "Not sure / other"],
  shoulder: ["Rotator cuff strain", "Rotator cuff tear", "Shoulder impingement", "AC joint sprain", "Labral tear", "Shoulder dislocation", "Not sure / other"],
  back: ["Lumbar strain", "Disc irritation / herniation", "Sciatica", "SI joint pain", "Not sure / other"],
  hip: ["Hip flexor strain", "Hamstring strain", "Groin strain", "Hip labral irritation", "Not sure / other"],
};

export const MECHANISM_TAGS = ["Twisted or rolled", "Direct hit or collision", "Overuse / gradual onset", "Fall", "Lifting or straining", "Post-surgical", "Sudden pop or give-way", "Other"];
export const PAIN_QUALITY = ["Sharp", "Dull", "Achy", "Burning", "Throbbing", "Stiff"];
export const AGGRAVATORS = ["Movement", "Weight-bearing", "Stairs", "Sitting", "Night / lying down", "Cold weather"];
export const AGG_TO_TAG: Record<string, string> = { "Stairs": "stairs", "Night / lying down": "lying", "Weight-bearing": "loaded" };
export const SWELLING_LEVELS = ["None", "Mild", "Moderate", "Severe"];
export const SLEEP_LEVELS = ["Poor", "OK", "Good"];

export const SEV_Q1 = [{ id: "full", label: "Yes, normally", points: 1 }, { id: "some", label: "With some difficulty", points: 2 }, { id: "no", label: "No, I can't", points: 3 }];
export const SEV_Q2 = [{ id: "none", label: "None", points: 1 }, { id: "mild", label: "Mild", points: 2 }, { id: "significant", label: "Significant", points: 3 }];
export const SEV_Q3 = [{ id: "stable", label: "Feels stable", points: 1 }, { id: "some", label: "Slightly unstable", points: 2 }, { id: "very", label: "Could give out", points: 3 }];

export const SEVERITY = [
  { grade: 1, label: "Grade I — mild", desc: "Slight overstretch. Minimal swelling, you can still bear weight or use it normally.", weeks: 4 },
  { grade: 2, label: "Grade II — moderate", desc: "Partial tear. Noticeable swelling, some instability or limited motion.", weeks: 8 },
  { grade: 3, label: "Grade III — severe", desc: "Complete tear or rupture. Significant instability — may need imaging or surgery.", weeks: 12 },
];

export const RED_FLAGS = ["Numbness or tingling", "Can't bear any weight or use the limb at all", "Visible deformity", "Fever or signs of infection"];

export const GOALS = [
  { id: "running", label: "Get back to running" },
  { id: "sport", label: "Return to my sport" },
  { id: "lifting", label: "Back to lifting heavy" },
  { id: "daily", label: "Move through my day without pain" },
];

export const PHASES = [
  { id: 1, name: "Protect & calm", focus: "Reduce pain and swelling, gentle motion", milestone: "Move without guarding or limping", share: 0.25 },
  { id: 2, name: "Restore mobility", focus: "Rebuild full range of motion", milestone: "Full pain-free range of motion", share: 0.25 },
  { id: 3, name: "Rebuild strength", focus: "Progressive resistance across the whole chain", milestone: "Single-leg control with good form", share: 0.3 },
  { id: 4, name: "Return to activity", focus: "Sport-specific movement, plyometrics", milestone: "Ready for return-to-activity testing", share: 0.2 },
];

export const AREA_GROUPS: Record<string, string[]> = {
  knee: ["knee", "hip", "ankle"],
  ankle: ["ankle", "knee", "hip"],
  hip: ["hip", "knee", "back"],
  back: ["back", "hip"],
  shoulder: ["shoulder", "back"],
};

export const CATEGORIES = ["mobility", "activation", "strength", "stability"];
export const CAT_LABELS: Record<string, string> = { mobility: "Mobility", activation: "Activation", strength: "Strength", stability: "Stability" };

// ENGINEER: computePlan is a placeholder scheduler. Swap in the real
// RocketRide pipeline output once phase lengths are generated server-side.
export function computePlan(weeks: number) {
  let start = 1;
  return PHASES.map((p) => {
    const length = Math.max(1, Math.round(weeks * p.share));
    const end = Math.min(weeks, start + length - 1);
    const phase = { ...p, startWeek: start, endWeek: end };
    start = end + 1;
    return phase;
  });
}

export function goalLabel(goal: Goal | null) {
  if (!goal || !goal.type) return "your goal";
  const base = GOALS.find((g) => g.id === goal.type);
  if (goal.type === "sport" && goal.detail) return `getting back to ${goal.detail}`;
  if (goal.type === "lifting" && goal.detail) return `lifting ${goal.detail} again`;
  return base ? base.label.toLowerCase() : "your goal";
}

// ENGINEER: the entire library below — sources, videos, tiers, avoid-tags,
// and all why/feel/goalLink copy — should come from the RocketRide
// draft -> claim-extract -> Linkup-verify -> repair pipeline, not be
// hardcoded. Avoid-tags and tiering are illustrative placeholders and
// need clinical sign-off before any real use.
export const LIBRARY: LibraryExercise[] = [
  { id: "ankle_pumps", name: "Ankle pumps", family: "Ankle mobility", tier: 1, category: "mobility", bodyAreas: ["ankle"], avoid: [], dose: "10 reps each direction · 3x/day", pose: "seated", motionType: "limb", muscleZone: [80, 55, 10], muscle: "Ankle & calf", why: "Gentle motion moves fluid out of the joint and keeps the ankle from stiffening while it heals.", feel: "A light stretch through the front and back of the ankle — no pain.", goalLink: "This early motion keeps the door open for everything later — a stiff ankle slows the whole plan down.", source: "NHS physiotherapy guidelines", video: { title: "Foundations: ankle mobility", channel: "Coach Reyes · Certified ATC" } },
  { id: "ankle_circles", name: "Ankle circles", family: "Ankle mobility", tier: 2, category: "mobility", bodyAreas: ["ankle"], avoid: [], dose: "8 circles each way · 3 sets", pose: "seated", motionType: "limb", muscleZone: [80, 55, 10], muscle: "Ankle complex", why: "Circles work the joint through every direction at once, restoring motion the sprain took away.", feel: "Smooth, even movement all the way around — note any tight corners.", goalLink: "Multi-directional range is what lets your ankle handle uneven ground again.", source: "NHS physiotherapy guidelines", video: { title: "Ankle range of motion progressions", channel: "Coach Reyes · Certified ATC" } },
  { id: "ankle_alphabet", name: "Ankle alphabet", family: "Ankle mobility", tier: 3, category: "mobility", bodyAreas: ["ankle"], avoid: [], dose: "Full alphabet · 2 sets", pose: "seated", motionType: "limb", muscleZone: [80, 55, 10], muscle: "Ankle complex", why: "Tracing letters demands fine control through the ankle's full range — mobility plus precision.", feel: "Deliberate control through every stroke, especially the diagonal letters.", goalLink: "This level of control is what quick direction changes will ask of you.", source: "APTA clinical practice guidelines", video: { title: "Advanced ankle control drills", channel: "Coach Reyes · Certified ATC" } },
  { id: "towel_scrunch", name: "Towel scrunches", family: "Foot activation", tier: 1, category: "activation", bodyAreas: ["ankle"], avoid: [], dose: "15 scrunches · 2 sets", pose: "seated", motionType: "none", muscleZone: [85, 58, 8], muscle: "Foot intrinsics", why: "Wakes up the small muscles in your foot that support the arch and take load off the ankle.", feel: "Your toes gripping and the arch of your foot working.", goalLink: "A strong foot foundation makes every standing exercise later more stable.", source: "APTA clinical practice guidelines", video: { title: "Foot intrinsic activation", channel: "Dr. Lena Cho, DPT" } },
  { id: "heel_walks", name: "Heel walks", family: "Foot activation", tier: 2, category: "activation", bodyAreas: ["ankle"], avoid: ["loaded"], dose: "20 steps · 3 sets", pose: "standing", motionType: "sway", muscleZone: [50, 75, 10], muscle: "Shin (tibialis anterior)", why: "Strengthens the front of the shin, which controls how your foot lands with every step.", feel: "Working along the front of your shin as you stay up on your heels.", goalLink: "Shin control is half of what keeps a healing ankle from rolling again.", source: "APTA clinical practice guidelines", video: { title: "Tibialis strengthening basics", channel: "Coach Reyes · Certified ATC" } },
  { id: "seated_calf", name: "Seated calf raise", family: "Calf strength", tier: 1, category: "strength", bodyAreas: ["ankle"], avoid: [], dose: "15 reps · 3 sets", pose: "seated", motionType: "limb", muscleZone: [78, 62, 10], muscle: "Soleus (deep calf)", why: "Loads the calf without full bodyweight — the safest way to start rebuilding push-off strength.", feel: "A deep working feeling low in your calf, near the Achilles.", goalLink: "Every step of a future run starts with this muscle firing.", source: "APTA clinical practice guidelines", video: { title: "Seated calf raise for early rehab", channel: "Dr. Lena Cho, DPT" } },
  { id: "standing_calf", name: "Standing calf raise", family: "Calf strength", tier: 2, category: "strength", bodyAreas: ["ankle"], avoid: ["loaded"], dose: "12 reps · 3 sets", pose: "standing", motionType: "bob", muscleZone: [50, 70, 12], muscle: "Calves", why: "Rebuilds the calf strength that absorbs impact every time your foot hits the ground.", feel: "Working through your calf as you rise, controlled all the way back down.", goalLink: "You need this before jogging or jumping feel safe again.", source: "APTA clinical practice guidelines", video: { title: "Calf strength progressions", channel: "Coach Reyes · Certified ATC" } },
  { id: "sl_calf", name: "Single-leg calf raise", family: "Calf strength", tier: 3, category: "strength", bodyAreas: ["ankle"], avoid: ["loaded"], dose: "10 reps each · 3 sets", pose: "balance", motionType: "bob", muscleZone: [52, 70, 12], muscle: "Calf, single-leg", why: "One leg carrying everything — the strength standard most return-to-run protocols look for.", feel: "Full calf effort with your balance system working alongside it.", goalLink: "Around 20 clean reps here is a common benchmark before running.", source: "British Journal of Sports Medicine guidelines", video: { title: "Single-leg calf raise standards", channel: "Dr. Lena Cho, DPT" } },
  { id: "sls_eyes_open", name: "Single-leg stance", family: "Balance", tier: 1, category: "stability", bodyAreas: ["ankle", "knee"], avoid: [], dose: "20 seconds · 3 sets", pose: "balance", motionType: "none", muscleZone: [55, 60, 12], muscle: "Ankle stabilizers", why: "Retrains the reflexes that keep your joint steady — they switch off fast after injury.", feel: "Small constant corrections around your ankle and foot.", goalLink: "This is your insurance policy against rolling it again.", source: "APTA clinical practice guidelines", video: { title: "Balance foundations", channel: "Coach Priya · CSCS" } },
  { id: "sl_balance", name: "Single-leg balance, eyes busy", family: "Balance", tier: 2, category: "stability", bodyAreas: ["ankle", "knee"], avoid: [], dose: "30 seconds · 3 sets", pose: "balance", motionType: "none", muscleZone: [55, 60, 12], muscle: "Ankle & core stabilizers", why: "Adding head turns or a ball toss makes your balance automatic instead of something you stare at.", feel: "Steady footing even while your attention is elsewhere.", goalLink: "In sport, balance has to work while you watch the play — this trains exactly that.", source: "APTA clinical practice guidelines", video: { title: "Balance and proprioception", channel: "Coach Priya · CSCS" } },
  { id: "sl_balance_pad", name: "Balance on soft surface", family: "Balance", tier: 3, category: "stability", bodyAreas: ["ankle", "knee"], avoid: [], dose: "30 seconds · 3 sets", pose: "balance", motionType: "none", muscleZone: [55, 60, 14], muscle: "Full stabilizer chain", why: "An unstable surface (pillow, foam pad) forces maximum reflex work from ankle to hip.", feel: "Everything from foot to hip making constant micro-adjustments.", goalLink: "If you're steady here, uneven trails and courts won't surprise you.", source: "British Journal of Sports Medicine guidelines", video: { title: "Advanced proprioception training", channel: "Coach Priya · CSCS" } },
  { id: "quad_sets", name: "Quad sets", family: "Knee activation", tier: 1, category: "activation", bodyAreas: ["knee"], avoid: [], dose: "10 second hold · 10 reps", pose: "seated", motionType: "none", muscleZone: [72, 58, 12], muscle: "Quadriceps", why: "Reconnects your brain to the thigh muscle that usually shuts down after a knee injury.", feel: "Tightening on top of your thigh, kneecap sliding slightly upward.", goalLink: "A quad that fires on command is the foundation every later squat and step depends on.", source: "APTA clinical practice guidelines", video: { title: "Quad activation basics", channel: "Dr. Lena Cho, DPT" } },
  { id: "slr", name: "Straight-leg raise", family: "Knee activation", tier: 2, category: "activation", bodyAreas: ["knee"], avoid: ["lying"], dose: "10 reps · 3 sets", pose: "lying", motionType: "limb", muscleZone: [70, 52, 10], muscle: "Quads & hip flexors", why: "Adds load to the quad while the knee stays protected in a straight position.", feel: "The whole front of your thigh working to keep the leg dead straight.", goalLink: "This bridges the gap between just squeezing the quad and actually using it.", source: "APTA clinical practice guidelines", video: { title: "Straight-leg raise done right", channel: "Dr. Lena Cho, DPT" } },
  { id: "tke", name: "Terminal knee extension", family: "Knee activation", tier: 3, category: "activation", bodyAreas: ["knee"], avoid: [], dose: "12 reps · 3 sets", pose: "standing", motionType: "limb", muscleZone: [55, 62, 10], muscle: "Inner quad (VMO)", why: "Targets the last few degrees of straightening — the range that controls kneecap tracking.", feel: "A strong squeeze just above and inside your kneecap as the band resists.", goalLink: "Full, strong extension is what makes stairs and downhill walking feel normal again.", source: "APTA clinical practice guidelines", video: { title: "TKE with band", channel: "Dr. Lena Cho, DPT" } },
  { id: "heel_slides", name: "Heel slides", family: "Knee mobility", tier: 1, category: "mobility", bodyAreas: ["knee"], avoid: ["lying"], dose: "10 reps · 3 sets", pose: "lying", motionType: "limb", muscleZone: [65, 68, 10], muscle: "Hamstrings & knee", why: "Restores the bend in your knee you need to walk, sit, and climb stairs normally.", feel: "A gentle stretch behind the knee as it bends — stop short of sharp pain.", goalLink: "Full bend now means normal walking sooner, and everything after this is built on that.", source: "APTA clinical practice guidelines", video: { title: "Knee range of motion: heel slides", channel: "Coach Reyes · Certified ATC" } },
  { id: "wall_slide_knee", name: "Wall-supported knee bends", family: "Knee mobility", tier: 2, category: "mobility", bodyAreas: ["knee"], avoid: [], dose: "10 reps · 3 sets", pose: "squat", motionType: "bob", muscleZone: [52, 62, 10], muscle: "Knee through range", why: "Adds gentle weight-bearing to the bend, teaching the knee to move under real load.", feel: "Controlled bending with your back supported — smooth, no catching.", goalLink: "This is the stepping stone from lying exercises to real squatting.", source: "NHS physiotherapy guidelines", video: { title: "Supported knee bends", channel: "Coach Reyes · Certified ATC" } },
  { id: "wall_sit", name: "Wall sit", family: "Squat pattern", tier: 1, category: "strength", bodyAreas: ["knee", "hip"], avoid: [], dose: "20 second hold · 3 sets", pose: "squat", motionType: "none", muscleZone: [52, 62, 12], muscle: "Quads, isometric", why: "Builds quad strength with zero movement — maximum work, minimum joint stress.", feel: "A growing burn through the front of both thighs while everything stays still.", goalLink: "Isometric strength is the safest first deposit toward your squat coming back.", source: "Mayo Clinic sports medicine", video: { title: "Wall sit fundamentals", channel: "Dr. Lena Cho, DPT" } },
  { id: "bw_squat", name: "Bodyweight squat", family: "Squat pattern", tier: 2, category: "strength", bodyAreas: ["knee", "hip"], avoid: [], dose: "10 reps · 3 sets", pose: "squat", motionType: "bob", muscleZone: [50, 65, 14], muscle: "Quads & glutes", why: "The building block for every functional movement — sitting, standing, lifting, climbing.", feel: "Working through the front of your thighs and glutes, knees tracking over your toes.", goalLink: "This is the strength base everything from stairs to your long-term goal is built on.", source: "Mayo Clinic sports medicine", video: { title: "Squat mechanics for recovery", channel: "Dr. Lena Cho, DPT" } },
  { id: "split_squat", name: "Split squat", family: "Squat pattern", tier: 3, category: "strength", bodyAreas: ["knee", "hip"], avoid: ["stairs"], dose: "8 reps each · 3 sets", pose: "lunge", motionType: "bob", muscleZone: [55, 60, 12], muscle: "Quads & glutes, single-leg bias", why: "Shifts most of the load to one leg — closer to how sport and stairs actually load you.", feel: "Front-leg quad and glute doing most of the work; back leg just balances.", goalLink: "Single-leg strength is the real test of whether your leg is back.", source: "British Journal of Sports Medicine guidelines", video: { title: "Split squat progressions", channel: "Coach Priya · CSCS" } },
  { id: "step_ups", name: "Step-ups", family: "Squat pattern", tier: 3, category: "strength", bodyAreas: ["knee", "hip"], avoid: ["stairs"], dose: "10 reps each · 3 sets", pose: "stepUp", motionType: "bob", muscleZone: [55, 55, 12], muscle: "Quads & glutes", why: "A single-leg strength test that mimics stairs, hiking, and most sports movements.", feel: "Driving up through your whole leg, not pushing off your back foot.", goalLink: "If you can step up with control, you're close to full function.", source: "APTA return-to-sport guidelines", video: { title: "Single-leg strength: step-ups", channel: "Dr. Lena Cho, DPT" } },
  { id: "clamshells", name: "Clamshells", family: "Hip abduction", tier: 1, category: "activation", bodyAreas: ["hip", "knee", "ankle"], avoid: [], dose: "12 reps · 3 sets", pose: "clamshell", motionType: "limb", muscleZone: [70, 55, 10], muscle: "Glute medius (outer hip)", why: "Wakes up the outer-hip muscle that keeps your knee and ankle lined up correctly.", feel: "Working in the outer edge of your hip as your top knee lifts.", goalLink: "This is the muscle that stops your knee caving in once you're back to running or cutting.", source: "APTA clinical practice guidelines", video: { title: "Hip stability: clamshells", channel: "Coach Priya · CSCS" } },
  { id: "side_leg_raise", name: "Side-lying leg raise", family: "Hip abduction", tier: 2, category: "activation", bodyAreas: ["hip"], avoid: [], dose: "12 reps · 3 sets", pose: "clamshell", motionType: "limb", muscleZone: [72, 58, 10], muscle: "Glute medius", why: "A longer lever than clamshells — more load on the outer hip once activation isn't enough.", feel: "Working along the outer edge of your hip as your straight leg lifts.", goalLink: "Stronger here means your stride stays level and controlled at full speed.", source: "APTA clinical practice guidelines", video: { title: "Hip strength: side-lying leg raise", channel: "Coach Priya · CSCS" } },
  { id: "lat_band_walk", name: "Lateral band walk", family: "Hip abduction", tier: 3, category: "activation", bodyAreas: ["hip", "knee"], avoid: [], dose: "10 steps each way · 3 sets", pose: "band", motionType: "sway", muscleZone: [60, 65, 12], muscle: "Glute medius, loaded", why: "Trains your hip to control your knee under real, multi-directional load.", feel: "Steady tension across your outer hips with every step.", goalLink: "This is what return-to-sport movement actually asks of your body.", source: "British Journal of Sports Medicine guidelines", video: { title: "Return to sport: lateral strength", channel: "Coach Reyes · Certified ATC" } },
  { id: "glute_bridge", name: "Glute bridge", family: "Posterior chain", tier: 1, category: "strength", bodyAreas: ["hip", "back", "knee"], avoid: [], dose: "10 reps · 3 sets", pose: "bridge", motionType: "limb", muscleZone: [60, 50, 10], muscle: "Glutes & hamstrings", why: "Gets your glutes sharing the load early, instead of the injured joint doing all the work.", feel: "A squeeze through your glutes and back of your hips — not your lower back.", goalLink: "Strong glutes protect your knee, hip, and back through every phase that follows.", source: "APTA clinical practice guidelines", video: { title: "Glute activation for early rehab", channel: "Dr. Lena Cho, DPT" } },
  { id: "bridge_march", name: "Glute bridge march", family: "Posterior chain", tier: 2, category: "strength", bodyAreas: ["hip", "back"], avoid: [], dose: "8 marches each · 3 sets", pose: "bridge", motionType: "limb", muscleZone: [60, 50, 10], muscle: "Glutes & deep core", why: "Lifting one foot mid-bridge forces each hip to hold its own — no more sharing the load.", feel: "One glute holding steady while the other leg marches; hips stay level.", goalLink: "Level hips under single-leg load is the pattern running is built on.", source: "APTA clinical practice guidelines", video: { title: "Bridge march progressions", channel: "Coach Priya · CSCS" } },
  { id: "sl_rdl", name: "Single-leg RDL", family: "Posterior chain", tier: 3, category: "strength", bodyAreas: ["hip", "back", "knee"], avoid: [], dose: "8 reps each · 3 sets", pose: "rdl", motionType: "limb", muscleZone: [60, 60, 12], muscle: "Hamstrings & glutes", why: "Builds the back-of-leg strength and balance you need for cutting, sprinting, and lifting safely.", feel: "A stretch, then a controlled squeeze through your hamstring and glute as you hinge.", goalLink: "This ties your whole posterior chain together for whatever you're heading back to.", source: "British Journal of Sports Medicine guidelines", video: { title: "Single-leg RDL technique", channel: "Coach Priya · CSCS" } },
  { id: "hip_flexor_stretch", name: "Hip flexor stretch", family: "Hip mobility", tier: 1, category: "mobility", bodyAreas: ["hip", "back"], avoid: [], dose: "30 second hold · 3 sets", pose: "lunge", motionType: "none", muscleZone: [45, 68, 10], muscle: "Hip flexors", why: "Loosens the front of the hip, which tightens up after any lower-body injury or time spent sitting.", feel: "A stretch through the front of your back hip, not your lower back.", goalLink: "A loose hip flexor lets your glutes do their job instead of compensating for them.", source: "NIH / NIAMS patient guidance", video: { title: "8-minute hip mobility flow", channel: "Coach Priya · CSCS" } },
  { id: "couch_stretch", name: "Elevated hip flexor stretch", family: "Hip mobility", tier: 2, category: "mobility", bodyAreas: ["hip"], avoid: [], dose: "45 second hold · 2 sets", pose: "lunge", motionType: "none", muscleZone: [45, 65, 10], muscle: "Hip flexors & quad", why: "Elevating the back foot deepens the stretch into the quad as well as the hip.", feel: "A stronger stretch down the whole front of the back leg.", goalLink: "Full hip extension is what a powerful stride borrows from.", source: "NIH / NIAMS patient guidance", video: { title: "Deep hip flexor mobility", channel: "Coach Priya · CSCS" } },
  { id: "ninety_ninety", name: "90/90 hip switches", family: "Hip mobility", tier: 3, category: "mobility", bodyAreas: ["hip"], avoid: [], dose: "8 switches · 2 sets", pose: "seated", motionType: "limb", muscleZone: [65, 58, 12], muscle: "Hip rotators", why: "Trains internal and external hip rotation together — the ranges sport actually uses.", feel: "Both hips rotating through their sockets; deep, unfamiliar muscles working.", goalLink: "Rotation is where cutting, pivoting, and squatting depth come from.", source: "British Journal of Sports Medicine guidelines", video: { title: "90/90 hip mobility", channel: "Coach Priya · CSCS" } },
  { id: "pelvic_tilt", name: "Pelvic tilts", family: "Spine mobility", tier: 1, category: "mobility", bodyAreas: ["back"], avoid: ["lying"], dose: "10 reps · 3 sets", pose: "bridge", motionType: "none", muscleZone: [48, 58, 10], muscle: "Deep core & lower back", why: "Gently rocks the lower back through small ranges, easing stiffness without strain.", feel: "Your lower back pressing into and away from the floor, slow and small.", goalLink: "Comfortable small movement now is what earns bigger movement later.", source: "NHS physiotherapy guidelines", video: { title: "Pelvic tilt basics", channel: "Dr. Lena Cho, DPT" } },
  { id: "cat_cow", name: "Cat-cow", family: "Spine mobility", tier: 2, category: "mobility", bodyAreas: ["back"], avoid: [], dose: "10 cycles · 2 sets", pose: "birddog", motionType: "bob", muscleZone: [50, 45, 12], muscle: "Whole spine", why: "Moves every segment of the spine through flexion and extension in a safe, supported position.", feel: "A wave of movement traveling along your spine, one segment at a time.", goalLink: "A spine that moves segment by segment handles load far better than a stiff one.", source: "Mayo Clinic sports medicine", video: { title: "Cat-cow done well", channel: "Coach Priya · CSCS" } },
  { id: "core_brace", name: "Core brace breathing", family: "Core control", tier: 1, category: "stability", bodyAreas: ["back", "hip"], avoid: [], dose: "5 breaths · 3 sets", pose: "bridge", motionType: "none", muscleZone: [48, 55, 10], muscle: "Deep core (transverse abdominis)", why: "Teaches the deep corset muscle to switch on before movement — the base of all spine protection.", feel: "A gentle 360-degree tightening around your waist as you exhale.", goalLink: "Every loaded exercise later assumes this brace is automatic.", source: "APTA clinical practice guidelines", video: { title: "Breathing and bracing basics", channel: "Dr. Lena Cho, DPT" } },
  { id: "bird_dog", name: "Bird-dog", family: "Core control", tier: 2, category: "stability", bodyAreas: ["back", "hip"], avoid: [], dose: "8 reps each side · 3 sets", pose: "birddog", motionType: "limb", muscleZone: [50, 45, 12], muscle: "Core & glutes together", why: "Opposite arm and leg reaching forces your core to resist twisting — real-world stability.", feel: "Torso locked still while your limbs move; nothing sags or rotates.", goalLink: "A trunk that doesn't leak energy makes every lift and stride stronger.", source: "APTA clinical practice guidelines", video: { title: "Bird-dog fundamentals", channel: "Dr. Lena Cho, DPT" } },
  { id: "dead_bug", name: "Dead bug", family: "Core control", tier: 2, category: "stability", bodyAreas: ["back"], avoid: ["lying"], dose: "8 reps each side · 3 sets", pose: "lying", motionType: "limb", muscleZone: [45, 50, 10], muscle: "Deep core", why: "Trains the core to hold the spine still while arms and legs move independently.", feel: "Lower back staying glued down as your limbs lower away.", goalLink: "This anti-movement control is what protects your back under fatigue.", source: "APTA clinical practice guidelines", video: { title: "Dead bug progressions", channel: "Dr. Lena Cho, DPT" } },
  { id: "pallof", name: "Pallof press", family: "Core control", tier: 3, category: "stability", bodyAreas: ["back", "hip"], avoid: [], dose: "10 presses each side · 3 sets", pose: "standing", motionType: "limb", muscleZone: [50, 48, 12], muscle: "Anti-rotation core", why: "The band tries to twist you; your core refuses. Standing anti-rotation under real load.", feel: "Your whole midsection bracing against the sideways pull.", goalLink: "Rotation control is the difference between a strong core and a sport-ready one.", source: "British Journal of Sports Medicine guidelines", video: { title: "Pallof press technique", channel: "Coach Priya · CSCS" } },
  { id: "pendulum", name: "Pendulum swings", family: "Shoulder mobility", tier: 1, category: "mobility", bodyAreas: ["shoulder"], avoid: [], dose: "30 seconds each direction", pose: "rdl", motionType: "limb", muscleZone: [45, 40, 10], muscle: "Shoulder capsule", why: "Gravity does the work — gentle motion for the joint with zero muscular strain.", feel: "The arm hanging heavy and swinging freely, shoulder totally relaxed.", goalLink: "Relaxed motion now prevents the frozen stiffness that stalls shoulder recovery.", source: "NHS physiotherapy guidelines", video: { title: "Pendulum swings for early shoulder rehab", channel: "Dr. Lena Cho, DPT" } },
  { id: "wall_slides_sh", name: "Wall slides", family: "Shoulder mobility", tier: 2, category: "mobility", bodyAreas: ["shoulder"], avoid: [], dose: "10 slides · 3 sets", pose: "standing", motionType: "limb", muscleZone: [50, 35, 10], muscle: "Shoulder & shoulder blade", why: "The wall guides the arm overhead along a safe path while the shoulder blade learns to glide.", feel: "Shoulder blades sliding up and around the ribcage as your arms rise.", goalLink: "Clean overhead motion is the gateway to pressing, throwing, and swimming again.", source: "APTA clinical practice guidelines", video: { title: "Wall slides for overhead mobility", channel: "Coach Reyes · Certified ATC" } },
  { id: "scap_squeeze", name: "Shoulder blade squeezes", family: "Shoulder activation", tier: 1, category: "activation", bodyAreas: ["shoulder"], avoid: [], dose: "10 second hold · 10 reps", pose: "seated", motionType: "none", muscleZone: [45, 38, 10], muscle: "Mid-back (rhomboids & traps)", why: "Wakes up the muscles that anchor your shoulder blade — the platform the whole shoulder works from.", feel: "Squeezing a pencil between your shoulder blades, chest staying tall.", goalLink: "A stable shoulder blade is what every press and pull later stands on.", source: "APTA clinical practice guidelines", video: { title: "Scapular activation basics", channel: "Dr. Lena Cho, DPT" } },
  { id: "band_er", name: "Band external rotation", family: "Shoulder activation", tier: 2, category: "activation", bodyAreas: ["shoulder"], avoid: [], dose: "12 reps · 3 sets", pose: "standing", motionType: "limb", muscleZone: [55, 38, 10], muscle: "Rotator cuff", why: "Directly strengthens the small cuff muscles that keep the ball centered in the socket.", feel: "Working deep in the back of your shoulder as your forearm rotates out.", goalLink: "A strong cuff is what makes the big shoulder muscles safe to use hard.", source: "APTA clinical practice guidelines", video: { title: "Rotator cuff band work", channel: "Coach Reyes · Certified ATC" } },
  { id: "wall_pushup", name: "Wall push-up", family: "Push pattern", tier: 1, category: "strength", bodyAreas: ["shoulder"], avoid: [], dose: "10 reps · 3 sets", pose: "standing", motionType: "sway", muscleZone: [48, 40, 10], muscle: "Chest & shoulders", why: "A pressing pattern at a fraction of bodyweight — strength work the healing shoulder can accept.", feel: "Chest and front of shoulders working; shoulder blades moving freely.", goalLink: "The first rung on the ladder back to full push-ups and pressing.", source: "NHS physiotherapy guidelines", video: { title: "Wall push-up progressions", channel: "Dr. Lena Cho, DPT" } },
  { id: "row_band", name: "Band rows", family: "Pull pattern", tier: 2, category: "strength", bodyAreas: ["shoulder", "back"], avoid: [], dose: "12 reps · 3 sets", pose: "seated", motionType: "limb", muscleZone: [48, 42, 10], muscle: "Mid-back & rear shoulder", why: "Balances all the pressing in daily life and pulls the shoulder into healthier posture.", feel: "Shoulder blades drawing together as your elbows travel back.", goalLink: "Pulling strength keeps the shoulder balanced as pressing loads return.", source: "APTA clinical practice guidelines", video: { title: "Band row technique", channel: "Coach Reyes · Certified ATC" } },
  { id: "pushup_plus", name: "Push-up plus", family: "Push pattern", tier: 3, category: "strength", bodyAreas: ["shoulder"], avoid: [], dose: "8 reps · 3 sets", pose: "birddog", motionType: "bob", muscleZone: [50, 40, 12], muscle: "Serratus & chest", why: "The extra push at the top trains the serratus — the muscle that keeps the shoulder blade hugging the ribs.", feel: "A final rounding push at the top of each rep, upper back spreading wide.", goalLink: "Serratus strength is the last piece of a shoulder that's truly ready for load.", source: "British Journal of Sports Medicine guidelines", video: { title: "Push-up plus for serratus", channel: "Coach Priya · CSCS" } },
];

export const HOWTO: Record<string, string[]> = {
  ankle_pumps: ["Sit with your leg supported.", "Point your toes up toward you, then away.", "Move slowly through the full range you can manage."],
  ankle_circles: ["Sit with your leg supported, heel off the ground.", "Draw slow circles with your toes, full range.", "Reverse direction halfway through."],
  ankle_alphabet: ["Sit with your leg supported, heel floating.", "Trace each letter of the alphabet with your big toe.", "Keep the movement in the ankle, not the knee."],
  towel_scrunch: ["Sit with your bare foot on a towel.", "Scrunch the towel toward you using only your toes.", "Reset the towel and repeat."],
  heel_walks: ["Lift your toes so you're standing on your heels.", "Walk forward taking short steps.", "Keep your toes pulled up the whole time."],
  seated_calf: ["Sit with feet flat, weight or hands on your knees.", "Press through the balls of your feet to lift your heels.", "Lower slowly with control."],
  standing_calf: ["Stand near a wall or chair for balance.", "Rise up onto your toes slowly.", "Lower back down with control."],
  sl_calf: ["Stand on one leg near support.", "Rise onto your toes using only that leg.", "Lower over a slow three-count."],
  sls_eyes_open: ["Stand on one leg, knee soft.", "Keep your hips level and gaze steady ahead.", "Hold, then switch sides."],
  sl_balance: ["Stand on one leg, knee soft.", "Turn your head slowly side to side, or toss a ball hand to hand.", "Keep the standing foot quiet."],
  sl_balance_pad: ["Place a pillow or foam pad on the floor.", "Stand on it with one leg, knee soft.", "Hold steady; add head turns when it feels easy."],
  quad_sets: ["Sit or lie with the leg straight.", "Tighten the muscle on top of your thigh, pressing the back of your knee down.", "Hold, then relax."],
  slr: ["Lie on your back, one knee bent, injured leg straight.", "Tighten the thigh and lift the straight leg to the height of the other knee.", "Lower slowly without letting the knee bend."],
  tke: ["Loop a band behind your knee, anchored in front of you.", "Start with the knee slightly bent.", "Straighten fully against the band, squeezing the thigh."],
  heel_slides: ["Lie on your back, both legs straight.", "Slide one heel toward your hip, bending the knee.", "Slide back out slowly."],
  wall_slide_knee: ["Stand with your back against a wall.", "Slide down a few inches, bending the knees.", "Slide back up smoothly. Deepen only as comfort allows."],
  wall_sit: ["Back flat against a wall, feet out in front.", "Slide down until thighs approach parallel-ish, comfortable depth.", "Hold, breathing steadily."],
  bw_squat: ["Stand with feet shoulder-width apart.", "Bend your knees and hips like sitting into a chair.", "Keep your chest up, then stand back up."],
  split_squat: ["Take a long step forward, feet hip-width for balance.", "Lower the back knee toward the floor.", "Drive up through the front heel."],
  step_ups: ["Step fully onto a stable platform with one leg.", "Drive up through that leg until you're standing on it.", "Step back down with control, don't just fall back."],
  clamshells: ["Lie on your side, knees bent, feet together.", "Keeping feet touching, lift your top knee like a clamshell opening.", "Lower with control."],
  side_leg_raise: ["Lie on your side, legs stacked and straight.", "Lift your top leg toward the ceiling, keeping it in line with your body.", "Lower with control."],
  lat_band_walk: ["Loop a band around your ankles, feet hip-width apart.", "Bend your knees slightly and step sideways, keeping tension on the band.", "Step the same number of times both directions."],
  glute_bridge: ["Lie on your back, knees bent, feet flat.", "Squeeze your glutes and lift your hips up.", "Lower with control."],
  bridge_march: ["Hold the top of a glute bridge.", "Lift one foot a few inches without letting the hips tilt.", "Set it down, switch sides."],
  sl_rdl: ["Stand on one leg, slight bend in the knee.", "Hinge forward at the hips, letting the other leg extend behind you.", "Squeeze your glute to return upright."],
  hip_flexor_stretch: ["Kneel with one foot forward, knee at 90 degrees.", "Shift your hips forward gently until you feel a stretch in the front of the back hip.", "Keep your torso upright."],
  couch_stretch: ["Kneel with your back foot elevated on a couch or bench.", "Shift hips forward, torso tall.", "Breathe into the stretch — don't force depth."],
  ninety_ninety: ["Sit with both knees bent at 90 degrees, one in front, one to the side.", "Rotate both knees to the other side without using your hands.", "Keep your chest tall as you switch."],
  pelvic_tilt: ["Lie on your back, knees bent.", "Flatten your lower back into the floor, then arch it slightly away.", "Rock slowly between the two."],
  cat_cow: ["Start on hands and knees.", "Round your spine up toward the ceiling, then let it sink into an arch.", "Move slowly, one breath per cycle."],
  core_brace: ["Lie on your back, knees bent.", "Exhale slowly and gently draw your waist inward all the way around.", "Hold the brace while breathing shallowly, then release."],
  bird_dog: ["Start on hands and knees, back flat.", "Reach one arm forward and the opposite leg back.", "Return with control; nothing tilts or sags."],
  dead_bug: ["Lie on your back, arms up, knees over hips.", "Lower one arm and the opposite leg toward the floor.", "Return and switch sides; lower back stays down."],
  pallof: ["Anchor a band at chest height, stand side-on, hands at your chest.", "Press your hands straight out and hold.", "Resist the band's twist, then return."],
  pendulum: ["Lean forward, supporting yourself on a table.", "Let the injured arm hang completely relaxed.", "Swing it gently in small circles and lines."],
  wall_slides_sh: ["Stand facing a wall, forearms on it, elbows shoulder-height.", "Slide your arms up the wall as far as comfortable.", "Slide back down with control."],
  scap_squeeze: ["Sit or stand tall.", "Draw your shoulder blades back and down together.", "Hold, then release slowly."],
  band_er: ["Elbow tucked at your side, bent 90 degrees, holding a band.", "Rotate your forearm outward against the band.", "Return slowly; elbow stays glued to your side."],
  wall_pushup: ["Hands on a wall at shoulder height, feet back a step.", "Lower your chest toward the wall.", "Press back to the start."],
  row_band: ["Anchor a band in front of you, arms extended.", "Pull your elbows back past your ribs.", "Squeeze the shoulder blades, then return slowly."],
  pushup_plus: ["Start in a push-up position (knees down is fine).", "Do a push-up, then at the top, push the floor away a little further.", "Feel your upper back spread wide at the top."],
};

export const POSES: Record<string, Pose> = {
  seated: { ground: true, head: [50, 20], lines: [[50, 28, 50, 55], [50, 55, 70, 60], [70, 60, 85, 58], [50, 35, 40, 50], [50, 55, 45, 75], [45, 75, 40, 80]], anim: { origin: [70, 60], lineIdx: [2] } },
  lying: { ground: true, head: [22, 55], lines: [[30, 55, 60, 55], [60, 55, 85, 55], [60, 55, 68, 70], [68, 70, 55, 75], [40, 55, 40, 68]], anim: { origin: [60, 55], lineIdx: [2, 3] } },
  lunge: { ground: true, head: [50, 25], lines: [[50, 33, 55, 55], [55, 55, 68, 58], [68, 58, 72, 80], [55, 55, 45, 70], [45, 70, 40, 82], [52, 45, 65, 58]] },
  standing: { ground: true, head: [50, 18], lines: [[50, 26, 50, 55], [50, 55, 42, 78], [42, 78, 40, 82], [50, 55, 58, 78], [58, 78, 60, 82], [50, 32, 38, 45], [50, 32, 62, 45]], anim: { origin: [50, 32], lineIdx: [6] } },
  squat: { ground: true, head: [50, 30], lines: [[50, 38, 52, 58], [52, 58, 40, 65], [40, 65, 42, 80], [52, 58, 64, 65], [64, 65, 62, 80], [50, 42, 30, 45], [50, 42, 70, 45]] },
  balance: { ground: true, head: [50, 20], lines: [[50, 28, 50, 55], [50, 55, 50, 80], [50, 55, 60, 60], [60, 60, 55, 50], [50, 35, 30, 38], [50, 35, 70, 38]] },
  band: { ground: true, dashed: [32, 80, 68, 80], head: [50, 25], lines: [[50, 33, 50, 58], [50, 58, 35, 68], [35, 68, 32, 80], [50, 58, 65, 68], [65, 68, 68, 80], [50, 40, 32, 45], [50, 40, 68, 45]] },
  stepUp: { ground: true, step: [55, 72, 25, 10], head: [45, 20], lines: [[45, 28, 48, 55], [48, 55, 60, 50], [60, 50, 65, 40], [48, 55, 40, 75], [40, 75, 38, 82]] },
  bridge: { ground: true, head: [22, 60], lines: [[30, 60, 55, 60], [55, 60, 62, 50], [62, 50, 72, 58], [72, 58, 78, 72], [40, 60, 40, 70]], anim: { origin: [55, 60], lineIdx: [1] } },
  clamshell: { ground: false, head: [30, 25], lines: [[35, 30, 55, 50], [55, 50, 65, 62], [65, 62, 58, 75], [55, 50, 70, 55], [70, 55, 80, 45]], anim: { origin: [55, 50], lineIdx: [3, 4] } },
  rdl: { ground: true, head: [35, 25], lines: [[35, 33, 50, 55], [50, 55, 48, 75], [50, 55, 65, 50], [65, 50, 78, 45], [50, 42, 42, 60]], anim: { origin: [50, 55], lineIdx: [2, 3] } },
  birddog: { ground: true, head: [25, 42], lines: [[32, 45, 62, 45], [38, 45, 38, 62], [58, 45, 58, 62], [62, 45, 80, 40], [32, 45, 15, 40]], anim: { origin: [62, 45], lineIdx: [3] } },
};
// ENGINEER: selection engine below is a deterministic placeholder for the
// real RocketRide-generated plan. Keep its three principles when replacing:
// (1) cover every category across the kinetic chain, (2) rotate variants
// day to day within the earned tier, (3) deprioritize (never silently
// drop) exercises matching the user's own reported aggravators.
export function eligibleFor(category: string, tiers: Tiers, bodyArea: string, aggravatorTags: string[]) {
  const group = AREA_GROUPS[bodyArea] || [bodyArea];
  const tierCap = tiers[category];
  const pool = LIBRARY.filter((e) => e.category === category && e.tier <= tierCap && e.bodyAreas.some((a) => group.includes(a)));
  const clean = pool.filter((e) => !e.avoid.some((t) => aggravatorTags.includes(t)));
  const usable = clean.length ? clean : pool;
  const atTier = usable.filter((e) => e.tier === tierCap);
  return { primary: atTier.length ? atTier : usable, flagged: pool.filter((e) => e.avoid.some((t) => aggravatorTags.includes(t))).map((e) => e.id) };
}

export function pickToday(day: number, tiers: Tiers, bodyArea: string, aggravators: string[]) {
  const aggravatorTags = aggravators.map((a) => AGG_TO_TAG[a]).filter(Boolean);
  const picked: LibraryExercise[] = [];
  const flaggedIds = new Set<string>();
  CATEGORIES.forEach((cat, ci) => {
    const { primary, flagged } = eligibleFor(cat, tiers, bodyArea, aggravatorTags);
    flagged.forEach((id) => flaggedIds.add(id));
    if (primary.length) {
      const idx = (day + ci) % primary.length;
      picked.push(primary[idx]);
    }
  });
  const { primary: extraPool } = eligibleFor("strength", tiers, bodyArea, aggravatorTags);
  const extra = extraPool.find((e) => !picked.some((p) => p.id === e.id));
  if (extra) picked.push(extra);
  return { picked: picked.slice(0, 5), flaggedIds };
}
