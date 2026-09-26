/**
 * PageLoader.tsx
 * Client-side wrapper that owns the loading state and renders
 * LoadingScreen above the page content. layout.js has no "use client"
 * directive, so the stateful logic lives here instead and layout.js just
 * renders <PageLoader>{children}</PageLoader>.
 */

"use client";
import { useEffect, useState } from "react";
import LoadingScreen from "./LoadingScreen";

export default function PageLoader({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Start the timer when this client component mounts instead of waiting for
    // window.load. Cached documents can already be complete before this runs,
    // which previously made the loader disappear almost immediately.
    const MIN_VISIBLE_MS = 1500;
    const finishTimer = setTimeout(() => setIsLoading(false), MIN_VISIBLE_MS);

    return () => clearTimeout(finishTimer);
  }, []);

  useEffect(() => {
    // Prevent scrolling and interaction with the page behind the overlay.
    if (isLoading) {
      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      return () => {
        document.body.style.overflow = previousOverflow;
      };
    }
  }, [isLoading]);

  return (
    <>
      <LoadingScreen isLoading={isLoading} label="Kartik Patel" />
      {children}
    </>
  );
}