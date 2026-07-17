import { mockPlan, mockProgressHistory } from "@/lib/mock";
import type { UserPlan } from "@/lib/types";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params;

  // Stub: fetch from database once it's wired in
  const userPlan: UserPlan = {
    userId,
    plan: mockPlan(userId),
    progressHistory: mockProgressHistory(),
  };

  return Response.json(userPlan);
}
