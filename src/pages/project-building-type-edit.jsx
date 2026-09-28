import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Building2 } from "lucide-react";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";
import FormTextField from "../components/base/FormTextField";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const ProjectBuildingTypeEdit = () => {
  const connectEvents = useConnectEvents();
  const { id } = useParams();
  const navigate = useNavigate();
  const [buildingType, setBuildingType] = useState("");
  const [loading, setLoading] = useState(false);
  const [propertyTypeOptions, setPropertyTypeOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    Property_Type: "",
    Property_Type_ID: null,
    building_type: "",
  });

  useEffect(() => {
    setIsLoading(true);

    const fetchPropertyTypes = async () => {
      try {
        const response = await axios.get(`${baseURL}property_types.json`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        const fetchedPropertyTypes = Array.isArray(response.data) ? response.data : [];

        const options = fetchedPropertyTypes.map((item) => ({
          value: item.property_type,
          label: item.property_type,
          id: item.id,
        }));

        setPropertyTypeOptions(options);
        return options;
      } catch (error) {
        console.error("Error fetching property types:", error);
        toast.error("Failed to fetch property types");
        return [];
      }
    };

    const fetchBuildingType = async (options) => {
      try {
        const response = await axios.get(`${baseURL}building_types/${id}.json`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}` },
        });
        const data = response.data;

        setBuildingType(data.building_type);

        const matchedPropertyType = options.find(
          (item) => item.id === data.property_type_id
        );

        if (matchedPropertyType) {
          setFormData({
            Property_Type: matchedPropertyType.value,
            Property_Type_ID: data.property_type_id,
            building_type: data.building_type,
          });
        } else {
          setFormData({
            Property_Type: "",
            Property_Type_ID: data.property_type_id,
            building_type: data.building_type,
          });
        }
      } catch (error) {
        console.error("Error fetching building type:", error);
        toast.error("Failed to fetch building type");
      } finally {
        setIsLoading(false);
      }
    };

    const initializeData = async () => {
      const options = await fetchPropertyTypes();
      if (options.length > 0) {
        await fetchBuildingType(options);
      } else {
        setIsLoading(false);
      }
    };

    initializeData();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!buildingType.trim()) {
      toast.error("Building type name is required");
      return;
    }

    if (!formData.Property_Type_ID) {
      toast.error("Property type is required");
      return;
    }

    setLoading(true);
    try {
      await axios.put(`${baseURL}building_types/${id}.json`, {
        building_type: {
          building_type: buildingType,
          property_type_id: formData.Property_Type_ID,
        },
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("access_token")}`, "Content-Type": "application/json" },
      });
      connectEvents.onRecordSaved({ mode: "updated" });
      toast.success("Building type updated successfully");
      navigate("/setup-member/project-building-type-list");
    } catch (error) {
      console.error("Error updating building type:", error);
      toast.error("Failed to update building type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        {isLoading ? (
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-body text-center py-4">Loading...</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="card banner-form-card mt-3 pb-4">
              <div className="card-header banner-form-section-header">
                <h3 className="banner-form-section-heading">
                  <span className="banner-form-section-icon" aria-hidden="true">
                    <Building2 size={16} strokeWidth={1.8} />
                  </span>
                  Edit Project Building Type
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
                {loading ? "Updating..." : "Submit"}
              </button>
              <button
                type="button"
                className="banner-form-action-btn"
                onClick={() => navigate("/setup-member/project-building-type-list")}
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

export default ProjectBuildingTypeEdit;
