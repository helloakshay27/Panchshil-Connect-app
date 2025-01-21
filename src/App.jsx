import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./mor.css";
import { Link } from "react-router-dom";
import Members from "./pages/members";
import ProjectDetailsCreate from "./pages/project-details-create";
import BannerList from "./pages/banner-list";
import BannerAdd from "./pages/banner-add";
import ProjectDetailsList from "./pages/project-details-list";
import Amenities from "./pages/amenities";
import Testimonials from "./pages/testimonials";
import Gallery from "./pages/gallery";
import { Toast } from "bootstrap";
import { Toaster } from "react-hot-toast";
import ProjectDetailsEdit from "./pages/project-details-edit";
import TestimonialList from "./pages/testimonial-list";
import ProjectDetails from "./pages/project-details";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Members />} />
        <Route
          path="/project-create"
          element={<ProjectDetailsCreate />}
        />
        <Route path="/project-edit/:id" element={<ProjectDetailsEdit />} />
        <Route path="/project-details/:id" element={<ProjectDetails />} />


        <Route path="/project-list" element={<ProjectDetailsList />} />
        <Route path="/banner-list" element={<BannerList />} />
        <Route path="/banner-add" element={<BannerAdd />} />
        <Route path="/amenities" element={<Amenities />} />
        <Route path="/testimonials" element={<Testimonials />} />
        <Route path="/testimonial-list" element={<TestimonialList />} />
        <Route path="/gallery" element={<Gallery />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
