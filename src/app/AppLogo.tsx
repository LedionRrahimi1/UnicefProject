import React from "react";
import logo from "../assets/mesolehte-logo.png";
import { APP_NAME } from "./brand";

type Props = {
  size?: number;
  className?: string;
};

/** App brand mark — book + star logo (no letter monogram). */
export function AppLogo({ size = 40, className = "" }: Props) {
  return (
    <img
      src={logo}
      alt={APP_NAME}
      width={size}
      height={size}
      className={`shrink-0 rounded-2xl object-cover shadow-sm shadow-primary/20 ${className}`}
      style={{ width: size, height: size }}
    />
  );
}
