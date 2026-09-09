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

const ServiceCategoryList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("service_category_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    try {
      const storedPermissions = localStorage.getItem("lock_role_permissions");
      if (storedPermissions) {
        const permissions =
          JSON.parse(storedPermissions).service_category || {};
        void permissions;
      }
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}service_categories.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        let categoriesData = [];
        if (Array.isArray(response.data)) {
          categoriesData = response.data;
        } else if (response.data.service_categories) {
          categoriesData = response.data.service_categories;
        } else if (Array.isArray(response.data.data)) {
          categoriesData = response.data.data;
        } else if (response.data.service_category) {
          categoriesData = [response.data.service_category];
        }

        setCategories(categoriesData);
        connectEvents.onModuleLoaded({ record_count: categoriesData.length });
        setPagination((previous) => ({
          ...previous,
          total_count: categoriesData.length,
          total_pages: Math.ceil(categoriesData.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (error) {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load service categories.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
    // Load once using the existing module analytics client.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await axios.put(
        `${baseURL}service_categories/${id}.json`,
        { service_category: { active: updatedStatus } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      setCategories((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, active: updatedStatus } : item,
        ),
      );
      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: updatedStatus ? "active" : "inactive",
      });
      toast.success("Service category status updated successfully!");
    } catch (error) {
      console.error("Error updating service category status:", error);
      toast.error("Failed to update service category status.");
    }
  };

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({ ...previous, current_page: pageNumber }));
    localStorage.setItem("service_category_currentPage", pageNumber);
  };

  const filteredCategories = useMemo(
    () =>
      categories.filter((category) =>
        String(category?.service_cat_name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [categories, searchQuery],
  );

  useSearchTracking(searchQuery, filteredCategories.length);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredCategories.length / pageSize),
    );
    if (pagination.current_page > totalPages) {
      setPagination((previous) => ({ ...previous, current_page: 1 }));
      localStorage.setItem("service_category_currentPage", 1);
    }
  }, [filteredCategories.length, pagination.current_page]);

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (category) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/service-category/${category.id}/edit`)
            }
            aria-label={`Edit ${
              category.service_cat_name || "service category"
            }`}
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
      render: (_category, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "service_cat_name",
      label: "Service Category Name",
      render: (category) => category.service_cat_name || "-",
    },
    {
      key: "service_image",
      label: "Service Image",
      sortable: false,
      className: "enhanced-table__media-cell",
      render: (category) =>
        category.service_image?.document_url ? (
          <>
            <img
              src={category.service_image.document_url}
              className="img-fluid rounded"
              alt={category.service_cat_name || "Service Category"}
              style={{
                width: "48px",
                height: "32px",
                objectFit: "cover",
              }}
              onError={(event) => {
                event.currentTarget.style.display = "none";
                event.currentTarget.nextSibling.style.display = "inline";
              }}
            />
            <span style={{ display: "none" }}>Image Not Available</span>
          </>
        ) : (
          <span>No Image</span>
        ),
    },
    {
      key: "active",
      label: "Status",
      filterable: true,
      getSortValue: (category) => (category.active ? "Active" : "Inactive"),
      render: (category) => (
        <StatusToggle
          active={category.active}
          label={`${category.active ? "Deactivate" : "Activate"} ${
            category.service_cat_name || "service category"
          }`}
          onClick={() => handleToggle(category.id, category.active)}
        />
      ),
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/service-category/create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">SERVICE CATEGORIES LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredCategories}
              loading={loading}
              emptyMessage="No service categories found."
              searchTerm={searchQuery}
              onSearchChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((previous) => ({ ...previous, current_page: 1 }));
              }}
              searchPlaceholder="Search service categories"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(category) => category.id}
              storageKey="service-category-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCategoryList;
