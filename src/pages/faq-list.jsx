/* eslint-disable react/prop-types */
import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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

const FaqList = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const location = useLocation();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryId, setCategoryId] = useState(null);
  const [subCategoryId, setSubCategoryId] = useState(null);

  const getPageFromStorage = () =>
    parseInt(localStorage.getItem("faq_list_currentPage")) || 1;

  const [pagination, setPagination] = useState({
    current_page: getPageFromStorage(),
    total_count: 0,
    total_pages: 0,
  });

  useEffect(() => {
    const fetchFaqs = async () => {
      setLoading(true);
      try {
        const params = {};
        const urlParams = new URLSearchParams(location.search);
        const searchParam = urlParams.get("s[question_cont]");
        if (searchParam) {
          params["s[question_cont]"] = searchParam;
        }

        const response = await axios.get(`${baseURL}faqs.json`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          params,
        });

        if (response.data && response.data.faqs) {
          setFaqs(response.data.faqs);
          setCategoryId(response.data.faq_category_id);
          setSubCategoryId(response.data.faq_sub_category_id);
          setPagination((previous) => ({
            ...previous,
            current_page: getPageFromStorage(),
            total_count: response.data.faqs.length,
            total_pages: Math.ceil(response.data.faqs.length / pageSize),
          }));
        } else {
          setFaqs([]);
        }
      } catch (fetchError) {
        console.error(
          "Error fetching FAQs:",
          fetchError.response || fetchError,
        );
        setError("Failed to fetch FAQs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFaqs();

    const params = new URLSearchParams(location.search);
    const searchParam = params.get("s[question_cont]");
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, [location.search]);

  const handlePageChange = (pageNumber) => {
    connectEvents.onModulePaginated({ page: pageNumber });
    setPagination((previous) => ({
      ...previous,
      current_page: pageNumber,
    }));
    localStorage.setItem("faq_list_currentPage", pageNumber);
  };

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const handleSearchSubmit = (event) => {
    event.preventDefault();
    setPagination((previous) => ({ ...previous, current_page: 1 }));
    localStorage.setItem("faq_list_currentPage", 1);

    const params = new URLSearchParams();
    if (searchQuery) {
      params.set("s[question_cont]", searchQuery);
    }
    navigate(`${location.pathname}?${params.toString()}`, { replace: true });
  };

  const handleToggleEvent = useCallback(async (id, currentStatus) => {
    toast.dismiss();

    try {
      await axios.put(
        `${baseURL}faqs/${id}.json`,
        {
          faq: {
            active: !currentStatus,
          },
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        },
      );

      setFaqs((previous) =>
        previous.map((faq) =>
          faq.id === id ? { ...faq, active: !currentStatus } : faq,
        ),
      );
      setError(null);
      toast.success("Status Updated successfully!");
    } catch (toggleError) {
      console.error("Error toggling FAQ status:", toggleError);

      if (toggleError.response) {
        const errorMessage =
          toggleError.response.data?.message ||
          toggleError.response.data?.error ||
          `Server error: ${toggleError.response.status}`;
        setError(`Failed to update FAQ status: ${errorMessage}`);
      } else if (toggleError.request) {
        setError("Failed to update FAQ status: No response from server");
      } else {
        setError(`Failed to update FAQ status: ${toggleError.message}`);
      }
    }
  }, []);

  const filteredFaqs = useMemo(
    () =>
      faqs.filter(
        (faq) =>
          !searchQuery ||
          (faq.question &&
            faq.question.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (faq.answer &&
            faq.answer.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (faq.faq_tag &&
            faq.faq_tag.toLowerCase().includes(searchQuery.toLowerCase())),
      ),
    [faqs, searchQuery],
  );

  useSearchTracking(searchQuery, filteredFaqs.length);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredFaqs.length / pageSize));
    setPagination((previous) => ({
      ...previous,
      total_count: filteredFaqs.length,
      total_pages: totalPages,
      current_page:
        previous.current_page > totalPages ? 1 : previous.current_page,
    }));

    if (pagination.current_page > totalPages) {
      localStorage.setItem("faq_list_currentPage", 1);
    }
  }, [filteredFaqs.length, pagination.current_page]);

  const columns = useMemo(
    () => [
      {
        key: "actions",
        label: "Action",
        width: "7%",
        sortable: false,
        alwaysVisible: true,
        render: (faq) => (
          <div className="enhanced-table__row-actions">
            <button
              type="button"
              className="enhanced-table__action-button"
              onClick={() => navigate(`/faq-edit/${faq.id}`)}
              aria-label={`Edit ${faq.question || "FAQ"}`}
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
        width: "6%",
        sortable: false,
        render: (_faq, { absoluteIndex }) => absoluteIndex + 1,
      },
      {
        key: "faq_category_name",
        label: "FAQ Category",
        width: "18%",
        filterable: true,
        render: (faq) => (
          <div
            className="enhanced-table__truncate-cell"
            title={faq.faq_category_name || "-"}
          >
            {faq.faq_category_name || "-"}
          </div>
        ),
      },
      {
        key: "question",
        label: "Question",
        width: "34%",
        render: (faq) => (
          <div
            className="enhanced-table__truncate-cell"
            title={faq.question || "-"}
          >
            {faq.question || "-"}
          </div>
        ),
      },
      {
        key: "answer",
        label: "Answer",
        width: "28%",
        render: (faq) => (
          <div
            className="enhanced-table__truncate-cell"
            title={faq.answer || "-"}
          >
            {faq.answer || "-"}
          </div>
        ),
      },
      {
        key: "active",
        label: "Status",
        width: "7%",
        filterable: true,
        getSortValue: (faq) => (faq.active ? "Active" : "Inactive"),
        render: (faq) => (
          <StatusToggle
            active={faq.active}
            label={`${faq.active ? "Deactivate" : "Activate"} ${
              faq.question || "FAQ"
            }`}
            onClick={() => handleToggleEvent(faq.id, faq.active)}
          />
        ),
      },
    ],
    [handleToggleEvent, navigate],
  );

  const addButton = (
    <button
      type="button"
      className="purple-btn2 enhanced-table__add"
      onClick={() => navigate("/faq-create")}
    >
      <Plus size={16} />
      <span>Add</span>
    </button>
  );

  const categoryDetails =
    categoryId || subCategoryId ? (
      <>
        {categoryId && <span>Category ID: {categoryId}</span>}
        {subCategoryId && <span>Sub Category ID: {subCategoryId}</span>}
      </>
    ) : null;

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid project-list-page">
        <h1 className="enhanced-page-title">FAQ LIST</h1>
        <div className="project-list-card">
          <div className="project-list-card__body">
            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}
            <EnhancedTable
              columns={columns}
              data={filteredFaqs}
              loading={loading}
              emptyMessage={
                searchQuery
                  ? "No FAQs found matching your search."
                  : "No FAQs found."
              }
              searchTerm={searchQuery}
              onSearchChange={handleSearchChange}
              onSearchSubmit={handleSearchSubmit}
              searchPlaceholder="Search FAQs..."
              currentPage={pagination.current_page}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              leftActions={
                <>
                  {addButton}
                  {categoryDetails}
                </>
              }
              getRowId={(faq) => faq.id}
              storageKey="faq-list"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FaqList;
