/**
 * Route -> module metadata for analytics.
 *
 * Declaring the mapping once here means the ~40 instrumented modules do not
 * each need a near-identical mount effect: ConnectModuleTracker resolves the
 * current route against this table and fires `Connect Module Viewed` for it.
 * Page files then only carry the *action* events (save, delete, search, ...).
 *
 * `module` is a property rather than part of the event name on purpose — it
 * keeps "which modules actually get used?" a single queryable breakdown
 * instead of ~40 separate event names.
 *
 * Paths must match the route patterns in src/App.jsx exactly; `:param`
 * segments are wildcarded when matching.
 *
 * Not covered: Runwal's "Offers" and "Connectivity Type" have no page, route
 * or sidebar entry in this repo yet. Add their entries when those modules ship.
 */

const POST_SALES = "Post Sales";
const SETUP = "Setup";

/** Expand one module's routes into registry rows. */
const routes = (module, pkg, screen, rows) =>
  rows.map(([path, view]) => ({ path, module, package: pkg, screen, view }));

export const MODULE_REGISTRY = [
  /* ── Post-sales home modules ─────────────────────────────────────────── */

  ...routes("Projects", POST_SALES, "projects", [
    ["/project-list", "list"],
    ["/project-create", "create"],
    ["/project-edit/:id", "edit"],
    ["/project-details/:id", "detail"],
  ]),

  ...routes("Hero Banners", POST_SALES, "hero_banners", [
    ["/banner-list", "list"],
    ["/banner-add", "create"],
    ["/banner-edit/:id", "edit"],
  ]),

  ...routes("Customer Testimonials", POST_SALES, "customer_testimonials", [
    ["/testimonial-list", "list"],
    ["/testimonials", "create"],
    ["/testimonial-edit", "edit"],
  ]),

  ...routes("Events", POST_SALES, "events", [
    ["/event-list", "list"],
    ["/event-create", "create"],
    ["/event-edit/:id", "edit"],
    ["/event-details/:id", "detail"],
    ["/event-details", "detail"],
  ]),

  ...routes("Site", POST_SALES, "site", [
    ["/site-list", "list"],
    ["/site-create", "create"],
    ["/site-edit/:id", "edit"],
  ]),

  ...routes("FAQs", POST_SALES, "faqs", [
    ["/faq-list", "list"],
    ["/faq-create", "create"],
    ["/faq-edit/:faqId", "edit"],
  ]),

  ...routes("Broadcasts", POST_SALES, "broadcasts", [
    ["/noticeboard-list", "list"],
    ["/noticeboard-create", "create"],
    ["/noticeboard-edit/:id", "edit"],
    ["/noticeboard-details/:id", "detail"],
  ]),

  ...routes("Press Releases", POST_SALES, "press_releases", [
    ["/pressreleases-list", "list"],
    ["/pressreleases-create", "create"],
    ["/pressreleases-edit/:id", "edit"],
  ]),

  ...routes("Referral Program", POST_SALES, "referral_program", [
    ["/referral-program-list", "list"],
    ["/referral-program-create", "create"],
    ["/referral-program-edit/:id", "edit"],
  ]),

  /* ── Setup modules ───────────────────────────────────────────────────── */

  ...routes("User Module", SETUP, "users", [
    ["/setup-member/user-list", "list"],
    ["/setup-member/user-create", "create"],
    ["/setup-member/user-edit/:id", "edit"],
    ["/setup-member/user-details/:id", "detail"],
  ]),

  ...routes("User Role", SETUP, "user_roles", [
    ["/setup-member/lock-role-list", "list"],
    ["/setup-member/lock-role-create", "create"],
  ]),

  ...routes("Lock Function", SETUP, "lock_functions", [
    ["/setup-member/lock-function-list", "list"],
    ["/setup-member/lock-function", "create"],
    ["/setup-member/lock-function-edit/:id", "edit"],
  ]),

  ...routes("Bank Details", SETUP, "bank_details", [
    ["/setup-member/bank-details-list", "list"],
    ["/setup-member/bank-details-create", "create"],
    ["/setup-member/bank-details-edit/:id", "edit"],
  ]),

  ...routes("Banks", SETUP, "banks", [
    ["/setup-member/banks-list", "list"],
    ["/setup-member/banks/create", "create"],
    ["/setup-member/banks/:bankId/edit", "edit"],
  ]),

  ...routes("Home Loan", SETUP, "home_loan", [
    ["/setup-member/home-loan-list", "list"],
    ["/setup-member/home-loan-create", "create"],
    ["/setup-member/home-loan-edit/:id", "edit"],
  ]),

  ...routes("Loan Manager", SETUP, "loan_manager", [
    ["/setup-member/loan-manager-list", "list"],
    ["/setup-member/loan-manager-create", "create"],
    ["/setup-member/loan-manager-edit/:id", "edit"],
  ]),

  ...routes("Property Type", SETUP, "property_type", [
    ["/setup-member/property-type-list", "list"],
    ["/setup-member/property-type", "create"],
    ["/setup-member/property-type-edit/:id", "edit"],
  ]),

  ...routes("Project Building", SETUP, "project_building", [
    ["/setup-member/project-building-type-list", "list"],
    ["/setup-member/project-building-type", "create"],
    ["/setup-member/project-building-type-edit/:id", "edit"],
  ]),

  ...routes("Construction Status", SETUP, "construction_status", [
    ["/setup-member/construction-status-list", "list"],
    ["/setup-member/construction-status", "create"],
    ["/setup-member/construction-status-edit/:id", "edit"],
  ]),

  ...routes("Construction Updates", SETUP, "construction_updates", [
    ["/setup-member/construction-updates-list", "list"],
    ["/setup-member/construction-updates-create", "create"],
    ["/setup-member/construction-updates-edit/:id", "edit"],
  ]),

  ...routes("Project Config", SETUP, "project_config", [
    ["/setup-member/project-configuration-list", "list"],
    ["/setup-member/project-configuration", "create"],
    ["/setup-member/project-config-edit/:id", "edit"],
  ]),

  ...routes("Amenities", SETUP, "amenities", [
    ["/setup-member/amenities-list", "list"],
    ["/setup-member/amenities", "create"],
    ["/setup-member/edit-amenities/:id", "edit"],
  ]),

  ...routes("Department", SETUP, "department", [
    ["/setup-member/department-list", "list"],
    ["/setup-member/department-create", "create"],
    ["/setup-member/department-edit/:id", "edit"],
  ]),

  ...routes("Visit Slot", SETUP, "visit_slot", [
    ["/setup-member/visitslot-list", "list"],
    ["/setup-member/visitslot-create", "create"],
  ]),

  ...routes("TDS Tutorials", SETUP, "tds_tutorials", [
    ["/setup-member/tds-tutorials-list", "list"],
    ["/setup-member/tds-tutorials-create", "create"],
    ["/setup-member/tds-tutorials-edit/:id", "edit"],
  ]),

  ...routes("Plus Services", SETUP, "plus_services", [
    ["/setup-member/plus-services-list", "list"],
    ["/setup-member/plus-services-create", "create"],
    ["/setup-member/plus-services-edit/:id", "edit"],
  ]),

  ...routes("Other Services", SETUP, "other_services", [
    ["/setup-member/other-services-list", "list"],
    ["/setup-member/other-services-create", "create"],
    ["/setup-member/other-services-edit/:id", "edit"],
  ]),

  ...routes("SMTP Settings", SETUP, "smtp_settings", [
    ["/setup-member/smtp-settings-list", "list"],
    ["/setup-member/smtp-settings-edit/:id", "edit"],
  ]),

  ...routes("FAQ Category", SETUP, "faq_category", [
    ["/setup-member/faq-category-list", "list"],
    ["/setup-member/faq-category/create", "create"],
    ["/setup-member/faq-category/:faqId/edit", "edit"],
  ]),

  ...routes("FAQ SubCategory", SETUP, "faq_subcategory", [
    ["/setup-member/faq-subcategory-list", "list"],
    ["/setup-member/faq-subcategory/create", "create"],
    ["/setup-member/faq-subcategory/:faqSubId/edit", "edit"],
  ]),

  ...routes("Service Category", SETUP, "service_category", [
    ["/setup-member/service-category-list", "list"],
    ["/setup-member/service-category/create", "create"],
    ["/setup-member/service-category/:serviceId/edit", "edit"],
  ]),

  ...routes("Image Config", SETUP, "image_config", [
    ["/setup-member/image-config-list", "list"],
    ["/setup-member/image-config-create", "create"],
    ["/setup-member/image-config/:id", "edit"],
  ]),

  ...routes("Common Files", SETUP, "common_files", [
    ["/setup-member/common-files-upload", "list"],
  ]),

  ...routes("Loyalty Managers", SETUP, "loyalty_managers", [
    ["/setup-member/loyalty-managers-list", "list"],
    ["/setup-member/loyalty-managers-create", "create"],
    ["/setup-member/loyalty-managers-edit/:id", "edit"],
  ]),
];

/** Turn a route pattern into an anchored regex, wildcarding `:param` segments. */
const toMatcher = (path) =>
  new RegExp(
    `^${path
      .split("/")
      .map((seg) => (seg.startsWith(":") ? "[^/]+" : seg.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")))
      .join("/")}/?$`
  );

// Literal segments beat wildcards, so `/setup-member/banks/create` is not
// swallowed by `/setup-member/banks/:bankId/edit`. Precomputed once at module
// load rather than per navigation; `entry` stays a reference to the registry
// row so resolveModule can return it without rebuilding an object.
const MATCHERS = MODULE_REGISTRY.map((entry) => ({
  entry,
  matcher: toMatcher(entry.path),
  specificity: entry.path.split("/").filter((s) => s && !s.startsWith(":")).length,
})).sort((a, b) => b.specificity - a.specificity);

/**
 * The registry entry for a pathname, or undefined when the route is not an
 * instrumented module (dashboard, auth pages, loyalty screens, ...).
 */
export const resolveModule = (pathname) =>
  MATCHERS.find(({ matcher }) => matcher.test(pathname))?.entry;
