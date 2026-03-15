import { updateSession } from "./library/supabase/middleware"
import { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { supabase, response } = updateSession(request)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && request.nextUrl.pathname.startsWith("/Home")) {
    return Response.redirect(new URL("/login", request.url))
  }

  return response
}