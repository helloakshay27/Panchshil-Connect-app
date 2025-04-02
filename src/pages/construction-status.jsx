import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";

const ConstructionStatus = () => {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("construction_status[construction_status]", name); // ✅ Correct format

    try {
      await axios.post(
        `${baseURL}construction_statuses.json`,
        formData
      );

      toast.success("Construction status added successfully!");
      setName(""); // Reset form
      navigate("/setup-member/construction-status-list"); // Redirect after success
    } catch (error) {
      console.error("Error adding construction status:", error);
      toast.error("Failed to add construction status");
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
              <h3 className="card-title">Construction Status</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Name Field */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name
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
                </div>
              </form>
            </div>
          </div>
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
                onClick={() => navigate("/setup-member/construction-status-list")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConstructionStatus;
