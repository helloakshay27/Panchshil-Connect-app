import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import "../mor.css";
import "./project-details-create.css";

const UserGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
    site_id: "",
    user_id: "",
    active: false,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserGroupData = async () => {
      try {
        const response = await axios.get(`${baseURL}usergroups/${id}.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });

        const data = response.data.usergroup || response.data;
        setFormData({
          name: data.name || "",
          company_id: data.company_id || "",
          site_id: data.site_id || "",
          user_id: data.user_id || "",
          active: data.active || false,
        });
      } catch (error) {
        console.error("Error fetching user group data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserGroupData();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="module-data-section project-details-page p-3">
            <div className="card user-details-card project-details-create-card mt-4 pb-4 mx-4">
              <div className="card-header project-details-section-header">
                <h3 className="project-details-section-heading">
                  <span className="project-details-section-icon" aria-hidden="true">
                    <Users size={16} strokeWidth={1.8} />
                  </span>
                  User Group Details
                </h3>
              </div>
              <div className="card-body">
                <div className="row px-3">
                  <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                    <div className="col-6">
                      <label>Group Name</label>
                    </div>
                    <div className="col-6">
                      <span className="text-dark">
                        : {formData.name || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                    <div className="col-6">
                      <label>Company ID</label>
                    </div>
                    <div className="col-6">
                      <span className="text-dark">
                        : {formData.company_id || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                    <div className="col-6">
                      <label>Site ID</label>
                    </div>
                    <div className="col-6">
                      <span className="text-dark">
                        : {formData.site_id || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                    <div className="col-6">
                      <label>User ID</label>
                    </div>
                    <div className="col-6">
                      <span className="text-dark">
                        : {formData.user_id || "-"}
                      </span>
                    </div>
                  </div>

                  <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                    <div className="col-6">
                      <label>Status</label>
                    </div>
                    <div className="col-6">
                      <span className="text-dark">
                        : {formData.active ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>

                  {/*
                  {formData.usergroup_members.length > 0 && (
                    <div className="col-12 mt-3 usergroup-members-section">
                      <h5>Members</h5>
                      <div className="tbl-container enhanced-table__container usergroup-members-table">
                        <table>
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>User ID</th>
                            </tr>
                          </thead>
                          <tbody>
                            {formData.usergroup_members.map((member, index) => (
                              <tr key={member.id || index}>
                                <td>{index + 1}</td>
                                <td>{member.user_id || "-"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                  */}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserGroupDetails;
