import { Role } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { AuthError, requireRole } from "@/lib/auth/middleware";

const enforceAdmin = requireRole([Role.ADMIN]);

export async function GET(req: NextRequest) {
  try {
    const auth = enforceAdmin(req);
    return NextResponse.json({
      data: {
        message: "Admin access granted",
        userId: auth.userId,
        role: auth.role,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
