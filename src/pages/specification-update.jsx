import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";

const SpecificationUpdate = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [setupName, setSetupName] = useState("");
  const [icon, setIcon] = useState(null);
  // alert(id);

  useEffect(() => {
    axios
      .get(
        `http://panchshil-super.lockated.com/specification_setups/${id}.json`
      )
      .then((response) => {
        setSetupName(response.data.name);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, [id]);
  const handleCancel = () => {
    setSetupName("");
    setIcon(null);
    navigate(-1)
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("specification_setup[name]", setupName);
    if (icon) formData.append("icon", icon);

    try {
      await axios.put(
        `https://panchshil-super.lockated.com/specification_setups/${id}.json`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      alert("Specification updated successfully!");
      navigate("/specification-list");
    } catch (error) {
      console.error("Error updating specification:", error);
    }
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Specification Update</h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        className="form-control"
                        type="text"
                        value={setupName}
                        onChange={(e) => setSetupName(e.target.value)}
                        placeholder="Enter name"
                      />
                    </div>
                  </div>
                  <div className="col-md-3">
                    <div className="form-group">
                      <label>Icon</label>
                      <input
                        className="form-control"
                        type="file"
                        accept=".png,.jpg,.jpeg,.svg"
                        onChange={(e) => setIcon(e.target.files[0])}
                      />
                    </div>
                  </div>
                </div>
                <div className="row mt-2 justify-content-center">
                  <div className="col-md-2">
                    <button type="submit" className="purple-btn2 w-100">
                      Update
                    </button>
                  </div>
                  <div className="col-md-2">
                    <button
                      type="button"
                      className="purple-btn2 w-100"
                      onClick={handleCancel}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecificationUpdate;
