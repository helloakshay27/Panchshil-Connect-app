import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./mor.css";
import { Link, Navigate } from "react-router-dom";
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
import SignIn from "./pages/sign_pages/signIn";
import RootLayout from "./pages/sign_pages/RootLayout";
import ProtectedRoute from "./pages/sign_pages/ProtectedRoute";
import AmenitiesList from "./pages/amenities-list";
import NewGallery from "./pages/new-gallery";
import GalleryList from "./pages/gallery-list";
import GalleryDetails from "./pages/gallery-details";
import EditGallery from "./pages/edit-gallery";
import EditAmenities from "./pages/edit-amenities";

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
      <Route path="/login" element={<SignIn />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootLayout />

            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/members" />} />


          <Route path="//members" element={<Members />} />
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
          <Route path="/amenities-list" element={<AmenitiesList />} />
          <Route path="/edit-amenities" element={<EditAmenities />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/testimonial-list" element={<TestimonialList />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery-details" element={<GalleryDetails />} />
          <Route path="/new-gallery" element={<NewGallery />} />
          <Route path="/gallery-list" element={<GalleryList />} />
          <Route path="/edit-gallery" element={<EditGallery />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
