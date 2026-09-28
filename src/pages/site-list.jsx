import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
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

const SiteList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [siteList, setSiteList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [sitePermission, setSitePermission] = useState({});

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("site_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const getSitePermission = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};

      const permissions = JSON.parse(lockRolePermissions);
      return permissions.site || {};
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
      return {};
    }
  };

  useEffect(() => {
    const permissions = getSitePermission();
    console.log("Site permissions:", permissions);
    setSitePermission(permissions);
  }, []);

  useEffect(() => {
    const fetchSiteList = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}sites.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });

        console.log("Sites API response:", response.data);

        const sites = Array.isArray(response.data)
          ? response.data
          : response.data.sites
          ? response.data.sites
          : [];

        setSiteList(sites);
        connectEvents.onModuleLoaded({ record_count: sites.length });
        setPagination({
          current_page: getPageFromStorage(),
          total_count: sites.length,
          total_pages: Math.ceil(sites.length / pageSize),
        });
      } catch (error) {
        console.error("Error fetching sites:", error);
        setSiteList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSiteList();
    // Preserve the existing one-time list load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("site_list_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) params.set("s[name_cont]", searchQuery);
    navigate(`${window.location.pathname}?${params.toString()}`, {
      replace: true,
    });
  };

  const filteredSites = useMemo(
    () =>
      siteList.filter((site) =>
        site.name?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, siteList],
  );

  useSearchTracking(searchQuery, filteredSites.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredSites.length,
      total_pages: Math.ceil(filteredSites.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredSites.length, searchQuery]);

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Action",
        sortable: false,
        alwaysVisible: true,
        render: (site) => (
          <div className="enhanced-table__row-actions">
            {sitePermission.update === "true" && (
              <a
                href={`/site-edit/${site.id}`}
                className="enhanced-table__action-button"
                aria-label={`Edit ${site.name || "site"}`}
                title="Edit"
              >
                <EditIcon />
              </a>
            )}
          </div>
        ),
      },
      {
        key: "serial_number",
        label: "Sr No",
        sortable: false,
        render: (_site, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "name",
        label: "Site Name",
        filterable: true,
        render: (site) => site.name || "-",
      },
      {
        key: "site_company_name",
        label: "Company",
        filterable: true,
        render: (site) => site.site_company_name || "-",
      },
      {
        key: "site_department_name",
        label: "Department",
        filterable: true,
        render: (site) => site.site_department_name || "-",
      },
      {
        key: "site_project_name",
        label: "Project",
        filterable: true,
        render: (site) => site.site_project_name || "-",
      },
    ],
    [sitePermission.update],
  );

  const addButton =
    sitePermission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/site-create")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">SITE LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredSites}
              loading={loading}
              emptyMessage="No sites found"
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search sites"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(site) => site.id}
              storageKey="site-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteList;
