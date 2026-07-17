import { supabaseAdmin } from "@/lib/supabase";
import { starterExercises } from "@/lib/mock";
import { INJURY_TYPES, type CreateUserInput, type User } from "@/lib/types";

export async function POST(request: Request) {
  let body: Partial<CreateUserInput>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { name, injuryType, painLevel } = body;
  if (!name || !injuryType || typeof painLevel !== "number") {
    return Response.json(
      { error: "name, injuryType, and painLevel are required" },
      { status: 400 }
    );
  }
  if (!INJURY_TYPES.includes(injuryType)) {
    return Response.json(
      { error: `injuryType must be one of: ${INJURY_TYPES.join(", ")}` },
      { status: 400 }
    );
  }
  if (painLevel < 0 || painLevel > 10) {
    return Response.json(
      { error: "painLevel must be a number from 0 to 10" },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  const { data: row, error } = await supabase
    .from("users")
    .insert({ name, injury_type: injuryType, initial_pain_level: painLevel })
    .select()
    .single();
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Starter plan content until RocketRide generation is wired in
  const [{ error: planError }, { error: checkInError }] = await Promise.all([
    supabase.from("plans").insert({
      user_id: row.id,
      exercises: starterExercises(),
      source_notes: "Starter plan from intake",
    }),
    supabase.from("check_ins").insert({ user_id: row.id, pain_level: painLevel }),
  ]);
  if (planError || checkInError) {
    return Response.json(
      { error: (planError ?? checkInError)!.message },
      { status: 500 }
    );
  }

  const user: User = {
    userId: row.id,
    name: row.name,
    injuryType: row.injury_type,
    painLevel: row.initial_pain_level,
    createdAt: row.created_at,
  };
  return Response.json(user, { status: 201 });
}
