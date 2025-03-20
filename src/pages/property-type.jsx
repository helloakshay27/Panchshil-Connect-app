import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const PropertyType = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Property Type Name is required!");
      return;
    }

    setLoading(true);

    try {
      const payload = { property_type: { name } }; // ✅ Ensure correct backend format

      await axios.post(
        "https://panchshil-super.lockated.com/property_types.json",
        payload, // Send JSON directly
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Property Type added successfully!");
      setName(""); // Reset form
      navigate("/property-type-list"); // ✅ Navigate after success
    } catch (error) {
      console.error("Error submitting property type:", error);

      // Extract detailed backend error message if available
      const errorMessage =
        error.response?.data?.message || "Failed to add Property Type.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Property Type</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Name Field */}
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
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* ✅ Submit & Cancel Buttons */}
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button
                      type="submit"
                      className="purple-btn2 w-100"
                      disabled={loading}
                    >
                      {loading ? "Submitting..." : "Submit"}
                    </button>
                  </div>

                  <div className="col-md-2">
                    <button
                      type="button"
                      className="purple-btn2 w-100"
                      onClick={() => navigate("/property-type-list")}
                      disabled={loading}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
                {/* ✅ End of Buttons */}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyType;
