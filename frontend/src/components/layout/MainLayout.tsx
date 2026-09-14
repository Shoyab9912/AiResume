import { Outlet } from "react-router-dom";
import Navbar from  "./Navbar"; 
import Footer from "./Footer";
import { ErrorBoundary } from "../Errorboundary";
import { DefaultFallback } from "../DefaultFallback";
import { LoadingState } from "../ui/Feedback";
import { Suspense } from "react";


const MainLayout = () => {
  return (
    <>
      <Navbar />

      <div className="pt-20 min-h-screen bg-[#080b14]">
        <ErrorBoundary fallback={DefaultFallback}>
          <Suspense fallback={<LoadingState message="Loading...."/>}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>

      <Footer />
    </>
  );
};

export default MainLayout;