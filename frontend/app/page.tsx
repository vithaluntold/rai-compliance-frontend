"use client";

import ProfessionalLandingPage from "@/components/landing/professional-landing";
import {Toaster} from "@/components/ui/toaster";

export default function Home() {
  return (
    <>
      <ProfessionalLandingPage />
      <Toaster />
    </>
  );
}
