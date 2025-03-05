import React, { useEffect, useState } from "react";
import SelectBox from "../components/base/SingleSelect";

const ProjectConfiguraion = () => {
  const [imagePreviews, setImagePreviews] = useState([]);
  const [formData, setFormData] = useState({
    attachment: [],
  });
  const [seeAll, setSeeAll] = useState(false);

  // file changes
  const handleFileChange = (event) => {
    const files = event.target.files;
    const fileArray = Array.from(files).map((file) =>
      URL.createObjectURL(file)
    );
    setImagePreviews((prevPreviews) => [...prevPreviews, ...fileArray]);

    // Add files to formData
    setFormData((prevData) => ({
      ...prevData,
      attachment: [...prevData.attachment, ...files],
    }));
  };

  // removing an image
  const handleRemoveImage = (index) => {
    setImagePreviews((prevPreviews) =>
      prevPreviews.filter((_, i) => i !== index)
    );
    setFormData((prevData) => ({
      ...prevData,
      attachment: prevData.attachment.filter((_, i) => i !== index),
    }));
  };

  // Log updated state of imagePreviews
  useEffect(() => {
    console.log(imagePreviews.length);
  }, [imagePreviews]);
  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="card mt-4 pb-4 mx-4">
              <div className="card-header">
                <h3 className="card-title">Project Configuraion</h3>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Name <span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="text"
                        name="name"
                        placeholder="Enter Name"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Status<span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <SelectBox />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>
                        Attachment <span style={{ color: "#de7008" }}> *</span>
                      </label>
                      <input
                        className="form-control"
                        type="file"
                        name="attachment"
                        multiple
                        onChange={handleFileChange}
                      />
                    </div>
                  </div>

                  <div className="row mt-3">
                    {(seeAll ? imagePreviews : imagePreviews.slice(0, 3)).map(
                      (preview, index) => (
                        <div key={index} className="col-md-1 position-relative">
                          <img
                            src={preview}
                            alt={`Preview ${index}`}
                            className="img-thumbnail mt-2"
                            style={{
                              maxWidth: "100px",
                              maxHeight: "100px",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            className="position-absolute border-0 rounded-circle d-flex align-items-center justify-content-center"
                            style={{
                              top: 2,
                              right: -5,
                              height: 20,
                              width: 20,
                              backgroundColor: "var(--red)",
                              color: "white",
                            }}
                            onClick={() => handleRemoveImage(index)}
                          >
                            x
                          </button>
                        </div>
                      )
                    )}
                    {imagePreviews.length > 3 && (
                      <span
                        className="mt-2"
                        style={{ cursor: "pointer" }}
                        onClick={() => setSeeAll(!seeAll)}
                      >
                        {seeAll ? "See Less" : "See All"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="row mt-3 justify-content-center">
              <div className="col-md-2">
                <button type="submit" className="purple-btn2-shadow w-100">
                  Submit
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProjectConfiguraion;
