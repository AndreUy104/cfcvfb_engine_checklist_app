import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import ThemeRegistry from "@/theme/ThemeRegistry";
import Sidebar from "@/components/Sidebar";
import { Box } from "@mui/material";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CFCVFB Engine Checklist",
  description: "",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeRegistry>
          <Box sx={{ display: "flex", minHeight: "100vh" }}>
            <Sidebar />
            {children}
          </Box>
        </ThemeRegistry>
      </body>
    </html>
  );
}
