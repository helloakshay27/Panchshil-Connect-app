import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";

const EventDetails = () => {
  const { id } = useParams();
  const [eventData, setEventData] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const eventId = id;
  console.log("ID", eventData);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const response = await axios.get(
          `https://panchshil-super.lockated.com/events/${eventId}}.json`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("access_token")}`,
              "Content-Type": "application/json",
            },
          }
        );
        setEventData(response.data);
      } catch (error) {
        //console.error("Error fetching event data", error);
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
              <div className="card mt-4 pb-4 mx-4">
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
                              <span className="text-dark">
                                {" "}
                                {eventData.event_type || "N/A"}{" "}
                              </span>
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
                              <span className="text-black">
                                {" "}
                                {eventData.event_name}{" "}
                              </span>
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
                              <span className="text-dark">
                                : {eventData.event_at}
                              </span>
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
                              <span className="text-dark">
                                :{" "}
                                {new Date(eventData.from_time).toLocaleString()}
                              </span>
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
                              <span className="text-dark">
                                : {new Date(eventData.to_time).toLocaleString()}
                              </span>
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
                              <span className="text-dark">
                                : {eventData.rsvp_action || "N/A"}
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>

                      {/* Add more fields as required */}
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Publish</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">
                                : {eventData.publish}
                              </span>
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
                              <span className="text-dark">
                                : {eventData.user_id}
                              </span>
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
                              <span className="text-dark">
                                : {eventData.comment}
                              </span>
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
                              <span className="text-dark">
                                : {eventData.shared}
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                        <div className="col-6 ">
                          <label>Event Share Groups</label>
                        </div>
                        <div className="col-6">
                          <label className="text">
                            <span className="me-3">
                              <span className="text-dark">
                                : {eventData.share_groups}
                              </span>
                            </span>
                          </label>
                        </div>
                      </div>
                      <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                        <div className="col-6">
                          <label>Event Description</label>
                        </div>
                        <div className="col-6">
                          <p
                            style={{
                              display: "-webkit-box",
                              WebkitLineClamp: isExpanded ? "unset" : 1, // Initially 1 line
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "normal",
                              cursor: "pointer",
                            }}
                            onClick={() => setIsExpanded(!isExpanded)}
                          >
                            : {eventData.description}
                            {!isExpanded && (
                              <span
                                style={{
                                  color: "black",
                                  cursor: "pointer",
                                  fontWeight: "bold",
                                }}
                              >
                                ... Show More
                              </span>
                            )}
                          </p>
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
                        src={eventData?.attachfile?.document_url || "NA"}
                        alt="Event Image"
                        className="img-fluid"
                        style={{
                          width: "300px",
                          height: "300px",
                          objectFit: "contain",
                          display: "block",
                        }}
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
