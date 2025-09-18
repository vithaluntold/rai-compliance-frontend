"use client";

import {useRouter} from "next/navigation";
import ProfessionalLandingPage from "@/components/landing/professional-landing";
import {Toaster} from "@/components/ui/toaster";

export default function Home() {
  const router = useRouter();

  const handleProceedToChat = () => {
    router.push("/chat");
  };

  return (
    <>
      <ProfessionalLandingPage />
      <Toaster />
    </>
  );
}
