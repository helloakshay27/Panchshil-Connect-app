/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import EnhancedTable from "../components/EnhancedTable";
import { useConnectEvents } from "../hooks/useConnectEvents";
import { useSearchTracking } from "../hooks/useSearchTracking";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";

const pageSize = 10;
const pageStorageKey = "amenities_list_currentPage";
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

const AmenitiesList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [amenities, setAmenities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [permission, setPermission] = useState({});
  const [currentPage, setCurrentPage] = useState(getPageFromStorage());

  useEffect(() => {
    try {
      const permissions = JSON.parse(
        localStorage.getItem("lock_role_permissions") || "{}",
      );
      setPermission(permissions.amenities || {});
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
    }
  }, []);

  useEffect(() => {
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(`${baseURL}amenity_setups.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        const data = response.data.amenities_setups || [];
        setAmenities(data);
        connectEvents.onModuleLoaded({ record_count: data.length });
      } catch (fetchError) {
        console.error("Error fetching amenities:", fetchError);
        setError("Failed to fetch amenities data");
      } finally {
        setLoading(false);
      }
    };
    fetchAmenities();
    // Preserve the existing load-once behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (page) => {
    connectEvents.onModulePaginated({ page });
    setCurrentPage(page);
    localStorage.setItem(pageStorageKey, page);
  };

  const handleToggle = useCallback(
    async (id, active) => {
      const updatedStatus = !active;
      try {
        const response = await axios.put(
          `${baseURL}amenity_setups/${id}.json`,
          { amenity_setup: { active: updatedStatus } },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        if (response.status === 200) {
          setAmenities((items) =>
            items.map((item) =>
              item.id === id ? { ...item, active: updatedStatus } : item,
            ),
          );
          connectEvents.onRecordStatusChanged({
            record_id: id,
            new_status: updatedStatus ? "active" : "inactive",
          });
          toast.success("Status updated successfully!");
        }
      } catch (toggleError) {
        console.error("Error updating status:", toggleError);
        toast.error("Failed to update status.");
      }
    },
    [connectEvents],
  );

  const handleNightModeToggle = useCallback(async (id, nightMode) => {
    const updatedValue = !nightMode;
    try {
      await axios.put(
        `${baseURL}amenity_setups/${id}.json`,
        { amenity_setup: { night_mode: updatedValue } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );
      setAmenities((items) =>
        items.map((item) =>
          item.id === id ? { ...item, night_mode: updatedValue } : item,
        ),
      );
      toast.success(`Night Mode ${updatedValue ? "enabled" : "disabled"}`);
    } catch (toggleError) {
      console.error(toggleError);
      toast.error("Failed to toggle night mode");
    }
  }, []);

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

  const filteredAmenities = useMemo(
    () =>
      amenities
        .filter((item) =>
          (item.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()),
        )
        .sort((left, right) => (left.id || 0) - (right.id || 0)),
    [amenities, searchQuery],
  );

  useSearchTracking(searchQuery, filteredAmenities.length);

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        alwaysVisible: true,
        render: (item) =>
          permission.update === "true" ? (
            <div className="enhanced-table__row-actions">
              <button
                type="button"
                className="enhanced-table__action-button"
                onClick={() =>
                  navigate(`/setup-member/edit-amenities/${item.id}`)
                }
                aria-label={`Edit ${item.name || "amenity"}`}
                title="Edit"
              >
                <EditIcon />
              </button>
              <StatusToggle
                active={Boolean(item.active)}
                label={`${item.active ? "Deactivate" : "Activate"} ${
                  item.name || "amenity"
                }`}
                onClick={() => handleToggle(item.id, item.active)}
              />
            </div>
          ) : null,
      },
      {
        key: "serial_number",
        label: "Sr No",
        sortable: false,
        render: (_item, { absoluteIndex }) => absoluteIndex + 1,
      },
      { key: "name", label: "Name", render: (item) => item.name || "-" },
      {
        key: "icon_url",
        label: "Icon",
        sortable: false,
        className: "enhanced-table__media-cell",
        render: (item) =>
          item.icon_url ? (
            <img
              src={item.icon_url}
              className="img-fluid rounded"
              alt={item.name || "No Name"}
              style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
              }}
            />
          ) : (
            "No Icon"
          ),
      },
      {
        key: "dark_mode_icon_url",
        label: "Dark Mode Icon",
        sortable: false,
        className: "enhanced-table__media-cell",
        render: (item) =>
          item.dark_mode_icon_url ? (
            <img
              src={item.dark_mode_icon_url}
              className="img-fluid rounded"
              alt={item.name || "No Name"}
              style={{
                width: "32px",
                height: "32px",
                objectFit: "contain",
              }}
            />
          ) : (
            "No Icon"
          ),
      },
      {
        key: "night_mode",
        label: "Night Mode",
        getSortValue: (item) => Number(Boolean(item.night_mode)),
        render: (item) => (
          <StatusToggle
            active={Boolean(item.night_mode)}
            label={`${item.night_mode ? "Disable" : "Enable"} night mode for ${
              item.name || "amenity"
            }`}
            onClick={() => handleNightModeToggle(item.id, item.night_mode)}
          />
        ),
      },
    ],
    [handleNightModeToggle, handleToggle, navigate, permission],
  );

  const addButton =
    permission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/setup-member/amenities")}
        aria-label="Add a new amenity"
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">AMENITIES SETUP LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredAmenities}
              loading={loading}
              emptyMessage={error || "No amenities found"}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search amenities"
              currentPage={currentPage}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(item) => item.id}
              storageKey="amenities-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AmenitiesList;
