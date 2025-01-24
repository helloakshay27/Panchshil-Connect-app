import React from "react";

const EditAmenities = () => {
  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="card mx-4 mt-3">
            <div className="card-header">
              <h3 className="card-title">Edit Amenities</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Name</label>
                    <input
                      className="form-control"
                      type="text"
                      placeholder="Enter name"
                      defaultValue=""
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Icon</label>
                    <input
                      type="file"
                      accept=".png,.jpg,.jpeg,.svg"
                      className="form-control"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row mt-2 justify-content-center">
            <div className="col-md-2">
              <button type="submit" className="purple-btn2 w-100">
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditAmenities;
