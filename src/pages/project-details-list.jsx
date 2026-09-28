/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
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

const ViewIcon = () => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8c-.058.087-.123.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8Z" />
    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
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

const TruncatedCell = ({ value }) => (
  <div className="enhanced-table__truncate-cell" title={value || "-"}>
    {value || "-"}
  </div>
);

const ProjectDetailsList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [projectPermission, setProjectPermission] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeToastId, setActiveToastId] = useState(null);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("project_details_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_pages: 5,
    total_count: 50,
  });

  const getProjectPermission = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};

      const permissions = JSON.parse(lockRolePermissions);
      return permissions.project || {};
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
      return {};
    }
  };

  useEffect(() => {
    const permissions = getProjectPermission();
    console.log("Project permissions:", permissions);
    setProjectPermission(permissions);
  }, []);

  useEffect(() => {
    console.log(
      "Auth check - isLoggedIn:",
      sessionStorage.getItem("isLoggedIn"),
    );
    console.log(
      "Auth check - access_token:",
      localStorage.getItem("access_token"),
    );
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    const url = `${baseURL}get_projects_all.json`;

    try {
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      const projectsData = response.data?.projects || [];
      setProjects(projectsData);
      sessionStorage.setItem("cached_projects", JSON.stringify(projectsData));

      connectEvents.onModuleLoaded({ record_count: projectsData.length });
      setPagination({
        current_page: getPageFromStorage(),
        total_count: projectsData.length,
        total_pages: Math.ceil(projectsData.length / pageSize),
      });
    } catch (err) {
      console.error("Error fetching projects:", err);
      setError("Unable to fetch project data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cached = sessionStorage.getItem("cached_projects");

    if (cached) {
      const parsed = JSON.parse(cached);
      setProjects(parsed);
      setPagination({
        current_page: getPageFromStorage(),
        total_count: parsed.length,
        total_pages: Math.ceil(parsed.length / pageSize),
      });
    } else {
      fetchProjects();
    }
    // The list is intentionally loaded once; fetchProjects uses the existing API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= pagination.total_pages) {
      connectEvents.onModulePaginated({ page: pageNumber });
      setPagination({
        ...pagination,
        current_page: pageNumber,
      });
      localStorage.setItem("project_details_list_currentPage", pageNumber);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;

    if (activeToastId) {
      toast.dismiss(activeToastId);
    }

    try {
      await axios.put(
        `${baseURL}projects/${id}.json`,
        { project: { published: updatedStatus } },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      setProjects((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, published: updatedStatus } : item,
        ),
      );

      sessionStorage.removeItem("cached_projects");
      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: !currentStatus ? "active" : "inactive",
      });
      const newToastId = toast.success("Status updated successfully!", {
        duration: 3000,
        position: "top-center",
        id: `toggle-${id}`,
      });

      setActiveToastId(newToastId);
    } catch (toggleError) {
      console.error("Error updating status:", toggleError);
      const newToastId = toast.error("Failed to update status.", {
        duration: 3000,
        position: "top-center",
        id: `toggle-error-${id}`,
      });

      setActiveToastId(newToastId);
    }
  };

  const handleToggleShow = async (id, currentStatus) => {
    const updatedStatus = !currentStatus;

    if (activeToastId) {
      toast.dismiss(activeToastId);
    }

    try {
      await axios.put(
        `${baseURL}projects/${id}.json`,
        { project: { show_on_home: updatedStatus } },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      setProjects((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, show_on_home: updatedStatus } : item,
        ),
      );

      sessionStorage.removeItem("cached_projects");
      const newToastId = toast.success("Status updated successfully!", {
        duration: 3000,
        position: "top-center",
        id: `toggle-${id}`,
      });

      setActiveToastId(newToastId);
    } catch (toggleError) {
      console.error("Error updating status:", toggleError);

      let newToastId;
      if (toggleError.response && toggleError.response.status === 422) {
        const message =
          toggleError.response.data?.active?.[0] || "Unprocessable Entity.";
        newToastId = toast.error(message, {
          duration: 3000,
          position: "top-center",
          id: `toggle-error-${id}`,
        });
      } else {
        newToastId = toast.error("Project is not active or published.", {
          duration: 3000,
          position: "top-center",
          id: `toggle-error-${id}`,
        });
      }

      setActiveToastId(newToastId);
    }
  };

  const filteredProjects = useMemo(
    () =>
      searchQuery
        ? projects.filter((project) =>
            (project.project_name?.toLowerCase() || "").includes(
              searchQuery.toLowerCase(),
            ),
          )
        : projects,
    [projects, searchQuery],
  );

  useSearchTracking(searchQuery, filteredProjects.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredProjects.length,
      total_pages: Math.ceil(filteredProjects.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredProjects.length, searchQuery]);

  const columns = [
    {
      key: "actions",
      label: "Actions",
      width: "10%",
      sortable: false,
      alwaysVisible: true,
      render: (project) => (
        <div className="enhanced-table__row-actions">
          {projectPermission.update === "true" && (
            <a
              href={`/project-edit/${project?.id || "N/A"}`}
              className="enhanced-table__action-button"
              aria-label={`Edit ${project?.project_name || "project"}`}
              title="Edit"
            >
              <EditIcon />
            </a>
          )}
          {projectPermission.show === "true" && (
            <a
              href={`/project-details/${project?.id || "N/A"}`}
              className="enhanced-table__action-button is-primary"
              aria-label={`View ${project?.project_name || "project"}`}
              title="View"
            >
              <ViewIcon />
            </a>
          )}
          {projectPermission.show === "true" && (
            <StatusToggle
              active={project.published}
              label={`${project.published ? "Unpublish" : "Publish"} ${
                project?.project_name || "project"
              }`}
              onClick={() => handleToggle(project.id, project.published)}
            />
          )}
        </div>
      ),
    },
    {
      key: "serial_number",
      label: "Sr No",
      width: "6%",
      sortable: false,
      render: (_project, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "project_name",
      label: "Project Name",
      width: "12%",
      render: (project) => <TruncatedCell value={project.project_name} />,
    },
    {
      key: "property_type",
      label: "Property Type",
      width: "11%",
      filterable: true,
      render: (project) => <TruncatedCell value={project.property_type} />,
    },
    {
      key: "SFDC_Project_Id",
      label: "SFDC Project ID",
      width: "12%",
      render: (project) => <TruncatedCell value={project.SFDC_Project_Id} />,
    },
    {
      key: "Project_Construction_Status",
      label: "Project Construction Status",
      width: "18%",
      filterable: true,
      render: (project) => (
        <TruncatedCell value={project.Project_Construction_Status} />
      ),
    },
    {
      key: "configurations",
      label: "Configuration Type",
      width: "14%",
      getSortValue: (project) =>
        project.configurations
          ?.map((configuration) => configuration.name)
          .join(", ") || "",
      render: (project) =>
        project.configurations?.length ? (
          <div
            className="enhanced-table__configuration-list"
            title={project.configurations
              .map((configuration) => configuration.name)
              .join(", ")}
          >
            {project.configurations.map((configuration, index) => (
              <div
                className="enhanced-table__configuration"
                key={`${configuration.name}-${index}`}
              >
                <span>{configuration.name}</span>
                {configuration.icon_url && (
                  <img
                    src={configuration.icon_url}
                    alt=""
                    width="16"
                    height="16"
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          "-"
        ),
    },
    {
      key: "project_tag",
      label: "Project Tag",
      width: "10%",
      filterable: true,
      render: (project) => <TruncatedCell value={project.project_tag} />,
    },
    {
      key: "show_on_home",
      label: "Show On Home",
      width: "7%",
      getSortValue: (project) => Number(Boolean(project.show_on_home)),
      render: (project) => (
        <StatusToggle
          active={project.show_on_home}
          label={`${project.show_on_home ? "Hide" : "Show"} ${
            project?.project_name || "project"
          } on home`}
          onClick={() => handleToggleShow(project.id, project.show_on_home)}
        />
      ),
    },
  ];

  const addButton =
    projectPermission.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/project-create")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">PROJECT LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredProjects}
              loading={loading}
              emptyMessage={error || "No projects found"}
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search projects"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(project) => project.id}
              storageKey="project-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetailsList;
