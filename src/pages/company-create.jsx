import React, { useState, useEffect } from "react";
import { toast } from 'react-hot-toast'

const CompanyCreate = () => {
  const [organizations, setOrganizations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    companyName: "",
    companyLogo: null,
    organizationId: "",
  });

  // Fetch organizations from API
  useEffect(() => {
    setLoading(true);
    fetch("https://panchshil-super.lockated.com/organizations.json", {
      method: "GET",
      headers: {
        Authorization: "Bearer eH5eu3-z4o42iaB-npRdy1y3MAUO4zptxTIf2YyT7BA",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        setOrganizations(data); // Assuming data is an array of organizations
      })
      .catch((error) => {
        console.error("Error fetching organizations:", error);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle File Input
  const handleFileChange = (e) => {
    setFormData((prev) => ({ ...prev, companyLogo: e.target.files[0] }));
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formDataToSend = new FormData();
    formDataToSend.append("company_setup[name]", formData.companyName);
    formDataToSend.append(
      "company_setup[organization_id]",
      formData.organizationId
    );
    if (formData.companyLogo) {
      formDataToSend.append("company_setup[logo]", formData.companyLogo);
    }

    try {
      const response = await fetch(
        "https://panchshil-super.lockated.com/company_setups.json",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer eH5eu3-z4o42iaB-npRdy1y3MAUO4zptxTIf2YyT7BA",
          },
          body: formDataToSend, // Send FormData directly (no JSON stringify needed)
        }
      );

      if (response.ok) {
        toast.success("Company created successfully!");
        setFormData({ companyName: "", companyLogo: null, organizationId: "" }); // Reset form
      } else {
        toast.error("Failed to create company. Please try again.");
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
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Company Setup</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company Name
                        <span style={{ color: "red", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="companyName"
                        value={formData.companyName}
                        onChange={handleChange}
                        placeholder="Enter name"
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company Logo
                        <span style={{ color: "red", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        onChange={handleFileChange}
                        required
                        accept=".png,.jpg,.jpeg,.svg"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Organization Id
                        <span style={{ color: "red", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <select
                        className="form-control form-select"
                        name="organizationId"
                        value={formData.organizationId}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Select Organization</option>
                        {loading ? (
                          <option>Loading...</option>
                        ) : (
                          organizations.map((org) => (
                            <option key={org.id} value={org.id}>
                              {org.name}
                            </option>
                          ))
                        )}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button
                      type="submit"
                      className="purple-btn2 w-100"
                      disabled={submitting}
                    >
                      {submitting ? "Submitting..." : "Submit"}
                    </button>
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="purple-btn2 w-100"
                      onClick={() =>
                        setFormData({
                          companyName: "",
                          companyLogo: null,
                          organizationId: "",
                        })
                      }
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyCreate;
