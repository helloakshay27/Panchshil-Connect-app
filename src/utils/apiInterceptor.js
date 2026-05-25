import axios from "axios";

function clearAuthAndRedirect() {
  localStorage.removeItem("access_token");
  localStorage.removeItem("authToken");
  localStorage.removeItem("token");
  window.location.href = "/login";
}

axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.config?.headers?.Authorization
    ) {
      clearAuthAndRedirect();
    }
    return Promise.reject(error);
  }
);

const originalFetch = window.fetch;
window.fetch = async function (input, init) {
  const response = await originalFetch.call(window, input, init);
  if (
    response.status === 401 &&
    init?.headers?.Authorization?.startsWith?.("Bearer ")
  ) {
    clearAuthAndRedirect();
    throw new Error("Session expired. Redirecting to login...");
  }
  return response;
};
