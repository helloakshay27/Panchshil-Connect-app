import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import SetupSidebar from "../../components/setup-sidebar";
import Breadcrumbs from "../../components/breadcrumb";
import { hasPermission } from "../../utils/permission";

export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const noTier = location.pathname.includes("/tiers");

  const homeRoute = useMemo(
    () =>
      [
        { permission: "project", route: "/project-list" },
        { permission: "banner", route: "/banner-list" },
        { permission: "site", route: "/site-list" },
      ].find((item) => hasPermission(item.permission))?.route || "/project-list",
    [],
  );

  const setupRoute = useMemo(
    () =>
      [
        { permission: "user_module", route: "/setup-member/user-list" },
        { permission: "banks", route: "/setup-member/banks-list" },
      ].find((item) => hasPermission(item.permission))?.route ||
      "/setup-member/user-list",
    [],
  );

  useEffect(() => {
    if (
      location.pathname === "/members" ||
      location.pathname === "/setup-member"
    ) {
      navigate("/project-list", { replace: true });
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileMenuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMobileMenuOpen(false);
    };

    document.body.classList.add("mobile-sidebar-lock");
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.classList.remove("mobile-sidebar-lock");
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileMenuOpen]);

  return (
    <main className="h-100 w-100 app-shell">
      <Header
        noTier={noTier}
        mobileMenuOpen={mobileMenuOpen}
        onMobileMenuToggle={() => setMobileMenuOpen((open) => !open)}
      />

      <div
        className={`main-content${mobileMenuOpen ? " mobile-sidebar-open" : ""}`}
      >
        {mobileMenuOpen && (
          <button
            type="button"
            className="mobile-sidebar-backdrop"
            aria-label="Close navigation menu"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        <div className="app-sidebar-shell">
          <nav className="mobile-drawer-top" aria-label="Primary">
            <NavLink to={homeRoute} className="mobile-drawer-top__link">
              Home
            </NavLink>
            <NavLink to={setupRoute} className="mobile-drawer-top__link">
              Setup
            </NavLink>
            <NavLink
              to="/panchshil_connect_dashboard"
              className="mobile-drawer-top__link"
            >
              Dashboard
            </NavLink>
          </nav>
          {location.pathname.startsWith("/setup-member") ? (
            <SetupSidebar />
          ) : (
            <Sidebar />
          )}
        </div>

        <div className="website-content flex-grow-1">
          <Breadcrumbs />
          <Outlet />
          <footer className="footer">
            <Footer />
          </footer>
        </div>
      </div>
    </main>
  );
}
