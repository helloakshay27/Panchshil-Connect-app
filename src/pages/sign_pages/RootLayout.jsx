import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SetupSidebar from '../../components/setup-sidebar';
import Breadcrumbs from '../../components/breadcrumb';

export default function RootLayout() {
  const location = useLocation();

  // Determine if the current path includes "tiers"
  const noTier = location.pathname.includes('/tiers'); // Adjust this condition as needed

  return (
    <main className="h-100 w-100">
      <Header noTier={noTier} /> {/* Pass noTier based on the current path */}
      
      <div className="main-content">
      
        <div>
          {location.pathname.startsWith("/setup-member") ? <SetupSidebar /> : <Sidebar />}
        </div>

        <div className="website-content flex-grow-1 position-relative">
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
