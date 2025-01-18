import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";

const BannerAdd = () => {
  return (
    <>
      <Header />
      <div className="main-content">
        <Sidebar />
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-3 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">New Banner</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Site Name</label>
                      <select
                        className="form-control form-select"
                        style={{ width: "100%" }}
                      >
                        <option selected="selected">Alabama</option>
                        <option>Alaska</option>
                        <option>California</option>
                        <option>Delaware</option>
                        <option>Tennessee</option>
                        <option>Texas</option>
                        <option>Washington</option>
                      </select>
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Banner<span />
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        placeholder="Default input"
                        onchange="uploadFile(this)"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <form>
              {/* Site Name */}
              <div className="mb-3 text-start">
                <label htmlFor="siteName" className="form-label">
                  Site Name
                </label>
                <select id="status" className="form-select"></select>
              </div>

              {/* Banner Upload */}
              <div className="mb-3 text-start">
                <label htmlFor="bannerFile" className="form-label">
                  Banner
                </label>
                <input type="file" id="bannerFile" className="form-control" />
              </div>

              {/* Status */}
              <div className="mb-3 text-start">
                <label htmlFor="status" className="form-label">
                  Status
                </label>
                <select id="status" className="form-select">
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Banner URL */}
              <div className="mb-3 text-start">
                <label htmlFor="bannerUrl" className="form-label">
                  Banner URL
                </label>
                <input
                  type="text"
                  id="bannerUrl"
                  className="form-control"
                  placeholder="Enter banner URL"
                />
              </div>

              {/* Submit Button */}
              <div className="text-center">
                <button type="submit" className="purple-btn2">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default BannerAdd;
