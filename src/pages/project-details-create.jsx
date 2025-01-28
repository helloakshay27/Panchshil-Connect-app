import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import toast from "react-hot-toast";


const ProjectDetailsCreate = () => {
  const [formData, setFormData] = useState({
    property_type: "",
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
    brochure: null, // for file input
    two_d_images: [] // for array of file inputs
  });



  const [projectsType, setprojectsType] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [amenities, setAmenities] = useState([]);




  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      if (name === "brochure") {
        // Store only the first file for 'brochure'
        setFormData({
          ...formData,
          brochure: files[0],
        });
      } else if (name === "two_d_images") {
        // Convert FileList to an array to ensure we handle multiple files
        setFormData({
          ...formData,
          two_d_images: Array.from(files), // Convert FileList to an array
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();

    for (const key in formData) {
      if (key === "address") {
        // Append nested address fields
        for (const addressKey in formData.address) {
          data.append(`project[Address][${addressKey}]`, formData.address[addressKey]);
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
            Authorization: `Bearer ZGehSTAEWJ728O8k2DZHr3t2wpdpngrH7n8KFN5s6x4`, // Replace with actual token
          },
        }
      );
      console.log(response.data);
      toast.success("Project submited successfully")
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit the form. Please try again.");
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/get_property_types.json";

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
      const url = "https://panchshil-super.lockated.com/get_property_types.json";

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


  return (
    <>
      {/* <Header /> */}
      <div className="module-data-section p-3">
        <form onSubmit={handleSubmit}>
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Project Details</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Project Type */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Project Types</label>
                    <select
                      className="form-control form-select"
                      name="type_of_project"
                      value={formData.type_of_project}
                      onChange={handleChange}
                    >
                      <option value="" disabled>
                        Select Project Type
                      </option>
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
                    <label>SFDC Project ID</label>
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
                    <label>Project Construction Status</label>
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
                    <label>Configuration Type</label>
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
                    <label>Project Name</label>
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
                    <label>Location</label>
                    <input
                      className="form-control"
                      type="text"
                      name="location"
                      placeholder="Enter Location"
                      value={formData.location}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Project Description */}
                <div className="col-md-6 mt-2">
                  <div className="form-group">
                    <label>Project Description</label>
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
                    <label>Price Onward</label>
                    <input
                      className="form-control"
                      type="number"
                      name="Price_Onward"
                      placeholder="Enter Price Onward"
                      value={formData.Price_Onward}
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
                      name="Project_Size_Sq_Mtr"
                      placeholder="Enter Size in Sq. Mtr."
                      value={formData.Project_Size_Sq_Mtr}
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
                      name="Project_Size_Sq_Ft"
                      placeholder="Enter Size in Sq. Ft."
                      value={formData.Project_Size_Sq_Ft}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="col-md-3 mt-2">
                  <div className="form-group">
                    <label>RERA Carpet Area (Sq. M)</label>
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
                    <label>RERA Carpet Area (Sq. Ft.)</label>
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
                    <label>Number of Towers</label>
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
                    <label>Number of Units</label>
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
                    <label>RERA Number</label>
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
                    <label>Amenities</label>
                    <select
                      className="form-control form-select"
                      style={{ width: "100%" }}
                      name="project_amenities"
                      value={formData.project_amenities}
                      onChange={handleChange}
                    >
                      <option disabled>Select amenities</option>
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
                    <label>Address Line </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Address Line 1"
                      name="addressLine1"
                      value={formData.addressLine1}
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
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th>File Type</th>
                          <th>File Name</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 2D Images */}
                        {formData.two_d_images.map((file, index) => (
                          <tr key={index}>
                            <td>2D Image {index + 1}</td>
                            <td>{file.name}</td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2 "
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
              <button type="submit" className="purple-btn2 w-100">
                Submit
              </button>
            </div>
          </div>
        </form>


      </div>
    </>
  );
};

export default ProjectDetailsCreate;
