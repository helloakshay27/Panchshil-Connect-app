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
    user_type: testimonial?.user_type || "",
    content: testimonial?.content || "",
  });

  const [companySetupOptions, setCompanySetupOptions] = useState([]);
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
        console.log(response.data);

        if (Array.isArray(response.data.company_setups)) {
          setCompanySetupOptions(response.data.company_setups);
          console.log(response.company_setups);
        } else {
          setCompanySetupOptions([]);
        }
      } catch (error) {
        console.error("Error fetching company setup data:", error);
        setCompanySetupOptions([]);
      }
    };

    fetchCompanySetups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  // console.log(companySetupOptions);

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
            <div className="card mt-5 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Edit Testimonial</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company Name
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          *
                        </span>
                      </label>

                      <SelectBox
                        options={
                          companySetupOptions.length > 0
                            ? companySetupOptions.map((option) => ({
                                value: option.id,
                                label: option.name.toString(),
                              }))
                            : []
                        }
                        defaultValue={formData.company_setup_id || ""}
                        onChange={(selectedValue) =>
                          setFormData({
                            ...formData,
                            company_setup_id: selectedValue,
                          })
                        }
                      />
                    </div>
                  </div>
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
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        User Type
                        <span style={{ color: "#de7008", fontSize: "16px" }}>
                          {" "}
                          *
                        </span>
                      </label>
                      <SelectBox
                        options={[
                          { label: "User", value: "User" },
                          { label: "Admin", value: "Admin" },
                          { label: "Resident", value: "Resident" },
                        ]}
                        defaultValue={formData.user_type || ""} // Ensure correct pre-selected value
                        onChange={(value) =>
                          setFormData((prev) => ({
                            ...prev,
                            user_type: value, // Store selected value in formData
                          }))
                        }
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Content
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
