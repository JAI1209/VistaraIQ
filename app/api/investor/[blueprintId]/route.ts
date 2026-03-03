import { NextRequest, NextResponse } from "next/server";
import { AuthError, authenticateRequest } from "@/lib/auth/middleware";
import { ServiceError, getBlueprintById } from "@/lib/services/blueprint.service";
import {
  calculateROIForecast,
  fundingBreakdown,
  generateExecutiveSummary,
  generateRiskAssessment,
} from "@/lib/ai/investor.engine";

type RouteContext = {
  params: Promise<{
    blueprintId: string;
  }>;
};

function toErrorResponse(error: unknown) {
  if (error instanceof AuthError || error instanceof ServiceError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 });
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const auth = authenticateRequest(req);
    const { blueprintId } = await params;
    const blueprint = await getBlueprintById(blueprintId, auth.userId);

    return NextResponse.json({
      data: {
        executiveSummary: generateExecutiveSummary(blueprint),
        roiForecast: calculateROIForecast(blueprint),
        riskAssessment: generateRiskAssessment(blueprint),
        fundingBreakdown: fundingBreakdown(blueprint),
      },
    });
  } catch (error) {
    return toErrorResponse(error);
  }
}
