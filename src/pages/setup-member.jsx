import React from 'react'

import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";
import { Link } from "react-router-dom";

const SetupMember = () => {
  return (
    <div>
        
        <>
              <div className="main-content  ">
                <div className="website-content overflow-auto">
                  <div className="module-data-section container-fluid">
                  <h1>Panchshil Setup Member </h1>
                    <ul>
                    <li>
                        <Link to="Role">User Role</Link>
                      </li>
                      <Link to="/setup-member/role-edit">Edit</Link>

                      <Link to="/setup-member/role-list">User Role List</Link>

                    <li>
                        <Link to="category-types">Category Type</Link>
                      </li>
                      <li>
                        <Link to="category-types-list">Category Type List</Link>
                      </li>
                      <li>
                        <Link to="category-types-edit">Category Type Edit</Link>
                      </li>
                    <li>
                        <Link to="property-type">Property Type</Link>
                      </li>
                      <li>
                        <Link to="property-type-edit">Property Type Edit</Link>
                      </li>
                      <li>
                        <Link to="property-type-list">Property Type List</Link>
                      </li>
                      <li>
                        <Link to="project-building-type">Project Building Type</Link>
                      </li>
                      <li>
                        <Link to="project-building-type-edit">Project Building Edit</Link>
                      </li>
                      <li>
                        <Link to="project-building-type-list">Project Building Type List</Link>
                      </li>
                      <li>
                        <Link to="construction-status">
                            Construction Status
                        </Link>
                      </li>
                      <li>
                        <Link to="construction-status-edit">
                            Construction Status Edit
                        </Link>
                      </li>
                      <li>
                        <Link to="construction-status-list">
                            Construction Status List
                        </Link>
                      </li>
                      <li>
                        <Link to="project-configuration">Project Configuraion</Link>
                      </li>
                      <li>
                        <Link to="project-config-edit">Project Configuraion Edit</Link>
                      </li>
                      <li>
                        <Link to="project-configuration-list">
                          Project Configuraion List
                        </Link>
                      </li>
                      
        
                      <li>
                        <Link to="amenities">Amenities Setup</Link>
                      </li>
                      <li>
                        <Link to="amenities-list">Amenities Setup List</Link>
                      </li>
                      <li>
                        <Link to="edit-amenities">Edit Amenities</Link>
                      </li>
                     
        
                      
                       
                       
                      <li>
                        <Link to="siteslot-create">Site Visit Slot Config</Link>
                      </li>
                      <li>
                        <Link to="siteslot-list">
                          Site Visit Slot Config List
                        </Link>
                      </li>
                      <li>
                        <Link to="tag-add">Tag</Link>
                      </li>
                      
                      
                      
                      
                      
        
        
        
                     
                    
                      <li className="pb-5">{/* add above this li */}</li>
                    </ul>
                  </div>
                </div>
              </div>
            </>
    </div>
  )
}

export default SetupMember  