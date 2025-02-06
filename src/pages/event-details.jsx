import React, { useEffect, useState } from "react";
import axios from "axios";

const EventDetails = () => {
  // State to store event data
  const [eventData, setEventData] = useState(null);

  // Fetch event details based on the ID (assuming you're passing the event ID)
  const eventId = 4; // Replace with dynamic ID from URL or props

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/events/${eventId}.json`
        );
        setEventData(response.data);
      } catch (error) {
        console.error("Error fetching event data", error);
      }
    };

    fetchEventData();
  }, [eventId]);

  // If event data is not yet loaded, show a loading state
  if (!eventData) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <div className="main-content">
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">
            <div className="module-data-section p-3">
              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header3">
                  <h3 className="card-title">Event Details</h3>
                  <div className="card-body">
                    <div className="row px-3">
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Type</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Name</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event At</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event From</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event To</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>RSVP Action</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Description</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Publish</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event User ID</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Comment</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Shared</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Shared Groups</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">:</span>
                            </span>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Event Image */}
              <div className="card mt-3 pb-4 mx-4">
                <div className="card-header">
                  <h3 className="card-title">Event Image</h3>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-12">
                      <img
                        src={eventData.attachfile.document_url}
                        alt="Event Image"
                        className="img-fluid"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EventDetails;
