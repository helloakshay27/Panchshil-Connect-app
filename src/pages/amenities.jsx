import React, { useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";

const Amenities = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [darkModeIcon, setDarkModeIcon] = useState(null); // ✅ Added dark mode icon state
  const [previewDarkModeImage, setPreviewDarkModeImage] = useState(null); // ✅ Added dark mode preview state
  const [loading, setLoading] = useState(false);
  const [amenityType, setAmenityType] = useState(""); // ✅ Correct State Name
  const [showTooltip, setShowTooltip] = useState(false);
  const [showDarkModeTooltip, setShowDarkModeTooltip] = useState(false); // ✅ Added dark mode tooltip state
  const [nightMode, setNightMode] = useState(false); // ✅ Added night mode state

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setIcon(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  // ✅ Added dark mode icon file change handler
  const handleDarkModeFileChange = (e) => {
    const file = e.target.files[0];
    setDarkModeIcon(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewDarkModeImage(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setPreviewDarkModeImage(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateForm()) {
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("amenity_setup[name]", name);
    formData.append("amenity_setup[amenity_type]", amenityType);
    formData.append("amenity_setup[night_mode]", nightMode); // ✅ Added night mode to form data
    if (icon) {
      formData.append("icon", icon);
    }
    // ✅ Added dark mode icon to form data
    if (darkModeIcon) {
      formData.append("dark_mode_icon", darkModeIcon);
    }

    try {
      await axios.post(`${baseURL}amenity_setups.json`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Accept: "application/json",
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      toast.success("Amenity added successfully");
      setName("");
      setAmenityType("");
      setIcon(null);
      setPreviewImage(null);
      setDarkModeIcon(null); // ✅ Reset dark mode icon state
      setPreviewDarkModeImage(null); // ✅ Reset dark mode preview state
      setNightMode(false); // ✅ Reset night mode state
      navigate("/setup-member/amenities-list");
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Amenity with this name already exists.");
      } else {
        toast.error(`Error adding amenity: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    // if (!name.trim() || !amenityType || !icon) {
    //   toast.dismiss();
    //   toast.error("Please fill in all the required fields.");
    //   return false;
    // }
    return true;
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <form onSubmit={handleSubmit}>
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Create Amenities</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    {/* Name Field */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Name <span className="otp-asterisk"> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Enter name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                        />
                      </div>
                    </div>

                    {/* Icon Upload */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Upload Amenity{" "}
                          <span
                            className="tooltip-container"
                            onMouseEnter={() => setShowTooltip(true)}
                            onMouseLeave={() => setShowTooltip(false)}
                          >
                            [i]
                            {showTooltip && (
                              <span className="tooltip-text">
                                Max Upload Size 10 MB
                              </span>
                            )}
                          </span>
                          <span className="otp-asterisk"> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          onChange={handleFileChange}
                        />
                      </div>
                      {/* ✅ Preview Image Section */}
                      {previewImage && (
                        <div className="mt-2">
                          <img
                            src={previewImage}
                            alt="Uploaded Preview"
                            className="img-fluid rounded"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                              border: "1px solid #ccc",
                              padding: "5px",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* ✅ Dark Mode Icon Upload */}
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Upload Dark Mode Icon{" "}
                          <span
                            className="tooltip-container"
                            onMouseEnter={() => setShowDarkModeTooltip(true)}
                            onMouseLeave={() => setShowDarkModeTooltip(false)}
                          >
                            [i]
                            {showDarkModeTooltip && (
                              <span className="tooltip-text">
                                Max Upload Size 10 MB
                              </span>
                            )}
                          </span>
                          <span className="otp-asterisk"> *</span>
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          onChange={handleDarkModeFileChange}
                        />
                      </div>
                      {/* ✅ Dark Mode Preview Image Section */}
                      {previewDarkModeImage && (
                        <div className="mt-2">
                          <img
                            src={previewDarkModeImage}
                            alt="Dark Mode Preview"
                            className="img-fluid rounded"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                              border: "1px solid #ccc",
                              padding: "5px",
                            }}
                          />
                        </div>
                      )}
                    </div>

                    {/* ✅ Night Mode Toggle */}
                    <div className="col-md-3 mt-2">
                      <label>Night Mode</label>
                      <div className="form-group">
                        <button
                          type="button"
                          onClick={() => setNightMode(!nightMode)}
                          className="toggle-button"
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: 0,
                            width: "35px",
                          }}
                        >
                          {nightMode ? (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="40"
                              height="30"
                              fill="var(--red)"
                              className="bi bi-toggle-on"
                              viewBox="0 0 16 16"
                            >
                              <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                            </svg>
                          ) : (
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="40"
                              height="30"
                              fill="#667085"
                              className="bi bi-toggle-off"
                              viewBox="0 0 16 16"
                            >
                              <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Amenity Type SelectBox */}
                    {/* <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Amenity Type{" "}
                          <span className="otp-asterisk">{" "}*</span>
                        </label>
                        <SelectBox
                          options={[
                            { value: "Indoor", label: "Indoor" },
                            { value: "Outdoor", label: "Outdoor" },
                          ]}
                          defaultValue={amenityType} // ✅ Fixed defaultValue
                          onChange={setAmenityType} // ✅ Corrected onChange
                        />
                      </div>
                    </div> */}
                  </div>
                </div>
              </div>

              {/* Submit & Cancel Buttons */}
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
                    onClick={() => navigate(-1)}
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

export default Amenities;