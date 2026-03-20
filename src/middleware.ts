import { updateSession } from "./library/supabase/middleware";
import { NextRequest, NextResponse } from "next/server";
import { PERMISSION } from "./utilities/constants/auth.constant";

const ROUTE_PERMISSIONS: Record<string, readonly number[]> = {
  "/Home": PERMISSION.ALL,
  "/PowerTools": PERMISSION.REGULARS,
  "/Inventory": PERMISSION.REGULARS,
  "/Reports": PERMISSION.OIC_AND_OFFICER,
  "/Personnel": PERMISSION.OFFICER_ONLY,
};

export async function middleware(request: NextRequest) {
  const { supabase, response } = updateSession(request);

  if (request.nextUrl.pathname.startsWith("/Auth/callback")) {
    return response;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Check route permissions
  const pathname = request.nextUrl.pathname;
  const requiredPositions = Object.entries(ROUTE_PERMISSIONS).find(([route]) =>
    pathname.startsWith(route),
  )?.[1];

  if (requiredPositions) {
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
    "/PowerTools/:path*",
    "/Inventory/:path*",
    "/Reports/:path*",
    "/Personnel/:path*",
    "/Auth/callback",
  ],
};
