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
import OrganizationCreate from "./pages/organization-create";
import SitevisitEdit from "./pages/sitevisit-edit";
import OrganizationList from "./pages/organization-list";
import CompanyCreate from "./pages/company-create";
import PressReleasesCreate from "./pages/press-releases-create";

import SupportServiceList from "./pages/support-service-list";

import PressReleasesList from "./pages/press-releases-list";
import ProjectConfiguraion from "./pages/project-configuraion";
import ProjectConfiguraionList from "./pages/project-configuraion-list";
import PressReleasesEdit from "./pages/press-releases-edit";
import CompanyList from "./pages/company-list";
import CompanyEdit from "./pages/company-edit";
import OrganizationUpdate from "./pages/organization-update";
import ProjectConfigEdit from "./pages/project-config-edit";
import EnquiryList from "./pages/Enquiry-list";
import PropertyType from "./pages/property-type";
import PropertyTypeList from "./pages/property-type-list";
import ProjectBuildingType from "./pages/project-building-type";
import ProjectBuildingTypeList from "./pages/project-building-type-list";
import ProjectBuildingTypeEdit from "./pages/project-building-type-edit";
import ConstructionStatus from "./pages/construction-status";
import ConstructionStatusList from "./pages/construction-status-list";
import ConstructionStatusEdit from "./pages/construction-status-edit";
import PropertyTypeEdit from "./pages/property-type-edit";
import SetupMember from "./pages/setup-member";
import CategoryTypes from "./pages/category-types";
import CategoryTypesList from "./pages/category-types-list";
import CategoryTypesEdit from "./pages/category-types-edit";
import TagAdd from "./pages/tag-add";
import SignInRustomjee from "./pages/sign_pages/signInRustomjee";
import { baseURL } from "./pages/baseurl/apiDomain";
import ForgotRustomjee from "./pages/sign_pages/ForgotRustomjee";
import ForgotOtpRustomjee from "./pages/sign_pages/ForgotOtpRustomjee";
import CreatePasswordRustomjee from "./pages/sign_pages/CreatePasswordRustomjee";
import LoginWithOtpRustomjee from "./pages/sign_pages/LoginWithOtpRustomjee";
import UserRole from "./pages/LockFunctionCreate";
import LockFunctionCreate from "./pages/LockFunctionCreate";
import LockFunctionList from "./pages/LockFunctionList";
import LockFunctionEdit from "./pages/LockFunctionEdit";
import LockRoleCreate from "./pages/lock-role-create";
import LockRoleList from "./pages/lock-role-list";
import UserCreate from "./pages/user-create";
import UserEdit from "./pages/user-edit";
import UserList from "./pages/user-list";
import UserDetails from "./pages/user-details";
import DepartmentCreate from "./pages/department-create";
import DepartmentList from "./pages/department-list";
import DepartmentEdit from "./pages/department-edit";
import SiteCreate from "./pages/site-create";
import SiteList from "./pages/site-list";
import SiteEdit from "./pages/site-edit";
import PasswordResetSuccess from "./pages/sign_pages/PasswordSuccess";
import ReferralEdit from "./pages/referral-edit";
import ReferralProgramCreate from "./pages/referral-program-create";
import ReferralProgramList from "./pages/referral-program-list";
import ReferralProgramEdit from "./pages/referral-program-edit";
import TdsTutorialCreate from "./pages/tds-tutorials-create";
import TdsTutorialList from "./pages/tds-tutorials-list";
import TdsTutorialEdit from "./pages/tds-tutorials-edit";
import PlusServicesList from "./pages/plus-service-list";
import PlusServiceCreate from "./pages/plus-service-create";
import PlusServiceEdit from "./pages/plus-service-edit";
import SMTPSettingsList from "./pages/smtp-settings-list";
import SMTPSettingsEdit from "./pages/smtp-settings-edit";
import { useEffect } from "react";
import UserGroupList from "./pages/user-groups-list";
import UserGroupCreate from "./pages/user-groups-create";
import UserGroupEdit from "./pages/user-groups-edit";
import FaqCreate from "./pages/faq-create";
import FaqList from "./pages/faq-list";
import FaqEdit from "./pages/faq-edit";
import FaqCategoryForm from "./pages/faq-category-form";
import FaqCategoryList from "./pages/faq-category-list";
import FaqSubCategory from "./pages/faq-subcategory";
import FaqSubCategoryList from "./pages/faq-subcategory-list";
import ReferralProcess from "./components/Referralcomponent/referral-page";
import ConstructionUpdates from "./pages/Construction-updates-create";
import ConstructionUpdatesCreate from "./pages/Construction-updates-create";
import ConstructionUpdatesEdit from "./pages/Construction-updates-edit";
import ConstructionUpdatesList from "./pages/Construction-updates-list";
import ServiceCategoryForm from "./pages/service-category";
import ServiceCategoryList from "./pages/service-category-list";
import ImageConfig from "./pages/image-config-list";
import EditImagesConfiguration from "./pages/image-config-edit";

