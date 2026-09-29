/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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

const formatDate = (dateString) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString();
};

const stripHtml = (value = "") =>
  String(value)
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const TruncatedCell = ({ value }) => (
  <div className="enhanced-table__truncate-cell" title={value || "-"}>
    {value || "-"}
  </div>
);

const AttachmentPreview = ({ attachment }) => {
  if (!attachment?.document_url) return <span>-</span>;

  const fileName = attachment.document_file_name || "";
  const contentType = attachment.document_content_type || "";
  const isVideo =
    contentType.startsWith("video/") ||
    /\.(mp4|mov|avi|mkv|webm)$/i.test(fileName);
  const isImage =
    contentType.startsWith("image/") ||
    /\.(png|jpg|jpeg|gif|svg|webp)$/i.test(fileName);

  if (isVideo) {
    return (
      <video
        width="56"
        height="32"
        autoPlay
        muted
        loop
        playsInline
        style={{
          borderRadius: "4px",
          objectFit: "cover",
          display: "block",
        }}
      >
        <source src={attachment.document_url} type={contentType} />
      </video>
    );
  }

  if (isImage) {
    return (
      <img
        src={attachment.document_url}
        alt={attachment.document_file_name || "Attachment"}
        style={{
          width: "56px",
          height: "32px",
          objectFit: "cover",
          borderRadius: "4px",
          display: "block",
        }}
        onError={(event) => {
          console.error("Failed to load image:", event.target.src);
        }}
      />
    );
  }

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        width: "56px",
        height: "32px",
        border: "1px solid #e4e7ec",
        backgroundColor: "#f8f9fa",
        borderRadius: "4px",
        fontSize: "10px",
        color: "#667085",
      }}
      title={fileName || "File"}
    >
      {fileName ? fileName.split(".").pop().toUpperCase() : "FILE"}
    </div>
  );
};

