import { useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();
  const setupTablePage =
    location.pathname.startsWith("/setup-member/") &&
    (location.pathname.endsWith("-list") ||
      [
        "/setup-member/tiers",
        "/setup-member/lock-payments",
        "/setup-member/home-loan-requests",
        "/setup-member/demand-notes",
        "/setup-member/orders",
      ].includes(location.pathname));

  if (
    location.pathname === "/project-list" ||
    location.pathname === "/banner-list" ||
    location.pathname === "/testimonial-list" ||
    location.pathname === "/event-list" ||
    location.pathname === "/faq-list" ||
    location.pathname === "/site-list" ||
    setupTablePage
  ) {
    return null;
  }

  const pathnames = location.pathname.split("/").filter((x) => x);

  // Only show the last segment as breadcrumb
  const last = pathnames[pathnames.length - 1];

  if (!last || /^\d+$/.test(last)) {
    return null;
  }

  return (
    <nav aria-label="breadcrumb" className="mx-4 my-2">
      <ol className="breadcrumb">
        <li className="breadcrumb-item active" aria-current="page">
          {last}
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
