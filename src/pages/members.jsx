import React from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
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
            <h1>Panchshil Connect App</h1>
            <ul>
              <li>
                <Link to="/project-create">Project Create</Link>
              </li>
              <li>
                <Link to="/project-list">Project List</Link>
              </li>
              <li>
                <Link to="/project-edit/2">Project Edit</Link>
              </li>
              <li>
                <Link to="/project-details/2">Project Details </Link>
              </li>

              <li>
                <Link to="/banner-list">Banner List</Link>
              </li>
              <li>
                <Link to="/banner-add">Banner Add</Link>
              </li>
              <li>
                <Link to="/amenities">Amenities</Link>
              </li>
              <li>
                <Link to="/testimonials">Testimonials</Link>
              </li>
              <li>
                <Link to="/testimonial-list">TestimonialList</Link>
              </li>
              <li>
                <Link to="/gallery">Gallery</Link>
              </li>
              <li>
                <Link to="/gallery-details">Gallery Details</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default Members;
