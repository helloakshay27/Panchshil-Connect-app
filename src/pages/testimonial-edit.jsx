import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";

const TestimonialEdit = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { testimonial } = state || {};

  const [formData, setFormData] = useState({
    company_setup_id: testimonial?.company_setup_id || "",
    user_name: testimonial?.user_name || "",
    user_profile: testimonial?.user_profile || "",
    building_type_id: testimonial?.building_type_id || "",
    content: testimonial?.content || "",
  });

  const [companySetupOptions, setCompanySetupOptions] = useState([]);
  const [buildingTypeOptions, setBuildingTypeOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanySetups = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/company_setups.json",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (Array.isArray(response.data.company_setups)) {
          setCompanySetupOptions(response.data.company_setups);
        } else {
          setCompanySetupOptions([]);
        }
      } catch (error) {
        console.error("Error fetching company setup data:", error);
        setCompanySetupOptions([]);
      }
    };

    const fetchBuildingTypes = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/building_types.json",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            },
          }
        );
        if (Array.isArray(response.data)) {
          setBuildingTypeOptions(response.data);
        } else {
          setBuildingTypeOptions([]);
        }
      } catch (error) {
        console.error("Error fetching building type data:", error);
        setBuildingTypeOptions([]);
      }
    };

    fetchCompanySetups();
    fetchBuildingTypes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.put(
        `https://panchshil-super.lockated.com/testimonials/${testimonial.id}.json`,
        formData
      );

      toast.success("Testimonial updated successfully!");
      navigate("/testimonial-list"); // Redirect after update
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Error updating testimonial. Please try again.");
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
        <div className="module-data-section p-3">
          <form onSubmit={handleSubmit}>
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Edit Testimonial</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  {/* User Name */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        User Name
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        name="user_name"
                        value={formData.user_name}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* User Profile */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        User Profile
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        name="user_profile"
                        value={formData.user_profile}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Building Type */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Building Type
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <SelectBox
                        options={buildingTypeOptions.map((option) => ({
                          label: option.building_type, // Display Name
                          value: option.building_id, // ID
                        }))}
                        value={formData.building_type_id}
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            building_type_id: value, // Store selected value
                          }))
                        }
                      />
                    </div>
                  </div>

                  {/* Content (Description) */}
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Description
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <input
                        className="form-control"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit and Cancel Buttons */}
            <div className="row mt-2 justify-content-center">
              <div className="col-md-2 mt-3">
                <button
                  type="submit"
                  className="purple-btn2 w-100"
                  disabled={loading}
                >
                  Submit
                </button>
              </div>
              <div className="col-md-2 mt-3">
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
  );
};

export default TestimonialEdit;
