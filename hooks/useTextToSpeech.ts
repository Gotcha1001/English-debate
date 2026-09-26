"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ReadAloudStatus = "idle" | "playing" | "paused" | "unsupported";

/**
 * Wraps the browser's built-in SpeechSynthesis API so any page can add a
 * "read this text aloud" control. No backend, no API cost — it runs
 * entirely client-side, which is why it's a good place to start for
 * pronunciation help.
 *
 * Usage:
 *   const { status, rate, setRate, speak, pause, stop } = useTextToSpeech();
 *   speak(lesson.story)
 */
function isSpeechSynthesisSupported() {
  return typeof window !== "undefined" && "speechSynthesis" in window;
}

export function useTextToSpeech() {
  // Whether the browser supports this API doesn't change during the
  // component's life, so it's computed once via a lazy initializer rather
  // than set from inside an effect (avoids the cascading-render warning).
  const [status, setStatus] = useState<ReadAloudStatus>(() =>
    isSpeechSynthesisSupported() ? "idle" : "unsupported",
  );
  // 1 = normal browser default. Slightly slower reads help pronunciation.
  const [rate, setRate] = useState(0.85);
  const lastTextRef = useRef<string>("");

  useEffect(() => {
    // If the user navigates away mid-sentence, don't leave it talking.
    return () => {
      if (isSpeechSynthesisSupported()) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string) => {
      if (!isSpeechSynthesisSupported()) return;
      const synth = window.speechSynthesis;

      // Resuming the same text after a pause — just resume, don't restart.
      if (status === "paused" && lastTextRef.current === text) {
        synth.resume();
        setStatus("playing");
        return;
      }

      synth.cancel(); // stop anything already in flight
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = rate;
      utterance.lang = "en-US";
      utterance.onend = () => setStatus("idle");
      utterance.onerror = () => setStatus("idle");

      lastTextRef.current = text;
      synth.speak(utterance);
      setStatus("playing");
    },
    [rate, status],
  );

  const pause = useCallback(() => {
    if (!isSpeechSynthesisSupported()) return;
    window.speechSynthesis.pause();
    setStatus("paused");
  }, []);

  const stop = useCallback(() => {
    if (!isSpeechSynthesisSupported()) return;
    window.speechSynthesis.cancel();
    setStatus("idle");
  }, []);

  return { status, rate, setRate, speak, pause, stop };
}
