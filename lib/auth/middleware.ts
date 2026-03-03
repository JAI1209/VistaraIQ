import { Role } from "@prisma/client";
import { NextRequest } from "next/server";
import { verifyToken } from "@/lib/auth/jwt";

type TokenPayload = {
  userId: string;
  role: Role;
  iat?: number;
  exp?: number;
};

export type AuthenticatedRequest = NextRequest & {
  auth?: Pick<TokenPayload, "userId" | "role">;
};

export class AuthError extends Error {
  status: number;

  constructor(message: string, status = 401) {
    super(message);
    this.status = status;
  }
}

function extractBearerToken(req: NextRequest): string {
  const authorization = req.headers.get("authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new AuthError("Unauthorized");
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    throw new AuthError("Unauthorized");
  }

  return token;
}

export function authenticateRequest(req: NextRequest): Pick<TokenPayload, "userId" | "role"> {
  const token = extractBearerToken(req);
  let decoded: unknown;
  try {
    decoded = verifyToken(token);
  } catch {
    throw new AuthError("Unauthorized");
  }

  if (typeof decoded !== "object" || decoded === null) {
    throw new AuthError("Unauthorized");
  }

  const decodedRecord = decoded as Record<string, unknown>;
  if (
    typeof decodedRecord.userId !== "string" ||
    typeof decodedRecord.role !== "string"
  ) {
    throw new AuthError("Unauthorized");
  }

  const auth = {
    userId: decodedRecord.userId,
    role: decodedRecord.role as Role,
  };

  (req as AuthenticatedRequest).auth = auth;
  return auth;
}

export function requireRole(roles: Role[]) {
  return (req: NextRequest) => {
    const auth = authenticateRequest(req);
    if (!roles.includes(auth.role)) {
      throw new AuthError("Forbidden", 403);
    }
    return auth;
  };
}
