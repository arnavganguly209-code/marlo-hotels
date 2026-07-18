"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";

type MetricCardProps = {
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  change?: number;
  /** Pre-rendered icon element from the server — never pass a component function. */
  icon: ReactNode;
};

export function MetricCard({
  label,
  value,
  prefix = "",
  suffix = "",
  change,
  icon,
}: MetricCardProps) {
  const motionValue = useMotionValue(0);
  const spring = useSpring(motionValue, { stiffness: 70, damping: 20 });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) =>
      setDisplay(Math.round(latest))
    );
    motionValue.set(value);
    return unsubscribe;
  }, [motionValue, spring, value]);

  const TrendIcon =
    change === undefined || change === 0
      ? Minus
      : change > 0
        ? ArrowUpRight
        : ArrowDownRight;

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="orbit-panel rounded-2xl p-6"
    >
      <div className="flex items-start justify-between">
        <span className="grid size-11 place-items-center rounded-xl bg-[#123429] text-[#d0a654] shadow-[0_12px_30px_-18px_#123429]">
          {icon}
        </span>
        {change !== undefined ? (
          <span
            className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              change > 0
                ? "bg-emerald-50 text-emerald-700"
                : change < 0
                  ? "bg-red-50 text-red-600"
                  : "bg-[#eef1ed] text-[#5d6e67]"
            }`}
          >
            <TrendIcon className="size-3" />
            {Math.abs(change)}%
          </span>
        ) : null}
      </div>
      <p className="font-display mt-6 text-4xl font-semibold tracking-tight text-[#10251e]">
        {prefix}
        {display.toLocaleString()}
        {suffix}
      </p>
      <p className="mt-1 text-xs font-medium tracking-[0.12em] text-[#62716b] uppercase">
        {label}
      </p>
    </motion.article>
  );
}
