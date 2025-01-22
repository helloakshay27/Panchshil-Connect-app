import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { useParams } from "react-router-dom";


const ProjectDetails = () => {
  const { id } = useParams();

  const [formData, setFormData] = useState({
    propertyType: "",
    sfdcProjectId: "",
    constructionStatus: "",
    configurationType: "",
    Project_Name: "",
    location: "",
    description: "",
    priceOnward: "",
    projectSizeMtr: "",
    projectSizeFt: "",
    rareCarpetAreaMtr: "",
    rareCarpetAreaFt: "",
    numTowers: "",
    numUnits: "",
    rareNumber: "",
    amenities: "",
    specifications: "",
    landArea: "",
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
  const AUTH_TOKEN = "Bearer UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY"; // Replace with your actual token

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
    const { name, type, files, value } = e.target;

    if (type === "file") {
      if (name === "brochure") {
        setFormData({ ...formData, brochure: files[0] });
      } else if (name === "two_d_images") {
        setFormData({ ...formData, two_d_images: Array.from(files) });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

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
      const response = await axios.post(`${API_BASE_URL}/projects.json`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: AUTH_TOKEN,
        },
      });
      alert("Form submitted successfully!");
      console.log(response.data);
    } catch (error) {
      alert("Failed to submit the form. Please try again.");
      console.error("Error submitting the form:", error);
    }
  };

  // Render loading or error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;


  return (
    <>
      {/* <Header /> */}
        <style>
          {`
          .form-disabled input,
          .form-disabled textarea,
          .form-disabled select {
            pointer-events: none;
            background-color: #f9f9f9;
            color: #6c757d;
            border: 1px solid #ccc;
            background-image: none;
          }
            .form-disabled input[type="file"] {
            display: none;
            }

          .form-disabled label {
            font-weight: bold;
          }
        `}
        </style>
          <div className="module-data-section p-3">
            <form onSubmit={handleSubmit}>

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
                          name="propertyType"
                          value={formData.propertyType || project?.property_type} // Handle default values
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
                          name="sfdcProjectId"
                          value={formData.sfdcProjectId}
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
                          name="constructionStatus"
                          value={formData.constructionStatus || project?.building_type}
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
                          name="configurationType"
                          value={formData.configurationType}
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
                          value={formData.Project_Name || project?.project_name}
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
                          rows={3}
                          placeholder="Enter ..."
                          name="description"
                          value={formData.description || project?.project_description}
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
                          name="priceOnward"
                          value={formData.priceOnward || project?.price}
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
                          name="projectSizeMtr"
                          value={formData.projectSizeMtr || project?.project_size_sq_mtr}
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
                          value={formData.projectSizeFt || project?.project_size_sq_ft}
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
                          name="rareCarpetAreaMtr"
                          value={formData.rareCarpetAreaMtr || project?.rera_carpet_area_sq_mtr}
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
                          name="rareCarpetAreaFt"
                          value={formData.rareCarpetAreaFt || project?.rera_carpet_area_sqft}
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
                          name="numTowers"
                          value={formData.numTowers || project?.no_of_towers}
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
                          name="numUnits"
                          value={formData.numUnits}
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
                          name="rareNumber"
                          value={formData.rareNumber || project?.rera_number}
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
                          name="amenities"
                          value={formData.amenities}
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
                          name="landArea"
                          value={formData.landArea || project?.land_area}
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
                        <label>Address Line 1</label>
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
                        <label>Address Line 2</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Address Line 2"
                          name="addressLine2"
                          value={formData.addressLine2}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Address Line 3</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Address Line 3"
                          name="addressLine3"
                          value={formData.addressLine3}
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
                  <h3 className="card-title">Document Attachment</h3>
                </div>
                <div className="card-body pb-2 mb-1 mt-0">
                  <div className="row ">
                    {/* Brochure Upload */}
                    <div className="col-md-12 ">
                      <h5 class=" ">Brochure</h5>
                      <div className=" tbl-container w-100">
                        <table className=" w-100">
                          <thead>
                            <tr>
                              <th>File Name</th>

                              <th>File Type</th>
                              <th>updated at</th>
                              <th>Image</th>

                            </tr>
                          </thead>
                          <tbody>
                            {/* Brochure */}
                            {project.brochure && (
                              <tr>
                                <td>{project.brochure?.document_file_name}</td>
                                <td>{project.brochure?.document_content_type}</td>
                                <td>{project.brochure?.document_updated_at}</td>
                                <td>

                                  <a href={`${project.brochure?.document_url}`}>

                                    <svg width="15" height="16" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.8468 22.9744H1.1545C0.662189 22.9744 0.333984 22.6462 0.333984 22.1538V15.5897C0.333984 15.0974 0.662189 14.7692 1.1545 14.7692C1.6468 14.7692 1.97501 15.0974 1.97501 15.5897V21.3333H20.0263V15.5897C20.0263 15.0974 20.3545 14.7692 20.8468 14.7692C21.3391 14.7692 21.6673 15.0974 21.6673 15.5897V22.1538C21.6673 22.6462 21.3391 22.9744 20.8468 22.9744ZM11.0007 18.0513C10.9186 18.0513 10.7545 18.0513 10.6724 17.9692C10.5904 17.9692 10.5083 17.8872 10.4263 17.8051L3.86219 11.241C3.53398 10.9128 3.53398 10.4205 3.86219 10.0923C4.19039 9.7641 4.6827 9.7641 5.01091 10.0923L10.1801 15.2615V0.820513C10.1801 0.328205 10.5083 0 11.0007 0C11.493 0 11.8212 0.328205 11.8212 0.820513V15.2615L16.9904 10.0923C17.3186 9.7641 17.8109 9.7641 18.1391 10.0923C18.4673 10.4205 18.4673 10.9128 18.1391 11.241L11.575 17.8051C11.493 17.8872 11.4109 17.9692 11.3289 17.9692C11.2468 18.0513 11.0827 18.0513 11.0007 18.0513Z" fill="#8B0203"></path></svg>
                                  </a>
                                </td>


                              </tr>
                            )}


                          </tbody>
                        </table>
                      </div>

                    </div>

                    {/* 2D Images */}
                    <div className="col-md-12 mt-2">
                      <h5 class=" ">2D Image</h5>

                      <div className="mt-4 tbl-container">
                        <table className="   w-100">
                          <thead>
                            <tr>
                              <th>File Name</th>

                              <th>File Type</th>
                              <th>updated at</th>
                              <th>Image</th>

                            </tr>
                          </thead>
                          <tbody>


                            {/* 2D Images */}
                            {project.two_d_images.length > 0 &&
                              project.two_d_images.map((file, index) => (
                                <tr key={index}>
                                  <td>{file.document_file_name}</td>
                                  <td>{file.document_content_type}</td>
                                  <td>{file.document_updated_at}</td>
                                  <td>

                                    <a href={`${file.document_url}`}> <svg width="15" height="16" viewBox="0 0 22 23" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M20.8468 22.9744H1.1545C0.662189 22.9744 0.333984 22.6462 0.333984 22.1538V15.5897C0.333984 15.0974 0.662189 14.7692 1.1545 14.7692C1.6468 14.7692 1.97501 15.0974 1.97501 15.5897V21.3333H20.0263V15.5897C20.0263 15.0974 20.3545 14.7692 20.8468 14.7692C21.3391 14.7692 21.6673 15.0974 21.6673 15.5897V22.1538C21.6673 22.6462 21.3391 22.9744 20.8468 22.9744ZM11.0007 18.0513C10.9186 18.0513 10.7545 18.0513 10.6724 17.9692C10.5904 17.9692 10.5083 17.8872 10.4263 17.8051L3.86219 11.241C3.53398 10.9128 3.53398 10.4205 3.86219 10.0923C4.19039 9.7641 4.6827 9.7641 5.01091 10.0923L10.1801 15.2615V0.820513C10.1801 0.328205 10.5083 0 11.0007 0C11.493 0 11.8212 0.328205 11.8212 0.820513V15.2615L16.9904 10.0923C17.3186 9.7641 17.8109 9.7641 18.1391 10.0923C18.4673 10.4205 18.4673 10.9128 18.1391 11.241L11.575 17.8051C11.493 17.8872 11.4109 17.9692 11.3289 17.9692C11.2468 18.0513 11.0827 18.0513 11.0007 18.0513Z" fill="#8B0203"></path></svg></a>
                                  </td>
                                </tr>
                              ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Display Uploaded Files in a Table */}

                </div>
              </div>

            </form>


          </div>
    </>
  );
};

export default ProjectDetails;
