"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import { resolveEventStartMs } from "@/lib/event-time";

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
}

function computeTimeLeft(targetMs: number): TimeLeft {
  const diff = Math.max(0, targetMs - Date.now());
  const totalMinutes = Math.floor(diff / 60_000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;
  return { days, hours, minutes };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function Digit({ value }: { value: string }) {
  return (
    <div className="flex h-[82px] w-[51px] items-center justify-center rounded-lg border border-[#FFEA9E]/50 bg-linear-to-b from-white to-white/10 opacity-90 backdrop-blur-[17px]">
      <span
        className="text-5xl font-normal leading-none text-white"
        style={{ fontFamily: "monospace" }}
      >
        {value}
      </span>
    </div>
  );
}

function UnitBlock({ value, label }: { value: number; label: string }) {
  const digits = pad(value).split("");
  return (
    <div className="flex flex-col items-start gap-[14px]">
      <div className="flex items-center gap-[14px]">
        {digits.map((d, i) => (
          <Digit key={i} value={d} />
        ))}
      </div>
      <span className="font-montserrat text-2xl font-bold leading-8 text-white">
        {label}
      </span>
    </div>
  );
}

interface CountdownTimerProps {
  /** Heading rendered above the digit blocks while time remains. */
  title?: string;
  /** Fires once when the countdown first reaches 00:00:00. */
  onComplete?: () => void;
}

/**
 * Live countdown to the SAA event start time. Reads
 * `NEXT_PUBLIC_EVENT_START_DATETIME` (ISO-8601) via `resolveEventStartMs()`,
 * falling back to 2025-12-31T18:30:00+07:00. Ticks once per minute.
 *
 * Render strategy: initial render returns a skeleton (timeLeft === null) so
 * server HTML matches client HTML. The effect runs once on mount to compute
 * real values from the client clock and starts the interval.
 */
export function CountdownTimer({
  title = "Coming soon",
  onComplete,
}: CountdownTimerProps = {}) {
  const targetMs = useMemo(() => resolveEventStartMs(), []);
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
  const completeFiredRef = useRef(false);

  useEffect(() => {
    // queueMicrotask defers the first setState off the synchronous effect
    // path. Direct setState here trips `react-hooks/set-state-in-effect`
    // in this project's eslint config, even though the pattern is the
    // canonical way to surface client-only values (Date.now()).
    queueMicrotask(() => setTimeLeft(computeTimeLeft(targetMs)));
    const id = setInterval(() => {
      setTimeLeft(computeTimeLeft(targetMs));
    }, 60_000);
    return () => clearInterval(id);
  }, [targetMs]);

  // Fire onComplete exactly once when the clock hits zero.
  useEffect(() => {
    if (!timeLeft || !onComplete || completeFiredRef.current) return;
    if (timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0) {
      completeFiredRef.current = true;
      onComplete();
    }
  }, [timeLeft, onComplete]);

  if (timeLeft === null) {
    return (
      <div className="flex flex-col gap-4">
        <div className="h-8 w-48 animate-pulse rounded bg-white/20" />
        <div className="flex items-center gap-10">
          <div className="h-[82px] w-[116px] animate-pulse rounded bg-white/20" />
          <div className="h-[82px] w-[116px] animate-pulse rounded bg-white/20" />
          <div className="h-[82px] w-[116px] animate-pulse rounded bg-white/20" />
        </div>
      </div>
    );
  }

  const isOver =
    timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0;

  return (
    <div className="flex flex-col gap-4">
      {!isOver && (
        <p className="font-montserrat text-2xl font-bold leading-8 text-white">
          {title}
        </p>
      )}
      <div className="flex items-start gap-10">
        <UnitBlock value={timeLeft.days} label="DAYS" />
        <UnitBlock value={timeLeft.hours} label="HOURS" />
        <UnitBlock value={timeLeft.minutes} label="MINUTES" />
      </div>
    </div>
  );
}
