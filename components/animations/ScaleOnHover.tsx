"use client";

import { motion, HTMLMotionProps } from "framer-motion";
import { ReactNode } from "react";

interface ScaleOnHoverProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  scale?: number;
}

export function ScaleOnHover({
  children,
  scale = 1.02,
  ...props
}: ScaleOnHoverProps) {
  return (
    <motion.div
      whileHover={{
        scale,
        transition: { duration: 0.2 },
      }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
