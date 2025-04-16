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



  const [formData, setFormData] = useState({
    testimonial_video: [],
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

      // ✅ Store file in state
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
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();
  
    const form = new FormData();
    form.append("testimonial[user_name]", userName.trim());
    form.append("testimonial[content]", content.trim());
    form.append("testimonial[video_preview_image_url]", videoUrl.trim()); // 👈 Only this matters
    form.append("testimonial[building_id]", buildingTypeId?.toString() || "");
    form.append(
      "testimonial[building_type]",
      buildingTypeOptions.find((option) => option.id === buildingTypeId)?.building_type || ""
    );
    if (formData.testimonial_video) {
      form.append("testimonial[testimonial_video]", formData.testimonial_video);
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
      setFormData({ testimonial_video: null });
      navigate("/testimonial-list");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      toast.error("Failed to submit. Please check your input.");
    } finally {
      setLoading(false);
    }
  };
  
  

 
  //   e.preventDefault();
  //   setLoading(true);
  //   toast.dismiss();

  //   // if (!userName.trim() || !userProfile.trim() || !content.trim()) {
  //   //   toast.error("All fields are required.");
  //   //   setLoading(false);
  //   //   return;
  //   // }

  //   const form = new FormData();
  //   form.append("testimonial[user_name]", userName.trim());
  //   // form.append("testimonial[profile_of_user]", userProfile.trim());
  //   form.append("testimonial[content]", content.trim());
  //   form.append("testimonial[video_url]", videoUrl.trim());
  //   form.append("testimonial[video_preview_image_url]", videoUrl.trim()); 

  //   form.append("testimonial[building_id]", buildingTypeId?.toString() || "");
  //   form.append(
  //     "testimonial[building_type]",
  //     buildingTypeOptions.find((option) => option.id === buildingTypeId)
  //       ?.building_type || ""
  //   );
   

  //   try {
  //     const response = await axios.post(`${baseURL}testimonials.json`, form, {
  //       headers: {
  //         Authorization: `Bearer ${localStorage.getItem("access_token")}`,
  //         "Content-Type": "multipart/form-data",
  //       },
  //     });

  //     toast.success("Data saved successfully!");
  //     // Reset form
  //     setUserName("");
  //     setVideoUrl("");
  //     setImagePreview("");
  //     setUserProfile("");
  //     setUserType("");
  //     setContent("");
  //     setPreviewVideo(null);
     

  //     navigate("/testimonial-list");
  //   } catch (error) {
  //     console.error("Error submitting testimonial:", error);
  //     toast.error("Failed to submit. Please check your input.");
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      if (file.size > 100 * 1024 * 1024) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          testimonialVideo: "File size must be under 100MB",
        }));
        return;
      }

      // Clear errors if valid
      setErrors((prevErrors) => ({
        ...prevErrors,
        testimonialVideo: "",
      }));

      setVideoFile(file);
      setPreviewVideo(URL.createObjectURL(file)); // Create a preview URL
    }
  };

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log("Video file selected:", file);
      // You can now upload it to backend or update state:
      // setFormData(prev => ({ ...prev, video: file }));
    }
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
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
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

                    {/* User Profile */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Profile
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="userProfile"
                          placeholder="Enter user profile"
                          value={userProfile}
                          onChange={(e) => setUserProfile(e.target.value)}
                        />
                      </div>
                    </div> */}

                    {/* User Type */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          User Type
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <SelectBox
                          options={[
                            { label: "User", value: "User" },
                            { label: "Admin", value: "Admin" },
                            { label: "Resident", value: "Resident" },
                          ]}
                          defaultValue={userType}
                          onChange={(value) => setUserType(value)}
                        />
                      </div>
                    </div> */}

                    {/* Building Type */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Building Type
                          {/* <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span> */}
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
                    {/* User Testimonial Video Upload */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Testimonial Video URL
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          name="video_preview_image_url" // 👈 backend parameter name
                          placeholder="Enter video URL"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
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

                          
                          {previewVideo &&  (
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
