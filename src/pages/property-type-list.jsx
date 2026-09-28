/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
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

const PropertyTypeList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [propertyTypes, setPropertyTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [propertyTypePermission, setPropertyTypePermission] = useState({});

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("property_type_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    try {
      const storedPermissions = localStorage.getItem("lock_role_permissions");
      const permissions = storedPermissions
        ? JSON.parse(storedPermissions).property_type || {}
        : {};
      console.log("Property Type permissions:", permissions);
      setPropertyTypePermission(permissions);
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
      setPropertyTypePermission({});
    }
  }, []);

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}property_types.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        });
        setPropertyTypes(response.data);
        connectEvents.onModuleLoaded({ record_count: response.data.length });
        setPagination({
          current_page: getPageFromStorage(),
          total_count: response.data.length,
          total_pages: Math.ceil(response.data.length / pageSize),
        });
      } catch (error) {
        console.error("Error fetching property types:", error);
        toast.error("Failed to load property types.");
      } finally {
        setLoading(false);
      }
    };

    fetchPropertyTypes();
    // Preserve the original single-load request behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("property_type_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const handleSearchSubmit = () => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("s[name_cont]", searchQuery);
    navigate(`/pms/departments?${params.toString()}`);
  };

  const filteredPropertyTypes = useMemo(
    () =>
      propertyTypes.filter((property) =>
        property.property_type
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [propertyTypes, searchQuery],
  );

  useSearchTracking(searchQuery, filteredPropertyTypes.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredPropertyTypes.length,
      total_pages: Math.ceil(filteredPropertyTypes.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredPropertyTypes.length, searchQuery]);

  const handleToggle = async (id, currentStatus) => {
    toast.dismiss();
    const updatedStatus = !currentStatus;
    try {
      await axios.put(
        `${baseURL}property_types/${id}.json`,
        { property_type: { active: updatedStatus } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      setPropertyTypes((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, active: updatedStatus } : item,
        ),
      );
      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: !currentStatus ? "active" : "inactive",
      });
      toast.success("Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      width: 170,
      sortable: false,
      alwaysVisible: true,
      render: (property) =>
        propertyTypePermission.update === "true" ? (
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/property-type-edit/${property.id}`)
            }
            aria-label={`Edit ${property.property_type || "property type"}`}
            title="Edit"
          >
            <EditIcon />
          </button>
        ) : null,
    },
    {
      key: "serial_number",
      label: "Sr No",
      width: 170,
      sortable: false,
      render: (_property, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "property_type",
      label: "Name",
      width: 280,
      render: (property) => property.property_type || "-",
    },
    {
      key: "active",
      label: "Status",
      width: 280,
      getSortValue: (property) => Number(Boolean(property.active)),
      render: (property) =>
        propertyTypePermission.show === "true" ? (
          <StatusToggle
            active={property.active}
            label={`${property.active ? "Deactivate" : "Activate"} ${
              property.property_type || "property type"
            }`}
            onClick={() => handleToggle(property.id, property.active)}
          />
        ) : null,
    },
  ];

  const addButton =
    propertyTypePermission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/setup-member/property-type")}
        aria-label="Add a new amenity"
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">PROPERTY TYPE LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredPropertyTypes}
              loading={loading}
              emptyMessage="No property types found."
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(property) => property.id}
              storageKey="property-type-list-compact"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyTypeList;
