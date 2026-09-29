/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import axios from "axios";
import EnhancedTable from "../components/EnhancedTable";
import "../mor.css";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";

const pageSize = 10;

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

const LoanManagerList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [loanManagers, setLoanManagers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("loan_manager_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const onToggle = async (loanManagerId, currentStatus) => {
    toast.dismiss();
    setLoading(true);
    try {
      const response = await axios.put(
        `${baseURL}loan_managers/${loanManagerId}.json`,
        { loan_manager: { active: !currentStatus } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.status === 200) {
        setLoanManagers((previous) =>
          previous.map((loanManager) =>
            loanManager.id === loanManagerId
              ? { ...loanManager, active: !currentStatus }
              : loanManager,
          ),
        );
        connectEvents.onRecordStatusChanged({
          record_id: loanManagerId,
          new_status: !currentStatus ? "active" : "inactive",
        });
        toast.success("Loan Manager status updated successfully!");
      }
    } catch (toggleError) {
      console.error("Error toggling loan manager status:", toggleError);
      toast.error("Failed to update loan manager status. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filteredLoanManagers = useMemo(
    () =>
      loanManagers
        .filter((loanManager) =>
          searchQuery
            ? (loanManager.name?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              ) ||
              (loanManager.email?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              ) ||
              (loanManager.mobile?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              )
            : true,
        )
        .sort((left, right) => (right.id || 0) - (left.id || 0)),
    [loanManagers, searchQuery],
  );

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredLoanManagers.length,
      total_pages: Math.ceil(filteredLoanManagers.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredLoanManagers.length, searchQuery]);

  useSearchTracking(searchQuery, filteredLoanManagers.length);

  useEffect(() => {
    const fetchLoanManagers = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}loan_managers.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setLoanManagers(response.data || []);
      } catch (fetchError) {
        setError("Failed to fetch loan managers. Please try again later.");
        console.error("Error fetching loan managers:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchLoanManagers();
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("loan_manager_list_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
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

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (loanManager) => (
        <div className="enhanced-table__row-actions">
          <a
            href={`/setup-member/loan-manager-edit/${loanManager.id}`}
            className="enhanced-table__action-button"
            aria-label={`Edit ${loanManager.name || "loan manager"}`}
            title="Edit"
          >
            <EditIcon />
          </a>
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_loanManager, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      render: (loanManager) => loanManager.name || "-",
    },
    {
      key: "email",
      label: "Email",
      render: (loanManager) => loanManager.email || "-",
    },
    {
      key: "mobile",
      label: "Mobile",
      render: (loanManager) => loanManager.mobile || "-",
    },
    {
      key: "project_id",
      label: "Project ID",
      render: (loanManager) => loanManager.project_id || "-",
    },
    {
      key: "active",
      label: "Status",
      getSortValue: (loanManager) => Number(Boolean(loanManager.active)),
      render: (loanManager) => (
        <StatusToggle
          active={loanManager.active}
          label={`${loanManager.active ? "Deactivate" : "Activate"} ${
            loanManager.name || "loan manager"
          }`}
          onClick={() => onToggle(loanManager.id, loanManager.active)}
        />
      ),
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/loan-manager-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">LOAN MANAGER LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredLoanManagers}
              loading={loading}
              emptyMessage={
                error || "No loan managers found matching your search criteria"
              }
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search by name, email or mobile"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(loanManager) => loanManager.id}
              storageKey="loan-manager-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoanManagerList;
