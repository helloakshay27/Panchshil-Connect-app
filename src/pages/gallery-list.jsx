import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const GalleryList = () => {
  const [galleryData, setGalleryData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  

  useEffect(() => {
    const fetchGalleryData = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/galleries.json?project_id=1"
        );
        console.log("API Response:", response.data.galleries);
        setGalleryData(Array.isArray(response.data.galleries) ? response.data.galleries : []);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching gallery data:", error);
        setIsLoading(false);
      }
    };

    fetchGalleryData();
  }, []);

const [toggleStates, setToggleStates] = useState([true, false]);
  const navigate = useNavigate();

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
                      fdprocessedid="u38fp"
                    />
                    <div className="input-group-append">
                      <button
                        type="submit"
                        className="btn btn-md btn-default"
                        fdprocessedid="2wqzh"
                      >
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
                  fdprocessedid="xn3e6n"
                  onClick={() => navigate("/new-gallery")}
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
                <h3 className="card-title">Gallery List</h3>
              </div>
              <div className="card-body">
                <div className="tbl-container mt-4 px-1">
                  {isLoading ? (
                    <p>Loading...</p>
                  ) : (
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th className="text-start">Sr No</th>
                          <th className="text-start">Title Name</th>
                          <th className="text-start">Project Name</th>
                          <th className="text-start">Gallery Type</th>
                          <th className="text-start">Created At</th>
                          <th className="text-start">Image</th>
                          <th className="text-start">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(galleryData) &&
                        galleryData.length > 0 ? (
                          galleryData.map((item, index) => (
                            <tr key={item.id}>
                              <td>{index + 1}</td>
                              <td>{item.title_name}</td>
                              <td>{item.project_name}</td>
                              <td>{item.gallery_type}</td>
                              <td>
                                {new Date(item.created_at).toLocaleDateString()}
                              </td>
                              <td>
                                <img
                                  src={item?.attachfile?.document_url}
                                  alt={item.title_name}
                                  style={{ width: "50px", height: "50px" }}
                                />
                              </td>
                              <td className="text-center">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="16"
                                  height="16"
                                  fill="currentColor"
                                  class="bi bi-pencil-square"
                                  viewBox="0 0 16 16"
                                  onClick={() => navigate(`/edit-gallery/${item.id}`)}
                                >
                                  <path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z" />
                                  <path
                                    fill-rule="evenodd"
                                    d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5z"
                                  />
                                </svg>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan="7">No data available</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default GalleryList;
