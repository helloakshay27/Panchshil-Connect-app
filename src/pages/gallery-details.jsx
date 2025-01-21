import React, { useEffect, useState } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import "../mor.css";

const GalleryDetails = () => {
    return (
        <>
            <Header />
            <div className="main-content">
                <Sidebar />
                <div className="website-content overflow-auto">
                    <div className="module-data-section container-fluid">
                        <div className="details_page ">
                            <div className="row px-3 mt-4">
                                <div className="col-md-12 mb-3">
                                    <h5>Gallery Details</h5>
                                </div>
                                <div class="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                                    <div class="col-6 ">

                                        <label>Project Name</label>

                                    </div>
                                    <div class="col-6">
                                        <label class="text"><span class="me-3">:-</span>demo</label>
                                    </div>
                                </div>
                                <div class="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                                    <div class="col-6 ">

                                        <label>
                                            Gallery Name</label>

                                    </div>
                                    <div class="col-6">
                                        <label class="text"><span class="me-3">:-</span>Demo gallery</label>
                                    </div>
                                </div>
                                <div class="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                                    <div class="col-6 ">

                                        <label>Title</label>

                                    </div>
                                    <div class="col-6">
                                        <label class="text"><span class="me-3">:-</span>Demo Title</label>
                                    </div>
                                </div>
                                <div class="col-lg-6 col-md-6 col-sm-12 row px-3 ">
                                    <div class="col-6 ">

                                        <label>Name</label>

                                    </div>
                                    <div class="col-6">
                                        <label class="text"><span class="me-3">:-</span>Demo Name</label>
                                    </div>
                                </div>
                                <div className="col-lg-6 col-md-6 col-sm-12 row px-3">
                                    <div className="col-6">
                                        <label>Gallery File</label>
                                    </div>
                                    <div className="col-6">
                                        <label className="text">
                                            <span className="me-3">:-</span>
                                        </label>
                                        <img
                                            src="path/to/your/image.jpg"
                                            className="img-fluid"
                                            alt="Gallery Image"
                                        />
                                    </div>
                                </div>


                            </div>
                        </div>

                    </div>
                </div>
                <Footer />
            </div>
        </>
    )
}

export default GalleryDetails