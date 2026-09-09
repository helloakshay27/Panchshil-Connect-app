/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;

const EditIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1-2-2 1-1a.5.5 0 0 1 .707 0l1.293 1.293ZM13.793 4.354l-2-2L4.939 9.207a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.854-6.854Z" />
    <path
      fillRule="evenodd"
      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11Z"
    />
  </svg>
);

const ViewIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8c-.058.087-.123.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8Z" />
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
  </svg>
);

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

const Eventlist = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [eventPermission, setEventPermission] = useState({});

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("event_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const getEventPermission = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};

      const permissions = JSON.parse(lockRolePermissions);
      return permissions.event || {};
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
      return {};
    }
  };

  useEffect(() => {
    const permissions = getEventPermission();
    console.log("Event permissions:", permissions);
    setEventPermission(permissions);
  }, []);

  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}events.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        const data = await response.json();

        if (Array.isArray(data.events)) {
          setEvents(data.events);
          connectEvents.onModuleLoaded({ record_count: data.events.length });
          setPagination({
            current_page: getPageFromStorage(),
            total_count: data.events.length,
            total_pages: Math.ceil(data.events.length / pageSize),
          });
        } else {
          console.error("API response does not contain events array", data);
        }
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
    // The list is intentionally loaded once from the existing API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const filteredEvents = useMemo(
    () =>
      events.filter((event) =>
        event.event_name.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [events, searchQuery],
  );

  useSearchTracking(searchQuery, filteredEvents.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredEvents.length,
      total_pages: Math.ceil(filteredEvents.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredEvents.length, searchQuery]);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("event_list_currentPage", pageNumber);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("s[name_cont]", searchQuery);
    }
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const handleToggleEvent = async (eventId, currentStatus) => {
    try {
      const response = await fetch(`${baseURL}events/${eventId}.json`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ event: { active: !currentStatus } }),
      });

      toast.success("Updated Status");
      if (!response.ok) {
        throw new Error("Failed to update event status");
      }

      setEvents((previous) =>
        previous.map((event) =>
          event.id === eventId ? { ...event, active: !currentStatus } : event,
        ),
      );
    } catch (error) {
      console.error("Error updating event status:", error);
    }
  };

  function formatDateTimeManual(datetime) {
    if (!datetime) return "-";
    const normalized = datetime.replace(" ", "T");
    const date = new Date(normalized);
    if (isNaN(date.getTime())) return "-";
    const hours = date.getHours();
    const minutes = date.getMinutes();
    if (hours === 0 && minutes === 0) {
      return date.toLocaleString("en-GB", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    }
    return date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  }

  const columns = [
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      alwaysVisible: true,
      render: (event) => (
        <div className="enhanced-table__row-actions">
          {eventPermission.update === "true" && (
            <a
              href={`/event-edit/${event.id}`}
              className="enhanced-table__action-button"
              aria-label={`Edit ${event.event_name || "event"}`}
              title="Edit"
            >
              <EditIcon />
            </a>
          )}
          {eventPermission.show === "true" && (
            <a
              href={`/event-details/${event.id}`}
              className="enhanced-table__action-button is-primary"
              aria-label={`View ${event.event_name || "event"}`}
              title="View"
            >
              <ViewIcon />
            </a>
          )}
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_event, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "event_name",
      label: "Event Name",
      filterable: true,
      render: (event) => event.event_name || "-",
    },
    {
      key: "event_at",
      label: "Event At",
      filterable: true,
      render: (event) => event.event_at || "-",
    },
    {
      key: "from_time",
      label: "Event From",
      getSortValue: (event) => new Date(event.from_time).getTime(),
      render: (event) => formatDateTimeManual(event.from_time),
    },
    {
      key: "to_time",
      label: "Event To",
      getSortValue: (event) => new Date(event.to_time).getTime(),
      render: (event) => formatDateTimeManual(event.to_time),
    },
    {
      key: "active",
      label: "Status",
      filterable: true,
      getSortValue: (event) => (event.active ? "Active" : "Inactive"),
      render: (event) =>
        eventPermission.destroy === "true" ? (
          <StatusToggle
            active={event.active}
            label={`${event.active ? "Deactivate" : "Activate"} ${
              event.event_name || "event"
            }`}
            onClick={() => handleToggleEvent(event.id, event.active)}
          />
        ) : null,
    },
  ];

  const addButton =
    eventPermission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/event-create")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">EVENT LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredEvents}
              loading={loading}
              emptyMessage="No events found."
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search events"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(event) => event.id}
              storageKey="event-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Eventlist;
