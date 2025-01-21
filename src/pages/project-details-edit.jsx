import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";

const ProjectDetailsEdit = () => {
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
      country: "India"
    },
    brochure: "",  // file input for brochure
    two_d_images: [] // array of file inputs for 2D images
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
            Authorization: `Bearer kD8B8ZeWZQAd2nQ-70dcfLXgYHLQh-zjggvuuE_93BY`, // Replace with actual token
          },
        }
      );
      console.log(response.data);
      alert("Form submitted successfully!");
    } catch (error) {
      console.error("Error submitting the form:", error);
      alert("Failed to submit the form. Please try again.");
    }
  };
  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY"; // Replace with your actual token
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
      // const token = "UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/get_property_types.json";

      try {
        const response = await axios.get(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
        });

        setConfigurations(response.data?.configurations);
        console.log("configurations", Configurations);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "UNE7QFnkjxZJgtKm-Od6EaNeBsWOAiGGp8RpXpWrYQY"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/amenity_setups.json";

      try {
        const response = await axios.get(url, {
          // headers: {
          //   Authorization: `Bearer ${token}`,
          // },
        });

        setAmenities(response.data?.amenities_setups);
        console.log("amenities_setups", Amenities);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  const [project, setProject] = useState(null); // State to hold project data
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    // Fetch project data
    const fetchProject = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/projects/1.json"
        );
        setProject(response.data);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError("Failed to fetch project details.");
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, []);


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
                          value={formData.propertyType}
                          onChange={handleChange}
                        >
                          <option value="" disabled selected>
                          {project.property_type}
                          </option>
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
                          value={formData.constructionStatus}
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
                          placeholder={project.project_name}
                          name="Project_Name"
                          value={formData.Project_Name}
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
                          value={formData.location}
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
                          value={formData.description}
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
                          value={formData.priceOnward}
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
                          value={formData.projectSizeMtr}
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
                          name="projectSizeFt"
                          value={formData.projectSizeFt}
                          onChange={handleChange}
                        />
                      </div>
                    </div>
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label>Rare Carpet Area (Sq. M)</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="rareCarpetAreaMtr"
                          value={formData.rareCarpetAreaMtr}
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
                          value={formData.rareCarpetAreaFt}
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
                          value={formData.numTowers}
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
                        <label>Rare Number</label>
                        <input
                          className="form-control"
                          type="number"
                          placeholder="Default input"
                          name="rareNumber"
                          value={formData.rareNumber}
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
                          value={formData.landArea}
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
                          value={formData.addressLine1}
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
                  <div className="row">
                    {/* Brochure Upload */}
                    <div className="col-md-3 mt-2">
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
                    </div>

                    {/* 2D Images */}
                    <div className="col-md-3 mt-2">
                      <div className="form-group">
                        <label htmlFor="two_d_images">2D Images</label>
                        <input
                          id="two_d_images"
                          className="form-control"
                          type="file"
                          placeholder="Enter 2D image details"
                          multiple
                          accept="image/*"


                          name="two_d_images"
                          onChange={handleChange}
                        />
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
          <Footer />
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsEdit;
