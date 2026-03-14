"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface SidebarState {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
}

const SidebarContext = createContext<SidebarState>({ collapsed: false, setCollapsed: () => {} });

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("sonji-sidebar-collapsed");
      if (saved === "true") setCollapsed(true);
    } catch {}
  }, []);

  const handleSetCollapsed = (v: boolean) => {
    setCollapsed(v);
    try { localStorage.setItem("sonji-sidebar-collapsed", String(v)); } catch {}
  };

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed: handleSetCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() { return useContext(SidebarContext); }
