import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ProjectDetailsList = () => {
  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />

        <div className="website-content overflow-auto">
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
                onClick={() => navigate("")}
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
          <div className="module-data-section container-fluid">
            <div className="card mx-3 mt-4">
              <div className="card-header3">
                <h3 className="card-title">Project Details</h3>
                <div className="card-body mt-4 pb-4 pt-0">
                  <div className="tbl-container mt-4 px-1">
                    <table className="w-100">
                      <thead>
                        <tr>
                          <th>Property Type</th>
                          <th>SFDC Project ID</th>
                          <th>Project Construction Status</th>
                          <th>Configuration Type</th>
                          <th>Project Name:</th>
                          <th>Location:</th>
                          <th>Project Description:</th>
                          <th>Price Onward:</th>
                          <th colSpan={3}>Project Size (Sq. Mtr):</th>
                          <th>Project Size (Sq. Ft):</th>
                          <th>Rera Carpet Area (Sq. M):</th>
                          <th>Rera Carpet Area (Sq. Ft):</th>
                          <th>Number Of Towers:</th>
                          <th>Number Of Units:</th>
                          <th>Rera Number:</th>
                          <th>Amenities:</th>
                          <th>Specifications:</th>
                          <th>Land Area:</th>
                          <th>Address Line 1:</th>
                          <th>Address Line 2:</th>
                          <th> Address Line 3:</th>
                          <th>City:</th>
                          <th>State:</th>
                          <th>Pin Code:</th>
                          <th>Country:</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
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

export default ProjectDetailsList;
