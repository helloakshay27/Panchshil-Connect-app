import React, { useState } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";

const Amenities = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleFileChange = (e) => {
    setIcon(e.target.files[0]);
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
    if (icon) {
      formData.append("icon", icon);
    }

    try {
      await axios.post(
        "https://panchshil-super.lockated.com/amenity_setups.json",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer YOUR_ACCESS_TOKEN`,
          },
        }
      );

      toast.success("Amenity added successfully");
      setName("");
      setIcon(null);
      navigate("/amenities-list");
    } catch (err) {
      toast.error(`Error adding amenity: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};

    // If all fields are empty, show a single error message
    if (!name.trim() && !icon) {
      toast.dismiss();
      toast.error("Please fill in all the required fields.");
      return false;
    }

    // Check Name
    if (!name.trim()) {
      newErrors.name = "Name is mandatory";
      toast.dismiss();
      toast.error("Name is mandatory");
    }

    // Check Icon (Attachment)
    if (!icon) {
      newErrors.icon = "Icon is mandatory";
      toast.dismiss();
      toast.error("Icon is mandatory");
    }

    // Update errors state
    setErrors(newErrors);

    // If there are any errors, return false
    return Object.keys(newErrors).length === 0;
  };

  const handleCancel = () => {
    setName("");
    setIcon(null);
    navigate(-1);
    toast.success("Action cancelled");
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
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Name{" "}
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
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
                          Icon{" "}
                          <span style={{ color: "#de7008", fontSize: "16px" }}>
                            *
                          </span>
                          <span />
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          placeholder="Default input"
                          onChange={handleFileChange}
                        />
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
    </>
  );
};

export default Amenities;
