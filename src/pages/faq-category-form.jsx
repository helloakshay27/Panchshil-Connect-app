import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { HelpCircle } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const FaqCategoryForm = () => {
  const connectEvents = useConnectEvents();
  const [formData, setFormData] = useState({
    name: "",
    active: true,
    site_id: "",
  });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

    setSubmitting(true);

    try {
      const payload = { faq_category: formData };
      
      if (isEditMode) {
        await axios.put(
          `${baseURL}faq_categories/${faqId}.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        connectEvents.onRecordSaved({ mode: "updated" });
        toast.success("FAQ Category updated successfully!");
      } else {
        await axios.post(
          `${baseURL}faq_categories.json`,
          payload,
          { headers: getAuthHeaders() }
        );
        connectEvents.onRecordSaved({ mode: "added" });
        toast.success("FAQ Category created successfully!");
      }

      navigate("/setup-member/faq-category-list");
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
                  <HelpCircle size={16} strokeWidth={1.8} />
                </span>
                {isEditMode ? "Edit FAQ Category" : "Create FAQ Category"}
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
                      placeholder="Enter FAQ category name"
                      disabled={loading || submitting}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Site"
                      required
                      placeholder={sitesLoading ? "Loading sites..." : "Select"}
                      options={
                        sites.length > 0
                          ? sites.map((site) => ({
                              value: site.id,
                              label: site.name,
                            }))
                          : [{ value: "", label: "No sites found" }]
                      }
                      value={formData.site_id}
                      onChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          site_id: value,
                        }))
                      }
                      disabled={loading || submitting || sitesLoading}
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
              onClick={() => navigate("/setup-member/faq-category-list")}
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

export default FaqCategoryForm;