import type { PlanSummary, ProgressEntry } from "./types";

// Stub data used by the API routes until the database and RocketRide
// pipeline are wired in.

export function mockPlan(userId: string, planVersion = 1): PlanSummary {
  return {
    userId,
    planVersion,
    focus: "Mobility and pain reduction",
    exercises: [
      {
        name: "Ankle circles",
        sets: 3,
        reps: 10,
        description: "Slow controlled circles in each direction.",
      },
      {
        name: "Calf raises",
        sets: 3,
        reps: 12,
        description: "Raise heels off the ground, hold briefly, lower slowly.",
      },
      {
        name: "Resistance band dorsiflexion",
        sets: 2,
        reps: 15,
        description: "Pull toes toward shin against band resistance.",
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function mockProgressHistory(): ProgressEntry[] {
  const today = new Date();
  const daysAgo = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - n);
    return d.toISOString().slice(0, 10);
  };
  return [
    { pain: 7, date: daysAgo(14) },
    { pain: 6, date: daysAgo(10) },
    { pain: 6, date: daysAgo(7) },
    { pain: 4, date: daysAgo(3) },
    { pain: 3, date: daysAgo(0) },
  ];
}
