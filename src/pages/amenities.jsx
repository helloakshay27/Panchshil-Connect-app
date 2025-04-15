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
  const [loading, setLoading] = useState(false);
  const [amenityType, setAmenityType] = useState(""); // ✅ Correct State Name
  const [showTooltip, setShowTooltip] = useState(false);

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
    if (icon) {
      formData.append("icon", icon);
    }

    try {
      await axios.post(
        `${baseURL}amenity_setups.json`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          },
        }
      );

      toast.success("Amenity added successfully");
      setName("");
      setAmenityType(""); // ✅ Reset state
      setIcon(null);
      setPreviewImage(null);
      navigate("/setup-member/amenities-list");
    } catch (err) {
      toast.error(`Error adding amenity: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    if (!name.trim() || !amenityType || !icon) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }
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
                          Name{" "}
                          <span className="otp-asterisk">{" "}*</span>
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
                          Icon{" "}
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
                          <span className="otp-asterisk">{" "}*</span>
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

                    {/* Amenity Type SelectBox */}
                    <div className="col-md-3">
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
                    </div>
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
