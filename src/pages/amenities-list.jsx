import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const AmenitiesList = () => {
  const [toggleStates, setToggleStates] = useState([true, false]);
  const [amenities, setAmenities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch data from the API
    const fetchAmenities = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/amenity_setups.json"
        );
        console.log("API Response:", response.data.amenities_setups);
        if (Array.isArray(response.data.amenities_setups)) {
          setAmenities(response.data.amenities_setups);
        } else {
          setError("Unexpected response format");
        }
      } catch (err) {
        console.error("Error fetching amenities:", err);
        setError("Failed to fetch amenities data");
      } finally {
        setLoading(false);
      }
    };

    fetchAmenities();
  }, []);

  const handleToggle = (index) => {
    setToggleStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state))
    );
  };

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="d-flex justify-content-end px-4 pt-2 mt-3">
              <div className="col-md-4 pe-2 pt-2">
                <form
                  action="/pms/departments"
                  acceptCharset="UTF-8"
                  method="get"
                >
                  <div className="input-group">
                    <input
                      type="text"
                      name="s[name_cont]"
                      id="s_name_cont"
                      className="form-control tbl-search table_search"
                      placeholder="Type your keywords here"
                    />
                    <div className="input-group-append">
                      <button type="submit" className="btn btn-md btn-default">
                        <svg
                          width={16}
                          height={16}
                          viewBox="0 0 16 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M7.66927 13.939C3.9026 13.939 0.835938 11.064 0.835938 7.53271C0.835938 4.00146 3.9026 1.12646 7.66927 1.12646C11.4359 1.12646 14.5026 4.00146 14.5026 7.53271C14.5026 11.064 11.4359 13.939 7.66927 13.939ZM7.66927 2.06396C4.44927 2.06396 1.83594 4.52021 1.83594 7.53271C1.83594 10.5452 4.44927 13.0015 7.66927 13.0015C10.8893 13.0015 13.5026 10.5452 13.5026 7.53271C13.5026 4.52021 10.8893 2.06396 7.66927 2.06396Z"
                            fill="#8B0203"
                          />
                          <path
                            d="M14.6676 14.5644C14.5409 14.5644 14.4143 14.5206 14.3143 14.4269L12.9809 13.1769C12.7876 12.9956 12.7876 12.6956 12.9809 12.5144C13.1743 12.3331 13.4943 12.3331 13.6876 12.5144L15.0209 13.7644C15.2143 13.9456 15.2143 14.2456 15.0209 14.4269C14.9209 14.5206 14.7943 14.5644 14.6676 14.5644Z"
                            fill="#8B0203"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </form>{" "}
              </div>
              <div className="card-tools mt-1">
                <button
                  className="purple-btn2 rounded-3"
                  onClick={() => navigate("/amenities")}
                  aria-label="Add a new amenity"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={16}
                    height={16}
                    fill="currentColor"
                    className="bi bi-plus"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4" />
                  </svg>
                  <span>Add</span>
                </button>
              </div>
            </div>
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">New Amenities</h3>
              </div>
              <div className="card-body">
                {loading ? (
                  <p>Loading...</p>
                ) : error ? (
                  <p className="text-danger">{error}</p>
                ) : (
                  <div className="tbl-container mt-4 px-1">
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Icon</th>
                          <th>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(amenities) && amenities.length > 0 ? (
                          amenities.map((amenity, index) => (
                            <tr key={index}>
                              <td>{amenity.name || "No Name"}</td>
                              <td>
                                {amenity.icon_url ? (
                                  <img
                                    src={amenity.icon_url}
                                    alt={amenity.name || "No Name"}
                                    width="50"
                                    height="50"
                                  />
                                ) : (
                                  <span>No Icon</span>
                                )}
                              </td>
                              <td>
                                <button
                                  aria-label={`Edit ${amenity.name || "No Name"}`}
                                  style={{ background: "none", border: "none" }}
                                  onClick={() => {
                                    // Handle the edit action
                                    console.log(`Edit amenity: ${amenity.name}`);
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    className="bi bi-pencil-square"
                                    viewBox="0 0 16 16"
                                    onClick={() => navigate(`/edit-amenities/${amenity.id}`)}
                                  >
                                    <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                    <path
                                      fillRule="evenodd"
                                      d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                    />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="3" style={{ textAlign: "center" }}>
                              No amenities found
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

export default AmenitiesList;
