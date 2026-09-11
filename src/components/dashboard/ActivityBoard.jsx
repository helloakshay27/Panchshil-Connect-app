import {
  CalendarClock,
  ChevronLeft,
  ChevronRight,
  Mail,
  MapPin,
  Phone,
  Pin,
} from "lucide-react";

/* Pinned-note board of the newest enquiries and site-visit bookings.
   Deliberately unfiltered - it answers "what just happened", not "what does
   the current filter contain". */

const KIND = {
  enquiry: { label: "Enquiry", cls: "is-enquiry" },
  site_visit: { label: "Site Visit", cls: "is-visit" },
};

/* "12:04" - when the rail last successfully refreshed. */
const clock = (d) =>
  d instanceof Date
    ? d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false })
    : null;

/* Recent Activity is unfiltered and visible to anyone with dashboard access,
   so contact details are shown masked - full value stays in the tooltip. */
const maskEmail = (email) => {
  const [local, domain] = String(email).split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(local.length - visible.length, 3))}@${domain}`;
};

const maskMobile = (mobile) => {
  const digits = String(mobile).replace(/\D/g, "");
  if (digits.length <= 4) return "*".repeat(digits.length);
  const head = digits.slice(0, 2);
  const tail = digits.slice(-2);
  return `${head}${"*".repeat(digits.length - 4)}${tail}`;
};

export const ActivityBoard = ({
  data,
  loading,
  error,
  updatedAt,
  collapsed,
  onToggle,
}) => {
  const items = data?.activities || [];

  /* Collapsed: a slim vertical spine that gives the charts the full width. */
  if (collapsed) {
    return (
      <aside className="pcd-board is-collapsed">
        <button
          type="button"
          className="pcd-board-toggle"
          onClick={onToggle}
          aria-expanded="false"
          title="Show recent activity"
        >
          <ChevronLeft size={15} strokeWidth={2.4} aria-hidden="true" />
        </button>
        <span className="pcd-board-spine">
          Recent Activity{items.length ? ` · ${items.length}` : ""}
        </span>
      </aside>
    );
  }

  return (
    <aside className="pcd-board">
      {/* No refresh control here - the rail polls while the tab is visible
          and refetches on focus and on Apply, so it is already current. */}
      <header className="pcd-board-head">
        <h2>Recent Activity</h2>
        <button
          type="button"
          className="pcd-board-toggle"
          onClick={onToggle}
          aria-expanded="true"
          title="Hide recent activity"
        >
          <ChevronRight size={15} strokeWidth={2.4} aria-hidden="true" />
        </button>
      </header>

      {error ? (
        <div className="pcd-board-state">{error}</div>
      ) : loading ? (
        <div className="pcd-board-list">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="pcd-pin is-skel">
              <span className="pcd-skel pcd-skel-row" />
              <span className="pcd-skel pcd-skel-row" />
            </div>
          ))}
        </div>
      ) : !items.length ? (
        <div className="pcd-board-state">No recent activity</div>
      ) : (
        <>
          <div className="pcd-board-list">
            {items.map((it) => {
              const kind = KIND[it.type] || KIND.enquiry;
              return (
                <article key={`${it.type}-${it.id}`} className={`pcd-pin ${kind.cls}`}>
                  <Pin size={12} strokeWidth={2.2} className="pcd-pin-icon" aria-hidden="true" />

                  <div className="pcd-pin-row">
                    <span className="pcd-pin-tag">{kind.label}</span>
                    <span className="pcd-pin-ago">{it.time_ago}</span>
                  </div>

                  <p className="pcd-pin-person">
                    {it.person}
                    <span className="pcd-pin-role"> · {it.person_role}</span>
                  </p>

                  <p className="pcd-pin-project" title={it.project_name}>
                    <MapPin size={11} strokeWidth={2} aria-hidden="true" />
                    {it.project_name}
                  </p>

                  {it.timing ? (
                    <p className="pcd-pin-timing">
                      <CalendarClock size={11} strokeWidth={2} aria-hidden="true" />
                      {it.timing}
                    </p>
                  ) : null}

                  <div className="pcd-pin-contact">
                    {it.email ? (
                      <span>
                        <Mail size={10} strokeWidth={2} aria-hidden="true" />
                        {maskEmail(it.email)}
                      </span>
                    ) : null}
                    {it.mobile ? (
                      <span>
                        <Phone size={10} strokeWidth={2} aria-hidden="true" />
                        {maskMobile(it.mobile)}
                      </span>
                    ) : null}
                  </div>

                  {it.status ? <span className="pcd-pin-status">{it.status}</span> : null}
                </article>
              );
            })}
          </div>

          <footer className="pcd-board-foot">
            <span className="pcd-live">
              <i className="pcd-live-dot" aria-hidden="true" />
              Live{updatedAt ? ` · updated ${clock(updatedAt)}` : ""}
            </span>
            Latest {data?.counts?.enquiries ?? 0} enquiries · {data?.counts?.site_visits ?? 0} site
            visits — not affected by filters
          </footer>
        </>
      )}
    </aside>
  );
};

export default ActivityBoard;
