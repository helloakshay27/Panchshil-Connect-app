import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import EnhancedTable from "../components/EnhancedTable";
import "../mor.css";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";

const pageSize = 10;

const HomeLoanList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [homeLoans, setHomeLoans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("home_loan_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const filteredHomeLoans = useMemo(
    () =>
      homeLoans
        .filter((loan) =>
          searchQuery
            ? (loan.project?.Project_Name?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              ) ||
              (loan.project?.project_address?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              ) ||
              (loan.required_loan_amt?.toString() || "").includes(searchQuery)
            : true,
        )
        .sort((left, right) => (right.id || 0) - (left.id || 0)),
    [homeLoans, searchQuery],
  );

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredHomeLoans.length,
      total_pages: Math.ceil(filteredHomeLoans.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredHomeLoans.length, searchQuery]);

  useSearchTracking(searchQuery, filteredHomeLoans.length);

  useEffect(() => {
    const fetchHomeLoans = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}home_loans.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setHomeLoans(response.data.home_loans || []);
      } catch (fetchError) {
        setError("Failed to fetch home loans. Please try again later.");
        console.error("Error fetching home loans:", fetchError);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeLoans();
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("home_loan_list_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("s[project_name_cont]", searchQuery);
    }
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return "-";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const columns = [
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      alwaysVisible: true,
      render: (_loan, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "project_name",
      label: "Project Name",
      getSortValue: (loan) => loan.project?.Project_Name || "",
      render: (loan) => loan.project?.Project_Name || "N/A",
    },
    {
      key: "project_address",
      label: "Project Address",
      getSortValue: (loan) => loan.project?.project_address || "",
      render: (loan) => loan.project?.project_address || "N/A",
    },
    {
      key: "required_loan_amt",
      label: "Loan Amount",
      render: (loan) => formatCurrency(loan.required_loan_amt),
    },
    {
      key: "tenure",
      label: "Tenure (Years)",
      render: (loan) => loan.tenure || "-",
    },
    {
      key: "preffered_banks",
      label: "Preferred Banks",
      getSortValue: (loan) =>
        loan.preffered_banks?.map((bank) => bank.bank_name).join(", ") || "",
      render: (loan) =>
        loan.preffered_banks?.length
          ? loan.preffered_banks.map((bank) => bank.bank_name).join(", ")
          : "-",
    },
    {
      key: "created_at",
      label: "Created Date",
      render: (loan) => formatDate(loan.created_at),
    },
  ];

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">HOME LOAN LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredHomeLoans}
              loading={loading}
              emptyMessage={
                error || "No home loans found matching your search criteria"
              }
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search..."
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              getRowId={(loan) => loan.id}
              storageKey="home-loan-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeLoanList;
