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
const pageStorageKey = "project_config_currentPage";
const getPageFromStorage = () =>
  parseInt(localStorage.getItem(pageStorageKey)) || 1;

const EditIcon = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor">
    <path d="M15.502 1.94a.5.5 0 0 1 0 .706l-1 1-2-2 1-1a.5.5 0 0 1 .707 0l1.293 1.293ZM13.793 4.354l-2-2L4.939 9.207a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.854-6.854Z" />
    <path d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11Z" />
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

const ProjectConfigurationList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [configurations, setConfigurations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [permission, setPermission] = useState({});
  const [currentPage, setCurrentPage] = useState(getPageFromStorage());

  useEffect(() => {
    try {
      const permissions = JSON.parse(
        localStorage.getItem("lock_role_permissions") || "{}",
      );
      setPermission(permissions.project_config || {});
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
    }
  }, []);

  useEffect(() => {
    const fetchConfigurations = async () => {
      try {
        const response = await axios.get(
          `${baseURL}configuration_setups.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        const data = response.data || [];
        setConfigurations(data);
        connectEvents.onModuleLoaded({ record_count: data.length });
      } catch {
        setError("Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };
    fetchConfigurations();
    // Preserve the existing load-once behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    connectEvents.onModulePaginated({ page });
    setCurrentPage(page);
    localStorage.setItem(pageStorageKey, page);
  };

  const handleToggleStatus = useCallback(
    async (id, active) => {
      toast.dismiss();
      try {
        await axios.patch(
          `${baseURL}configuration_setups/${id}.json`,
          { active: !active },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          },
        );
        setConfigurations((items) =>
          items.map((item) =>
            item.id === id ? { ...item, active: !active } : item,
          ),
        );
        connectEvents.onRecordStatusChanged({
          record_id: id,
          new_status: !active ? "active" : "inactive",
        });
        toast.success("Status updated successfully!");
      } catch {
        setError("Failed to update status");
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
    if (searchQuery) params.set("s[name_cont]", searchQuery);
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const filteredConfigurations = useMemo(
    () =>
      configurations.filter((item) =>
        (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
      ),
    [configurations, searchQuery],
  );

  useSearchTracking(searchQuery, filteredConfigurations.length);

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        alwaysVisible: true,
        render: (item) =>
          permission.update === "true" ? (
            <a
              href={`/setup-member/project-config-edit/${item.id}`}
              className="enhanced-table__action-button"
              aria-label={`Edit ${item.name || "configuration"}`}
              title="Edit"
            >
              <EditIcon />
            </a>
          ) : null,
      },
      {
        key: "serial_number",
        label: "Sr No",
        sortable: false,
        render: (_item, { absoluteIndex }) => absoluteIndex + 1,
      },
      { key: "name", label: "Name", render: (item) => item.name || "-" },
      {
        key: "attachment",
        label: "Attachment",
        sortable: false,
        className: "enhanced-table__media-cell",
        render: (item) => {
          const attachment = item.attachfile;
          if (!attachment?.document_file_name) return "No Attachment";
          return attachment.document_content_type?.startsWith("image/") ? (
            <img
              src={attachment.document_url}
              alt="Attachment"
              className="img-thumbnail"
              style={{
                width: "32px",
                height: "32px",
                padding: "2px",
                objectFit: "contain",
              }}
            />
          ) : (
            <a
              href={attachment.document_url}
              target="_blank"
              rel="noopener noreferrer"
              className="enhanced-table__truncate-cell"
              title={attachment.document_file_name}
            >
              {attachment.document_file_name}
            </a>
          );
        },
      },
      {
        key: "active",
        label: "Status",
        getSortValue: (item) => Number(Boolean(item.active)),
        render: (item) =>
          permission.show === "true" ? (
            <StatusToggle
              active={Boolean(item.active)}
              label={`${item.active ? "Deactivate" : "Activate"} ${
                item.name || "configuration"
              }`}
              onClick={() => handleToggleStatus(item.id, item.active)}
            />
          ) : null,
      },
    ],
    [handleToggleStatus, permission],
  );

  const addButton =
    permission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/setup-member/project-configuration")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">PROJECT CONFIGURATION</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredConfigurations}
              loading={loading}
              emptyMessage={error || "No Data Available"}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search configurations"
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(item) => item.id}
              storageKey="project-configuration-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectConfigurationList;
