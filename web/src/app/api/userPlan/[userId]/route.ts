import { supabaseAdmin } from "@/lib/supabase";
import type { UserPlan } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  const supabase = supabaseAdmin();

  const [planResult, checkInsResult] = await Promise.all([
    supabase.from("plans").select().eq("user_id", userId).maybeSingle(),
    supabase
      .from("check_ins")
      .select("pain_level, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: true }),
  ]);

  if (planResult.error) {
    return Response.json({ error: planResult.error.message }, { status: 500 });
  }
  if (!planResult.data) {
    return Response.json({ error: "User not found" }, { status: 404 });
  }
  if (checkInsResult.error) {
    return Response.json(
      { error: checkInsResult.error.message },
      { status: 500 }
    );
  }

  const row = planResult.data;
  const userPlan: UserPlan = {
    userId,
    plan: {
      userId,
      planId: row.id,
      exercises: row.exercises,
      sourceNotes: row.source_notes,
      updatedAt: row.updated_at,
    },
    progressHistory: checkInsResult.data.map((c) => ({
      pain: c.pain_level,
      date: c.created_at.slice(0, 10),
    })),
  };
  return Response.json(userPlan);
}
