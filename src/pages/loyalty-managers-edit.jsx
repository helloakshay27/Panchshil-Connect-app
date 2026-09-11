import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { UserRound } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const LoyaltyManagerEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [projectId, setProjectId] = useState("");
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get(`${baseURL}projects.json`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        });
        setProjects(response.data.projects || []);
      } catch (error) {
        console.error("Error fetching projects:", error);
        toast.error("Failed to load projects");
      }
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchLoyaltyManager = async () => {
      try {
        const response = await axios.get(
          `${baseURL}loyalty_managers/${id}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          },
        );
        const data = response.data;
        setName(data.name || "");
        setMobile(data.mobile || "");
        setEmail(data.email || "");
        setProjectId(data.project_id || "");
      } catch (error) {
        console.error("Error fetching loyalty manager:", error);
        toast.error("Failed to load loyalty manager.");
      }
    };

    fetchLoyaltyManager();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name is required!");
      return;
    }

    if (!mobile.trim()) {
      toast.error("Mobile number is required!");
      return;
    }

    if (!/^\d{10}$/.test(mobile)) {
      toast.error("Please enter a valid 10-digit mobile number!");
      return;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error("Please enter a valid email address!");
      return;
    }

    if (!projectId) {
      toast.error("Project is required!");
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${baseURL}loyalty_managers/${id}.json`,
        {
          loyalty_manager: {
            name,
            mobile,
            email: email || undefined,
            project_id: projectId || undefined,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Loyalty Manager updated successfully!");
      navigate("/setup-member/loyalty-managers-list");
    } catch (error) {
      console.error("Error updating loyalty manager:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update Loyalty Manager.";
      toast.error(errorMessage);
    } finally {
      setLoading(false);
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
                  <UserRound size={16} strokeWidth={1.8} />
                </span>
                Edit Loyalty Manager
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      required
                      name="name"
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Mobile"
                      required
                      type="tel"
                      name="mobile"
                      placeholder="Enter mobile number"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      maxLength={10}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Email"
                      type="email"
                      name="email"
                      placeholder="Enter email (optional)"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Project"
                      required
                      placeholder="Select Project"
                      options={projects.map((project) => ({
                        label: project.project_name,
                        value: project.id,
                      }))}
                      value={projectId}
                      onChange={(value) => setProjectId(value)}
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
              disabled={loading}
            >
              {loading ? "Updating..." : "Update"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate("/setup-member/loyalty-managers-list")}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoyaltyManagerEdit;
