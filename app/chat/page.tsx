"use client";

import { Suspense } from "react";
import { ChatInterface } from "@/components/chat";
import { Toaster } from "@/components/ui/toaster";

function ChatInterfaceWithSuspense() {
  return (
    <Suspense fallback={
      <div className="full-height flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <ChatInterface />
    </Suspense>
  );
}

export default function ChatPage() {
  return (
    <div className="full-height bg-white dark:bg-black text-rendering-optimized">
      <ChatInterfaceWithSuspense />
      <Toaster />
    </div>
  );
}
