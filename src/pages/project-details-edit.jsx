import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { useParams } from "react-router-dom";


const ProjectDetailsEdit = () => {
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
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
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
        <h3 className="card-title">File Upload</h3>
      </div>
      <div className="card-body">
        <div className="row ">
          {/* Brochure Upload */}
          <div className="col-md-6 mt-2">
            <div className="form-group">
              <label htmlFor="brochure">Brochure</label>
              <input
                id="brochure"
                className="form-control"
                type="file"
                name="brochure"
                accept=".pdf,.docx"
                onChange={handleChange}
              />
            </div>

            <div className="mt-4 tbl-container w-100">
          <table className=" w-100">
            <thead>
              <tr>
                <th>File Type</th>
                <th>File Name</th>
              </tr>
            </thead>
            <tbody>
              {/* Brochure */}
              {project.brochure && (
                <tr>
                  <td>Brochure</td>
                  <td>{project.brochure?.document_file_name}</td>
                </tr>
              )}

            
            </tbody>
          </table>
        </div>

          </div>

          {/* 2D Images */}
          <div className="col-md-6 mt-2">
            <div className="form-group">
              <label htmlFor="two_d_images">2D Images</label>
              <input
                id="two_d_images"
                className="form-control"
                type="file"
                multiple
                accept="image/*"
                name="two_d_images"
                onChange={handleChange}
              />
            </div>
            <div className="mt-4 tbl-container">
          <table className="   w-100">
            <thead>
              <tr>
                <th>File Type</th>
                <th>File Name</th>
              </tr>
            </thead>
            <tbody>
            

              {/* 2D Images */}
              {project.two_d_images.length > 0 &&
                project.two_d_images.map((file, index) => (
                  <tr key={index}>
                    <td>2D Image {index + 1}</td>
                    <td>{file.document_file_name}</td>
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
              <div className="row mt-2 justify-content-center">
                <div className="col-md-2">
                  <button type="submit" className="purple-btn2 w-100">
                    Submit
                  </button>
                </div>
              </div>
            </form>


          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsEdit;
