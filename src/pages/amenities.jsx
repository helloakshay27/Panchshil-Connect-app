import React, { useState } from "react";
import axios from "axios";
import "../mor.css";

const Amenities = () => {
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("icon", icon);

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/amenity_setups.json",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("API Response:", response);
      alert("Amenity added successfully!");
    } catch (error) {
      console.error("API Error:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Status:", error.response.status);
      }
      alert("Failed to add amenity.");
    }
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Amenities</h3>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Name</label>
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
                        <label>Site Name</label>
                        <input
                          className="form-control"
                          type="text"
                          placeholder="Enter Site name"
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Icon</label>
                        <input
                          type="file"
                          accept=".png,.jpg,.jpeg,.svg"
                          className="form-control"
                          onChange={(e) => setIcon(e.target.files[0])}
                        />
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* Submit button moved outside card */}
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button
                type="submit"
                className="purple-btn2 w-100"
                onClick={handleSubmit}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Amenities;
