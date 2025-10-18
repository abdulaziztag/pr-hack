"use client";

import * as React from "react";
import { formatInt, formatFloat } from "@/lib/intl/number";

interface NumberTextProps {
  value: number;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export default function NumberText({
  value,
  suffix = "",
  decimals = 0,
  className = "",
}: NumberTextProps) {
  const txt = decimals > 0 ? formatFloat(value, decimals) : formatInt(value);
  return (
    <span className={`tabular-nums whitespace-nowrap ${className}`}>
      {txt}
      {suffix}
    </span>
  );
}