// // import EditGallery from './EditGallery';
// if (baseURL === "https://dev-panchshil-super-app.lockated.com/") {
//   <Route path="/login" element={<SignInRustomjee />} />
// } else if (baseURL === "https://panchshil-super.lockated.com/") {
//   <Route path="/login" element={<SignIn />} />
// } else {
//   <Route path="/login" element={<SignIn />} />
// }

// const baseurl = window.location.origin;

// const baseURL = process.env.REACT_APP_BASE_URL; // or your const

if (baseURL === "https://api-connect.panchshil.com/" || baseURL === "https://panchshil-super.lockated.com/" || baseURL === "https://uatapi-connect.panchshil.com/") {
  console.log("Base URL is set to Panchshil Connect");
  document.body.classList.add("theme-connect");
} else if (baseURL === "https://dev-panchshil-super-app.lockated.com/") {
  document.body.classList.add("theme-dev");
}


let LoginComponent;
let ForgotPasswordComponent;
let ForgotOtpComponent;
let CreatePasswordComponent;
let LoginWithOtpComponent;

if (baseURL === "https://panchshil-super.lockated.com/" || baseURL === "https://api-connect.panchshil.com/" || baseURL === "https://uatapi-connect.panchshil.com/") {
  // if (baseURL === "https://api-connect.panchshil.com/") {
  // if (baseURL === "http://localhost:3000/") {
  LoginComponent = <SignIn />;
  ForgotPasswordComponent = <Forgot />;
  ForgotOtpComponent = <ForgotOtp />;
  CreatePasswordComponent = <CreatePassword />;
} else {
  LoginComponent = <SignInRustomjee />;
  ForgotPasswordComponent = <ForgotRustomjee />;
  ForgotOtpComponent = <ForgotOtpRustomjee />;
  CreatePasswordComponent = <CreatePasswordRustomjee />;
  LoginWithOtpComponent = <LoginWithOtpRustomjee />;
}

