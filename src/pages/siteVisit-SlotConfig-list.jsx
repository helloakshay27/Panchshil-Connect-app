/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;
const pageStorageKey = "siteSlotVisitCurrentPage";
const getPageFromStorage = () =>
  parseInt(localStorage.getItem(pageStorageKey)) || 1;

const StatusToggle = ({ active, label, onClick }) => (
  <button
    type="button"
    className={`enhanced-table__toggle ${active ? "is-active" : ""}`}
    onClick={onClick}
    aria-label={label}
    aria-pressed={active}
    title={label}
  >
    <span />
  </button>
);

const SiteVisitSlotConfigList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [slots, setSlots] = useState([]);
  const [permission, setPermission] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(getPageFromStorage());

  useEffect(() => {
    try {
      const permissions = JSON.parse(
        localStorage.getItem("lock_role_permissions") || "{}",
      );
      setPermission(permissions.site_slot || {});
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
    }
  }, []);

  useEffect(() => {
    const fetchSlots = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}site_schedule/all_site_schedule_slots.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );
        const data = response.data.slots || [];
        setSlots(data);
        connectEvents.onModuleLoaded({ record_count: data.length });
      } catch (fetchError) {
        console.error("Error fetching site visit slots:", fetchError);
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSlots();
    // Preserve the existing load-once behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    connectEvents.onModulePaginated({ page });
    setCurrentPage(page);
    localStorage.setItem(pageStorageKey, page);
  };

  const handleToggle = useCallback(
    async (id, active) => {
      toast.dismiss();
      const updatedStatus = active ? 0 : 1;
      try {
        await axios.put(
          `${baseURL}site_schedules/${id}.json`,
          { active: updatedStatus },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );
        setSlots((items) =>
          items.map((item) =>
            item.id === id ? { ...item, active: updatedStatus } : item,
          ),
        );
        connectEvents.onRecordStatusChanged({
          record_id: id,
          new_status: !active ? "active" : "inactive",
        });
        toast.success("Status updated successfully!");
      } catch (toggleError) {
        console.error(
          "Error updating slot status:",
          toggleError.response?.data || toggleError,
        );
      }
    },
    [connectEvents],
  );

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setCurrentPage(1);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("s[project_name_cont]", searchQuery);
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const filteredSlots = useMemo(
    () =>
      slots.filter((item) =>
        (item.project_name?.toLowerCase() || "").includes(
          searchQuery.toLowerCase(),
        ),
      ),
    [searchQuery, slots],
  );

  useSearchTracking(searchQuery, filteredSlots.length);

  const columns = useMemo(
    () => [
      {
        key: "serial_number",
        label: "Sr No",
        sortable: false,
        render: (_item, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "active",
        label: "Active",
        getSortValue: (item) => Number(Boolean(item.active)),
        render: (item) =>
          permission.show === "true" ? (
            <StatusToggle
              active={Boolean(item.active)}
              label={`${item.active ? "Deactivate" : "Activate"} visit slot`}
              onClick={() => handleToggle(item.id, item.active)}
            />
          ) : null,
      },
      {
        key: "time",
        label: "Start Time & End Time",
        getSortValue: (item) => `${item.start_time} ${item.end_time}`,
        render: (item) => `${item.start_time} to ${item.end_time}`,
      },
    ],
    [handleToggle, permission],
  );

  const addButton =
    permission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/setup-member/visitslot-create")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">VISIT SLOT LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredSlots}
              loading={loading}
              emptyMessage="No data available"
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search visit slots"
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(item) => item.id}
              storageKey="site-visit-slot-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteVisitSlotConfigList;
