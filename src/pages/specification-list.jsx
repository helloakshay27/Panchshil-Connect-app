import React, { useState, useEffect } from "react";
import axios from "axios";
import "../mor.css";
import { useNavigate } from "react-router-dom";

const SpecificationList = () => {
  const [specifications, setSpecifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get("https://panchshil-super.lockated.com/specification_setups.json")
      .then((response) => {
        if (
          response.data &&
          Array.isArray(response.data.specification_setups)
        ) {
          setSpecifications(response.data.specification_setups);
        } else {
          setSpecifications([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  // ✅ DELETE FUNCTION
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this specification?"
    );
    if (!confirmDelete) return;

    try {
      await axios.delete(
        `https://panchshil-super.lockated.com/specification_setups/${id}.json`
      );
      alert("Specification deleted successfully!");

      // ✅ Remove deleted item from UI
      setSpecifications((prevSpecs) =>
        prevSpecs.filter((spec) => spec.id !== id)
      );
    } catch (error) {
      alert("Error deleting specification. Please try again.");
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Specification List</h3>
            </div>
            <div className="card-body">
              {loading ? (
                <p>Loading...</p>
              ) : error ? (
                <p>Error: {error}</p>
              ) : (
                <div className="tbl-container mt-4 px-1">
                  <table className="w-100">
                    <thead>
                      <tr>
                        <th>Sr No</th>
                        <th>Name</th>
                        <th>Icon</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {specifications.length > 0 ? (
                        specifications.map((spec, index) => (
                          <tr key={spec.id}>
                            <td>{index + 1}</td>
                            <td>{spec.name || "N/A"}</td>
                            <td>
                              {spec.icon_url ? (
                                <img
                                  src={spec.icon_url}
                                  alt="icon"
                                  width={24}
                                  height={24}
                                />
                              ) : (
                                <span>No Icon</span>
                              )}
                            </td>
                            <td>
                              {/* ✅ EDIT BUTTON */}
                              <button
                                className=" btn-link"
                                onClick={() =>
                                  navigate(`/specification-update/${spec.id}`)
                                }
                                style={{
                                  background: "none",
                                  border: "none",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="24"
                                  height="24"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                >
                                  <path
                                    d="M13.93 6.46611L8.7982 11.5979C8.68827 11.7078 8.62708 11.862 8.62708 12.0183L8.67694 14.9367C8.68261 15.2495 8.93534 15.5023 9.24815 15.5079L12.1697 15.5578H12.1788C12.3329 15.5578 12.4803 15.4966 12.5879 15.3867L19.2757 8.69895C19.9341 8.0405 19.9341 6.96723 19.2757 6.30879L17.8806 4.91368C17.561 4.59407 17.1349 4.4173 16.6849 4.4173C16.2327 4.4173 15.8089 4.5941 15.4893 4.91368L13.93 6.46611C13.9334 6.46271 13.93 6.46271 13.93 6.46611ZM11.9399 14.3912L9.8274 14.3561L9.79227 12.2436L14.3415 7.69443L16.488 9.84091L11.9399 14.3912ZM16.3066 5.73151C16.5072 5.53091 16.8574 5.53091 17.058 5.73151L18.4531 7.12662C18.6593 7.33288 18.6593 7.66948 18.4531 7.87799L17.3096 9.0215L15.1631 6.87502L16.3066 5.73151Z"
                                    fill="#667085"
                                  />
                                  <path
                                    d="M7.42035 20H16.5797C18.4655 20 20 18.4655 20 16.5797V12.0012C20 11.6816 19.7393 11.4209 19.4197 11.4209C19.1001 11.4209 18.8395 11.6816 18.8395 12.0012V16.582C18.8395 17.8264 17.8274 18.8418 16.5797 18.8418H7.42032C6.17593 18.8418 5.16048 17.8298 5.16048 16.582V7.42035C5.16048 6.17596 6.17254 5.16051 7.42032 5.16051H12.2858C12.6054 5.16051 12.866 4.89985 12.866 4.58026C12.866 4.26066 12.6054 4 12.2858 4H7.42032C5.53449 4 4 5.53452 4 7.42032V16.5797C4.00227 18.4677 5.53454 20 7.42035 20Z"
                                    fill="#667085"
                                  />
                                </svg>
                              </button>

                              <button
                                className=" btn-link"
                                onClick={() => handleDelete(spec.id)}
                                style={{
                                  color: "black",
                                  border: "none",
                                  marginLeft: "10px",
                                  borderRadius: "5px",
                                }}
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  class="bi bi-trash3"
                                  viewBox="0 0 16 16"
                                >
                                  <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5" />
                                </svg>
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="4">No specifications found.</td>
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
  );
};

export default SpecificationList;
