import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { ListTree } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const FaqSubCategory = () => {
  const location = useLocation();
  const isListPage = location.pathname.includes("faq-sub-category-list");
  
  return isListPage ? <FaqSubCategoryList /> : <FaqSubCategoryForm />;
};

const FaqSubCategoryForm = () => {
  const connectEvents = useConnectEvents();
  const [formData, setFormData] = useState({
    name: "",
    active: true,
    faq_category_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [faqCategories, setFaqCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const navigate = useNavigate();
  const { faqSubId } = useParams();
  const isEditMode = !!faqSubId;

  // Get auth headers
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  // Fetch FAQ categories for dropdown
  useEffect(() => {
    const fetchFaqCategories = async () => {
      try {
        setCategoriesLoading(true);
        const res = await axios.get(`${baseURL}faq_categories.json`, {
          headers: getAuthHeaders()
        });
        
        // Handle both array response and object with nested data
        let categoriesData = [];
        if (Array.isArray(res.data)) {
          categoriesData = res.data;
        } else if (res.data.faq_categories) {
          categoriesData = res.data.faq_categories;
        } else if (Array.isArray(res.data.data)) {
          categoriesData = res.data.data;
        }
        
        const formattedCategories = categoriesData.map(category => ({
          id: category?.id || '',
          name: category?.name || 'Unnamed Category'
        }));
        
        setFaqCategories(formattedCategories);
      } catch (err) {
        console.error("Failed to fetch FAQ categories:", err);
        toast.error("Failed to load FAQ categories");
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchFaqCategories();
  }, []);

  // Fetch existing data for edit
  useEffect(() => {
    if (isEditMode && !hasFetched) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${baseURL}faq_sub_categories/${faqSubId}.json`, {
            headers: getAuthHeaders()
          });
          
          const subCategoryData = res.data?.faq_sub_category || res.data;
          
          if (subCategoryData) {
            setFormData({
              name: subCategoryData.name || "",
              active: subCategoryData.active !== undefined ? subCategoryData.active : true,
              faq_category_id: subCategoryData.faq_category_id || ""
            });
            setHasFetched(true);
          }
        } catch (err) {
          console.error("Failed to fetch FAQ sub category:", err);
          toast.error("Failed to load FAQ sub category");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [faqSubId, isEditMode, hasFetched]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (!formData.faq_category_id) {
      toast.error("FAQ Category is required");
      return;
    }

    setSubmitting(true);

    try {
      const payload = { faq_sub_category: formData };
      
      if (isEditMode) {
        await axios.put(
          `${baseURL}faq_sub_categories/${faqSubId}.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        connectEvents.onRecordSaved({ mode: "updated" });
        toast.success("FAQ Sub Category updated successfully!");
      } else {
        await axios.post(
          `${baseURL}faq_sub_categories.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        connectEvents.onRecordSaved({ mode: "added" });
        toast.success("FAQ Sub Category created successfully!");
      }

      navigate("/setup-member/faq-subcategory-list");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit form";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <ListTree size={16} strokeWidth={1.8} />
                </span>
                {isEditMode ? "Edit FAQ Sub Category" : "Create FAQ Sub Category"}
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter FAQ sub category name"
                      disabled={loading || submitting}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="FAQ Category"
                      required
                      placeholder={
                        categoriesLoading ? "Loading categories..." : "Select"
                      }
                      options={
                        faqCategories.length > 0
                          ? faqCategories.map((category) => ({
                              value: category.id,
                              label: category.name,
                            }))
                          : [{ value: "", label: "No categories found" }]
                      }
                      value={formData.faq_category_id}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          faq_category_id: value,
                        }))
                      }
                      disabled={loading || submitting || categoriesLoading}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={submitting}
            >
              {submitting
                ? isEditMode
                  ? "Updating..."
                  : "Creating..."
                : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate("/setup-member/faq-subcategory-list")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



export default FaqSubCategory;