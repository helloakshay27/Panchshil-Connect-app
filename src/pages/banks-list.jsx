import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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

const BankList = () => {
  const connectEvents = useConnectEvents();
  const [banks, setBanks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("bank_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBanks = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}banks.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        let banksData = [];
        if (Array.isArray(response.data)) {
          banksData = response.data;
        } else if (response.data.banks) {
          banksData = response.data.banks;
        } else if (Array.isArray(response.data.data)) {
          banksData = response.data.data;
        } else if (response.data.bank) {
          banksData = [response.data.bank];
        }

        setBanks(banksData);
        connectEvents.onModuleLoaded({ record_count: banksData.length });
        setPagination((prevState) => ({
          ...prevState,
          total_count: banksData.length,
          total_pages: Math.ceil(banksData.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (error) {
        console.error("Error fetching banks:", error);
        toast.error("Failed to load banks.");
      } finally {
        setLoading(false);
      }
    };

    fetchBanks();
    // Preserve the existing one-time module load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((prevState) => ({
      ...prevState,
      current_page: pageNumber,
    }));
    localStorage.setItem("bank_currentPage", pageNumber);
  };

  const filteredBanks = useMemo(
    () =>
      Array.isArray(banks)
        ? banks.filter((bank) =>
            String(bank?.bank_name || "")
              .toLowerCase()
              .includes(String(searchQuery).toLowerCase()),
          )
        : [],
    [banks, searchQuery],
  );

  useSearchTracking(searchQuery, filteredBanks.length);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch {
      return "-";
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (bank) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() => navigate(`/setup-member/banks/${bank.id}/edit`)}
            aria-label={`Edit ${bank.bank_name || "bank"}`}
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
      render: (_bank, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "bank_name",
      label: "Bank Name",
      render: (bank) => bank.bank_name || "-",
    },
    {
      key: "interest_rate",
      label: "Interest Rate (%)",
      render: (bank) => (bank.interest_rate ? `${bank.interest_rate}%` : "-"),
    },
    {
      key: "bank_logo",
      label: "Bank Logo",
      sortable: false,
      render: (bank) =>
        bank.bank_logo ? (
          <>
            <img
              src={bank.bank_logo}
              className="img-fluid rounded"
              alt={bank.bank_name || "Bank Logo"}
              style={{
                maxWidth: "80px",
                maxHeight: "60px",
                objectFit: "contain",
              }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextSibling.style.display = "inline";
              }}
            />
            <span style={{ display: "none" }}>Logo Not Available</span>
          </>
        ) : (
          <span>No Logo</span>
        ),
    },
    {
      key: "created_at",
      label: "Created Date",
      render: (bank) => formatDate(bank.created_at),
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/banks/create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">BANKS LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredBanks}
              loading={loading}
              emptyMessage="No banks found."
              searchTerm={searchQuery}
              onSearchChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((previous) => ({
                  ...previous,
                  current_page: 1,
                }));
              }}
              searchPlaceholder="Search banks..."
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(bank) => bank.id}
              storageKey="banks-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BankList;
