import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { baseURL } from "./baseurl/apiDomain";
import axios from "axios";
import toast from "react-hot-toast";

const SMTPSettingsList = () => {
  const [smtpSetting, setSmtpSetting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    fetchSMTPSettings();
  }, []);

  const fetchSMTPSettings = async () => {
    setLoading(true);
    setError("");
    try {
      console.log(
        "Fetching SMTP settings from:",
        `${baseURL}/smtp_settings.json`
      );
      console.log(
        "Access token:",
        localStorage.getItem("access_token") ? "Present" : "Missing"
      );

      const response = await fetch(`${baseURL}/smtp_settings.json`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("access_token")}`,
          "Content-Type": "application/json",
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.log("Error response body:", errorText);

        if (response.status === 401) {
          setError("Unauthorized: Please check your API key or token.");
        } else if (response.status === 404) {
          setError("SMTP settings not found.");
        } else {
          setError(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Check if response has content
      const contentType = response.headers.get("content-type");
      console.log("Content-Type:", contentType);

      if (!contentType || !contentType.includes("application/json")) {
        const textData = await response.text();
        console.log("Non-JSON response:", textData);
        setError("Invalid response format. Expected JSON.");
        return;
      }

      const data = await response.json();
      console.log("Full API Response:", JSON.stringify(data, null, 2));

      // Handle different possible response structures
      let settingData = null;

      if (data && typeof data === "object") {
        // Try different possible structures
        settingData =
          data.smtp_setting || data.smtp_settings || data.setting || data;

        // If it's an array, take the first item
        if (Array.isArray(settingData) && settingData.length > 0) {
          settingData = settingData[0];
        }

        // Check if settingData has the expected properties
        if (
          settingData &&
          typeof settingData === "object" &&
          (settingData.address || settingData.email || settingData.port)
        ) {
          console.log("SMTP setting found:", settingData);
          setSmtpSetting(settingData);
        } else {
          console.log("No valid SMTP setting found in response");
          setSmtpSetting(null);
        }
      } else {
        console.log("Invalid response structure");
        setSmtpSetting(null);
      }
    } catch (error) {
      console.error("Error fetching SMTP settings:", error);
      if (error.name === "SyntaxError") {
        setError("Invalid JSON response from server.");
      } else if (error.message.includes("Failed to fetch")) {
        setError("Network error: Unable to connect to server.");
      } else {
        setError(`Failed to fetch SMTP settings: ${error.message}`);
      }
      setSmtpSetting(null);
    } finally {
      setLoading(false);
    }
  };

  const maskPassword = (password) => {
    if (!password) return "-";
    return "*".repeat(password.length);
  };

  const handleEdit = (id) => {
    navigate(`/setup-member/smtp-settings-edit/${id}`);
  };

  const handleCreate = () => {
    navigate("/smtp-settings-create");
  };

  return (
    <div className="main-content">
      <div className="module-data-section container-fluid">
        {error && <div className="alert alert-danger">{error}</div>}

        <div className="d-flex justify-content-end px-4 pt-2 mt-3">
          {/* <div className="card-tools mt-1"> */}
          <div className="col-md-4 pe-2 pt-2">
            <div className="input-group">
              <input
                type="text"
                className="form-control tbl-search table_search"
                placeholder="Search"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPagination((prev) => ({ ...prev, current_page: 1 }));
                }}
              />
              <div className="input-group-append">
                <button type="submit" className="btn btn-md btn-default">
                  <svg
                    width={16}
                    height={16}
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M7.66927 13.939C3.9026 13.939 0.835938 11.064 0.835938 7.53271C0.835938 4.00146 3.9026 1.12646 7.66927 1.12646C11.4359 1.12646 14.5026 4.00146 14.5026 7.53271C14.5026 11.064 11.4359 13.939 7.66927 13.939ZM7.66927 2.06396C4.44927 2.06396 1.83594 4.52021 1.83594 7.53271C1.83594 10.5452 4.44927 13.0015 7.66927 13.0015C10.8893 13.0015 13.5026 10.5452 13.5026 7.53271C13.5026 4.52021 10.8893 2.06396 7.66927 2.06396Z"
                      fill="#8B0203"
                    />
                    <path
                      d="M14.6676 14.5644C14.5409 14.5644 14.4143 14.5206 14.3143 14.4269L12.9809 13.1769C12.7876 12.9956 12.7876 12.6956 12.9809 12.5144C13.1743 12.3331 13.4943 12.3331 13.6876 12.5144L15.0209 13.7644C15.2143 13.9456 15.2143 14.2456 15.0209 14.4269C14.9209 14.5206 14.7943 14.5644 14.6676 14.5644Z"
                      fill="#8B0203"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          {/* {smtpSetting ? (
              <button
                className="purple-btn2 rounded-3 me-2"
                onClick={handleEdit}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    d="M13.93 6.46611L8.7982 11.5979C8.68827 11.7078 8.62708 11.862 8.62708 12.0183L8.67694 14.9367C8.68261 15.2495 8.93534 15.5023 9.24815 15.5079L12.1697 15.5578H12.1788C12.3329 15.5578 12.4803 15.4966 12.5879 15.3867L19.2757 8.69895C19.9341 8.0405 19.9341 6.96723 19.2757 6.30879L17.8806 4.91368C17.561 4.59407 17.1349 4.4173 16.6849 4.4173C16.2327 4.4173 15.8089 4.5941 15.4893 4.91368L13.93 6.46611ZM11.9399 14.3912L9.8274 14.3561L9.79227 12.2436L14.3415 7.69443L16.488 9.84091L11.9399 14.3912ZM16.3066 5.73151C16.5072 5.53091 16.8574 5.53091 17.058 5.73151L18.4531 7.12662C18.6593 7.33288 18.6593 7.66948 18.4531 7.87799L17.3096 9.0215L15.1631 6.87502L16.3066 5.73151Z"
                    fill="currentColor"
                  />
                  <path
                    d="M7.42035 20H16.5797C18.4655 20 20 18.4655 20 16.5797V12.0012C20 11.6816 19.7393 11.4209 19.4197 11.4209C19.1001 11.4209 18.8395 11.6816 18.8395 12.0012V16.582C18.8395 17.8264 17.8274 18.8418 16.5797 18.8418H7.42032C6.17593 18.8418 5.16048 17.8298 5.16048 16.582V7.42035C5.16048 6.17596 6.17254 5.16051 7.42032 5.16051H12.2858C12.6054 5.16051 12.866 4.89985 12.866 4.58026C12.866 4.26066 12.6054 4 12.2858 4H7.42032C5.53449 4 4 5.53452 4 7.42032V16.5797C4.00227 18.4677 5.53454 20 7.42035 20Z"
                    fill="currentColor"
                  />
                </svg>
                <span className="ms-1">Edit</span>
              </button>
            ) : (
              <button
                className="purple-btn2 rounded-3"
                onClick={handleCreate}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width={26}
                  height={20}
                  fill="currentColor"
                  className="bi bi-plus"
                  viewBox="0 0 16 16"
                >
                  <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                </svg>
                <span>Add SMTP Settings</span>
              </button>
            )} */}
          {/* </div> */}
        </div>

        <div className="card mt-3 pb-4 mx-4">
          <div className="card-header">
            <h3 className="card-title">SMTP Settings List</h3>
          </div>
          <div className="card-body mt-4 pb-4 pt-0">
            {loading ? (
              <div className="text-center">
                <div
                  className="spinner-border"
                  role="status"
                  style={{ color: "var(--red)" }}
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : smtpSetting ? (
              <div className="tbl-container mt-4">
                <table className="w-100">
                  <thead>
                    <tr>
                      <th>Action</th>
                      <th>Address</th>
                      <th>Port</th>
                      <th>User Name</th>
                      {/* <th>Password</th> */}
                      {/* <th>Authentication</th> */}
                      <th>Email</th>
                      <th>Company Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <button
                          onClick={() => handleEdit(smtpSetting.id)}
                          className="btn btn-sm"
                          title="Edit SMTP Settings"
                          style={{
                            border: "none",
                            background: "none",
                            cursor: "pointer",
                            padding: "2px",
                          }}
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                          >
                            <path
                              d="M13.93 6.46611L8.7982 11.5979C8.68827 11.7078 8.62708 11.862 8.62708 12.0183L8.67694 14.9367C8.68261 15.2495 8.93534 15.5023 9.24815 15.5079L12.1697 15.5578H12.1788C12.3329 15.5578 12.4803 15.4966 12.5879 15.3867L19.2757 8.69895C19.9341 8.0405 19.9341 6.96723 19.2757 6.30879L17.8806 4.91368C17.561 4.59407 17.1349 4.4173 16.6849 4.4173C16.2327 4.4173 15.8089 4.5941 15.4893 4.91368L13.93 6.46611ZM11.9399 14.3912L9.8274 14.3561L9.79227 12.2436L14.3415 7.69443L16.488 9.84091L11.9399 14.3912ZM16.3066 5.73151C16.5072 5.53091 16.8574 5.53091 17.058 5.73151L18.4531 7.12662C18.6593 7.33288 18.6593 7.66948 18.4531 7.87799L17.3096 9.0215L15.1631 6.87502L16.3066 5.73151Z"
                              fill="#667085"
                            />
                            <path
                              d="M7.42035 20H16.5797C18.4655 20 20 18.4655 20 16.5797V12.0012C20 11.6816 19.7393 11.4209 19.4197 11.4209C19.1001 11.4209 18.8395 11.6816 18.8395 12.0012V16.582C18.8395 17.8264 17.8274 18.8418 16.5797 18.8418H7.42032C6.17593 18.8418 5.16048 17.8298 5.16048 16.582V7.42035C5.16048 6.17596 6.17254 5.16051 7.42032 5.16051H12.2858C12.6054 5.16051 12.866 4.89985 12.866 4.58026C12.866 4.26066 12.6054 4 12.2858 4H7.42032C5.53449 4 4 5.53452 4 7.42032V16.5797C4.00227 18.4677 5.53454 20 7.42035 20Z"
                              fill="#667085"
                            />
                          </svg>
                        </button>
                      </td>
                      <td>{smtpSetting.address || "-"}</td>
                      <td>{smtpSetting.port || "-"}</td>
                      <td>{smtpSetting.user_name || "-"}</td>
                      {/* <td>{maskPassword(smtpSetting.password)}</td> */}
                      {/* <td>
                        <span className="badge bg-secondary">
                          {smtpSetting.authentication || "-"}
                        </span>
                      </td> */}
                      <td>{smtpSetting.email || "-"}</td>
                      <td>{smtpSetting.company_name || "-"}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center mt-5">
                <div className="mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="64"
                    height="64"
                    fill="#ccc"
                    className="bi bi-envelope-x"
                    viewBox="0 0 16 16"
                  >
                    <path d="M2 2a2 2 0 0 0-2 2v8.01A2 2 0 0 0 2 14h5.5a.5.5 0 0 0 0-1H2a1 1 0 0 1-.966-.741l5.64-3.471L8 9.583l7-4.2V8.5a.5.5 0 0 0 1 0V4a2 2 0 0 0-2-2zm3.708 6.208L1 11.105V5.383zM1 4.217V4a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v.217l-7 4.2z" />
                    <path d="M16 12.5a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0m-4.854-1.354a.5.5 0 0 0 0 .708l.647.646-.647.646a.5.5 0 0 0 .708.708l.646-.647.646.647a.5.5 0 0 0 .708-.708L13.207 12.5l.647-.646a.5.5 0 0 0-.708-.708L12.5 11.793l-.646-.647a.5.5 0 0 0-.708 0" />
                  </svg>
                </div>
                <h5 className="text-muted">No SMTP Settings Found</h5>
                <p className="text-muted mb-4">
                  Configure your SMTP settings to enable email functionality.
                </p>
                <button
                  className="purple-btn2 rounded-3"
                  onClick={handleCreate}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width={20}
                    height={20}
                    fill="currentColor"
                    className="bi bi-plus me-1"
                    viewBox="0 0 16 16"
                  >
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"></path>
                  </svg>
                  Create SMTP Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SMTPSettingsList;
