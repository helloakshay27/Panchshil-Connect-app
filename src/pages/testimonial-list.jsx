import React, { useState, useEffect } from "react";
import axios from "axios";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";

const TestimonialList = () => {
  return (
    <>
      {/* <Header /> */}
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Testimonials-List</h3>
              </div>
              <div className="card-body mt-4 pb-4 pt-0">
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
                      <tr>
                        <td></td>
                      </tr>
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

export default TestimonialList;
