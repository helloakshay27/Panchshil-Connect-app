import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const TestimonialEdit = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { testimonial, setTestimonials } = state || {};

  const [formData, setFormData] = useState({
    company_setup_id: testimonial?.company_setup_id || "",
    user_name: testimonial?.user_name || "",
    user_type: testimonial?.user_type || "",
    content: testimonial?.content || "",
  });

  const [companySetupOptions, setCompanySetupOptions] = useState([]);

  useEffect(() => {
    const fetchCompanySetups = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/company_setups.json",
          {
            headers: {
              Authorization:
                "Bearer Rahl2NPBGjgY6SkP2wuXvWiStHFyEcVpOGdRG4fzhSE",
            },
          }
        );
        console.log("response", response.data);

        // Ensure response is an array before setting state
        if (Array.isArray(response.data)) {
          setCompanySetupOptions(response.data);
        } else {
          setCompanySetupOptions([]); // Default to empty array
        }
      } catch (error) {
        console.error("Error fetching company setup data:", error);
        setCompanySetupOptions([]); // Default to empty array on error
      }
    };

    fetchCompanySetups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `https://panchshil-super.lockated.com/testimonials/${testimonial.id}.json`,
        formData
      );

      setTestimonials((prevTestimonials) =>
        prevTestimonials.map((t) =>
          t.id === testimonial.id ? { ...t, ...formData } : t
        )
      );
      toast.success("Testimonial updated successfully!");
      navigate("/testimonials");
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast.error("Error updating testimonial. Please try again.");
    }
  };

  const handleCancel = () => {
    navigate(-1);
  }

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section p-3">
          <div className="card mt-5 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Edit Testimonial</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Company Setup Id
                        <span style={{ color: "red", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <select
                        className="form-control form-select"
                        style={{ width: "100%" }}
                        name="company_setup_id"
                        value={formData.company_setup_id}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Select ID
                        </option>
                        {Array.isArray(companySetupOptions)
                          ? companySetupOptions.map((option) => (
                            <option key={option.id} value={option.id}>
                              {option.name ||
                                option.company_name ||
                                "No Name"}
                            </option>
                          ))
                          : []}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        User Name
                        <span style={{ color: "red", fontSize: "16px" }}>
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
                        <span style={{ color: "red", fontSize: "16px" }}>
                          *
                        </span>
                      </label>
                      <select
                        className="form-control"
                        name="user_type"
                        value={formData.user_type}
                        onChange={handleChange}
                      >
                        <option value="">Select Type</option>
                        <option value="User">User</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Content
                        <span style={{ color: "red", fontSize: "16px" }}>
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
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2 mt-3">
                    <button type="submit" className="purple-btn2 w-100">
                      Update
                    </button>
                  </div>
                  <div className="col-md-2 mt-3">
                    <button type="button" className="purple-btn2 w-100" onClick={handleCancel}>
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

export default TestimonialEdit;
