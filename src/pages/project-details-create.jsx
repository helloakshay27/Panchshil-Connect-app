// function App() {
//     const [formData, setFormData] = useState({
//       Property_Type: "",
//       SFDC_Project_Id: "",
//       Project_Construction_Status: "",
//       Configuration_Type: "",
//       Project_Name: "vat test1",
//       Location: "test location",
//       Project_Description: "",
//       Price_Onward: "",
//       Project_Size_Sq_Mtr: 100,
//       Project_Size_Sq_Ft: "",
//       Rera_Carpet_Area_Sq_M: "",
//       Rera_Carpet_Area_sqft: "",
//       Number_Of_Towers: "",
//       Number_Of_Units: "",
//       Rera_Number: "",
//       Amenities: "value1,value3, val",
//       Specifications: "value1,value2",
//       Land_Area: "",
//       Address: {
//         address_line_1: "line 1",
//         address_line_2: "line 2",
//         address_line_3: "line 3",
//         city: "Pune",
//         state: "Maharashtra",
//         pin_code: 400709,
//         country: "India",
//       },
//     });
  
//     const handleChange = (e) => {
//       const { name, value } = e.target;
  
//       if (name.includes("Address.")) {
//         const addressField = name.split(".")[1];
//         setFormData((prev) => ({
//           ...prev,
//           Address: { ...prev.Address, [addressField]: value },
//         }));
//       } else {
//         setFormData((prev) => ({
//           ...prev,
//           [name]: value,
//         }));
//       }
//     };
  
//     const handleSubmit = (e) => {
//       e.preventDefault();
//       console.log("Submitted Data:", formData);
//     };
  
//     return (
//       <form onSubmit={handleSubmit}>
//         <h2>Project Details</h2>
  
//         <label>
//           Property Type:
//           <input
//             type="text"
//             name="Property_Type"
//             value={formData.Property_Type}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           SFDC Project ID:
//           <input
//             type="text"
//             name="SFDC_Project_Id"
//             value={formData.SFDC_Project_Id}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Project Construction Status:
//           <input
//             type="text"
//             name="Project_Construction_Status"
//             value={formData.Project_Construction_Status}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Configuration Type:
//           <input
//             type="text"
//             name="Configuration_Type"
//             value={formData.Configuration_Type}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Project Name:
//           <input
//             type="text"
//             name="Project_Name"
//             value={formData.Project_Name}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Location:
//           <input
//             type="text"
//             name="Location"
//             value={formData.Location}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Project Description:
//           <textarea
//             name="Project_Description"
//             value={formData.Project_Description}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Price Onward:
//           <input
//             type="text"
//             name="Price_Onward"
//             value={formData.Price_Onward}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Project Size (Sq. Mtr):
//           <input
//             type="number"
//             name="Project_Size_Sq_Mtr"
//             value={formData.Project_Size_Sq_Mtr}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Project Size (Sq. Ft):
//           <input
//             type="text"
//             name="Project_Size_Sq_Ft"
//             value={formData.Project_Size_Sq_Ft}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Rera Carpet Area (Sq. M):
//           <input
//             type="text"
//             name="Rera_Carpet_Area_Sq_M"
//             value={formData.Rera_Carpet_Area_Sq_M}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Rera Carpet Area (Sq. Ft):
//           <input
//             type="text"
//             name="Rera_Carpet_Area_sqft"
//             value={formData.Rera_Carpet_Area_sqft}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Number Of Towers:
//           <input
//             type="text"
//             name="Number_Of_Towers"
//             value={formData.Number_Of_Towers}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Number Of Units:
//           <input
//             type="text"
//             name="Number_Of_Units"
//             value={formData.Number_Of_Units}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Rera Number:
//           <input
//             type="text"
//             name="Rera_Number"
//             value={formData.Rera_Number}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Amenities:
//           <input
//             type="text"
//             name="Amenities"
//             value={formData.Amenities}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Specifications:
//           <input
//             type="text"
//             name="Specifications"
//             value={formData.Specifications}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Land Area:
//           <input
//             type="text"
//             name="Land_Area"
//             value={formData.Land_Area}
//             onChange={handleChange}
//           />
//         </label>
  
//         <h3>Address</h3>
//         <label>
//           Address Line 1:
//           <input
//             type="text"
//             name="Address.address_line_1"
//             value={formData.Address.address_line_1}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Address Line 2:
//           <input
//             type="text"
//             name="Address.address_line_2"
//             value={formData.Address.address_line_2}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Address Line 3:
//           <input
//             type="text"
//             name="Address.address_line_3"
//             value={formData.Address.address_line_3}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           City:
//           <input
//             type="text"
//             name="Address.city"
//             value={formData.Address.city}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           State:
//           <input
//             type="text"
//             name="Address.state"
//             value={formData.Address.state}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Pin Code:
//           <input
//             type="number"
//             name="Address.pin_code"
//             value={formData.Address.pin_code}
//             onChange={handleChange}
//           />
//         </label>
  
//         <label>
//           Country:
//           <input
//             type="text"
//             name="Address.country"
//             value={formData.Address.country}
//             onChange={handleChange}
//           />
//         </label>
  
//         <button type="submit">Submit</button>
//       </form>
//     );
//   };
import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer';
import "../mor.css";
import { Link } from "react-router-dom";

const ProjectDetailsCreate = () => {
  return (
    <>
      <Header />
     <div className="main-content">
        <Sidebar/>
     <div className="website-content overflow-auto">
     <div className="module-data-section container-fluid">
        <h1>Project Detaildsds Create</h1>
        </div>
        <Footer />
         </div>

     </div>
    </>
  )
}

export default ProjectDetailsCreate