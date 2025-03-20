import React from "react";

const PropertyType = () => {
  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-4 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Property Type</h3>
            </div>
            <div className="card-body">
              <div className="row">
                {/* Name Field */}
                <div className="col-md-3">
                  <div className="form-group">
                    <label>
                      Name{" "}
                      <span style={{ color: "#de7008", fontSize: "16px" }}>
                        *
                      </span>
                    </label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter name"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyType;
