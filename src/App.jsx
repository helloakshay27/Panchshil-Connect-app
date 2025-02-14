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
import BannerEdit from "./pages/banner-edit";
import TestimonialEdit from "./pages/testimonial-edit";
import Register from "./pages/sign_pages/register";
import Forgot from "./pages/sign_pages/Forgot";
import ForgotOtp from "./pages/sign_pages/ForgotOtp";
import CreatePassword from "./pages/sign_pages/CreatePassword";
import EventCreate from "./pages/event-create";
import Referrallist from "./pages/referral-list";
import Referralcreate from "./pages/referral-create";
import Eventlist from "./pages/event-list";
import EventDetails from "./pages/event-details";
import Specification from "./pages/specification";
import SpecificationList from "./pages/specification-list";
import SpecificationUpdate from "./pages/specification-update";
import EventEdit from "./pages/event-edit";
import SitevisitCreate from "./pages/sitevisit-create";
import SiteVisitSlotConfig from "./pages/siteVisit-SlotConfig";
import SiteVisitSlotConfigList from "./pages/siteVisit-SlotConfig-list";
import SitevisitList from "./pages/sitevisit-list";
import OrganizationCreate from "./pages/organization-create"
import SitevisitEdit from "./pages/sitevisit-edit";

// import EditGallery from './EditGallery';

function App() {
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={<SignIn />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<Forgot />} />
        <Route path="/forgot-otp" element={<ForgotOtp />} />
        <Route path="/reset-password" element={<CreatePassword />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <RootLayout />
            </ProtectedRoute>
            // <ProtectedRoute>
            // </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/members" />} />

          <Route path="/members" element={<Members />} />
          <Route path="/project-create" element={<ProjectDetailsCreate />} />
          <Route path="/project-edit/:id" element={<ProjectDetailsEdit />} />
          <Route path="/project-details/:id" element={<ProjectDetails />} />

          <Route path="/project-list" element={<ProjectDetailsList />} />
          <Route path="/banner-list" element={<BannerList />} />
          <Route path="/banner-add" element={<BannerAdd />} />
          <Route path="/amenities" element={<Amenities />} />
          <Route path="/amenities-list" element={<AmenitiesList />} />
          <Route path="/edit-amenities/:id" element={<EditAmenities />} />
          <Route path="/testimonials" element={<Testimonials />} />
          <Route path="/testimonial-list" element={<TestimonialList />} />
          <Route path="/testimonial-edit" element={<TestimonialEdit />} />
          <Route path="/gallery" element={<Gallery />} />
          <Route path="/gallery-details/:id" element={<GalleryDetails />} />
          <Route path="/new-gallery" element={<NewGallery />} />
          <Route path="/gallery-list" element={<GalleryList />} />
          <Route path="/edit-gallery/:id" element={<EditGallery />} />
          <Route path="/banner-edit/:id" element={<BannerEdit />} />
          <Route path="/event-create" element={<EventCreate />} />
          <Route path="/referral-create" element={<Referralcreate />} />
          <Route path="/referral-list" element={<Referrallist />} />
          <Route path="/event-list" element={<Eventlist />} />
          <Route path="/event-details/:id" element={<EventDetails />} />
          <Route path="/event-details" element={<EventDetails />} />
          <Route path="/event-edit/:id" element={<EventEdit />} />
          <Route path="/specification" element={<Specification />} />
          <Route path="/organization-create" element={<OrganizationCreate />} />
          <Route
            path="/specification-update/:id"
            element={<SpecificationUpdate />}
          />
          <Route path="/specification-list" element={<SpecificationList />} />
          <Route path="/sitevisit-create" element={<SitevisitCreate />} />
          <Route path="/sitevisit-list" element={<SitevisitList />} />
          <Route path="/sitevisit-edit/:id" element={<SitevisitEdit />} />
          <Route
            path="/siteVisit-SlotConfig"
            element={<SiteVisitSlotConfig />}
          />
          <Route
            path="/siteVisit-SlotConfig-list"
            element={<SiteVisitSlotConfigList />}
          />


        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
