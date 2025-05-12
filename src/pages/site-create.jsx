import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const SiteCreate = () => {
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Initialize form data with all required fields
  const [formData, setFormData] = useState({
    name: "",
    companyId: "",
    departmentId: "",
    latitude: "",
    longitude: "",
    address: "",
    city: "",
    district: "",
    state: "",
    projectId: "",
    status: "active",
    // deleted: false,
  });

  console.log("Form Data:", formData);

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

  // Fetch Companies
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
          setCompanies(data.company_setups);
        } else {
          setCompanies([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching companies:", error);
        toast.error("Failed to fetch companies.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch Departments
  useEffect(() => {
    setLoading(true);
    fetch(`${baseURL}departments.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Departments data:", data); // Debug log
        if (Array.isArray(data.departments)) {
          setDepartments(data.departments);
        } else if (Array.isArray(data)) {
          // If data is directly an array
          setDepartments(data);
        } else {
          setDepartments([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching departments:", error);
        toast.error("Failed to fetch departments.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Fetch Projects
  useEffect(() => {
    setLoading(true);
    fetch(`${baseURL}get_all_projects.json`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("access_token")}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (Array.isArray(data.projects)) {
          setProjects(data.projects);
        } else {
          setProjects([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching projects:", error);
        toast.error("Failed to fetch projects.");
      })
      .finally(() => setLoading(false));
  }, []);

  // Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Validate Form Before Submission
  const validateForm = () => {
    if (!formData.name.trim()) {
      toast.error("Site Name is required.");
      return false;
    }
    if (!formData.companyId) {
      toast.error("Company is required.");
      return false;
    }
    // if (!formData.organizationId) {
    //   toast.error("Organization is required.");
    //   return false;
    // }
    return true;
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`${baseURL}sites.json`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          site: {
            name: formData.name,
            organization_id: formData.organizationId,
            company_id: formData.companyId,
            department_id: formData.departmentId || null,
            latitude: formData.latitude ? parseFloat(formData.latitude) : null,
            longitude: formData.longitude ? parseFloat(formData.longitude) : null,
            address: formData.address,
            city: formData.city,
            district: formData.district,
            state: formData.state,
            project_id: formData.projectId || null,
            // active: true,
            // deleted: false,
            status: "active",
          },
        }),
      });

      if (response.ok) {
        toast.success("Site created successfully!");
        navigate("/site-list");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create site.");
      }
    } catch (error) {
      console.error("Error submitting site:", error);
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
                <h3 className="card-title">Site Create</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* Site Name */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Site Name <span className="otp-asterisk"> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter Site Name"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company <span className="otp-asterisk"> *</span>
                      </label>
                      <SelectBox
                        name="companyId"
                        options={
                          loading
                            ? [{ value: "", label: "Loading..." }]
                            : companies.length > 0
                            ? companies.map((comp) => ({
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

                  {/* Organization */}
                  {/* <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Organization <span className="otp-asterisk"> *</span>
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
                  </div> */}
              

                
                  {/* Department */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Department</label>
                      <SelectBox
                        name="departmentId"
                        options={
                          loading
                            ? [{ value: "", label: "Loading..." }]
                            : departments.length > 0
                            ? departments.map((dept) => ({
                                value: dept.id,
                                label: dept.name,
                              }))
                            : [{ value: "", label: "No departments found" }]
                        }
                        value={formData.departmentId}
                        onChange={(value) =>
                          setFormData({ ...formData, departmentId: value })
                        }
                      />
                    </div>
                  </div>

                  {/* Project */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Project</label>
                      <SelectBox
                        name="projectId"
                        options={
                          loading
                            ? [{ value: "", label: "Loading..." }]
                            : projects.length > 0
                            ? projects.map((project) => ({
                                value: project.id,
                                label: project.name || project.project_name,
                              }))
                            : [{ value: "", label: "No projects found" }]
                        }
                        value={formData.projectId}
                        onChange={(value) =>
                          setFormData({ ...formData, projectId: value })
                        }
                      />
                    </div>
                  </div>
               

               
                  {/* Latitude */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Latitude</label>
                      <input
                        className="form-control"
                        type="text"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleChange}
                        placeholder="Enter Latitude"
                      />
                    </div>
                  </div>

                  {/* Longitude */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Longitude</label>
                      <input
                        className="form-control"
                        type="text"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleChange}
                        placeholder="Enter Longitude"
                      />
                    </div>
                  </div>
                

               
                  {/* Address */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Address</label>
                      <input
                        className="form-control"
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Enter Address"
                      />
                    </div>
                  </div>
               
                
                  {/* City */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>City</label>
                      <input
                        className="form-control"
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter City"
                      />
                    </div>
                  </div>

                  {/* District */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>District</label>
                      <input
                        className="form-control"
                        type="text"
                        name="district"
                        value={formData.district}
                        onChange={handleChange}
                        placeholder="Enter District"
                      />
                    </div>
                  </div>

                  {/* State */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>State</label>
                      <input
                        className="form-control"
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        placeholder="Enter State"
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
                  onClick={() => navigate(-1)}
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

export default SiteCreate;