function App() {
  useEffect(() => {
    let faviconPath = "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Panchshil_logo.png"; // default

    if (baseURL.startsWith("https://api-connect.panchshil.com/")) {
      faviconPath = "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Panchshil_logo.png";
    } else if (baseURL.startsWith("https://dev-panchshil-super-app.lockated.com/")) {
      faviconPath = "https://panchshil-s3.s3.ap-south-1.amazonaws.com/attachfiles/documents/Rustomjee_icon.png";
    }

    const link = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = faviconPath;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = faviconPath;
      document.head.appendChild(newLink);
    }
  }, []);
  return (
    <BrowserRouter>
      <Toaster />
      <Routes>
        <Route path="/login" element={LoginComponent} />
        {/* <Route path="/login" element={<SignIn />} /> */}
        <Route path="/register" element={<Register />} />
        {/* <Route path="/forgot-password" element={<Forgot />} /> */}
        <Route path="/forgot-password" element={ForgotPasswordComponent} />
        {/* <Route path="/forgot-otp" element={<ForgotOtp />} /> */}
        <Route path="/forgot-otp" element={ForgotOtpComponent} />
        {/* <Route path="/reset-password" element={<CreatePassword />} /> */}
        <Route path="/reset-password" element={CreatePasswordComponent} />
        <Route path="/verify-otp" element={<LoginWithOtpRustomjee />} />

        <Route path="/referral-page" element={<ReferralProcess />} />



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
          <Route path="/setup-member" element={<SetupMember />} />
          <Route path="/project-create" element={<ProjectDetailsCreate />} />
          <Route path="/project-edit/:id" element={<ProjectDetailsEdit />} />
          <Route path="/project-details/:id" element={<ProjectDetails />} />
          <Route
            path="/setup-member/property-type"
            element={<PropertyType />}
          />
          <Route
            path="/setup-member/property-type-edit/:id"
            element={<PropertyTypeEdit />}
          />
          <Route
            path="/setup-member/property-type-list"
            element={<PropertyTypeList />}
          />
          <Route
            path="/setup-member/project-building-type"
            element={<ProjectBuildingType />}
          />
          <Route
            path="/setup-member/project-building-type-edit/:id"
            element={<ProjectBuildingTypeEdit />}
          />

          <Route
            path="/setup-member/project-building-type-list"
            element={<ProjectBuildingTypeList />}
          />
          <Route
            path="/setup-member/construction-status"
            element={<ConstructionStatus />}
          />
          <Route
            path="/setup-member/construction-status-edit/:id"
            element={<ConstructionStatusEdit />}
          />

          <Route
            path="/setup-member/construction-status-list"
            element={<ConstructionStatusList />}
          />

          <Route path="/project-list" element={<ProjectDetailsList />} />
          <Route path="/banner-list" element={<BannerList />} />
          <Route path="/banner-add" element={<BannerAdd />} />
          <Route path="/setup-member/amenities" element={<Amenities />} />
          <Route
            path="/setup-member/amenities-list"
            element={<AmenitiesList />}
          />
          <Route
            path="/setup-member/edit-amenities/:id"
            element={<EditAmenities />}
          />
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
          <Route path="/referral-edit/:id" element={<ReferralEdit />} />
          <Route path="/event-list" element={<Eventlist />} />
          <Route path="/event-details/:id" element={<EventDetails />} />
          <Route path="/event-details" element={<EventDetails />} />
          <Route path="/event-edit/:id" element={<EventEdit />} />
          <Route path="/specification" element={<Specification />} />
          <Route path="/organization-create" element={<OrganizationCreate />} />
          <Route path="/organization-list" element={<OrganizationList />} />
          <Route path="/enquiry-list" element={<EnquiryList />} />
          <Route
            path="/organization-update/:id"
            element={<OrganizationUpdate />}
          />
          <Route
            path="/specification-update/:id"
            element={<SpecificationUpdate />}
          />
          <Route path="/specification-list" element={<SpecificationList />} />
          <Route path="/sitevisit-create" element={<SitevisitCreate />} />
          <Route path="/sitevisit-list" element={<SitevisitList />} />
          <Route path="/sitevisit-edit/:id" element={<SitevisitEdit />} />
        
          <Route path="/site-create" element={<SiteCreate />} />
          <Route path="/site-list" element={<SiteList />} />
          <Route path="/site-edit/:id" element={<SiteEdit />} />
          <Route path="/password-success" element={<PasswordResetSuccess />} />
          <Route path="/referral-program-create" element={<ReferralProgramCreate />} />
          <Route path="/referral-program-list" element={<ReferralProgramList />} />
          <Route path="/referral-program-edit/:id" element={<ReferralProgramEdit />} />

          <Route
            path="/setup-member/visitslot-create"
            element={<SiteVisitSlotConfig />}
          />
          <Route
            path="/setup-member/visitslot-list"
            element={<SiteVisitSlotConfigList />}
          />
          <Route path="/company-create" element={<CompanyCreate />} />
          <Route path="/company-list" element={<CompanyList />} />
          <Route path="/company-edit/:id" element={<CompanyEdit />} />
          <Route
            path="/setup-member/category-types"
            element={<CategoryTypes />}
          />
          <Route
            path="/setup-member/category-types-list"
            element={<CategoryTypesList />}
          />
          <Route
            path="/setup-member/category-types-edit/:id"
            element={<CategoryTypesEdit />}
          />
          <Route path="/setup-member/tag-add" element={<TagAdd />} />

          <Route
            path="/pressreleases-create"
            element={<PressReleasesCreate />}
          />
          <Route
            path="/support-service-list"
            element={<SupportServiceList />}
          />
          <Route path="/pressreleases-list" element={<PressReleasesList />} />
          <Route
            path="/pressreleases-edit/:id"
            element={<PressReleasesEdit />}
          />
          <Route
            path="/setup-member/project-configuration"
            element={<ProjectConfiguraion />}
          />
          <Route
            path="/setup-member/project-config-edit/:id"
            element={<ProjectConfigEdit />}
          />
          <Route
            path="/setup-member/project-configuration-list"
            element={<ProjectConfiguraionList />}
          />

          <Route
            path="/setup-member/lock-function"
            element={<LockFunctionCreate />}
          />

          <Route
            path="/setup-member/lock-function-list"
            element={<LockFunctionList />}
          />

          <Route
            path="/setup-member/lock-function-edit/:id"
            element={<LockFunctionEdit />}
          />

          <Route
            path="/setup-member/lock-role-create"
            element={<LockRoleCreate />}
          />
          <Route
            path="/setup-member/lock-role-list"
            element={<LockRoleList />}
          />
          <Route
            path="/setup-member/user-create"
            element={<UserCreate />}
          />
          <Route
            path="/setup-member/user-edit/:id"
            element={<UserEdit />}
          />
          <Route
            path="/setup-member/user-list"
            element={<UserList />}
          />
          <Route
            path="/setup-member/user-details/:id"
            element={<UserDetails />}
          />

          <Route
            path="/setup-member/tds-tutorials-create"
            element={<TdsTutorialCreate />}
          />
          <Route
            path="/setup-member/tds-tutorials-list"
            element={<TdsTutorialList />}
          />
          <Route
            path="/setup-member/tds-tutorials-edit/:id"
            element={<TdsTutorialEdit />}
          />

          <Route
            path="/setup-member/plus-services-list"
            element={<PlusServicesList />}
          />
          <Route
            path="/setup-member/plus-services-create"
            element={<PlusServiceCreate />}
          />
          <Route
            path="/setup-member/plus-services-edit/:id"
            element={<PlusServiceEdit />}
          />

          <Route
            path="/setup-member/smtp-settings-list"
            element={<SMTPSettingsList />}
          />
          <Route
            path="/setup-member/smtp-settings-edit/:id"
            element={<SMTPSettingsEdit />}
          />

           <Route
            path="/setup-member/user-groups-list"
            element={<UserGroupList />}
          />
          <Route
            path="/setup-member/user-groups-create"
            element={<UserGroupCreate />}
          />
          <Route
            path="/setup-member/user-groups-edit/:id"
            element={<UserGroupEdit />}
          />

           <Route
            path="/faq-create"
            element={<FaqCreate />}
          />
           <Route
            path="/faq-list"
            element={<FaqList />}
          />
          <Route
            path="/faq-edit/:faqId"
            element={<FaqEdit />}
          />

          <Route path="/setup-member/faq-category/create" element={<FaqCategoryForm />} />
         <Route path="/setup-member/faq-category/:faqId/edit" element={<FaqCategoryForm />} />
          <Route path="/setup-member/faq-category-list" element={<FaqCategoryList />} />

          <Route path="/setup-member/faq-subcategory-list" element={<FaqSubCategoryList />} />
          <Route path="/setup-member/faq-subcategory/create" element={<FaqSubCategory />} />
          <Route path="/setup-member/faq-subcategory/:faqSubId/edit" element={<FaqSubCategory />} />

          <Route path="/setup-member/construction-updates-create" element={<ConstructionUpdatesCreate />} />
           <Route
            path="/setup-member/construction-updates-edit/:id"
            element={<ConstructionUpdatesEdit />}
          />
           <Route path="/setup-member/construction-updates-list" element={<ConstructionUpdatesList />} />

           <Route path="/setup-member/service-category/create" element={<ServiceCategoryForm />} />
          <Route path="/setup-member/service-category/:serviceId/edit" element={<ServiceCategoryForm />} />
          <Route path="/setup-member/service-category-list" element={<ServiceCategoryList />} />

            <Route path="/setup-member/department-create" element={<DepartmentCreate />} />
          <Route path="/setup-member/department-list" element={<DepartmentList />} />
          <Route path="/setup-member/department-edit/:id" element={<DepartmentEdit />} />

          <Route
            path="/setup-member/image-config-list"
            element={<ImageConfig />}
          />
           <Route
            path="/setup-member/image-config/:id"
            element={<EditImagesConfiguration />}
          />

        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
