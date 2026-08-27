import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { baseURL } from "../../pages/baseurl/apiDomain";
import "./share-salesforce-customers-modal.css";

/* Same 4 static data types used on the event create/edit forms. */
const DATA_TYPE_OPTIONS = [
  { value: "bookedClients", label: "Booked Clients" },
  { value: "visitDoneLostClients", label: "Visit Done Lost Clients" },
  { value: "lostLeads", label: "Lost Leads" },
  { value: "cp", label: "CP" },
];

const DOT_COLORS = ["#de7008", "#0E7FA8", "#A81E20", "#3daf7d", "#7c6fd6"];

const authHeaders = () => ({
  Authorization: `Bearer ${localStorage.getItem("access_token")}`,
});

const displayName = (c) =>
  c.name ||
  c.full_name ||
  [c.first_name, c.last_name].filter(Boolean).join(" ") ||
  "Unnamed";

const displayContact = (c) =>
  [c.email, c.phone || c.mobile || c.phone_number].filter(Boolean).join(" • ") || "-";

const displayMeta = (c) =>
  [c.unit_number || c.unit || c.flat_number, c.project_name || c.wing]
    .filter(Boolean)
    .join(" • ");

const ShareSalesforceCustomersModal = ({ eventId, eventProjects = [], onClose, onShared }) => {
  const [search, setSearch] = useState("");
  const [dataTypeFilter, setDataTypeFilter] = useState("");
  const [projectFilter, setProjectFilter] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);

  const [customers, setCustomers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedIds, setSelectedIds] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Salesforce customers already turned into event users for this event -
  // fetched once so they can be shown pre-checked/disabled in the picker.
  const [sharedIds, setSharedIds] = useState(new Set());

  const searchDebounceRef = useRef(null);
  const perPage = 20;

  useEffect(() => {
    if (!eventId) return;
    const fetchSharedUsers = async () => {
      try {
        const res = await axios.get(
          `${baseURL}events/${eventId}/event_users.json`,
          { params: { per_page: 5000 }, headers: authHeaders() }
        );
        const ids = (res.data?.event_users || [])
          .map((u) => u.event_salesforce_customer_id)
          .filter((v) => v != null);
        setSharedIds(new Set(ids));
      } catch {
        // Non-fatal - the picker just won't pre-mark already-shared members.
      }
    };
    fetchSharedUsers();
  }, [eventId]);

  const fetchCustomers = async (targetPage) => {
    if (!eventId) return;
    targetPage === 1 ? setLoading(true) : setLoadingMore(true);
    try {
      const params = { page: targetPage, per_page: perPage };
      if (search.trim()) params.search = search.trim();
      if (dataTypeFilter) params.data_type = dataTypeFilter;
      if (projectFilter) params.project_id = projectFilter;

      const res = await axios.get(
        `${baseURL}events/${eventId}/salesforce_customers.json`,
        { params, headers: authHeaders() }
      );

      const list =
        res.data?.salesforce_customers ||
        res.data?.customers ||
        res.data?.data ||
        (Array.isArray(res.data) ? res.data : []);
      const total =
        res.data?.total_count ??
        res.data?.meta?.total_count ??
        res.data?.pagination?.total_count ??
        list.length;

      setCustomers((prev) => (targetPage === 1 ? list : [...prev, ...list]));
      setTotalCount(total);
      setPage(targetPage);
    } catch (error) {
      toast.error("Could not load Salesforce customers.");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Re-fetch from page 1 whenever a filter changes; debounce the search box.
  useEffect(() => {
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      fetchCustomers(1);
    }, 300);
    return () => clearTimeout(searchDebounceRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, dataTypeFilter, projectFilter, eventId]);

  const toggleCustomer = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectAll((prev) => !prev);
    setSelectedIds([]);
  };

  const toggleDataTypeFilter = (value) => {
    setDataTypeFilter((prev) => (prev === value ? "" : value));
  };

  const toggleProjectFilter = (value) => {
    setProjectFilter((prev) => (prev === value ? "" : value));
  };

  const selectedCount = selectAll ? totalCount : selectedIds.length;

  const handleShare = async () => {
    if (selectedCount === 0) {
      toast.error("Select at least one customer to share with.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = selectAll
        ? {
            select_all: true,
            project_ids: projectFilter
              ? [projectFilter]
              : eventProjects.map((p) => p.project_id),
            data_types: dataTypeFilter
              ? [dataTypeFilter]
              : [...new Set(eventProjects.flatMap((p) => p.data_types || []))],
          }
        : { salesforce_customer_ids: selectedIds };

      await axios.post(
        `${baseURL}events/${eventId}/salesforce_customers/create_event_users.json`,
        payload,
        { headers: { ...authHeaders(), "Content-Type": "application/json" } }
      );

      toast.success("Event shared with the selected customers.");
      onShared?.();
      onClose();
    } catch (error) {
      toast.error("Failed to share the event.");
    } finally {
      setSubmitting(false);
    }
  };

  const hasMore = customers.length < totalCount;

  return (
    <div className="ssc-backdrop" onClick={onClose}>
      <div className="ssc-modal" onClick={(e) => e.stopPropagation()}>
        <div className="ssc-header">
          <h4>Add Members</h4>
          <button type="button" className="ssc-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="ssc-toolbar">
          <div className="ssc-search-wrap">
            <span className="ssc-search-label">Search</span>
            <input
              className="ssc-search-input"
              type="text"
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            type="button"
            className={`ssc-filter-btn ${filterOpen ? "is-open" : ""}`}
            onClick={() => setFilterOpen((v) => !v)}
          >
            <svg width="15" height="15" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
              <line x1="3" y1="6" x2="17" y2="6" /><circle cx="8" cy="6" r="1.6" fill="currentColor" stroke="none" />
              <line x1="3" y1="10" x2="17" y2="10" /><circle cx="13" cy="10" r="1.6" fill="currentColor" stroke="none" />
              <line x1="3" y1="14" x2="17" y2="14" /><circle cx="10" cy="14" r="1.6" fill="currentColor" stroke="none" />
            </svg>
            Filter
          </button>

          {filterOpen && (
            <div className="ssc-filter-panel">
              <h6>Data Type</h6>
              {DATA_TYPE_OPTIONS.map((opt, i) => (
                <div
                  key={opt.value}
                  className={`ssc-filter-row ${dataTypeFilter === opt.value ? "is-on" : ""}`}
                  onClick={() => toggleDataTypeFilter(opt.value)}
                >
                  <span className="ssc-dot" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
                  {opt.label}
                </div>
              ))}

              <h6>Filter By Project</h6>
              {eventProjects.length === 0 ? (
                <div className="ssc-filter-empty">No projects on this event.</div>
              ) : (
                eventProjects.map((p, i) => (
                  <div
                    key={p.project_id}
                    className={`ssc-filter-row ${
                      String(projectFilter) === String(p.project_id) ? "is-on" : ""
                    }`}
                    onClick={() => toggleProjectFilter(p.project_id)}
                  >
                    <span className="ssc-dot" style={{ background: DOT_COLORS[i % DOT_COLORS.length] }} />
                    {p.project_name || `Project ${p.project_id}`}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <label className="ssc-selectall">
          <input type="checkbox" checked={selectAll} onChange={toggleSelectAll} />
          Select All Members ({selectedCount}/{totalCount})
        </label>

        <div className="ssc-list">
          {loading ? (
            <div className="ssc-loading">Loading customers…</div>
          ) : customers.length === 0 ? (
            <div className="ssc-empty">No Salesforce customers found for the current filters.</div>
          ) : (
            <>
              {customers.map((c) => {
                const alreadyShared = sharedIds.has(c.id);
                return (
                  <div className="ssc-row" key={c.id}>
                    <input
                      type="checkbox"
                      checked={alreadyShared || selectAll || selectedIds.includes(c.id)}
                      disabled={alreadyShared || selectAll}
                      onChange={() => toggleCustomer(c.id)}
                    />
                    <div>
                      <div className="ssc-row-name">
                        {displayName(c)}
                        {alreadyShared && <span className="ssc-badge-shared">Already Added</span>}
                      </div>
                      <div className="ssc-row-contact">{displayContact(c)}</div>
                      {displayMeta(c) ? <div className="ssc-row-meta">{displayMeta(c)}</div> : null}
                    </div>
                  </div>
                );
              })}
              {hasMore && (
                <div className="ssc-loadmore-wrap">
                  <button
                    type="button"
                    className="ssc-loadmore"
                    disabled={loadingMore}
                    onClick={() => fetchCustomers(page + 1)}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="ssc-footer">
          <button type="button" className="purple-btn1" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="purple-btn2"
            onClick={handleShare}
            disabled={submitting || selectedCount === 0}
          >
            {submitting ? "Sharing…" : `Share (${selectedCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareSalesforceCustomersModal;
