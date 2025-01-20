 import React from 'react'
 import Header from '../components/Header'
 import Sidebar from '../components/Sidebar'
 import Footer from '../components/Footer';
 import "../mor.css";
 import { Link } from "react-router-dom";
 
 
 const Members = () => {
   return (
    <>
    <Header />
    <div className="main-content">
      <Sidebar />
      <div className="website-content overflow-auto">
        <div className="module-data-section container-fluid">
          <h1>Panchshil connect app</h1>
          <ul>
            <li>
            <Link to="/project-details-create">Project Details Create</Link>
            </li>
            <li>
                <Link to="/project-details-list">Project Details list </Link>
            </li>
            <li>
                <Link to="/banner-list">Banner List </Link>
            </li>
            <li>
                <Link to="banner-add">Banner Add </Link>
            </li>
            <li>
              <Link to="amenities">Amenities</Link>
            </li>
            {/* {<li>
                <Link to="/banner-add">Banner Add </Link>
            </li> } */}
            <li>
              <Link to="/gallery">Gallery</Link>
            </li>
          </ul>
         
        </div>
        <Footer />
      </div>
    </div>
  </>
   )
 }
 
 export default Members