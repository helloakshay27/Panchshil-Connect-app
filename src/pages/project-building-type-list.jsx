import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const ProjectBuildingTypeList = () => {
  const [buildingTypes, setBuildingTypes] = useState([]);
  const [loading, setLoading] = useState(true);
 

  useEffect(() => {
    fetchBuildingTypes();
  }, []);

  const fetchBuildingTypes = async () => {
    try {
      const response = await axios.get("https://panchshil-super.lockated.com/building_types.json");
      setBuildingTypes(response.data);
    } catch (error) {
      console.error("Error fetching building types:", error);
      toast.error("Failed to fetch building types");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = async (id, currentStatus) => {
    try {
      await axios.put(`https://panchshil-super.lockated.com/building_types/${id}.json`, {
        building_type: { active: !currentStatus },
      });
      toast.success("Status updated successfully");
      fetchBuildingTypes(); // Refresh the list
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };
  const navigate = useNavigate();
  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
        <div className="d-flex justify-content-end px-4 pt-2 mt-3">
            <div className="col-md-4 pe-2 pt-2">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control tbl-search table_search"
                  placeholder="Search"
                 
                />
                <div className="input-group-append">
                  <button type="submit" className="btn btn-md btn-default">
                    <svg
                      width={16}
                      height={16}
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M7.66927 13.939C3.9026 13.939 0.835938 11.064 0.835938 7.53271C0.835938 4.00146 3.9026 1.12646 7.66927 1.12646C11.4359 1.12646 14.5026 4.00146 14.5026 7.53271C14.5026 11.064 11.4359 13.939 7.66927 13.939ZM7.66927 2.06396C4.44927 2.06396 1.83594 4.52021 1.83594 7.53271C1.83594 10.5452 4.44927 13.0015 7.66927 13.0015C10.8893 13.0015 13.5026 10.5452 13.5026 7.53271C13.5026 4.52021 10.8893 2.06396 7.66927 2.06396Z"
                        fill="#8B0203"
                      />
                      <path
                        d="M14.6676 14.5644C14.5409 14.5644 14.4143 14.5206 14.3143 14.4269L12.9809 13.1769C12.7876 12.9956 12.7876 12.6956 12.9809 12.5144C13.1743 12.3331 13.4943 12.3331 13.6876 12.5144L15.0209 13.7644C15.2143 13.9456 15.2143 14.2456 15.0209 14.4269C14.9209 14.5206 14.7943 14.5644 14.6676 14.5644Z"
                        fill="#8B0203"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="card-tools mt-1">
              <button
                className="purple-btn2 rounded-3"
                onClick={() => navigate("/project-building-type")}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={26}
                  height={20}
                  fill="currentColor"
                  className="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                </svg>
                <span>Add</span>
              </button>
            </div>
          </div>
          <div className="card mx-3 mt-4">
            <div className="card-header">
              <h3 className="card-title">Property Type List</h3>
            </div>
            <div className="card-body mt-4 pb-4 pt-0">
              <div className="tbl-container mt-3">
                {loading ? (
                  <p>Loading...</p>
                ) : (
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buildingTypes.map((type, index) => (
                        <tr key={type.id}>
                          <td>{index + 1}</td>
                          <td>{type.building_type}</td>
                          <td>
                            <button
                              onClick={() => handleToggle(type.id, type.active)}
                              className="toggle-button"
                              style={{
                                border: "none",
                                background: "none",
                                cursor: "pointer",
                                padding: 0,
                                width: "70px",
                              }}
                            >
                              {type.active ? (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="40"
                                  height="25"
                                  fill="#de7008"
                                  className="bi bi-toggle-on"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                                </svg>
                              ) : (
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="40"
                                  height="25"
                                  fill="#667085"
                                  className="bi bi-toggle-off"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M11 4a4 4 0 0 1 0 8H8a5 5 0 0 0 2-4 5 5 0 0 0-2-4zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8M0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5" />
                                </svg>
                              )}
                            </button>
                          </td>
                          <td>
                           
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBuildingTypeList;
