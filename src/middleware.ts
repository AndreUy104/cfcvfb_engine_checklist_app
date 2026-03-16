import { updateSession } from "./library/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";

const ROUTE_PERMISSIONS: Record<string, number[]> = {
  "/Reports": [2, 3],
  "/Personnel": [3],
};

export async function middleware(request: NextRequest) {
  const { supabase, response } = updateSession(request);

  if (request.nextUrl.pathname.startsWith("/Auth/callback")) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Not logged in — redirect to login
  if (!user && request.nextUrl.pathname.startsWith("/Home")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check route permissions
  const pathname = request.nextUrl.pathname;
  const requiredPositions = Object.entries(ROUTE_PERMISSIONS).find(([route]) =>
    pathname.startsWith(route),
  )?.[1];

  if (requiredPositions && user) {
    const { data: userProfile } = await supabase
      .from("Users")
      .select("position_id")
      .eq("auth_id", user.id)
      .maybeSingle();

    const positionId = userProfile?.position_id;

    if (!positionId || !requiredPositions.includes(positionId)) {
      return NextResponse.redirect(new URL("/Home", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/Home/:path*",
    "/Reports/:path*",
    "/Personnel/:path*",
    "/Auth/callback",
  ],
};
