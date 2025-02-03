import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";

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
                "Bearer hnbLunLzzG9ft5dyVulTBpuQp2mgvfZe_69ukCTa8QQ",
            },
          }
        );
        console.log("response", response.data);
        setCompanySetupOptions(response.data); // Set the company setup data
      } catch (error) {
        console.error("Error fetching company setup data:", error);
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
        `https://panchshil-super.lockated.com//testimonials/${testimonial.id}.json`,
        formData
      );

      setTestimonials((prevTestimonials) =>
        prevTestimonials.map((t) =>
          t.id === testimonial.id ? { ...t, ...formData } : t
        )
      );
      alert("Testimonial updated successfully!");
      navigate("/testimonials");
    } catch (error) {
      alert("Data Is Updated");
    }
  };

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
                      <label>Company Setup Id</label>
                      {/* <input
                        className="form-control"
                        name="company_setup_id"
                        value={formData.company_setup_id}
                        onChange={handleChange}
                      /> */}
                      <select
                        className="form-control form-select"
                        style={{ width: "100%" }}
                        name="companysetupid"
                        value={formData.company_setup_id}
                        onChange={handleChange}
                      >
                        <option value="" disabled>
                          Select ID
                        </option>
                        {companySetupOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.name || option.company_name || "No Name"}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>User Name</label>
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
                      <label>User Type</label>
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
                      <label>Content</label>
                      <input
                        className="form-control"
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>
                <div className="col-md-2 ">
                  <button type="submit" className="purple-btn2 w-80">
                    Submit
                  </button>
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
