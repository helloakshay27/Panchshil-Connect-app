import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import EnhancedTable from "../components/EnhancedTable";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
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

const ImageConfig = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [imageConfigs, setImageConfigs] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("image_config_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchImageConfigs = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}system_constants.json?q[description_eq]=ImagesConfiguration`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );

        const data = response.data;

        if (Array.isArray(data)) {
          setImageConfigs(data);
          connectEvents.onModuleLoaded({ record_count: data.length });
          setPagination({
            total_count: data.length,
            total_pages: Math.ceil(data.length / pageSize),
            current_page: getPageFromStorage(),
          });
        } else {
          console.error("Expected array but got:", data);
          setImageConfigs([]);
        }
      } catch (fetchError) {
        console.error("Error fetching image configurations:", fetchError);
        setError("Failed to fetch image configuration data");
      } finally {
        setLoading(false);
      }
    };

    fetchImageConfigs();
    // The list is intentionally loaded once from the existing API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    connectEvents.onModulePaginated({ page });
    setPagination((previous) => ({ ...previous, current_page: page }));
    localStorage.setItem("image_config_currentPage", page);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
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

  const filteredConfigs = useMemo(
    () =>
      imageConfigs
        .filter((config) =>
          (config.name?.toLowerCase() || "").includes(
            searchQuery.toLowerCase(),
          ),
        )
        .sort((left, right) => (left.id || 0) - (right.id || 0)),
    [imageConfigs, searchQuery],
  );

  useSearchTracking(searchQuery, filteredConfigs.length);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredConfigs.length / pageSize),
    );
    setPagination((previous) => ({
      ...previous,
      total_count: filteredConfigs.length,
      total_pages: totalPages,
      current_page:
        previous.current_page > totalPages ? 1 : previous.current_page,
    }));

    if (pagination.current_page > totalPages) {
      localStorage.setItem("image_config_currentPage", 1);
    }
  }, [filteredConfigs.length, pagination.current_page]);

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (config) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() => navigate(`/setup-member/image-config/${config.id}`)}
            aria-label={`Edit ${config.name || "image configuration"}`}
            title="Edit"
          >
            <EditIcon />
          </button>
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_config, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      render: (config) => config.name || "-",
    },
    {
      key: "value",
      label: "Value",
      render: (config) => config.value || "-",
    },
    {
      key: "description",
      label: "Description",
      filterable: true,
      render: (config) => config.description || "-",
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/image-config-create")}
      aria-label="Add a new image configuration"
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">IMAGE CONFIGURATION LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredConfigs}
              loading={loading}
              emptyMessage={error || "No image configurations found"}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search image configurations"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(config) => config.id}
              storageKey="image-config-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageConfig;
