import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProjectDetailsCreate = () => {
  const [formData, setFormData] = useState({
    property_type: "",
    SFDC_Project_Id: "",
    Project_Construction_Status: "",
    Configuration_Type: "",
    Project_Name: "",
    project_address: "",
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
    location: {
      address: "",
      address_line_two: "",
      city: "",
      state: "",
      pin_code: "",
      country: "",
    },
    brochure: null, // for file input
    two_d_images: [], // for array of file inputs
  });

  const [projectsType, setprojectsType] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [amenities, setAmenities] = useState([]);

  const Navigate = useNavigate();

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      if (name === "brochure") {
        // Store only the first file for 'brochure'
        setFormData((prev) => ({
          ...prev,
          brochure: files[0],
        }));
      } else if (name === "two_d_images") {
        // Convert FileList to an array to ensure we handle multiple files
        const newImages = Array.from(files);

        setFormData((prev) => ({
          ...prev,
          two_d_images: [...prev.two_d_images, ...newImages],
        }));
      }
    } else {
      // Check if the field belongs to the "location" object
      if (["address", "address_line_two", "city", "state", "pin_code", "country"].includes(name)) {
        setFormData((prev) => ({
          ...prev,
          location: {
            ...prev.location, // Preserve existing location data
            [name]: value, // Update specific field
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };


  const handleDiscardFile = (fileType, index) => {
    if (fileType === "brochure") {
      setFormData({ ...formData, brochure: null });
    } else if (fileType === "two_d_images") {
      const updatedFiles = [...formData.two_d_images];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, two_d_images: updatedFiles });
    }
  };
  const validateForm = (formData) => {
    const errors = [];

    // Required fields (text fields)
    // if (!formData.property_type) {
    //   errors.push("Project Type is required.");
    //   return errors; // Return the first error immediately
    // }
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
    if (!formData.project_address) {
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
    // if (!formData.specifications) {
    //   errors.push("Specifications are required.");
    //   return errors; // Return the first error immediately
    // }
    if (!formData.Land_Area) {
      errors.push("Land Area is required.");
      return errors; // Return the first error immediately
    }

    // Address validation (nested fields)
    if (!formData.location || !formData.location.address) {
      errors.push("Address Line 1 is required.");
      return errors; // Return the first error immediately
    }
    // // Address validation (nested fields)
    // if (!formData.address_line_two || !formData.location.address_line_two) {
    //   errors.push("Address Line 2 is required.");
    //   return errors; // Return the first error immediately
    // }
    if (!formData.location || !formData.location.city) {
      errors.push("City is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.location || !formData.location.state) {
      errors.push("State is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.location || !formData.location.pin_code) {
      errors.push("Pin Code is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.location || !formData.location.country) {
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm(formData);

    if (validationErrors.length > 0) {
      // Show only the first validation error
      toast.error(validationErrors[0]);
      return; // Stop form submission if there are errors
    }

    const data = new FormData();

    for (const key in formData) {
      if (key === "location") {
        // Append nested address fields
        for (const addressKey in formData.location) {
          data.append(
            `project[Address][${addressKey}]`,
            formData.location[addressKey]
          );
        }
      } else if (key === "brochure") {
        // Append single file
        if (formData.brochure) {
          data.append("project[brochure]", formData.brochure);
        }
      } else if (key === "two_d_images") {
        // Append multiple files
        if (formData.two_d_images && formData.two_d_images.length > 0) {
          Array.from(formData.two_d_images).forEach((file) => {
            data.append("project[two_d_images][]", file); // Use [] to indicate an array
          });
        }
      } else {
        // Append all other fields
        data.append(`project[${key}]`, formData[key]);
      }
    }

    // Debugging: Log FormData
    for (let [key, value] of data.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/projects.json",
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE`, // Replace with actual token
          },
        }
      );
      console.log(response.data);
      toast.success("Project submited successfully");
      Navigate("/project-list");
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url =
        "https://panchshil-super.lockated.com/get_property_types.json";

      try {
        const response = await axios.get(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
        });

        setprojectsType(response.data?.property_types);
        console.log("projectsType", projectsType);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url =
        "https://panchshil-super.lockated.com/get_property_types.json";

      try {
        const response = await axios.get(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
        });

        setConfigurations(response.data?.configurations);
        console.log("configurations", configurations);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/amenity_setups.json";

      try {
        const response = await axios.get(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
        });

        setAmenities(response.data?.amenities_setups);
        console.log("amenities_setups", amenities);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);
  const handleCancel = () => {
    setFormData({
      property_type: "",
      SFDC_Project_Id: "",
      Project_Construction_Status: "",
      Configuration_Type: "",
      Project_Name: "",
      project_address: "",
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
      location: {
        address: "",
        address_line_two: "",
        city: "",
        state: "",
        pin_code: "",
        country: "",
      },
      brochure: null,
      two_d_images: [],
    });
  };

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
              {/* Project Type */}
              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Project Types
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <select
                    className="form-control form-select"
                    name="type_of_project"
                    value={formData.type_of_project}
                    onChange={handleChange}
                  >
                    <option value="">-- Select Project Type --</option>
                    {projectsType.map((type, index) => (
                      <option key={index} value={type.id}>
                        {type.property_type}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SFDC Project ID */}
              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    SFDC Project ID
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="SFDC_Project_Id"
                    placeholder="Enter SFDC Project ID"
                    value={formData.SFDC_Project_Id}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Construction Status */}
              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Project Construction Status
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <select
                    className="form-control form-select"
                    name="Project_Construction_Status"
                    value={formData.Project_Construction_Status}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select status
                    </option>
                    <option value="Completed">Completed</option>
                    <option value="Ready-To-Move-in">Ready To Move in</option>
                  </select>
                </div>
              </div>

              {/* Configuration Type */}
              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Configuration Type
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <select
                    className="form-control form-select"
                    name="Configuration_Type"
                    value={formData.Configuration_Type}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Type
                    </option>
                    <option value="3 BHK">3 BHK</option>
                    <option value="4 BHK">4 BHK</option>
                  </select>
                </div>
              </div>

              {/* Project Name */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Name
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="Project_Name"
                    placeholder="Enter Project Name"
                    value={formData.Project_Name}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Location
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="project_address"
                    placeholder="Enter Location"
                    value={formData.project_address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Project Description */}
              <div className="col-md-6 mt-2">
                <div className="form-group">
                  <label>
                    Project Description
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={1}
                    name="Project_Description"
                    placeholder="Enter Project Description"
                    value={formData.Project_Description}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Price Onward
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text-number"
                    name="Price_Onward"
                    placeholder="Enter Price Onward"
                    value={formData.Price_Onward}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Size (Sq. Mtr.)
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Project_Size_Sq_Mtr"
                    placeholder="Enter Size in Sq. Mtr."
                    value={formData.Project_Size_Sq_Mtr}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Size (Sq. Ft.)
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Project_Size_Sq_Ft"
                    placeholder="Enter Size in Sq. Ft."
                    value={formData.Project_Size_Sq_Ft}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    RERA Carpet Area (Sq. M)
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Rera_Carpet_Area_Sq_M"
                    placeholder="Enter RERA Carpet Area (Sq. M)"
                    value={formData.Rera_Carpet_Area_Sq_M}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    RERA Carpet Area (Sq. Ft.)
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Rera_Carpet_Area_sqft"
                    placeholder="Enter RERA Carpet Area (Sq. Ft.)"
                    value={formData.Rera_Carpet_Area_sqft}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Number of Towers
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Number_Of_Towers"
                    placeholder="Enter Number of Towers"
                    value={formData.Number_Of_Towers}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Number of Units
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Number_Of_Units"
                    placeholder="Enter Number of Units"
                    value={formData.Number_Of_Units}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    RERA Number
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="Rera_Number"
                    placeholder="Enter RERA Number"
                    value={formData.Rera_Number}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Amenities
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <select
                    className="form-control form-select"
                    style={{ width: "100%" }}
                    name="project_amenities"
                    value={formData.project_amenities}
                    onChange={handleChange}
                  >
                    <option>Select amenities</option>
                    {amenities?.map((ammit, index) => (
                      <option key={index} value={ammit.id}>
                        {ammit.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Specifications
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <select
                    className="form-control form-select"
                    style={{ width: "100%" }}
                    name="specifications"
                    value={formData.specifications}
                    onChange={handleChange}
                  >
                    <option value="" disabled>
                      Select Specifications
                    </option>
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
                  <label>
                    Land Area
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="Land_Area"
                    placeholder="Enter Land Area"
                    value={formData.Land_Area}
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
          <div className="card-body mt-0 pb-0">
            <div className="row">
              {/* Address Section */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Address Line 1
                    <span style={{ color: "red", fontSize: "16px" }}>
                      *
                    </span>{" "}
                  </label>
                  <input
                    //title="location.address"
                    className="form-control"
                    type="text"
                    placeholder="Address Line 1"
                    name="address"
                    value={formData.location.address}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Address Line 2
                    <span style={{ color: "red", fontSize: "16px" }}>
                      *
                    </span>{" "}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Address Line 2"
                    name="address_line_two"
                    value={formData.location.address_line_two}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* City, State, Pin, Country Section */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    City
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="City"
                    name="city"
                    value={formData.location.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    State
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="State"
                    name="state"
                    value={formData.location.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Pin Code
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Pin Code"
                    name="pin_code"
                    value={formData.location.pin_code}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Country
                    <span style={{ color: "red", fontSize: "16px" }}> *</span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Country"
                    name="country"
                    value={formData.location.country}
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

              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Brochure{" "}
                  <span style={{ color: "red", fontSize: "16px" }}> *</span>
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() => document.getElementById("brochure").click()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span>Add</span>
                </button>
                <input
                  id="brochure"
                  className="form-control"
                  type="file"
                  name="brochure"
                  accept=".pdf,.docx"
                  onChange={handleChange}
                  style={{ display: "none" }}
                />
              </div>

              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container w-100">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>File Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Brochure */}
                      {formData.brochure && (
                        <tr>
                          <td>{formData.brochure?.name}</td>

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
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() =>
                    document.getElementById("two_d_images").click()
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
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
                        <th>File Name</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* 2D Images */}
                      {formData.two_d_images.map((file, index) => (
                        <tr key={index}>
                          <td> {file.name}</td>
                          <td>
                            <img
                              style={{ maxWidth: 100, maxHeight: 100 }}
                              className="img-fluid rounded"
                              src={
                                file.type.startsWith("image")
                                  ? URL.createObjectURL(file)
                                  : null
                              }
                              alt=""
                            />
                          </td>

                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() =>
                                handleDiscardFile("two_d_images", index)
                              }
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
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button onClick={handleSubmit} className="purple-btn2 w-100">
                Submit
              </button>
            </div>
            <div className="col-md-2">
              <button
                type="button"
                onClick={handleCancel}
                className="purple-btn2 w-100"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsCreate;
