import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";

const FaqCategoryForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    active: true,
    site_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [sites, setSites] = useState([]);
  const [sitesLoading, setSitesLoading] = useState(false);

  const navigate = useNavigate();
  const { faqId } = useParams();
  const isEditMode = !!faqId;

  // Get auth headers
  const getAuthHeaders = () => ({
    Authorization: `Bearer ${localStorage.getItem("access_token")}`,
    "Content-Type": "application/json",
  });

  // Fetch sites for dropdown
  useEffect(() => {
    const fetchSites = async () => {
      try {
        setSitesLoading(true);
        const res = await axios.get(`${baseURL}sites.json`, {
          headers: getAuthHeaders()
        });
        
        const sitesData = res.data?.sites || res.data || [];
        const formattedSites = sitesData.map(site => ({
          id: site?.id || '',
          name: site?.name || 'Unnamed Site'
        }));
        
        setSites(formattedSites);
      } catch (err) {
        console.error("Failed to fetch sites:", err);
        toast.error("Failed to load sites");
      } finally {
        setSitesLoading(false);
      }
    };
    fetchSites();
  }, []);

  // Fetch existing data for edit
  useEffect(() => {
    if (isEditMode && !hasFetched) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const res = await axios.get(`${baseURL}faq_categories/${faqId}.json`, {
            headers: getAuthHeaders()
          });
          
          const categoryData = res.data?.faq_category || res.data;
          
          if (categoryData) {
            setFormData({
              name: categoryData.name || "",
              active: categoryData.active !== undefined ? categoryData.active : true,
              site_id: categoryData.site_id || ""
            });
            setHasFetched(true);
          }
        } catch (err) {
          console.error("Failed to fetch FAQ category:", err);
          toast.error("Failed to load FAQ category");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [faqId, isEditMode, hasFetched]);

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

    if (!formData.site_id) {
      toast.error("Site is required");
      return;
    }

    setLoading(true);

    try {
      const payload = { faq_category: formData };
      
      if (isEditMode) {
        await axios.put(
          `${baseURL}faq_categories/${faqId}.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        toast.success("FAQ Category updated successfully!");
      } else {
        await axios.post(
          `${baseURL}faq_categories.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        toast.success("FAQ Category created successfully!");
      }

      navigate("/setup-member/faq-category-list");
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
          <form id="faqCategoryForm" onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">
                  {isEditMode ? "Edit FAQ Category" : "Create FAQ Category"}
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
                        placeholder="Enter FAQ category name"
                        disabled={loading}
                      />
                    </div>
                  </div>

                  {/* Site Dropdown */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Site <span className="otp-asterisk">*</span>
                      </label>
                      <SelectBox
                        options={[
                          { value: "", label: sitesLoading ? "Loading sites..." : "" },
                          ...sites.map((site) => ({
                            value: site.id,
                            label: site.name,
                          })),
                        ]}
                        defaultValue={formData.site_id}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            site_id: value,
                          }))
                        }
                        disabled={loading || sitesLoading}
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
                form="faqCategoryForm" // Associates with the form
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
                onClick={() => navigate("/setup-member/faq-category-list")}
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

export default FaqCategoryForm;