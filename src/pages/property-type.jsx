import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const PropertyType = () => {
  const connectEvents = useConnectEvents();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // ✅ Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Property Type Name is required!");
      return;
    }

    setLoading(true);

    try {
      const payload = new FormData();
      payload.append("property_type[property_type]", name); // ✅ Correct format

      await axios.post(
        `${baseURL}property_types.json`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data", // ✅ Required for FormData
          },
        }
      );

      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("Property Type added successfully!");
      setName(""); // Reset form
      navigate("/setup-member/property-type-list"); // ✅ Navigate after success
    } catch (error) {
      console.error("Error submitting property type:", error);

      // Extract backend error message if available
      const errorMessage =
        error.response?.data?.message || "Failed to add Property Type.";
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
                  <Home size={16} strokeWidth={1.8} />
                </span>
                Property Type
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
              onClick={() => navigate("/setup-member/property-type-list")}
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

export default PropertyType;
