/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;

const getPageFromStorage = () =>
  parseInt(localStorage.getItem("organization_currentPage")) || 1;

const EditIcon = () => (
  <svg width="17" height="17" viewBox="0 0 16 16" fill="currentColor">
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

const LockFunctionList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [lockFunctions, setLockFunctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const fetchLockFunctions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${baseURL}lock_functions.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      setLockFunctions(response.data || []);
      setPagination((previous) => ({
        ...previous,
        total_count: response.data?.length || 0,
        total_pages: Math.ceil((response.data?.length || 0) / pageSize),
      }));
    } catch (error) {
      console.error("Error fetching lock functions:", error);
      toast.error("Failed to load lock functions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLockFunctions();
    // Preserve the existing refresh whenever the current page changes.
  }, [pagination.current_page]);

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await axios.patch(
        `${baseURL}lock_functions/${id}.json`,
        {
          lock_function: {
            active: currentStatus === 1 ? 0 : 1,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: currentStatus === 1 ? "inactive" : "active",
      });
      toast.success("Lock function status updated successfully");
      fetchLockFunctions();
    } catch (error) {
      console.error("Error updating lock function status:", error);
      toast.error("Failed to update lock function status");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this lock function?")) {
      try {
        await axios.delete(`${baseURL}lock_functions/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        connectEvents.onRecordDeleted({ record_id: id });
        toast.success("Lock function deleted successfully");
        fetchLockFunctions();
      } catch (error) {
        console.error("Error deleting lock function:", error);
        toast.error("Failed to delete lock function");
      }
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const filteredFunctions = useMemo(
    () =>
      lockFunctions.filter(
        (func) =>
          func.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          func.action_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          func.parent_function
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()),
      ),
    [lockFunctions, searchTerm],
  );

  useSearchTracking(searchTerm, filteredFunctions.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredFunctions.length,
      total_pages: Math.ceil(filteredFunctions.length / pageSize),
      current_page: searchTerm ? 1 : previous.current_page,
    }));
  }, [filteredFunctions.length, searchTerm]);

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) params.set("s[name_cont]", searchTerm);
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
    handlePageChange(1);
  };

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("organization_currentPage", pageNumber);
  };

  const columns = [
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      alwaysVisible: true,
      render: (func) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() => {
              console.log("ID for navigation:", func.id);
              navigate(`/setup-member/lock-function-edit/${func.id}`);
            }}
            aria-label={`Edit ${func.name || "lock function"}`}
            title="Edit"
          >
            <EditIcon />
          </button>
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() => handleDelete(func.id)}
            aria-label={`Delete ${func.name || "lock function"}`}
            title="Delete"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
    { key: "id", label: "ID", render: (func) => func.id || "-" },
    { key: "name", label: "Name", render: (func) => func.name || "-" },
    {
      key: "action_name",
      label: "Action Name",
      render: (func) => func.action_name || "-",
    },
    {
      key: "parent_function",
      label: "Parent Function",
      filterable: true,
      render: (func) => func.parent_function || "-",
    },
    {
      key: "module_id",
      label: "Module ID",
      render: (func) => func.module_id || "-",
    },
    {
      key: "active",
      label: "Status",
      getSortValue: (func) => func.active,
      render: (func) => (
        <StatusToggle
          active={func.active === 1}
          label={func.active === 1 ? "Deactivate" : "Activate"}
          onClick={() => handleToggleStatus(func.id, func.active)}
        />
      ),
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/lock-function")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">LOCK FUNCTION LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredFunctions}
              loading={loading}
              emptyMessage="No lock functions found"
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(func) => func.id}
              storageKey="lock-function-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LockFunctionList;
