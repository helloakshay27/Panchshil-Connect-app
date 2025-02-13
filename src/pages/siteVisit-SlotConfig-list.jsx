import React, { useState, useEffect } from "react";
import axios from "axios";

const SiteVisitSlotConfigList = () => {
  const [slots, setSlots] = useState([]);

  // Fetch site visit slot schedules
  const fetchSlots = async () => {
    try {
      const response = await axios.get(
        "https://panchshil-super.lockated.com/site_schedule/all_site_schedule_slots.json",
        {
          headers: {
            Authorization: `Bearer 4DbNsI3Y_weQFh2uOM_6tBwX0F9igOLonpseIR0peqs`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data && response.data.slots) {
        setSlots(response.data.slots);
      } else {
        setSlots([]);
      }
    } catch (error) {
      console.error(
        "Error fetching site visit slots:",
        error.response?.data || error.message
      );
      setSlots([]);
    }
  };

  // Fetch data when the component mounts
  useEffect(() => {
    fetchSlots();
  }, []);

  return (
    <div className="main-content">
      <div className="website-content overflow-auto">
        <div className="module-data-section p-3">
          <div className="card mt-3 pb-4 mx-4">
            <div className="card-header">
              <h3 className="card-title">Site Visit Slot Config List</h3>
            </div>
            <div className="card-body mt-3 pb-4 pt-0">
              <div className="tbl-container mt-4 ">
                <table className="w-100">
                  <thead>
                    <tr>
                      <th>Sr</th>
                      <th>Project Id</th>
                      <th>Scheduled Date</th>
                      <th>AM PM Timing</th>
                    </tr>
                  </thead>
                  <tbody>
                    {slots.length > 0 ? (
                      slots.map((slot, index) => (
                        <tr key={slot.id || index}>
                          <td>{index + 1}</td>
                          <td>{slot.project_id}</td>
                          <td>{slot.scheduled_date}</td>
                          <td>{slot.ampm_timing}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="text-center">
                          No data available
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SiteVisitSlotConfigList;
