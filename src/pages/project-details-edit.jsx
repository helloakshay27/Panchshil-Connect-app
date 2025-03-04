import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import MultiSelectBox from "../components/base/MultiSelectBox";
import SelectBox from "../components/base/SelectBox";

const ProjectDetailsEdit = () => {
  const { id } = useParams();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    Property_Type: "",
    SFDC_Project_Id: "",
    Building_Type: "",
    Project_Construction_Status: "",
    Configuration_Type: [], // Ensure this is an array
    project_name: "",
    project_address: "",
    project_description: "",
    price: "",
    project_size_sq_mtr: "",
    Project_Size_Sq_Ft: "",
    Rera_Carpet_Area_Sq_M: "",
    Rera_Carpet_Area_sqft: "",
    Number_Of_Towers: "",
    no_of_apartments: "",
    Rera_Number: "",
    Amenities: [],
    Specifications: [],
    Land_Area: "",
    project_tag: "",
    virtual_tour_url: "",
    map_url: "",
    image: [],
    Address: {
      address_line_1: "",
      address_line_2: "",
      city: "",
      state: "",
      pin_code: "",
      country: "",
    },
    brochure: null, // file input for brochure
    two_d_images: [], // array of file inputs for 2D images
    videos: [],
  });

  console.log("formData", formData);

  const [projectsType, setProjectsType] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [specifications, setSpecifications] = useState([]);
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
      console.log("response:---", response.data);
    } catch (error) {
      console.error(`Error fetching data from ${endpoint}:`, error);
    }
  };

  // Fetch all dropdown data on mount
  useEffect(() => {
    fetchData("get_property_types.json", (data) =>
      setProjectsType(data?.property_types || [])
    );
    fetchData("configuration_setups.json", (data) =>
      setConfigurations(data || [])
    );
    fetchData("specification_setups.json", (data) =>
      setSpecifications(data?.specification_setups || [])
    );
    fetchData("amenity_setups.json", (data) =>
      setAmenities(data?.amenities_setups || [])
    );
  }, []);

  console.log("data", projectsType);
  // Fetch specific project details on mount
  useEffect(() => {
    const fetchProjectDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/projects/${id}.json`,
          {
            headers: { Authorization: AUTH_TOKEN },
          }
        );
        const projectData = response.data;

        console.log("this is project data", projectData);

        setFormData({
          Property_Type: projectData.property_type || "",
          SFDC_Project_Id: projectData.SFDC_Project_Id || "",
          Building_Type: projectData.building_type || "",
          Project_Construction_Status:
            projectData.Project_Construction_Status || "",
          Configuration_Type: Array.isArray(projectData.configurations)
            ? projectData.configurations.map((config) => config.name)
            : [],
          project_name: projectData.project_name || "",
          project_address: projectData.project_address || "",
          project_description: projectData.project_description || "",
          price: projectData.price || "",
          project_size_sq_mtr: projectData.project_size_sq_mtr || "",
          Project_Size_Sq_Ft: projectData.project_size_sq_ft || "",
          Rera_Carpet_Area_Sq_M: projectData.rera_carpet_area_sq_mtr || "",
          Rera_Carpet_Area_sqft: projectData.rera_carpet_area_sqft || "",
          Number_Of_Towers: projectData.no_of_towers || "",
          no_of_apartments: projectData.no_of_apartments || "",
          Rera_Number: projectData.rera_number || "",
          Amenities: Array.isArray(projectData.amenities)
            ? projectData.amenities.map((ammit) => ammit.name)
            : [],
          Specifications: Array.isArray(projectData.specifications)
            ? projectData.specifications.map((spac) => spac.name)
            : [],
          Land_Area: projectData.land_area || "",
          project_tag: projectData.project_tag || "",
          virtual_tour_url: projectData.virtual_tour_url || "",
          map_url: projectData.map_url || "",
          image: projectData.image_url || "",

          Address: {
            address_line_1: projectData.location?.address || "",
            address_line_2: projectData.location?.address_line_two || "",
            city: projectData.location?.city || "",
            state: projectData.location?.state || "",
            pin_code: projectData.location?.pin_code || "",
            country: projectData.location?.country || "",
          },
          brochure: projectData.brochure || null,
          two_d_images: projectData.two_d_images || [],
          videos: projectData.videos || [],
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
  console.log("this is the form data", formData);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      if (name === "brochure") {
        setFormData((prev) => ({
          ...prev,
          brochure: files[0],
        }));
      } else if (name === "two_d_images") {
        const newImages = Array.from(files);
        setFormData((prev) => ({
          ...prev,
          two_d_images: [...prev.two_d_images, ...newImages],
        }));
      } else if (name === "videos") {
        const newVideos = Array.from(files);
        setFormData((prev) => ({
          ...prev,
          videos: [...prev.videos, ...newVideos],
        }));
      }
    } else {
      if (
        [
          "address_line_1",
          "address_line_2",
          "city",
          "state",
          "pin_code",
          "country",
        ].includes(name)
      ) {
        setFormData((prev) => ({
          ...prev,
          Address: {
            ...prev.Address,
            [name]: value,
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];

    const validFiles = files.filter((file) => allowedTypes.includes(file.type));

    if (validFiles.length !== files.length) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = "";
      return;
    }

    // Generate preview for the first image
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        attachfile: validFiles, // Store actual file objects
        previewImage: reader.result, // Store preview URL
      }));
    };

    if (validFiles.length > 0) {
      reader.readAsDataURL(validFiles[0]); // Read first image as preview
    }
  };

  const handleDiscardFile = (type, index) => {
    if (type === "brochure") {
      setFormData((prev) => ({
        ...prev,
        brochure: null,
      }));
    } else if (type === "two_d_images") {
      setFormData((prev) => ({
        ...prev,
        two_d_images: prev.two_d_images.filter((_, i) => i !== index),
      }));
    } else if (type === "videos") {
      setFormData((prev) => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index),
      }));
    }
  };

  const validateForm = (formData) => {
    const errors = [];

    if (!formData.Property_Type) {
      errors.push("Project Type is required.");
      return errors;
    }
    if (!formData.Building_Type) {
      errors.push("Building Type is required.");
      return errors;
    }
    if (!formData.Project_Construction_Status) {
      errors.push("Construction Status is required.");
      return errors;
    }
    if (!formData.Configuration_Type.length) {
      errors.push("Configuration Type is required.");
      return errors;
    }
    if (!formData.project_name) {
      errors.push("Project Name is required.");
      return errors;
    }
    if (!formData.project_address) {
      errors.push("Location is required.");
      return errors;
    }
    if (!formData.project_description) {
      errors.push("Project Description is required.");
      return errors;
    }
    if (!formData.price) {
      errors.push("Price Onward is required.");
      return errors;
    }
    if (!formData.project_size_sq_mtr) {
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
    if (!formData.no_of_apartments) {
      errors.push("Number of Units is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Rera_Number) {
      errors.push("RERA Number is required.");
      return errors; // Return the first error immediately
    }
    // if (!formData.project_amenities.length) {
    //   errors.push("Amenities are required.");
    //   return errors; // Return the first error immediately
    // }
    if (!formData.Specifications.length) {
      errors.push("Specifications are required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Land_Area) {
      errors.push("Land Area is required.");
      return errors; // Return the first error immediately
    }

    // Address validation (nested fields)
    if (!formData.Address || !formData.Address.address_line_1) {
      errors.push("Address Line 1 is required.");
      return errors; // Return the first error immediately
    }
    // Address validation (nested fields)
    if (!formData.Address || !formData.Address.address_line_2) {
      errors.push("Address Line 2 is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Address || !formData.Address.city) {
      errors.push("City is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Address || !formData.Address.state) {
      errors.push("State is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Address || !formData.Address.pin_code) {
      errors.push("Pin Code is required.");
      return errors; // Return the first error immediately
    }
    if (!formData.Address || !formData.Address.country) {
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
    setLoading(true);
    const validationErrors = validateForm(formData);

    if (validationErrors.length > 0) {
      toast.error(validationErrors[0]);
      setLoading(false);
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "Address" && typeof value === "object") {
        Object.entries(value).forEach(([addressKey, addressValue]) => {
          data.append(`project[Address][${addressKey}]`, addressValue);
        });
      } else if (key === "brochure" && value instanceof File) {
        data.append("project[brochure]", value);
      } else if (key === "two_d_images" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            data.append("project[two_d_images][]", file);
          }
        });
      } else if (key === "videos" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            data.append("project[videos][]", file);
          }
        });
      } else if (Array.isArray(value)) {
        // Fix: Take only the first value if it's an array to prevent duplicates
        data.append(`project[${key}]`, value[0]);
      } else {
        data.append(`project[${key}]`, value);
      }
    });

    console.log("this is the passsing data", data);

    try {
      const response = await axios.put(
        `${API_BASE_URL}/projects/${id}.json`,
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Project Updated successfully");
      console.log(response.data);
      navigate("/project-list");
    } catch (error) {
      toast.error("Failed to submit the form. Please try again.");
      console.error("Error submitting the form:", error);
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = {
    "Office Parks": [
      { value: "Completed", label: "Completed" },
      { value: "Under-Construction", label: "Under Construction" },
    ],
    Residential: [
      { value: "Completed", label: "Completed" },
      { value: "Ready-To-Move-in", label: "Ready To Move in" },
    ],
  };

  // Render loading or error states
  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <>
      {/* <Header /> */}

      <div className="module-data-section p-3">
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Project Update</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Project Types
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <SelectBox
                    options={[
                      //{ value: "", label: "Select status", isDisabled: true },
                      { value: "Office Parks", label: "Office Parks" },
                      { value: "Residential", label: "Residential" },
                    ]}
                    defaultValue={formData.Property_Type}
                    onChange={(selectedValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        Property_Type: selectedValue,
                      }))
                    }
                    //isDisableFirstOption={true}
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Project Bulding Type
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <SelectBox
                    options={[
                      { value: "All Properties", label: "All Properties" },
                      {
                        value: "Mixed-Use-Development",
                        label: "Mixed Use Development",
                      },
                      {
                        value: "Special-Economic-Zone",
                        label: "Special Economic Zone",
                      },
                      { value: "Tech-Park", label: "Tech Park" },
                      { value: "Built-to-Suit", label: "Built to Suit" },
                      {
                        value: "Upcoming-Developments",
                        label: "Upcoming Developments",
                      },
                    ]}
                    defaultValue={formData.Building_Type}
                    onChange={(selectedOption) =>
                      setFormData((prev) => ({
                        ...prev,
                        Building_Type: selectedOption,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Project Construction Status
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <SelectBox
                    options={statusOptions[formData.Property_Type] || []}
                    defaultValue={formData.Project_Construction_Status}
                    onChange={(selectedValue) =>
                      setFormData((prev) => ({
                        ...prev,
                        Project_Construction_Status: selectedValue,
                      }))
                    }
                  />
                </div>
              </div>

              <div className="col-md-3">
                <div className="form-group">
                  <label>
                    Configuration Type
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <MultiSelectBox
                    options={configurations.map((config) => ({
                      value: config.name,
                      label: config.name,
                    }))}
                    value={formData.Configuration_Type.map((type) => ({
                      value: type,
                      label: type,
                    }))}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        Configuration_Type: selectedOptions.map(
                          (option) => option.value
                        ),
                      }))
                    }
                    placeholder="Select Type"
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Name
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="project_name"
                    value={formData.project_name}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Location
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Default input"
                    name="project_address"
                    value={formData.project_address}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-6 mt-2">
                <div className="form-group">
                  <label>
                    Project Description
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={1}
                    placeholder="Enter ..."
                    name="project_description"
                    value={formData.project_description}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Price Onward
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>

                  <input
                    className="form-control"
                    type="text"
                    placeholder="Default input"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Size (Sq. Mtr.)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="project_size_sq_mtr"
                    value={formData.project_size_sq_mtr}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Project Size (Sq. Ft.)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Project_Size_Sq_Ft"
                    value={formData.Project_Size_Sq_Ft}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Rera Carpet Area (Sq. M)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Rera_Carpet_Area_Sq_M"
                    value={formData.Rera_Carpet_Area_Sq_M}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Rare Carpet Area (Sq. Ft.)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Rera_Carpet_Area_sqft"
                    value={formData.Rera_Carpet_Area_sqft}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Number of Towers
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Number_Of_Towers"
                    value={formData.Number_Of_Towers}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Number of Units
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="no_of_apartments"
                    value={formData.no_of_apartments}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Rera Number
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Rera_Number"
                    value={formData.Rera_Number}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Amenities
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <MultiSelectBox
                    options={amenities.map((ammit) => ({
                      value: ammit.name,
                      label: ammit.name,
                    }))}
                    // value={formData?.Amenities
                    //   ?.map((id) => {
                    //     const ammit = amenities.find(
                    //       (ammit) => ammit.id === id
                    //     );
                    //     return ammit
                    //       ? { value: ammit.id, label: ammit.name }
                    //       : null;
                    //   })
                    //   .filter(Boolean)}

                    value={formData.Amenities.map((amenitie) => ({
                      value: amenitie,
                      label: amenitie,
                    }))}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        Amenities: selectedOptions.map(
                          (option) => option.value
                        ),
                      }))
                    }
                    placeholder="Select Amenities"
                  />
                  {console.log("amenities", amenities)}
                  {console.log("project_amenities", formData.project_amenities)}
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Specifications
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <MultiSelectBox
                    options={specifications.map((spec) => ({
                      value: spec.name,
                      label: spec.name,
                    }))}
                    // value={specifications
                    //   .filter((spec) =>
                    //     formData.Specifications.includes(spec.id)
                    //   )
                    //   .map((spec) => ({
                    //     value: spec.id,
                    //     label: spec.name,
                    //   }))}
                    value={formData.Specifications.map((spec) => ({
                      value: spec,
                      label: spec,
                    }))}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        Specifications: selectedOptions.map(
                          (option) => option.value
                        ),
                      }))
                    }
                    placeholder="Select Specifications"
                  />
                  {console.log("specifications", specifications)}
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Land Area (Acres)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    placeholder="Default input"
                    name="Land_Area"
                    value={formData.Land_Area}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>Project Tag</label>
                  <SelectBox
                    options={[
                      //{ value: "", label: "Select status", isDisabled: true },
                      { value: "Featured", label: "Featured" },
                      { value: "Upcoming", label: "Upcoming" },
                    ]}
                    defaultValue={formData.project_tag}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        project_tag: value,
                      }))
                    }
                    // isDisableFirstOption={true}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Virtual Tour URL
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="virtual_tour_url"
                    placeholder="Enter Location"
                    value={formData.virtual_tour_url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Map URL
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="map_url"
                    placeholder="Enter Location"
                    value={formData.map_url}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Attach Image
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                    <span />
                  </label>
                  <input
                    className="form-control"
                    type="file"
                    name="image"
                    accept="image/*"
                    multiple
                    required
                    onChange={(e) => handleFileChange(e, "image")}
                  />
                </div>

                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Uploaded Preview"
                    className="img-fluid rounded mt-2"
                    style={{
                      maxWidth: "100px",
                      maxHeight: "100px",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <span>No image selected</span>
                )}
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
                  <label>
                    Address Line 1{" "}
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>{" "}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Address Line 1"
                    name="address_line_1"
                    value={formData.Address.address_line_1}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Address Line 2
                    {/* <span style={{ color: "red", fontSize: "16px" }}>*</span>{" "} */}
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Address Line 2"
                    name="address_line_2"
                    value={formData.Address.address_line_2}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* City, State, Pin, Country Section */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    City
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="City"
                    name="city"
                    value={formData.Address.city}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    State
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="State"
                    name="state"
                    value={formData.Address.state}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Pin Code
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Pin Code"
                    name="pin_code"
                    value={formData.Address.pin_code}
                    maxLength={6} // Restricts input to 6 digits
                    onChange={(e) => {
                      const { name, value } = e.target;
                      // Allow only numbers and ensure max 6 digits
                      if (/^\d{0,6}$/.test(value)) {
                        setFormData((prevData) => ({
                          ...prevData,
                          Address: { ...prevData.Address, [name]: value },
                        }));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Country
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    placeholder="Country"
                    name="country"
                    value={formData.Address.country}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3">
            <h3 className="card-title">
              File Upload
              <span style={{ color: "#de7008", fontSize: "16px" }}> *</span>
            </h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Brochure Upload */}

              {/* File Upload Section */}
              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Brochure{" "}
                  <span style={{ color: "#de7008", fontSize: "16px" }}> *</span>
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  onClick={() => document.getElementById("brochure").click()}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={20}
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
                          <td>{formData.brochure?.name || ""}</td>

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
                  <span style={{ color: "#de7008", fontSize: "16px" }}> *</span>
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  onClick={() =>
                    document.getElementById("two_d_images").click()
                  }
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={26}
                    height={20}
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

              {/* Table to Display Images */}
              <div className="col-md-12 mt-2">
                <div
                  className="mt-4 tbl-container"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
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
                          <td>{file.document_file_name || file.name}</td>{" "}
                          {/* Show name from API or uploaded file */}
                          <td>
                            <img
                              style={{ maxWidth: 100, maxHeight: 100 }}
                              className="img-fluid rounded"
                              src={
                                file.document_url // API response images
                                  ? file.document_url
                                  : file.type && file.type.startsWith("image") // Avoid error if file.type is undefined
                                    ? URL.createObjectURL(file)
                                    : null
                              }
                              alt={
                                file.document_file_name || file.name || "Image"
                              }
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

              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Videos{" "}
                  <span style={{ color: "#de7008", fontSize: "16px" }}>*</span>
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() => document.getElementById("videos").click()}
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
                  id="videos"
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  name="videos"
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
                        <th>Videos</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Videos */}
                      {formData.videos.map((file, index) => (
                        <tr key={index}>
                          {/* Ensure filename is displayed correctly */}
                          <td>
                            {file.document_file_name || file.name || "No Name"}
                          </td>
                          <td>
                            <video
                              style={{ maxWidth: 100, maxHeight: 100 }}
                              className="img-fluid rounded"
                              src={
                                file.document_url // API response video
                                  ? file.document_url
                                  : file instanceof File // Uploaded video file
                                    ? URL.createObjectURL(file)
                                    : ""
                              }
                              autoPlay
                              muted
                            />
                          </td>
                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() => handleDiscardFile("videos", index)}
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
            <button
              onClick={handleSubmit}
              className="purple-btn2 w-100"
              disabled={loading}
            >
              Submit
            </button>
          </div>

          <div className="col-md-2">
            <button
              type="button"
              className="purple-btn2 w-100"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectDetailsEdit;
