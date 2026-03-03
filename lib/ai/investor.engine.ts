type BlueprintInput = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export function generateExecutiveSummary(blueprint: BlueprintInput) {
  const preview = blueprint.content.slice(0, 220);
  return {
    blueprintId: blueprint.id,
    title: blueprint.title,
    summary: `The venture "${blueprint.title}" is positioned as a growth-stage opportunity with a clear go-to-market narrative.`,
    keyHighlights: [
      `Document size: ${blueprint.content.length} characters`,
      `Created on: ${blueprint.createdAt.toISOString()}`,
      `Last updated: ${blueprint.updatedAt.toISOString()}`,
    ],
    preview,
  };
}

export function calculateROIForecast(blueprint: BlueprintInput) {
  const base = Math.max(12, Math.min(40, Math.round(blueprint.content.length / 120)));
  const optimistic = base + 12;
  const conservative = Math.max(8, base - 7);

  return {
    timeframeMonths: 24,
    conservativeROI: `${conservative}%`,
    expectedROI: `${base}%`,
    optimisticROI: `${optimistic}%`,
    assumptions: [
      "Stable CAC and retention",
      "Phased hiring and controlled burn",
      "No major market contraction",
    ],
  };
}

export function generateRiskAssessment(blueprint: BlueprintInput) {
  const contentSizeRisk = blueprint.content.length < 400 ? "MEDIUM" : "LOW";

  return {
    overallRisk: contentSizeRisk === "LOW" ? "MEDIUM" : "HIGH",
    categories: {
      marketRisk: "MEDIUM",
      executionRisk: contentSizeRisk,
      financialRisk: "MEDIUM",
      regulatoryRisk: "LOW",
    },
    mitigations: [
      "Quarterly market validation",
      "Milestone-based budget release",
      "Multi-vendor dependency strategy",
    ],
  };
}

export function fundingBreakdown(blueprint: BlueprintInput) {
  const base = Math.max(100000, blueprint.content.length * 250);

  return {
    targetRaiseUSD: base,
    allocation: {
      productAndEngineering: Math.round(base * 0.4),
      goToMarket: Math.round(base * 0.3),
      operations: Math.round(base * 0.2),
      contingency: Math.round(base * 0.1),
    },
    runwayMonths: 18,
  };
}
