"use client";

import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface CountUpProps {
  value: number;
  duration?: number;
  delay?: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function CountUp({
  value,
  duration = 1,
  delay = 0,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const spring = useSpring(0, { duration: duration * 1000, bounce: 0 });
  const display = useTransform(spring, (current) => {
    const formatted = current.toFixed(decimals);
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    const timeout = setTimeout(() => {
      spring.set(value);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [spring, value, delay]);

  return <motion.span className={className}>{display}</motion.span>;
}
