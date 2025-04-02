import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const CompanyCreate = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);


  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: null,
    organizationId: "",
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
  const validateForm = () => {
    if (!formData.companyName.trim()) {
      toast.error("Company Name is required.");
      return false;
    }
    if (!formData.companyLogo) {
      toast.error("Company Logo is required.");
      return false;
    }
    if (!formData.organizationId) {
      toast.error("Organization ID is required.");
      return false;
    }
    return true;
  };

  // Handle Form Submission
  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Dismiss existing toasts before showing a new one
    toast.dismiss();

    if (!validateForm()) return;

    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("company_setup[name]", formData.companyName);
    formDataToSend.append(
      "company_setup[organization_id]",
      formData.organizationId
    );
    formDataToSend.append("company_logo", formData.companyLogo);

    try {
      const response = await fetch(
        `${baseURL}company_setups.json`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
          body: formDataToSend,
        }
      );

      if (response.ok) {
        toast.success("Company created successfully!");
        setFormData({ companyName: "", companyLogo: null, organizationId: "" });
        navigate("/company-list");
      } else {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        toast.error(errorData.message || "Failed to create company.");
      }
    } catch (error) {
      console.error("Error submitting company:", error);
      toast.error("Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Company Setup</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Company Name */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company Name <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter name"
                      />
                    </div>
                  </div>

                  {/* Company Logo */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company Logo
                        <span
                          className="tooltip-container"
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        >
                          [i]
                          {showTooltip && (
                            <span className="tooltip-text">
                              Max Upload Size 10 MB
                            </span>
                          )}
                        </span>
                        <span style={{ color: "red" }}>*</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        onChange={handleFileChange}
                        accept=".png,.jpg,.jpeg,.svg"
                      />
                    </div>
                  </div>

                  {/* Organization ID */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Organization ID <span style={{ color: "red" }}>*</span>
                      </label>
                      <SelectBox
                        name="organizationId"
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

            {/* Submit & Cancel Buttons */}
            <div className="row mt-2 justify-content-center">
              <div className="col-md-2">
                <button
                  type="submit"
                  className="purple-btn2 purple-btn2-shadow w-100"
                  disabled={submitting}
                >
                  {submitting ? "Submitting..." : "Submit"}
                </button>
              </div>
              <div className="col-md-2">
                <button
                  type="button"
                  className="purple-btn2 purple-btn2-shadow w-100"
                  onClick={() => {
                    setFormData({
                      companyName: "",
                      companyLogo: null,
                      organizationId: "",
                    });
                    navigate(-1);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreate;
