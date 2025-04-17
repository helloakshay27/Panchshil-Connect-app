import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import "../mor.css";
import { baseURL } from "./baseurl/apiDomain";

const Testimonials = () => {
  const [companySetupOptions, setCompanySetupOptions] = useState([]);
  const [companySetupId, setCompanySetupId] = useState("");
  const [userName, setUserName] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [userProfile, setUserProfile] = useState(""); // State for user profile
  const [userType, setUserType] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [buildingTypeOptions, setBuildingTypeOptions] = useState([]);
  const [buildingTypeId, setBuildingTypeId] = useState("");
  const [buildingType, setBuildingType] = useState({ id: "", name: "" });
  const [showTooltip, setShowTooltip] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [errors, setErrors] = useState({});
  const [showVideoTooltip, setShowVideoTooltip] = useState(false);
  const [previewImg, setPreviewImg] = useState(null);
  const [previewFiles, setPreviewFiles] = useState([]);

  const [formData, setFormData] = useState({
    testimonial_video: null,
    attachfile: null,
    video_preview_image_url: "",
  });

  const handleBannerVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const maxSize = 100 * 1024 * 1024; // 100MB
  
      if (file.size > maxSize) {
        setErrors((prev) => ({
          ...prev,
          testimonial_video: "Max file size is 100 MB",
        }));
        toast.error("Video exceeds 100MB limit. Please upload a smaller file.");
        return;
      }

      setErrors((prev) => ({ ...prev, testimonial_video: "" }));
      setPreviewVideo(URL.createObjectURL(file));

      // Store file in state
      setFormData((prev) => ({
        ...prev,
        testimonial_video: file,
      }));
    }
  };

  useEffect(() => {
    const fetchCompanySetups = async () => {
      try {
        const response = await axios.get(`${baseURL}company_setups.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        console.log("Raw API Response:", response.data);

        if (response.data && Array.isArray(response.data.company_setups)) {
          setCompanySetupOptions(response.data.company_setups);
        } else {
          console.warn("Unexpected API response format:", response.data);
          setCompanySetupOptions([]);
        }
      } catch (error) {
        console.error("Error fetching company setup data:", error);

        if (error.response) {
          console.error("API Response Error:", error.response.data);
        }
        setCompanySetupOptions([]);
      }
    };

    fetchCompanySetups();
  }, []);

  useEffect(() => {
    const fetchBuildingTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}building_types.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        if (response.data && Array.isArray(response.data)) {
          setBuildingTypeOptions(response.data);
        }
      } catch (error) {
        console.error("Error fetching building type data:", error);
      }
    };

    fetchBuildingTypes();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    
    if (files.length === 0) return;
    
    const file = files[0]; // Get the first file
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Only image files (JPG, PNG, GIF, WebP) are allowed.");
      e.target.value = "";
      return;
    }
    
    // Size validation (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrors((prev) => ({
        ...prev,
        attachfile: "Max file size is 50 MB",
      }));
      toast.error("Image exceeds 50MB limit. Please upload a smaller file.");
      return;
    }
    
    // Create image preview
    const previewUrl = URL.createObjectURL(file);
    setPreviewImg(previewUrl);
    
    // Update formData with the image file and also set the URL for backend
    setFormData(prev => ({
      ...prev,
      attachfile: file,
      video_preview_image_url: previewUrl // This is needed for the backend
    }));
    
    // Also update the videoUrl state which is used in form submit
    setVideoUrl(previewUrl);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();
  
    const form = new FormData();
    form.append("testimonial[user_name]", userName.trim());
    form.append("testimonial[content]", content.trim());
    
    // Use the previewImg URL for video_preview_image_url if available
    if (previewImg) {
      form.append("testimonial[video_preview_image_url]", previewImg);
    } else {
      form.append("testimonial[video_preview_image_url]", videoUrl.trim());
    }
    
    form.append("testimonial[building_id]", buildingTypeId?.toString() || "");
    form.append(
      "testimonial[building_type]",
      buildingTypeOptions.find((option) => option.id === buildingTypeId)?.building_type || ""
    );
    
    if (formData.testimonial_video) {
      form.append("testimonial[testimonial_video]", formData.testimonial_video);
    }
    
    // Append the preview image file if it exists
    if (formData.attachfile) {
      form.append("testimonial[preview_image]", formData.attachfile);
    }
  
    try {
      const response = await axios.post(`${baseURL}testimonials.json`, form, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
  
      toast.success("Data saved successfully!");
  
      // Reset form
      setUserName("");
      setVideoUrl("");
      setImagePreview("");
      setUserProfile("");
      setUserType("");
      setContent("");
      setPreviewVideo(null);
      setPreviewImg(null);
      setFormData({ 
        testimonial_video: null,
        attachfile: null,
        video_preview_image_url: ""
      });
      navigate("/testimonial-list");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Failed to submit. Please check your input.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <form onSubmit={handleSubmit}>
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Create Testimonials</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* User Name */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Name
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="userName"
                          placeholder="Enter user name"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Building Type */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Building Type
                        </label>
                        <SelectBox
                          options={buildingTypeOptions.map((option) => ({
                            label: option.building_type, // Display Name
                            value: option.id, // ID
                          }))}
                          value={buildingTypeId}
                          onChange={(value) => setBuildingTypeId(value)}
                        />
                      </div>
                    </div>
                   
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Description
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="content"
                          placeholder="Enter Description"
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                        />
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Testimonial Video{" "}
                          <span
                            className="tooltip-container"
                            onMouseEnter={() => setShowVideoTooltip(true)}
                            onMouseLeave={() => setShowVideoTooltip(false)}
                          >
                            [i]
                            {showVideoTooltip && (
                              <span className="tooltip-text">
                                Max Upload Size 100 MB
                              </span>
                            )}
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="testimonial_video"
                          accept="video/*"
                          onChange={handleBannerVideoChange}
                        />
                        {errors.testimonial_video && (
                          <span className="error text-danger">
                            {errors.testimonial_video}
                          </span>
                        )}
                        
                        {previewVideo && (
                          <video
                            src={previewVideo}
                            controls
                            className="img-fluid rounded mt-2"
                            style={{
                              maxWidth: "200px",
                              maxHeight: "150px",
                              objectFit: "cover",
                            }}
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Preview Image{" "}
                          <span
                            className="tooltip-container"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            [i]
                            {showTooltip && (
                              <span className="tooltip-text">
                                Max Upload Size 50 MB
                              </span>
                            )}
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          name="video_preview_image_url"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                        {errors.video_preview_image_url && (
                          <span className="error text-danger">
                            {errors.video_preview_image_url}
                          </span>
                        )}
                        
                        {previewImg && (
                          <div className="mt-2">
                            <img
                              src={previewImg}
                              className="img-fluid rounded"
                              alt="Preview"
                              style={{
                                maxWidth: "100px",
                                maxHeight: "100px",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit and Cancel Buttons */}
              <div className="row mt-2 justify-content-center">
                <div className="col-md-2">
                  <button
                    type="submit"
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
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Testimonials;