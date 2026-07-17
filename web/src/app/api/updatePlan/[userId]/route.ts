import { supabaseAdmin } from "@/lib/supabase";
import type { CheckInInput, PlanSummary } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  let body: Partial<CheckInInput>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { painLevel, notes } = body;
  if (typeof painLevel !== "number" || painLevel < 0 || painLevel > 10) {
    return Response.json(
      { error: "painLevel is required and must be a number from 0 to 10" },
      { status: 400 }
    );
  }

  const supabase = supabaseAdmin();

  const { data: existing, error: existingError } = await supabase
    .from("plans")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();
  if (existingError) {
    return Response.json({ error: existingError.message }, { status: 500 });
  }
  if (!existing) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }

  const { error: checkInError } = await supabase
    .from("check_ins")
    .insert({ user_id: userId, pain_level: painLevel, notes: notes ?? null });
  if (checkInError) {
    return Response.json({ error: checkInError.message }, { status: 500 });
  }

  // Exercises are carried over unchanged for now; RocketRide will regenerate
  // them from the check-in once wired in
  const { data: row, error: updateError } = await supabase
    .from("plans")
    .update({
      source_notes: notes ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .select()
    .single();
  if (updateError) {
    return Response.json({ error: updateError.message }, { status: 500 });
  }

  const plan: PlanSummary = {
    userId,
    planId: row.id,
    exercises: row.exercises,
    sourceNotes: row.source_notes,
    updatedAt: row.updated_at,
  };
  return Response.json({
    ...plan,
    checkIn: { painLevel, notes: notes ?? null },
  });
}