const ConstructionUpdatesList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [constructionUpdates, setConstructionUpdates] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [constructionPermissions, setConstructionPermissions] = useState({});

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("construction_updates_list_currentPage")) ||
    1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const createAuthenticatedAxios = () => {
    const token =
      localStorage.getItem("authToken") ||
      localStorage.getItem("access_token") ||
      localStorage.getItem("token");

    if (!token) {
      console.error("No authentication token found");
      setError("Authentication token not found. Please login again.");
      return null;
    }

    const axiosInstance = axios.create({
      baseURL,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    axiosInstance.interceptors.request.use(
      (config) => {
        const currentToken =
          localStorage.getItem("authToken") ||
          localStorage.getItem("access_token") ||
          localStorage.getItem("token");
        if (currentToken)
          config.headers.Authorization = `Bearer ${currentToken}`;
        return config;
      },
      (requestError) => Promise.reject(requestError),
    );

    axiosInstance.interceptors.response.use(
      (response) => response,
      (responseError) => {
        if (responseError.response?.status === 401) {
          localStorage.removeItem("authToken");
          localStorage.removeItem("access_token");
          localStorage.removeItem("token");
          toast.error("Session expired. Please login again.");
          navigate("/login");
        }
        return Promise.reject(responseError);
      },
    );

    return axiosInstance;
  };

  useEffect(() => {
    try {
      const storedPermissions = localStorage.getItem("lock_role_permissions");
      const permissions = storedPermissions
        ? JSON.parse(storedPermissions).construction_updates || {}
        : {};
      console.log("Construction Updates permissions:", permissions);
      setConstructionPermissions(permissions);
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
      setConstructionPermissions({});
    }
  }, []);

  useEffect(() => {
    const fetchConstructionUpdates = async () => {
      setLoading(true);
      setError(null);

      const authAxios = createAuthenticatedAxios();
      if (!authAxios) {
        console.warn("Axios instance not created");
        setLoading(false);
        return;
      }

      try {
        const url = `${baseURL}construction_updates.json`;
        console.log("Fetching construction updates from:", url);
        const response = await authAxios.get(url);
        console.log("Raw API data:", response.data);

        const updates = Array.isArray(response.data.construction_updates)
          ? response.data.construction_updates
          : Array.isArray(response.data)
          ? response.data
          : [];

        setConstructionUpdates(updates);
        setPagination({
          total_count: updates.length,
          total_pages: Math.ceil(updates.length / pageSize),
          current_page: getPageFromStorage(),
        });
      } catch (requestError) {
        console.error(
          "Error fetching construction updates:",
          requestError,
          requestError.response?.data,
        );

        if (requestError.response?.status === 401) {
          setError("Authentication failed. Please login again.");
        } else if (requestError.response?.status === 403) {
          setError("You don't have permission to view construction updates.");
        } else if (requestError.response?.status === 404) {
          setError("Construction updates endpoint not found.");
        } else {
          setError(
            `Failed to fetch construction updates: ${requestError.message}`,
          );
        }
      } finally {
        setLoading(false);
      }
    };

    fetchConstructionUpdates();
    // Preserve the original single-load request behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    connectEvents.onModulePaginated({ page });
    setPagination((previous) => ({ ...previous, current_page: page }));
    localStorage.setItem("construction_updates_list_currentPage", page);
  };

  const handleToggle = async (id, currentStatus) => {
    const authAxios = createAuthenticatedAxios();
    if (!authAxios) return;

    const updatedStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      const response = await authAxios.put(`construction_updates/${id}.json`, {
        construction_update: { status: updatedStatus },
      });

      if (response.status === 200) {
        setConstructionUpdates((previous) =>
          previous.map((item) =>
            item.id === id ? { ...item, status: updatedStatus } : item,
          ),
        );
        connectEvents.onRecordStatusChanged({
          record_id: id,
          new_status: !currentStatus ? "active" : "inactive",
        });
        toast.success("Status updated successfully!");
      }
    } catch (toggleError) {
      console.error("Error updating status:", toggleError);
      toast.error("Failed to update status.");
    }
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this construction update?",
    );
    if (!confirmDelete) return;

    const authAxios = createAuthenticatedAxios();
    if (!authAxios) return;

    try {
      await authAxios.delete(`construction_updates/${id}.json`);
      toast.success("Construction update deleted successfully!");
      setConstructionUpdates((previous) =>
        previous.filter((update) => update.id !== id),
      );
      setPagination((previous) => ({
        ...previous,
        total_count: previous.total_count - 1,
        total_pages: Math.ceil((previous.total_count - 1) / pageSize),
      }));
    } catch (deleteError) {
      console.error("Error deleting construction update:", deleteError);
      toast.error("Error deleting construction update. Please try again.");
    }
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("s[title_cont]", searchQuery);
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const filteredUpdates = useMemo(
    () =>
      constructionUpdates
        .filter((update) => {
          const query = searchQuery.toLowerCase();
          if (!query) return true;
          return (
            (update.title?.toLowerCase() || "").includes(query) ||
            stripHtml(update.description).toLowerCase().includes(query) ||
            (update.project_name?.toLowerCase() || "").includes(query)
          );
        })
        .sort((left, right) => (left.id || 0) - (right.id || 0)),
    [constructionUpdates, searchQuery],
  );

  useSearchTracking(searchQuery, filteredUpdates.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredUpdates.length,
      total_pages: Math.ceil(filteredUpdates.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredUpdates.length, searchQuery]);

  const columns = [
    {
      key: "actions",
      label: "Action",
      width: 110,
      sortable: false,
      alwaysVisible: true,
      render: (update) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/construction-updates-edit/${update.id}`)
            }
            aria-label={`Edit ${update.title || "construction update"}`}
            title="Edit"
          >
            <EditIcon />
          </button>
          <StatusToggle
            active={update.status === "active"}
            label={`${update.status === "active" ? "Deactivate" : "Activate"} ${
              update.title || "construction update"
            }`}
            onClick={() => handleToggle(update.id, update.status)}
          />
          {constructionPermissions.delete === "true" && (
            <button
              type="button"
              className="enhanced-table__action-button"
              onClick={() => handleDelete(update.id)}
              aria-label={`Delete ${update.title || "construction update"}`}
              title="Delete"
            >
              <Trash2 size={16} color="#dc3545" />
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
      render: (_update, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "title",
      label: "Title",
      width: 150,
      filterable: true,
      render: (update) => <TruncatedCell value={update.title} />,
    },
    {
      key: "description",
      label: "Description",
      width: 220,
      getSortValue: (update) => stripHtml(update.description),
      render: (update) => (
        <TruncatedCell value={stripHtml(update.description)} />
      ),
    },
    {
      key: "on_date",
      label: "Date",
      width: 110,
      getSortValue: (update) =>
        update.on_date ? new Date(update.on_date).getTime() : null,
      render: (update) => formatDate(update.on_date),
    },
    {
      key: "project_name",
      label: "Project Name",
      width: 160,
      filterable: true,
      render: (update) => <TruncatedCell value={update.project_name} />,
    },
    {
      key: "sfdc_id",
      label: "SFDC ID",
      width: 120,
      render: (update) => <TruncatedCell value={update.sfdc_id} />,
    },
    {
      key: "site_name",
      label: "Site ID",
      width: 110,
      render: (update) => <TruncatedCell value={update.site_name} />,
    },
    {
      key: "building_name",
      label: "Building ID",
      width: 120,
      render: (update) => <TruncatedCell value={update.building_name} />,
    },
    {
      key: "attachment",
      label: "Attachment",
      width: 90,
      sortable: false,
      className: "enhanced-table__media-cell",
      render: (update) => <AttachmentPreview attachment={update.attachment} />,
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/construction-updates-create")}
      aria-label="Add a new construction update"
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">CONSTRUCTION UPDATES LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredUpdates}
              loading={loading}
              emptyMessage={error || "No construction updates found"}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search by title or description"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(update) => update.id}
              storageKey="construction-updates-list-v2"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionUpdatesList;
