import { NextRequest, NextResponse } from "next/server";
import { AuthError, authenticateRequest } from "@/lib/auth/middleware";
import {
  ServiceError,
  deleteBlueprint,
  getBlueprintById,
  updateBlueprint,
} from "@/lib/services/blueprint.service";

function toErrorResponse(error: unknown) {
  if (error instanceof AuthError || error instanceof ServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const blueprint = await getBlueprintById(id, auth.userId);
    return NextResponse.json({ data: blueprint });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const { content } = await req.json();
    const updated = await updateBlueprint(id, auth.userId, content);
    return NextResponse.json({ data: updated });
  } catch (error) {
    return toErrorResponse(error);
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = authenticateRequest(req);
    const { id } = await params;
    const result = await deleteBlueprint(id, auth.userId);
    return NextResponse.json({ data: result });
  } catch (error) {
    return toErrorResponse(error);
  }
}
