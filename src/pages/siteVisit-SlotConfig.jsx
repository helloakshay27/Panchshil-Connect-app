import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Clock } from "lucide-react";
import SelectBox from "../components/base/SelectBox";
import { baseURL } from "./baseurl/apiDomain";
import { useConnectEvents } from "../hooks/useConnectEvents";
import "./banner-add.css";

const SiteVisitSlotConfig = () => {
  const connectEvents = useConnectEvents();
  const navigate = useNavigate();
  const [startHour, setStartHour] = useState("");
  const [startMinute, setStartMinute] = useState("");
  const [endHour, setEndHour] = useState("");
  const [endMinute, setEndMinute] = useState("");
  const [loading, setLoading] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i);

  const hourOptions = hours.map((hour) => ({
    label: hour.toString().padStart(2, "0"),
    value: hour,
  }));
  const minuteOptions = minutes.map((minute) => ({
    label: minute.toString().padStart(2, "0"),
    value: minute,
  }));

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

    const formData = new FormData();
    formData.append("site_schedule[start_hour]", startHour);
    formData.append("site_schedule[start_minute]", startMinute);
    formData.append("site_schedule[end_hour]", endHour);
    formData.append("site_schedule[end_minute]", endMinute);

    try {
      await axios.post(`${baseURL}site_schedules`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      connectEvents.onRecordSaved({ mode: "added" });
      toast.success("Slot created successfully!");
      navigate("/setup-member/visitslot-list");
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

  return (
    <div className="main-content">
      <div className="module-data-section banner-form-page p-3">
        <form onSubmit={handleSubmit}>
          <div className="card banner-form-card mt-3 pb-4">
            <div className="card-header banner-form-section-header">
              <h3 className="banner-form-section-heading">
                <span className="banner-form-section-icon" aria-hidden="true">
                  <Clock size={16} strokeWidth={1.8} />
                </span>
                Create Visit Slot
              </h3>
            </div>
            <div className="card-body">
              <div className="row banner-form-fields">
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Start Hours"
                      required
                      options={hourOptions}
                      value={startHour}
                      onChange={(value) => setStartHour(value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="Start Minutes"
                      required
                      options={minuteOptions}
                      value={startMinute}
                      onChange={(value) => setStartMinute(value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="End Hours"
                      required
                      options={hourOptions}
                      value={endHour}
                      onChange={(value) => setEndHour(value)}
                    />
                  </div>
                </div>
                <div className="col-md-3">
                  <div className="form-group">
                    <SelectBox
                      label="End Minutes"
                      required
                      options={minuteOptions}
                      value={endMinute}
                      onChange={(value) => setEndMinute(value)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="banner-form-actions">
            <button
              type="submit"
              className="banner-form-action-btn"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
            <button
              type="button"
              className="banner-form-action-btn"
              onClick={() => navigate(-1)}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SiteVisitSlotConfig;
