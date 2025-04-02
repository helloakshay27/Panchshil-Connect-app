import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { baseURL } from "./baseurl/apiDomain";

const ProjectBuildingTypeEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [buildingType, setBuildingType] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBuildingType();
  }, []);

  const fetchBuildingType = async () => {
    try {
      const response = await axios.get(`${baseURL}building_types/${id}.json`);
      setBuildingType(response.data.building_type);
    } catch (error) {
      console.error("Error fetching building type:", error);
      toast.error("Failed to fetch building type");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildingType.trim()) {
      toast.error("Building type name is required");
      return;
    }
    setLoading(true);
    try {
      await axios.put(`${baseURL}building_types/${id}.json`, {
        building_type: { building_type: buildingType },
      });
      toast.success("Building type updated successfully");
      navigate("/setup-member/project-building-type-list");
    } catch (error) {
      console.error("Error updating building type:", error);
      toast.error("Failed to update building type");
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
              <h3 className="card-title">Edit Project Building Type</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name
                        <span style={{ color: "#de7008", fontSize: "16px" }}>*</span>
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
                    <button type="submit" className="purple-btn2 w-100" disabled={loading}>
                      {loading ? "Updating..." : "Submit"}
                    </button>
                  </div>
                  <div className="col-md-2">
                    <button type="button" className="purple-btn2 w-100" onClick={() => navigate("/setup-member/project-building-type-list")}>
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

export default ProjectBuildingTypeEdit;
