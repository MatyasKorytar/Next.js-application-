"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import Dashboard from "@/pages/dashboard";

export default function Page() {
  return (
    <SessionProvider>
      <Dashboard />
    </SessionProvider>
  );
}