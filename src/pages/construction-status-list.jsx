/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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

const ConstructionStatusList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [constructionStatusPermissions, setConstructionStatusPermissions] =
    useState({});

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("construction_status_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    try {
      const storedPermissions = localStorage.getItem("lock_role_permissions");
      const permissions = storedPermissions
        ? JSON.parse(storedPermissions).construction || {}
        : {};
      console.log("Construction Status permissions:", permissions);
      setConstructionStatusPermissions(permissions);
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
      setConstructionStatusPermissions({});
    }
  }, []);

  useEffect(() => {
    const fetchStatuses = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}construction_statuses.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        setStatuses(response.data);
        connectEvents.onModuleLoaded({ record_count: response.data.length });
        setPagination({
          current_page: getPageFromStorage(),
          total_count: response.data.length,
          total_pages: Math.ceil(response.data.length / pageSize),
        });
      } catch (error) {
        console.error("Error fetching statuses:", error);
        toast.error("Failed to load construction statuses.");
      } finally {
        setLoading(false);
      }
    };

    fetchStatuses();
    // Preserve the original single-load request behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("construction_status_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const filteredStatuses = useMemo(
    () =>
      statuses.filter((status) =>
        (status.construction_status || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, statuses],
  );

  useSearchTracking(searchQuery, filteredStatuses.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredStatuses.length,
      total_pages: Math.ceil(filteredStatuses.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredStatuses.length, searchQuery]);

  const handleToggle = async (id, currentStatus) => {
    toast.dismiss();
    const updatedStatus = !currentStatus;
    try {
      await axios.put(
        `${baseURL}construction_statuses/${id}.json`,
        { construction_status: { active: updatedStatus } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      setStatuses((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, active: updatedStatus } : item,
        ),
      );
      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: !currentStatus ? "active" : "inactive",
      });
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (status) =>
        constructionStatusPermissions.update === "true" ? (
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/construction-status-edit/${status.id}`)
            }
            aria-label={`Edit ${
              status.construction_status || "construction status"
            }`}
            title="Edit"
          >
            <EditIcon />
          </button>
        ) : null,
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_status, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "construction_status",
      label: "Name",
      render: (status) => status.construction_status || "-",
    },
    {
      key: "active",
      label: "Status",
      getSortValue: (status) => Number(Boolean(status.active)),
      render: (status) => (
        <StatusToggle
          active={status.active}
          label={`${status.active ? "Deactivate" : "Activate"} ${
            status.construction_status || "construction status"
          }`}
          onClick={() => handleToggle(status.id, status.active)}
        />
      ),
    },
  ];

  const addButton =
    constructionStatusPermissions.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/setup-member/construction-status")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">CONSTRUCTION STATUS LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredStatuses}
              loading={loading}
              emptyMessage="No statuses found."
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(status) => status.id}
              storageKey="construction-status-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionStatusList;
