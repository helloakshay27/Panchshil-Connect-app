/* Plain-language "how this is calculated" explanations for the Panchshil
   Connect Usage Dashboard's (i) buttons, keyed by metric key.
   t = title, f = formula (how it's calculated), d = why it matters. */

export const INFO_DB = {
  /* ---- Traffic & Session (text copied verbatim from the FM Matrix /
       PostHog Usage Dashboard reference INFO database, keys U1/U2/U3/U5/U6/U8) ---- */
  "traffic.active_users": {
    t: "Active Users (U1)",
    f: "Count of distinct employees who were active at least once in a 7-day window (weekly active users, WAU).",
    d: "Each person is counted only once no matter how many times they log in. This is your reach — how many of your team actually showed up in the week.",
  },
  "traffic.screen_views": {
    t: "Screen Views (U2)",
    f: "Total number of screens/pages opened across everyone, added up over the selected date range.",
    d: "Unlike active users, this counts every screen opened — so it climbs when people browse more deeply, not just when more people log in.",
  },
  "traffic.sessions": {
    t: "Sessions (U3)",
    f: "Total number of visits in the selected range. A session is one continuous visit that ends after about 30 minutes of no activity.",
    d: "If one person logs in three separate times, that's three sessions. It measures how often people are coming back, not just how many people.",
  },
  "traffic.avg_session": {
    t: "Session Duration (U5)",
    f: "Total time everyone spent in the app ÷ total number of sessions.",
    d: "The average length of a single visit, shown in minutes and seconds. A session ends after ~30 minutes of inactivity, so this reflects real time-in-app.",
  },
  "traffic.bounce_rate": {
    t: "Bounce Rate (U6)",
    f: "Sessions where the person viewed only one screen and took no further action ÷ total sessions, shown as a percentage.",
    d: "A \"bounce\" is a visit where someone opened the app but left without doing anything. Lower is better — it means people are finding a reason to stay.",
  },
  "traffic.recently_online": {
    t: "Recently Online (U8)",
    f: "Count of distinct employees who were active in the last ~30 minutes.",
    d: "A near-live pulse of who is in the app right now. It moves up and down through the day rather than reflecting the whole date range.",
  },

  /* ---- Adoption & Engagement (text copied verbatim from the FM Matrix /
       PostHog Usage Dashboard reference INFO database, keys A1/A2/A3/A5/A6) ---- */
  "adoption.seat": {
    t: "Seat Utilisation (A1)",
    f: "Weekly active users (WAU) ÷ total seats (licences purchased), shown as a percentage.",
    d: "Of all the logins you pay for, what share are actually being used each week. A low number means licences are sitting idle.",
  },
  "adoption.stickiness": {
    t: "Stickiness (A2)",
    f: "Average daily active users ÷ monthly active users, shown as a percentage (DAU ÷ MAU).",
    d: "Of the people who use the app in a month, what share use it on any given day. Roughly 30% means the average active user shows up ~9 days a month. Higher means more habitual use.",
  },
  "adoption.trend": {
    t: "Adoption Trend (A3)",
    f: "The change in weekly active users now versus four weeks ago, expressed as a percentage rise or fall.",
    d: "A simple momentum reading: a positive number means more of your team is engaging than a month ago, a negative number means engagement is slipping.",
  },
  "adoption.activation": {
    t: "14-Day Activation (A5)",
    f: "New joiners who completed a first meaningful action within 14 days of getting access ÷ all new joiners in that window, as a percentage.",
    d: "\"Activated\" means a new user got past just logging in and actually did something real. It shows how well newcomers get off the ground in their first two weeks.",
  },
  "adoption.module_breadth": {
    t: "Module Breadth (A6)",
    f: "Count of the modules that had at least one action in the range, out of every module the app exposes.",
    d: "How much of the platform is genuinely in use versus sitting idle. A low number means people are only touching one or two areas of what they pay for.",
  },
  "adoption.dormant": {
    t: "Dormant Users",
    f: "Users who were previously active but have had no activity for 14+ days, counted against total registered residents.",
    d: "A rising dormant count signals disengagement — these are people who once used the app but stopped. Tracking this helps identify when re-engagement campaigns may be needed.",
  },

  /* ---- Workflow (text copied verbatim from the FM Matrix / PostHog Usage
       Dashboard reference INFO database, keys F-adopt/F-comp/F-step/F-vol) ---- */
  "workflow.adoption": {
    t: "Workflow Adoption (F-adopt)",
    f: "Active users who started at least one of this module's workflows ÷ active users who could use them, as a percentage.",
    d: "For the module you're viewing, how many of the relevant people have actually begun using its workflows at all.",
  },
  "workflow.completion": {
    t: "Completion Rate (F-comp)",
    f: "Workflow runs that reached the final step ÷ workflow runs that were started, as a percentage.",
    d: "Of the processes people begin (e.g. a ticket, an audit), how many they carry through to the end rather than abandoning partway.",
  },
  "workflow.biggest_step_drop": {
    t: "Biggest Step Drop (F-step)",
    f: "At the single worst step in the workflow, the share of runs that fail to move on to the next step, as a percentage.",
    d: "Pinpoints the one place people most often get stuck or give up. Lower is better; a high number flags a confusing or heavy step to fix first.",
  },
  "workflow.usage_volume": {
    t: "Usage Volume (F-vol)",
    f: "Total count of workflow runs started in this module during the selected range.",
    d: "The raw amount of work flowing through the module — how many tickets, audits or tasks were kicked off. Shows overall throughput.",
  },

  /* ---- Chart / section cards (text copied verbatim from the FM Matrix /
       PostHog Usage Dashboard reference INFO database, chart.* keys) ---- */
  "chart.usage": {
    t: "Usage over time",
    f: "For each day in the range, the solid line plots the chosen measure — Visitors (distinct active people), Views (screens opened) or Sessions (visits). The faint dashed line is the same measure for the immediately preceding period of equal length.",
    d: "Lets you spot the trend and compare it like-for-like against the previous period. The short dashed tail at the end is a simple projection of where the current pace is heading.",
  },
  "chart.device": {
    t: "Device breakdown",
    f: "Sessions split by the device they came from — Desktop, Mobile and Tablet — each shown as a share of total sessions.",
    d: "Tells you how staff are reaching the tool. A heavy mobile/tablet share usually means people working on the move rather than at a desk.",
  },
  "chart.adoptTrend": {
    t: "Adoption trend",
    f: "Weekly active users (WAU) plotted for each of the last 8 weeks, with the faint dashed line showing the prior comparison period.",
    d: "Shows whether more of your team is engaging week over week, or whether active usage has flattened or fallen.",
  },
  "chart.growth": {
    t: "Growth accounting",
    f: "Each week, active users are split into New (first-ever active), Returning (active the prior week too) and Resurrected (came back after a gap) above the line, with Dormant (were active before, not this week) shown below the line.",
    d: "Explains why your active-user number moved: bars above zero are gains, the bar below zero is the loss. If losses regularly outweigh gains, growth is at risk.",
  },
  "chart.retention": {
    t: "Retention cohorts",
    f: "People are grouped by the week they first became active (a \"cohort\"), shown one per row. Each cell reads what percentage of that group came back in week 0, week 1, week 2, and so on.",
    d: "Reading left to right shows how well each joining group sticks around. Darker cells mean more people retained. It answers \"once people start, do they keep coming back?\"",
  },
  "chart.role": {
    t: "Usage by role",
    f: "Active people broken down by their role (Admin, Supervisor, Technician, Occupant), each shown as a share within the group.",
    d: "Shows which types of user are actually engaging. If a key role such as Technicians is under-represented, adoption may be uneven.",
  },
  "chart.siteHealth": {
    t: "Site league table",
    f: "One row per site in scope, showing its active users, sessions, average session length and bounce rate, plus the change in active users versus the previous period — ranked busiest first so sites with no events sit at the bottom. Status flags a sudden drop (active users down 25%+), a site to watch, or a healthy site.",
    d: "A leaderboard to see which sites are adopting well and which are lagging or dropping and may need attention. There is no per-site endpoint, so each row is its own traffic_session call — the table only loads on the All-sites scope, and rows appear as each call lands.",
  },
  "chart.funnel": {
    t: "Workflow funnel",
    f: "For the flagship workflow of the selected module, the number of runs still present at each successive step, from start to finish. The percentage on each step is the drop from the step before it.",
    d: "Each bar is narrower than the one above because some runs drop off. The highlighted step is the single biggest drop — where people most often get stuck.",
  },
  "chart.flowList": {
    t: "Screens in this module",
    f: "Every sub-path under the selected module, with the users, events and sessions recorded on it. Per-path completion (F-comp) needs a flow_key event property that is not instrumented yet, so it reads as a dash.",
    d: "A per-screen scorecard so you can see which specific parts of the module are being used and which are ignored.",
  },
  "chart.path": {
    t: "Where people start",
    f: "The screen each session lands on first, listed with its Visitors, Views and Bounce rate. The small arrows show the change versus the previous period.",
    d: "Shows the most common entry points into the app — what people actually come to the tool to do first.",
  },

  /* ---- Stability ---- */
  "stability.crash_free_users": {
    t: "Crash-Free Users",
    f: "Percentage of users who experienced no crash, over the last 90 days for the latest release.",
    d: "The share of people with a crash-free experience. A dip here is a reliability red flag.",
  },
  "stability.crash_free_sessions": {
    t: "Crash-Free Sessions",
    f: "Percentage of sessions that did not end in a crash, over the last 90 days for the latest release.",
    d: "Crash-free sessions are a stricter measure than users, since one user can have many sessions — some of which crash.",
  },
  "stability.total_crashes": {
    t: "Total Crashes",
    f: "Total number of crash events recorded over the last 90 days, across all releases.",
    d: "Absolute volume of crashes. Useful for comparing releases and prioritising fixes.",
  },
  "stability.affected_users": {
    t: "Affected Users",
    f: "Count of distinct users who hit at least one crash.",
    d: "How many unique people felt the problem. A small number of users causing many crashes is different from widespread impact.",
  },
  "stability.latest_release": {
    t: "Latest Release",
    f: "The most recent app version/build identifier observed in the data.",
    d: "Which build is live. Reliability metrics like crash-free users are usually tracked per release.",
  },

  /* ---- Non-fatal / handled failure layer ---- */
  "health.api_timeout": {
    t: "API Timeout Rate",
    f: "api_timeout events ÷ all API calls, shown as a percentage.",
    d: "How often backend calls time out. A raised rate points to network or backend performance problems.",
  },
  "health.offline_blocked": {
    t: "Offline-Blocked Actions",
    f: "Count of offline_action_blocked events over the last 90 days.",
    d: "Actions a user tried while offline or when the device blocked them for lack of connectivity.",
  },
  "health.rooted_devices": {
    t: "Rooted / Jailbroken Devices",
    f: "Count of distinct devices that triggered the root_detection event.",
    d: "Security-relevant: rooted/jailbroken devices are more exposed and can affect trust in analytics.",
  },
  "health.slow_api": {
    t: "Slow API Response (p90)",
    f: "The 90th-percentile slow_api_response duration in milliseconds.",
    d: "The response time that 90% of calls are faster than. A high p90 means a meaningful share of users wait too long.",
  },
};

/** True if the key has an info entry (so the button can render). */
export const hasInfo = (key) => Boolean(key && INFO_DB[key]);
