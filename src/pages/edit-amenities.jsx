import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom"; // If using React Router
import "../mor.css";
import toast from "react-hot-toast";

const EditAmenities = () => {
  const { id } = useParams(); // Get ID from URL
  const [name, setName] = useState("");
  const [icon, setIcon] = useState(null);

  // Fetch existing amenity details
  useEffect(() => {
    const fetchAmenity = async () => {
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/amenity_setups/${id}.json`
        );
        setName(response.data.name);
      } catch (error) {
        console.error("Error fetching amenity:", error);
      }
    };

    if (id) {
      fetchAmenity();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      alert("Name is required.");
      return;
    }

    const formData = new FormData();
    formData.append("amenity_setup[name]", name);
    if (icon) {
      formData.append("icon", icon);
    }

    // Log form data
    for (let pair of formData.entries()) {
      console.log(pair[0] + ": " + pair[1]);
    }

    try {
      const response = await axios.put(
        `https://panchshil-super.lockated.com/amenity_setups/${id}.json`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      console.log("API Response:", response.data);
      toast.success("Amenity updated successfully!");
    } catch (error) {
      console.error("API Error:", error.response?.data || error.message);
      toast.error(
        `Failed to update amenity: ${error.response?.data?.error || "Unknown error"
        }`
      );
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Edit Amenity</h3>
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
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button type="submit" className="purple-btn2 w-100">
                      Update
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAmenities;
