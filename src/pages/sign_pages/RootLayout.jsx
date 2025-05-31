import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SetupSidebar from '../../components/setup-sidebar';
import Breadcrumbs from '../../components/breadcrumb';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// ...existing imports...

export default function RootLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if the current path includes "tiers"
  const noTier = location.pathname.includes('/tiers');

  // Redirect from members to project-list
  React.useEffect(() => {
    if (location.pathname === "/members" || location.pathname === "/setup-member") {
      navigate("/project-list", { replace: true });
    }
  }, [location.pathname, navigate]);
  return (
    <main className="h-100 w-100">
      <Header noTier={noTier} /> {/* Pass noTier based on the current path */}
      
      <div className="main-content">
      
        <div>
          {location.pathname.startsWith("/setup-member") ? <SetupSidebar /> : <Sidebar />}
        </div>

        <div className="website-content flex-grow-1 ">
        <Breadcrumbs />
          
          <Outlet /> {/* Dynamic content rendering */}
          
          <footer className="footer">
            <Footer />
          </footer>
        </div>
      </div>
    </main>
  );
}
