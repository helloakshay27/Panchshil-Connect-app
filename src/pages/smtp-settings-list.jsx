import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
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

const SMTPSettingsList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [smtpSetting, setSmtpSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("smtp_settings_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchSMTPSettings = async () => {
      setLoading(true);
      setError("");
      try {
        console.log(
          "Fetching SMTP settings from:",
          `${baseURL}/smtp_settings.json`,
        );
        console.log(
          "Access token:",
          localStorage.getItem("access_token") ? "Present" : "Missing",
        );

        const response = await fetch(`${baseURL}/smtp_settings.json`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Response status:", response.status);
        console.log("Response ok:", response.ok);

        if (!response.ok) {
          const errorText = await response.text();
          console.log("Error response body:", errorText);
          if (response.status === 401) {
            setError("Unauthorized: Please check your API key or token.");
          } else if (response.status === 404) {
            setError("SMTP settings not found.");
          } else {
            setError(`HTTP error! status: ${response.status} - ${errorText}`);
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const contentType = response.headers.get("content-type");
        console.log("Content-Type:", contentType);
        if (!contentType || !contentType.includes("application/json")) {
          const textData = await response.text();
          console.log("Non-JSON response:", textData);
          setError("Invalid response format. Expected JSON.");
          return;
        }

        const data = await response.json();
        console.log("Full API Response:", JSON.stringify(data, null, 2));
        let settingData = null;
        if (data && typeof data === "object") {
          settingData =
            data.smtp_setting || data.smtp_settings || data.setting || data;
          if (Array.isArray(settingData) && settingData.length > 0) {
            settingData = settingData[0];
          }
          if (
            settingData &&
            typeof settingData === "object" &&
            (settingData.address || settingData.email || settingData.port)
          ) {
            console.log("SMTP setting found:", settingData);
            setSmtpSetting(settingData);
            connectEvents.onModuleLoaded({ record_count: 1 });
            setPagination((previous) => ({
              ...previous,
              total_count: 1,
              total_pages: 1,
              current_page: getPageFromStorage(),
            }));
          } else {
            console.log("No valid SMTP setting found in response");
            setSmtpSetting(null);
            connectEvents.onModuleLoaded({ record_count: 0 });
          }
        } else {
          console.log("Invalid response structure");
          setSmtpSetting(null);
        }
      } catch (fetchError) {
        console.error("Error fetching SMTP settings:", fetchError);
        if (fetchError.name === "SyntaxError") {
          setError("Invalid JSON response from server.");
        } else if (fetchError.message.includes("Failed to fetch")) {
          setError("Network error: Unable to connect to server.");
        } else {
          setError(`Failed to fetch SMTP settings: ${fetchError.message}`);
        }
        setSmtpSetting(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSMTPSettings();
    // Load once using the existing module analytics client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredSettings = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return (smtpSetting ? [smtpSetting] : []).filter((setting) =>
      [
        setting.address,
        setting.port,
        setting.user_name,
        setting.email,
        setting.company_name,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [searchQuery, smtpSetting]);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({ ...previous, current_page: pageNumber }));
    localStorage.setItem("smtp_settings_currentPage", pageNumber);
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (setting) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/smtp-settings-edit/${setting.id}`)
            }
            aria-label="Edit SMTP settings"
            title="Edit SMTP Settings"
          >
            <EditIcon />
          </button>
        </div>
      ),
    },
    {
      key: "address",
      label: "Address",
      render: (setting) => setting.address || "-",
    },
    { key: "port", label: "Port", render: (setting) => setting.port || "-" },
    {
      key: "user_name",
      label: "User Name",
      render: (setting) => setting.user_name || "-",
    },
    { key: "email", label: "Email", render: (setting) => setting.email || "-" },
    {
      key: "company_name",
      label: "Company Name",
      render: (setting) => setting.company_name || "-",
    },
  ];

  const createButton = !smtpSetting ? (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/smtp-settings-create")}
    >
      <Plus size={16} />
      <span>Create SMTP Settings</span>
    </button>
  ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">SMTP SETTINGS LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            {error && <div className="alert alert-danger">{error}</div>}
            <EnhancedTable
              columns={columns}
              data={filteredSettings}
              loading={loading}
              emptyMessage={
                searchQuery
                  ? "No SMTP settings found matching your search."
                  : "No SMTP Settings Found"
              }
              searchTerm={searchQuery}
              onSearchChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((previous) => ({ ...previous, current_page: 1 }));
              }}
              searchPlaceholder="Search SMTP settings"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={createButton}
              getRowId={(setting) => setting.id}
              storageKey="smtp-settings-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMTPSettingsList;
