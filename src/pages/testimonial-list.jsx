import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";

const TestimonialList = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <>
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Testimonials-List</h3>
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
                          <th>CompanyName</th>
                          <th>CreatedAt</th>
                          <th>Updated At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {testimonials.length > 0 ? (
                          testimonials.map((testimonial) => (
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
          <Footer />
        </div>
      </div>
    </>
  );
};

export default TestimonialList;
