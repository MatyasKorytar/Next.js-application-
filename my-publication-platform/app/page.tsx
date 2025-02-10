"use client";


import { GoogleAnalytics } from "nextjs-google-analytics";
import React from "react";
import { SessionProvider } from "next-auth/react";
import Dashboard from "@/pages/dashboard";

export default function Page() {
  return (
    <SessionProvider>
      <GoogleAnalytics trackPageViews />
      <Dashboard />
    </SessionProvider>
  );
}