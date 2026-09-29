import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Briefcase } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const DepartmentCreate = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [company, setCompany] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    organizationId: "",
    companyId: "",
    siteId: null,
    active: true,
    deleted: false,
  });

  // Fetch Organizations
  useEffect(() => {
    setLoading(true);
    fetch(`${baseURL}organizations.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.organizations)) {
          setOrganizations(data.organizations);
        } else {
          setOrganizations([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching organizations:", error);
        toast.error("Failed to fetch organizations.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setLoading(true);
    fetch(`${baseURL}company_setups.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.company_setups)) {
          setCompany(data.company_setups);
        } else {
          setCompany([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching company setups:", error);
        toast.error("Failed to fetch company setups.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle File Input
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData((prev) => ({ ...prev, companyLogo: file }));
    }
  };

  // ✅ Validate Form Before Submission
  //   const validateForm = () => {
  //     if (!formData.companyName.trim()) {
  //       toast.error("Company Name is required.");
  //       return false;
  //     }
  //     if (!formData.companyLogo) {
  //       toast.error("Company Logo is required.");
  //       return false;
  //     }
  //     if (!formData.organizationId) {
  //       toast.error("Organization ID is required.");
  //       return false;
  //     }
  //     return true;
  //   };

  // Handle Form Submission
  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    // Add basic validation here if needed
    // if (!formData.name || !formData.organizationId || !formData.companyId) {
    //   toast.error("Please fill all required fields.");
    //   return;
    // }

    setSubmitting(true);

    try {
      const response = await fetch(`${baseURL}departments.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          department: {
            name: formData.name,
            organization_id: formData.organizationId,
            company_id: formData.companyId,
            site_id: formData.siteId || null,
            active: true,
            deleted: false,
          },
        }),
      });

      if (response.ok) {
        connectEvents.onRecordSaved({ mode: "added" });
        toast.success("Department created successfully!");
        navigate("/setup-member/department-list");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create department.");
      }
    } catch (error) {
      console.error("Error submitting department:", error);
      toast.error("Something went wrong.");
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
                  <Briefcase size={16} strokeWidth={1.8} />
                </span>
                Department Create
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Department Name"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Department Name"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Company ID"
                      required
                      placeholder={loading ? "Loading..." : "Select"}
                      options={
                        loading
                          ? [{ value: "", label: "Loading..." }]
                          : company.length > 0
                          ? company.map((comp) => ({
                              value: comp.id,
                              label: comp.name,
                            }))
                          : [{ value: "", label: "No companies found" }]
                      }
                      value={formData.companyId}
                      onChange={(value) =>
                        setFormData({ ...formData, companyId: value })
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Organization ID"
                      required
                      placeholder={loading ? "Loading..." : "Select"}
                      options={
                        loading
                          ? [{ value: "", label: "Loading..." }]
                          : organizations.length > 0
                          ? organizations.map((org) => ({
                              value: org.id,
                              label: org.name,
                            }))
                          : [{ value: "", label: "No organizations found" }]
                      }
                      value={formData.organizationId}
                      onChange={(value) =>
                        setFormData({ ...formData, organizationId: value })
                      }
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
              {submitting ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate(-1)}
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

export default DepartmentCreate;
