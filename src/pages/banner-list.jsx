import React from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import Footer from '../components/Footer';
import "../mor.css";
import { Link } from "react-router-dom";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SearchIcon from '../components/Icons/SearchIcon';

const BannerList = () => {

  const [toggleStates, setToggleStates] = useState([true, false]);
  const navigate = useNavigate();

  const handleToggle = (index) => {
    setToggleStates((prevStates) =>
      prevStates.map((state, i) => (i === index ? !state : state))
    );
  };

  return (
    <>
      <Header />
     <div className="main-content">
        <Sidebar/>
        
        <div className="website-content overflow-auto">
          <div className="module-data-section container-fluid">

        
                      {/* search and add button */}
                      
                <div className="d-flex mt-3 align-items-end px-3">
                  <div className="col-md-6 position-relative">
                    <form >
                      <div className="input-group">
                        <input
                          type="search"
                          id="searchInput"
                          className="tbl-search form-control"
                          placeholder="Type your keywords here"
                        // value={searchQuery}
                        // onChange={handleInputChange}
                        // onFocus={() => setIsSuggestionsVisible(true)}
                        // onBlur={() => setTimeout(() => setIsSuggestionsVisible(false), 200)}
                        />

                        <div className="input-group-append">
                          <button type="sumbit"

                            className="btn btn-md btn-default"
                          >
                            <SearchIcon />
                          </button>

                        </div>


                      </div>


                    </form>

                  </div>

                  <div className="col-md-6">
                    <div className="row justify-content-end">
                      {/* <div className="col-md-5">
                        <div className="row justify-content-end px-3">
                          <div className="col-md-3">
                            <button
                              style={{ color: "#de7008" }}
                              className="btn btn-md"
                            onClick={handleModalShow}
                            >
                              <FilterIcon />
                            </button>
                          </div>

                        </div>
                      </div> */}
                      <div className="col-md-4">
                        <button
                          className="purple-btn2"
                          onClick={() => navigate("/banner-add")}
                        >
                          <span className="material-symbols-outlined align-text-top">
                            
                          </span>
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                  
                        {/* {Table content} */}
                        <div className="card mx-3 mt-3">
                        
                         <div className="card-header3">
                           <h3 className="card-title">Banner List</h3>
                          
                            <div className="card-body mt-4 pb-4 ">
                            
                              <div className="tbl-container mt-3 px-3 ">
                                
                               <table className="w-100">

                               <thead>
                                <tr>
                               <th>Action</th>
                               <th>Site</th>
                               <th>Title</th>
                               <th>Banner</th>
                               <th>Status</th>
                               </tr>
                               </thead>

                               <tbody>
                                 <tr>
                                   <td></td>
                                   <td>Lockated, Pune</td>
                                   <td></td>
                                   <td><img src="" class="img-thumbnail" alt="..."/></td>
                                   <td>
                                      <div
                                         onClick={() => handleToggle(0)} // Toggle first row
                                         style={{ cursor: "pointer" }}>
                                         {toggleStates[0] ? (
                                         <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="30"
                                            height="30"
                                            fill="#E67E00"
                                            className="bi bi-toggle-on"
                                            viewBox="0 0 16 16">
                                            <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                                          </svg>
                                          ) : (
                                          <svg
                                             xmlns="http://www.w3.org/2000/svg"
                                             width="30"
                                             height="30"
                                             fill="gray"
                                             className="bi bi-toggle-off"
                                             viewBox="0 0 16 16">
                                            <path d="M11 3a5 5 0 0 1 0 10H5a5 5 0 0 1 0-10zm-6 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                                          </svg>
                                          )}
                                      </div>
                                      </td>    
                                </tr>

                                 <tr>
                                    <td></td>
                                    <td>Lockated, Pune</td>
                                    <td>See More Ways</td>
                                    <td><img src="" class="img-thumbnail" alt="..."/></td>
                                    <td>
                                    <div
                                        onClick={() => handleToggle(1)} // Toggle second row
                                        style={{ cursor: "pointer" }}>
                                        {toggleStates[1] ? (
                                        <svg
                                           xmlns="http://www.w3.org/2000/svg"
                                           width="30"
                                           height="30"
                                           fill="#E67E00"
                                           className="bi bi-toggle-on"
                                           viewBox="0 0 16 16">
                                           <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8" />
                                        </svg>
                                        ) : (
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="30"
                                            height="30"
                                            fill="gray"
                                            className="bi bi-toggle-off"
                                            viewBox="0 0 16 16">
                                            <path d="M11 3a5 5 0 0 1 0 10H5a5 5 0 0 1 0-10zm-6 9a4 4 0 1 0 0-8 4 4 0 0 0 0 8" />
                                         </svg>
                                         )}
                                      </div>
                                      </td>    
                                  </tr>
                             </tbody>
                        </table>
                    </div>
                </div>
                
            </div>
            </div>
            </div>
        <Footer />
         </div>
     </div>
    </>
  )
}

export default BannerList