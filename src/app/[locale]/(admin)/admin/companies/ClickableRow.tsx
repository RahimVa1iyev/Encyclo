"use client";

import { useRouter } from "@/lib/navigation";
import { ReactNode } from "react";

export function ClickableRow({
  href,
  children,
  className,
  style,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}) {
  const router = useRouter();

  return (
    <tr
      onClick={() => router.push(href)}
      className={`cursor-pointer ${className || ""}`}
      style={style}
    >
      {children}
    </tr>
  );
}
