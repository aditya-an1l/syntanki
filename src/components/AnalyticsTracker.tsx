"use client";

import { useEffect } from "react";
import { recordD7Visit } from "@/db/helpers";

export default function AnalyticsTracker() {
  useEffect(() => {
    recordD7Visit();
  }, []);
  return null;
}
