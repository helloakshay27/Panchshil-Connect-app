import React, { useState } from "react";

import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";

const Testimonial = () => {
  return (
    <>
      {/* <Header /> */}
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section p-3">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Testimonials</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label> ID</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder=" Input ID"
                        name="Id"
                      />
                    </div>
                  </div>

                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>User Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Username"
                        name="userName"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>User Type</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="User Type"
                        name="userType"
                      />
                    </div>
                  </div>

                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Content</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Content"
                        name="content"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Company Setup ID</label>
                      <input
                        className="form-control"
                        type="number"
                        placeholder="1"
                        name="companySetupId"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Company Name</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Company Name"
                        name="companyName"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Created At</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Created At"
                        name="createdAt"
                      />
                    </div>
                  </div>
                  <div className="col-md-3 mt-2">
                    <div className="form-group">
                      <label>Updated At</label>
                      <input
                        className="form-control"
                        type="text"
                        placeholder="Updated At"
                        name="updatedAt"
                      />
                    </div>
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

export default Testimonial;
