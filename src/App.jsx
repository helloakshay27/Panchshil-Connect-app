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

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/" element={<Members />} />
        <Route
          path="/project-details-create"
          element={<ProjectDetailsCreate />}
        />
        <Route path="/project-details-edit" element={<ProjectDetailsEdit />} />

        <Route path="/project-details-list" element={<ProjectDetailsList />} />
        <Route path="/banner-list" element={<BannerList />} />
        <Route path="/banner-add" element={<BannerAdd />} />
        <Route path="/amenities" element={<Amenities />} />
        <Route path="/testimonials" element={<Testimonials />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
