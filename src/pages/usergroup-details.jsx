/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import "./banner-add.css";

const DetailItem = ({ label, value }) => (
  <div className="banner-details-item">
    <span className="banner-details-label">{label}</span>
    <span className="banner-details-value" title={value || "-"}>
      {value || "-"}
    </span>
  </div>
);

const UserGroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    company_id: "",
    company_name: "",
    site_id: "",
    site_name: "",
    user_id: "",
    active: false,
    usergroup_members: [],
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
          company_id: data.company_id || response.data.company_id || "",
          company_name:
            data.company_name || response.data.company_name || "",
          site_id: data.site_id || "",
          site_name: data.site_name || "",
          user_id: data.user_id || "",
          active: Boolean(data.active),
          usergroup_members: Array.isArray(data.usergroup_members)
            ? data.usergroup_members
            : [],
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
    return (
      <div className="main-content">
        <div className="module-data-section banner-form-page p-3">
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Users size={16} strokeWidth={1.8} />
                </span>
                Loading...
              </h3>
            </div>
            <div className="card-body">
              <p className="mb-0 text-muted">Loading user group details...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const companyDisplay =
    formData.company_name || formData.company_id || "-";
  const siteDisplay = formData.site_name || formData.site_id || "-";

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <div className="card banner-form-card mt-3 pb-4">
          <div className="card-header banner-form-section-header">
            <h3 className="banner-form-section-heading">
              <span className="banner-form-section-icon" aria-hidden="true">
                <Users size={16} strokeWidth={1.8} />
              </span>
              User Group Details
            </h3>
          </div>
          <div className="card-body">
            <div className="banner-details-grid">
              <DetailItem label="Group Name" value={formData.name} />
              <DetailItem label="Company" value={companyDisplay} />
              <DetailItem label="Site" value={siteDisplay} />
              <DetailItem label="User ID" value={formData.user_id} />
              <DetailItem
                label="Status"
                value={formData.active ? "Active" : "Inactive"}
              />
            </div>

            {formData.usergroup_members.length > 0 && (
              <div className="banner-details-members">
                <h4 className="banner-details-subtitle">Members</h4>
                <div className="tbl-container">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th style={{ width: "80px" }}>Sr No</th>
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
          </div>
        </div>

        <div className="banner-form-actions">
          <button
            type="button"
            className="banner-form-action-btn"
            onClick={() => navigate(`/setup-member/user-groups-edit/${id}`)}
          >
            Edit
          </button>
          <button
            type="button"
            className="banner-form-action-btn"
            onClick={() => navigate("/setup-member/user-groups-list")}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGroupDetails;
