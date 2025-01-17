import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer';
import "../mor.css";
import { Link } from "react-router-dom";

const ProjectDetailsList = () => {
  return (
     <>
     <Header />
     <div className="main-content">
        <Sidebar/>
     <div className="website-content overflow-auto">
     <div className="module-data-section container-fluid">
        <h1>project-details-list</h1>
        {/* start your work */}
        </div>
        <Footer />
         </div>

     </div>
     </>
  )
}

export default ProjectDetailsList