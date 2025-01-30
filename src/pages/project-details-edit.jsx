import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";


const ProjectDetailsEdit = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    type_of_project: "",
    SFDC_Project_Id: "",
    Project_Construction_Status: "",
    Configuration_Type: "",
    Project_Name: "",
    location: "",
    Project_Description: "",
    Price_Onward: "",
    Project_Size_Sq_Mtr: "",
    Project_Size_Sq_Ft: "",
    Rera_Carpet_Area_Sq_M: "",
    Rera_Carpet_Area_sqft: "",
    Number_Of_Towers: "",
    Number_Of_Units: "",
    Rera_Number: "",
    project_amenities: "",
    specifications: "",
    Land_Area: "",
    address: {
      addressLine1: "line 1",
      addressLine2: "line 2",
      addressLine3: "line 3",
      city: "Pune",
      state: "Maharashtra",
      pinCode: "400709",
      country: "India",
    },
    brochure: null, // file input for brochure
    two_d_images: [], // array of file inputs for 2D images
  });

  const [projectsType, setProjectsType] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE_URL = "https://panchshil-super.lockated.com";
  const AUTH_TOKEN = "Bearer RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token

  // Unified API Fetcher
  const fetchData = async (endpoint, setter) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/${endpoint}`, {
        headers: { Authorization: AUTH_TOKEN },
      });
      setter(response.data);
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
    }
  };

  // Fetch all dropdown data on mount
  useEffect(() => {
    fetchData("get_property_types.json", (data) =>
      setProjectsType(data?.property_types || [])
    );
    fetchData("get_property_types.json", (data) =>
      setConfigurations(data?.configurations || [])
    );
    fetchData("amenity_setups.json", (data) =>
      setAmenities(data?.amenities_setups || [])
    );
  }, []);

  // Fetch specific project details on mount
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/projects/${id}.json`, {
          headers: { Authorization: AUTH_TOKEN },
        });
        const projectData = response.data;
        setFormData({
          type_of_project: projectData.property_type || "",
          SFDC_Project_Id: projectData.SFDC_Project_Id || "",
          Project_Construction_Status: projectData.Project_Construction_Status || "",
          Configuration_Type: projectData.building_type || "",
          Project_Name: projectData.Project_Name || "",
          location: projectData.location || "",
          Project_Description: projectData.Project_Description || "",
          Price_Onward: projectData.price || "",
          Project_Size_Sq_Mtr: projectData.project_size_sq_mtr || "",
          Project_Size_Sq_Ft: projectData.project_size_sq_ft || "",
          Rera_Carpet_Area_Sq_M: projectData.rera_carpet_area_sq_mtr || "",
          Rera_Carpet_Area_sqft: projectData.rera_carpet_area_sqft || "",
          Number_Of_Towers: projectData.no_of_towers || "",
          Number_Of_Units: projectData.Number_Of_Units || "",
          Rera_Number: projectData.rera_number || "",
          specifications: projectData.specifications || "",
          Land_Area: projectData.land_area || "",
          address: {
            addressLine1: projectData.project_address || "line 1",
            city: projectData.address?.city || "Pune",
            state: projectData.address?.state || "Maharashtra",
            pinCode: projectData.address?.pinCode || "400709",
            country: projectData.address?.country || "India",
          },
          brochure: projectData.brochure || null,
          two_d_images: projectData.two_d_images || [],
        });
        setProject(response.data);
      } catch (err) {
        setError("Failed to fetch project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetails();
  }, []);

  // Handle form changes
  const handleChange = (e) => {
    const { name, files, value } = e.target;

    if (name === "brochure") {
      // Update brochure file
      setFormData((prev) => ({
        ...prev,
        brochure: files[0],
      }));
    } else if (name === "two_d_images") {
      // Update 2D images array
      const newImages = Array.from(files);
      setFormData((prev) => ({
        ...prev,
        two_d_images: [...prev.two_d_images, ...newImages],
      }));
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle file discard
  const handleDiscardFile = (type, index) => {
    if (type === "brochure") {
      // Remove brochure
      setFormData((prev) => ({
        ...prev,
        brochure: null,
      }));
    } else if (type === "two_d_images") {
      // Remove specific 2D image
      setFormData((prev) => ({
        ...prev,
        two_d_images: prev.two_d_images.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (formData) => {
    const errors = [];
  
    // Required fields (text fields)
    if (!formData.property_type) {
      errors.push("Project Type is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.SFDC_Project_Id) {
      errors.push("SFDC Project ID is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Project_Construction_Status) {
      errors.push("Construction Status is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Configuration_Type) {
      errors.push("Configuration Type is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Project_Name) {
      errors.push("Project Name is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.location) {
      errors.push("Location is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Project_Description) {
      errors.push("Project Description is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Price_Onward) {
      errors.push("Price Onward is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Project_Size_Sq_Mtr) {
      errors.push("Project Size (Sq. Mtr.) is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Project_Size_Sq_Ft) {
      errors.push("Project Size (Sq. Ft.) is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Rera_Carpet_Area_Sq_M) {
      errors.push("RERA Carpet Area (Sq. M) is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Rera_Carpet_Area_sqft) {
      errors.push("RERA Carpet Area (Sq. Ft.) is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Number_Of_Towers) {
      errors.push("Number of Towers is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Number_Of_Units) {
      errors.push("Number of Units is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Rera_Number) {
      errors.push("RERA Number is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.project_amenities) {
      errors.push("Amenities are required.");
      return errors; // Return the first error immediately
    }
    if (!formData.specifications) {
      errors.push("Specifications are required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Land_Area) {
      errors.push("Land Area is required.");
      return errors; // Return the first error immediately
    }
  
    // Address validation (nested fields)
    if (!formData.address || !formData.address.addressLine1) {
      errors.push("Address Line 1 is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.address || !formData.address.city) {
      errors.push("City is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.address || !formData.address.state) {
      errors.push("State is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.address || !formData.address.pinCode) {
      errors.push("Pin Code is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.address || !formData.address.country) {
      errors.push("Country is required.");
      return errors; // Return the first error immediately
    }
  
    // File validation (files must be present)
    if (!formData.brochure) {
      errors.push("Brochure is required.");
      return errors; // Return the first error immediately
    }
    if (formData.two_d_images.length === 0) {
      errors.push("At least one 2D image is required.");
      return errors; // Return the first error immediately
    }
  
    return errors; // Return the first error message if any
  };
  

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);

    if (validationErrors.length > 0) {
      // Show only the first validation error
      toast.error(validationErrors[0]);
      return; // Stop form submission if there are errors
    }

    const data = new FormData();

    // Append form data
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "address") {
        // Append nested address fields
        Object.entries(value).forEach(([subKey, subValue]) =>
          data.append(`project[Address][${subKey}]`, subValue)
        );
      } else if (key === "brochure" && value) {
        data.append("project[brochure]", value);
      } else if (key === "two_d_images" && value.length > 0) {
        value.forEach((file) =>
          data.append("project[two_d_images][]", file)
        );
      } else {
        data.append(`project[${key}]`, value);
      }
    });

    try {
      const response = await axios.put(`${API_BASE_URL}/projects/${id}.json`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer 0XH8lxmc2kQVcso9Dr86ymFfso2dctjn6ZDMBCnmN38`,
        },
      });
      toast.success("Project Updated successfully")
      console.log(response.data);
      Navigate("/project-list");
    } catch (error) {
      // alert("Failed to submit the form. Please try again.");
      console.error("Error submitting the form:", error);
    }
  };

  // Render loading or error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <>
      {/* <Header /> */}

      <div className="module-data-section p-3">
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Project Details</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <label>Project Types</label>
                  <select
                    className="form-control form-select"
                    style={{ width: "100%" }}
                    name="type_of_project"
                    value={formData.type_of_project || project?.property_type} // Handle default values
                    onChange={handleChange}
                  >
                    {/* <option value="" disabled selected>
                            {project?.property_type}
                          </option> */}
                    {projectsType?.map((type, index) => (
                      <option key={index} value={type.id}>
                        {type.property_type}
                      </option>
                    ))}

                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label>SFDC Project ID</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Default input"
                    name="SFDC_Project_Id"
                    value={formData.SFDC_Project_Id}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label>Project Construction Status</label>
                  <select
                    className="form-control form-select"
                    style={{ width: "100%" }}
                    name="Project_Construction_Status"
                    value={formData.Project_Construction_Status || project?.building_type}
                    onChange={handleChange}
                  >
                    <option value="" disabled selected>
                      Select status
                    </option>
                    <option value="Completed">Completed </option>
                    <option value="Ready-To-Move-in">Ready To Move in </option>

                  </select>
                </div>
              </div>
              <div className="col-md-3">
                <div className="form-group">
                  <label>Configuration Type</label>
                  <select
                    className="form-control form-select"
                    style={{ width: "100%" }}
                    name="Configuration_Type"
                    value={formData.Configuration_Type}
                    onChange={handleChange}
                  >
                    <option value="" disabled selected>
                      Select Type
                    </option>
                    <option value="Alabama">3 BHK</option>
                    <option value="Alaska">4 BHK</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Project Name</label>
                  <input
                    className="form-control"
                    type="text"
                    name="Project_Name"
                    value={formData.Project_Name || project?.Project_Name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Location</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Default input"
                    name="location"
                    value={formData.location || project?.location}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6 mt-2">
                <div className="form-group">
                  <label>Project Description</label>
                  <textarea
                    className="form-control"
                    rows={1}
                    placeholder="Enter ..."
                    name="Project_Description"
                    value={formData.Project_Description || project?.Project_Description}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Price Onward</label>

                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Price_Onward"
                    value={formData.Price_Onward || project?.price}
                    onChange={handleChange}
                  />

                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Project Size (Sq. Mtr.)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Project_Size_Sq_Mtr"
                    value={formData.Project_Size_Sq_Mtr || project?.project_size_sq_mtr}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Project Size (Sq. Ft.)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name=" "
                    value={formData.Project_Size_Sq_Ft || project?.project_size_sq_ft}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Rera Carpet Area (Sq. M)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Rera_Carpet_Area_Sq_M"
                    value={formData.Rera_Carpet_Area_Sq_M || project?.rera_carpet_area_sq_mtr}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Rare Carpet Area (Sq. Ft.)</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Rera_Carpet_Area_sqft"
                    value={formData.Rera_Carpet_Area_sqft || project?.rera_carpet_area_sqft}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Number of Towers</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Number_Of_Towers"
                    value={formData.Number_Of_Towers || project?.no_of_towers}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Number of Units</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Number_Of_Units"
                    value={formData.Number_Of_Units}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Rera Number</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Rera_Number"
                    value={formData.Rera_Number || project?.rera_number}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Amenities</label>
                  <select
                    className="form-control form-select"
                    style={{ width: "100%" }}
                    name="project_amenities"
                    value={formData.project_amenities}
                    onChange={handleChange}
                  >
                    <option disabled>Select a amenities</option>
                    {amenities?.map((ammit, index) => (
                      <option key={index} value={ammit.id}>
                        {ammit.name}
                      </option>
                    ))

                    }
                  </select>
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Specifications</label>
                  <select
                    className="form-control form-select"
                    style={{ width: "100%" }}
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                  >
                    <option value="Alabama">Alabama</option>
                    <option value="Alaska">Alaska</option>
                    <option value="California">California</option>
                    <option value="Delaware">Delaware</option>
                    <option value="Tennessee">Tennessee</option>
                    <option value="Texas">Texas</option>
                    <option value="Washington">Washington</option>
                  </select>
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Land Area</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Land_Area"
                    value={formData.Land_Area || project?.land_area}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3">
            <h3 className="card-title">Address</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Address Section */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Address Line </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1 || project?.project_address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Address Line </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Address Line 1"
                    name="addressLine1"
                    value={formData.addressLine1 || project?.project_address}
                    onChange={handleChange}
                  />
                </div>
              </div>



              {/* City, State, Pin, Country Section */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>City</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="City"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>State</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="State"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Pin Code</label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Pin Code"
                    name="pinCode"
                    value={formData.pinCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Country</label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3">
            <h3 className="card-title">File Upload</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Brochure Upload */}
              <div className="form-group">
                <label htmlFor="brochure">
                  Brochure
                  <span style={{ color: "red", fontSize: "16px" }}>*</span>
                </label>
                <input
                  id="brochure"
                  style={{ width: "20%" }}
                  className="form-control"
                  type="file"
                  name="brochure"
                  accept=".pdf,.docx"
                  onChange={handleChange}
                />
              </div>

              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container w-100">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>File Type</th>
                        <th>File Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Brochure */}
                      {formData.brochure && (
                        <tr>
                          <td>Brochure</td>
                          <td>{formData.brochure.name}</td>
                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() => handleDiscardFile("brochure")}
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 2D Images */}
              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  2D Images{" "}
                  <span style={{ color: "red", fontSize: "16px" }}>*</span>
                </h5>
                <button
                  className="purple-btn2 mt-3"
                  onClick={() => document.getElementById("two_d_images").click()}
                >
                  <span className="material-symbols-outlined align-text-top me-2">
                    add
                  </span>
                  <span>Add</span>
                </button>
                <input
                  id="two_d_images"
                  type="file"
                  accept="image/*"
                  name="two_d_images"
                  onChange={handleChange}
                  multiple
                  style={{ display: "none" }}
                />
              </div>

              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>File Type</th>
                        <th>File Name</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 2D Images */}
                      {formData.two_d_images.map((file, index) => (
                        <tr key={index}>
                          <td>2D Image {index + 1}</td>
                          <td>{file.name}</td>
                          <td><img style={{ width: "70px" }} src={file.document_url} alt="" /></td>

                     
                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() => handleDiscardFile("two_d_images", index)}
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row mt-2 justify-content-center">
          <div className="col-md-2">
            <button onClick={handleSubmit} className="purple-btn2 w-100">
              Update
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsEdit;