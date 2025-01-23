import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import "../mor.css";

const TestimonialList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/testimonials.json?company_id=1"
        );
        setTestimonials(response.data.testimonials);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch testimonials.");
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  const handleSearch = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredTestimonials = testimonials.filter(
    (testimonial) =>
      testimonial.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      testimonial.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <div className="d-flex justify-content-end px-4 pt-2 mt-3">
              <div className="col-md-4 pe-2 pt-2">
                <div className="input-group">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={handleSearch}
                    className="form-control tbl-search table_search"
                    placeholder="Search by User Name or Content"
                  />
                </div>
              </div>
              <div className="card-tools">
                <button
                  className="purple-btn2 rounded-3"
                  onClick={() => navigate("/testimonials")}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  <span>Add </span>
                </button>
              </div>
            </div>

            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Testimonials List</h3>
              </div>
              <div className="card-body mt-4 pb-4 pt-0">
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <div className="tbl-container mt-4 px-1">
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th>Id</th>
                          <th>User Name</th>
                          <th>User Type</th>
                          <th>Content</th>
                          <th>Company SetupId</th>
                          <th>Company Name</th>
                          <th>Created At</th>
                          <th>Updated At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTestimonials.length > 0 ? (
                          filteredTestimonials.map((testimonial) => (
                            <tr key={testimonial.id}>
                              <td>{testimonial.id}</td>
                              <td>{testimonial.user_name}</td>
                              <td>{testimonial.user_type}</td>
                              <td>{testimonial.content}</td>
                              <td>{testimonial.company_setup_id}</td>
                              <td>{testimonial.company_name}</td>
                              <td>
                                {new Date(
                                  testimonial.created_at
                                ).toLocaleString()}
                              </td>
                              <td>
                                {new Date(
                                  testimonial.updated_at
                                ).toLocaleString()}
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="8" className="text-center">
                              No testimonials available.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TestimonialList;
