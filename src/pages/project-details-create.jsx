import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Select from "react-select";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import SelectBox from "../components/base/SelectBox";
import MultiSelectBox from "../components/base/MultiSelectBox";

const ProjectDetailsCreate = () => {
  const [formData, setFormData] = useState({
    Property_Type: [],
    building_type: "",
    SFDC_Project_Id: "",
    Project_Construction_Status: "",
    Configuration_Type: [],
    Project_Name: "",
    project_address: "",
    Project_Description: "",
    Price_Onward: "",
    Project_Size_Sq_Mtr: "",
    Project_Size_Sq_Ft: "",
    development_area_sqft: "",
    development_area_sqmt: "",
    Rera_Carpet_Area_Sq_M: "",
    Rera_Carpet_Area_sqft: "",
    Number_Of_Towers: "",
    Number_Of_Units: "",
    no_of_floors: "",
    rera_number_multiple: [],
    Amenities: [],
    Specifications: [],
    Land_Area: "",
    land_uom: "",
    project_tag: "",
    virtual_tour_url_multiple: [],
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
    brochures: [],
    two_d_images: [],
    videos: [],
    gallery_images: [],
  });

  useEffect(() => {
    console.log("formData updated:", formData);
  }, [formData]);

  console.log("formD", formData);

  const [projectsType, setprojectsType] = useState([]);
  const [configurations, setConfigurations] = useState([]);
  const [specifications, setSpecifications] = useState([]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [virtualTourUrl, setVirtualTourUrl] = useState("");
  const [virtualTourName, setVirtualTourName] = useState("");
  const [towerName, setTowerName] = useState("");
  const [reraNumber, setReraNumber] = useState("");
  const [selectedType, setSelectedType] = useState(null);
  const [filteredAmenities, setFilteredAmenities] = useState([]);
  const errorToastRef = useRef(null);
  const Navigate = useNavigate();

  const [reraList, setReraList] = useState([{ tower: "", reraNumber: "" }]);

  const MAX_VIDEO_SIZE = 100 * 1024 * 1024; // 100MB
  const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB
  const MAX_BROCHURE_SIZE = 20 * 1024 * 1024; // 20MB

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    else if (bytes < 1024 * 1024 * 1024)
      return (bytes / (1024 * 1024)).toFixed(2) + " MB";
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + " GB";
  };

  // Function to check file size
  const isFileSizeValid = (file, maxSize) => {
    if (file.size > maxSize) {
      return {
        valid: false,
        name: file.name,
        size: formatFileSize(file.size),
      };
    }
    return { valid: true };
  };

  const handleFileChange = (e, fieldName) => {
    if (fieldName === "image") {
      const files = Array.from(e.target.files);
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "image/webp",
      ];

      const validTypeFiles = files.filter((file) =>
        allowedTypes.includes(file.type)
      );

      if (validTypeFiles.length !== files.length) {
        toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
        e.target.value = "";
        return;
      }

      // Check file size
      const file = validTypeFiles[0];
      const sizeCheck = isFileSizeValid(file, MAX_IMAGE_SIZE);

      if (!sizeCheck.valid) {
        toast.error(
          `Image file too large: ${sizeCheck.name} (${
            sizeCheck.size
          }). Maximum allowed size is ${formatFileSize(MAX_IMAGE_SIZE)}.`
        );
        e.target.value = ""; // Reset input
        return;
      }

      setFormData((prevFormData) => ({
        ...prevFormData,
        image: file,
      }));
    }
  };

  const amenityTypes = [
    ...new Set(amenities.map((ammit) => ammit.amenity_type)),
  ].map((type) => ({ value: type, label: type }));

  // Filter amenities based on selected type
  useEffect(() => {
    if (selectedType) {
      setFilteredAmenities(
        amenities.filter((ammit) => ammit.amenity_type === selectedType.value)
      );
    } else {
      setFilteredAmenities([]);
    }
  }, [selectedType, amenities]);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      handleFileUpload(name, files);
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
      } else if (name === "virtual_tour_url_multiple") {
        setVirtualTour(value); // Update temporary input state
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  };

  // Generalized File Upload Handler
  // Modify the handleFileUpload function to handle gallery_images
  const handleFileUpload = (name, files) => {
    const MAX_SIZES = {
      brochures: MAX_BROCHURE_SIZE,
      two_d_images: MAX_IMAGE_SIZE,
      videos: MAX_VIDEO_SIZE,
      image: MAX_IMAGE_SIZE,
      gallery_images: MAX_IMAGE_SIZE,
    };

    const allowedTypes = {
      image: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      two_d_images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      gallery_images: ["image/jpeg", "image/png", "image/gif", "image/webp"],
      videos: ["video/mp4", "video/webm", "video/quicktime", "video/x-msvideo"],
      brochures: [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ],
    };

    if (!files || !files.length) return;

    if (name === "brochures") {
      // Handle multiple brochure files
      const newFiles = Array.from(files);
      const validFiles = [];

      newFiles.forEach((file) => {
        if (!allowedTypes.brochures.includes(file.type)) {
          toast.error("Only PDF and DOCX files are allowed for brochures.");
          return;
        }

        if (!validateFile(file, MAX_SIZES[name])) return;
        validFiles.push(file);
      });

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          brochures: [...prev.brochures, ...validFiles],
        }));
      }
    } else if (
      name === "two_d_images" ||
      name === "videos" ||
      name === "gallery_images"
    ) {
      // Handle multiple files for images, videos, gallery
      const newFiles = Array.from(files);
      const validFiles = [];
      const tooLargeFiles = [];

      newFiles.forEach((file) => {
        // Check file type if there are allowed types specified
        if (allowedTypes[name] && !allowedTypes[name].includes(file.type)) {
          const fileType = name === "videos" ? "video" : "image";
          toast.error(
            `Only supported ${fileType} formats are allowed for ${name.replace(
              "_",
              " "
            )}.`
          );
          return;
        }

        const sizeCheck = isFileSizeValid(file, MAX_SIZES[name]);
        if (!sizeCheck.valid) {
          tooLargeFiles.push(sizeCheck);
          return;
        }

        validFiles.push(file);
      });

      if (tooLargeFiles.length > 0) {
        tooLargeFiles.forEach((file) => {
          toast.error(
            `File too large: ${file.name} (${
              file.size
            }). Max size: ${formatFileSize(MAX_SIZES[name])}`
          );
        });
      }

      if (validFiles.length > 0) {
        setFormData((prev) => ({
          ...prev,
          [name]: [...(prev[name] || []), ...validFiles],
        }));
      }
    } else if (name === "image") {
      // Handle single image
      const file = files[0];
      if (!allowedTypes.image.includes(file.type)) {
        toast.error("Only JPG, PNG, GIF, and WebP images are allowed.");
        return;
      }

      const sizeCheck = isFileSizeValid(file, MAX_SIZES.image);
      if (!sizeCheck.valid) {
        toast.error(
          `File too large: ${sizeCheck.name} (${
            sizeCheck.size
          }). Max size: ${formatFileSize(MAX_SIZES.image)}`
        );
        return;
      }

      setFormData((prev) => ({ ...prev, image: file }));
    }
  };
  // Add this to your file:
  // File Validation
  const validateFile = (file, maxSize, tooLargeFiles = null) => {
    const sizeCheck = isFileSizeValid(file, maxSize);
    if (!sizeCheck.valid) {
      if (tooLargeFiles) {
        tooLargeFiles.push(sizeCheck);
      } else {
        toast.error(
          `File too large: ${sizeCheck.name} (${
            sizeCheck.size
          }). Max size: ${formatFileSize(maxSize)}`
        );
      }
      return false;
    }
    return true;
  };

  // 3. Update handleDiscardFile to handle gallery_images
  const handleDiscardFile = (fileType, index) => {
    if (fileType === "brochures") {
      if (index !== undefined) {
        // Remove specific brochure by index
        const updatedBrochures = [...formData.brochures];
        updatedBrochures.splice(index, 1);
        setFormData({ ...formData, brochures: updatedBrochures });
      } else {
        // Clear all brochures if no index specified
        setFormData({ ...formData, brochures: [] });
      }
    } else if (fileType === "two_d_images") {
      const updatedFiles = [...formData.two_d_images];
      updatedFiles.splice(index, 1);
      setFormData({ ...formData, two_d_images: updatedFiles });
    } else if (fileType === "videos") {
      const updatedVideos = [...formData.videos];
      updatedVideos.splice(index, 1);
      setFormData({ ...formData, videos: updatedVideos });
    } else if (fileType === "gallery_images") {
      const updatedGallery = [...formData.gallery_images];
      updatedGallery.splice(index, 1);
      setFormData({ ...formData, gallery_images: updatedGallery });
    }
  };
  const validateForm = (formData) => {
    // Clear previous toasts
    toast.dismiss();

    if (!formData.Property_Type) {
      toast.error("Property Type is required.");
      return false;
    }
    if (!formData.building_type) {
      toast.error("Building Type is required.");
      return false;
    }
    if (!formData.Project_Construction_Status) {
      toast.error("Construction Status is required.");
      return false;
    }
    if (!formData.Configuration_Type.length) {
      toast.error("Configuration Type is required.");
      return false;
    }
    if (!formData.Project_Name) {
      toast.error("Project Name is required.");
      return false;
    }
    if (!formData.project_address) {
      toast.error("Location is required.");
      return false;
    }
    if (!formData.Project_Description) {
      toast.error("Project Description is required.");
      return false;
    }
    if (!formData.Price_Onward) {
      toast.error("Price Onward is required.");
      return false;
    }
    if (!formData.Project_Size_Sq_Mtr) {
      toast.error("Project Size (Sq. Mtr.) is required.");
      return false;
    }
    if (!formData.Project_Size_Sq_Ft) {
      toast.error("Project Size (Sq. Ft.) is required.");
      return false;
    }
    if (!formData.development_area_sqmt) {
      toast.error("Development Area (Sq. Mtr.) is required.");
      return false;
    }
    if (!formData.development_area_sqft) {
      toast.error("Development Area (Sq. Ft.) is required.");
      return false;
    }
    if (!formData.Rera_Carpet_Area_Sq_M) {
      toast.error("RERA Carpet Area (Sq. M) is required.");
      return false;
    }
    if (!formData.Rera_Carpet_Area_sqft) {
      toast.error("RERA Carpet Area (Sq. Ft.) is required.");
      return false;
    }
    if (!formData.Number_Of_Towers) {
      toast.error("Number of Towers is required.");
      return false;
    }
    if (!formData.no_of_floors) {
      toast.error("Number of Floors is required.");
      return false;
    }
    if (!formData.Number_Of_Units) {
      toast.error("Number of Units is required.");
      return false;
    }
    if (!formData.rera_number_multiple) {
      toast.error("RERA Number is required.");
      return false;
    }
    if (!formData.Amenities.length) {
      toast.error("Amenities are required.");
      return false;
    }
    if (!formData.Land_Area) {
      toast.error("Land Area is required.");
      return false;
    }
    if (!formData.land_uom) {
      toast.error("Land UOM is required.");
      return false;
    }
    if (!formData.Address || !formData.Address.address_line_1) {
      toast.error("Address Line 1 is required.");
      return false;
    }
    if (!formData.Address || !formData.Address.city) {
      toast.error("City is required.");
      return false;
    }
    if (!formData.Address || !formData.Address.state) {
      toast.error("State is required.");
      return false;
    }
    if (!formData.Address || !formData.Address.pin_code) {
      toast.error("Pin Code is required.");
      return false;
    }
    if (!formData.Address || !formData.Address.country) {
      toast.error("Country is required.");
      return false;
    }
    if (!formData.brochures) {
      toast.error("Brochure is required.");
      return false;
    }
    if (formData.two_d_images.length === 0) {
      toast.error("At least one 2D image is required.");
      return false;
    }
    if (formData.videos.length === 0) {
      toast.error("At least one video is required.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);

    const validationErrors = validateForm(formData);
    if (validationErrors.length > 0) {
      if (!errorToastRef.current) {
        errorToastRef.current = toast.error(validationErrors[0], {
          toastId: "errorToast",
        });
      }
      setTimeout(() => {
        errorToastRef.current = null;
      }, 3000);

      setLoading(false);
      setIsSubmitting(false);
      return;
    }

    const data = new FormData();

    Object.entries(formData).forEach(([key, value]) => {
      if (key === "Address") {
        for (const addressKey in value) {
          data.append(`project[Address][${addressKey}]`, value[addressKey]);
        }
      } else if (key === "brochures" && Array.isArray(value)) {
        value.forEach((file) => {
          if (file instanceof File) {
            data.append("project[brochures][]", file);
          }
        });
      } else if (key === "two_d_images" && Array.isArray(value)) {
        value.forEach((file) => data.append("project[two_d_images][]", file));
      } else if (key === "videos" && Array.isArray(value)) {
        value.forEach((file) => data.append("project[videos][]", file));
      } else if (key === "gallery_images" && Array.isArray(value)) {
        value.forEach((file) => data.append("project[gallery_images][]", file));
      } else if (key === "image" && value instanceof File) {
        data.append("project[image]", value);
      } else if (key === "virtual_tour_url_multiple" && Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item.virtual_tour_url && item.virtual_tour_name) {
            data.append(`project[virtual_tour_url_multiple][${index}][virtual_tour_url]`, item.virtual_tour_url);
            data.append(`project[virtual_tour_url_multiple][${index}][virtual_tour_name]`, item.virtual_tour_name);
          }
        });
      } else if (key === "rera_number_multiple" && Array.isArray(value)) {
        value.forEach((item, index) => {
          if (item.tower_name && item.rera_number) {
            data.append(`project[rera_number_multiple][${index}][tower_name]`, item.tower_name);
            data.append(`project[rera_number_multiple][${index}][rera_number]`, item.rera_number);
          }
        });
      } else {
        data.append(`project[${key}]`, value);
      }
    });
    

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/projects.json",
        data,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      console.log(response.data);
      toast.success("Project submitted successfully");
      Navigate("/project-list");
    } catch (error) {
      console.error("Error submitting the form:", error);
      toast.error("Failed to submit the form. Please try again.");
    } finally {
      setLoading(false);
      setIsSubmitting(false);
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
          //     Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          //     "Content-Type": "application/json",
          //    },
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
    const fetchConfigurations = async () => {
      const url =
        "https://panchshil-super.lockated.com/configuration_setups.json";

      try {
        const response = await axios.get(url);
        setConfigurations(response.data);
        console.log("configurations", response.data);
      } catch (error) {
        console.error("Error fetching configurations:", error);
      }
    };

    fetchConfigurations();
  }, []);

  useEffect(() => {
    const fetchSpecifications = async () => {
      const url =
        "https://panchshil-super.lockated.com/specification_setups.json";

      try {
        const response = await axios.get(url);
        if (response.data && response.data.specification_setups) {
          setSpecifications(response.data.specification_setups);
        }
      } catch (error) {
        console.error("Error fetching specifications:", error);
      }
    };

    fetchSpecifications();
  }, []);

  useEffect(() => {
    const fetchProjects = async () => {
      // const token = "RnPRz2AhXvnFIrbcRZKpJqA8aqMAP_JEraLesGnu43Q"; // Replace with your actual token
      const url = "https://panchshil-super.lockated.com/amenity_setups.json";

      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
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
      Property_Type: "",
      SFDC_Project_Id: "",
      Project_Construction_Status: "",
      Configuration_Type: [],
      Project_Name: "",
      project_address: "",
      Project_Description: "",
      Price_Onward: "",
      Project_Size_Sq_Mtr: "",
      Project_Size_Sq_Ft: "",
      development_area_sqft: "",
      development_area_sqmt: "",
      Rera_Carpet_Area_Sq_M: "",
      Rera_Carpet_Area_sqft: "",
      Number_Of_Towers: "",
      Number_Of_Units: "",
      no_of_floors: "",
      Rera_Number_multiple: [],
      Amenities: [],
      Specifications: [],
      Land_Area: "",
      land_uom: "",
      project_tag: "",
      virtual_tour_url_multiple: [],
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
      brochures: null,
      two_d_images: [],
      videos: [],
    });
    Navigate(-1);
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

  console.log("formData", formData);
  console.log("specification", specifications);

  const handleTowerChange = (e) => {
    setTowerName(e.target.value);
  };

  const handleReraNumberChange = (e) => {
    setReraNumber(e.target.value);
  };

  // Handle Adding a RERA Entry
  const handleAddRera = () => {
    if (!towerName.trim() || !reraNumber.trim()) {
      toast.error("Both Tower and RERA Number are required.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      rera_number_multiple: [
        ...prev.rera_number_multiple,
        {
          tower_name: towerName,
          rera_number: reraNumber,
        },
      ],
    }));

    // Clear input fields after adding
    setTowerName("");
    setReraNumber("");
  };

  // Handle Deleting a RERA Entry
  const handleDeleteRera = (index) => {
    setFormData((prev) => ({
      ...prev,
      rera_number_multiple: prev.rera_number_multiple.filter(
        (_, i) => i !== index
      ),
    }));
  };

  const handleVirtualTourChange = (e) => {
    setVirtualTourUrl(e.target.value);
  };

  const handleVirtualTourNameChange = (e) => {
    setVirtualTourName(e.target.value);
  };

  const handleAddVirtualTour = () => {
    if (!virtualTourUrl.trim() || !virtualTourName.trim()) {
      toast.error("Both URL and Name are required.");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      virtual_tour_url_multiple: [
        ...prev.virtual_tour_url_multiple,
        {
          virtual_tour_url: virtualTourUrl,
          virtual_tour_name: virtualTourName,
        },
      ],
    }));

    // Clear input fields after adding
    setVirtualTourUrl("");
    setVirtualTourName("");
  };

  const handleDeleteVirtualTour = (index) => {
    setFormData((prev) => ({
      ...prev,
      virtual_tour_url_multiple: prev.virtual_tour_url_multiple.filter(
        (_, i) => i !== index
      ),
    }));
  };

  return (
    <>
      {/* <Header /> */}
      <div className="module-data-section p-3">
        <div className="card mt-4 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Create Project</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Hero Image
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
              </div>
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Property Types
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <SelectBox
                    options={[
                      { value: "Office Parks", label: "Office Parks" },
                      { value: "Residential", label: "Residential" },
                    ]}
                    value={formData?.Property_Type || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        Property_Type: value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
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
                      { value: "Tech-Parks", label: "Tech Parks" },
                      { value: "Built-to-Suit", label: "Built to Suit" },
                      {
                        value: "Upcoming-Developments",
                        label: "Upcoming Developments",
                      },
                    ]}
                    value={formData?.building_type || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        building_type: value,
                      }))
                    }
                  />
                </div>
              </div>
              <div className="col-md-3 mt-2">
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
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        Project_Construction_Status: value,
                      }))
                    }
                    //isDisableFirstOption={true}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
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
                      value: config.id,
                      label: config.name,
                    }))}
                    value={formData.Configuration_Type.map((id) => {
                      const config = configurations.find(
                        (config) => config.id === id
                      );
                      return config
                        ? { value: config.id, label: config.name }
                        : null;
                    }).filter(Boolean)}
                    onChange={(selectedOptions) =>
                      setFormData((prev) => ({
                        ...prev,
                        Configuration_Type: selectedOptions.map(
                          (option) => option.value
                        ),
                      }))
                    }
                    placeholder="Select amenities"
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
                    name="Project_Name"
                    placeholder="Enter Project Name"
                    value={formData.Project_Name}
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
                    name="project_address"
                    placeholder="Enter Location"
                    value={formData.project_address}
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
                    //isDisableFirstOption={true}
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
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
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
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
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
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
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
                    Development Area (Sq. Mtr.)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="development_area_sqmt"
                    placeholder="Enter Area Sq. Mt."
                    value={formData.development_area_sqmt}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Development Area (Sq. Ft.)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="development_area_sqft"
                    placeholder="Enter Area in Sq. Ft."
                    value={formData.development_area_sqft}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    RERA Carpet Area (Sq. M)
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
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
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
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
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
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
                    Number of Floors
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="number"
                    name="no_of_floors"
                    placeholder="Enter Number of Floors"
                    value={formData.no_of_floors}
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
                    name="Number_Of_Units"
                    placeholder="Enter Number of Units"
                    value={formData.Number_Of_Units}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* <div className="col-md-3 mt-2">
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
                      value: spec.id,
                      label: spec.name,
                    }))}
                    value={formData.Specifications.map((specId) => {
                      const spec = specifications.find((s) => s.id === specId);
                      return spec ? { value: spec.id, label: spec.name } : null;
                    }).filter(Boolean)}
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
                </div>
              </div> */}

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
                    name="Land_Area"
                    placeholder="Enter Land Area"
                    value={formData.Land_Area}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Land UOM
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <SelectBox
                    options={[
                      { value: "Square Meter", label: "Square Meter" },
                      {
                        value: "Square Feet",
                        label: "Square Feet",
                      },
                      {
                        value: "Acre",
                        label: "Acre",
                      },
                      { value: "Hectare", label: "Hectare" },
                      { value: "Yard", label: "Yard" },
                      {
                        value: "Guntha",
                        label: "Guntha",
                      },
                      { value: "Bigha", label: "Bigha" },
                      { value: "Kanal", label: "Kanal" },
                      { value: "Marla", label: "Marla" },
                      { value: "Cent", label: "Cent" },
                      { value: "Ropani", label: "Ropani" },
                    ]}
                    value={formData?.land_uom || ""}
                    onChange={(value) =>
                      setFormData((prev) => ({
                        ...prev,
                        land_uom: value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Rera Number */}
        {/* RERA Number Section */}
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3 d-flex justify-content-between align-items-center">
            <h3 className="card-title">RERA Number</h3>
          </div>
          <div className="card-body mt-0 pb-0">
            {/* Input Fields */}
            <div className="row align-items-end">
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Tower{" "}
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="tower_name"
                    placeholder="Enter Tower Name"
                    value={towerName}
                    onChange={handleTowerChange}
                  />
                </div>
              </div>

              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    RERA Number{" "}
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="rera_number"
                    placeholder="Enter RERA Number"
                    value={reraNumber}
                    onChange={handleReraNumberChange}
                  />
                </div>
              </div>

              {/* Add Button */}
              <div className="col-md-2 mt-4">
                <button
                  className="purple-btn2 rounded-3"
                  onClick={handleAddRera}
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
                  <span> Add</span>
                </button>
              </div>
            </div>

            {/* RERA List Table */}
            {formData.rera_number_multiple.length > 0 && (
              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container w-100">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Tower Name</th>
                        <th>RERA Number</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.rera_number_multiple.map((item, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{item.tower_name}</td>
                          <td>{item.rera_number}</td>
                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() => handleDeleteRera(index)}
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
            )}
          </div>
        </div>

        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3">
            <h3 className="card-title">Amenities</h3>
          </div>
          <div className="card-body mt-0 pb-0">
          <div className="row">
      {/* Amenity Type Dropdown */}
      <div className="col-md-3 mt-2">
        <div className="form-group">
          <label>Amenity Type</label>
          <SelectBox
            options={amenityTypes}
            value={selectedType}
            onChange={setSelectedType}
            placeholder="Select Amenity Type"
          />
        </div>
      </div>

      {/* Multi-Select Amenities Dropdown */}
      <div className="col-md-3 mt-2">
        <div className="form-group">
          <label>
            Amenities
            <span style={{ color: "#de7008", fontSize: "16px" }}> *</span>
          </label>
          <MultiSelectBox
            options={filteredAmenities.map((ammit) => ({
              value: ammit.id,
              label: ammit.name,
            }))}
            value={formData.Amenities.map((id) => {
              const ammit = filteredAmenities.find((ammit) => ammit.id === id);
              return ammit ? { value: ammit.id, label: ammit.name } : null;
            }).filter(Boolean)}
            onChange={(selectedOptions) =>
              setFormData((prev) => ({
                ...prev,
                Amenities: selectedOptions.map((option) => option.value),
              }))
            }
            placeholder="Select amenities"
          />
        </div>
      </div>
    </div>
          </div>
        </div>
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">Address</h3>
          </div>
          <div className="card-body">
            <div className="row">
              {/* Address Section */}
              <div className="col-md-3 mt-2">
                <div className="form-group">
                  <label>
                    Address Line 1
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
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
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      *
                    </span>{" "}
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
                    maxLength={6} // Prevents typing more than 6 digits
                    onChange={(e) => {
                      const { name, value } = e.target;
                      // Allow only numbers (0-9) and ensure max 6 digits
                      if (/^\d{0,6}$/.test(value)) {
                        setFormData((prevData) => ({
                          ...prevData,
                          Address: { ...prevData.Address, [name]: value },
                        }));
                      }
                    }}
                    onBlur={(e) => {
                      const { name, value } = e.target;
                      if (value.length !== 6) {
                        toast.error("Pin Code must be exactly 6 digits");
                        setFormData((prevData) => ({
                          ...prevData,
                          Address: { ...prevData.Address, [name]: "" }, // Reset field on incorrect input
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
        {/* file Upload */}
        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">File Upload</h3>
          </div>

          <div className="card-body">
            <div className="row">
              {/* Brochure Upload */}
              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Brochure{" "}
                  <span style={{ color: "#de7008", fontSize: "16px" }}> *</span>
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() => document.getElementById("brochures").click()}
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
                  id="brochures"
                  className="form-control"
                  type="file"
                  name="brochures"
                  accept=".pdf,.docx"
                  onChange={(e) =>
                    handleFileUpload("brochures", e.target.files)
                  }
                  multiple // Add this to allow multiple file selection
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
                      {formData.brochures.length > 0 ? (
                        formData.brochures.map((brochure, index) => (
                          <tr key={`brochure-${index}`}>
                            <td>{brochure.name}</td>
                            <td>
                              <button
                                type="button"
                                className="purple-btn2"
                                onClick={() =>
                                  handleDiscardFile("brochures", index)
                                }
                              >
                                x
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          {/* <td colSpan="2" className="text-center">No brochures uploaded</td> */}
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
                  <span style={{ color: "#de7008", fontSize: "16px" }}>*</span>
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
                  className="form-control"
                  type="file"
                  name="two_d_images"
                  accept="image/*"
                  onChange={(e) =>
                    handleFileUpload("two_d_images", e.target.files)
                  }
                  multiple
                  style={{ display: "none" }}
                />
              </div>

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

              {/* gallery */}
              <div className="d-flex justify-content-between align-items-end mx-1">
                <h5 className="mt-3">
                  Gallery Images{" "}
                  <span style={{ color: "#de7008", fontSize: "16px" }}>*</span>
                </h5>

                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() =>
                    document.getElementById("gallery_images").click()
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
                  id="gallery_images"
                  type="file"
                  accept="image/*"
                  name="gallery_images"
                  onChange={handleChange}
                  multiple
                  style={{ display: "none" }}
                />
              </div>

              <div className="col-md-12 mt-2">
                <div
                  className="mt-4 tbl-container"
                  style={{ maxHeight: "300px", overflowY: "auto" }}
                >
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Gallery Name</th>
                        <th>Image</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Gallery Images */}
                      {formData.gallery_images.map((file, index) => (
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
                                handleDiscardFile("gallery_images", index)
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
                  className="form-control"
                  type="file"
                  name="videos"
                  accept="video/*"
                  onChange={(e) => handleFileUpload("videos", e.target.files)}
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
                        <th>Preview</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.videos.map((file, index) => (
                        <tr key={index}>
                          <td>{file.name}</td>
                          <td>
                            <video
                              style={{ maxWidth: 100, maxHeight: 100 }}
                              className="img-fluid rounded"
                              autoPlay
                              muted
                              src={URL.createObjectURL(file)}
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

        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header3 d-flex justify-content-between align-items-center">
            <h3 className="card-title">Virtual Tour</h3>
          </div>
          <div className="card-body">
            <div className="row align-items-end">
              {/* Virtual Tour Name */}
              <div className="col-md-4 mt-2">
                <div className="form-group">
                  <label>
                    Virtual Tour Name{" "}
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="text"
                    name="virtual_tour_name"
                    placeholder="Enter Virtual Tour Name"
                    value={virtualTourName}
                    onChange={handleVirtualTourNameChange}
                  />
                </div>
              </div>

              {/* Virtual Tour URL */}
              <div className="col-md-4 mt-2">
                <div className="form-group">
                  <label>
                    Virtual Tour URL{" "}
                    <span style={{ color: "#de7008", fontSize: "16px" }}>
                      {" "}
                      *
                    </span>
                  </label>
                  <input
                    className="form-control"
                    type="url"
                    name="virtual_tour_url"
                    placeholder="Enter Virtual Tour URL"
                    value={virtualTourUrl}
                    onChange={handleVirtualTourChange}
                  />
                </div>
              </div>

              {/* Add Button */}
              <div className="col-md-2 mt-4">
                <button
                  className="purple-btn2 rounded-3"
                  onClick={handleAddVirtualTour}
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
                  <span> Add</span>
                </button>
              </div>
            </div>

            {/* Virtual Tour List Table */}
            {formData.virtual_tour_url_multiple.length > 0 && (
              <div className="col-md-12 mt-2">
                <div className="mt-4 tbl-container w-100">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Tour Name</th>
                        <th>Tour URL</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.virtual_tour_url_multiple.map((tour, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{tour.virtual_tour_name}</td>
                          <td>{tour.virtual_tour_url}</td>
                          <td>
                            <button
                              type="button"
                              className="purple-btn2"
                              onClick={() => handleDeleteVirtualTour(index)}
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
            )}
          </div>
        </div>

        <div className="card-body mt-0 pb-0"></div>
        <div className="row mt-2 justify-content-center">
          <div className="col-md-2">
            <button
              onClick={handleSubmit}
              className="purple-btn2 w-100"
              //disabled={loading}
            >
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
    </>
  );
};

export default ProjectDetailsCreate;
