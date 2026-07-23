import { Moon, RefreshCw, Sun, Sunrise, Sunset } from "lucide-react";

/* AI-backed panels: the greeting line and the alert strip.
   Both degrade to nothing (greeting) or to server-side rule alerts, so a slow
   or failed model never blocks the dashboard. */

/* Severity carries an icon + label, never colour alone. */
const SEVERITY = {
  critical: { label: "Critical", icon: "!" },
  warning: { label: "Warning", icon: "!" },
  info: { label: "Info", icon: "i" },
};

/* Time-of-day mark. The icon reinforces the greeting's tone and gives the
   block an anchor against the ribbon that follows it. */
/* Must cover every value the controller's #part_of_day can return -
   'late night', 'dawn', 'morning', 'midday', 'afternoon', 'evening', 'night'.
   An unmapped key silently falls back and shows the wrong icon (a sunrise at
   2am), so this map and that method have to stay in step. */
const DAYPART = {
  "late night": { Icon: Moon, tone: "night" },
  dawn: { Icon: Sunrise, tone: "dawn" },
  morning: { Icon: Sunrise, tone: "dawn" },
  midday: { Icon: Sun, tone: "day" },
  afternoon: { Icon: Sun, tone: "day" },
  evening: { Icon: Sunset, tone: "dusk" },
  night: { Icon: Moon, tone: "night" },
};

export const AiGreeting = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="pcd-greet is-loading">
        <span className="pcd-skel pcd-skel-avatar" />
        <div className="pcd-greet-body">
          <span className="pcd-skel pcd-skel-greet" />
          <span className="pcd-skel pcd-skel-quote" />
        </div>
      </div>
    );
  }
  if (!data) return null;

  const { Icon, tone } = DAYPART[data.part_of_day] || DAYPART.morning;

  return (
    <div className={`pcd-greet pcd-daypart-${tone}`}>
      <span className="pcd-greet-icon" aria-hidden="true">
        <Icon size={19} strokeWidth={2} />
      </span>
      <div className="pcd-greet-body">
        <p className="pcd-greet-line">
          {data.greeting}, <strong>{data.user_name}</strong>
        </p>
        {data.quote ? <p className="pcd-greet-quote">{data.quote}</p> : null}
      </div>
    </div>
  );
};

/* A real button rather than a text link - it is an action, and it shows
   progress while the model is being called. */
const RefreshButton = ({ onClick, busy }) => (
  <button
    type="button"
    className="pcd-refresh"
    onClick={onClick}
    disabled={busy}
    title="Refresh alerts"
  >
    <RefreshCw size={13} strokeWidth={2.2} className={busy ? "is-spinning" : ""} aria-hidden="true" />
    {busy ? "Refreshing" : "Refresh"}
  </button>
);

export const AiAlerts = ({ data, loading, error, onRetry }) => {
  const alerts = data?.alerts || [];

  if (loading) {
    return (
      <section className="pcd-alerts">
        <div className="pcd-alerts-head">
          <h2>Alerts</h2>
          <span className="pcd-muted">Analysing…</span>
          <RefreshButton onClick={onRetry} busy />
        </div>
        <div className="pcd-alerts-grid">
          {[0, 1, 2].map((i) => (
            <div key={i} className="pcd-alert is-skel">
              <span className="pcd-skel pcd-skel-row" />
              <span className="pcd-skel pcd-skel-row" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="pcd-alerts">
        <div className="pcd-alerts-head">
          <h2>Alerts</h2>
          <RefreshButton onClick={onRetry} />
        </div>
        <div className="pcd-note pcd-note-error">{error}</div>
      </section>
    );
  }

  if (!alerts.length) return null;

  return (
    <section className="pcd-alerts">
      <div className="pcd-alerts-head">
        <h2>Alerts</h2>
        <span className="pcd-alerts-meta">
          {alerts.length} finding{alerts.length === 1 ? "" : "s"} for the current filters
          {data.source === "rules" ? " · offline rules" : ""}
        </span>
        <RefreshButton onClick={onRetry} />
      </div>

      <div className="pcd-alerts-grid">
        {alerts.map((a, i) => {
          const sev = SEVERITY[a.severity] || SEVERITY.info;
          return (
            <article key={i} className={`pcd-alert pcd-sev-${a.severity}`}>
              <div className="pcd-alert-top">
                <span className="pcd-alert-badge" aria-hidden="true">
                  {sev.icon}
                </span>
                <span className="pcd-alert-sev">{sev.label}</span>
              </div>
              <h3 className="pcd-alert-title">{a.title}</h3>
              {a.message ? <p className="pcd-alert-msg">{a.message}</p> : null}
              {a.action ? (
                <p className="pcd-alert-action">
                  <span>Next</span> {a.action}
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </section>
  );
};
