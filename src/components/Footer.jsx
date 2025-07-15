import React from "react";
import "../mor.css";
import { baseURL } from "../pages/baseurl/apiDomain";
const Footer = () => {
  const domain = baseURL;
  let logoUrl;
  let logoStyle = { height: "35px" };
  if (
    domain === "https://panchshil-super.lockated.com/" ||
    domain === "https://api-connect.panchshil.com/" || domain === "https://uatapi-connect.panchshil.com/"
  ) {
    logoUrl =
      "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Panchshil_logo.png";
    // Optional: style for Panchshil logo (if needed)
    logoStyle = { height: "35px", width: "30px" };
  } else {
    logoUrl =
      "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/logo.png";
    // Conditional style for Rustomjee logo
    logoStyle = { height: "40px", width: "90px" , filter: "grayscale(1)", background: "#fff", borderRadius: "4px" };
  }

  return (
    <footer className="footer">
      <p className="flex items-center gap-2 ">
        Powered by
        <img src={logoUrl} alt="Company Logo" className="mx-2" style={logoStyle} />
      </p>
    </footer>
  );
};

export default Footer;

// import React from "react";
// import "../mor.css";
// import { baseURL } from "../pages/baseurl/apiDomain";

// const Footer = () => {
//   const domain = baseURL;
//   const isDev =
//     domain === "https://dev-panchshil-super-app.lockated.com" ||
//     domain === "http://localhost:3000";
//   const isPanchshil =
//     domain === "https://panchshil-super.lockated.com" ||
//     domain === "https://api-connect.panchshil.com";

//   const logoUrl = isDev
//     ? "https://lockated-public.s3.ap-south-1.amazonaws.com/attachfiles/documents/158/original/Rustomjee_Logo-01_2.png"
//     : isPanchshil
//     ? "https://panchshil.gophygital.work/uploads/pms/company_setup/logo/226/Panchshil_logo.png"
//     : "https://lockated-public.s3.ap-south-1.amazonaws.com/attachfiles/documents/158/original/Rustomjee_Logo-01_2.png";

//   return (
//     <footer className="footer">
//       <p className="flex items-center gap-2">
//         Powered by
//         <img src={logoUrl} alt="Company Logo" style={{ height: "24px" }} />
//       </p>
//     </footer>
//   );
// };

// export default Footer;