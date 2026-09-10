import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { Building2 } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ProjectBuildingType = () => {
  const connectEvents = useConnectEvents();
  const [buildingType, setBuildingType] = useState("");
  const [loading, setLoading] = useState(false);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);

  const [formData, setFormData] = useState({
    Property_Type: "",
    Property_Type_ID: null,
    building_type: "",
  });

  const navigate = useNavigate();

  useEffect(() => {
    const fetchPropertyTypes = async () => {
      const url = `${baseURL}property_types.json`; // Corrected API endpoint

      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        // Handle the response format
        const fetchedPropertyTypes = response.data || [];

        // Map to required format including ID
        const options = fetchedPropertyTypes.map((item) => ({
          value: item.property_type,
          label: item.property_type,
          id: item.id,
        }));

        setPropertyTypeOptions(options);
      } catch (error) {
        console.error("Error fetching property types:", error);
        toast.error("Failed to load property types");
      }
    };

    fetchPropertyTypes();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildingType.trim()) {
      toast.error("Building type name is required");
      return;
    }

    if (!formData.Property_Type_ID) {
      toast.error("Please select a Property Type");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${baseURL}building_types.json`,
        {
          building_type: {
            building_type: buildingType,
            property_type_id: formData.Property_Type_ID,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "application/json",
          },
        }
      );
      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("Building type added successfully");
      setBuildingType("");
      navigate("/setup-member/project-building-type-list");
    } catch (error) {
      console.error("Error adding building type:", error);
      toast.error("Failed to add building type");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Building2 size={16} strokeWidth={1.8} />
                </span>
                Project Building Type
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Property Types"
                      required
                      placeholder="Select Property Type"
                      options={propertyTypeOptions}
                      value={formData.Property_Type}
                      onChange={(value) => {
                        const selected = propertyTypeOptions.find(
                          (opt) => opt.value === value
                        );
                        setFormData((prev) => ({
                          ...prev,
                          Property_Type: value,
                          Property_Type_ID: selected?.id || null,
                          building_type: "",
                        }));
                      }}
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="form-group">
                    <FormTextField
                      label="Name"
                      required
                      placeholder="Enter name"
                      value={buildingType}
                      onChange={(e) => setBuildingType(e.target.value)}
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
              Submit
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={handleCancel}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProjectBuildingType;