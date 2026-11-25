"use client";

import type { MouseEvent, ReactNode } from "react";
import { useEffect, useRef } from "react";

export function DismissibleDetails({
  children,
  className,
}: {
  readonly children: ReactNode;
  readonly className?: string;
}) {
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      const details = detailsRef.current;
      const target = event.target;
      if (details?.open && target instanceof Node && !details.contains(target)) {
        details.open = false;
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const details = detailsRef.current;
      if (event.key === "Escape" && details?.open) {
        details.open = false;
        details.querySelector("summary")?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function closeAfterAction(event: MouseEvent<HTMLDetailsElement>) {
    if (event.target instanceof Element && event.target.closest("a, button")) {
      if (detailsRef.current !== null) {
        detailsRef.current.open = false;
      }
    }
  }

  return (
    <details className={className} onClick={closeAfterAction} ref={detailsRef}>
      {children}
    </details>
  );
}
