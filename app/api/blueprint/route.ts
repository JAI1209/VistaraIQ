import { NextRequest, NextResponse } from "next/server";
import { AuthError, authenticateRequest } from "@/lib/auth/middleware";
import {
  ServiceError,
  createBlueprint,
  listUserBlueprints,
} from "@/lib/services/blueprint.service";

function toErrorResponse(error: unknown) {
  if (error instanceof AuthError || error instanceof ServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function POST(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const { title, content } = await req.json();
    const blueprint = await createBlueprint(auth.userId, title, content);
    return NextResponse.json({ data: blueprint }, { status: 201 });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const auth = authenticateRequest(req);
    const blueprints = await listUserBlueprints(auth.userId);
    return NextResponse.json({ data: blueprints });
  } catch (error) {
    return toErrorResponse(error);
  }
}
