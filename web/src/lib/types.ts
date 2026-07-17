export const INJURY_TYPES = [
  "ankle",
  "knee",
  "shoulder",
  "elbow",
  "wrist",
  "lower_back",
  "neck",
  "hip",
  "hamstring",
  "calf",
  "shin",
  "groin",
  "foot",
  "hand",
] as const;

export type InjuryType = (typeof INJURY_TYPES)[number];

export interface User {
  userId: string;
  name: string;
  injuryType: InjuryType;
  painLevel: number;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  injuryType: InjuryType;
  painLevel: number;
}

export interface CheckInInput {
  painLevel: number;
  notes?: string;
}

export interface Exercise {
  name: string;
  sets: number;
  reps: number;
  description: string;
}

export interface ProgressEntry {
  pain: number;
  date: string;
}

export interface PlanSummary {
  userId: string;
  planId: string;
  exercises: Exercise[];
  sourceNotes: string | null;
  updatedAt: string;
}

export interface UserPlan {
  userId: string;
  plan: PlanSummary;
  progressHistory: ProgressEntry[];
}
