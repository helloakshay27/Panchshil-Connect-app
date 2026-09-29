/* eslint-disable react/prop-types */
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import EnhancedTable from "../components/EnhancedTable";
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

const BankDetailsList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [bankDetailsList, setBankDetailsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("bank_details_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchBankDetailsList = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}bank_details.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const bankDetails = Array.isArray(response.data)
          ? response.data
          : response.data.bank_details || [];

        console.log("Bank Details data:", bankDetails);
        setBankDetailsList(bankDetails);
        connectEvents.onModuleLoaded({ record_count: bankDetails.length });
        setPagination({
          current_page: getPageFromStorage(),
          total_count: bankDetails.length,
          total_pages: Math.ceil(bankDetails.length / pageSize),
        });
      } catch (error) {
        console.error("Error fetching bank details:", error);
        setBankDetailsList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchBankDetailsList();
    // Preserve the existing one-time module load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("bank_details_list_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const filteredData = useMemo(
    () =>
      bankDetailsList.filter(
        (bankDetail) =>
          bankDetail.bank_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bankDetail.account_number
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bankDetail.benficary_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          bankDetail.branch_name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()),
      ),
    [bankDetailsList, searchQuery],
  );

  useSearchTracking(searchQuery, filteredData.length);

  const handleToggleBankDetail = async (id, active) => {
    setLoading(true);
    try {
      const response = await axios.put(
        `${baseURL}bank_details/${id}.json`,
        { bank_detail: { active: !active } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      if (response.status === 200) {
        setBankDetailsList((previous) =>
          previous.map((bankDetail) =>
            bankDetail.id === id
              ? { ...bankDetail, active: !active }
              : bankDetail,
          ),
        );
      } else {
        console.error("Failed to update bank detail status:", response);
      }
    } catch (error) {
      console.error("Error updating bank detail status:", error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (bankDetail) => (
        <div className="enhanced-table__row-actions">
          <a
            href={`/setup-member/bank-details-edit/${bankDetail.id}`}
            className="enhanced-table__action-button"
            aria-label={`Edit ${bankDetail.bank_name || "bank detail"}`}
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
      render: (_bankDetail, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "bank_name",
      label: "Bank Name",
      render: (bankDetail) => bankDetail.bank_name || "-",
    },
    {
      key: "account_number",
      label: "Account Number",
      render: (bankDetail) => bankDetail.account_number || "-",
    },
    {
      key: "benficary_name",
      label: "Beneficiary Name",
      render: (bankDetail) => bankDetail.benficary_name || "-",
    },
    {
      key: "branch_name",
      label: "Branch Name",
      render: (bankDetail) => bankDetail.branch_name || "-",
    },
    {
      key: "ifsc_code",
      label: "IFSC Code",
      render: (bankDetail) => bankDetail.ifsc_code || "-",
    },
    {
      key: "account_type",
      label: "Account Type",
      filterable: true,
      render: (bankDetail) => bankDetail.account_type || "-",
    },
    {
      key: "resource_type",
      label: "Resource Type",
      filterable: true,
      render: (bankDetail) => bankDetail.resource_type || "-",
    },
    {
      key: "active",
      label: "Status",
      getSortValue: (bankDetail) => Number(Boolean(bankDetail.active)),
      render: (bankDetail) => (
        <StatusToggle
          active={bankDetail.active}
          label={`${bankDetail.active ? "Deactivate" : "Activate"} ${
            bankDetail.bank_name || "bank detail"
          }`}
          onClick={() =>
            handleToggleBankDetail(bankDetail.id, bankDetail.active)
          }
        />
      ),
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/bank-details-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">BANK DETAILS LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredData}
              loading={loading}
              emptyMessage="No bank details found."
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(bankDetail) => bankDetail.id}
              storageKey="bank-details-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankDetailsList;
