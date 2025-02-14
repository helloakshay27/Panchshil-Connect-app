import React, { useState } from "react";
import axios from "axios";
import "../mor.css";

const Amenities = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setIcon(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append("amenity_setup[name]", name);
    if (icon) {
      formData.append("icon", icon);
    }

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/amenity_setups.json",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Accept: "application/json",
            Authorization: `Bearer YOUR_ACCESS_TOKEN`, // Ensure proper authentication
          },
        }
      );
      console.log("Success:", response.data);
      setName("");
      setIcon(null);
      alert("Amenity added successfully");
    } catch (err) {
      console.error("Error Response:", err.response?.data || err.message);
      setError(
        err.response?.data?.message ||
          "Failed to add amenity. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Amenities Setup</h3>
              </div>
              <div className="card-body">
                {error && <p className="text-danger">{error}</p>}
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Name{" "}
                          <span style={{ color: "red", fontSize: "16px" }}>
                            *
                          </span>
                        </label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Enter name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>
                          Icon{" "}
                          <span style={{ color: "red", fontSize: "16px" }}>
                            *
                          </span>
                          <span />
                        </label>
                        <input
                          className="form-control"
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          placeholder="Default input"
                          required
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="purple-btn2 w-80"
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Amenities;
