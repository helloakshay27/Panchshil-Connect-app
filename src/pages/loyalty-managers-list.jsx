import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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

const LoyaltyManagerList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [loyaltyManagers, setLoyaltyManagers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("loyalty_manager_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchLoyaltyManagers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}loyalty_managers.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setLoyaltyManagers(response.data);
        connectEvents.onModuleLoaded({ record_count: response.data.length });
        setPagination({
          current_page: getPageFromStorage(),
          total_count: response.data.length,
          total_pages: Math.ceil(response.data.length / pageSize),
        });
      } catch (error) {
        console.error("Error fetching loyalty managers:", error);
        toast.error("Failed to load loyalty managers.");
      } finally {
        setLoading(false);
      }
    };

    fetchLoyaltyManagers();
    // The list is intentionally loaded once from the existing API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((prev) => ({
      ...prev,
      current_page: pageNumber,
    }));
    localStorage.setItem("loyalty_manager_currentPage", pageNumber);
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

  const filteredLoyaltyManagers = useMemo(
    () =>
      loyaltyManagers.filter(
        (manager) =>
          manager.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          manager.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          manager.mobile?.includes(searchQuery),
      ),
    [loyaltyManagers, searchQuery],
  );

  useSearchTracking(searchQuery, filteredLoyaltyManagers.length);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredLoyaltyManagers.length / pageSize),
    );
    setPagination((previous) => ({
      ...previous,
      total_count: filteredLoyaltyManagers.length,
      total_pages: totalPages,
      current_page:
        previous.current_page > totalPages ? 1 : previous.current_page,
    }));

    if (pagination.current_page > totalPages) {
      localStorage.setItem("loyalty_manager_currentPage", 1);
    }
  }, [filteredLoyaltyManagers.length, pagination.current_page]);

  const handleDelete = async (id) => {
    if (
      !window.confirm("Are you sure you want to delete this loyalty manager?")
    ) {
      return;
    }

    try {
      await axios.delete(`${baseURL}loyalty_managers/${id}.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      setLoyaltyManagers((prev) => prev.filter((item) => item.id !== id));
      connectEvents.onRecordDeleted({ record_id: id });
      toast.success("Loyalty manager deleted successfully!");
    } catch (error) {
      console.error("Error deleting loyalty manager:", error);
      toast.error("Failed to delete loyalty manager.");
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (manager) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/loyalty-managers-edit/${manager.id}`)
            }
            aria-label={`Edit ${manager.name || "loyalty manager"}`}
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="enhanced-table__action-button is-danger"
            onClick={() => handleDelete(manager.id)}
            aria-label={`Delete ${manager.name || "loyalty manager"}`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_manager, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      render: (manager) => manager.name || "-",
    },
    {
      key: "email",
      label: "Email",
      render: (manager) => manager.email || "-",
    },
    {
      key: "mobile",
      label: "Mobile",
      render: (manager) => manager.mobile || "-",
    },
    {
      key: "project_name",
      label: "Project",
      filterable: true,
      render: (manager) => manager.project_name || "-",
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/loyalty-managers-create")}
      aria-label="Add a new loyalty manager"
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">LOYALTY MANAGER LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredLoyaltyManagers}
              loading={loading}
              emptyMessage="No loyalty managers found."
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search loyalty managers"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(manager) => manager.id}
              storageKey="loyalty-manager-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoyaltyManagerList;
