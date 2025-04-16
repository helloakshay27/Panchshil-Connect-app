import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";
import SelectBox from "../components/base/SelectBox";

const ProjectBuildingType = () => {
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
        const response = await axios.get(url);
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
            "Content-Type": "application/json",
          },
        }
      );
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
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Project Building Type</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Property Type SelectBox */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Property Types <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <SelectBox
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
                            building_type: "", // clear building type if needed
                          }));
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Name Field */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name <span className="otp-asterisk">{" "}*</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Enter name"
                        value={buildingType}
                        onChange={(e) => setBuildingType(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button
                      type="submit"
                      className="purple-btn2 w-100"
                      disabled={loading}
                    >
                      Submit
                    </button>
                  </div>

                  <div className="col-md-2">
                    <button
                      type="button"
                      className="purple-btn2 w-100"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectBuildingType;