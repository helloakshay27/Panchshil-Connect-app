import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import SearchIcon from "../components/Icons/SearchIcon";
import axios from "axios";


const BannerList = () => {

  const [error, setError] = useState(null);
  const [banners, setBanners] = useState([]); // Renamed galleries to banners
  const [loading, setLoading] = useState(true);

  const [toggleStates, setToggleStates] = useState([true, false]);
  const navigate = useNavigate();

  const handleToggle = (index) => {
    setToggleStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state))
    );
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const response = await axios.get(
          "https://panchshil-super.lockated.com/banners.json"
        );
        console.log("response", response);
        setBanners(response.data.banners); // Assuming the API returns an object with a "banners" field
        setLoading(false);
      } catch (error) {
        console.error("Error fetching banners:", error);
        setError("Failed to fetch banners. Please try again later.");
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  console.log("data", banners)

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />

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
              <div className="card-tools">
                <button
                  className="purple-btn2 rounded-3"
                  fdprocessedid="xn3e6n"
                  onClick={() => navigate("/banner-add")}
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
                  <span>Add</span>
                </button>
              </div>
            </div>

            {/* {Table content} */}
            <div className="card mx-3 mt-4">
      <div className="card-header">
        <h3 className="card-title">Banner List</h3>
      </div>
      <div className="card-body mt-4 pb-4 pt-0">
        <div className="tbl-container mt-3">
          <table className="w-100">
            <thead>
              <tr>
                <th>Index</th>
                <th>Company ID</th>
                <th>Site</th>
                <th>Title</th>
                <th>Banner</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {/* Map over banners and display each banner's data */}
              {banners.map((banner, index) => (
                <tr key={index}>
                  <td>{index+1}</td>
                  <td>{banner.company_id || "N/A"}</td> 
                  <td>Lockated, Pune</td> 
                  <td>{banner.title || "No Title"}</td>
                  <td className="d-flex justify-content-center align-items-center"> 
                    
                    <img
                      src={banner?.attachfile?.document_url || "NA"}
                      className="img-fluid rounded"
                      alt={banner.title || "Banner Image"}
                      style={{ maxWidth: "100px", maxHeight: "100px" }}
                    />
                  </td>
                  <td>
                                <button
                                  className="btn "
                                  // onClick={() =>
                                  //   navigate(`/service-details/1`)
                                  // }
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    width="16"
                                    height="16"
                                    fill="currentColor"
                                    class="bi bi-eye"
                                    viewBox="0 0 16 16"
                                  >
                                    <path d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13 13 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5s3.879 1.168 5.168 2.457A13 13 0 0 1 14.828 8q-.086.13-.195.288c-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5s-3.879-1.168-5.168-2.457A13 13 0 0 1 1.172 8z"></path>
                                    <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0"></path>
                                  </svg>{" "}
                                </button>
                          </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
          </div>
          <Footer />
        </div>
      </div>
    </>
  );
};

export default BannerList;
