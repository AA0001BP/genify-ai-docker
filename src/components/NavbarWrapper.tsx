"use client";

import { usePathname } from "next/navigation";

export default function NavbarWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  // Don't render navbar on homepage
  if (pathname === "/") return null;
  return <>{children}</>;
} 