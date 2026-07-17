export interface User {
  userId: string;
  name: string;
  injuryType: string;
  painLevel: number;
  createdAt: string;
}

export interface CreateUserInput {
  name: string;
  injuryType: string;
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
  planVersion: number;
  focus: string;
  exercises: Exercise[];
  updatedAt: string;
}

export interface UserPlan {
  userId: string;
  plan: PlanSummary;
  progressHistory: ProgressEntry[];
}
