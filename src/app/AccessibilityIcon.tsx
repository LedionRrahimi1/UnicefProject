import React from "react";
import accessibilityIcon from "../assets/accessibility-icon.png";

type Props = {
  size?: number;
  className?: string;
};

/** Universal Access symbol — follows currentColor like Lucide icons. */
export function AccessibilityIcon({ size = 20, className = "" }: Props) {
  return (
    <span
      role="img"
      aria-hidden="true"
      className={`inline-block shrink-0 bg-current ${className}`}
      style={{
        width: size,
        height: size,
        WebkitMaskImage: `url(${accessibilityIcon})`,
        maskImage: `url(${accessibilityIcon})`,
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
