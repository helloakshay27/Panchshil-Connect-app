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
  const [userProfile, setUserProfile] = useState(""); // State for user profile
  const [userType, setUserType] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [buildingTypeOptions, setBuildingTypeOptions] = useState([]);
  const [buildingTypeId, setBuildingTypeId] = useState("");
  const [buildingType, setBuildingType] = useState({ id: "", name: "" });
  const [videoFile, setVideoFile] = useState(null);
  const [previewVideo, setPreviewVideo] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const [errors, setErrors] = useState({});

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

    // Dismiss previous toast notifications before showing new ones
    toast.dismiss();

    if (!userName.trim() || !userProfile.trim() || !content.trim()) {
      toast.error("All fields are required.");
      setLoading(false);
      return;
    }

    const data = {
      testimonial: {
        // company_setup_id: companySetupId,
        building_id: buildingTypeId ? buildingTypeId.toString() : null,
        building_type:
          buildingTypeOptions.find((option) => option.id === buildingTypeId)
            ?.building_type || null,
        user_name: userName.trim(),
        video_url: videoUrl.trim(),
        profile_of_user: userProfile.trim(),
        content: content.trim(),
      },
    };
    console.log("Submitting data:", data);

    try {
      const response = await axios.post(`${baseURL}testimonials.json`, data, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      console.log("Response from POST:", response.data);

      toast.success("Data saved successfully!");

      // Reset form fields

      setUserName("");
      setVideoUrl("");
      setUserProfile(""); // Reset User Profile
      setUserType("");
      setContent("");

      navigate("/testimonial-list");
    } catch (error) {
      console.error("Error submitting testimonial:", error);
      if (error.response) {
        console.error("Response data:", error.response.data);
      }

      toast.error("Failed to submit. Please check your input.");
    } finally {
      setLoading(false);
    }
  };
  const handleVideoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      // Validate file size (e.g., max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          testimonialVideo: "File size must be under 50MB",
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
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
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
                    <div className="col-md-3">
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
                    </div>

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
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
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
                          name="video_url" // 👈 backend parameter name
                          placeholder="Enter video URL"
                          value={videoUrl}
                          onChange={(e) => setVideoUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Content (Description) */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Description
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            {" "}
                            *
                          </span>
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
