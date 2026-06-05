"use client";

import { useEffect } from "react";

export default function EncyclopediaDashboardPage() {
  useEffect(() => {
    window.location.href = "/encyclopedia";
  }, []);
  return null;
}
