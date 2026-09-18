import { useEffect, useState } from "react";

/* Shared sidebar-collapsed preference for the .pcd-page usage dashboards -
   same persistence pattern as useTheme, one storage key so the rail's
   collapsed/expanded state carries over between Panchshil/Rustomjee/
   Kalpataru, matching the reference wireframe's panchshil-nav toggle. */
const STORAGE_KEY = "pcd-nav-collapsed";

function getInitial() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function useSidebarCollapsed() {
  const [collapsed, setCollapsed] = useState(getInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* best-effort persistence only */
    }
  }, [collapsed]);

  const toggle = () => setCollapsed((c) => !c);

  return { collapsed, toggle };
}
