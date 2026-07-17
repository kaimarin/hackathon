import { mockPlan } from "@/lib/mock";
import type { CheckInInput } from "@/lib/types";

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

  // Stub: record the check-in and regenerate the plan via RocketRide once wired in
  const plan = mockPlan(userId, 2);

  return Response.json({
    ...plan,
    checkIn: { painLevel, notes: notes ?? null },
  });
}
