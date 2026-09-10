import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Home } from "lucide-react";
import FormTextField from "../components/base/FormTextField";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const PropertyTypeEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchPropertyType = async () => {
      try {
        const response = await axios.get(
          `${baseURL}property_types/${id}.json`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` } }
        );
        setName(response.data.property_type || "");
      } catch (error) {
        console.error("Error fetching property type:", error);
        toast.error("Failed to load property type.");
      }
    };

    fetchPropertyType();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Property Type Name is required!");
      return;
    }

    setLoading(true);

    try {
      await axios.put(
        `${baseURL}property_types/${id}.json`,
        { property_type: { property_type: name } },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Property Type updated successfully!");
      navigate("/setup-member/property-type-list");
    } catch (error) {
      console.error("Error updating property type:", error);

      const errorMessage =
        error.response?.data?.message || "Failed to update Property Type.";
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
                Edit Property Type
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
              {loading ? "Updating..." : "Update"}
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

export default PropertyTypeEdit;
