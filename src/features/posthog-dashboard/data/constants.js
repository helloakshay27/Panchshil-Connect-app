/* FM Adoption analytics — shared constants, filter shapes and defaults. */

export const DEVICE_TYPES = ["Desktop", "Mobile"];

/* Weekly bucket count per endpoint. */
export const TREND_WEEKS = 8;
export const GROWTH_WEEKS = 6;
export const RETENTION_WEEKS = 8;

/* Date window options offered in the filter bar (calendar days, inclusive of
   today) for from/to queries. */
export const DATE_WINDOWS = [
  { value: 7, label: "7 days" },
  { value: 30, label: "30 days" },
  { value: 90, label: "90 days" },
];

export const DEFAULT_WINDOW = 30;

/* X days back => inclusive-today range, as YYYY-MM-DD. */
export const isoDate = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

export const rangeForDays = (days) => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  return { from: isoDate(from), to: isoDate(to) };
};

/* Every response self-describes with a meta block. */
export const EMPTY_META = {
  metric: "",
  filters: { url: "", site_id: [], device_type: [], from: "", to: "" },
  generated_at: "",
};

export default {
  DEVICE_TYPES,
  TREND_WEEKS,
  GROWTH_WEEKS,
  RETENTION_WEEKS,
  DATE_WINDOWS,
  DEFAULT_WINDOW,
  isoDate,
  rangeForDays,
};
