import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";

const ProjectBuildingType = () => {
  const [buildingType, setBuildingType] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildingType.trim()) {
      toast.error("Building type name is required");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseURL}building_types.json`,
        { building_type: { building_type: buildingType } },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      toast.success("Building type added successfully");
      navigate("/setup-member/project-building-type-list");
      setBuildingType(""); // Reset input field
    } catch (error) {
      console.error("Error adding building type:", error);
      toast.error("Failed to add building type");
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
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Project Building Type</h3>
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
                        value={buildingType}
                        onChange={(e) => setBuildingType(e.target.value)}
                      />
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
      </div>
    </div>
  );
};

export default ProjectBuildingType;
