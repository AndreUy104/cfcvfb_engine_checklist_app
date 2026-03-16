"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/library/supabase/client";
import { Box, CircularProgress, Typography } from "@mui/material";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const supabase = createClient();

      // Handle hash-based token
      const hash = window.location.hash;
      if (hash && hash.includes("access_token")) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get("access_token");
        const refreshToken = params.get("refresh_token");

        if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
          });

          if (error) {
            console.error("setSession error:", error.message);
            router.push("/");
            return;
          }

          router.push("/Home");
          return;
        }
      }

      // Handle PKCE code in URL params
      const code = new URLSearchParams(window.location.search).get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(
          window.location.href,
        );

        if (error) {
          console.error("exchangeCodeForSession error:", error.message);
          router.push("/");
          return;
        }

        router.push("/Home");
        return;
      }

      // No token or code found
      console.error("No token or code found in URL");
      router.push("/");
    };

    handleCallback();
  }, []);

  return (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
      gap={2}
    >
      <CircularProgress />
      <Typography color="text.secondary">Setting up your account...</Typography>
    </Box>
  );
}
