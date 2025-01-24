import React from "react";

const EditGallery = () => {
  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="card mx-4 mt-3">
            <div className="card-header">
              <h3 className="card-title">Edit Gallery</h3>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Gallery Type</label>
                    <select
                      className="form-control form-select"
                      name="galleryType"
                      style={{ width: "100%" }}
                    >
                      <option value="">Select a Gallery Type</option>
                      <option value={1}>Type 1</option>
                      <option value={2}>Type 2</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Project ID</label>
                    <select
                      className="form-control form-select"
                      name="projectId"
                      style={{ width: "100%" }}
                    >
                      <option value="">Select a Project ID</option>
                      <option value={1}>Project 1</option>
                      <option value={2}>Project 2</option>
                    </select>
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Name Title</label>
                    <input
                      className="form-control"
                      type="text"
                      name="name"
                      placeholder="Enter name"
                      defaultValue=""
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <label>Attachment File</label>
                    <input
                      className="form-control"
                      type="file"
                      name="attachment"
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

export default EditGallery;
