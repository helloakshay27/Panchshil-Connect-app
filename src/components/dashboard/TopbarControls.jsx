/* Topbar chrome shared by the Panchshil/Rustomjee/Kalpataru usage
   dashboards - nav-collapse toggle, back button, theme toggle and user
   avatar, ported from the reference wireframe's #navToggle/.back/#themeBtn/
   .avatar (Panchshil_Connect_Dashboard_v3_FM_structure). */

import { Link } from "react-router-dom";

export const SidebarToggle = ({ collapsed, onToggle }) => {
  const label = `${collapsed ? "Expand" : "Collapse"} navigation`;
  return (
    <button
      type="button"
      className="pcd-icon-btn"
      onClick={onToggle}
      title={label}
      aria-label={label}
      aria-expanded={!collapsed}
    >
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="2.5" y="3.5" width="15" height="13" rx="2.5" />
        <line x1="8" y1="3.5" x2="8" y2="16.5" />
      </svg>
    </button>
  );
};

export const BackButton = ({ to, label = "Back" }) => (
  <Link to={to} className="pcd-icon-btn" title={label} aria-label={label}>
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12.5 4.5 6.5 10l6 5.5" />
    </svg>
  </Link>
);

export const ThemeToggle = ({ theme, onToggle }) => {
  const next = theme === "dark" ? "light" : "dark";
  return (
    <button
      type="button"
      className="pcd-icon-btn"
      onClick={onToggle}
      title={`Switch to ${next} theme`}
      aria-label={`Switch to ${next} theme`}
    >
      {theme === "dark" ? (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <circle cx="10" cy="10" r="3.6" />
          <path d="M10 1.8v1.7M10 16.5v1.7M18.2 10h-1.7M3.5 10H1.8M15.8 4.2l-1.2 1.2M5.4 14.6l-1.2 1.2M15.8 15.8l-1.2-1.2M5.4 5.4 4.2 4.2" />
        </svg>
      ) : (
        <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M16.5 11.8A7 7 0 0 1 8.2 3.5a7 7 0 1 0 8.3 8.3Z" />
        </svg>
      )}
    </button>
  );
};

export const Avatar = ({ initials }) => <div className="pcd-avatar">{initials}</div>;
