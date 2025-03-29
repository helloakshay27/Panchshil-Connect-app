import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "../mor.css";
import toast from "react-hot-toast";

const Specification = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setIcon(file);

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss(); // Clear previous toasts

    // Validation Checks (One at a Time)
    if (!name.trim()) {
      toast.error("Name is mandatory");
      setLoading(false);
      return;
    }

    if (!icon) {
      toast.error("Icon is mandatory");
      setLoading(false);
      return;
    }

    // Form Submission
    const formData = new FormData();
    formData.append("specification_setup[name]", name.trim());
    formData.append("icon", icon);

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/specification_setups.json",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          },
        }
      );
      console.log("Success:", response.data);

      toast.success("Specification added successfully");

      // Reset form fields
      setName("");
      setIcon(null);
      navigate("/specification-list");
    } catch (err) {
      console.error("Error Response:", err.response?.data || err.message);
      toast.error("Failed to add specification. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();

  const handleCancel = () => {
    navigate(-1); // This navigates back one step in history
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <form onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Create Specification</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
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
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Icon
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
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={handleFileChange}
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="img-thumbnail"
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
  );
};

export default Specification;
