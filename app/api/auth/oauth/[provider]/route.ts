import { NextRequest, NextResponse } from "next/server";

const providerToEnv: Record<string, string> = {
  google: "GOOGLE_OAUTH_URL",
  github: "GITHUB_OAUTH_URL",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;
  const envKey = providerToEnv[provider];

  if (!envKey) {
    return NextResponse.json({ error: "Unsupported provider" }, { status: 400 });
  }

  const oauthUrl = process.env[envKey];
  if (!oauthUrl) {
    const redirectUrl = new URL("/login?error=oauth_not_configured", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.redirect(oauthUrl);
}
