/* eslint-disable react/prop-types */
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
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

const FaqSubCategoryList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [subCategories, setSubCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("faq_sub_category_currentPage")) || 1;

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
          JSON.parse(storedPermissions).faq_sub_category || {};
        void permissions;
      }
    } catch (error) {
      console.error("Error parsing lock_role_permissions:", error);
    }
  }, []);

  useEffect(() => {
    const fetchSubCategories = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`${baseURL}faq_sub_categories.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        console.log("API Response:", response.data);

        let subCategoriesData = [];
        if (Array.isArray(response.data)) {
          subCategoriesData = response.data;
        } else if (response.data && typeof response.data === "object") {
          if (Array.isArray(response.data.faq_sub_categories)) {
            subCategoriesData = response.data.faq_sub_categories;
          } else if (Array.isArray(response.data.data)) {
            subCategoriesData = response.data.data;
          } else if (Array.isArray(response.data.results)) {
            subCategoriesData = response.data.results;
          } else {
            subCategoriesData = Object.keys(response.data).map((key) => ({
              id: key,
              ...response.data[key],
            }));
          }
        }

        console.log("Processed data:", subCategoriesData);
        if (
          !Array.isArray(subCategoriesData) ||
          subCategoriesData.length === 0
        ) {
          console.warn("No valid data found in API response");
          setSubCategories([]);
        } else {
          setSubCategories(subCategoriesData);
        }
        setPagination((previous) => ({
          ...previous,
          total_count: subCategoriesData.length,
          total_pages: Math.ceil(subCategoriesData.length / pageSize),
          current_page: getPageFromStorage(),
        }));
      } catch (error) {
        console.error("Error fetching sub categories:", error);
        console.error("Error response:", error.response?.data);
        toast.error(
          error.response?.data?.message || "Failed to load FAQ sub categories.",
        );
        setSubCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubCategories();
  }, []);

  const handleToggle = async (id, currentStatus) => {
    try {
      const updatedStatus = !currentStatus;
      await axios.put(
        `${baseURL}faq_sub_categories/${id}.json`,
        { faq_sub_category: { active: updatedStatus } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );
      setSubCategories((previous) =>
        previous.map((item) =>
          item.id === id ? { ...item, active: updatedStatus } : item,
        ),
      );
      connectEvents.onRecordStatusChanged({
        record_id: id,
        new_status: updatedStatus ? "active" : "inactive",
      });
      toast.success("Sub category status updated successfully!");
    } catch (error) {
      console.error("Error updating sub category status:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to update sub category status.",
      );
    }
  };

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({ ...previous, current_page: pageNumber }));
    localStorage.setItem("faq_sub_category_currentPage", pageNumber.toString());
  };

  const filteredSubCategories = useMemo(
    () =>
      subCategories.filter((subCategory) =>
        String(subCategory?.name || "")
          .toLowerCase()
          .includes(searchQuery.toLowerCase()),
      ),
    [searchQuery, subCategories],
  );

  useSearchTracking(searchQuery, filteredSubCategories.length);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredSubCategories.length / pageSize),
    );
    if (pagination.current_page > totalPages) {
      setPagination((previous) => ({ ...previous, current_page: 1 }));
      localStorage.setItem("faq_sub_category_currentPage", "1");
    }
  }, [filteredSubCategories.length, pagination.current_page]);

  const columns = [
    {
      key: "actions",
      label: "Action",
      sortable: false,
      alwaysVisible: true,
      render: (subCategory) => (
        <div className="enhanced-table__row-actions">
          <button
            type="button"
            className="enhanced-table__action-button"
            onClick={() =>
              navigate(`/setup-member/faq-subcategory/${subCategory.id}/edit`)
            }
            aria-label={`Edit ${subCategory.name || "FAQ sub category"}`}
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
      render: (_subCategory, { absoluteIndex }) => absoluteIndex + 1,
    },
    {
      key: "name",
      label: "Name",
      render: (subCategory) => subCategory.name || "-",
    },
    {
      key: "faq_category_id",
      label: "FAQ Category ID",
      filterable: true,
      render: (subCategory) => subCategory.faq_category_id || "-",
    },
    {
      key: "active",
      label: "Status",
      filterable: true,
      getSortValue: (subCategory) =>
        subCategory.active ? "Active" : "Inactive",
      render: (subCategory) => (
        <StatusToggle
          active={subCategory.active}
          label={`${subCategory.active ? "Deactivate" : "Activate"} ${
            subCategory.name || "FAQ sub category"
          }`}
          onClick={() => handleToggle(subCategory.id, subCategory.active)}
        />
      ),
    },
  ];

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/setup-member/faq-subcategory/create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">FAQ SUB CATEGORIES LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            <EnhancedTable
              columns={columns}
              data={filteredSubCategories}
              loading={loading}
              emptyMessage="No FAQ sub categories found."
              searchTerm={searchQuery}
              onSearchChange={(event) => {
                setSearchQuery(event.target.value);
                setPagination((previous) => ({ ...previous, current_page: 1 }));
              }}
              searchPlaceholder="Search FAQ sub categories"
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={addButton}
              getRowId={(subCategory) => subCategory.id}
              storageKey="faq-subcategory-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqSubCategoryList;
