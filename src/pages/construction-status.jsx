import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { HardHat } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ConstructionStatus = () => {
  const connectEvents = useConnectEvents();
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
      await axios.post(`${baseURL}construction_statuses.json`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
      });

      connectEvents.onRecordSaved({ mode: "added" });
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
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <HardHat size={16} strokeWidth={1.8} />
                </span>
                Construction Status
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      required
                      placeholder="Enter name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
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
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() =>
                navigate("/setup-member/construction-status-list")
              }
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

export default ConstructionStatus;
