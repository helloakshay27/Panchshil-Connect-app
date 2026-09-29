/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
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

const TestimonialList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [testimonialPermissions, setTestimonialPermissions] = useState({});
  const [activeToastId, setActiveToastId] = useState(null);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("testimonial_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  const getTestimonialPermissions = () => {
    try {
      const lockRolePermissions = localStorage.getItem("lock_role_permissions");
      if (!lockRolePermissions) return {};

      const permissions = JSON.parse(lockRolePermissions);
      return permissions.testimonial || {};
    } catch (permissionError) {
      console.error("Error parsing lock_role_permissions:", permissionError);
      return {};
    }
  };

  useEffect(() => {
    setTestimonialPermissions(getTestimonialPermissions());
  }, []);

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(
          `${baseURL}testimonials.json?company_id=1`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        const testimonialList = response.data.testimonials || [];
        setTestimonials(testimonialList);
        connectEvents.onModuleLoaded({
          record_count: testimonialList.length,
        });
        setPagination((previous) => ({
          ...previous,
          total_count: testimonialList.length,
          total_pages: Math.ceil(testimonialList.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch {
        setError("Failed to fetch testimonials.");
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
    // The list is intentionally loaded once from the existing API.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = useCallback(
    async (id, currentStatus) => {
      toast.dismiss();
      const updatedStatus = !currentStatus;

      try {
        await axios.put(
          `${baseURL}testimonials/${id}.json`,
          { testimonial: { active: updatedStatus } },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );

        setTestimonials((previous) =>
          previous.map((item) =>
            item.id === id ? { ...item, active: updatedStatus } : item,
          ),
        );
        connectEvents.onRecordStatusChanged({
          record_id: id,
          new_status: !currentStatus ? "active" : "inactive",
        });
        toast.success("Status updated successfully!");
        console.log("Status updated successfully!");
      } catch (toggleError) {
        console.error("Error toggling banner status:", toggleError);
        toast.error(
          "Limit reached: only 5 active banners allowed. Please deactivate one before activating another.",
        );
      }
    },
    [connectEvents],
  );

  const handleToggleShow = useCallback(
    async (id, currentStatus) => {
      const updatedStatus = !currentStatus;

      if (activeToastId) {
        toast.dismiss(activeToastId);
      }

      try {
        await axios.put(
          `${baseURL}testimonials/${id}.json`,
          { testimonial: { show_on_home: updatedStatus } },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );

        setTestimonials((previous) =>
          previous.map((item) =>
            item.id === id ? { ...item, show_on_home: updatedStatus } : item,
          ),
        );

        const newToastId = toast.success("Status updated successfully!", {
          duration: 3000,
          position: "top-center",
          id: `toggle-${id}`,
        });
        setActiveToastId(newToastId);
      } catch (toggleError) {
        console.error("Error updating status:", toggleError);

        let errorMessage = "An error occurred.";
        if (toggleError.response && toggleError.response.status === 400) {
          const errors = toggleError.response.data.errors;
          if (Array.isArray(errors) && errors.length > 0) {
            errorMessage = errors.join(" ");
          } else if (typeof errors === "string") {
            errorMessage = errors;
          }
        }

        const newToastId = toast.error(errorMessage, {
          duration: 3000,
          position: "top-center",
          id: `toggle-error-${id}`,
        });
        setActiveToastId(newToastId);
      }
    },
    [activeToastId],
  );

  const filteredTestimonials = useMemo(
    () =>
      testimonials
        .filter((testimonial) =>
          searchQuery
            ? (testimonial.user_name?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              ) ||
              (testimonial.content?.toLowerCase() || "").includes(
                searchQuery.toLowerCase(),
              )
            : true,
        )
        .sort(
          (left, right) =>
            new Date(right.created_at) - new Date(left.created_at),
        ),
    [searchQuery, testimonials],
  );

  useSearchTracking(searchQuery, filteredTestimonials.length);

  useEffect(() => {
    setPagination((previous) => ({
      ...previous,
      total_count: filteredTestimonials.length,
      total_pages: Math.ceil(filteredTestimonials.length / pageSize),
      current_page: searchQuery ? 1 : previous.current_page,
    }));
  }, [filteredTestimonials.length, searchQuery]);

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

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("testimonial_list_currentPage", pageNumber);
  };

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Actions",
        sortable: false,
        alwaysVisible: true,
        render: (testimonial) => (
          <div className="enhanced-table__row-actions">
            <button
              type="button"
              className="enhanced-table__action-button"
              onClick={() =>
                navigate("/testimonial-edit", {
                  state: { testimonial },
                })
              }
              aria-label={`Edit ${testimonial.user_name || "testimonial"}`}
              title="Edit"
            >
              <EditIcon />
            </button>
            {testimonialPermissions.show === "true" && (
              <StatusToggle
                active={testimonial.active}
                label={`${testimonial.active ? "Deactivate" : "Activate"} ${
                  testimonial.user_name || "testimonial"
                }`}
                onClick={() => handleToggle(testimonial.id, testimonial.active)}
              />
            )}
          </div>
        ),
      },
      {
        key: "serial_number",
        label: "Sr No",
        sortable: false,
        render: (_testimonial, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "user_name",
        label: "User Name",
        filterable: true,
        render: (testimonial) => testimonial.user_name || "-",
      },
      {
        key: "content",
        label: "Content",
        render: (testimonial) => testimonial.content || "-",
      },
      {
        key: "created_at",
        label: "Created At",
        getSortValue: (testimonial) =>
          new Date(testimonial.created_at).getTime(),
        render: (testimonial) =>
          new Date(testimonial.created_at).toLocaleString(),
      },
      {
        key: "updated_at",
        label: "Updated At",
        getSortValue: (testimonial) =>
          new Date(testimonial.updated_at).getTime(),
        render: (testimonial) =>
          new Date(testimonial.updated_at).toLocaleString(),
      },
      {
        key: "show_on_home",
        label: "Show on Home",
        filterable: true,
        getSortValue: (testimonial) =>
          testimonial.show_on_home ? "Yes" : "No",
        render: (testimonial) => (
          <StatusToggle
            active={testimonial.show_on_home}
            label={`${testimonial.show_on_home ? "Hide" : "Show"} ${
              testimonial.user_name || "testimonial"
            } on home`}
            onClick={() =>
              handleToggleShow(testimonial.id, testimonial.show_on_home)
            }
          />
        ),
      },
    ],
    [handleToggle, handleToggleShow, navigate, testimonialPermissions.show],
  );

  const addButton =
    testimonialPermissions.create === "true" ? (
      <button
        type="button"
        className="purple-btn2 enhanced-table__add"
        onClick={() => navigate("/testimonials")}
      >
        <Plus size={16} />
        <span>Add</span>
      </button>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">TESTIMONIALS LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredTestimonials}
              loading={loading}
              emptyMessage={
                error || "No testimonials found matching your search criteria"
              }
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search testimonials"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(testimonial) => testimonial.id}
              storageKey="testimonial-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialList;
