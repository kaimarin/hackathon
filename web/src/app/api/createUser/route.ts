import type { CreateUserInput, User } from "@/lib/types";

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

  // Stub: persist to database once it's wired in
  const user: User = {
    userId: crypto.randomUUID(),
    name,
    injuryType,
    painLevel,
    createdAt: new Date().toISOString(),
  };

  return Response.json(user, { status: 201 });
}
