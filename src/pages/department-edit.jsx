import axios from "axios";
import React, { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { Briefcase } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const DepartmentEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [organizations, setOrganizations] = useState([]);
  const [company, setCompany] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    organizationId: "",
    companyId: "",
    siteId: null,
    active: true,
    deleted: false,
  });

  const fetchDepartment = async () => {
    try {
      const response = await axios.get(`${baseURL}departments/${id}.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (response.data) {
        setFormData({
          name: response.data.name,
          organizationId: response.data.organization_id,
          companyId: response.data.company_id,
          siteId: response.data.site_id,
          active: response.data.active || true,
          deleted: response.data.deleted || false,
        });
      }
    } catch (error) {
      console.error("Error fetching department:", error);
      toast.error("Failed to fetch department data");
      navigate("/setup-member/department-list");
    }
  };

  const fetchOrganizations = async () => {
    try {
      const response = await axios.get(`${baseURL}organizations.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (Array.isArray(response.data.organizations)) {
        setOrganizations(response.data.organizations);
      } else {
        setOrganizations([]);
      }
    } catch (error) {
      console.error("Error fetching organizations:", error);
      toast.error("Failed to fetch organizations");
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await axios.get(`${baseURL}company_setups.json`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
        },
      });

      if (Array.isArray(response.data.company_setups)) {
        setCompany(response.data.company_setups);
      } else {
        setCompany([]);
      }
    } catch (error) {
      console.error("Error fetching company setups:", error);
      toast.error("Failed to fetch company setups");
    }
  };

  useEffect(() => {
    fetchDepartment();
    fetchOrganizations();
    fetchCompanies();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setSubmitting(true);

    try {
      const departmentData = {
        department: {
          name: formData.name,
          organization_id: formData.organizationId,
          company_id: formData.companyId,
          site_id: formData.siteId || null,
          active: formData.active,
          deleted: formData.deleted,
        },
      };

      await axios.put(`${baseURL}departments/${id}.json`, departmentData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Department updated successfully!");
      navigate("/setup-member/department-list");
    } catch (error) {
      console.error("Error updating department:", error);
      toast.error(
        error.response?.data?.message || "Failed to update department."
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Briefcase size={16} strokeWidth={1.8} />
                </span>
                Edit Department
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Department Name"
                      required
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter Department Name"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Company ID"
                      required
                      options={
                        company.length > 0
                          ? company.map((comp) => ({
                              value: comp.id,
                              label: comp.name,
                            }))
                          : [{ value: "", label: "No companies found" }]
                      }
                      value={formData.companyId}
                      onChange={(value) =>
                        setFormData({ ...formData, companyId: value })
                      }
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Organization ID"
                      required
                      options={
                        organizations.length > 0
                          ? organizations.map((org) => ({
                              value: org.id,
                              label: org.name,
                            }))
                          : [{ value: "", label: "No organizations found" }]
                      }
                      value={formData.organizationId}
                      onChange={(value) =>
                        setFormData({ ...formData, organizationId: value })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={submitting}
            >
              {submitting ? "Updating..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate("/setup-member/department-list")}
              disabled={submitting}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentEdit;
