import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { HardHat } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ConstructionStatusEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [formData, setFormData] = useState({
    construction_status: "",
    active: true,
  });

  useEffect(() => {
    const fetchStatus = async () => {
      setDataLoading(true);
      try {
        const response = await axios.get(
          `${baseURL}construction_statuses/${id}.json`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        setFormData({
          construction_status: response.data.construction_status,
          active: response.data.active,
        });
      } catch (error) {
        console.error("Error fetching status:", error);
        toast.error("Failed to load construction status.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchStatus();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.construction_status?.trim()) {
      toast.error("Name is required");
      return;
    }

    setLoading(true);
    try {
      await axios.put(
        `${baseURL}construction_statuses/${id}.json`,
        { construction_status: formData },
        { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
      );
      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Construction status updated successfully!");
      navigate("/setup-member/construction-status-list");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        {dataLoading ? (
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-body text-center py-4">Loading...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card banner-form-card mt-3 pb-4">
              <div className="card-header banner-form-section-header">
                <h3 className="banner-form-section-heading">
                  <span className="banner-form-section-icon" aria-hidden="true">
                    <HardHat size={16} strokeWidth={1.8} />
                  </span>
                  Edit Construction Status
                </h3>
              </div>
              <div className="card-body">
                <div className="row banner-form-fields">
                  <div className="col-md-3">
                    <div className="form-group">
                      <FormTextField
                        label="Name"
                        required
                        name="construction_status"
                        placeholder="Enter name"
                        value={formData.construction_status}
                        onChange={handleChange}
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
                onClick={() => navigate("/setup-member/construction-status-list")}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ConstructionStatusEdit;
