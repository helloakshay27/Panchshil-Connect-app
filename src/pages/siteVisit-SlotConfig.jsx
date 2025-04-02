import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import SelectBox from "../components/base/SelectBox";

const SiteVisitSlotConfig = () => {
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [loading, setLoading] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    if (!startHour && startHour !== 0) {
      toast.error("Start hour is required.");
      setLoading(false);
      return;
    }
    if (!startMinute && startMinute !== 0) {
      toast.error("Start minute is required.");
      setLoading(false);
      return;
    }
    if (!endHour && endHour !== 0) {
      toast.error("End hour is required.");
      setLoading(false);
      return;
    }
    if (!endMinute && endMinute !== 0) {
      toast.error("End minute is required.");
      setLoading(false);
      return;
    }

    const postData = {
      start_hour: startHour,
      start_minute: startMinute,
      end_hour: endHour,
      end_minute: endMinute,
    };

    try {
      const response = await axios.post(
        "https://panchshil-super.lockated.com/site_schedules",
        postData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("access_token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Slot created successfully!");
      console.log("Data successfully submitted:", response.data);
      navigate("/setup-member/siteslot-list");
    } catch (error) {
      console.error(
        "Error submitting data:",
        error.response?.data || error.message
      );
      toast.error("Failed to create slot. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const navigate = useNavigate();
  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <div className="module-data-section p-3">
            <form onSubmit={handleSubmit}>
              <div className="card mt-4 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Create Site Slot</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Start Hours *</label>
                        <SelectBox
                          options={hours.map((hour) => ({
                            label: hour.toString().padStart(2, "0"),
                            value: hour,
                          }))}
                          defaultValue={startHour}
                          onChange={(value) => setStartHour(value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>Start Minutes *</label>
                        <SelectBox
                          options={minutes.map((minute) => ({
                            label: minute.toString().padStart(2, "0"),
                            value: minute,
                          }))}
                          defaultValue={startMinute}
                          onChange={(value) => setStartMinute(value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>End Hours *</label>
                        <SelectBox
                          options={hours.map((hour) => ({
                            label: hour.toString().padStart(2, "0"),
                            value: hour,
                          }))}
                          defaultValue={endHour}
                          onChange={(value) => setEndHour(value)}
                        />
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="form-group">
                        <label>End Minutes *</label>
                        <SelectBox
                          options={minutes.map((minute) => ({
                            label: minute.toString().padStart(2, "0"),
                            value: minute,
                          }))}
                          defaultValue={endMinute}
                          onChange={(value) => setEndMinute(value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="row mt-2 justify-content-center">
                <div className="col-md-2">
                  <button
                    type="submit"
                    className="purple-btn2 w-100"
                    disabled={loading}
                  >
                    Submit
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
  );
};

export default SiteVisitSlotConfig;
