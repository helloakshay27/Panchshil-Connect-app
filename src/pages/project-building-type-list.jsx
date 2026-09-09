/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
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

const ProjectBuildingTypeList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectBuildingPermission, setProjectBuildingPermission] = useState(
    {},
  );

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("building_type_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    try {
      const storedPermissions = localStorage.getItem("lock_role_permissions");
      const permissions = storedPermissions
        ? JSON.parse(storedPermissions).project_building || {}
        : {};
      console.log("Project Building permissions:", permissions);
      setProjectBuildingPermission(permissions);
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
      setProjectBuildingPermission({});
    }
  }, []);

  const fetchBuildingTypes = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${baseURL}building_types.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });
      setBuildingTypes(response.data);
      connectEvents.onModuleLoaded({ record_count: response.data.length });
      setPagination({
        current_page: getPageFromStorage(),
        total_count: response.data.length,
        total_pages: Math.ceil(response.data.length / pageSize),
      });
    } catch (error) {
      console.error("Error fetching building types:", error);
      toast.error("Failed to fetch building types");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuildingTypes();
    // Preserve the original single-load request behavior.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("building_type_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
    setPagination((previous) => ({ ...previous, current_page: 1 }));
  };

  const filteredBuildingTypes = useMemo(
    () =>
      buildingTypes.filter((type) =>
        type.building_type?.toLowerCase().includes(searchQuery.toLowerCase()),
      ),
    [buildingTypes, searchQuery],
  );

  useSearchTracking(searchQuery, filteredBuildingTypes.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredBuildingTypes.length,
      total_pages: Math.ceil(filteredBuildingTypes.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredBuildingTypes.length, searchQuery]);

  const handleToggle = async (id, currentStatus) => {
    toast.dismiss();
    try {
      await axios.put(
        `${baseURL}building_types/${id}.json`,
        { building_type: { active: !currentStatus } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: !currentStatus ? "active" : "inactive",
      });
      toast.success("Status updated successfully");
      fetchBuildingTypes();
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (type) =>
        projectBuildingPermission.update === "true" ? (
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/project-building-type-edit/${type.id}`)
            }
            aria-label={`Edit ${type.building_type || "building type"}`}
            title="Edit"
          >
            <EditIcon />
          </button>
        ) : null,
    },
    {
      key: "serial_number",
      label: "Sr No",
      sortable: false,
      render: (_type, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "building_type",
      label: "Name",
      render: (type) => type.building_type || "-",
    },
    {
      key: "active",
      label: "Status",
      getSortValue: (type) => Number(Boolean(type.active)),
      render: (type) =>
        projectBuildingPermission.show === "true" ? (
          <StatusToggle
            active={type.active}
            label={`${type.active ? "Deactivate" : "Activate"} ${
              type.building_type || "building type"
            }`}
            onClick={() => handleToggle(type.id, type.active)}
          />
        ) : null,
    },
  ];

  const addButton =
    projectBuildingPermission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/setup-member/project-building-type")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">PROJECT BUILDING TYPE</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredBuildingTypes}
              loading={loading}
              emptyMessage="No building types found."
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              searchPlaceholder="Search"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(type) => type.id}
              storageKey="project-building-type-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBuildingTypeList;
