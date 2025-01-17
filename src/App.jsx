import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./mor.css";
import { Link } from "react-router-dom";
import Members from "./pages/members";
import ProjectDetailsCreate from "./pages/project-details-create";
import BannerList from "./pages/banner-list";
import BannerAdd from "./pages/banner-add";
import ProjectDetailsList from "./pages/project-details-list";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Members />} />
        <Route path="/project-details-create" element={<ProjectDetailsCreate />} />
        <Route path="/project-details-list" element={<ProjectDetailsList/>} />
        <Route path="/banner-list" element={<BannerList/>} />
        <Route path="/banner-add" element={<BannerAdd/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
