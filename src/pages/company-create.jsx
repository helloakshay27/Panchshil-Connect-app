import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";

const CompanyCreate = () => {
  const navigate = useNavigate();
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
        console.log("Fetched organizations:", data); // Debugging
        if (Array.isArray(data)) {
          setOrganizations(data);
        } else if (data && Array.isArray(data.organizations)) {
          setOrganizations(data.organizations); // Adjust based on API response
        } else {
          console.error("Unexpected data format:", data);
          setOrganizations([]); // Prevent errors if data is not an array
        }
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
      formDataToSend.append("company_logo", formData.companyLogo);
    }

    try {
      console.log("Submitting form data:", Object.fromEntries(formDataToSend)); // Debugging

      const response = await fetch(
        "https://panchshil-super.lockated.com/company_setups.json",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer eH5eu3-z4o42iaB-npRdy1y3MAUO4zptxTIf2YyT7BA",
          },
          body: formDataToSend, // Send FormData directly
        }
      );

      console.log("Response Status:", response.status); // Debugging
      const responseData = await response.json();
      console.log("Response Data:", responseData); // Debugging

      if (response.ok) {
        toast.success("Company created successfully!");
        setFormData({ companyName: "", companyLogo: null, organizationId: "" });
        navigate("/company-list");
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
          <form onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Company Setup</h3>
              </div>
              <div className="card-body">
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
                      <SelectBox
                        name="organizationId"
                        options={
                          loading
                            ? [{ value: "", label: "Loading..." }]
                            : Array.isArray(organizations) &&
                              organizations.length > 0
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
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
