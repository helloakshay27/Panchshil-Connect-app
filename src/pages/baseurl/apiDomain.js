let baseURL = "";

const hostname = window.location.hostname;

switch (hostname) {
  case "ui-loyalty-super.lockated.com":
    baseURL = "https://dev-panchshil-super-app.lockated.com/";
    break;
  case "ui-panchshil-super.lockated.com":
    baseURL = "https://panchshil-super.lockated.com/";
    break;

  case "uat-connect.panchshil.com":
    baseURL = "https://uatapi-connect.panchshil.com/";
    break;

  case "connect.panchshil.com":
    baseURL = "https://api-connect.panchshil.com/";
    break;

  case "localhost":
    baseURL = "https://panchshil-super.lockated.com/"; 
    break;

  default:
    baseURL = "https://uatapi-connect.panchshil.com/"; 
    break;
}

console.log("Base URL:", baseURL, " | Hostname:", hostname);

const token = localStorage.getItem("access_token");

const LOGO_URL =
  "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Panchshil_logo.png";

const Rustomji_URL =
  "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Rustomjee_Logo-02_1.png";

const Rustomji_URL_Black =
  "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/logo.png";

const Rustomji_Favicon_URL =
  "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Rustomjee_icon.png";

const Panchshil_Favicon_URL =
  "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Panchshil_logo.png";

export {
  baseURL,
  token,
  LOGO_URL,
  Rustomji_URL,
  Rustomji_URL_Black,
  Rustomji_Favicon_URL,
  Panchshil_Favicon_URL,
};