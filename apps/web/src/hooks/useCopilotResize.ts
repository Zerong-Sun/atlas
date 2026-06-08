import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import {
  COPILOT_WIDTH_DEFAULT,
  COPILOT_WIDTH_MAX,
  COPILOT_WIDTH_MIN,
  useMethodCopilot,
} from "@/context/MethodCopilotContext";

function maxCopilotWidth(): number {
  return Math.min(COPILOT_WIDTH_MAX, Math.floor(window.innerWidth * 0.55));
}

function widthFromPointer(clientX: number): number {
  return Math.min(maxCopilotWidth(), Math.max(COPILOT_WIDTH_MIN, window.innerWidth - clientX));
}

export function useCopilotResize(enabled: boolean) {
  const { width, setWidth } = useMethodCopilot();
  const [resizing, setResizing] = useState(false);
  const resizingRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;
    const onWindowResize = () => {
      setWidth((current) => Math.min(maxCopilotWidth(), current));
    };
    window.addEventListener("resize", onWindowResize);
    return () => window.removeEventListener("resize", onWindowResize);
  }, [enabled, setWidth]);

  useEffect(() => {
    if (!resizing) return;
    document.documentElement.classList.add("copilot-resizing");
    return () => {
      document.documentElement.classList.remove("copilot-resizing");
    };
  }, [resizing]);

  const onResizeStart = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || event.button !== 0) return;
      event.preventDefault();
      const handle = event.currentTarget;
      handle.setPointerCapture(event.pointerId);
      resizingRef.current = true;
      setResizing(true);
      setWidth(widthFromPointer(event.clientX));
    },
    [enabled, setWidth],
  );

  const onResizeMove = useCallback(
    (event: ReactPointerEvent<HTMLDivElement>) => {
      if (!enabled || !resizingRef.current) return;
      setWidth(widthFromPointer(event.clientX));
    },
    [enabled, setWidth],
  );

  const onResizeEnd = useCallback((event: ReactPointerEvent<HTMLDivElement>) => {
    if (!resizingRef.current) return;
    resizingRef.current = false;
    setResizing(false);
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }, []);

  const onResizeReset = useCallback(() => {
    if (!enabled) return;
    setWidth(COPILOT_WIDTH_DEFAULT);
  }, [enabled, setWidth]);

  return { width, resizing, onResizeStart, onResizeMove, onResizeEnd, onResizeReset };
}
