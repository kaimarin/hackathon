import type { Exercise } from "./types";

// Starter plan content used until RocketRide plan generation is wired in.
export function starterExercises(): Exercise[] {
  return [
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
  ];
}
