/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
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

const TruncatedCell = ({ value }) => (
  <div className="enhanced-table__truncate-cell" title={value || "-"}>
    {value || "-"}
  </div>
);

const formatNoticeType = (type) =>
  type ? type.charAt(0).toUpperCase() + type.slice(1).toLowerCase() : "-";

const getProjectNames = (noticeboard) => {
  if (
    Array.isArray(noticeboard.shared_notices) &&
    noticeboard.shared_notices.length > 0
  ) {
    const names = noticeboard.shared_notices
      .map((notice) => notice.project_name)
      .filter(Boolean);
    if (names.length > 0) return names.join(", ");
  }
  return noticeboard.project_name || "-";
};

const formatDateTimeManual = (datetime) => {
  if (!datetime) return "-";
  const date = new Date(datetime);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const NoticeboardList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [noticeboards, setNoticeboards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [noticeboardPermission, setNoticeboardPermission] = useState({});

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("noticeboard_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const getNoticeboardPermission = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) {
        return {
          create: "true",
          update: "true",
          show: "true",
          destroy: "true",
        };
      }

      const permissions = JSON.parse(lockRolePermissions);
      return (
        permissions.noticeboard || {
          create: "true",
          update: "true",
          show: "true",
          destroy: "true",
        }
      );
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
      return {
        create: "true",
        update: "true",
        show: "true",
        destroy: "true",
      };
    }
  };

  useEffect(() => {
    setNoticeboardPermission(getNoticeboardPermission());
  }, []);

  useEffect(() => {
    const fetchNoticeboards = async () => {
      setLoading(true);
      try {
        const response = await fetch(`${baseURL}noticeboards.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        let noticeboardsData = [];
        if (Array.isArray(data)) {
          noticeboardsData = data;
        } else if (data.noticeboards && Array.isArray(data.noticeboards)) {
          noticeboardsData = data.noticeboards;
        } else if (data.data && Array.isArray(data.data)) {
          noticeboardsData = data.data;
        }

        setNoticeboards(noticeboardsData);
        connectEvents.onModuleLoaded({ record_count: noticeboardsData.length });
        setPagination({
          current_page: getPageFromStorage(),
          total_count: noticeboardsData.length,
          total_pages: Math.ceil(noticeboardsData.length / pageSize),
        });
      } catch (error) {
        console.error("Error fetching noticeboards:", error);
        toast.error("Failed to fetch noticeboards");
        setNoticeboards([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNoticeboards();
    // The list is intentionally loaded once from the existing API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const filteredNoticeboards = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return noticeboards.filter((noticeboard) => {
      if (!query) return true;
      return (
        (noticeboard.notice_heading || "").toLowerCase().includes(query) ||
        (noticeboard.notice_text || "").toLowerCase().includes(query) ||
        (noticeboard.notice_type || "").toLowerCase().includes(query) ||
        getProjectNames(noticeboard).toLowerCase().includes(query)
      );
    });
  }, [noticeboards, searchQuery]);

  useSearchTracking(searchQuery, filteredNoticeboards.length);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredNoticeboards.length / pageSize),
    );
    setPagination((previous) => ({
      ...previous,
      total_count: filteredNoticeboards.length,
      total_pages: totalPages,
      current_page:
        previous.current_page > totalPages ? 1 : previous.current_page,
    }));
  }, [filteredNoticeboards.length]);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("noticeboard_list_currentPage", pageNumber);
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

  const handleToggleNoticeboard = useCallback(
    async (noticeboardId, currentStatus) => {
      try {
        const response = await fetch(
          `${baseURL}noticeboards/${noticeboardId}.json`,
          {
            method: "PUT",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ noticeboard: { active: !currentStatus } }),
          },
        );

        if (!response.ok) {
          throw new Error("Failed to update noticeboard status");
        }

        toast.success("Updated Status");
        setNoticeboards((previous) =>
          previous.map((noticeboard) =>
            noticeboard.id === noticeboardId
              ? { ...noticeboard, active: !currentStatus }
              : noticeboard,
          ),
        );
      } catch (error) {
        console.error("Error updating noticeboard status:", error);
        toast.error("Failed to update status");
      }
    },
    [],
  );

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Action",
        width: 90,
        sortable: false,
        alwaysVisible: true,
        render: (noticeboard) => (
          <div className="enhanced-table__row-actions">
            {noticeboardPermission.show === "true" && (
              <button
                type="button"
                className="enhanced-table__action-button is-primary"
                onClick={() =>
                  navigate(`/noticeboard-details/${noticeboard.id}`)
                }
                aria-label={`View ${noticeboard.notice_heading || "broadcast"}`}
                title="View"
              >
                <ViewIcon />
              </button>
            )}
            {noticeboardPermission.update === "true" && (
              <button
                type="button"
                className="enhanced-table__action-button"
                onClick={() => navigate(`/noticeboard-edit/${noticeboard.id}`)}
                aria-label={`Edit ${noticeboard.notice_heading || "broadcast"}`}
                title="Edit"
              >
                <EditIcon />
              </button>
            )}
          </div>
        ),
      },
      {
        key: "serial_number",
        label: "Sr No",
        width: 70,
        sortable: false,
        render: (_noticeboard, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "notice_heading",
        label: "Notice Heading",
        width: 180,
        filterable: true,
        render: (noticeboard) => (
          <TruncatedCell value={noticeboard.notice_heading} />
        ),
      },
      {
        key: "notice_type",
        label: "Notice Type",
        width: 130,
        filterable: true,
        getSortValue: (noticeboard) => formatNoticeType(noticeboard.notice_type),
        render: (noticeboard) => formatNoticeType(noticeboard.notice_type),
      },
      {
        key: "project",
        label: "Project",
        width: 260,
        filterable: true,
        getSortValue: (noticeboard) => getProjectNames(noticeboard),
        render: (noticeboard) => (
          <TruncatedCell value={getProjectNames(noticeboard)} />
        ),
      },
      {
        key: "expire_time",
        label: "Expire Time",
        width: 160,
        getSortValue: (noticeboard) =>
          noticeboard.expire_time
            ? new Date(noticeboard.expire_time).getTime()
            : 0,
        render: (noticeboard) => formatDateTimeManual(noticeboard.expire_time),
      },
      {
        key: "active",
        label: "Status",
        width: 90,
        filterable: true,
        getSortValue: (noticeboard) =>
          noticeboard.active ? "Active" : "Inactive",
        render: (noticeboard) => (
          <StatusToggle
            active={noticeboard.active}
            label={`${noticeboard.active ? "Deactivate" : "Activate"} ${
              noticeboard.notice_heading || "broadcast"
            }`}
            onClick={() =>
              handleToggleNoticeboard(noticeboard.id, noticeboard.active)
            }
          />
        ),
      },
    ],
    [handleToggleNoticeboard, navigate, noticeboardPermission],
  );

  const addButton =
    noticeboardPermission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/noticeboard-create")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">BROADCAST LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredNoticeboards}
              loading={loading}
              emptyMessage={
                searchQuery
                  ? "No broadcasts found matching your search."
                  : "No broadcasts found."
              }
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search broadcasts"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(noticeboard) => noticeboard.id}
              storageKey="broadcast-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeboardList;
