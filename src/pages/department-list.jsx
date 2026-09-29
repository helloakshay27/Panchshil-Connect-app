/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;
const pageStorageKey = "department_list_currentPage";
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

const DepartmentList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [departments, setDepartments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(getPageFromStorage());

  useEffect(() => {
    const fetchDepartments = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}departments.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.departments || [];
        setDepartments(data);
        connectEvents.onModuleLoaded({ record_count: data.length });
      } catch (fetchError) {
        console.error("Error fetching departments:", fetchError);
        setDepartments([]);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartments();
    // Preserve the existing load-once behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    connectEvents.onModulePaginated({ page });
    setCurrentPage(page);
    localStorage.setItem(pageStorageKey, page);
  };

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

  const handleToggle = async (id, active) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${baseURL}departments/${id}.json`,
        { department: { active: !active } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      if (response.status === 200) {
        setDepartments((items) =>
          items.map((item) =>
            item.id === id ? { ...item, active: !active } : item,
          ),
        );
      } else {
        console.error("Failed to update department status:", response);
      }
    } catch (toggleError) {
      console.error("Error updating department status:", toggleError);
    } finally {
      setLoading(false);
    }
  };

  const filteredDepartments = useMemo(
    () =>
      departments.filter((item) =>
        (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
      ),
    [departments, searchQuery],
  );

  useSearchTracking(searchQuery, filteredDepartments.length);

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        alwaysVisible: true,
        render: (item) => (
          <a
            href={`/setup-member/department-edit/${item.id}`}
            className="enhanced-table__action-button"
            aria-label={`Edit ${item.name || "department"}`}
            title="Edit"
          >
            <EditIcon />
          </a>
        ),
      },
      {
        key: "serial_number",
        label: "Sr No",
        sortable: false,
        render: (_item, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "name",
        label: "Department Name",
        render: (item) => item.name || "-",
      },
      {
        key: "company_id",
        label: "Company Name",
        render: (item) => item.company_id || "-",
      },
      {
        key: "organization_id",
        label: "Organization Name",
        render: (item) => item.organization_id || "-",
      },
      {
        key: "active",
        label: "Status",
        getSortValue: (item) => Number(Boolean(item.active)),
        render: (item) => (
          <StatusToggle
            active={Boolean(item.active)}
            label={`${item.active ? "Deactivate" : "Activate"} ${
              item.name || "department"
            }`}
            onClick={() => handleToggle(item.id, item.active)}
          />
        ),
      },
    ],
    [],
  );

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/department-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">DEPARTMENT LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredDepartments}
              loading={loading}
              emptyMessage="No entries found"
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search departments"
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(item) => item.id}
              storageKey="department-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentList;
