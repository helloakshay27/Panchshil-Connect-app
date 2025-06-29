import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";

const FaqSubCategory = () => {
  const location = useLocation();
  const isListPage = location.pathname.includes("faq-sub-category-list");
  
  return isListPage ? <FaqSubCategoryList /> : <FaqSubCategoryForm />;
};

const FaqSubCategoryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    active: true,
    faq_category_id: "",
  });
  const [loading, setLoading] = useState(false);
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

    setLoading(true);

    try {
      const payload = { faq_sub_category: formData };
      
      if (isEditMode) {
        await axios.put(
          `${baseURL}faq_sub_categories/${faqSubId}.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        toast.success("FAQ Sub Category updated successfully!");
      } else {
        await axios.post(
          `${baseURL}faq_sub_categories.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        toast.success("FAQ Sub Category created successfully!");
      }

      navigate("/setup-member/faq-subcategory-list");
    } catch (error) {
      console.error("Error:", error);
      const errorMessage = error.response?.data?.message || "Failed to submit form";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          {/* Form with hidden submit button */}
          <form id="faqSubCategoryForm" onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">
                  {isEditMode ? "Edit FAQ Sub Category" : "Create FAQ Sub Category"}
                </h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Name */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name <span className="otp-asterisk">*</span>
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        className="form-control"
                        placeholder="Enter FAQ sub category name"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* FAQ Category Dropdown */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        FAQ Category <span className="otp-asterisk">*</span>
                      </label>
                      <SelectBox
                        options={[
                          { value: "", label: categoriesLoading ? "Loading categories..." : "" },
                          ...faqCategories.map((category) => ({
                            value: category.id,
                            label: category.name,
                          })),
                        ]}
                        defaultValue={formData.faq_category_id}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            faq_category_id: value,
                          }))
                        }
                        disabled={loading || categoriesLoading}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Hidden submit button for form submission */}
            <button type="submit" style={{ display: "none" }} />
          </form>
          
          {/* Visible buttons positioned below the card */}
          <div className="row mt-3 justify-content-center mx-4">
            <div className="col-md-2">
              <button
                type="submit"
                form="faqSubCategoryForm" // Associates with the form
                className="purple-btn2 w-100"
                disabled={loading}
              >
                {loading
                  ? isEditMode
                    ? "Updating..."
                    : "Creating..."
                  : isEditMode
                  ? "Update"
                  : "Create"}
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                className="purple-btn2 w-100"
                onClick={() => navigate("/setup-member/faq-subcategory-list")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};



export default FaqSubCategory;